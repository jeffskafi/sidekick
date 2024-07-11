import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { agents } from "~/server/db/schema";
import { insertAgentSchema } from '~/server/db/schema';
import type { NewAgent } from '~/server/db/schema';

export async function POST(request: Request) {
  try {
    const newAgentData: NewAgent = await request.json() as NewAgent;

    // Validate request body
    insertAgentSchema.parse(newAgentData);

    const newAgent = await db.insert(agents).values(newAgentData).returning();

    return NextResponse.json(newAgent[0], { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}