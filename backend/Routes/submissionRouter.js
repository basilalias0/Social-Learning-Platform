// submissionRoutes.js
const express = require('express');
const submissionRouter = express.Router();
const submissionController = require('../Controllers/submissionController');
const { protect } = require('../Middlewares/authMiddleware');
const upload = require('../Middlewares/imageUpload');
upload
submissionRouter.post('/', protect, upload('submissions').single('file'), submissionController.createSubmission);
submissionRouter.get('/', protect, submissionController.getAllSubmissions); // Admin only
submissionRouter.get('/:id', protect, submissionController.getSubmissionById);
submissionRouter.put('/:id', protect, upload('submissions').single('file'), submissionController.updateSubmission);
submissionRouter.delete('/:id', protect, submissionController.deleteSubmission);
submissionRouter.get('/assignment/:assignmentId', protect, submissionController.getSubmissionsByAssignmentId);
submissionRouter.get('/user/:userId', protect, submissionController.getSubmissionsByUserId);
submissionRouter.put('/grade', protect, submissionController.gradeSubmission); // Grading route

module.exports = submissionRouter;