const express = require('express');
const resourceRouter = express.Router();
const resourceLibraryController = require('../Controllers/resourceLibraryController');
const { protect } = require('../Middlewares/authMiddleware');
const upload = require('../Middlewares/upload');
const asyncHandler = require('express-async-handler');
const ResourceLibrary = require('../Models/resourceLibraryModel');

resourceRouter.post(
  '/',
  protect,
  upload('resources').single('file'),
  resourceLibraryController.createResource
);

resourceRouter.put(
  '/:id',
  protect,
  upload('resources').single('file'),
  resourceLibraryController.updateResource
);

resourceRouter.get('/', resourceLibraryController.getAllResources);
resourceRouter.get('/:id', resourceLibraryController.getResourceById);
resourceRouter.delete('/:id', protect, resourceLibraryController.deleteResource);
resourceRouter.get('/user/:userId', resourceLibraryController.getResourcesByUserId);
resourceRouter.get('/category/:category', resourceLibraryController.getResourcesByCategory);
resourceRouter.post('/share', protect, resourceLibraryController.shareResource);
resourceRouter.get('/search', protect, resourceLibraryController.searchResources);

module.exports = resourceRouter;