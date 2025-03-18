const express = require('express');
const userRouter = require('./userRouter');
const assignmentRouter = require('./assignmentRouter');
const chatMessageRouter = require('./chatMessageRouter');
const courseRouter = require('./courseRouter');
const discussionForumRouter = require('./discussionForumRouter');
const feedbackRouter = require('./feedbackRouter');
const feedRouter = require('./feedRouter');
const gamificationRouter = require('./gamificationRouter');
const resourceLibraryRouter = require('./resourceLibraryRouter');
const moduleRouter = require('./moduleRouter');
const notificationRouter = require('./notificationRouter');
const postRouter = require('./postRouter');
const questionRouter = require('./questionRouter');
const quizRouter = require('./quizRouter');
const replyRouter = require('./replyRouter');
const router = express();


router.use("/user",userRouter)
router.use("/assignment",assignmentRouter)
router.use("/chat",chatMessageRouter)
router.use('/course',courseRouter)
router.use("/discussion-forum",discussionForumRouter)
router.use("/feedback",feedbackRouter)
router.use("/feed",feedRouter)
router.use("/gamification",gamificationRouter)
router.use("/resource-library",resourceLibraryRouter)
router.use("/module",moduleRouter)
router.use("/notification",notificationRouter)
router.use("/post",postRouter)
router.use("/question",questionRouter)
router.use("/quiz",quizRouter)
router.use("/reply",replyRouter)



module.exports = router