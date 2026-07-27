import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  idNumber: {
    type: String,
    trim: true,
  },
  visitorType: {
    type: String,
    enum: ['parent', 'old_starehian', 'other'],
    default: 'other',
  },
  purpose: {
    type: String,
    required: true,
  },
  hostName: {
    type: String,
    required: true,
  },
  hostDepartment: {
    type: String,
    default: '',
  },
  expectedDuration: {
    type: Number,
    default: 60,
  },
  vehicleNumber: {
    type: String,
    trim: true,
    default: '',
  },
  arrivalTime: {
    type: Date,
    default: Date.now,
  },
  signOutTime: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['inside', 'outside', 'pending'],
    default: 'inside',
  },
  badgeNumber: {
    type: String,
    unique: true,
  },
  signedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  signedOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  photo: {
    type: String,
    default: '',
  },
  temperature: {
    type: Number,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
  wasBlacklisted: {
    type: Boolean,
    default: false,
  },
  blacklistCheck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blacklist',
  }
}, {
  timestamps: true,
});

// Indexes
visitorSchema.index({ phone: 1 });
visitorSchema.index({ badgeNumber: 1 });
visitorSchema.index({ status: 1 });
visitorSchema.index({ arrivalTime: -1 });
visitorSchema.index({ visitorType: 1 });

// Generate badge number before saving
visitorSchema.pre('save', function(next) {
  if (!this.badgeNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.badgeNumber = `V${timestamp}${random}`;
  }
  next();
});

const Visitor = mongoose.model('Visitor', visitorSchema);
export default Visitor;