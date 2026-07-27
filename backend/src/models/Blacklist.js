import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
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
    required: true,
    trim: true,
  },
  reason: {
    type: String,
    enum: ['security_threat', 'previous_incident', 'unauthorized_access', 'harassment', 'trespassing', 'other'],
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accessAttempts: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    gate: {
      type: String,
      default: 'Main Gate',
    },
    attemptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    details: {
      type: String,
      default: '',
    },
  }],
  expiresAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate entries
blacklistSchema.index({ phone: 1, idNumber: 1 }, { unique: true });
blacklistSchema.index({ phone: 1 });
blacklistSchema.index({ idNumber: 1 });

// Check if expired
blacklistSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

const Blacklist = mongoose.model('Blacklist', blacklistSchema);
export default Blacklist;