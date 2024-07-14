import { createClient } from 'redis';
import { config } from 'dotenv';
import readline from 'readline';

config();

const client = createClient({
  url: `rediss://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URL}:${process.env.REDIS_PORT}`,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function searchSkills(query, offset = 0, count = 10) {
  const lowercaseQuery = query.toLowerCase();
  const matchingSkills = await client.zRangeByLex(
    'linkedin_skills_lowercase',
    `[${lowercaseQuery}`,
    `[${lowercaseQuery}\xff`,
    { LIMIT: { offset, count: count + 1 } }
  );

  const hasMore = matchingSkills.length > count;
  const results = matchingSkills.slice(0, count);
  const originalSkills = results.length > 0 ? await client.hmGet('linkedin_skills_original', results) : [];

  return { results: originalSkills, hasMore };
}

async function handleUserInput(answer) {
  if (answer.toLowerCase() === 'quit') {
    await client.quit();
    rl.close();
    return false;
  }

  const { results, hasMore } = await searchSkills(answer);
  
  console.log(`Found ${results.length} results:`);
  results.forEach((skill, index) => console.log(`${index + 1}. ${skill}`));
  if (hasMore) console.log('There are more results available.');

  return true;
}

function promptUser() {
  rl.question('Enter a search term (or "quit" to exit): ', async (answer) => {
    const shouldContinue = await handleUserInput(answer);
    if (shouldContinue) promptUser();
  });
}

async function main() {
  try {
    await client.connect();
    console.log('Connected to Redis. Ready for searches.');
    promptUser();
  } catch (error) {
    console.error('Error connecting to Redis:', error);
    process.exit(1);
  }
}

main().catch(console.error);