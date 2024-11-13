// routes/campaignRoutes.js
const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const CommunicationsLog = require('../models/CommunicationsLog');
const ensureAuthenticated = require('../middleware/authMiddleware');
const Segment = require('../models/Segment');
const Customer = require('../models/Customer');
const axios = require('axios');
const Queue = require('bull');

// Initialize Bull Queue for Delivery Receipts
const deliveryQueue = new Queue('deliveryQueue', process.env.REDIS_URL);

// Create a new campaign and send messages
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { name, segmentId, messageTemplate } = req.body;

    // Create a new campaign
    const campaign = new Campaign({ name, segmentId });
    await campaign.save();

    // Fetch the segment conditions
    const segment = await Segment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found.' });
    }

    // Build query based on segment conditions
    let query = segment.conditions.map((condition) => {
      return { [condition.field]: { [`$${condition.operator}`]: condition.value } };
    });

    let mongoOperator = segment.logicOperator === 'AND' ? '$and' : '$or';
    const customers = await Customer.find({ [mongoOperator]: query });

    // Create communications log entries
    const communicationsLogs = customers.map((customer) => ({
      customerId: customer._id,
      campaignId: campaign._id,
      message: messageTemplate.replace('[Name]', customer.name),
    }));

    await CommunicationsLog.insertMany(communicationsLogs);

    // Send messages by adding jobs to the delivery queue
    communicationsLogs.forEach((log) => {
      deliveryQueue.add({ logId: log._id });
    });

    res.status(201).json({ message: 'Campaign created and messages are being sent.' });
  } catch (error) {
    res.status(400).json({ message: 'Error creating campaign.', error });
  }
});

// Get all campaigns
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ date: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching campaigns.', error });
  }
});

// Get Campaign Stats
router.get('/:campaignId/stats', ensureAuthenticated, async (req, res) => {
  try {
    const { campaignId } = req.params;

    const audienceSize = await CommunicationsLog.countDocuments({ campaignId });
    const sent = await CommunicationsLog.countDocuments({ campaignId, status: 'SENT' });
    const failed = await CommunicationsLog.countDocuments({ campaignId, status: 'FAILED' });

    res.json({ audienceSize, sent, failed });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching campaign stats.', error });
  }
});

module.exports = router;
