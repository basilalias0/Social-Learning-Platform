// feedController.js
const Feed = require('../Models/feedModel');
const asyncHandler = require('express-async-handler');
const User = require('../Models/userModel');
const Gamification = require('../Models/gamificationModel');
const ResourceLibrary = require('../Models/resourceLibraryModel');
const StudyGroup = require('../Models/studyGroupModel');
const Post = require('../models/PostModel');

const feedController = {
  // Get user feed
  getUserFeed: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const feed = await Feed.findOne({ userId: req.user._id });
      if (!feed) {
        return res.status(404).json({ message: 'Feed not found' });
      }

      // Populate feed items manually
      const populatedFeedItems = await Promise.all(
        feed.feedItems.map(async (item) => {
          let populatedItem = { ...item.toObject() }; // Create a shallow copy

          switch (item.type) {
            case 'post':
              populatedItem.item = await Post.findById(item.itemId).populate('userId');
              break;
            case 'activity':
              populatedItem.item = await Post.findById(item.itemId).populate('userId'); // Assuming Activity is same as post.
              break;
            case 'badge':
              populatedItem.item = await Gamification.findById(item.itemId).populate('userId');
              break;
            case 'friend':
              populatedItem.item = await User.findById(item.itemId);
              break;
            case 'resource':
              populatedItem.item = await ResourceLibrary.findById(item.itemId).populate('userId');
              break;
            default:
              break;
          }
          return populatedItem;
        })
      );

      res.json(populatedFeedItems);
    } catch (error) {
      console.error('Get User Feed Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }),

  // Generate user feed
  generateUserFeed: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let feedItems = [];

      // Posts from followed users
      const followedUsersPosts = await Post.find({
        userId: { $in: user.followingUsers },
      }).populate('userId');
      feedItems = feedItems.concat(
        followedUsersPosts.map((post) => ({
          type: 'post',
          itemId: post._id,
          timestamp: post.createdAt,
        }))
      );

      // Group activities from followed groups
      const followedGroups = await StudyGroup.find({
        _id: { $in: user.followingGroups },
      });
      for (const group of followedGroups) {
        const groupPosts = await Post.find({
          forumId: group.forumId,
        }).populate('userId');
        feedItems = feedItems.concat(
          groupPosts.map((post) => ({
            type: 'activity',
            itemId: post._id,
            timestamp: post.createdAt,
          }))
        );
      }

      // Badges earned by followed users
      const followedUsersBadges = await Gamification.find({
        userId: { $in: user.followingUsers },
        badgeName: { $ne: null },
      }).populate('userId');

      feedItems = feedItems.concat(
        followedUsersBadges.map((badge) => ({
          type: 'badge',
          itemId: badge._id,
          timestamp: badge.createdAt,
        }))
      );

      // Friendships
      for (const friendId of user.friends) {
        const friend = await User.findById(friendId);
        if (friend) {
          feedItems.push({
            type: 'friend',
            itemId: friend._id,
            timestamp: friend.createdAt,
          });
        }
      }

      // Resources shared by followed users
      const followedUsersResources = await ResourceLibrary.find({
        userId: { $in: user.followingUsers },
      }).populate('userId');
      feedItems = feedItems.concat(
        followedUsersResources.map((resource) => ({
          type: 'resource',
          itemId: resource._id,
          timestamp: resource.createdAt,
        }))
      );

      // Sort feed items by timestamp
      feedItems.sort((a, b) => b.timestamp - a.timestamp);

      // Update or create user feed
      await Feed.findOneAndUpdate(
        { userId: req.user._id },
        { userId: req.user._id, feedItems: feedItems },
        { upsert: true, new: true }
      );

      res.json({ message: 'Feed generated successfully' });
    } catch (error) {
      console.error('Generate User Feed Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }),
};

module.exports = feedController;