import { Suspense } from "react";
import dynamic from "next/dynamic";
import { db } from "../server/db";
import { agents, skills, agentSkills } from "../server/db/schema";
import { eq } from "drizzle-orm";
import type { Agent } from "~/server/db/schema";
import { AgentProvider } from "../contexts/AgentContext";
import { AddAgentButton } from "../_components/AddAgentButton";

const DynamicAgentCanvas = dynamic(() => import("../_components/AgentCanvas/AgentCanvas"), { ssr: false });
import { AgentInfoDrawer } from "../_components/AgentInfoDrawer";

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
      <HomePageContent initialAgents={initialAgents} />
    </AgentProvider>
  );
}

function HomePageContent({ initialAgents }: { initialAgents: Agent[] }) {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="flex-grow flex flex-col h-[calc(100vh-4rem)]">
        <header className="p-4 bg-gray-900">
          <h1 className="text-2xl font-bold">Agent Management</h1>
          <AddAgentButton />
        </header>
        <Suspense fallback={<div>Loading Canvas...</div>}>
          <DynamicAgentCanvas className="w-full h-full" />
        </Suspense>
        <AgentInfoDrawer />
      </div>
    </main>
  );
}