const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: { type: String },
  settings: {
    privacy: { type: String, enum: ['public', 'private'], default: 'public' },
    membershipRules: { type: String },
  },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);
module.exports = StudyGroup;