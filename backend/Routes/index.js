const express = require('express');
const userRouter = require('./userRouter');
const assignmentRouter = require('./assignmentRouter');
const router = express();


router.use("/user",userRouter)
router.use("/assignment",assignmentRouter)

module.exports = router