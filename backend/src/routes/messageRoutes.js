import express from 'express';
import {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
  sendBroadcast,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:userId', getMessages);
router.post('/send', sendMessage);
router.put('/:messageId/read', markAsRead);
router.post('/broadcast', adminOnly, sendBroadcast);

export default router;