import { Suspense } from "react";
import dynamic from "next/dynamic";
import ClientOnly from "../components/ClientOnly";
import { db } from "../server/db";
import { agents, skills, agentSkills } from "../server/db/schema";
import { eq } from "drizzle-orm";
import type { Agent } from "../components/AgentCanvasWrapper";
import { AddAgentButton } from "../components/AddAgentButton";
import { AddProjectButton } from "../components/AddProjectButton";

const AgentCanvasWrapper = dynamic(
  () => import("../components/AgentCanvasWrapper"),
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
      skills: skills.name,
    })
    .from(agents)
    .leftJoin(agentSkills, eq(agents.id, agentSkills.agentId))
    .leftJoin(skills, eq(agentSkills.skillId, skills.id));

  // Group skills for each agent
  const groupedAgents = agentsWithSkills.reduce(
    (acc, curr) => {
      if (!acc[curr.id]) {
        acc[curr.id] = {
          ...curr,
          skills: curr.skills ? [curr.skills] : [],
        };
      } else if (curr.skills) {
        acc[curr.id]?.skills?.push(curr.skills) ?? (acc[curr.id]!.skills = [curr.skills]);
      }
      return acc;
    },
    {} as Record<
      number,
      {
        id: number;
        projectId: number;
        name: string;
        status: string;
        xPosition: number;
        yPosition: number;
        createdAt: Date;
        updatedAt: Date | null;
        skills: string[];
      }
    >,
  );

  return Object.values(groupedAgents);
}

export default async function HomePage() {
  const agents = await getAgents();

  return <HomePageClient agents={agents} />;
}

function HomePageClient({ agents }: { agents: Agent[] }) {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto flex px-4 py-8">
        <div className="w-3/4 pr-4">
          <h1 className="mb-8 text-4xl font-bold">Command Center Dashboard</h1>
          <div className="flex space-x-4 mb-4">
            <AddProjectButton />
            <AddAgentButton />
          </div>
          <ClientOnly>
            <Suspense fallback={<div>Loading...</div>}>
              <AgentCanvasWrapper agents={agents} />
            </Suspense>
          </ClientOnly>
        </div>
      </div>
    </main>
  );
}