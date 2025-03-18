// assignmentRoutes.js
const express = require('express');
const assignmentRouter = express.Router();
const assignmentController = require('../Controllers/assignmentController');
const { protect } = require('../Middlewares/authMiddleware'); // Assuming you have protect middleware

assignmentRouter.post('/', protect, assignmentController.createAssignment);
assignmentRouter.get('/', protect, assignmentController.getAllAssignments);
assignmentRouter.get('/:id', protect, assignmentController.getAssignmentById);
assignmentRouter.put('/:id', protect, assignmentController.updateAssignment);
assignmentRouter.delete('/:id', protect, assignmentController.deleteAssignment);
assignmentRouter.get('/course/:courseId', protect, assignmentController.getAssignmentsByCourseId);
assignmentRouter.get('/module/:moduleId', protect, assignmentController.getAssignmentsByModuleId);
assignmentRouter.post('/grade', protect, assignmentController.gradeAssignment);

module.exports = assignmentRouter;