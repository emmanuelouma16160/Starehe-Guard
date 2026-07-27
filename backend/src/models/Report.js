import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['security', 'maintenance', 'incident', 'visitor', 'student', 'staff', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'normal'],
    default: 'normal',
  },
  shift: {
    type: String,
    enum: ['day', 'night'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'rejected'],
    default: 'pending',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  resolutionNotes: {
    type: String,
    default: '',
  },
  attachments: [{
    type: String,
  }],
  location: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
reportSchema.index({ status: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ shift: 1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;