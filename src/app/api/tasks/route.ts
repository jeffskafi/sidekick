import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks } from "~/server/db/schema";
import type { Task, NewTask } from "~/server/db/schema";
import { eq, and } from 'drizzle-orm';
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

    const allTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, parseInt(projectId)),
          eq(tasks.userId, userId)
        )
      );

    const taskTree = buildTaskTree(allTasks);

    return NextResponse.json(taskTree, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

function buildTaskTree(tasks: Task[]): Task[] {
  const taskMap = new Map<number, Task & { subtasks: Task[] }>();
  const rootTasks: (Task & { subtasks: Task[] })[] = [];

  tasks.forEach(task => {
    const taskWithSubtasks = { ...task, subtasks: [] };
    taskMap.set(task.id, taskWithSubtasks);
    if (task.parentId === null) {
      rootTasks.push(taskWithSubtasks);
    } else {
      const parent = taskMap.get(task.parentId);
      if (parent) {
        parent.subtasks.push(taskWithSubtasks);
      }
    }
  });

  return rootTasks;
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