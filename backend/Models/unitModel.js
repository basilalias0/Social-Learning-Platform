const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: mongoose.Schema.Types.Mixed }, // Allows various data types
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
}, { timestamps: true });

const Unit = mongoose.model('Unit', unitSchema);
module.exports = Unit;