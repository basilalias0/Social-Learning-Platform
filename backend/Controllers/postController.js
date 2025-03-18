// postController.js
const DiscussionForum = require('../Models/discussionForumModel');
const asyncHandler = require('express-async-handler');
const Post = require('../Models/postModel');

const postController = {
  // Create a new post
  createPost: asyncHandler(async (req, res) => {
    const { content, forumId } = req.body;

    if (!content || !forumId) {
      return res.status(400).json({ message: 'Content and forumId are required' });
    }

    // Check if the forum exists
    const forum = await DiscussionForum.findById(forumId);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    const post = new Post({
      content,
      forumId,
      userId: req.user._id, // Set the user who created the post
    });

    const createdPost = await post.save();

    const notification = new Notification({
      userId: req.user._id,
      type: 'newPost',
      message: `You created a new post.`,
      relatedId: createdPost._id,
      relatedModel: 'Post',
    });
    await notification.save();

    res.status(201).json(createdPost);
  }),

  // Get all posts
  getAllPosts: asyncHandler(async (req, res) => {
    const posts = await Post.find().populate('userId forumId');
    res.json(posts);
  }),

  // Get post by ID
  getPostById: asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('userId forumId');
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  }),

  // Update post (only creator or admin)
  updatePost: asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (post) {
      if (req.user.role !== 'admin' && post.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this post' });
      }

      post.content = req.body.content || post.content;

      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  }),

  // Delete post (only creator or admin)
  deletePost: asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (post) {
      if (req.user.role !== 'admin' && post.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this post' });
      }

      await post.remove();
      res.json({ message: 'Post removed' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  }),

  // Get posts by forum ID
  getPostsByForumId: asyncHandler(async (req, res) => {
    const posts = await Post.find({ forumId: req.params.forumId }).populate('userId forumId');
    res.json(posts);
  }),

  // Get posts by user ID
  getPostsByUserId: asyncHandler(async (req, res) => {
    const posts = await Post.find({ userId: req.params.userId }).populate('userId forumId');
    res.json(posts);
  }),
};

module.exports = postController;