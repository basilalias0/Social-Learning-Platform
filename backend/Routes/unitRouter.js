// unitRoutes.js
const express = require('express');
const unitRouter = express.Router();
const unitController = require('../Controllers/unitController');
const { protect } = require('../Middlewares/authMiddleware');

// Public Routes
unitRouter.get('/', unitController.getAllUnits);
unitRouter.get('/:id', unitController.getUnitById);
unitRouter.get('/module/:moduleId', unitController.getUnitsByModuleId);

// Protected Routes
unitRouter.post('/', protect, unitController.createUnit);
unitRouter.put('/:id', protect, unitController.updateUnit);
unitRouter.delete('/:id', protect, unitController.deleteUnit);

module.exports = unitRouter;