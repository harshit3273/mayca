const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = ['http://localhost:3000', process.env.FRONTEND_URL];
app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // prevent NoSQL injection

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { message: 'Too many requests, please try again later.' }
});

// Static files for uploads (served via authenticated API only)
app.use('/uploads', (req, res) => res.status(403).json({ message: 'Access denied' }));

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/gst', require('./routes/gst'));
app.use('/api/itr', require('./routes/itr'));
app.use('/api/tds', require('./routes/tds'));
app.use('/api/roc', require('./routes/roc'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/admin', require('./routes/admin'));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
