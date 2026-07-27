import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  stream: {
    type: String,
    default: '',
  },
  yearOfAdmission: {
    type: Number,
    required: true,
  },
  photo: {
    type: String,
    default: '',
  },
  qrCodeData: {
    type: String,
    unique: true,
    sparse: true,
  },
  currentStatus: {
    type: String,
    enum: ['inside', 'outside', 'unknown'],
    default: 'outside',
  },
  lastScanTime: {
    type: Date,
    default: null,
  },
  lastScanType: {
    type: String,
    enum: ['entry', 'exit'],
    default: null,
  },
  parentDetails: {
    father: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      nationalId: { type: String, default: '' },
    },
    mother: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      nationalId: { type: String, default: '' },
    },
    guardian: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      nationalId: { type: String, default: '' },
    },
    emergency: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
  },
  parents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  medicalInfo: {
    bloodGroup: { type: String, default: '' },
    allergies: { type: String, default: '' },
    conditions: { type: String, default: '' },
    medications: { type: String, default: '' },
    emergencyNotes: { type: String, default: '' },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isOnWatchlist: {
    type: Boolean,
    default: false,
  },
  watchlistReason: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const Student = mongoose.model('Student', studentSchema);
export default Student;