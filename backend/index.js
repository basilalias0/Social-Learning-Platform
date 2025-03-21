require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const Socket = require('./utils/chatSocket');
const errorHandler = require('./Middlewares/errorHandler'); // Your error handler middleware
const router  = require('./Routes');


const app = express();
const server = http.createServer(app);

// Middleware
const corsOptions = {
    origin: 'http://localhost:3001',
    credentials: true,
    optionSuccessStatus: 200
    };
app.use(cors(corsOptions));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

Socket.setupSocket(server);
Socket.runScheduledTasks()
// Routes
app.use('/api/v1', router);

// Error Handler Middleware
app.use(errorHandler);

// Start Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});