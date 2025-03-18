// resourceLibraryController.js
const ResourceLibrary = require('../Models/resourceLibraryModel');
const Notification = require('../Models/notificationModel');
const asyncHandler = require('express-async-handler');
const User = require('../Models/userModel'); // Import User model

const resourceLibraryController = {
  // Create a new resource
  createResource: asyncHandler(async (req, res) => {
    const { title, description, fileUrl, category } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({ message: 'Title and fileUrl are required' });
    }

    const resource = new ResourceLibrary({
      title,
      description,
      fileUrl,
      userId: req.user._id, // Set the user who created the resource
      category,
    });

    const createdResource = await resource.save();
    res.status(201).json(createdResource);
  }),

  // Get all resources
  getAllResources: asyncHandler(async (req, res) => {
    const resources = await ResourceLibrary.find().populate('userId');
    res.json(resources);
  }),

  // Get resource by ID
  getResourceById: asyncHandler(async (req, res) => {
    const resource = await ResourceLibrary.findById(req.params.id).populate('userId');
    if (resource) {
      res.json(resource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  }),

  // Update resource (only creator or admin)
  updateResource: asyncHandler(async (req, res) => {
    const resource = await ResourceLibrary.findById(req.params.id);

    if (resource) {
      if (req.user.role !== 'admin' && resource.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this resource' });
      }

      resource.title = req.body.title || resource.title;
      resource.description = req.body.description || resource.description;
      resource.fileUrl = req.body.fileUrl || resource.fileUrl;
      resource.category = req.body.category || resource.category;

      const updatedResource = await resource.save();
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  }),

  // Delete resource (only creator or admin)
  deleteResource: asyncHandler(async (req, res) => {
    const resource = await ResourceLibrary.findById(req.params.id);

    if (resource) {
      if (req.user.role !== 'admin' && resource.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this resource' });
      }

      await resource.remove();
      res.json({ message: 'Resource removed' });
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  }),

  // Get resources by user ID
  getResourcesByUserId: asyncHandler(async (req, res) => {
    const resources = await ResourceLibrary.find({ userId: req.params.userId }).populate('userId');
    res.json(resources);
  }),

  // Get resources by category
  getResourcesByCategory: asyncHandler(async (req, res) => {
    const resources = await ResourceLibrary.find({ category: req.params.category }).populate('userId');
    res.json(resources);
  }),

  // Share resource with user
  shareResource: asyncHandler(async (req, res) => {
    const { resourceId, userId } = req.body;

    try {
      const resource = await ResourceLibrary.findById(resourceId);
      const user = await User.findById(userId);

      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Add logic to store shared resources in the user's profile
      if (!user.sharedResources) {
        user.sharedResources = [];
      }

      if (user.sharedResources.includes(resourceId)) {
        return res.status(400).json({ message: 'Resource already shared with user' });
      }

      user.sharedResources.push(resourceId);
      await user.save();

      const notification = new Notification({
        userId: userId,
        type: 'resourceShared',
        message: `The resource "${resource.title}" was shared with you.`,
        relatedId: resourceId,
        relatedModel: 'Resource',
      });
      await notification.save();

      res.json({ message: 'Resource shared successfully' });
    } catch (error) {
      console.error('Sharing error:', error);
      res.status(500).json({ message: 'Internal server error during sharing' });
    }
  }),
};

module.exports = resourceLibraryController;