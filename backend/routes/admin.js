const express = require('express');
const router = express.Router();
const User = require('../models/User');
const GSTRecord = require('../models/GSTRecord');
const ITRRecord = require('../models/ITRRecord');
const Payment = require('../models/Payment');
const { protect, requireAdmin } = require('../middleware/auth');

// Apply middleware to all routes in this file
router.use(protect, requireAdmin);

// GET /api/admin/dashboard-stats - Get firm-wide stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalCAs = await User.countDocuments({ role: 'ca' });
    const totalClients = await User.countDocuments({ role: 'client' });
    const pendingGST = await GSTRecord.countDocuments({ status: 'pending' });
    const pendingITR = await ITRRecord.countDocuments({ status: 'pending' });
    
    const payments = await Payment.find({ status: 'pending' });
    const outstandingRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalCAs,
      totalClients,
      pendingGST,
      pendingITR,
      outstandingRevenue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/all-clients - Get ALL clients with populated CA
router.get('/all-clients', async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' })
      .select('-password')
      .populate('assignedCA', 'name email');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/cas-workload - Get CAs with client count
router.get('/cas-workload', async (req, res) => {
  try {
    const cas = await User.find({ role: 'ca' }).select('-password').lean();
    for (let ca of cas) {
      ca.clientCount = await User.countDocuments({ role: 'client', assignedCA: ca._id });
    }
    res.json(cas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/unassigned-clients - Get clients without a CA
router.get('/unassigned-clients', async (req, res) => {
  try {
    const clients = await User.find({ role: 'client', assignedCA: { $exists: false } }).select('-password');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/cas - Get list of all CAs
router.get('/cas', async (req, res) => {
  try {
    const cas = await User.find({ role: 'ca' }).select('-password');
    res.json(cas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/assign-client/:clientId - Assign client to CA
router.put('/assign-client/:clientId', async (req, res) => {
  try {
    const { caId } = req.body;
    if (!caId) return res.status(400).json({ message: 'caId is required' });

    const ca = await User.findById(caId);
    if (!ca || ca.role !== 'ca') {
      return res.status(404).json({ message: 'CA not found' });
    }

    const client = await User.findByIdAndUpdate(
      req.params.clientId,
      { assignedCA: caId },
      { new: true }
    ).select('-password');

    if (!client || client.role !== 'client') {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/ca - Create a new CA staff account
router.post('/ca', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const ca = await User.create({
      name,
      email,
      password,
      role: 'ca',
      phone
    });

    const result = ca.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/toggle-user/:id - Deactivate/Reactivate any user
router.put('/toggle-user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') {
      return res.status(404).json({ message: 'User not found or cannot be modified' });
    }
    
    // Toggle active status (defaults to true if undefined)
    user.isActive = user.isActive === undefined ? false : !user.isActive;
    await user.save();
    
    res.json({ message: 'User status toggled', user: { _id: user._id, isActive: user.isActive } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
