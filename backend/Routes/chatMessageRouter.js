// Routes/chatRoutes.js
const express = require('express');
const chatRouter = express.Router();
const { protect } = require('../Middlewares/authMiddleware');
const chatController = require('../Controllers/chatMessageController');

// Get chat messages between two users
chatRouter.get('/users/:userId1/:userId2', protect, chatController.getChatMessagesBetweenUsers);

// Get chat messages in a group
chatRouter.get('/group/:groupId', protect, chatController.getChatMessagesInGroup);

// Create a new chat message
chatRouter.post('/', protect, chatController.createChatMessage);

module.exports = chatRouter;