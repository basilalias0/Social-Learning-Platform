// quizController.js
const Quiz = require('../Models/quizModel');
const Course = require('../Models/courseModel');
const asyncHandler = require('express-async-handler');

const quizController = {
  // Create a new quiz
  createQuiz: asyncHandler(async (req, res) => {
    const { title, description, courseId, instructorId } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({ message: 'Title and courseId are required' });
    }

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    //Check if the user is the instructor, or admin
    if (req.user.role !== 'admin' && course.instructorId.toString() !== req.user._id.toString()){
      return res.status(403).json({message: "Not authorized to create quiz on this course."})
    }

    const quiz = new Quiz({
      title,
      description,
      courseId,
      instructorId: course.instructorId, // Set the instructorId from the course
    });

    const createdQuiz = await quiz.save();
    res.status(201).json(createdQuiz);
  }),

  // Get all quizzes
  getAllQuizzes: asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find().populate('courseId instructorId');
    res.json(quizzes);
  }),

  // Get quiz by ID
  getQuizById: asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id).populate('courseId instructorId');
    if (quiz) {
      res.json(quiz);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  }),

  // Update quiz (only admin or instructor who created the quiz)
  updateQuiz: asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id).populate('courseId instructorId');

    if (quiz) {
      if (req.user.role !== 'admin' && quiz.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this quiz' });
      }

      quiz.title = req.body.title || quiz.title;
      quiz.description = req.body.description || quiz.description;

      const updatedQuiz = await quiz.save();
      res.json(updatedQuiz);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  }),

  // Delete quiz (only admin or instructor who created the quiz)
  deleteQuiz: asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id).populate('courseId instructorId');

    if (quiz) {
      if (req.user.role !== 'admin' && quiz.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this quiz' });
      }

      await quiz.remove();
      res.json({ message: 'Quiz removed' });
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  }),

  // Get quizzes by course ID
  getQuizzesByCourseId: asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find({ courseId: req.params.courseId }).populate('courseId instructorId');
    res.json(quizzes);
  }),

  //Get quizzes by instructor id.
  getQuizzesByInstructorId: asyncHandler(async(req, res)=>{
    const quizzes = await Quiz.find({instructorId: req.params.instructorId}).populate('courseId instructorId');
    res.json(quizzes);
  })
};

module.exports = quizController;