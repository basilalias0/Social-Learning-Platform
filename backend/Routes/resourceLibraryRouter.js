// resourceLibraryRoutes.js
const express = require('express');
const resourceLibraryRouter = express.Router();
const resourceLibraryController = require('../Controllers/resourceLibraryController');
const { protect } = require('../Middlewares/authMiddleware');

// Public Routes
resourceLibraryRouter.get('/', resourceLibraryController.getAllResources);
resourceLibraryRouter.get('/:id', resourceLibraryController.getResourceById);
resourceLibraryRouter.get('/user/:userId', resourceLibraryController.getResourcesByUserId);
resourceLibraryRouter.get('/category/:category', resourceLibraryController.getResourcesByCategory);

// Protected Routes
resourceLibraryRouter.post('/', protect, resourceLibraryController.createResource);
resourceLibraryRouter.put('/:id', protect, resourceLibraryController.updateResource);
resourceLibraryRouter.delete('/:id', protect, resourceLibraryController.deleteResource);

module.exports = resourceLibraryRouter;