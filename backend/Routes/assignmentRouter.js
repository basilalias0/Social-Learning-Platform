const express = require('express');
const assignmentRouter = express.Router();
const assignmentController = require('../Controllers/assignmentController');
const { protect, authorize } = require('../Middlewares/authMiddleware');

// Public Routes
assignmentRouter.get('/', assignmentController.getAllAssignments);
assignmentRouter.get('/:id', assignmentController.getAssignmentById);
assignmentRouter.get('/course/:courseId', assignmentController.getAssignmentsByCourseId);
assignmentRouter.get('/module/:moduleId', assignmentController.getAssignmentsByModuleId);

// Protected Routes (Instructor/Admin)
assignmentRouter.post('/', protect, authorize('instructor', 'admin'), assignmentController.createAssignment);
assignmentRouter.put('/:id', protect, assignmentController.updateAssignment); // Removed authorize, now only creator can edit
assignmentRouter.delete('/:id', protect, assignmentController.deleteAssignment); // Removed authorize, now only creator can delete

module.exports = assignmentRouter;