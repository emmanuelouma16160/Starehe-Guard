// import Message from '../models/Message.js';
// import User from '../models/User.js';
// import Notification from '../models/Notification.js';
// import { sendSMS } from '../utils/sms.js';
// import { sendEmail } from '../utils/email.js';

// // ===== SEND MESSAGE =====
// export const sendMessage = async (req, res) => {
//   try {
//     const { receiverId, content, type = 'direct', priority = 'medium', attachments = [] } = req.body;
//     const senderId = req.user._id;

//     // Validate receiver exists
//     const receiver = await User.findById(receiverId);
//     if (!receiver) {
//       return res.status(404).json({ message: 'Receiver not found' });
//     }

//     // Create message
//     const message = await Message.create({
//       sender: senderId,
//       receiver: receiverId,
//       content,
//       type,
//       priority,
//       attachments,
//     });

//     // Populate sender and receiver details
//     await message.populate('sender', 'name email phone');
//     await message.populate('receiver', 'name email phone');

//     // ===== IMPROVEMENT: Send real-time notification =====
//     await notifyMessageReceiver(message, receiver);

//     res.status(201).json({
//       message: 'Message sent successfully',
//       data: message,
//     });
//   } catch (error) {
//     console.error('Send message error:', error);
//     res.status(500).json({ message: 'Failed to send message', error: error.message });
//   }
// };

// // ===== GET MESSAGES FOR USER =====
// export const getMessages = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1, limit = 30, unreadOnly = false } = req.query;

//     const query = {
//       $or: [
//         { sender: userId },
//         { receiver: userId },
//       ],
//     };

//     if (unreadOnly === 'true') {
//       query.isRead = false;
//       query.receiver = userId;
//     }

//     const skip = (page - 1) * limit;
//     const messages = await Message.find(query)
//       .populate('sender', 'name email phone role')
//       .populate('receiver', 'name email phone role')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Message.countDocuments(query);

//     // Mark messages as read if user is receiver
//     const unreadIds = messages
//       .filter(m => m.receiver._id.toString() === userId && !m.isRead)
//       .map(m => m._id);

//     if (unreadIds.length > 0) {
//       await Message.updateMany(
//         { _id: { $in: unreadIds } },
//         { $set: { isRead: true, readAt: new Date() } }
//       );
//     }

//     res.json({
//       messages,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit),
//       },
//       unreadCount: unreadIds.length,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
//   }
// };

// // ===== GET CONVERSATIONS =====
// export const getConversations = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // Get all users this user has chatted with
//     const conversations = await Message.aggregate([
//       {
//         $match: {
//           $or: [
//             { sender: userId },
//             { receiver: userId },
//           ],
//         },
//       },
//       {
//         $sort: { createdAt: -1 },
//       },
//       {
//         $group: {
//           _id: {
//             $cond: {
//               if: { $eq: ['$sender', userId] },
//               then: '$receiver',
//               else: '$sender',
//             },
//           },
//           lastMessage: { $first: '$$ROOT' },
//           unreadCount: {
//             $sum: {
//               $cond: [
//                 { 
//                   $and: [
//                     { $eq: ['$receiver', userId] },
//                     { $eq: ['$isRead', false] },
//                   ]
//                 },
//                 1,
//                 0,
//               ],
//             },
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: 'users',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'participant',
//         },
//       },
//       {
//         $unwind: '$participant',
//       },
//       {
//         $project: {
//           participant: {
//             _id: 1,
//             name: 1,
//             email: 1,
//             phone: 1,
//             role: 1,
//             photo: 1,
//           },
//           lastMessage: 1,
//           unreadCount: 1,
//         },
//       },
//       {
//         $sort: { 'lastMessage.createdAt': -1 },
//       },
//     ]);

//     res.json(conversations);
//   } catch (error) {
//     console.error('Get conversations error:', error);
//     res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
//   }
// };

// // ===== MARK MESSAGE AS READ =====
// export const markAsRead = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const userId = req.user._id;

//     const message = await Message.findById(messageId);
//     if (!message) {
//       return res.status(404).json({ message: 'Message not found' });
//     }

//     if (message.receiver.toString() !== userId.toString()) {
//       return res.status(403).json({ message: 'You can only mark messages you received as read' });
//     }

//     message.isRead = true;
//     message.readAt = new Date();
//     await message.save();

//     res.json({ message: 'Message marked as read' });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to mark message as read', error: error.message });
//   }
// };

// // ===== SEND BROADCAST =====
// export const sendBroadcast = async (req, res) => {
//   try {
//     const { content, roles, priority = 'medium' } = req.body;
//     const senderId = req.user._id;

//     // Find users to send to (based on roles)
//     const query = {};
//     if (roles && roles.length > 0) {
//       query.role = { $in: roles };
//     }
//     const receivers = await User.find(query);

//     if (receivers.length === 0) {
//       return res.status(400).json({ message: 'No receivers found' });
//     }

//     // Create messages for each receiver
//     const messages = [];
//     for (const receiver of receivers) {
//       const message = await Message.create({
//         sender: senderId,
//         receiver: receiver._id,
//         content,
//         type: 'broadcast',
//         priority,
//       });
//       messages.push(message);

//       // Send notification
//       await notifyMessageReceiver(message, receiver);
//     }

//     res.status(201).json({
//       message: `Broadcast sent to ${receivers.length} users`,
//       count: receivers.length,
//     });
//   } catch (error) {
//     console.error('Broadcast error:', error);
//     res.status(500).json({ message: 'Failed to send broadcast', error: error.message });
//   }
// };

