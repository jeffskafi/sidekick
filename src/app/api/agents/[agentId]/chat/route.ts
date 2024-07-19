import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { agents, threads } from "~/server/db/schema";
import { eq } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import type { Thread } from "openai/resources/beta/threads/threads";

export async function POST(request: Request, { params }: { params: { agentId: string } }) {
  try {
    console.log('Authenticating user...');
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Parsing agent ID...');
    const agentId = parseInt(params.agentId, 10);
    if (isNaN(agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    console.log('Parsing request body...');
    const { message } = await request.json() as { message: string };

    console.log('Fetching agent...');
    const agent = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
    if (!agent[0]) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    console.log('Initializing OpenAI...');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('Checking for existing thread...');
    let thread: Thread;
    const existingThread = await db.select().from(threads).where(eq(threads.agentId, agentId)).limit(1);

    if (existingThread[0]) {
      console.log('Retrieving existing thread...');
      thread = await openai.beta.threads.retrieve(existingThread[0].openaiThreadId);
    } else {
      console.log('Creating new thread...');
      thread = await openai.beta.threads.create();
      await db.insert(threads).values({
        agentId,
        openaiThreadId: thread.id,
      });
    }

    console.log('Sending message to thread...');
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    if (!agent[0].openaiAssistantId) {
      return NextResponse.json({ error: 'Agent has no associated OpenAI assistant' }, { status: 400 });
    }

    console.log('Starting assistant run...');
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: agent[0].openaiAssistantId,
    });

    console.log('Retrieving run status...');
    const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    if (runStatus.status !== 'completed') {
      return NextResponse.json({ error: 'Assistant response timed out' }, { status: 504 });
    }

    console.log('Retrieving assistant messages...');
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
    const latestMessage = assistantMessages[0]?.content[0];

    return NextResponse.json({
      success: true,
      message: latestMessage?.type === 'text' ? latestMessage.text.value : 'No response from assistant'
    }, { status: 200 });
  } catch (error) {
    console.error('Error in agent chat:', error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}