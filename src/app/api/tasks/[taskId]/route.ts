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

    const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));

    return NextResponse.json({ ...task, subtasks: taskSubtasks }, { status: 200 });
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

    const updatedTaskData = await request.json() as Task;

    if (updatedTaskData.dueDate) {
      try {
        const dateObject = new Date(updatedTaskData.dueDate);
        updatedTaskData.dueDate = dateObject.toISOString();
        updatedTaskData.hasDueDate = true;
      } catch (error) {
        updatedTaskData.dueDate = null;
        updatedTaskData.hasDueDate = false;
      }
    } else {
      updatedTaskData.dueDate = null;
      updatedTaskData.hasDueDate = false;
    }

    const { updatedAt, createdAt, subtasks: _, ...dataToUpdate } = updatedTaskData;

    try {
      const [updatedTask] = await db.update(tasks)
        .set(dataToUpdate)
        .where(eq(tasks.id, taskId))
        .returning();

      if (!updatedTask) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));

      const taskWithSubtasks = {
        ...updatedTask,
        subtasks: taskSubtasks,
      };

      return NextResponse.json(taskWithSubtasks, { status: 200 });
    } catch (dbError) {
      const error = dbError as Error;
      return NextResponse.json({ error: 'Database update failed', details: error.message }, { status: 500 });
    }
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: 'Failed to update task', details: err.message }, { status: 500 });
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

    await db.delete(subtasks).where(eq(subtasks.taskId, taskId));

    const [deletedTask] = await db.delete(tasks).where(eq(tasks.id, taskId)).returning();

    if (!deletedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}