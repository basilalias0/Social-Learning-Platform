const express = require('express');
const userRouter = express.Router();
const userController = require('../Controllers/userController');
const { protect } = require('../Middlewares/authMiddleware');
const upload = require('../Middlewares/imageUpload');

// Public Routes
userRouter.post('/register', userController.registerUser);
userRouter.post('/login', userController.loginUser);
userRouter.post('/forgot-password', userController.forgotPassword);
userRouter.put('/reset-password/:resetToken', userController.resetPassword);

// Protected Routes
userRouter.get('/profile', protect, userController.getUserProfile);
userRouter.put('/profile', protect, upload('users').single('profileImage'), userController.updateUserProfile); // Added upload middleware
userRouter.post('/friend-request', protect, userController.sendFriendRequest);
userRouter.put('/friend-request/accept', protect, userController.acceptFriendRequest);
userRouter.put('/friend-request/reject', protect, userController.rejectFriendRequest);
userRouter.post('/follow-user', protect, userController.followUser);
userRouter.post('/unfollow-user', protect, userController.unfollowUser);

module.exports = userRouter;