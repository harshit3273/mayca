const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/appointments
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'ca'
      ? { ca: req.user._id }
      : { client: req.user._id };
    const appointments = await Appointment.find(query)
      .populate('client', 'name email')
      .populate('ca', 'name email')
      .sort({ preferredDate: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/appointments - client books appointment
router.post('/', protect, async (req, res) => {
  try {
    const { preferredDate, preferredTime, description } = req.body;
    if (!preferredDate || !preferredTime)
      return res.status(400).json({ message: 'Date and time are required' });

    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can book appointments' });
    }

    const self = await User.findById(req.user._id);
    if (!self.assignedCA) {
      return res.status(403).json({ message: 'You must be assigned to a CA before booking an appointment' });
    }

    const ca = await User.findById(self.assignedCA);
    if (!ca) return res.status(404).json({ message: 'Assigned CA not found' });

    // Check if slot is booked
    const existing = await Appointment.findOne({
      ca: ca._id,
      preferredDate: new Date(preferredDate),
      preferredTime,
      status: 'confirmed'
    });
    if (existing) {
      // Find next available suggestion
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another time.' });
    }

    const appointment = await Appointment.create({
      client: req.user._id,
      ca: ca._id,
      preferredDate,
      preferredTime,
      description
    });

    // Notify CA
    await Notification.create({
      recipient: ca._id,
      title: 'New Appointment Request',
      message: `${req.user.name} requested an appointment on ${new Date(preferredDate).toDateString()} at ${preferredTime}`,
      type: 'appointment',
      relatedClient: req.user._id
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/appointments/:id - CA confirms or declines, client can cancel
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'client') {
      if (appointment.client.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
      if (status !== 'cancelled') return res.status(400).json({ message: 'Clients can only cancel appointments' });
    } else {
      if (appointment.ca.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = status;
    await appointment.save();
    appointment = await Appointment.findById(req.params.id).populate('client', 'name');

    // Notify client
    await Notification.create({
      recipient: appointment.client._id,
      title: `Appointment ${status === 'confirmed' ? 'Confirmed' : 'Declined'}`,
      message: `Your appointment on ${new Date(appointment.preferredDate).toDateString()} has been ${status}.`,
      type: 'appointment'
    });

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
