// import express from 'express';
// import {
//   createStudent,
//   getStudents,
//   getStudentById,
//   updateStudent,
//   getStudentQRCode,
// } from '../controllers/studentController.js';
// import { protect } from '../middleware/auth.js';
// import { adminOnly, guardOnly } from '../middleware/role.js';

// const router = express.Router();

// router.use(protect);

// router.get('/', guardOnly, getStudents);
// router.post('/', adminOnly, createStudent);
// router.get('/:id', guardOnly, getStudentById);
// router.put('/:id', adminOnly, updateStudent);
// router.get('/:id/qrcode', adminOnly, getStudentQRCode);

// export default router;

import express from 'express';
import {
  createStudent,
  getStudents,
  getMyStudents,
  getStudentById,
  updateStudent,
  getStudentQRCode,
} from '../controllers/studentController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly, guardOnly, parentOnly, staffOnly } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.get('/mine', parentOnly, getMyStudents);
router.get('/', staffOnly, getStudents);
router.post('/', adminOnly, createStudent);
router.get('/:id', staffOnly, getStudentById);
router.put('/:id', adminOnly, updateStudent);
router.get('/:id/qrcode', adminOnly, getStudentQRCode);

export default router;