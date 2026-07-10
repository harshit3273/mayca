const mongoose = require('mongoose');

const tdsRecordSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quarter: { type: String }, // e.g., "Q1 2024-25"
  dueDate: { type: Date },
  amountDue: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  section: { type: String }, // e.g., "194C"
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

tdsRecordSchema.index({ client: 1, dueDate: 1 });

module.exports = mongoose.model('TDSRecord', tdsRecordSchema);
