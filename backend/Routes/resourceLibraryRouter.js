// resourceLibraryRoutes.js
const express = require('express');
const resourceLibraryRouter = express.Router();
const resourceLibraryController = require('../Controllers/resourceLibraryController');
const { protect } = require('../Middlewares/authMiddleware'); // Assuming you have protect middleware

resourceLibraryRouter.post('/', protect, resourceLibraryController.createResource);
resourceLibraryRouter.get('/', protect, resourceLibraryController.getAllResources);
resourceLibraryRouter.get('/:id', protect, resourceLibraryController.getResourceById);
resourceLibraryRouter.put('/:id', protect, resourceLibraryController.updateResource);
resourceLibraryRouter.delete('/:id', protect, resourceLibraryController.deleteResource);
resourceLibraryRouter.get('/user/:userId', protect, resourceLibraryController.getResourcesByUserId);
resourceLibraryRouter.get('/category/:category', protect, resourceLibraryController.getResourcesByCategory);
resourceLibraryRouter.post('/share', protect, resourceLibraryController.shareResource);

module.exports = resourceLibraryRouter;