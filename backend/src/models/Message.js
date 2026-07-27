// import mongoose from 'mongoose';

// const messageSchema = new mongoose.Schema({
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   receiver: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   content: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   type: {
//     type: String,
//     enum: ['direct', 'broadcast', 'alert'],
//     default: 'direct',
//   },
//   isRead: {
//     type: Boolean,
//     default: false,
//   },
//   readAt: {
//     type: Date,
//     default: null,
//   },
//   attachments: [{
//     type: String,
//     default: [],
//   }],
//   priority: {
//     type: String,
//     enum: ['low', 'medium', 'high', 'urgent'],
//     default: 'medium',
//   },
//   replyTo: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Message',
//     default: null,
//   },
// }, {
//   timestamps: true,
// });

// // Index for faster queries
// messageSchema.index({ sender: 1, receiver: 1 });
// messageSchema.index({ receiver: 1, isRead: 1 });
// messageSchema.index({ createdAt: -1 });

// const Message = mongoose.model('Message', messageSchema);
// export default Message;

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['direct', 'broadcast', 'alert'],
    default: 'direct',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
  attachments: [{
    type: String,
    default: [],
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
}, {
  timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);
export default Message;