const mongoose = require('mongoose');

const gstRecordSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gstNumber: { type: String, trim: true },
  filingPeriod: { type: String }, // e.g., "Oct 2024"
  status: { type: String, enum: ['filed', 'pending', 'overdue'], default: 'pending' },
  lastFiledDate: { type: Date },
  nextDueDate: { type: Date },
  returnType: { type: String, default: 'GSTR-3B' },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

gstRecordSchema.index({ client: 1 });

module.exports = mongoose.model('GSTRecord', gstRecordSchema);
