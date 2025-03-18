const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for direct messages
  content: { type: String, required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup' }, // Optional for group chats
}, { timestamps: true });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = ChatMessage;