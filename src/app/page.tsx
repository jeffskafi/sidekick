import { TaskProvider } from "~/contexts/TaskContext";
import { db } from "~/server/db";
import { tasks, subtasks, type Task } from "~/server/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import dynamic from 'next/dynamic'
import { auth } from "@clerk/nextjs/server";

const TodoApp = dynamic(() => import('~/_components/tasks/TodoApp'), { ssr: false })

export const runtime = 'edge'

async function getTasks(projectId: number, userId: string): Promise<Task[]> {
  const fetchedTasks = await db.select().from(tasks).where(
    and(
      eq(tasks.projectId, projectId),
      eq(tasks.userId, userId)
    )
  );

  const taskIds = fetchedTasks.map(task => task.id);
  const fetchedSubtasks = await db.select().from(subtasks).where(inArray(subtasks.taskId, taskIds));

  return fetchedTasks.map(task => ({
    ...task,
    subtasks: fetchedSubtasks.filter(subtask => subtask.taskId === task.id),
    dueDate: task.dueDate ? new Date(task.dueDate) : null
  }));
}

export default async function HomePage() {
  const { userId } = auth();
  const projectId = 1; // You should get this from the user's context or URL params
  
  if (!userId) {
    // Handle unauthenticated user
    return <div>Please sign in to view your tasks.</div>;
  }

  const initialTasks: Task[] = await getTasks(projectId, userId);

  return (
    <TaskProvider initialTasks={initialTasks}>
      <TodoApp />
    </TaskProvider>
  );
}