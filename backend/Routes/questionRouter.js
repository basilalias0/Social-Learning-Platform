const express = require('express');
const questionRouter = express.Router();
const questionController = require('../Controllers/questionController');
const { protect, admin } = require('../Middlewares/authMiddleware');

questionRouter.post('/', protect, questionController.createQuestion);
questionRouter.post('/answer', protect, questionController.answerQuestion);
questionRouter.get('/', questionController.getAllQuestions);
questionRouter.get('/:id', questionController.getQuestionById);
questionRouter.get('/chat/:chatId', questionController.getQuestionsByChatId);
questionRouter.put('/:id', protect, admin, questionController.updateQuestion);
questionRouter.delete('/:id', protect, admin, questionController.deleteQuestion);

module.exports = questionRouter;