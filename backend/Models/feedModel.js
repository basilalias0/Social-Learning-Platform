const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feedItems: [{
    type: {
      type: String,
      enum: ['post', 'reply'],
      required: true,
    },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

const Feed = mongoose.model('Feed', feedSchema);
module.exports = Feed;