const express = require('express');
const userRouter = require('./userRouter');
const assignmentRouter = require('./assignmentRouter');
const chatMessageRouter = require('./chatMessageRouter');
const courseRouter = require('./courseRouter');
const discussionForumRouter = require('./discussionForumRouter');
const router = express();


router.use("/user",userRouter)
router.use("/assignment",assignmentRouter)
router.use("/chat",chatMessageRouter)
router.use('/course',courseRouter)
router.use("/discussion-forum",discussionForumRouter)

module.exports = router