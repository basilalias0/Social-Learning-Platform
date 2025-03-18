// discussionForumController.js
// const DiscussionForum = require('../Models/discussionForumModel');
const asyncHandler = require('express-async-handler');


const discussionForumController = {
  // Create a new discussion forum
  createDiscussionForum: asyncHandler(async (req, res) => {
    const { title, description, courseId } = req.body;

    if (!title || !description || !courseId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const forum = new DiscussionForum({
      title,
      description,
      courseId,
    });

    const createdForum = await forum.save();
    res.status(201).json(createdForum);
  }),

  // Get all discussion forums
  getAllDiscussionForums: asyncHandler(async (req, res) => {
    const forums = await DiscussionForum.find().populate('courseId');
    res.json(forums);
  }),

  // Get discussion forum by ID
  getDiscussionForumById: asyncHandler(async (req, res) => {
    const forum = await DiscussionForum.findById(req.params.id).populate('courseId');
    if (forum) {
      res.json(forum);
    } else {
      res.status(404).json({ message: 'Forum not found' });
    }
  }),

  // Update discussion forum
  updateDiscussionForum: asyncHandler(async (req, res) => {
    const forum = await DiscussionForum.findById(req.params.id);

    if (forum) {
      forum.title = req.body.title || forum.title;
      forum.description = req.body.description || forum.description;
      forum.courseId = req.body.courseId || forum.courseId;

      const updatedForum = await forum.save();
      res.json(updatedForum);
    } else {
      res.status(404).json({ message: 'Forum not found' });
    }
  }),

  // Delete discussion forum
  deleteDiscussionForum: asyncHandler(async (req, res) => {
    const forum = await DiscussionForum.findById(req.params.id);

    if (forum) {
      await forum.remove();
      res.json({ message: 'Forum removed' });
    } else {
      res.status(404).json({ message: 'Forum not found' });
    }
  }),

  // Get forums by courseId
  getForumsByCourseId: asyncHandler(async(req, res)=>{
    const forums = await DiscussionForum.find({courseId: req.params.courseId}).populate('courseId');
    res.json(forums);
  })
};

module.exports = discussionForumController;