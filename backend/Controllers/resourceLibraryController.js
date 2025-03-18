// resourceLibraryController.js
const ResourceLibrary = require('../Models/resourceLibraryModel');
const asyncHandler = require('express-async-handler');

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
};

module.exports = resourceLibraryController;