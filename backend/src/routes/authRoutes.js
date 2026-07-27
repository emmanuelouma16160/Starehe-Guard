import express from 'express';
import {
  registerUser,
  createUserByAdmin,
  loginUser,
  getMe,
  updateProfile,
  getAllUsers,
  getPendingUsers,
  approveUser,
  deactivateUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly, superAdminOnly } from '../middleware/role.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/admin/create', protect, adminOnly, createUserByAdmin);
router.post('/login', loginUser);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/pending', protect, adminOnly, getPendingUsers);
router.put('/users/:userId/approve', protect, adminOnly, approveUser);
router.put('/users/:userId/deactivate', protect, superAdminOnly, deactivateUser);

export default router;