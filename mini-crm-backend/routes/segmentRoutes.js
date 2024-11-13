// routes/segmentRoutes.js
const express = require('express');
const router = express.Router();
const Segment = require('../models/Segment');
const Customer = require('../models/Customer');
const ensureAuthenticated = require('../middleware/authMiddleware');

// Calculate Audience Size
router.post('/calculate-size', ensureAuthenticated, async (req, res) => {
  try {
    const { conditions, logicOperator } = req.body;

    // Build MongoDB query dynamically
    let query = conditions.map((condition) => {
      return { [condition.field]: { [`$${condition.operator}`]: condition.value } };
    });

    let mongoOperator = logicOperator === 'AND' ? '$and' : '$or';
    let audienceSize = await Customer.countDocuments({ [mongoOperator]: query });

    res.json({ audienceSize });
  } catch (error) {
    res.status(400).json({ message: 'Error calculating audience size.', error });
  }
});

// Save Segment
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { name, conditions, logicOperator } = req.body;

    const segment = new Segment({ name, conditions, logicOperator });
    await segment.save();

    res.status(201).json(segment);
  } catch (error) {
    res.status(400).json({ message: 'Error saving segment.', error });
  }
});

module.exports = router;
