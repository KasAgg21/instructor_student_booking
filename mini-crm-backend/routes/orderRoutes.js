const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const ensureAuthenticated = require('../middleware/authMiddleware');
const Queue = require('bull');

const orderQueue = new Queue('orderQueue', process.env.REDIS_URL);

router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    await orderQueue.add(req.body);
    res.status(201).json({ message: 'Order is being processed.' });
  } catch (error) {
    res.status(400).json({ message: 'Error creating order.', error });
  }
});

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find().populate('customerId');
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching orders.', error });
  }
});

module.exports = router;
