const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  units: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' }],
}, { timestamps: true });

const Module = mongoose.model('Module', moduleSchema);
module.exports = Module;