// workers/orderWorker.js
const Queue = require('bull');
const Order = require('../models/Order');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Bull Queue
const orderQueue = new Queue('orderQueue', process.env.REDIS_URL);

console.log("Order Worker: Connecting to Redis at", process.env.REDIS_URL);

// Event Listeners for Debugging
orderQueue.on('error', (error) => {
  console.error('Order Worker: Queue Error:', error);
});

orderQueue.on('ready', () => {
  console.log('Order Worker: Queue is ready');
});

orderQueue.on('waiting', (jobId) => {
  console.log(`Order Worker: Job waiting with ID ${jobId}`);
});

orderQueue.on('active', (job, jobPromise) => {
  console.log(`Order Worker: Processing job ID ${job.id}`);
});

orderQueue.on('completed', (job, result) => {
  console.log(`Order Worker: Completed job ID ${job.id}`);
});

orderQueue.on('failed', (job, err) => {
  console.log(`Order Worker: Failed job ID ${job.id} with error:`, err);
});

// Process order jobs
orderQueue.process(async (job, done) => {
  try {
    console.log(`Order Worker: Received job ID ${job.id} with data:`, job.data);
    const orderData = job.data;
    const order = new Order(orderData);
    await order.save();
    console.log(`Order Worker: Order saved with ID ${order._id}`);
    done();
  } catch (error) {
    console.error("Order Worker: Error processing job:", error);
    done(error);
  }
});
