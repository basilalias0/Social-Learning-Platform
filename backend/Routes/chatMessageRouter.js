// chatMessageRoutes.js
const express = require('express');
const chatMessageRouter = express.Router();
const chatMessageController = require('../Controllers/chatMessageController');
const { protect } = require('../Middlewares/authMiddleware');

// Protected Routes (All chat routes are protected)
chatMessageRouter.post('/', protect, chatMessageController.createChatMessage);
chatMessageRouter.get('/users/:userId1/:userId2', protect, chatMessageController.getChatMessagesBetweenUsers);
chatMessageRouter.get('/group/:groupId', protect, chatMessageController.getChatMessagesInGroup);
chatMessageRouter.get('/user/:userId', protect, chatMessageController.getAllChatMessagesFromUser);

module.exports = chatMessageRouter;