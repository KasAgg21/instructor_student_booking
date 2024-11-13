// workers/deliveryWorker.js
const Queue = require('bull');
const CommunicationsLog = require('../models/CommunicationsLog');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Bull Queue
const deliveryQueue = new Queue('deliveryQueue', process.env.REDIS_URL);

console.log("Delivery Worker: Connecting to Redis at", process.env.REDIS_URL);

// Event Listeners for Debugging
deliveryQueue.on('error', (error) => {
  console.error('Delivery Worker: Queue Error:', error);
});

deliveryQueue.on('ready', () => {
  console.log('Delivery Worker: Queue is ready');
});

deliveryQueue.on('waiting', (jobId) => {
  console.log(`Delivery Worker: Job waiting with ID ${jobId}`);
});

deliveryQueue.on('active', (job, jobPromise) => {
  console.log(`Delivery Worker: Processing job ID ${job.id}`);
});

deliveryQueue.on('completed', (job, result) => {
  console.log(`Delivery Worker: Completed job ID ${job.id}`);
});

deliveryQueue.on('failed', (job, err) => {
  console.log(`Delivery Worker: Failed job ID ${job.id} with error:`, err);
});

// Process delivery receipt jobs
deliveryQueue.process(async (job, done) => {
  try {
    console.log(`Delivery Worker: Received job ID ${job.id} with data:`, job.data);
    const { logId } = job.data;

    // Randomly determine the delivery status
    const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';
    console.log(`Delivery Worker: Determined status ${status} for log ID ${logId}`);

    // Update the communication log
    await CommunicationsLog.findByIdAndUpdate(logId, { status });
    console.log(`Delivery Worker: Updated log ID ${logId} with status ${status}`);

    done();
  } catch (error) {
    console.error("Delivery Worker: Error processing job:", error);
    done(error);
  }
});
