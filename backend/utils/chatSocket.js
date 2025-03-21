// socket.js
const socketIo = require('socket.io');
const ChatMessage = require('../Models/chatMessageModel');
const Notification = require('../Models/notificationModel');
const Question = require('../Models/questionModel');
const questionController = require('../Controllers/questionController');



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

        if (receiverId) {
          const notification = new Notification({
            userId: receiverId,
            type: 'newMessage',
            message: `${populatedMessage.senderId.username} sent you a message.`,
            relatedItemId: populatedMessage._id,
          });
          await notification.save();
        }

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

    socket.on('resourceShared', ({ resource, userId, groupId }) => {
      if(userId){
        io.to(userId).emit('resourceShared', { resource });
      } else if (groupId){
        io.to(groupId).emit('resourceShared', { resource });
      }
    });

    socket.on('pollExpired', (poll) => {
        io.to(poll.chatId).emit('pollExpired', poll);
    });
  });

  io.on('disconnect', () => {
      console.log('socket disconnected');
  });

}


function runScheduledTasks() {
    setInterval(() => {
        questionController.checkExpiredPolls();
    }, 60000); // Check every minute
}

module.exports = {setupSocket,runScheduledTasks};