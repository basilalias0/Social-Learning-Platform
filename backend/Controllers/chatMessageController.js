// chatMessageController.js
const ChatMessage = require('../Models/chatMessageModel');
const asyncHandler = require('express-async-handler');

const chatMessageController = {
  // Create a new chat message
  createChatMessage: asyncHandler(async (req, res) => {
    const { senderId, receiverId, message, groupId } = req.body;

    if (!senderId || (!receiverId && !groupId) || !message) {
      return res.status(400).json({ message: 'Please provide senderId, receiverId or groupId, and message' });
    }

    const chatMessage = new ChatMessage({
      senderId,
      receiverId,
      message,
      groupId,
    });

    const createdChatMessage = await chatMessage.save();
    res.status(201).json(createdChatMessage);
  }),

  // Get chat messages between two users
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

  // Get chat messages in a group
  getChatMessagesInGroup: asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const messages = await ChatMessage.find({ groupId })
      .sort({ createdAt: 1 })
      .populate('senderId groupId');

    res.json(messages);
  }),

  //get all chat messages from a user.
  getAllChatMessagesFromUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const messages = await ChatMessage.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ createdAt: 1 }).populate('senderId receiverId groupId');

    res.json(messages);
  }),
};

module.exports = chatMessageController;