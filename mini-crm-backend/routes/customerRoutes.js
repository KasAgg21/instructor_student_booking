// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const ensureAuthenticated = require('../middleware/authMiddleware');

// Create a new customer
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: 'Error creating customer.', error });
  }
});

// Get all customers
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching customers.', error });
  }
});

module.exports = router;
