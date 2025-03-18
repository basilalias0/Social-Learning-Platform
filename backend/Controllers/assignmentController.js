// assignmentController.js
const Assignment = require('../Models/assignmentModel');
const Course = require('../Models/courseModel');
const Module = require('../Models/moduleModel');
const asyncHandler = require('express-async-handler');

const assignmentController = {
  // Create a new assignment
  createAssignment: asyncHandler(async (req, res) => {
    const { title, description, dueDate, courseId, moduleId } = req.body;

    // Validation
    if (!title || !description || !dueDate || !courseId || !moduleId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if course and module exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const assignment = new Assignment({
      title,
      description,
      dueDate,
      courseId,
      moduleId,
      instructorId: req.user._id,
    });

    const createdAssignment = await assignment.save();
    res.status(201).json(createdAssignment);
  }),

  // Get all assignments
  getAllAssignments: asyncHandler(async (req, res) => {
    const assignments = await Assignment.find().populate('courseId moduleId');
    res.json(assignments);
  }),

  // Get assignment by ID
  getAssignmentById: asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id).populate('courseId moduleId');
    if (assignment) {
      res.json(assignment);
    } else {
      res.status(404).json({ message: 'Assignment not found' });
    }
  }),

  // Update assignment
  updateAssignment: asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);

    if (assignment) {
      // Check if the current user is the creator
      if (assignment.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this assignment' });
      }

      assignment.title = req.body.title || assignment.title;
      assignment.description = req.body.description || assignment.description;
      assignment.dueDate = req.body.dueDate || assignment.dueDate;
      assignment.courseId = req.body.courseId || assignment.courseId;
      assignment.moduleId = req.body.moduleId || assignment.moduleId;

      const updatedAssignment = await assignment.save();
      res.json(updatedAssignment);
    } else {
      res.status(404).json({ message: 'Assignment not found' });
    }
  }),

  // Delete assignment (only creator can delete)
  deleteAssignment: asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);

    if (assignment) {
      // Check if the current user is the creator
      if (assignment.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this assignment' });
      }

      await assignment.remove();
      res.json({ message: 'Assignment removed' });
    } else {
      res.status(404).json({ message: 'Assignment not found' });
    }
  }),

  // Get Assignments by CourseId
  getAssignmentsByCourseId: asyncHandler(async(req, res)=>{
    const assignments = await Assignment.find({courseId: req.params.courseId}).populate('moduleId');
    res.json(assignments);
  }),

  // Get Assignments by ModuleId
  getAssignmentsByModuleId: asyncHandler(async(req, res)=>{
    const assignments = await Assignment.find({moduleId: req.params.moduleId}).populate('courseId');
    res.json(assignments);
  })
};

module.exports = assignmentController;