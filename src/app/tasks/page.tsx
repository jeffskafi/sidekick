import { TaskProvider } from "~/contexts/TaskContext";
import { db } from "~/server/db";
import { tasks, type Task } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import dynamic from 'next/dynamic'
import { auth } from "@clerk/nextjs/server";

const TodoApp = dynamic(() => import('~/_components/tasks/TodoApp'), { ssr: true })

export const runtime = 'edge'

async function getTasks(projectId: number, userId: string): Promise<Task[]> {
  const allTasks = await db.select().from(tasks).where(
    and(
      eq(tasks.projectId, projectId),
      eq(tasks.userId, userId)
    )
  );

  if (allTasks.length === 0) {
    return []; // Return an empty array if there are no tasks
  }

  // Create a map to store tasks by their ID
  const taskMap = new Map<number, Task & { subtasks: Task[] }>();

  // First pass: create task objects with empty subtasks arrays
  allTasks.forEach(task => {
    taskMap.set(task.id, { ...task, subtasks: [] });
  });

  // Second pass: populate subtasks
  allTasks.forEach(task => {
    if (task.parentId !== null) {
      const parentTask = taskMap.get(task.parentId);
      if (parentTask) {
        parentTask.subtasks.push(task);
      }
    }
  });

  // Return only top-level tasks (tasks without a parent)
  return Array.from(taskMap.values()).filter(task => task.parentId === null);
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