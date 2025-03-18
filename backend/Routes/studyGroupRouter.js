// studyGroupRoutes.js
const express = require('express');
const studyGroupRouter = express.Router();
const studyGroupController = require('../Controllers/studyGroupController');
const { protect } = require('../Middlewares/authMiddleware');

// Public Routes
studyGroupRouter.get('/', studyGroupController.getAllStudyGroups);
studyGroupRouter.get('/:id', studyGroupController.getStudyGroupById);
studyGroupRouter.get('/course/:courseId', studyGroupController.getStudyGroupsByCourseId);

// Protected Routes
studyGroupRouter.post('/', protect, studyGroupController.createStudyGroup);
studyGroupRouter.put('/:id', protect, studyGroupController.updateStudyGroup);
studyGroupRouter.delete('/:id', protect, studyGroupController.deleteStudyGroup);
studyGroupRouter.put('/:id/addMember', protect, studyGroupController.addMember);
studyGroupRouter.put('/:id/removeMember', protect, studyGroupController.removeMember);

module.exports = studyGroupRouter;