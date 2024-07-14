import { Index } from "@upstash/vector";
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const index = new Index({
  url: process.env.UPSTASH_VECTOR_URL,
  token: process.env.UPSTASH_VECTOR_TOKEN
});

// Simple function to generate a vector embedding (replace with a proper embedding model in production)
function generateEmbedding(skill) {
  return Array.from({length: 1536}, () => Math.random());
}

async function seedVectorDB() {
  try {
    const skills = JSON.parse(fs.readFileSync('util/linkedin_skills.json', 'utf8'));
    
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const embedding = generateEmbedding(skill);
      
      await index.upsert({
        id: `skill:${i}`,
        vector: embedding,
        metadata: { skill: skill }
      });
      
      console.log(`Seeded skill: ${skill}`);
    }

    console.log('All skills have been successfully seeded to the vector database.');
  } catch (error) {
    console.error('Error seeding skills to the vector database:', error);
  }
}

seedVectorDB();