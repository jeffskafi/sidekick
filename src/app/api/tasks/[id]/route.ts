import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks, taskRelationships, type Task } from "~/server/db/schema";
import { eq, and, count } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.id);
    
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const childCountResult = await db
      .select({ childCount: count() })
      .from(taskRelationships)
      .where(eq(taskRelationships.parentTaskId, taskId));

    const childCount = childCountResult[0]?.childCount ?? 0;

    const taskWithChildCount: Task = { ...task, childCount };

    return NextResponse.json(taskWithChildCount, { status: 200 });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}