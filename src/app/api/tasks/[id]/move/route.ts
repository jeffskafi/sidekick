import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks, taskRelationships } from "~/server/db/schema";
import { eq, and } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";

type MoveTaskInput = {
  newParentId: number | null;
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.id);

    const body = await request.json() as MoveTaskInput;
    const { newParentId } = body;

    await db.transaction(async (tx) => {
      // Check if the task exists and belongs to the user
      const [task] = await tx
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

      if (!task) {
        throw new Error('Task not found');
      }

      // Remove the current parent-child relationship
      await tx
        .delete(taskRelationships)
        .where(eq(taskRelationships.childTaskId, taskId));

      // If a new parent is specified, create a new relationship
      if (newParentId !== null) {
        const [newParent] = await tx
          .select()
          .from(tasks)
          .where(and(eq(tasks.id, newParentId), eq(tasks.userId, userId)));

        if (!newParent) {
          throw new Error('New parent task not found');
        }

        // The unique index will prevent circular references automatically
        await tx.insert(taskRelationships).values({
          parentTaskId: newParentId,
          childTaskId: taskId,
        });
      }
    });

    return NextResponse.json({ message: 'Task moved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error moving task:', error);
    return NextResponse.json({ error: 'Failed to move task' }, { status: 500 });
  }
}