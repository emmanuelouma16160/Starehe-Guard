import mongoose from 'mongoose';

const lockdownSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  releasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  triggeredAt: {
    type: Date,
    default: null,
  },
  releasedAt: {
    type: Date,
    default: null,
  },
  reason: {
    type: String,
    default: '',
  },
  history: [{
    action: {
      type: String,
      enum: ['trigger', 'release', 'notification'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Ensure only one lockdown record exists
lockdownSchema.statics.ensureSingleRecord = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    return await this.create({
      status: 'inactive',
      history: []
    });
  }
  return await this.findOne();
};

const Lockdown = mongoose.model('Lockdown', lockdownSchema);
export default Lockdown;