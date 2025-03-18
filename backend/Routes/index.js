const express = require('express');
const userRouter = require('./userRouter');
const router = express();


router.use("/user",userRouter)


module.exports = router