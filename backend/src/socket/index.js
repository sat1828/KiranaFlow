const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../config/logger');

let io = null;

function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { role, storeId, driverId } = socket.user;
    logger.info(`Socket connected: ${socket.id} (${role})`);

    if (role === 'owner' && storeId) {
      socket.join(`store:${storeId}`);
      logger.debug(`Owner ${storeId} joined room store:${storeId}`);
    }

    if (role === 'driver' && driverId) {
      socket.join(`driver:${driverId}`);
      logger.debug(`Driver ${driverId} joined room driver:${driverId}`);
    }

    socket.on('subscribe:order', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('unsubscribe:order', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on('driver:location', (data) => {
      if (role !== 'driver') return;
      const { driverId: dId } = socket.user;
      io.to(`store:${data.storeId}`).emit('driver_location', {
        driverId: dId,
        lat: data.lat,
        lng: data.lng,
        heading: data.heading,
        speed: data.speed,
        timestamp: new Date().toISOString(),
      });

      if (data.activeOrderId) {
        io.to(`order:${data.activeOrderId}`).emit('driver_moved', {
          lat: data.lat,
          lng: data.lng,
          heading: data.heading,
          speed: data.speed,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  logger.info('Socket.io initialized');
  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

function emitToStore(storeId, event, data) {
  if (io) {
    io.to(`store:${storeId}`).emit(event, data);
  }
}

function emitToDriver(driverId, event, data) {
  if (io) {
    io.to(`driver:${driverId}`).emit(event, data);
  }
}

function emitToOrder(orderId, event, data) {
  if (io) {
    io.to(`order:${orderId}`).emit(event, data);
  }
}

function emitToAll(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

function closeSocket() {
  if (io) {
    io.close();
    io = null;
    logger.info('Socket.io closed');
  }
}

module.exports = {
  initializeSocket,
  getIO,
  closeSocket,
  emitToStore,
  emitToDriver,
  emitToOrder,
  emitToAll,
};
