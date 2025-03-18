// quizRoutes.js
const express = require('express');
const quizRouter = express.Router();
const quizController = require('../Controllers/quizController');
const { protect } = require('../Middlewares/authMiddleware');

// Public Routes
quizRouter.get('/', quizController.getAllQuizzes);
quizRouter.get('/:id', quizController.getQuizById);
quizRouter.get('/course/:courseId', quizController.getQuizzesByCourseId);
quizRouter.get('/instructor/:instructorId', quizController.getQuizzesByInstructorId);

// Protected Routes
quizRouter.post('/', protect, quizController.createQuiz);
quizRouter.put('/:id', protect, quizController.updateQuiz);
quizRouter.delete('/:id', protect, quizController.deleteQuiz);

module.exports = quizRouter;