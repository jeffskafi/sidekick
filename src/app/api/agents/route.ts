import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { agents } from "~/server/db/schema";
import { insertAgentSchema } from '~/server/db/schema';
import type { NewAgent } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const agentId = parseInt(id, 10);

    if (isNaN(agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const deletedAgent = await db.delete(agents)
      .where(eq(agents.id, agentId))
      .returning();

    if (deletedAgent.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(deletedAgent[0], { status: 200 });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}