import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks, subtasks } from "~/server/db/schema";
import type { Task, Subtask } from "~/server/db/schema";
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

    const updatedTaskData = await request.json() as Partial<Task> & { subtasks?: Subtask[] };

    // Update task
    const [updatedTask] = await db.update(tasks)
      .set(updatedTaskData)
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Handle subtasks update if provided
    if (updatedTaskData.subtasks) {
      // Delete existing subtasks
      await db.delete(subtasks).where(eq(subtasks.taskId, taskId));

      // Insert new subtasks
      if (updatedTaskData.subtasks.length > 0) {
        await db.insert(subtasks).values(
          updatedTaskData.subtasks.map(subtask => ({
            ...subtask,
            taskId: taskId
          }))
        );
      }
    }

    // Fetch updated task with subtasks
    const updatedTaskWithSubtasks = await db
      .select({
        task: tasks,
        subtask: subtasks,
      })
      .from(tasks)
      .leftJoin(subtasks, eq(tasks.id, subtasks.taskId))
      .where(eq(tasks.id, taskId));

    // Format the response
    const formattedTask = updatedTaskWithSubtasks[0] ? {
      ...updatedTaskWithSubtasks[0].task,
      subtasks: updatedTaskWithSubtasks.map(row => row.subtask).filter(Boolean),
    } : null;

    return NextResponse.json(formattedTask, { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
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

    // Delete subtasks first
    await db.delete(subtasks).where(eq(subtasks.taskId, taskId));

    // Then delete the task
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