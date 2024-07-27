import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks, subtasks } from "~/server/db/schema";
import type { NewTask } from "~/server/db/schema";
import { eq, inArray, and } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";

// GET: Fetch all tasks for a project and user
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

    // Fetch tasks for the specific user and project
    const projectTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, parseInt(projectId)),
          eq(tasks.userId, userId)
        )
      );

    // Fetch subtasks for these tasks
    const taskIds = projectTasks.map(task => task.id);
    const projectSubtasks = await db
      .select()
      .from(subtasks)
      .where(inArray(subtasks.taskId, taskIds));

    // Combine tasks and subtasks
    const tasksWithSubtasks = projectTasks.map(task => ({
      ...task,
      subtasks: projectSubtasks.filter(subtask => subtask.taskId === task.id)
    }));

    return NextResponse.json(tasksWithSubtasks, { status: 200 });
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

    // Include userId in the new task data
    const taskWithUserId = { ...newTaskData, userId };

    const [newTask] = await db.insert(tasks).values(taskWithUserId).returning();

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}