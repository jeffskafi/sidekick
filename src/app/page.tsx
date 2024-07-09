'use client';

import dummyData from '../server/db/dummyData.json';
import AgentSidebar from '../components/AgentSidebar';
import { useState } from 'react';
import type { Agent } from '../components/AgentCanvas'; // Use import type
import dynamic from 'next/dynamic';
import ClientOnly from '../components/ClientOnly';

const AgentCanvas = dynamic(() => import('../components/AgentCanvas'), { ssr: false });

export default function HomePage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleSelectAgent = (agent: Agent) => { // Add type annotation
    setSelectedAgent(agent);
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-8 flex">
        <div className="w-3/4 pr-4">
          <h1 className="text-4xl font-bold mb-8">Command Center Dashboard</h1>
          <ClientOnly>
            <AgentCanvas agents={dummyData.agents} onSelect={handleSelectAgent} />
          </ClientOnly>
        </div>
        <div className="w-1/4 bg-gray-800 p-4">
          <AgentSidebar selectedAgent={selectedAgent} />
        </div>
      </div>
    </main>
  );
}