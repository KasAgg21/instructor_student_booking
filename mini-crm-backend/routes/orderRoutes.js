// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const ensureAuthenticated = require('../middleware/authMiddleware');
const Queue = require('bull');

// Initialize Bull Queue
const orderQueue = new Queue('orderQueue', process.env.REDIS_URL);

// Add job to queue when creating a new order
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    // Push the order data to the queue for processing
    await orderQueue.add(req.body);
    res.status(201).json({ message: 'Order is being processed.' });
  } catch (error) {
    res.status(400).json({ message: 'Error creating order.', error });
  }
});

// Get all orders
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find().populate('customerId');
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching orders.', error });
  }
});

module.exports = router;
