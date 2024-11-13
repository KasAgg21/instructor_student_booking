// testRedis.js
const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const client = redis.createClient({ url: process.env.REDIS_URL });

client.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await client.connect();
  await client.set('testKey', 'testValue');
  const value = await client.get('testKey');
  console.log('testKey:', value); // Should log "testKey: testValue"
  await client.quit();
})();
