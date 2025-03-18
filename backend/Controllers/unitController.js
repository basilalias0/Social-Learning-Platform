// unitController.js
const Unit = require('../Models/unitModel');
const Module = require('../Models/moduleModel');
const asyncHandler = require('express-async-handler');

const unitController = {
  // Create a new unit
  createUnit: asyncHandler(async (req, res) => {
    const { title, description, moduleId, content, order } = req.body;

    if (!title || !moduleId) {
      return res.status(400).json({ message: 'Title and moduleId are required' });
    }

    // Check if the module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const unit = new Unit({
      title,
      description,
      moduleId,
      content,
      order: order || 0, // Default order if not provided
    });

    const createdUnit = await unit.save();
    res.status(201).json(createdUnit);
  }),

  // Get all units
  getAllUnits: asyncHandler(async (req, res) => {
    const units = await Unit.find().populate('moduleId');
    res.json(units);
  }),

  // Get unit by ID
  getUnitById: asyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id).populate('moduleId');
    if (unit) {
      res.json(unit);
    } else {
      res.status(404).json({ message: 'Unit not found' });
    }
  }),

  // Update unit (only admin or instructor who created the module's course)
  updateUnit: asyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id).populate('moduleId');

    if (unit) {
      const module = await Module.findById(unit.moduleId).populate('courseId');

      if (req.user.role !== 'admin' && module.courseId.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this unit' });
      }

      unit.title = req.body.title || unit.title;
      unit.description = req.body.description || unit.description;
      unit.content = req.body.content || unit.content;
      unit.order = req.body.order || unit.order;

      const updatedUnit = await unit.save();
      res.json(updatedUnit);
    } else {
      res.status(404).json({ message: 'Unit not found' });
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
    const units = await Unit.find({ moduleId: req.params.moduleId }).populate('moduleId');
    res.json(units);
  }),
};

module.exports = unitController;