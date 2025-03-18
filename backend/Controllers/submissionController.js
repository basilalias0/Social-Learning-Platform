// submissionController.js
const Submission = require('../Models/submissionModel');
const Assignment = require('../Models/assignmentModel');
const asyncHandler = require('express-async-handler');

const submissionController = {
  // Create a new submission
  createSubmission: asyncHandler(async (req, res) => {
    const { assignmentId, fileUrl, submissionText } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: 'AssignmentId is required' });
    }

    // Check if the assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = new Submission({
      assignmentId,
      userId: req.user._id, // Set the user who submitted
      fileUrl,
      submissionText,
    });

    const createdSubmission = await submission.save();
    res.status(201).json(createdSubmission);
  }),

  // Get all submissions
  getAllSubmissions: asyncHandler(async (req, res) => {
    const submissions = await Submission.find().populate('assignmentId userId');
    res.json(submissions);
  }),

  // Get submission by ID
  getSubmissionById: asyncHandler(async (req, res) => {
    const submission = await Submission.findById(req.params.id).populate('assignmentId userId');
    if (submission) {
      res.json(submission);
    } else {
      res.status(404).json({ message: 'Submission not found' });
    }
  }),

  // Update submission (only creator or admin)
  updateSubmission: asyncHandler(async (req, res) => {
    const submission = await Submission.findById(req.params.id);

    if (submission) {
      if (req.user.role !== 'admin' && submission.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this submission' });
      }

      submission.fileUrl = req.body.fileUrl || submission.fileUrl;
      submission.submissionText = req.body.submissionText || submission.submissionText;
      submission.grade = req.body.grade || submission.grade;
      submission.feedback = req.body.feedback || submission.feedback;

      const updatedSubmission = await submission.save();
      res.json(updatedSubmission);
    } else {
      res.status(404).json({ message: 'Submission not found' });
    }
  }),

  // Delete submission (only creator or admin)
  deleteSubmission: asyncHandler(async (req, res) => {
    const submission = await Submission.findById(req.params.id);

    if (submission) {
      if (req.user.role !== 'admin' && submission.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this submission' });
      }

      await submission.remove();
      res.json({ message: 'Submission removed' });
    } else {
      res.status(404).json({ message: 'Submission not found' });
    }
  }),

  // Get submissions by assignment ID
  getSubmissionsByAssignmentId: asyncHandler(async (req, res) => {
    const submissions = await Submission.find({ assignmentId: req.params.assignmentId }).populate('assignmentId userId');
    res.json(submissions);
  }),

  // Get submissions by user ID
  getSubmissionsByUserId: asyncHandler(async (req, res) => {
    const submissions = await Submission.find({ userId: req.params.userId }).populate('assignmentId userId');
    res.json(submissions);
  }),
};

module.exports = submissionController;