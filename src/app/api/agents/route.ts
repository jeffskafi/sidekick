import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { agents } from "~/server/db/schema";

// Define an interface for the expected request body
interface AgentRequestBody {
  name: string;
  projectId: number;
}

export async function POST(request: Request) {
  try {
    // Parse and type the request body
    const body = await request.json() as AgentRequestBody;
    const { name, projectId } = body;

    if (!name || !projectId) {
      return NextResponse.json({ error: 'Name and projectId are required' }, { status: 400 });
    }

    const newAgent = await db.insert(agents).values({
      name,
      projectId,
      status: 'idle',
      xPosition: 0,
      yPosition: 0,
    }).returning();

    return NextResponse.json(newAgent[0], { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}