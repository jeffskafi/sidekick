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

    const subtasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.parentId, taskId));
    console.log('Retrieved subtasks:', subtasks);

    const response = { ...task, subtasks };
    console.log('Sending response:', response);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT: Update a specific task
export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  console.log('PUT request received');
  console.log('Params:', JSON.stringify(params, null, 2));
  console.log('taskId:', params.taskId, 'type:', typeof params.taskId);

  const taskId = parseInt(params.taskId, 10);

  console.log('Parsed taskId:', taskId);

  if (isNaN(taskId)) {
    console.log('Invalid taskId:', params.taskId);
    return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
  }

  try {
    const updates = await request.json() as Partial<Task>;
    console.log('Received updates:', JSON.stringify(updates, null, 2));

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Handle dueDate
    if (updates.dueDate) {
      if (typeof updates.dueDate === 'string') {
        // If it's a string, parse it to ensure it's a valid date
        const parsedDate = new Date(updates.dueDate);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json({ error: 'Invalid date format for dueDate' }, { status: 400 });
        }
        // Store the date as an ISO string
        updates.dueDate = parsedDate.toISOString();
      } else {
        // If it's not a string (e.g., null), remove it from updates
        delete updates.dueDate;
      }
    }

    const [updatedTask] = await db.update(tasks)
      .set(updates)
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    console.log('Updated task:', JSON.stringify(updatedTask, null, 2));
    return NextResponse.json(updatedTask, { status: 200 });
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

    // Delete all subtasks
    await db.delete(tasks).where(eq(tasks.parentId, taskId));

    // Delete the main task
    const [deletedTask] = await db.delete(tasks).where(eq(tasks.id, taskId)).returning();

    if (!deletedTask) {
      console.log('Task not found for deletion, id:', taskId);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    console.log('Task and subtasks deleted successfully:', deletedTask);
    return NextResponse.json({ message: 'Task and subtasks deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}