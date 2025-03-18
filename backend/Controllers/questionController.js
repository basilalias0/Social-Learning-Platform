// questionController.js
const Question = require('../Models/questionModel');
const Quiz = require('../Models/quizModel');
const asyncHandler = require('express-async-handler');

const questionController = {
  // Create a new question
  createQuestion: asyncHandler(async (req, res) => {
    const { quizId, questionText, options, correctAnswer } = req.body;

    if (!quizId || !questionText || !options || !correctAnswer) {
      return res.status(400).json({ message: 'QuizId, questionText, options, and correctAnswer are required' });
    }

    // Check if the quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const question = new Question({
      quizId,
      questionText,
      options,
      correctAnswer,
    });

    const createdQuestion = await question.save();
    res.status(201).json(createdQuestion);
  }),

  // Get all questions
  getAllQuestions: asyncHandler(async (req, res) => {
    const questions = await Question.find().populate('quizId');
    res.json(questions);
  }),

  // Get question by ID
  getQuestionById: asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id).populate('quizId');
    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  }),

  // Update question (only admin or instructor who created the quiz)
  updateQuestion: asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id).populate('quizId');

    if (question) {
      const quiz = await Quiz.findById(question.quizId);

      if (req.user.role !== 'admin' && quiz.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this question' });
      }

      question.questionText = req.body.questionText || question.questionText;
      question.options = req.body.options || question.options;
      question.correctAnswer = req.body.correctAnswer || question.correctAnswer;

      const updatedQuestion = await question.save();
      res.json(updatedQuestion);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  }),

  // Delete question (only admin or instructor who created the quiz)
  deleteQuestion: asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id).populate('quizId');

    if (question) {
      const quiz = await Quiz.findById(question.quizId);

      if (req.user.role !== 'admin' && quiz.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this question' });
      }

      await question.remove();
      res.json({ message: 'Question removed' });
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  }),

  // Get questions by quiz ID
  getQuestionsByQuizId: asyncHandler(async (req, res) => {
    const questions = await Question.find({ quizId: req.params.quizId }).populate('quizId');
    res.json(questions);
  }),
};

module.exports = questionController;