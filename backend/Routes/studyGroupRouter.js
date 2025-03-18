const express = require('express');
const studyGroupRouter = express.Router();
const { protect } = require('../Middlewares/authMiddleware');
const studyGroupController = require('../Controllers/studyGroupController');
const upload = require('../Middlewares/imageUpload');

studyGroupRouter.post('/', protect, upload("groupImage").single('groupImage'), studyGroupController.createStudyGroup);
studyGroupRouter.get('/', protect, studyGroupController.getAllStudyGroups);
studyGroupRouter.get('/:id', protect, studyGroupController.getStudyGroupById);
studyGroupRouter.put('/:id', protect, upload('groupImage').single('groupImage'), studyGroupController.updateStudyGroup);
studyGroupRouter.delete('/:id', protect, studyGroupController.deleteStudyGroup);
studyGroupRouter.put('/:id/addMember', protect, studyGroupController.addMember);
studyGroupRouter.put('/:id/removeMember', protect, studyGroupController.removeMember);
studyGroupRouter.post('/invite', protect, studyGroupController.inviteUserToGroup);
studyGroupRouter.post('/join', protect, studyGroupController.joinGroup);

module.exports = studyGroupRouter;