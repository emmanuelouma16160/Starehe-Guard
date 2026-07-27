import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Lockdown from '../models/Lockdown.js';

const router = express.Router();

// Get current lockdown status
router.get('/status', protect, async (req, res) => {
  try {
    let lockdown = await Lockdown.findOne().sort({ createdAt: -1 });
    
    if (!lockdown) {
      lockdown = await Lockdown.create({
        status: 'inactive',
        history: []
      });
    }

    await lockdown.populate('triggeredBy', 'name email role');
    await lockdown.populate('releasedBy', 'name email role');
    await lockdown.populate('history.user', 'name email role');

    res.json({
      status: lockdown.status,
      triggeredBy: lockdown.triggeredBy,
      triggeredAt: lockdown.triggeredAt,
      reason: lockdown.reason,
      history: lockdown.history.slice(-10)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lockdown status', error: error.message });
  }
});

// Trigger lockdown (admin only)
router.post('/trigger', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Reason for lockdown is required' });
    }

    let lockdown = await Lockdown.findOne();

    if (!lockdown) {
      lockdown = new Lockdown({ history: [] });
    }

    if (lockdown.status === 'active') {
      return res.status(400).json({ message: 'Lockdown is already active' });
    }

    lockdown.status = 'active';
    lockdown.triggeredBy = req.user._id;
    lockdown.triggeredAt = new Date();
    lockdown.reason = reason;

    lockdown.history.push({
      action: 'trigger',
      user: req.user._id,
      reason: reason,
      timestamp: new Date()
    });

    await lockdown.save();
    await lockdown.populate('triggeredBy', 'name email role');

    res.json({
      message: 'Lockdown triggered successfully',
      lockdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Error triggering lockdown', error: error.message });
  }
});

// Release lockdown (admin only)
router.post('/release', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    let lockdown = await Lockdown.findOne();

    if (!lockdown || lockdown.status === 'inactive') {
      return res.status(400).json({ message: 'No active lockdown to release' });
    }

    lockdown.status = 'inactive';
    lockdown.releasedBy = req.user._id;
    lockdown.releasedAt = new Date();

    lockdown.history.push({
      action: 'release',
      user: req.user._id,
      timestamp: new Date()
    });

    await lockdown.save();
    await lockdown.populate('releasedBy', 'name email role');

    res.json({
      message: 'Lockdown released successfully',
      lockdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Error releasing lockdown', error: error.message });
  }
});

// Notify admin (guard only)
router.post('/notify', protect, authorize('guard'), async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let lockdown = await Lockdown.findOne();
    if (!lockdown) {
      lockdown = new Lockdown({ history: [] });
    }

    lockdown.history.push({
      action: 'notification',
      user: req.user._id,
      reason: message,
      timestamp: new Date()
    });

    await lockdown.save();
    await lockdown.populate('history.user', 'name email role');

    res.json({
      message: 'Notification sent to admin',
      notification: {
        from: req.user.name,
        message,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
});

// Get lockdown history
router.get('/history', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const lockdown = await Lockdown.findOne()
      .populate('history.user', 'name email role');

    if (!lockdown) {
      return res.json([]);
    }

    res.json(lockdown.history || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
});

export default router;