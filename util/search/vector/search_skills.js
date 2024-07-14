import { Index } from "@upstash/vector";
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const index = new Index({
  url: process.env.UPSTASH_VECTOR_URL,
  token: process.env.UPSTASH_VECTOR_TOKEN
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Simple function to generate a vector embedding (replace with a proper embedding model in production)
function generateEmbedding(skill) {
  return Array.from({length: 1536}, () => Math.random());
}

async function searchSkills(query) {
  try {
    const queryEmbedding = generateEmbedding(query);
    const results = await index.query({
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true
    });

    console.log(`Top ${results.length} results:`);
    results.forEach((result, i) => {
      console.log(`${i + 1}. ${result.metadata.skill} (score: ${result.score})`);
    });
  } catch (error) {
    console.error('Error searching skills:', error);
  }
}

async function main() {
  const promptSearch = () => {
    rl.question('Enter a search term (or "quit" to exit): ', async (answer) => {
      if (answer.toLowerCase() === 'quit') {
        rl.close();
        return;
      }
      await searchSkills(answer);
      promptSearch();
    });
  };

  promptSearch();
}

main();