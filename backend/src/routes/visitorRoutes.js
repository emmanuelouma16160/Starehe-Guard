import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Visitor from '../models/Visitor.js';
import Blacklist from '../models/Blacklist.js';

const router = express.Router();

// Get all visitors with filters
router.get('/', protect, async (req, res) => {
  try {
    const { status, type, date, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.visitorType = type;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.arrivalTime = { $gte: start, $lte: end };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { badgeNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const visitors = await Visitor.find(query)
      .populate('signedInBy', 'name email')
      .populate('signedOutBy', 'name email')
      .sort({ arrivalTime: -1 });

    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visitors', error: error.message });
  }
});

// Check if visitor is blacklisted
router.post('/check-blacklist', protect, async (req, res) => {
  try {
    const { phone, idNumber } = req.body;
    
    const blacklisted = await Blacklist.findOne({
      $or: [
        { phone },
        { idNumber }
      ]
    });

    if (blacklisted) {
      // Log access attempt
      blacklisted.accessAttempts.push({
        timestamp: new Date(),
        gate: req.body.gate || 'Main Gate',
        attemptedBy: req.user._id,
        details: `Checked by ${req.user.name}`
      });
      await blacklisted.save();

      return res.json({
        blacklisted: true,
        reason: blacklisted.reason,
        name: blacklisted.name,
        idNumber: blacklisted.idNumber,
        phone: blacklisted.phone,
        notes: blacklisted.notes
      });
    }

    res.json({ blacklisted: false });
  } catch (error) {
    res.status(500).json({ message: 'Error checking blacklist', error: error.message });
  }
});

// Sign in visitor
router.post('/', protect, authorize('guard', 'admin', 'super_admin'), async (req, res) => {
  try {
    const visitorData = req.body;
    
    // Check blacklist
    const blacklisted = await Blacklist.findOne({
      $or: [
        { phone: visitorData.phone },
        { idNumber: visitorData.idNumber }
      ]
    });

    if (blacklisted) {
      return res.status(403).json({
        message: 'This person is blacklisted and not allowed access',
        blacklisted: true,
        details: {
          name: blacklisted.name,
          reason: blacklisted.reason
        }
      });
    }

    // Auto-generate badge number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    visitorData.badgeNumber = `V${timestamp}${random}`;
    visitorData.signedInBy = req.user._id;
    visitorData.arrivalTime = new Date();

    const visitor = await Visitor.create(visitorData);
    await visitor.populate('signedInBy', 'name email');
    
    res.status(201).json(visitor);
  } catch (error) {
    res.status(500).json({ message: 'Error signing in visitor', error: error.message });
  }
});

// Sign out visitor
router.put('/:id/signout', protect, authorize('guard', 'admin', 'super_admin'), async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    if (visitor.status === 'outside') {
      await visitor.populate('signedOutBy', 'name email');
      return res.json({ message: 'Visitor already signed out', visitor });
    }

    visitor.status = 'outside';
    visitor.signOutTime = new Date();
    visitor.signedOutBy = req.user._id;
    
    await visitor.save();
    await visitor.populate('signedOutBy', 'name email');

    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: 'Error signing out visitor', error: error.message });
  }
});

// Get visitor by badge number
router.get('/badge/:badgeNumber', protect, async (req, res) => {
  try {
    const visitor = await Visitor.findOne({ badgeNumber: req.params.badgeNumber })
      .populate('signedInBy', 'name email')
      .populate('signedOutBy', 'name email');
    
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visitor', error: error.message });
  }
});

// Get visitor stats
router.get('/stats', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total, active, todayVisitors, byType] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.countDocuments({ status: 'inside' }),
      Visitor.countDocuments({
        arrivalTime: { $gte: today, $lt: tomorrow }
      }),
      Visitor.aggregate([
        { $group: { _id: '$visitorType', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      total,
      active,
      todayVisitors,
      byType
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

export default router;