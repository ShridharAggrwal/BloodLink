// Store connected users with their socket ids
const connectedUsers = new Map();

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins their personal room
    socket.on('join-room', (userData) => {
      const { id, type } = userData;
      const roomId = `${type}-${id}`;
      socket.join(roomId);
      connectedUsers.set(roomId, socket.id);
      console.log(`User joined room: ${roomId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // Remove from connected users
      for (const [roomId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(roomId);
          break;
        }
      }
      console.log('User disconnected:', socket.id);
    });
  });
};

// Send blood request alert to specific users
const sendBloodRequestAlert = (io, userRoomIds, requestData) => {
  userRoomIds.forEach((roomId) => {
    io.to(roomId).emit('blood-request:new', requestData);
  });
};

// Notify users that a request was accepted
const notifyRequestAccepted = (io, requestId, userRoomIds) => {
  userRoomIds.forEach((roomId) => {
    io.to(roomId).emit('blood-request:accepted', { requestId });
  });
};

module.exports = {
  setupSocketHandlers,
  sendBloodRequestAlert,
  notifyRequestAccepted,
  connectedUsers,
};

