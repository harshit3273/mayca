const mongoose = require('mongoose');

const itrRecordSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentYear: { type: String }, // e.g., "2024-25"
  status: { type: String, enum: ['filed', 'pending', 'overdue'], default: 'pending' },
  filedDate: { type: Date },
  dueDate: { type: Date },
  refundStatus: { type: String, enum: ['not_applicable', 'pending', 'processed', 'rejected'], default: 'not_applicable' },
  refundAmount: { type: Number, default: 0 },
  itrType: { type: String, default: 'ITR-1' },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

itrRecordSchema.index({ client: 1 });

module.exports = mongoose.model('ITRRecord', itrRecordSchema);
