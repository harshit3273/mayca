const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ca: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'declined', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

appointmentSchema.index({ ca: 1, preferredDate: 1 });
appointmentSchema.index({ client: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
