// feedRoutes.js
const express = require('express');
const feedRouter = express.Router();
const feedController = require('../Controllers/feedController');
const { protect } = require('../Middlewares/authMiddleware');

// Protected Routes
feedRouter.get('/', protect, feedController.getUserFeed);
feedRouter.post('/generate', protect, feedController.generateUserFeed);

module.exports = feedRouter;