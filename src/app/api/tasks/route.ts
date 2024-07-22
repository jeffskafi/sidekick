import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks } from "~/server/db/schema";
import type { Task, NewTask } from "~/server/db/schema";
import { eq, and, isNull, ne } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET: Fetch all tasks for a project
export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const projectTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, parseInt(projectId)));

    return NextResponse.json(projectTasks, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST: Create a new task
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newTaskData = await request.json() as NewTask;

    if (!newTaskData.description || !newTaskData.projectId) {
      return NextResponse.json({ error: 'Description and Project ID are required' }, { status: 400 });
    }

    let openaiAssistantId, openaiThreadId, openaiRunId;

    if (newTaskData.agentId) {
      // Create OpenAI assistant, thread, and run
      const assistant = await openai.beta.assistants.create({
        name: "Task Assistant",
        instructions: `Complete the following task: ${newTaskData.description}`,
        model: "gpt-4o",
      });
      openaiAssistantId = assistant.id;

      const thread = await openai.beta.threads.create();
      openaiThreadId = thread.id;

      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });
      openaiRunId = run.id;
    }

    const [newTask] = await db.insert(tasks).values({
      ...newTaskData,
      openaiAssistantId,
      openaiThreadId,
      openaiRunId,
    }).returning();

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// PUT: Update a task
export async function PUT(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedTaskData = await request.json() as Partial<Task> & { id: number };

    if (!updatedTaskData.id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const [updatedTask] = await db.update(tasks)
      .set(updatedTaskData)
      .where(eq(tasks.id, updatedTaskData.id))
      .returning();

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE: Delete a task
export async function DELETE(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const [deletedTask] = await db.delete(tasks).where(eq(tasks.id, parseInt(id))).returning();

    if (!deletedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}