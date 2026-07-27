import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Blacklist from '../models/blacklist.js';

const router = express.Router();

// Get all blacklisted (admin only)
router.get('/', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const blacklist = await Blacklist.find()
      .populate('addedBy', 'name email')
      .populate('accessAttempts.attemptedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(blacklist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blacklist', error: error.message });
  }
});

// Check if person is blacklisted
router.post('/check', protect, async (req, res) => {
  try {
    const { phone, idNumber } = req.body;
    
    if (!phone && !idNumber) {
      return res.status(400).json({ message: 'Phone or ID number is required' });
    }

    const blacklisted = await Blacklist.findOne({
      $or: [
        { phone },
        { idNumber }
      ]
    });

    if (blacklisted) {
      blacklisted.accessAttempts.push({
        timestamp: new Date(),
        attemptedBy: req.user._id,
        details: `Checked by ${req.user.name}`
      });
      await blacklisted.save();

      return res.json({
        blacklisted: true,
        name: blacklisted.name,
        phone: blacklisted.phone,
        idNumber: blacklisted.idNumber,
        reason: blacklisted.reason,
        notes: blacklisted.notes
      });
    }

    res.json({ blacklisted: false });
  } catch (error) {
    res.status(500).json({ message: 'Error checking blacklist', error: error.message });
  }
});

// Add to blacklist (admin only)
router.post('/', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { phone, idNumber } = req.body;
    
    const existing = await Blacklist.findOne({
      $or: [
        { phone },
        { idNumber }
      ]
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'This person is already blacklisted',
        details: existing
      });
    }

    const blacklistEntry = await Blacklist.create({
      ...req.body,
      addedBy: req.user._id,
      accessAttempts: []
    });

    await blacklistEntry.populate('addedBy', 'name email');

    res.status(201).json(blacklistEntry);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to blacklist', error: error.message });
  }
});

// Remove from blacklist (admin only)
router.delete('/:id', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const entry = await Blacklist.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    await entry.deleteOne();
    res.json({ message: 'Removed from blacklist' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from blacklist', error: error.message });
  }
});

// Get blacklist stats
router.get('/stats', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const total = await Blacklist.countDocuments();
    const byReason = await Blacklist.aggregate([
      { $group: { _id: '$reason', count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      byReason
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

export default router;