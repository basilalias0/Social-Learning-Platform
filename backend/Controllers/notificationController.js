// notificationController.js
const Notification = require('../Models/notificationModel');
const asyncHandler = require('express-async-handler');

const notificationController = {
  // Create a new notification
  createNotification: asyncHandler(async (req, res) => {
    const { userId, message, type, relatedItemId } = req.body;

    if (!userId || !message || !type) {
      return res.status(400).json({ message: 'UserId, message, and type are required' });
    }

    const notification = new Notification({
      userId,
      message,
      type,
      relatedItemId,
    });

    const createdNotification = await notification.save();
    res.status(201).json(createdNotification);
  }),

  // Get all notifications for a user
  getUserNotifications: asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 }) // Sort by latest first
      .populate('userId');
    res.json(notifications);
  }),

  // Mark a notification as read
  markNotificationAsRead: asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to mark this notification as read' });
    }

    notification.isRead = true;
    await notification.save();
    res.json({ message: 'Notification marked as read' });
  }),

  // Delete a notification
  deleteNotification: asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this notification' });
    }

    await notification.remove();
    res.json({ message: 'Notification deleted' });
  }),

  //Get all notifications (admin only).
  getAllNotifications: asyncHandler(async (req, res)=>{
    if(req.user.role !== 'admin'){
      return res.status(403).json({message: "Not authorized to access all notifications"});
    }
    const notifications = await Notification.find().populate('userId');
    res.json(notifications);
  })
};

module.exports = notificationController;