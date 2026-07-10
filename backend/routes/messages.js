const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/messages/:userId - get conversation with a user
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages - list conversations (CA sees all clients they talked with)
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name role')
      .populate('recipient', 'name role');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages - send a message
router.post('/', protect, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    if (!recipientId || !content)
      return res.status(400).json({ message: 'Recipient and content are required' });

    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) return res.status(404).json({ message: 'Recipient not found' });

    // Validate relationship
    if (req.user.role === 'client') {
      const self = await User.findById(req.user._id);
      if (self.assignedCA?.toString() !== recipientId.toString()) {
        return res.status(403).json({ message: 'Access denied: You can only message your assigned CA' });
      }
    } else if (req.user.role === 'ca') {
      if (recipientUser.role !== 'client' || recipientUser.assignedCA?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied: You can only message your assigned clients' });
      }
    } else {
      return res.status(403).json({ message: 'Admins cannot send direct messages' });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name role')
      .populate('recipient', 'name role');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
