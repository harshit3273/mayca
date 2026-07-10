const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { protect, requireCA, verifyCAClientAssociation } = require('../middleware/auth');

router.get('/', protect, verifyCAClientAssociation, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'client') {
      query.client = req.user._id;
    } else if (req.user.role === 'ca') {
      if (req.query.clientId) {
        query.client = req.query.clientId;
      } else {
        const User = require('../models/User');
        const clients = await User.find({ assignedCA: req.user._id }).select('_id');
        query.client = { $in: clients.map(c => c._id) };
      }
    }
    const payments = await Payment.find(query)
      .populate('client', 'name')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, requireCA, verifyCAClientAssociation, async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, requireCA, verifyCAClientAssociation, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
