const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['ca', 'client', 'admin'], required: true },
  phone: { type: String, trim: true },
  // For clients: reference to their assigned CA
  assignedCA: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // For clients: PAN number (format: ABCDE1234F — 5 letters, 4 digits, 1 letter)
  pan: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: (v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v),
      message: 'Invalid PAN format. Must be 10 characters like ABCDE1234F'
    }
  },
  // Client-specific profile info
  businessName: { type: String, trim: true },
  address: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ assignedCA: 1 });

module.exports = mongoose.model('User', userSchema);
