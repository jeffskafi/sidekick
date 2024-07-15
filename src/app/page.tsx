import { Suspense } from "react";
import dynamic from "next/dynamic";
import { db } from "../server/db";
import { agents, skills, agentSkills } from "../server/db/schema";
import { eq } from "drizzle-orm";
import type { Agent } from "~/server/db/schema";
import { AddProjectButton } from "../_components/AddProjectButton";
import { AgentProvider } from "../contexts/AgentContext";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";

const DynamicAgentCanvas = dynamic(() => import("../_components/AgentCanvas/AgentCanvas"), { ssr: false });
const DynamicAgentSidebar = dynamic(() => import("../_components/AgentSidebar"), { ssr: false });
const DynamicAgentDrawer = dynamic(() => import("../_components/AgentDrawer"), { ssr: false });

async function getAgents(): Promise<Agent[]> {
  const agentsQuery = db
    .select({
      id: agents.id,
      projectId: agents.projectId,
      name: agents.name,
      status: agents.status,
      xPosition: agents.xPosition,
      yPosition: agents.yPosition,
      createdAt: agents.createdAt,
      updatedAt: agents.updatedAt,
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

  const [agentsResult, skillsResult] = await Promise.all([agentsQuery, skillsQuery]);

  const skillsMap = new Map<number, string[]>();
  for (const { agentId, skillName } of skillsResult) {
    if (!skillsMap.has(agentId)) {
      skillsMap.set(agentId, []);
    }
    skillsMap.get(agentId)!.push(skillName);
  }

  return agentsResult.map(agent => ({
    ...agent,
    skills: skillsMap.get(agent.id) ?? [],
  }));
}

export default async function HomePage() {
  const initialAgents = await getAgents();

  return (
    <AgentProvider initialAgents={initialAgents}>
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container mx-auto flex flex-col px-4 py-8 h-screen">
          <h1 className="mb-8 text-4xl font-bold">Dashboard</h1>
          <div className="flex space-x-4 mb-4">
            <AddProjectButton />
          </div>
          <div className="flex flex-grow">
            <Suspense fallback={<div>Loading Canvas...</div>}>
              <DynamicAgentCanvas />
            </Suspense>
            <Suspense fallback={<div>Loading Sidebar...</div>}>
              <DynamicAgentSidebar />
            </Suspense>
          </div>
          <Drawer>
            <DrawerTrigger asChild>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                Show Agent Data
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DynamicAgentDrawer />
            </DrawerContent>
          </Drawer>
        </div>
      </main>
    </AgentProvider>
  );
}