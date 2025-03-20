// courseRoutes.js
const express = require('express');
const courseRouter = express.Router();
const courseController = require('../Controllers/courseController');
const { protect, admin, authorize } = require('../Middlewares/authMiddleware'); // Assuming you have protect and admin middlewares

courseRouter.post('/', protect, authorize('instructor'), courseController.createCourse); 
courseRouter.get('/', protect, courseController.getAllCourses); 
courseRouter.get('/:id', protect, courseController.getCourseById); 
courseRouter.put('/:id',protect,authorize('instructor','admin'), courseController.updateCourse); 
courseRouter.delete('/:id', protect, courseController.deleteCourse); 
courseRouter.get('/category/:category', protect, courseController.getCoursesByCategory); 
courseRouter.get('/instructor/:instructorId', protect, courseController.getCoursesByInstructorId);
courseRouter.post('/enroll',protect, courseController.enrollUserInCourse);

module.exports = courseRouter;