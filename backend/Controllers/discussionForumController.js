const DiscussionForum = require('../Models/discussionForumModel');
const asyncHandler = require('express-async-handler');
const Feed = require('../Models/feedModel');

const discussionForumController = {
  createDiscussionForum: asyncHandler(async (req, res) => {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const forum = new DiscussionForum({
      title,
      userId: req.user._id,
    });

    const createdForum = await forum.save();
    res.status(201).json(createdForum);
  }),

  getAllDiscussionForums: asyncHandler(async (req, res) => {
    const forums = await DiscussionForum.find().populate('userId');
    res.json(forums);
  }),

  getDiscussionForumById: asyncHandler(async (req, res) => {
    const forum = await DiscussionForum.findById(req.params.id).populate('userId');
    if (forum) {
      res.json(forum);
    } else {
      res.status(404).json({ message: 'Forum not found' });
    }
  }),

  updateDiscussionForum: asyncHandler(async (req, res) => {
    const forum = await DiscussionForum.findById(req.params.id);

    if (forum) {
      if (forum.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this forum' });
      }

      forum.title = req.body.title || forum.title;

      const updatedForum = await forum.save();
      res.json(updatedForum);
    } else {
      res.status(404).json({ message: 'Forum not found' });
    }
  }),

  deleteDiscussionForum: asyncHandler(async (req, res) => {
    const forum = await DiscussionForum.findById(req.params.id);

    if (forum) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You are not authorized to delete this forum' });
      }
      await forum.remove();
      res.json({ message: 'Forum removed' });
    } else {
      res.status(404).json({ message: 'Forum not found' });
    }
  }),
};

module.exports = discussionForumController;