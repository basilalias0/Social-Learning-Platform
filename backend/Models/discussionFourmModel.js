const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null }, // optional reference
}, { timestamps: true });

const DiscussionForum = mongoose.model('DiscussionForum', forumSchema);
module.exports = DiscussionForum;