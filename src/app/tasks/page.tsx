import { TaskProvider } from "~/contexts/TaskContext";
import { db } from "~/server/db";
import { tasks, type Task } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import dynamic from 'next/dynamic'
import { auth } from "@clerk/nextjs/server";

const TodoApp = dynamic(() => import('~/_components/tasks/TodoApp'), { ssr: true })

export const runtime = 'edge'

async function getTasks(projectId: number, userId: string): Promise<Task[]> {
  return db.select().from(tasks).where(
    and(
      eq(tasks.projectId, projectId),
      eq(tasks.userId, userId)
    )
  );
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