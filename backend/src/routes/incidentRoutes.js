import express from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  triggerLockdown,
  getOpenIncidentsCount,
} from '../controllers/incidentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly, guardOnly, superAdminOnly } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.get('/count/open', guardOnly, getOpenIncidentsCount);
router.post('/lockdown', superAdminOnly, triggerLockdown);
router.get('/all', adminOnly, getIncidents);
router.get('/', protect, getIncidents);
router.post('/', guardOnly, createIncident);
router.get('/:id', guardOnly, getIncidentById);
router.put('/:id/status', adminOnly, updateIncidentStatus);

export default router;