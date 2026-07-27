import express from 'express';
import {
  processScan,
  getRecentScans,
  getTodaySummary,
} from '../controllers/scanController.js';
import { protect } from '../middleware/auth.js';
import { guardOnly, adminOnly } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.post('/process', guardOnly, processScan);
router.get('/recent', guardOnly, getRecentScans);
router.get('/summary/today', adminOnly, getTodaySummary);

export default router;