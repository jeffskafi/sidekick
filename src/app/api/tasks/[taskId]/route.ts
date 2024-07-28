import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from "~/server/db";
import { tasks } from "~/server/db/schema";
import type { Task } from "~/server/db/schema";
import { eq } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";

// GET: Fetch a specific task
export async function GET(
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

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const subtasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.parentId, taskId));

    const response = { ...task, subtasks };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT: Update a specific task
export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const taskId = parseInt(params.taskId, 10);

  if (isNaN(taskId)) {
    return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
  }

  try {
    const updates = await request.json() as Partial<Task>;

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Handle dueDate
    if (updates.dueDate) {
      if (typeof updates.dueDate === 'string') {
        const parsedDate = new Date(updates.dueDate);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json({ error: 'Invalid date format for dueDate' }, { status: 400 });
        }
        updates.dueDate = parsedDate.toISOString();
      } else {
        delete updates.dueDate;
      }
    }

    // Fetch the existing task
    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update the task
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...existingTask, ...updates })
      .where(eq(tasks.id, taskId))
      .returning();

    // Fetch subtasks
    const subtasks = await db.select().from(tasks).where(eq(tasks.parentId, taskId));

    // Return the updated task with subtasks
    return NextResponse.json({ ...updatedTask, subtasks }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE: Delete a specific task
export async function DELETE(
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

    // Delete all subtasks
    await db.delete(tasks).where(eq(tasks.parentId, taskId));

    // Delete the main task
    const [deletedTask] = await db.delete(tasks).where(eq(tasks.id, taskId)).returning();

    if (!deletedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task and subtasks deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}