const socketIo = require('socket.io');
const ChatMessage = require('../Models/chatMessageModel');

let io;

function setupSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinRoom', ({ roomId }) => {
      socket.join(roomId);
      console.log(`User joined room ${roomId}`);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, groupId, roomId }) => {
      try {
        const chatMessage = new ChatMessage({
          senderId,
          receiverId,
          content: message,
          groupId,
          received: receiverId ? true : false,
        });
        const savedMessage = await chatMessage.save();
        const populatedMessage = await ChatMessage.findById(savedMessage._id).populate('senderId receiverId groupId');

        io.to(roomId).emit('message', populatedMessage);
        console.log(`Message sent to room ${roomId}: ${message}`);
      } catch (error) {
        console.error('Error saving or sending message:', error);
      }
    });

    socket.on('messageReceived', async ({ messageId }) => {
      try {
        await ChatMessage.findByIdAndUpdate(messageId, { received: true });
        io.emit('messageReceivedUpdate', { messageId });
      } catch (error) {
        console.error('Error marking message as received:', error);
      }
    });

    socket.on('messageRead', async ({ messageId }) => {
      try {
        await ChatMessage.findByIdAndUpdate(messageId, { read: true });
        io.emit('messageReadUpdate', { messageId });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    socket.on('leaveRoom', ({ roomId }) => {
      socket.leave(roomId);
      console.log(`User left room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocket;