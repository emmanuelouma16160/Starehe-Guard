import ScanLog from '../models/ScanLog.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';
import { sendSMS } from '../utils/sms.js';

export const processScan = async (req, res, next) => {
  try {
    const { qrCodeData, gate } = req.body;

    if (!qrCodeData || !gate) {
      return res.status(400).json({ message: 'QR code and gate are required' });
    }

    const code = qrCodeData.trim();
    const student = await Student.findOne({
      isActive: true,
      $or: [{ qrCodeData: code }, { admissionNumber: code.toUpperCase() }],
    }).populate('parents', 'name phone notificationPreferences');

    if (!student) {
      return res.status(404).json({ message: 'No matching student found for this code' });
    }

    const scanType = student.currentStatus === 'inside' ? 'exit' : 'entry';

    if (student.isOnWatchlist) {
      await ScanLog.create({
        personType: 'student',
        student: student._id,
        scanType,
        gate,
        scannedBy: req.user._id,
        status: 'flagged',
        flagReason: student.watchlistReason || 'Student is on the watchlist',
      });

      return res.status(403).json({
        message: `${student.fullName} is on the watchlist${student.watchlistReason ? `: ${student.watchlistReason}` : '.'}`,
        status: 'flagged',
      });
    }

    const scanLog = await ScanLog.create({
      personType: 'student',
      student: student._id,
      scanType,
      gate,
      scannedBy: req.user._id,
      status: 'approved',
    });

    student.currentStatus = scanType === 'entry' ? 'inside' : 'outside';
    student.lastScanTime = scanLog.timestamp;
    student.lastScanType = scanType;
    await student.save();

    await notifyParentsOfScan(student, scanType, gate, scanLog);

    res.status(201).json({
      scanType,
      person: {
        name: student.fullName,
        admissionNumber: student.admissionNumber,
        class: student.class,
        photo: student.photo,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentScans = async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const query = {};
    if (req.query.gate) query.gate = req.query.gate;

    const scans = await ScanLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('student', 'firstName lastName admissionNumber class photo');

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
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json({ total });
  } catch (error) {
    next(error);
  }
};

// Notify parents by SMS and in-app notification when their child is scanned in/out.
const notifyParentsOfScan = async (student, scanType, gate, scanLog) => {
  const parents = student.parents || [];
  const phones = parents.map((parent) => parent.phone).filter(Boolean);
  const actionWord = scanType === 'entry' ? 'arrived at' : 'left';

  if (phones.length > 0) {
    const time = scanLog.timestamp.toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Nairobi',
    });
    const message = `STASENTRY: ${student.fullName} ${actionWord} school via ${gate} at ${time}.`;
    sendSMS(phones, message).catch((error) => console.error('Scan SMS error:', error));
  }

  for (const parent of parents) {
    try {
      await Notification.create({
        user: parent._id,
        type: 'scan',
        title: `${student.fullName} - ${scanType === 'entry' ? 'Arrived' : 'Departed'}`,
        message: `${student.fullName} ${actionWord} school at ${gate}.`,
        data: { scanId: scanLog._id, scanType, gate },
        sentVia: { sms: !!parent.phone, email: false, push: true },
      });
    } catch (error) {
      console.error('Scan notification error:', error);
    }
  }
};
