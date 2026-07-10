const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  filePath: { type: String, required: true },
  category: { type: String, default: 'general' }, // e.g., "gst", "itr", "general"
  description: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

documentSchema.index({ client: 1 });

module.exports = mongoose.model('Document', documentSchema);
