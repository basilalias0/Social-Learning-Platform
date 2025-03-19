// unitController.js
const Unit = require('../Models/unitModel');
const Module = require('../Models/moduleModel');
const asyncHandler = require('express-async-handler');
const Course = require('../Models/courseModel');

const unitController = {
  // Create a new unit
  createUnit: asyncHandler(async (req, res) => {
    const { title, description, moduleId, order, content } = req.body;

    if (!title || !moduleId) {
      return res.status(400).json({ message: 'Title and moduleId are required' });
    }

    try {
      const module = await Module.findById(moduleId).populate('courseId');
      if (!module) {
        return res.status(404).json({ message: 'Module not found' });
      }

      const course = await Course.findById(module.courseId);
      if (course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to add units to this module' });
      }

      let uploadedContent = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          let contentType = 'text'; // Default to text
          if (file.mimetype.startsWith('image/')) {
            contentType = 'image';
          } else if (file.mimetype.startsWith('video/')) {
            contentType = 'video';
          }
          uploadedContent.push({
            type: contentType,
            value: file.path, // Cloudinary URL
          });
        }
      }

      const finalContent = content ? [...uploadedContent, ...JSON.parse(content)] : [...uploadedContent];

      const unit = new Unit({
        title,
        description,
        moduleId,
        content: finalContent,
        order: order || 0,
        instructorId: req.user._id,
      });

      const createdUnit = await unit.save();
      res.status(201).json(createdUnit);
    } catch (error) {
      console.error('Error creating unit:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),

  // Get all units
  getAllUnits: asyncHandler(async (req, res) => {
    try {
      const units = await Unit.find().populate('moduleId instructorId');
  
      // Filter units based on authorization
      const authorizedUnits = units.filter((unit) => {
        const module = unit.moduleId;
        const instructorId = unit.instructorId._id.toString();
  
        if (req.user.role === 'admin') {
          return true; // Admins can access all units
        }
  
        if (instructorId === req.user._id.toString()) {
          return true; // Instructor can access their units
        }
  
        // Check if user is enrolled in the course
        return isUserEnrolled(req.user._id, module.courseId);
      });
  
      res.json(authorizedUnits);
    } catch (error) {
      console.error('Error getting all units:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),

  // Get unit by ID
  getUnitById: asyncHandler(async (req, res) => {
    try {
      const unit = await Unit.findById(req.params.id).populate('moduleId instructorId');
  
      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }
  
      const module = unit.moduleId;
      const instructorId = unit.instructorId._id.toString();
  
      if (req.user.role === 'admin') {
        return res.json(unit); // Admins can access all units
      }
  
      if (instructorId === req.user._id.toString()) {
        return res.json(unit); // Instructor can access their units
      }
  
      // Check if user is enrolled in the course
      if (isUserEnrolled(req.user._id, module.courseId)) {
        return res.json(unit);
      }
  
      return res.status(403).json({ message: 'You are not authorized to view this unit' });
    } catch (error) {
      console.error('Error getting unit by ID:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),

  // Update unit (only admin or instructor who created the module's course)
  updateUnit: asyncHandler(async (req, res) => {
    try {
      const unit = await Unit.findById(req.params.id).populate('moduleId');

      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }

      const module = await Module.findById(unit.moduleId).populate('courseId');

      if (req.user.role !== 'admin' && module.courseId.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this unit' });
      }

      unit.title = req.body.title || unit.title;
      unit.description = req.body.description || unit.description;
      unit.order = req.body.order || unit.order;

      // Handle file updates
      let uploadedContent = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          let contentType = 'text';
          if (file.mimetype.startsWith('image/')) {
            contentType = 'image';
          } else if (file.mimetype.startsWith('video/')) {
            contentType = 'video';
          }
          uploadedContent.push({
            type: contentType,
            value: file.path, // Cloudinary URL
          });
        }
      }

      // Combine uploaded content with existing and updated text content
      let finalContent = unit.content || [];

      if (req.body.content) {
          finalContent = [...uploadedContent, ...JSON.parse(req.body.content)];
      } else {
          finalContent = [...uploadedContent, ...finalContent];
      }

      unit.content = finalContent;

      const updatedUnit = await unit.save();
      res.json(updatedUnit);
    } catch (error) {
      console.error('Error updating unit:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),

  // Delete unit (only admin or instructor who created the module's course)
  deleteUnit: asyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id).populate('moduleId');

    if (unit) {
      const module = await Module.findById(unit.moduleId).populate('courseId');

      if (req.user.role !== 'admin' && module.courseId.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this unit' });
      }

      await unit.remove();
      res.json({ message: 'Unit removed' });
    } else {
      res.status(404).json({ message: 'Unit not found' });
    }
  }),

  // Get units by module ID
  getUnitsByModuleId: asyncHandler(async (req, res) => {
    try {
      const units = await Unit.find({ moduleId: req.params.moduleId }).populate('moduleId instructorId');
  
      // Filter units based on authorization
      const authorizedUnits = units.filter((unit) => {
        const module = unit.moduleId;
        const instructorId = unit.instructorId._id.toString();
  
        if (req.user.role === 'admin') {
          return true; // Admins can access all units
        }
  
        if (instructorId === req.user._id.toString()) {
          return true; // Instructor can access their units
        }
  
        // Check if user is enrolled in the course
        return isUserEnrolled(req.user._id, module.courseId);
      });
  
      res.json(authorizedUnits);
    } catch (error) {
      console.error('Error getting units by module ID:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }),
}

const isUserEnrolled = async (userId, courseId) => {
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return false; // Course not found
    }
    return course.students.includes(userId);
  } catch (error) {
    console.error('Error checking user enrollment:', error);
    return false;
  }
};

module.exports = unitController;