// courseRoutes.js
const express = require('express');
const courseRouter = express.Router();
const courseController = require('../Controllers/courseController');
const { protect, authorize } = require('../Middlewares/authMiddleware');

// Public Routes
courseRouter.get('/', courseController.getAllCourses);
courseRouter.get('/:id', courseController.getCourseById);
courseRouter.get('/category/:category', courseController.getCoursesByCategory);
courseRouter.get('/instructor/:instructorId', courseController.getCoursesByInstructorId);

// Protected Routes (Instructor/Admin)
courseRouter.post('/', protect, authorize('instructor', 'admin'), courseController.createCourse);
courseRouter.put('/:id', protect, courseController.updateCourse);
courseRouter.delete('/:id', protect, courseController.deleteCourse);

module.exports = courseRouter;