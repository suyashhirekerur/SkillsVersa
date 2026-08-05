import User from '../models/User.js';

/**
 * Socket.io event handler
 * Manages real-time messaging, typing indicators, online status, and notifications
 * @param {Object} io - Socket.io server instance
 */
const socketHandler = (io) => {
  // Map userId → socketId for targeted messaging
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    /**
     * User joins with their userId after authentication
     */
    socket.on('join', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      // Update online status in DB
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error('Error updating online status:', err.message);
      }

      // Broadcast to all connected clients
      io.emit('userOnline', userId);

      // Send current online users list to the newly connected user
      socket.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    /**
     * Real-time message sending
     */
    socket.on('sendMessage', ({ conversationId, recipientId, message }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receiveMessage', {
          conversationId,
          message,
        });
      }
    });

    /**
     * Typing indicator - start
     */
    socket.on('typing', ({ conversationId, recipientId }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('userTyping', {
          conversationId,
          userId: socket.userId,
        });
      }
    });

    /**
     * Typing indicator - stop
     */
    socket.on('stopTyping', ({ conversationId, recipientId }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('userStopTyping', {
          conversationId,
          userId: socket.userId,
        });
      }
    });

    /**
     * Send notification to a specific user
     */
    socket.on('sendNotification', ({ recipientId, notification }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('notification', notification);
      }
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);

        try {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
        } catch (err) {
          console.error('Error updating offline status:', err.message);
        }

        io.emit('userOffline', socket.userId);
      }
      console.log(`⚡ Socket disconnected: ${socket.id}`);
    });
  });

  /**
   * Helper: Emit event to a specific user (callable from controllers)
   * Usage: req.app.get('io').emitToUser(userId, 'eventName', data)
   * @param {string} userId - Target user ID
   * @param {string} event - Event name to emit
   * @param {Object} data - Data payload
   */
  io.emitToUser = (userId, event, data) => {
    const socketId = onlineUsers.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  };

  return io;
};

export default socketHandler;
