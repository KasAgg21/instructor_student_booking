// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('./auth');
const dotenv = require('dotenv');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const segmentRoutes = require('./routes/segmentRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const messageRoutes = require('./routes/messageRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/orders', orderRoutes);
app.use('/segments', segmentRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/messages', messageRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
