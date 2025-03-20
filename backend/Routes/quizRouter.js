// quizRoutes.js
const express = require('express');
const quizRouter = express.Router();
const quizController = require('../Controllers/quizController');
const { protect } = require('../Middlewares/authMiddleware');

quizRouter.get('/', quizController.getAllQuizzes);
quizRouter.get('/:id', quizController.getQuizById);
quizRouter.get('/module/:moduleId', quizController.getQuizzesByModuleId);

quizRouter.post('/question', protect, quizController.addQuestionToQuiz); 
quizRouter.put('/question', protect, quizController.updateQuestionInQuiz);

quizRouter.put('/:id', protect, quizController.updateQuiz);
quizRouter.delete('/:id', protect, quizController.deleteQuiz);

module.exports = quizRouter;