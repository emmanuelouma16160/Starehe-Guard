const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user to their role room
    socket.on('join-role', (role) => {
      socket.join(`role-${role}`);
    });

    // Join user to their specific room
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

// Emit functions
const emitLockdownStatus = (status, data) => {
  if (io) {
    io.emit('lockdown-status', { status, ...data });
  }
};

const emitVisitorUpdate = (visitor) => {
  if (io) {
    io.emit('visitor-update', visitor);
  }
};

const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user-${userId}`).emit('notification', notification);
  }
};

const emitRoleNotification = (role, notification) => {
  if (io) {
    io.to(`role-${role}`).emit('notification', notification);
  }
};

module.exports = {
  initializeSocket,
  emitLockdownStatus,
  emitVisitorUpdate,
  emitNotification,
  emitRoleNotification
};