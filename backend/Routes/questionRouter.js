const express = require('express');
const questionRouter = express.Router();
const questionController = require('../Controllers/questionController');
const { protect } = require('../Middlewares/authMiddleware');

questionRouter.get('/', questionController.getAllQuestions);
questionRouter.get('/:id', questionController.getQuestionById);
questionRouter.get('/chat/:chatId', questionController.getQuestionsByChatId);
questionRouter.post('/', protect, questionController.createQuestion);
questionRouter.post('/answer', protect, questionController.answerQuestion);
questionRouter.put('/:id', protect, questionController.updateQuestion);
questionRouter.delete('/:id', protect, questionController.deleteQuestion);

module.exports = questionRouter;