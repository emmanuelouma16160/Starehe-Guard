import ScanLog from '../models/ScanLog.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';

export const processScan = async (req, res, next) => {
  try {
    const { studentId, gate, status = 'inside' } = req.body;

    if (!studentId || !gate) {
      return res.status(400).json({ message: 'studentId and gate are required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const scanLog = await ScanLog.create({
      student: student._id,
      gate,
      status,
      scannedBy: req.user?._id || req.user?.id,
      scannedAt: new Date(),
    });

    await Notification.create({
      user: student.parent || student.user,
      type: 'scan',
      title: 'Student Scan Recorded',
      message: `${student.fullName} was scanned at ${gate}`,
      relatedId: scanLog._id,
    });

    res.status(201).json({ message: 'Scan processed', scan: scanLog, student });
  } catch (error) {
    next(error);
  }
};

export const getRecentScans = async (req, res, next) => {
  try {
    const scans = await ScanLog.find().sort({ scannedAt: -1 }).limit(20).populate('student');
    res.json(scans);
  } catch (error) {
    next(error);
  }
};

export const getTodaySummary = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const total = await ScanLog.countDocuments({
      scannedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json({ total });
  } catch (error) {
    next(error);
  }
};

