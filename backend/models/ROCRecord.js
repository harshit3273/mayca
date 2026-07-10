const mongoose = require('mongoose');

const rocRecordSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, trim: true },
  cinNumber: { type: String, trim: true },
  filingType: { type: String }, // e.g., "Annual Return", "Financial Statements"
  dueDate: { type: Date },
  filedDate: { type: Date },
  status: { type: String, enum: ['filed', 'pending', 'overdue'], default: 'pending' },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

rocRecordSchema.index({ client: 1 });

module.exports = mongoose.model('ROCRecord', rocRecordSchema);
