const express = require('express');
const discussionForumRouter = express.Router();
const discussionForumController = require('../Controllers/discussionForumController');
const { protect, authorize } = require('../Middlewares/authMiddleware');

// Public Routes
discussionForumRouter.get('/', discussionForumController.getAllDiscussionForums);
discussionForumRouter.get('/:id', discussionForumController.getDiscussionForumById);

// Protected Routes (Creator and Admin)
discussionForumRouter.post('/', protect, discussionForumController.createDiscussionForum);
discussionForumRouter.put('/:id', protect, discussionForumController.updateDiscussionForum);
discussionForumRouter.delete('/:id', protect, authorize('admin'), discussionForumController.deleteDiscussionForum);

module.exports = discussionForumRouter;