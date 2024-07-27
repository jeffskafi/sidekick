import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { agents, skills, agentSkills } from "~/server/db/schema";
import type { Agent } from "~/server/db/schema";
import { eq, and, ne } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { config } from "dotenv";

config();

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
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, skills: skillNames, projectId, xPosition, yPosition } = await request.json() as CreateAgentRequest;

    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Check if an agent with the same name already exists for this user
      const existingAgent = await tx.select().from(agents).where(and(eq(agents.name, name), eq(agents.userId, userId))).limit(1);
      if (existingAgent.length > 0) {
        throw new Error('An agent with this name already exists for this user');
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Create OpenAI assistant
      const assistant = await openai.beta.assistants.create({
        name: name,
        instructions: `You are an AI agent with the following skills: ${skillNames.join(', ')}. Assist the user to the best of your abilities.`,
        model: "gpt-4o-mini",
        tools: [{ type: "code_interpreter" }, { type: "file_search" }],
      });

      // Insert the new agent
      const [newAgent] = await tx.insert(agents).values({
        name,
        projectId,
        xPosition,
        yPosition,
        userId,
        openaiAssistantId: assistant.id,
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
  const deletionProgress = {
    assistantDeleted: false,
    skillsDeleted: false,
    agentDeleted: false,
  };

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

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Start a transaction
    const deletedAgent = await db.transaction(async (tx) => {
      // First, retrieve the agent to get the OpenAI assistant ID
      const [agent] = await tx.select().from(agents).where(eq(agents.id, agentId));

      if (!agent) {
        throw new Error('Agent not found');
      }

      // Perform deletion operations in parallel
      const [assistantDeletionResult, agentDeletionResult] = await Promise.all([
        // Delete the OpenAI assistant
        agent.openaiAssistantId
          ? openai.beta.assistants.del(agent.openaiAssistantId).catch(error => {
              console.error('Failed to delete OpenAI assistant:', error);
              return null;
            })
          : Promise.resolve(null),
        
        // Delete the agent and related records in the agent_skill table
        tx.delete(agents).where(eq(agents.id, agentId)).returning(),
      ]);

      deletionProgress.assistantDeleted = assistantDeletionResult !== null;
      deletionProgress.skillsDeleted = true; // Assuming skills are deleted due to foreign key constraints
      deletionProgress.agentDeleted = agentDeletionResult.length > 0;

      if (!deletionProgress.agentDeleted) {
        throw new Error('Failed to delete agent');
      }

      return agentDeletionResult[0];
    });

    if (!deletedAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      deletedAgent, 
      deletionProgress 
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ 
      error: 'Failed to delete agent', 
      deletionProgress 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedAgent = await request.json() as Agent;

    if (!updatedAgent.id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    // Check if the updated name already exists for this user (if name is being updated)
    if (updatedAgent.name) {
      const existingAgent = await db.select().from(agents).where(
        and(
          eq(agents.name, updatedAgent.name),
          eq(agents.userId, userId),
          ne(agents.id, updatedAgent.id)
        )
      ).limit(1);

      if (existingAgent.length > 0) {
        return NextResponse.json({ error: 'An agent with this name already exists for this user' }, { status: 400 });
      }
    }

    // Parse xPosition and yPosition as numbers
    const xPosition = parseFloat(updatedAgent.xPosition as unknown as string);
    const yPosition = parseFloat(updatedAgent.yPosition as unknown as string);

    if (isNaN(xPosition) || isNaN(yPosition)) {
      return NextResponse.json({ error: 'Invalid position values' }, { status: 400 });
    }

    const result = await db
      .update(agents)
      .set({
        name: updatedAgent.name,
        xPosition,
        yPosition,
        // Add other fields you want to update here
      })
      .where(and(eq(agents.id, updatedAgent.id), eq(agents.userId, userId)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Agent not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}