const express = require('express');
const router = express.Router();
const User = require('../models/User');
const GSTRecord = require('../models/GSTRecord');
const ITRRecord = require('../models/ITRRecord');
const TDSRecord = require('../models/TDSRecord');
const ROCRecord = require('../models/ROCRecord');
const Payment = require('../models/Payment');
const Document = require('../models/Document');
const { protect, requireCA } = require('../middleware/auth');

// GET /api/dashboard/ca-summary
router.get('/ca-summary', protect, requireCA, async (req, res) => {
  try {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Get all clients assigned to this CA
    const clients = await User.find({ role: 'client', assignedCA: req.user._id }).select('_id');
    const clientIds = clients.map(c => c._id);

    const [
      totalClients,
      pendingGST,
      pendingITR,
      tdsDue,
      pendingROC,
      payments,
      docRequests
    ] = await Promise.all([
      User.countDocuments({ role: 'client', isActive: true, assignedCA: req.user._id }),
      GSTRecord.countDocuments({ status: 'pending', client: { $in: clientIds } }),
      ITRRecord.countDocuments({ status: 'pending', client: { $in: clientIds } }),
      TDSRecord.countDocuments({ status: 'pending', dueDate: { $lte: in30Days }, client: { $in: clientIds } }),
      ROCRecord.countDocuments({ status: 'pending', client: { $in: clientIds } }),
      Payment.aggregate([
        { $match: { status: 'outstanding', client: { $in: clientIds } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Document.countDocuments({ category: 'request', client: { $in: clientIds } })
    ]);

    const outstandingPayments = payments.length > 0 ? payments[0].total : 0;

    // Monthly GST stats for chart (current year)
    const currentYear = now.getFullYear();
    const monthlyGST = await GSTRecord.aggregate([
      {
        $match: {
          client: { $in: clientIds },
          lastFiledDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          },
          status: 'filed'
        }
      },
      {
        $group: {
          _id: { $month: '$lastFiledDate' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Compliance distribution for pie chart
    const complianceStats = await GSTRecord.aggregate([
      { $match: { client: { $in: clientIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      totalClients,
      pendingGST,
      pendingITR,
      tdsDue,
      pendingROC,
      outstandingPayments,
      docRequests,
      monthlyGST,
      complianceStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
