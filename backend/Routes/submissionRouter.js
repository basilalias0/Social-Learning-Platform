// submissionRoutes.js
const express = require('express');
const submissionRouter = express.Router();
const submissionController = require('../Controllers/submissionController');
const { protect } = require('../Middlewares/authMiddleware');

// Public Routes
submissionRouter.get('/', submissionController.getAllSubmissions);
submissionRouter.get('/:id', submissionController.getSubmissionById);
submissionRouter.get('/assignment/:assignmentId', submissionController.getSubmissionsByAssignmentId);
submissionRouter.get('/user/:userId', submissionController.getSubmissionsByUserId);

// Protected Routes
submissionRouter.post('/', protect, submissionController.createSubmission);
submissionRouter.put('/:id', protect, submissionController.updateSubmission);
submissionRouter.delete('/:id', protect, submissionController.deleteSubmission);

module.exports = submissionRouter;