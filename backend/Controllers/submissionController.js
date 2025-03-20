// submissionController.js
const Submission = require('../Models/submissionModel');
const Assignment = require('../Models/assignmentModel');
const Course = require('../Models/courseModel');
const asyncHandler = require('express-async-handler');

const submissionController = {
  // Create a new submission
  createSubmission: asyncHandler(async (req, res) => {
    const { assignmentId, fileUrl, feedback } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: 'AssignmentId is required' });
    }

    try {
      const assignment = await Assignment.findById(assignmentId).populate('courseId');
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      const course = await Course.findById(assignment.courseId);
      if (!course.students.includes(req.user._id)) {
        return res.status(403).json({ message: 'You are not authorized to submit to this assignment' });
      }

      const submission = new Submission({
        assignmentId,
        studentId: req.user._id,
        fileUrl,
        feedback,
      });

      const createdSubmission = await submission.save();
      res.status(201).json(createdSubmission);
    } catch (error) {
      console.error('Error creating submission:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),

  // Get all submissions (Admin only)
  getAllSubmissions: asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to view all submissions' });
    }
    const submissions = await Submission.find().populate('assignmentId studentId');
    res.json(submissions);
  }),

  // Get submission by ID
  getSubmissionById: asyncHandler(async (req, res) => {
    try {
      const submission = await Submission.findById(req.params.id).populate('assignmentId studentId');
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      const assignment = await Assignment.findById(submission.assignmentId).populate('instructorId');
      if (req.user.role === 'admin' || submission.studentId._id.toString() === req.user._id.toString() || assignment.instructorId._id.toString() === req.user._id.toString()) {
        res.json(submission);
      } else {
        res.status(403).json({ message: 'You are not authorized to view this submission' });
      }
    } catch (error) {
      console.error('Error getting submission by ID:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),

  // Update submission (only student or admin)
  updateSubmission: asyncHandler(async (req, res) => {
    try {
      const submission = await Submission.findById(req.params.id);

      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      if (req.user.role !== 'admin' && submission.studentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this submission' });
      }

      submission.fileUrl = req.body.fileUrl || submission.fileUrl;
      submission.feedback = req.body.feedback || submission.feedback;
      submission.submissionDate = Date.now();

      const updatedSubmission = await submission.save();
      res.json(updatedSubmission);
    } catch (error) {
      console.error('Error updating submission:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),

  // Delete submission (only student or admin)
  deleteSubmission: asyncHandler(async (req, res) => {
    try {
      const submission = await Submission.findById(req.params.id);

      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      if (req.user.role !== 'admin' && submission.studentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this submission' });
      }

      await submission.remove();
      res.json({ message: 'Submission removed' });
    } catch (error) {
      console.error('Error deleting submission:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),

  // Get submissions by assignment ID
  getSubmissionsByAssignmentId: asyncHandler(async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.assignmentId).populate('instructorId courseId');
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      if (req.user.role === 'admin' || assignment.instructorId._id.toString() === req.user._id.toString() || (await Course.findById(assignment.courseId)).students.includes(req.user._id)) {
        const submissions = await Submission.find({ assignmentId: req.params.assignmentId }).populate('studentId');
        res.json(submissions);
      } else {
        res.status(403).json({ message: 'You are not authorized to view these submissions' });
      }
    } catch (error) {
      console.error('Error getting submissions by assignment ID:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),

  // Get submissions by user ID
  getSubmissionsByUserId: asyncHandler(async (req, res) => {
    try {
      if (req.user.role === 'admin' || req.user._id.toString() === req.params.userId) {
        const submissions = await Submission.find({ studentId: req.params.userId }).populate('assignmentId');
        res.json(submissions);
      } else {
        res.status(403).json({ message: 'You are not authorized to view these submissions' });
      }
    } catch (error) {
      console.error('Error getting submissions by user ID:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),

  // Grade submission (only instructor)
  gradeSubmission: asyncHandler(async (req, res) => {
    try {
      const { submissionId, grade, feedback } = req.body;
      const submission = await Submission.findById(submissionId).populate('assignmentId studentId');

      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      const assignment = await Assignment.findById(submission.assignmentId).populate('instructorId');

      if (assignment.instructorId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to grade this submission' });
      }

      submission.grade = grade;
      submission.feedback = feedback;
      await submission.save();

      res.json({ message: 'Submission graded successfully' });
    } catch (error) {
      console.error('Error grading submission:', error);
      res.status(500).json({ message: 'Internal server error during grading', error: error.message });
    }
  }),
};

module.exports = submissionController;