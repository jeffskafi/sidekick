'use server'

import { auth } from "@clerk/nextjs/server";
import OpenAI from 'openai';
import { rateLimit } from '~/server/ratelimit';
import { generateMindMapSystemPrompt } from '~/prompts/generateMindMapSystemPrompt';
import { generateMindMapUserPrompt } from '~/prompts/generateMindMapUserPrompt';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { db } from '~/server/db';
import { mindMaps, mindMapNodes, mindMapLinks } from '~/server/db/schema';
import type { MindMap, MindMapNode, MindMapLink } from '~/server/db/schema';
import { eq, and, or } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createMindMap(name: string): Promise<MindMap> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const [newMindMap] = await db.insert(mindMaps).values({ userId, name }).returning();
  
  if (!newMindMap) {
    throw new Error('Failed to create mind map');
  }

  return newMindMap;
}

export async function getUserMindMaps(): Promise<MindMap[]> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  return db.select().from(mindMaps).where(eq(mindMaps.userId, userId));
}

export async function getMindMap(mindMapId: string): Promise<{ mindMap: MindMap; nodes: MindMapNode[]; links: MindMapLink[] }> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const [mindMap] = await db.select().from(mindMaps).where(and(eq(mindMaps.id, mindMapId), eq(mindMaps.userId, userId))).limit(1);
  if (!mindMap) throw new Error('Mind map not found or access denied');

  const nodes = await db.select().from(mindMapNodes).where(eq(mindMapNodes.mindMapId, mindMapId));
  const links = await db.select().from(mindMapLinks).where(eq(mindMapLinks.mindMapId, mindMapId));
  return { mindMap, nodes, links };
}

export async function addNodeToMindMap(mindMapId: string, label: string, x?: number, y?: number): Promise<MindMapNode> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  // Verify the mind map belongs to the user
  const [mindMap] = await db.select().from(mindMaps).where(and(eq(mindMaps.id, mindMapId), eq(mindMaps.userId, userId)));
  if (!mindMap) throw new Error('Mind map not found or access denied');

  const [newNode] = await db.insert(mindMapNodes).values({ mindMapId, label, x: x?.toString(), y: y?.toString() }).returning();
  if (!newNode) throw new Error('Failed to add node');
  return newNode;
}

export async function addLinkToMindMap(mindMapId: string, sourceId: string, targetId: string): Promise<MindMapLink> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  // Verify the mind map belongs to the user
  const [mindMap] = await db.select().from(mindMaps).where(and(eq(mindMaps.id, mindMapId), eq(mindMaps.userId, userId)));
  if (!mindMap) throw new Error('Mind map not found or access denied');

  const [newLink] = await db.insert(mindMapLinks).values({ mindMapId, sourceId, targetId }).returning();
  if (!newLink) throw new Error('Failed to add link');
  return newLink;
}

export async function updateNode(nodeId: string, label: string, x?: number, y?: number): Promise<MindMapNode> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  // Verify the node belongs to a mind map owned by the user
  const [node] = await db.select()
    .from(mindMapNodes)
    .innerJoin(mindMaps, eq(mindMaps.id, mindMapNodes.mindMapId))
    .where(and(eq(mindMapNodes.id, nodeId), eq(mindMaps.userId, userId)));

  if (!node) throw new Error('Node not found or access denied');

  const [updatedNode] = await db.update(mindMapNodes)
    .set({ label, x: x?.toString(), y: y?.toString(), updatedAt: new Date() })
    .where(eq(mindMapNodes.id, nodeId))
    .returning();

  if (!updatedNode) throw new Error('Failed to update node');
  return updatedNode;
}

export async function deleteNode(nodeId: string): Promise<void> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  // Verify the node belongs to a mind map owned by the user
  const [node] = await db.select()
    .from(mindMapNodes)
    .innerJoin(mindMaps, eq(mindMaps.id, mindMapNodes.mindMapId))
    .where(and(eq(mindMapNodes.id, nodeId), eq(mindMaps.userId, userId)));

  if (!node) throw new Error('Node not found or access denied');

  await db.delete(mindMapLinks).where(or(eq(mindMapLinks.sourceId, nodeId), eq(mindMapLinks.targetId, nodeId)));
  await db.delete(mindMapNodes).where(eq(mindMapNodes.id, nodeId));
}

export async function deleteMindMap(mindMapId: string): Promise<void> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  // Verify the mind map belongs to the user
  const [mindMap] = await db.select().from(mindMaps).where(and(eq(mindMaps.id, mindMapId), eq(mindMaps.userId, userId)));
  if (!mindMap) throw new Error('Mind map not found or access denied');

  await db.delete(mindMapLinks).where(eq(mindMapLinks.mindMapId, mindMapId));
  await db.delete(mindMapNodes).where(eq(mindMapNodes.mindMapId, mindMapId));
  await db.delete(mindMaps).where(eq(mindMaps.id, mindMapId));
}

export async function generateRelatedWords(word: string, mindMapId: string): Promise<string[]> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  // Verify the mind map belongs to the user
  const [mindMap] = await db.select().from(mindMaps).where(and(eq(mindMaps.id, mindMapId), eq(mindMaps.userId, userId)));
  if (!mindMap) throw new Error('Mind map not found or access denied');

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
    const relatedWords = parsedResponse.related_words;

    // Save generated words to the database
    for (const relatedWord of relatedWords) {
      const newNode = await addNodeToMindMap(mindMapId, relatedWord);
      if (newNode) {
        await addLinkToMindMap(mindMapId, word, newNode.id);
      } else {
        console.error(`Failed to add node for word: ${relatedWord}`);
      }
    }

    return relatedWords;
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    throw new Error('Invalid response format from OpenAI');
  }
}