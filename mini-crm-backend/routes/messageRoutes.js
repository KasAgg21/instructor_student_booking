// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const CommunicationsLog = require('../models/CommunicationsLog');
const ensureAuthenticated = require('../middleware/authMiddleware');
const axios = require('axios');

// Dummy API to send personalized messages
router.post('/send', ensureAuthenticated, async (req, res) => {
  try {
    const { campaignId, messageTemplate } = req.body;

    // Fetch communications logs for the campaign
    const logs = await CommunicationsLog.find({ campaignId, status: 'PENDING' });

    logs.forEach((log) => {
      // Simulate sending message by calling the delivery receipt API
      axios.post(`${req.protocol}://${req.get('host')}/messages/delivery-receipt`, {
        logId: log._id,
      });
    });

    res.json({ message: 'Messages are being sent.' });
  } catch (error) {
    res.status(400).json({ message: 'Error sending messages.', error });
  }
});

// Delivery Receipt API
router.post('/delivery-receipt', async (req, res) => {
  try {
    const { logId } = req.body;

    // Randomly determine the delivery status
    const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';

    // Update the communication log
    await CommunicationsLog.findByIdAndUpdate(logId, { status });

    res.json({ message: `Message ${status}` });
  } catch (error) {
    res.status(400).json({ message: 'Error updating delivery status.', error });
  }
});

module.exports = router;
