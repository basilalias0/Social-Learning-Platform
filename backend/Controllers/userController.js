const User = require('../Models/userModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const validator = require('validator');
const Notification = require('../Models/notificationModel');
const Feed = require('../Models/feedModel');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const Post = require('../Models/postModel');
const StudyGroup = require('../Models/studyGroupModel');
const Gamification = require('../Models/gamificationModel');
const ResourceLibrary = require('../Models/resourceLibraryModel');

const userController = {
  // Register a new user
  registerUser: asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    // Input Validation
    if (!username || !email || !password || !role) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    if (!validator.isEmail(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        res.status(409).json({ message: 'User with this email already exists' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role,
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, user.role, user.username, user.email),
        });
      } else {
        res.status(500).json({ message: 'Failed to create user' });
      }
    } catch (error) {
      console.error('User Registration Error:', error);
      res.status(500).json({ message: 'Internal server error during registration' });
    }
  }),

  // Login user
  loginUser: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    if (!validator.isEmail(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    try {
      const user = await User.findOne({ email });

      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, user.role,user.username,user.email),
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error('User Login Error:', error);
      res.status(500).json({ message: 'Internal server error during login' });
    }
  }),

  // Get user profile
  getUserProfile: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Get User Profile Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }),

  // Update user profile
  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/user/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the link to reset the password: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
      });

      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ message: 'Email sending failed' });
    }
  }),

  // Reset Password
  resetPassword: asyncHandler(async (req, res) => {
 
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
  
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token or token expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  }),

  // Update user profile with image upload
  updateUserProfile: asyncHandler(async (req, res) => {
    const { username, email, password, profile } = req.body;

    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password && password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(409).json({ message: 'Email is already taken by another user' });
        }
      }

      user.username = username || user.username;
      user.email = email || user.email;
      user.profile = profile || user.profile;

      if (req.file) { // Check if a file was uploaded
        user.profile.profilePicture = req.file.path; // Assuming req.file.path contains the Cloudinary URL or file path
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        token: generateToken(updatedUser._id, updatedUser.role, updatedUser.username,updatedUser.email),
      });
    } catch (error) {
      console.error('Update User Profile Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }),
  // Send friend request
  sendFriendRequest: asyncHandler(async (req, res) => {
    const { friendId } = req.body;
    try {
      const user = await User.findById(req.user._id);
      const friend = await User.findById(friendId);

      if (!user || !friend) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.friends.includes(friendId)) {
        return res.status(400).json({ message: 'User is already a friend' });
      }

      if (user.friendRequests.includes(friendId)) {
        return res.status(400).json({message: "Friend request already sent."});
      }

      if (friend.friendRequests.includes(req.user._id)) {
        return res.status(400).json({message: "You already have a friend request from this user."});
      }

      friend.friendRequests.push(req.user._id);
      await friend.save();

      const notification = new Notification({
        userId: friendId,
        type: 'friendRequest',
        message: `${user.username} sent you a friend request.`,
        relatedId: req.user._id,
        relatedModel: 'User',
      });
      await notification.save();

      res.json({ message: 'Friend request sent successfully' });
    } catch (error) {
      console.error('Send Friend Request Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }),

  // Accept friend request
  acceptFriendRequest: asyncHandler(async (req, res) => {
    const { friendId } = req.body;
    try {
      const user = await User.findById(req.user._id);
      const friend = await User.findById(friendId);

      if (!user || !friend) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.friendRequests.includes(friendId)) {
        return res.status(400).json({ message: 'Friend request not found' });
      }

      user.friendRequests = user.friendRequests.filter((id) => id.toString() !== friendId.toString());
      user.friends.push(friendId);
      friend.friends.push(req.user._id);

      await user.save();
      await friend.save();

      const notification = new Notification({
        userId: friendId,
        type: 'friendRequestAccepted',
        message: `${user.username} accepted your friend request.`,
        relatedId: req.user._id,
        relatedModel: 'User',
      });
      await notification.save();

      res.json({ message: 'Friend request accepted successfully' });
    } catch (error) {
      console.error('Accept Friend Request Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }),

  // Reject friend request
  rejectFriendRequest: asyncHandler(async (req, res) => {
    const { friendId } = req.body;
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.friendRequests.includes(friendId)) {
        return res.status(400).json({ message: 'Friend request not found' });
      }

      user.friendRequests = user.friendRequests.filter((id) => id.toString() !== friendId.toString());
      await user.save();

      res.json({ message: 'Friend request rejected successfully' });
    } catch (error) {
      console.error('Reject Friend Request Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }),
  // follow user
  followUser: asyncHandler(async(req,res)=>{
    const {userId} = req.body;
    if(!userId){
      return res.status(400).json({message:'User ID is required'});
    }
    try{
      const user = await User.findById(req.user._id);
      const followUser = await User.findById(userId);
      
      if(!user || !followUser){
        return res.status(404).json({message: "User not found"});
      }
      if(user.followingUsers.includes(userId)){
        return res.status(400).json({message: "User is already following"});
      }
      user.followingUsers.push(userId);
      await user.save();

      const notification = new Notification({
        userId: userId,
        type: 'newPost', // Or a more specific notification type
        message: `${user.username} started following you.`,
        relatedId: req.user._id,
        relatedModel: 'User',
      });
      await notification.save();
      
      res.json({message: "User followed successfully"});
    }catch(error){
      console.error('Follow User Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }),
  // unfollow user
  unfollowUser: asyncHandler(async(req,res)=>{
    const {userId} = req.body;
    try{
      const user = await User.findById(req.user._id);
      if(!user){
        return res.status(404).json({message: "User not found"});
      }
      if(!user.followingUsers.includes(userId)){
        return res.status(400).json({message: "User is not following"});
      }
      user.followingUsers = user.followingUsers.filter(id=>id.toString() !== userId);
      await user.save();
      res.json({message: "User unfollowed successfully"});
    }catch(error){
      console.error('Unfollow User Error:', error);
      res.status(500).json({ message: 'Internal server error'})
  }
  }),
  // get user feed
  getUserFeed: asyncHandler(async(req,res)=>{
    try{
      const user = await User.findById(req.user._id);
      if(!user){
        return res.status(404).json({message: "User not found"});
      }
      const feed = await Feed.findOne({userId: req.user._id}).populate({
        path: 'feedItems.itemId',
        populate: {
          path: 'userId senderId'
        }
      });
      if(!feed){
        return res.status(404).json({message: "Feed not found"});
      }
      res.json(feed.feedItems);
    }catch(error){
      console.error('Get User Feed Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }),
};

module.exports = userController;