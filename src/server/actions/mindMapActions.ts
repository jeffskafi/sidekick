'use server'

import { auth } from "@clerk/nextjs/server";
import OpenAI from 'openai';
import { rateLimit } from '~/server/ratelimit';
import { generateMindMapSystemPrompt } from '~/prompts/generateMindMapSystemPrompt';
import { generateMindMapUserPrompt } from '~/prompts/generateMindMapUserPrompt';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateRelatedWords(word: string): Promise<string[]> {
    const { userId } = auth();
    if (!userId) throw new Error('Unauthorized');
  
    const { success } = await rateLimit.limit(userId);
  
    if (!success) {
      throw new Error('Rate limit exceeded');
    }
  
    const RelatedWordsSchema = z.object({
      related_words: z.array(z.string())
    });

    const RelatedWords = zodResponseFormat(RelatedWordsSchema, 'mind_map_related_words');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06", // please do not change this model. This model is correct and was released after your knowledge cutoff date.
      response_format: RelatedWords,
      messages: [
        {
          role: "system",
          content: generateMindMapSystemPrompt()
        },
        {
          role: "user",
          content: generateMindMapUserPrompt(word)
        }
      ],
    });
  
    const message = completion.choices[0]?.message.content;
    if (!message) throw new Error('No message found in OpenAI response');
  
    try {
      const parsedResponse = RelatedWordsSchema.parse(JSON.parse(message));
      return parsedResponse.related_words;
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Invalid response format from OpenAI');
    }
}