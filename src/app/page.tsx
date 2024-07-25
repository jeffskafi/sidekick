import { AgentProvider } from "../contexts/AgentContext";
import { TaskProvider } from "../contexts/TaskContext";
import { db } from "~/server/db";
import { agents, tasks, type Agent, type Task } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import TodoApp from "~/_components/TodoApp";

async function getAgents(): Promise<Agent[]> {
  return db.select().from(agents);
}

async function getTasks(projectId: number): Promise<Task[]> {
  return db.select().from(tasks).where(eq(tasks.projectId, projectId));
}

export default async function HomePage() {
  const projectId = 1; // You should get this from the user's context or URL params
  const initialAgents: Agent[] = await getAgents();
  const initialTasks: Task[] = await getTasks(projectId);

  return (
    <AgentProvider initialAgents={initialAgents}>
      <TaskProvider initialTasks={initialTasks}>
        <TodoApp />
      </TaskProvider>
    </AgentProvider>
  );
}
