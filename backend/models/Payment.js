const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['outstanding', 'paid', 'overdue'], default: 'outstanding' },
  dueDate: { type: Date },
  paidDate: { type: Date },
  invoiceNumber: { type: String },
  createdAt: { type: Date, default: Date.now }
});

paymentSchema.index({ client: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
