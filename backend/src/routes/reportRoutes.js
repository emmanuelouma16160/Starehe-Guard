import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Report from '../models/Report.js';

const router = express.Router();

// Get reports (guards see their own, admins see all)
router.get('/', protect, async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      query.reportedBy = req.user._id;
    }

    const reports = await Report.find(query)
      .populate('reportedBy', 'name email role')
      .populate('reviewedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
});

// Get all reports (admin only)
router.get('/all', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'name email role')
      .populate('reviewedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
});

// Create report
router.post('/', protect, authorize('guard', 'admin', 'super_admin'), async (req, res) => {
  try {
    const report = await Report.create({
      ...req.body,
      reportedBy: req.user._id,
      status: 'pending'
    });

    await report.populate('reportedBy', 'name email role');
    
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error creating report', error: error.message });
  }
});

// Update report status (admin only)
router.put('/:id/status', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    
    if (status === 'reviewed') {
      report.reviewedBy = req.user._id;
    } else if (status === 'resolved' || status === 'rejected') {
      report.resolvedBy = req.user._id;
      if (resolutionNotes) report.resolutionNotes = resolutionNotes;
    }

    await report.save();
    await report.populate(['reportedBy', 'reviewedBy', 'resolvedBy']);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error updating report', error: error.message });
  }
});

// Get report stats
router.get('/stats', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const stats = await Report.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const byCategory = await Report.aggregate([
      { $group: {
        _id: '$category',
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      byStatus: stats,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

export default router;