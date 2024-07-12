import { Suspense } from "react";
import dynamic from "next/dynamic";
import ClientOnly from "../_components/ClientOnly";
import { db } from "../server/db";
import { agents, skills, agentSkills } from "../server/db/schema";
import { eq, sql } from "drizzle-orm";
import type { Agent } from "~/server/db/schema";
import { AddProjectButton } from "../_components/AddProjectButton";

const AgentCanvasWrapper = dynamic(
  () => import("../_components/AgentCanvas/AgentCanvasWrapper"),
  {
    ssr: false,
  }
);

async function getAgents(): Promise<Agent[]> {
  const agentsWithSkills = await db
    .select({
      id: agents.id,
      projectId: agents.projectId,
      name: agents.name,
      status: agents.status,
      xPosition: agents.xPosition,
      yPosition: agents.yPosition,
      createdAt: agents.createdAt,
      updatedAt: agents.updatedAt,
      skills: sql<string[]>`array_agg(${skills.name})`,
    })
    .from(agents)
    .leftJoin(agentSkills, eq(agents.id, agentSkills.agentId))
    .leftJoin(skills, eq(agentSkills.skillId, skills.id))
    .groupBy(agents.id)
    .orderBy(agents.id);

  return agentsWithSkills;
}

export default async function HomePage() {
  const agents = await getAgents();

  return <HomePageClient initialAgents={agents} />;
}

function HomePageClient({ initialAgents }: { initialAgents: Agent[] }) {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto flex flex-col px-4 py-8 h-screen">
        <h1 className="mb-8 text-4xl font-bold">Dashboard</h1>
        <div className="flex space-x-4 mb-4">
          <AddProjectButton />
        </div>
        <div className="flex-grow">
          <ClientOnly>
            <Suspense fallback={<div>Loading...</div>}>
              <AgentCanvasWrapper agents={initialAgents} />
            </Suspense>
          </ClientOnly>
        </div>
      </div>
    </main>
  );
}