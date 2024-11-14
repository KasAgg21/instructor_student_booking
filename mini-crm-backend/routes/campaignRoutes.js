const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const CommunicationsLog = require('../models/CommunicationsLog');
const ensureAuthenticated = require('../middleware/authMiddleware');
const Segment = require('../models/Segment');
const Customer = require('../models/Customer');
const axios = require('axios');
const Queue = require('bull');

const deliveryQueue = new Queue('deliveryQueue', process.env.REDIS_URL);

router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { name, segmentId, messageTemplate } = req.body;

    const campaign = new Campaign({ name, segmentId });
    await campaign.save();

    const segment = await Segment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found.' });
    }

    let query = segment.conditions.map((condition) => {
      return { [condition.field]: { [`$${condition.operator}`]: condition.value } };
    });

    let mongoOperator = segment.logicOperator === 'AND' ? '$and' : '$or';
    const customers = await Customer.find({ [mongoOperator]: query });

    const communicationsLogs = customers.map((customer) => ({
      customerId: customer._id,
      campaignId: campaign._id,
      message: messageTemplate.replace('[Name]', customer.name),
    }));

    await CommunicationsLog.insertMany(communicationsLogs);

    communicationsLogs.forEach((log) => {
      deliveryQueue.add({ logId: log._id });
    });

    res.status(201).json({ message: 'Campaign created and messages are being sent.' });
  } catch (error) {
    res.status(400).json({ message: 'Error creating campaign.', error });
  }
});

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ date: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching campaigns.', error });
  }
});

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
