const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, requireCA } = require('../middleware/auth');

// GET /api/clients - list all clients (CA only)
router.get('/', protect, requireCA, async (req, res) => {
  try {
    const { search, page = 1, limit = 10, showInactive } = req.query;
    const query = { role: 'client', assignedCA: req.user._id };

    // By default only show active clients; pass showInactive=true to see all
    if (showInactive !== 'true') query.isActive = true;

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { pan: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
        { businessName: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const clients = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ clients, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/clients/:id - get single client with all records
router.get('/:id', protect, requireCA, async (req, res) => {
  try {
    const client = await User.findById(req.params.id).select('-password');
    if (!client || client.role !== 'client')
      return res.status(404).json({ message: 'Client not found' });
    if (client.assignedCA?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied: Client not assigned to you' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/clients - create new client
router.post('/', protect, requireCA, async (req, res) => {
  try {
    const { name, email, password, phone, pan, businessName, address } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' });

    // PAN format validation
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan))
      return res.status(400).json({ message: 'Invalid PAN format. Must be like ABCDE1234F' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const client = await User.create({
      name, email, password, phone, pan, businessName, address,
      role: 'client', assignedCA: req.user._id
    });
    const result = client.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/clients/:id - update client info
router.put('/:id', protect, requireCA, async (req, res) => {
  try {
    const { name, phone, pan, businessName, address, isActive } = req.body;

    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan))
      return res.status(400).json({ message: 'Invalid PAN format. Must be like ABCDE1234F' });

    const existingClient = await User.findById(req.params.id);
    if (!existingClient || existingClient.role !== 'client')
      return res.status(404).json({ message: 'Client not found' });
    if (existingClient.assignedCA?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied: Client not assigned to you' });

    const client = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, pan, businessName, address, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/clients/:id - soft or hard delete (handled below)

// PUT /api/clients/:id/restore - reactivate a deactivated client
router.put('/:id/restore', protect, requireCA, async (req, res) => {
  try {
    const existingClient = await User.findById(req.params.id);
    if (!existingClient || existingClient.role !== 'client')
      return res.status(404).json({ message: 'Client not found' });
    if (existingClient.assignedCA?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied: Client not assigned to you' });

    const client = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/clients/:id - soft delete (deactivate) or hard delete
router.delete('/:id', protect, requireCA, async (req, res) => {
  try {
    const { hard } = req.query;
    const client = await User.findById(req.params.id);
    if (!client || client.role !== 'client')
      return res.status(404).json({ message: 'Client not found' });
    if (client.assignedCA?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied: Client not assigned to you' });

    if (hard === 'true') {
      await User.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Client permanently deleted' });
    }
    client.isActive = false;
    await client.save();
    res.json({ message: 'Client deactivated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
