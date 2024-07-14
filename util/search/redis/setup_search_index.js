import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: `rediss://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URL}:${process.env.REDIS_PORT}`,
});

async function setupRedisIndex() {
  try {
    await client.connect();
    console.log('Successfully connected to Redis.');

    // Check if we can interact with Redis
    await client.ping();
    console.log('Redis is responsive.');

    // Check if the skills hash exists
    const hashExists = await client.exists('linkedin_skills');
    if (hashExists) {
      const skillCount = await client.hLen('linkedin_skills');
      console.log(`LinkedIn skills hash exists with ${skillCount} skills.`);
    } else {
      console.log('LinkedIn skills hash does not exist yet. It will be created when you seed the data.');
    }

    console.log('Redis is ready for use.');
  } catch (error) {
    console.error('Error setting up Redis connection:', error);
  } finally {
    await client.quit();
  }
}

setupRedisIndex().catch(console.error);