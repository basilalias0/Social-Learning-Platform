const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  fileUrl: { type: String }, // URL or text
  submissionDate: { type: Date, default: Date.now }, // Set default to current time
  grade: { type: Number },
  feedback: { type: String },
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;