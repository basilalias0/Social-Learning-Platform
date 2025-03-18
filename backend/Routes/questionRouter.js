// questionRoutes.js
const express = require('express');
const questionRouter = express.Router();
const questionController = require('../Controllers/questionController');
const { protect } = require('../Middlewares/authMiddleware');

// Public Routes
questionRouter.get('/', questionController.getAllQuestions);
questionRouter.get('/:id', questionController.getQuestionById);
questionRouter.get('/quiz/:quizId', questionController.getQuestionsByQuizId);

// Protected Routes
questionRouter.post('/', protect, questionController.createQuestion);
questionRouter.put('/:id', protect, questionController.updateQuestion);
questionRouter.delete('/:id', protect, questionController.deleteQuestion);

module.exports = questionRouter;