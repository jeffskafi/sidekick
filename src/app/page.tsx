import { Suspense } from "react";
import dynamic from "next/dynamic";
import { db } from "../server/db";
import { agents, skills, agentSkills, tasks } from "../server/db/schema";
import { eq } from "drizzle-orm";
import type { Agent, Task } from "~/server/db/schema";
import { AgentProvider } from "../contexts/AgentContext";
import { AddAgentButton } from "../_components/AddAgentButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { WorkContent } from "../_components/WorkContent";
import { TaskProvider } from "../contexts/TaskContext";

const DynamicAgentCanvas = dynamic(
  () => import("../_components/AgentCanvas/AgentCanvas"),
  { ssr: false },
);
import { AgentInfoDrawer } from "../_components/AgentInfoDrawer";

async function getAgents(): Promise<Agent[]> {
  const agentsQuery = db
    .select({
      id: agents.id,
      projectId: agents.projectId,
      userId: agents.userId,
      name: agents.name,
      status: agents.status,
      xPosition: agents.xPosition,
      yPosition: agents.yPosition,
      createdAt: agents.createdAt,
      updatedAt: agents.updatedAt,
      openaiAssistantId: agents.openaiAssistantId,
    })
    .from(agents)
    .orderBy(agents.id);

  const skillsQuery = db
    .select({
      agentId: agentSkills.agentId,
      skillName: skills.name,
    })
    .from(agentSkills)
    .innerJoin(skills, eq(agentSkills.skillId, skills.id));

  const [agentsResult, skillsResult] = await Promise.all([
    agentsQuery,
    skillsQuery,
  ]);

  const skillsMap = new Map<number, string[]>();
  for (const { agentId, skillName } of skillsResult) {
    if (!skillsMap.has(agentId)) {
      skillsMap.set(agentId, []);
    }
    skillsMap.get(agentId)!.push(skillName);
  }

  return agentsResult.map((agent) => ({
    ...agent,
    skills: skillsMap.get(agent.id) ?? [],
  }));
}

async function getTasks(projectId: number): Promise<Task[]> {
  const tasksQuery = db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(tasks.id);

  return tasksQuery;
}

export default async function HomePage() {
  const projectId = 1; // You should get this from the user's context or URL params
  const initialAgents = await getAgents();
  const initialTasks = await getTasks(projectId);

  return (
    <AgentProvider initialAgents={initialAgents}>
      <TaskProvider initialTasks={initialTasks}>
        <HomePageContent />
      </TaskProvider>
    </AgentProvider>
  );
}

function HomePageContent() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="flex h-screen flex-col">
        <div className="flex-grow overflow-hidden">
          <Tabs defaultValue="agents" className="flex h-full flex-col">
            <TabsList className="mb-4 justify-start">
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="work">Work</TabsTrigger>
            </TabsList>
            <div className="flex-grow overflow-hidden">
              <TabsContent value="agents" className="h-full">
                <div className="flex h-full flex-col">
                  <div className="mb-4">
                    <AddAgentButton />
                  </div>
                  <div className="relative flex-grow">
                    <Suspense fallback={<div>Loading Canvas...</div>}>
                      <DynamicAgentCanvas className="absolute inset-0" />
                    </Suspense>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="work" className="h-full">
                <WorkContent />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      <AgentInfoDrawer />
    </main>
  );
}