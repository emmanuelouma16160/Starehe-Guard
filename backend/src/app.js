// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import compression from 'compression';
// import dotenv from 'dotenv';
// import connectDB from './config/database.js';

// // Route imports
// import authRoutes from './routes/authRoutes.js';
// import studentRoutes from './routes/studentRoutes.js';
// import messageRoutes from './routes/messageRoutes.js';
// import scanRoutes from './routes/scanRoutes.js';
// import incidentRoutes from './routes/incidentRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';

// // Error handling middleware
// import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// // Load environment variables
// dotenv.config();

// // Connect to MongoDB
// await connectDB();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ── Security Middleware ──────────────────────────────────────────
// app.use(helmet());
// app.use(compression());
// app.use(cors({
//   origin: process.env.APP_URL || 'http://localhost:3000',
//   credentials: true,
// }));

// // ── Logging & Parsing ────────────────────────────────────────────
// app.use(morgan('dev'));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // ── Static Files ─────────────────────────────────────────────────
// app.use('/uploads', express.static('uploads'));

// // ── Health Check ─────────────────────────────────────────────────
// app.get('/api/health', (req, res) => {
//   res.json({
//     status: 'ok',
//     message: 'StaSentry Pro API is running',
//     version: '2.0.0',
//     timestamp: new Date().toISOString(),
//   });
// });

// // ── Routes ──────────────────────────────────────────────────────
// app.use('/api/auth', authRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/scans', scanRoutes);
// app.use('/api/incidents', incidentRoutes);
// app.use('/api/notifications', notificationRoutes);

// // ── Error Handling ──────────────────────────────────────────────
// app.use(notFound);
// app.use(errorHandler);

// // ── Start Server ─────────────────────────────────────────────────
// app.listen(PORT, () => {
//   console.log(`🚀 StaSentry Pro Server running on http://localhost:${PORT}`);
//   console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
// });

// export default app;

// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import compression from 'compression';
// import dotenv from 'dotenv';
// import connectDB from './config/database.js';

// import authRoutes from './routes/authRoutes.js';
// import studentRoutes from './routes/studentRoutes.js';
// import messageRoutes from './routes/messageRoutes.js';
// import scanRoutes from './routes/scanRoutes.js';
// import incidentRoutes from './routes/incidentRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';

// import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// dotenv.config();

// await connectDB();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(helmet());
// app.use(compression());
// app.use(cors({
//   origin: process.env.APP_URL || 'http://localhost:3000',
//   credentials: true,
// }));

// app.use(morgan('dev'));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// app.use('/uploads', express.static('uploads'));

// app.get('/api/health', (req, res) => {
//   res.json({
//     status: 'ok',
//     message: 'StaSentry Pro API is running',
//     version: '2.0.0',
//     timestamp: new Date().toISOString(),
//   });
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/scans', scanRoutes);
// app.use('/api/incidents', incidentRoutes);
// app.use('/api/notifications', notificationRoutes);

// app.use(notFound);
// app.use(errorHandler);

// app.listen(PORT, () => {
//   console.log(`🚀 StaSentry Pro Server running on http://localhost:${PORT}`);
//   console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
// });

// export default app;


import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// NEW ROUTE IMPORTS
import visitorRoutes from './routes/visitorRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import lockdownRoutes from './routes/lockdownRoutes.js';
import blacklistRoutes from './routes/blacklistRoutes.js';

// Error handling middleware
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Logging & Parsing ────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files ─────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'StaSentry Pro API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: {
      auth: true,
      students: true,
      visitors: true,
      reports: true,
      lockdown: true,
      blacklist: true,
      incidents: true,
      messages: true,
      scans: true,
      notifications: true,
    }
  });
});

// ── Routes ──────────────────────────────────────────────────────
// Existing routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/notifications', notificationRoutes);

// NEW ROUTES
app.use('/api/visitors', visitorRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/lockdown', lockdownRoutes);
app.use('/api/blacklist', blacklistRoutes);

// ── Error Handling ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 StaSentry Pro Server running on http://localhost:${PORT}`);
  console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📋 Features: Visitors, Reports, Lockdown, Blacklist, Incidents`);
});

export default app;