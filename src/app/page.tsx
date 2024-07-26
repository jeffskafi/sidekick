import { TaskProvider } from "../contexts/TaskContext";
import { db } from "~/server/db";
import { tasks, type Task } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import dynamic from 'next/dynamic'
const TodoApp = dynamic(() => import('~/_components/tasks/TodoApp'), { ssr: true })

export const runtime = 'edge'

async function getTasks(projectId: number): Promise<Task[]> {
  return db.select().from(tasks).where(eq(tasks.projectId, projectId));
}

export default async function HomePage() {
  const projectId = 1; // You should get this from the user's context or URL params
  const initialTasks: Task[] = await getTasks(projectId);

  return (
    <TaskProvider initialTasks={initialTasks}>
      <TodoApp />
    </TaskProvider>
  );
}