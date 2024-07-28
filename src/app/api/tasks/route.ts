import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks, taskRelationships, type Task, type NewTask } from "~/server/db/schema";
import { eq, gt, sql, count } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";

type TaskWithChildCount = Omit<Task, 'childCount'> & { childCount: number };
type TaskWithParentId = Omit<Task, 'parentId'> & { parentId: string | null };

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const tasksWithChildCounts = await db
      .select({
        id: tasks.id,
        childCount: count(taskRelationships.id).as('childCount')
      })
      .from(tasks)
      .leftJoin(
        taskRelationships,
        eq(tasks.id, taskRelationships.parentTaskId)
      )
      .where(eq(tasks.userId, userId))
      .groupBy(tasks.id)
      .having(gt(count(taskRelationships.id), 0))
      .limit(limit)
      .offset(offset);

    const fullTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, sql`ANY(${tasksWithChildCounts.map(t => t.id)})`));

    const result: TaskWithChildCount[] = fullTasks.map(task => ({
      ...task,
      childCount: tasksWithChildCounts.find(t => t.id === task.id)?.childCount ?? 0
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as TaskWithParentId;
    const { parentId, ...taskData } = body;

    // Validate required fields
    if (!taskData.description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const newTaskData: NewTask = {
      userId,
      description: taskData.description,
      status: taskData.status ?? 'todo',
      priority: taskData.priority ?? 'none',
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
    };

    const [newTask] = await db.insert(tasks).values(newTaskData).returning();

    if (!newTask) {
      throw new Error('Failed to create task');
    }

    if (parentId != null) {
      const parentIdNumber = Number(parentId);
      if (isNaN(parentIdNumber)) {
        return NextResponse.json({ error: 'Invalid parentId' }, { status: 400 });
      }
      await db.insert(taskRelationships).values({
        parentTaskId: parentIdNumber,
        childTaskId: newTask.id,
      });
    }

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}