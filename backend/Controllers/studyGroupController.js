// studyGroupController.js
const StudyGroup = require('../Models/studyGroupModel');
const DiscussionForum = require('../Models/discussionForumModel');
const asyncHandler = require('express-async-handler');

const studyGroupController = {
  // Create a new study group
  createStudyGroup: asyncHandler(async (req, res) => {
    const { name, description, courseId } = req.body;

    if (!name || !courseId) {
      return res.status(400).json({ message: 'Name and courseId are required' });
    }

    // Create a corresponding discussion forum for the study group
    const forum = new DiscussionForum({
      title: `${name} Forum`,
      description: `Discussion forum for ${name}`,
      courseId: courseId,
    });

    const createdForum = await forum.save();

    const studyGroup = new StudyGroup({
      name,
      description,
      courseId,
      forumId: createdForum._id, // Link the forum ID
      members: [req.user._id], // Add the creator as a member
    });

    const createdStudyGroup = await studyGroup.save();
    res.status(201).json(createdStudyGroup);
  }),

  // Get all study groups
  getAllStudyGroups: asyncHandler(async (req, res) => {
    const studyGroups = await StudyGroup.find().populate('courseId members forumId');
    res.json(studyGroups);
  }),

  // Get study group by ID
  getStudyGroupById: asyncHandler(async (req, res) => {
    const studyGroup = await StudyGroup.findById(req.params.id).populate('courseId members forumId');
    if (studyGroup) {
      res.json(studyGroup);
    } else {
      res.status(404).json({ message: 'Study group not found' });
    }
  }),

  // Update study group (only creator or admin)
  updateStudyGroup: asyncHandler(async (req, res) => {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (studyGroup) {
      if (req.user.role !== 'admin' && !studyGroup.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'You are not authorized to update this study group' });
      }

      studyGroup.name = req.body.name || studyGroup.name;
      studyGroup.description = req.body.description || studyGroup.description;

      const updatedStudyGroup = await studyGroup.save();
      res.json(updatedStudyGroup);
    } else {
      res.status(404).json({ message: 'Study group not found' });
    }
  }),

  // Delete study group (only creator or admin)
  deleteStudyGroup: asyncHandler(async (req, res) => {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (studyGroup) {
      if (req.user.role !== 'admin' && !studyGroup.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'You are not authorized to delete this study group' });
      }

      // Delete the associated forum
      await DiscussionForum.findByIdAndDelete(studyGroup.forumId);

      await studyGroup.remove();
      res.json({ message: 'Study group removed' });
    } else {
      res.status(404).json({ message: 'Study group not found' });
    }
  }),

  // Add member to study group
  addMember: asyncHandler(async (req, res) => {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (studyGroup) {
      if (!studyGroup.members.includes(req.body.userId)) {
        studyGroup.members.push(req.body.userId);
        await studyGroup.save();
        res.json({ message: 'Member added' });
      } else {
        res.status(400).json({message: "User is already a member."});
      }
    } else {
      res.status(404).json({ message: 'Study group not found' });
    }
  }),

  // Remove member from study group
  removeMember: asyncHandler(async (req, res) => {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (studyGroup) {
      const index = studyGroup.members.indexOf(req.body.userId);
      if (index > -1) {
        studyGroup.members.splice(index, 1);
        await studyGroup.save();
        res.json({ message: 'Member removed' });
      } else {
        res.status(404).json({message: "User is not a member of this group."});
      }
    } else {
      res.status(404).json({ message: 'Study group not found' });
    }
  }),

  //Get Study Groups by course Id
  getStudyGroupsByCourseId: asyncHandler(async(req, res)=>{
    const studyGroups = await StudyGroup.find({courseId: req.params.courseId}).populate('courseId members forumId');
    res.json(studyGroups);
  })
};

module.exports = studyGroupController;