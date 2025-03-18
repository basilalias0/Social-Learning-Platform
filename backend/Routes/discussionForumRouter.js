// discussionForumRoutes.js
const express = require('express');
const discussionForumRouter = express.Router();
const discussionForumController = require('../Controllers/discussionForumController');
const { protect, authorize } = require('../Middlewares/authMiddleware');

// Public Routes
discussionForumRouter.get('/', discussionForumController.getAllDiscussionForums);
discussionForumRouter.get('/:id', discussionForumController.getDiscussionForumById);
discussionForumRouter.get('/course/:courseId', discussionForumController.getForumsByCourseId);

// Protected Routes (Instructor/Admin)
discussionForumRouter.post('/', protect, authorize('instructor', 'admin'), discussionForumController.createDiscussionForum);
discussionForumRouter.put('/:id', protect, authorize('instructor', 'admin'), discussionForumController.updateDiscussionForum);
discussionForumRouter.delete('/:id', protect, authorize('instructor', 'admin'), discussionForumController.deleteDiscussionForum);

module.exports = discussionForumRouter;