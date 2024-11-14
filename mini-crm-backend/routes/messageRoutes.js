const express = require('express');
const router = express.Router();
const CommunicationsLog = require('../models/CommunicationsLog');
const ensureAuthenticated = require('../middleware/authMiddleware');
const axios = require('axios');

router.post('/send', ensureAuthenticated, async (req, res) => {
  try {
    const { campaignId, messageTemplate } = req.body;

    const logs = await CommunicationsLog.find({ campaignId, status: 'PENDING' });

    logs.forEach((log) => {
      axios.post(`${req.protocol}://${req.get('host')}/messages/delivery-receipt`, {
        logId: log._id,
      });
    });

    res.json({ message: 'Messages are being sent.' });
  } catch (error) {
    res.status(400).json({ message: 'Error sending messages.', error });
  }
});

router.post('/delivery-receipt', async (req, res) => {
  try {
    const { logId } = req.body;

    const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';

    await CommunicationsLog.findByIdAndUpdate(logId, { status });

    res.json({ message: `Message ${status}` });
  } catch (error) {
    res.status(400).json({ message: 'Error updating delivery status.', error });
  }
});

module.exports = router;
