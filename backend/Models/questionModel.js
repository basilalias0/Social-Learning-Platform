const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;