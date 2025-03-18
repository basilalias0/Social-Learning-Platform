// courseController.js
const Course = require('../Models/courseModel');
const asyncHandler = require('express-async-handler');

const courseController = {
  // Create a new course
  createCourse: asyncHandler(async (req, res) => {
    const { title, description, instructorId, price, category } = req.body;

    if (!title || !description || !instructorId || !price || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const course = new Course({
      title,
      description,
      instructorId,
      price,
      category,
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  }),

  // Get all courses
  getAllCourses: asyncHandler(async (req, res) => {
    const courses = await Course.find().populate('instructorId');
    res.json(courses);
  }),

  // Get course by ID
  getCourseById: asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id).populate('instructorId');
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  }),

  // Update course
  updateCourse: asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
      if (req.user.role !== 'admin' && course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this course' });
      }

      course.title = req.body.title || course.title;
      course.description = req.body.description || course.description;
      course.instructorId = req.body.instructorId || course.instructorId;
      course.price = req.body.price || course.price;
      course.category = req.body.category || course.category;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  }),

  // Delete course (admin or instructor can delete)
  deleteCourse: asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
      if (req.user.role !== 'admin' && course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this course' });
      }

      await course.remove();
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  }),

  //Get courses by category.
  getCoursesByCategory: asyncHandler(async(req, res)=>{
    const courses = await Course.find({category: req.params.category}).populate('instructorId');
    res.json(courses);
  }),

  //Get courses by instructorId.
  getCoursesByInstructorId: asyncHandler(async(req, res)=>{
    const courses = await Course.find({instructorId: req.params.instructorId}).populate('instructorId');
    res.json(courses);
  })
};

module.exports = courseController;