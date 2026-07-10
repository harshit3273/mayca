const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, verifyCAClientAssociation } = require('../middleware/auth');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG, and XLSX are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// GET /api/documents/download/:id  ← must be BEFORE /:id
router.get('/download/:id', protect, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (req.user.role === 'client') {
      if (doc.client.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    } else {
      const docClient = await User.findById(doc.client);
      if (!docClient || docClient.assignedCA?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied: Client not assigned to you' });
      }
    }

    if (!require('fs').existsSync(doc.filePath))
      return res.status(404).json({ message: 'File not found on server' });

    res.download(doc.filePath, doc.originalName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/documents - list documents for a client
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
    const docs = await Document.find(query)
      .populate('uploadedBy', 'name')
      .populate('client', 'name')
      .sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/documents/upload
router.post('/upload', protect, upload.single('file'), verifyCAClientAssociation, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const clientId = req.user.role === 'client' ? req.user._id : req.body.clientId;
    const doc = await Document.create({
      client: clientId,
      uploadedBy: req.user._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: path.extname(req.file.originalname).toLowerCase(),
      fileSize: req.file.size,
      filePath: req.file.path,
      category: req.body.category || 'general',
      description: req.body.description || ''
    });

    // Notify CA if client uploaded
    if (req.user.role === 'client') {
      const clientUser = await User.findById(req.user._id);
      if (clientUser && clientUser.assignedCA) {
        await Notification.create({
          recipient: clientUser.assignedCA,
          title: 'New Document Uploaded',
          message: `${req.user.name} uploaded a new document: ${req.file.originalname}`,
          type: 'document',
          relatedClient: req.user._id
        });
      }
    }

    res.status(201).json(doc);
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ message: 'File size exceeds 10MB limit' });
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
