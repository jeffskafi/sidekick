import { createClient } from 'redis';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: `rediss://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URL}:${process.env.REDIS_PORT}`,
});

async function seedSkills() {
  await client.connect();

  try {
    const skills = JSON.parse(fs.readFileSync('util/search/data/linkedin_skills_unique.json', 'utf8'));
    
    const pipeline = client.multi();
    for (let i = 0; i < skills.length; i++) {
      const lowercaseSkill = skills[i].toLowerCase();
      pipeline.zAdd('linkedin_skills_lowercase', { score: i, value: lowercaseSkill });
      pipeline.hSet('linkedin_skills_original', lowercaseSkill, skills[i]);
      if (i % 1000 === 0) console.log(`Prepared skill ${i}: ${skills[i]}`);
    }

    await pipeline.exec();
    console.log('All skills have been successfully seeded to the database.');
  } catch (error) {
    console.error('Error seeding skills to the database:', error);
  } finally {
    await client.quit();
  }
}

seedSkills().catch(console.error);