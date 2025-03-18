// Controllers/chatController.js
const asyncHandler = require('express-async-handler');
const ChatMessage = require('../Models/chatMessageModel');

const chatController = {
  getChatMessagesBetweenUsers: asyncHandler(async (req, res) => {
    const { userId1, userId2 } = req.params;

    const messages = await ChatMessage.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('senderId receiverId');

    res.json(messages);
  }),

  getChatMessagesInGroup: asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const messages = await ChatMessage.find({ groupId })
      .sort({ createdAt: 1 })
      .populate('senderId groupId');

    res.json(messages);
  }),

  createChatMessage: asyncHandler(async (req, res) => {
    const { senderId, receiverId, message, groupId } = req.body;

    if (!senderId || (!receiverId && !groupId) || !message) {
      return res.status(400).json({ message: 'Please provide senderId, receiverId or groupId, and message' });
    }

    const chatMessage = new ChatMessage({
      senderId,
      receiverId,
      content: message,
      groupId,
      received: receiverId ? true : false,
    });

    const createdChatMessage = await chatMessage.save();
    res.status(201).json(createdChatMessage);
  }),
};

module.exports = chatController;