import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks, taskRelationships, type Task } from "~/server/db/schema";
import { eq, and, inArray, count } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";

type BatchUpdatePayload = {
  taskIds: number[];
  updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'childCount'>>;
};

export async function PATCH(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskIds, updates } = await request.json() as BatchUpdatePayload;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'Invalid task IDs' }, { status: 400 });
    }

    const updatedTasks = await db.transaction(async (tx) => {
      const updated = await tx
        .update(tasks)
        .set(updates)
        .where(and(
          eq(tasks.userId, userId),
          inArray(tasks.id, taskIds)
        ))
        .returning();

      const tasksWithChildCounts = await Promise.all(
        updated.map(async (task) => {
          const childCountResult = await tx
            .select({ childCount: count() })
            .from(taskRelationships)
            .where(eq(taskRelationships.parentTaskId, task.id));

          const childCount = childCountResult[0]?.childCount ?? 0;

          return { ...task, childCount } as Task;
        })
      );

      return tasksWithChildCounts;
    });

    return NextResponse.json(updatedTasks, { status: 200 });
  } catch (error) {
    console.error('Error batch updating tasks:', error);
    return NextResponse.json({ error: 'Failed to batch update tasks' }, { status: 500 });
  }
}