// resourceLibraryModel.js
const mongoose = require('mongoose');

const resourceLibrarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String }, // e.g., "PDF," "Video," "Document"
}, { timestamps: true });

const ResourceLibrary = mongoose.model('ResourceLibrary', resourceLibrarySchema);

module.exports = ResourceLibrary;