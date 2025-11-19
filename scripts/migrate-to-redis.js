const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  console.error('REDIS_URL environment variable is required');
  process.exit(1);
}

const redis = new Redis(REDIS_URL);

const DATA_PATH = path.join(__dirname, '../storage/claude-hub-repositories/all-repositories.json');

async function migrate() {
  try {
    console.log('Reading data from file system...');
    const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
    const jsonData = JSON.parse(rawData);

    if (!jsonData.repositories || !Array.isArray(jsonData.repositories)) {
      throw new Error('Invalid data format: repositories array not found');
    }

    console.log(`Found ${jsonData.repositories.length} repositories.`);

    // Key: extensions:data
    // Value: JSON string of the repositories array
    console.log('Writing to Redis (Key: extensions:data)...');
    
    await redis.set('extensions:data', JSON.stringify(jsonData.repositories));

    console.log('Migration completed successfully!');
    
    // Verification
    const savedData = await redis.get('extensions:data');
    console.log('Verification - Data length in Redis:', savedData.length);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    redis.disconnect();
  }
}

migrate();
