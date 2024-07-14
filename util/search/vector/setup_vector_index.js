import { Index } from "@upstash/vector";
import dotenv from 'dotenv';

dotenv.config();

const index = new Index({
  url: process.env.UPSTASH_VECTOR_URL,
  token: process.env.UPSTASH_VECTOR_TOKEN
});

async function setupVectorIndex() {
  try {
    // Perform a simple query to test the connection
    const testVector = Array(1536).fill(0);
    await index.query({
      vector: testVector,
      topK: 1,
      includeMetadata: true
    });
    console.log("Successfully connected to the vector index.");
    console.log("The index is ready for use or will be created automatically when you add vectors.");
  } catch (error) {
    console.error("Error connecting to vector index:", error);
    console.log("Please check your UPSTASH_VECTOR_URL and UPSTASH_VECTOR_TOKEN environment variables.");
  }
}

setupVectorIndex();