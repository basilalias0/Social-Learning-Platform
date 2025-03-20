// quizController.js
const Quiz = require('../Models/quizModel');
const Module = require('../Models/moduleModel');
const asyncHandler = require('express-async-handler');

const quizController = {
  getAllQuizzes: asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find().populate('moduleId'); // Updated to populate moduleId
    res.json(quizzes);
  }),

  getQuizById: asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id).populate('moduleId'); // Updated to populate moduleId
    if (quiz) {
      res.json(quiz);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  }),

  addQuestionToQuiz: asyncHandler(async (req, res) => {
    const { moduleId, questionText, options, correctAnswer } = req.body;

    if (!moduleId || !questionText || !options || !correctAnswer) {
      return res.status(400).json({ message: 'moduleId, questionText, options, and correctAnswer are required' });
    }

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    if (req.user.role !== 'admin' && module.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add questions to this module.' });
    }

    let quiz = await Quiz.findOne({ moduleId });

    if (!quiz) {
      quiz = new Quiz({
        title: `Quiz for ${module.title}`,
        moduleId,
        questions: [],
      });
      await quiz.save();
    }

    quiz.questions.push({ questionText, options, correctAnswer });
    await quiz.save();

    res.json({ message: 'Question added to quiz successfully' });
  }),

  updateQuestionInQuiz: asyncHandler(async (req, res) => {
    const { quizId, questionIndex, questionText, options, correctAnswer } = req.body;

    if (!quizId || questionIndex === undefined || !questionText || !options || !correctAnswer) {
      return res.status(400).json({ message: 'quizId, questionIndex, questionText, options, and correctAnswer are required' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const module = await Module.findById(quiz.moduleId); // Get module to check instructorId
    if (!module) {
        return res.status(404).json({message: 'Module not found'});
    }

    if (req.user.role !== 'admin' && module.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update questions in this quiz.' });
    }

    if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
      return res.status(400).json({ message: 'Invalid questionIndex' });
    }

    quiz.questions[questionIndex] = { questionText, options, correctAnswer };
    await quiz.save();

    res.json({ message: 'Question updated in quiz successfully' });
  }),

  updateQuiz: asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
      const module = await Module.findById(quiz.moduleId); // Get module to check instructorId

      if (req.user.role !== 'admin' && module.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this quiz' });
      }

      quiz.title = req.body.title || quiz.title;

      const updatedQuiz = await quiz.save();
      res.json(updatedQuiz);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  }),

  deleteQuiz: asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
      const module = await Module.findById(quiz.moduleId); // Get module to check instructorId

      if (req.user.role !== 'admin' && module.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this quiz' });
      }

      await Quiz.findByIdAndDelete(req.params.id)
      res.json({ message: 'Quiz removed' });
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  }),

  getQuizzesByModuleId: asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find({ moduleId: req.params.moduleId }).populate('moduleId');
    res.json(quizzes);
  }),
};

module.exports = quizController;