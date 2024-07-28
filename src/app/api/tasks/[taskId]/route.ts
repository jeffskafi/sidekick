import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks, subtasks } from "~/server/db/schema";
import type { Task } from "~/server/db/schema";
import { eq } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";

// GET: Fetch a specific task
export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  console.log('GET request received for taskId:', params.taskId);
  try {
    const { userId } = auth();
    console.log('Authenticated userId:', userId);
    if (!userId) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.taskId, 10);
    console.log('Parsed taskId:', taskId);
    if (isNaN(taskId)) {
      console.log('Invalid taskId:', params.taskId);
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    console.log('Retrieved task:', task);
    if (!task) {
      console.log('Task not found for id:', taskId);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));
    console.log('Retrieved subtasks:', taskSubtasks);

    const response = { ...task, subtasks: taskSubtasks };
    console.log('Sending response:', response);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT: Update a specific task
export async function PUT(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.taskId, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const updates = await request.json() as Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>;

    try {
      const [updatedTask] = await db.update(tasks)
        .set(updates)
        .where(eq(tasks.id, taskId))
        .returning();

      if (!updatedTask) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      return NextResponse.json(updatedTask, { status: 200 });
    } catch (dbError) {
      console.error('Database update failed:', dbError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE: Delete a specific task
export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  console.log('DELETE request received for taskId:', params.taskId);
  try {
    const { userId } = auth();
    console.log('Authenticated userId:', userId);
    if (!userId) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.taskId, 10);
    console.log('Parsed taskId:', taskId);
    if (isNaN(taskId)) {
      console.log('Invalid taskId:', params.taskId);
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    console.log('Deleting subtasks for taskId:', taskId);
    await db.delete(subtasks).where(eq(subtasks.taskId, taskId));

    console.log('Deleting task with id:', taskId);
    const [deletedTask] = await db.delete(tasks).where(eq(tasks.id, taskId)).returning();

    if (!deletedTask) {
      console.log('Task not found for deletion, id:', taskId);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    console.log('Task deleted successfully:', deletedTask);
    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}