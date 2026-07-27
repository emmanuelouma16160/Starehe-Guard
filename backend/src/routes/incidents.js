const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const { protect, authorize } = require('../middleware/auth');

// Get incidents (guards see their own, admins see all)
router.get('/', protect, async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      query.reportedBy = req.user._id;
    }

    const incidents = await Incident.find(query)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incidents', error: error.message });
  }
});

// Get all incidents (admin only)
router.get('/all', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incidents', error: error.message });
  }
});

// Create incident
router.post('/', protect, authorize('guard', 'admin', 'super_admin'), async (req, res) => {
  try {
    const incident = await Incident.create({
      ...req.body,
      reportedBy: req.user._id,
      status: 'pending'
    });

    await incident.populate('reportedBy', 'name email role');
    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error creating incident', error: error.message });
  }
});

// Update incident status (admin only)
router.put('/:id/status', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    incident.status = status;
    
    if (status === 'investigating') {
      incident.assignedTo = req.user._id;
    } else if (status === 'resolved' || status === 'closed') {
      incident.resolvedBy = req.user._id;
      if (resolution) incident.resolution = resolution;
    }

    await incident.save();
    await incident.populate(['reportedBy', 'assignedTo', 'resolvedBy']);

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error updating incident', error: error.message });
  }
});

// Get incident stats
router.get('/stats', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const stats = await Incident.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const byType = await Incident.aggregate([
      { $group: {
        _id: '$type',
        count: { $sum: 1 }
      }}
    ]);

    const bySeverity = await Incident.aggregate([
      { $group: {
        _id: '$severity',
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      byStatus: stats,
      byType,
      bySeverity
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;