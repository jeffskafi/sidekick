import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks } from "~/server/db/schema";
import type { Task, NewTask } from "~/server/db/schema";
import { eq, and, isNull, ne } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";

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

    if (newTaskData.agentId) {
      // Check if the agent already has an assigned task
      const existingTask = await db.select()
        .from(tasks)
        .where(and(
          eq(tasks.agentId, newTaskData.agentId),
          isNull(tasks.storyId)
        ))
        .limit(1);

      if (existingTask.length > 0) {
        return NextResponse.json({ error: 'This agent already has an assigned task' }, { status: 400 });
      }
    }

    const [newTask] = await db.insert(tasks).values(newTaskData).returning();

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    if (error instanceof Error && error.message.includes('uniqueAgentTask')) {
      return NextResponse.json({ error: 'This agent already has an assigned task' }, { status: 400 });
    }
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

    if (updatedTaskData.agentId) {
      // Check if the agent already has an assigned task (excluding the current task)
      const existingTask = await db.select()
        .from(tasks)
        .where(and(
          eq(tasks.agentId, updatedTaskData.agentId),
          isNull(tasks.storyId),
          ne(tasks.id, updatedTaskData.id)
        ))
        .limit(1);

      if (existingTask.length > 0) {
        return NextResponse.json({ error: 'This agent already has an assigned task' }, { status: 400 });
      }
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
    if (error instanceof Error && error.message.includes('uniqueAgentTask')) {
      return NextResponse.json({ error: 'This agent already has an assigned task' }, { status: 400 });
    }
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