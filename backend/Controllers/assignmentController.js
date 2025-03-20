// assignmentController.js
const Assignment = require('../Models/assignmentModel');
const Course = require('../Models/courseModel');
const Module = require('../Models/moduleModel');
const Notification = require('../Models/notificationModel');
const asyncHandler = require('express-async-handler');
const User = require('../Models/userModel'); // Import User model

const assignmentController = {
  // Create a new assignment
  createAssignment: asyncHandler(async (req, res) => {
    const { title, description, dueDate, moduleId } = req.body;
  
    // Validation
    if (!title || !description || !dueDate || !moduleId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
  
    try {
      // Check if module exists
      const module = await Module.findById(moduleId).populate('courseId');
      if (!module) {
        return res.status(404).json({ message: 'Module not found' });
      }
      
      const courseId = module.courseId._id; // Get courseId from module
  
      // Format dueDate
      const formattedDueDate = formatDate(dueDate);
      if (!formattedDueDate) {
        return res.status(400).json({ message: 'Invalid date format. Use DD/MM/YYYY or DD-MM-YYYY' });
      }
  
      const assignment = new Assignment({
        title,
        description,
        dueDate: formattedDueDate,
        courseId,
        moduleId,
        instructorId: req.user._id,
      });
  
      const createdAssignment = await assignment.save();
      res.status(201).json(createdAssignment);
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),

  // Get all assignments
  getAllAssignments: asyncHandler(async (req, res) => {
    try {
      const assignments = await Assignment.find().populate('courseId moduleId instructorId');
  
      // Filter assignments based on authorization
      const authorizedAssignments = assignments.map((assignment) => {
        const courseId = assignment.courseId._id;
        const moduleId = assignment.moduleId._id;
        const instructorId = assignment.instructorId._id.toString();
  
        if (req.user.role === 'admin') {
          return assignment; // Admins see all details
        }
  
        if (instructorId === req.user._id.toString()) {
          return assignment; // Instructor sees all details of their assignments
        }
  
        // Check if user is enrolled in the course
        if (isUserEnrolled(req.user._id, courseId)) {
          return assignment; // Enrolled students see all details
        }
  
        // Others only see the title
        return { _id: assignment._id, title: assignment.title, moduleId: moduleId, courseId: courseId };
      });
  
      res.json(authorizedAssignments);
    } catch (error) {
      console.error('Error getting all assignments:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
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
    try {
      const assignment = await Assignment.findById(req.params.id).populate('moduleId');
  
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
  
      // Check if the current user is the creator
      if (assignment.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this assignment' });
      }
  
      assignment.title = req.body.title || assignment.title;
      assignment.description = req.body.description || assignment.description;
  
      // Check module ID and course ID relationship
      if (req.body.moduleId) {
        const newModule = await Module.findById(req.body.moduleId).populate('courseId');
        if (!newModule) {
          return res.status(404).json({ message: 'New module not found' });
        }
        
        if (assignment.moduleId.courseId.toString() !== newModule.courseId._id.toString()) {
          return res.status(400).json({ message: 'New module is not in the same course as the original module' });
        }
  
        assignment.moduleId = req.body.moduleId;
      }
  
      // Update due date
      if (req.body.dueDate) {
        const formattedDueDate = formatDate(req.body.dueDate);
        if (!formattedDueDate) {
          return res.status(400).json({ message: 'Invalid date format. Use DD/MM/YYYY or DD-MM-YYYY' });
        }
        assignment.dueDate = formattedDueDate;
      }
  
      const updatedAssignment = await assignment.save();
      res.json(updatedAssignment);
    } catch (error) {
      console.error('Error updating assignment:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
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

      await Assignment.findByIdAndDelete(req.params.id);
      res.json({ message: 'Assignment removed' });
    } else {
      res.status(404).json({ message: 'Assignment not found' });
    }
  }),

  // Get Assignments by CourseId
  getAssignmentsByCourseId: asyncHandler(async (req, res) => {
    const assignments = await Assignment.find({ courseId: req.params.courseId }).populate('moduleId');
    res.json(assignments);
  }),

  // Get Assignments by ModuleId
  getAssignmentsByModuleId: asyncHandler(async (req, res) => {
    const assignments = await Assignment.find({ moduleId: req.params.moduleId }).populate('courseId');
    res.json(assignments);
  }),

  // Grade Assignment
  gradeAssignment: asyncHandler(async (req, res) => {
    const { assignmentId, studentId, grade } = req.body;

    try {
      const assignment = await Assignment.findById(assignmentId);
      const student = await User.findById(studentId);

      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Add logic to store the grade in the assignment or a related submission model
      // Example: Assuming you have a submissions array in the Assignment model
      if (!assignment.submissions) {
        assignment.submissions = [];
      }

      const submissionIndex = assignment.submissions.findIndex(
        (submission) => submission.studentId.toString() === studentId.toString()
      );

      if (submissionIndex === -1) {
        assignment.submissions.push({ studentId, grade });
      } else {
        assignment.submissions[submissionIndex].grade = grade;
      }

      await assignment.save();

      const notification = new Notification({
        userId: studentId,
        type: 'assignmentGraded',
        message: `Your assignment "${assignment.title}" has been graded.`,
        relatedId: assignmentId,
        relatedModel: 'Assignment',
      });
      await notification.save();

      res.json({ message: 'Assignment graded successfully' });
    } catch (error) {
      console.error('Grading error:', error);
      res.status(500).json({ message: 'Internal server error during grading' });
    }
  }),
};

const formatDate = (dateString) => {
  const dateParts = dateString.split(/[-/]/); // Split by '-' or '/'

  if (dateParts.length !== 3) {
    return null; // Invalid format
  }

  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Months are 0-indexed
  const year = parseInt(dateParts[2], 10);

  const date = new Date(year, month, day);

  if (isNaN(date.getTime())) {
    return null; // Invalid date
  }

  // Set the time to 18:30:00.000
  date.setUTCHours(18, 30, 0, 0);

  // Convert the date to the format YYYY-MM-DDTHH:mm:ss.sssZ
  const formattedDate = date.toISOString();

  return formattedDate;
};

const isUserEnrolled = async (userId, courseId) => {
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return false; // Course not found
    }
    return course.students.includes(userId);
  } catch (error) {
    console.error('Error checking user enrollment:', error);
    return false;
  }
};
module.exports = assignmentController;