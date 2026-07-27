import mongoose from 'mongoose';

const scanLogSchema = new mongoose.Schema({
  personType: {
    type: String,
    enum: ['student', 'staff', 'visitor'],
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
  },
  scanType: {
    type: String,
    enum: ['entry', 'exit'],
    required: true,
  },
  gate: {
    type: String,
    required: true,
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  status: {
    type: String,
    enum: ['approved', 'flagged', 'blocked', 'manual_override'],
    default: 'approved',
  },
  flagReason: {
    type: String,
    default: '',
  },
  scanPhoto: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  isAuthorizedPickup: {
    type: Boolean,
    default: false,
  },
  pickupPersonName: {
    type: String,
    default: '',
  },
  smsSent: {
    type: Boolean,
    default: false,
  },
  smsError: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

scanLogSchema.index({ timestamp: -1 });
scanLogSchema.index({ student: 1, timestamp: -1 });

const ScanLog = mongoose.model('ScanLog', scanLogSchema);
export default ScanLog;