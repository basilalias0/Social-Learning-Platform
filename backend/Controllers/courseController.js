// courseController.js
const Course = require('../Models/courseModel');
const asyncHandler = require('express-async-handler');

const courseController = {
  // Create a new course
  createCourse: asyncHandler(async (req, res) => {
    try {
      const { title, description, price, category } = req.body;
  
      if (!title || !description || !price || !category) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }
      
      const course = new Course({
        title,
        description,
        instructorId: req.user._id,
        price,
        category,
      });
  
      const createdCourse = await course.save();
      res.status(201).json(createdCourse);
    } catch (error) {
      console.error('Error creating course:', error);
  
      if (error.name === 'ValidationError') {
        // Mongoose validation error
        const validationErrors = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation error', errors: validationErrors });
      } else if (error.code === 11000) {
        // Duplicate key error (e.g., unique title)
        return res.status(400).json({ message: 'Duplicate key error', error: error.message });
      } else {
        // Generic server error
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    }
  }),
  
  getAllCourses: asyncHandler(async (req, res) => {
    try {
      const courses = await Course.find().populate('instructorId');
      res.json(courses);
    } catch (error) {
      console.error('Error getting courses:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),
  
  getCourseById: asyncHandler(async (req, res) => {
    try {
      const course = await Course.findById(req.params.id).populate('instructorId');
      if (course) {
        res.json(course);
      } else {
        res.status(404).json({ message: 'Course not found' });
      }
    } catch (error) {
      console.error('Error getting course by ID:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({message: "Invalid Course ID."});
      }
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),
  
  updateCourse: asyncHandler(async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
  
      if (course) {
        if (req.user.role !== 'admin' && course.instructorId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'You are not authorized to update this course' });
        }
  
        const { title, description, price, category } = req.body;
  
        course.title = title || course.title;
        course.description = description || course.description;
        course.price = price || course.price;
        course.category = category || course.category;
  
        const updatedCourse = await course.save();
        res.json(updatedCourse);
      } else {
        res.status(404).json({ message: 'Course not found' });
      }
    } catch (error) {
      console.error('Error updating course:', error);
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation error', errors: validationErrors });
      } else if (error.name === 'CastError') {
        return res.status(400).json({message: "Invalid Course ID."});
      }
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),
  
  deleteCourse: asyncHandler(async (req, res) => {
    try {
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
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({message: "Invalid Course ID."});
      }
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),
  
  getCoursesByCategory: asyncHandler(async (req, res) => {
    try {
      const courses = await Course.find({ category: req.params.category }).populate('instructorId');
      res.json(courses);
    } catch (error) {
      console.error('Error getting courses by category:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),
  
  getCoursesByInstructorId: asyncHandler(async (req, res) => {
    try {
      const courses = await Course.find({ instructorId: req.params.instructorId }).populate('instructorId');
      res.json(courses);
    } catch (error) {
      console.error('Error getting courses by instructor ID:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),
  
  enrollUserInCourse: asyncHandler(async (req, res) => {
    try {
      const { courseId } = req.body;
      const userId = req.user._id;
  
      const course = await Course.findById(courseId);
      const user = await User.findById(userId);
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (course.enrolledStudents.includes(userId)) {
        return res.status(400).json({ message: 'User is already enrolled in this course' });
      }
  
      course.enrolledStudents.push(userId);
      await course.save();
  
      user.enrolledCourses.push(courseId);
      await user.save();
  
      const notification = new Notification({
        userId: userId,
        type: 'courseEnrollment',
        message: `You have successfully enrolled in the course "${course.title}".`,
        relatedId: courseId,
        relatedModel: 'Course',
      });
      await notification.save();
  
      res.json({ message: 'User enrolled in course' });
    } catch (error) {
      console.error('Error enrolling user:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({message: "Invalid Course ID or User ID."});
      }
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),
};

module.exports = courseController;