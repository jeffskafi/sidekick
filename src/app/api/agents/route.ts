import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { agents, skills, agentSkills } from "~/server/db/schema";
import type { Agent } from "~/server/db/schema";
import { eq } from 'drizzle-orm';

// Define an interface for the request body
interface CreateAgentRequest {
  name: string;
  skills: string[];
  projectId: number;
  xPosition: number;
  yPosition: number;
}

export async function POST(request: Request) {
  try {
    const { name, skills: skillNames, projectId, xPosition, yPosition } = await request.json() as CreateAgentRequest;

    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Insert the new agent
      const [newAgent] = await tx.insert(agents).values({
        name,
        projectId,
        xPosition,
        yPosition,
      }).returning();

      if (!newAgent) {
        throw new Error('Failed to create new agent');
      }

      // Insert skills and create agent-skill associations
      for (const skillName of skillNames) {
        // Check if the skill already exists
        let [existingSkill] = await tx.select().from(skills).where(eq(skills.name, skillName));

        if (!existingSkill) {
          // If the skill doesn't exist, create it
          [existingSkill] = await tx.insert(skills).values({ name: skillName }).returning();
          if (!existingSkill) {
            throw new Error(`Failed to create skill: ${skillName}`);
          }
        }

        // Create the agent-skill association
        await tx.insert(agentSkills).values({
          agentId: newAgent.id,
          skillId: existingSkill.id,
        });
      }

      return newAgent;
    });

    // Fetch the created agent with its skills
    const agentWithSkills = await db
      .select({
        agent: agents,
        skillName: skills.name,
      })
      .from(agents)
      .where(eq(agents.id, result.id))
      .leftJoin(agentSkills, eq(agents.id, agentSkills.agentId))
      .leftJoin(skills, eq(agentSkills.skillId, skills.id));

    // Format the response
    const formattedAgent: Agent = {
      ...result,
      skills: agentWithSkills.map(a => a.skillName).filter((name): name is string => name !== null && name !== undefined),
    };

    return NextResponse.json(formattedAgent, { status: 201 });
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

    // Start a transaction
    const deletedAgent = await db.transaction(async (tx) => {
      // First, delete related records in the agent_skill table
      await tx.delete(agentSkills)
        .where(eq(agentSkills.agentId, agentId));

      // Then, delete the agent
      const [deletedAgent] = await tx.delete(agents)
        .where(eq(agents.id, agentId))
        .returning();

      return deletedAgent;
    });

    if (!deletedAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(deletedAgent, { status: 200 });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedAgent = await request.json() as Agent;

    if (!updatedAgent.id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const result = await db
      .update(agents)
      .set({
        xPosition: updatedAgent.xPosition,
        yPosition: updatedAgent.yPosition,
        // Add other fields you want to update here
      })
      .where(eq(agents.id, updatedAgent.id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}