// // ===== Helper: Notify Message Receiver =====
// const notifyMessageReceiver = async (message, receiver) => {
//   try {
//     const senderName = message.sender?.name || 'System';

//     // In-app notification
//     await Notification.create({
//       user: receiver._id,
//       title: `New message from ${senderName}`,
//       message: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
//       type: 'message',
//       data: {
//         messageId: message._id,
//         senderId: message.sender?._id,
//         priority: message.priority,
//       },
//       sentVia: {
//         sms: false,
//         email: false,
//         push: true,
//       },
//     });

//     // SMS for high priority messages
//     if (message.priority === 'high' || message.priority === 'urgent') {
//       if (receiver.phone && receiver.notificationPreferences?.sms !== false) {
//         await sendSMS(
//           [receiver.phone],
//           `URGENT from ${senderName}: ${message.content.substring(0, 150)}`
//         );
//       }
//     }

//     // Email for high priority messages
//     if (message.priority === 'urgent') {
//       if (receiver.email && receiver.notificationPreferences?.email !== false) {
//         await sendEmail({
//           to: receiver.email,
//           subject: `URGENT: New message from ${senderName}`,
//           html: `
//             <h2>New ${message.type} message</h2>
//             <p><strong>From:</strong> ${senderName}</p>
//             <p><strong>Priority:</strong> ${message.priority}</p>
//             <p>${message.content}</p>
//             <a href="${process.env.APP_URL}/dashboard/messages">View Message</a>
//           `,
//         });
//       }
//     }
//   } catch (error) {
//     console.error('Notification error:', error);
//   }
//
// 
//  };

import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendSMS } from '../utils/sms.js';
import { sendEmail } from '../utils/email.js';

// ===== SEND MESSAGE =====
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, type = 'direct', priority = 'medium', attachments = [] } = req.body;
    const senderId = req.user._id;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      type,
      priority,
      attachments,
    });

    await message.populate('sender', 'name email phone');
    await message.populate('receiver', 'name email phone');

    await notifyMessageReceiver(message, receiver);

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

// ===== GET MESSAGES =====
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 30, unreadOnly = false } = req.query;

    const query = {
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    };

    if (unreadOnly === 'true') {
      query.isRead = false;
      query.receiver = userId;
    }

    const skip = (page - 1) * limit;
    const messages = await Message.find(query)
      .populate('sender', 'name email phone role')
      .populate('receiver', 'name email phone role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    const unreadIds = messages
      .filter(m => m.receiver._id.toString() === userId && !m.isRead)
      .map(m => m._id);

    if (unreadIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadIds } },
        { $set: { isRead: true, readAt: new Date() } }
      );
    }

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount: unreadIds.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};

// ===== GET CONVERSATIONS =====
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', userId] },
              then: '$receiver',
              else: '$sender',
            },
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$isRead', false] },
                  ]
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'participant',
        },
      },
      {
        $unwind: '$participant',
      },
      {
        $project: {
          participant: {
            _id: 1,
            name: 1,
            email: 1,
            phone: 1,
            role: 1,
            photo: 1,
          },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
  }
};

// ===== MARK MESSAGE AS READ =====
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only mark messages you received as read' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark message as read', error: error.message });
  }
};

// ===== SEND BROADCAST =====
export const sendBroadcast = async (req, res) => {
  try {
    const { content, roles, priority = 'medium' } = req.body;
    const senderId = req.user._id;

    const query = {};
    if (roles && roles.length > 0) {
      query.role = { $in: roles };
    }
    const receivers = await User.find(query);

    if (receivers.length === 0) {
      return res.status(400).json({ message: 'No receivers found' });
    }

    for (const receiver of receivers) {
      const message = await Message.create({
        sender: senderId,
        receiver: receiver._id,
        content,
        type: 'broadcast',
        priority,
      });
      await notifyMessageReceiver(message, receiver);
    }

    res.status(201).json({
      message: `Broadcast sent to ${receivers.length} users`,
      count: receivers.length,
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ message: 'Failed to send broadcast', error: error.message });
  }
};

// ===== HELPER: Notify Message Receiver =====
const notifyMessageReceiver = async (message, receiver) => {
  try {
    const senderName = message.sender?.name || 'System';

    await Notification.create({
      user: receiver._id,
      title: `New message from ${senderName}`,
      message: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
      type: 'message',
      data: {
        messageId: message._id,
        senderId: message.sender?._id,
        priority: message.priority,
      },
      sentVia: {
        sms: false,
        email: false,
        push: true,
      },
    });

    if (message.priority === 'high' || message.priority === 'urgent') {
      if (receiver.phone && receiver.notificationPreferences?.sms !== false) {
        await sendSMS(
          [receiver.phone],
          `URGENT from ${senderName}: ${message.content.substring(0, 150)}`
        );
      }
    }

    if (message.priority === 'urgent') {
      if (receiver.email && receiver.notificationPreferences?.email !== false) {
        await sendEmail({
          to: receiver.email,
          subject: `URGENT: New message from ${senderName}`,
          html: `
            <h2>New ${message.type} message</h2>
            <p><strong>From:</strong> ${senderName}</p>
            <p><strong>Priority:</strong> ${message.priority}</p>
            <p>${message.content}</p>
            <a href="${process.env.APP_URL}/dashboard/messages">View Message</a>
          `,
        });
      }
    }
  } catch (error) {
    console.error('Notification error:', error);
  }
};