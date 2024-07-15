"use client";

import React from "react";
import { useAgentContext } from "~/contexts/AgentContext";
import { BottomSheet } from "./BottomSheet";

export function AgentInfoDrawer() {
  const { selectedAgents, selectAgents } = useAgentContext();

  return (
    <BottomSheet isOpen={selectedAgents.length > 0} onClose={() => selectAgents([])}>
      <div className="p-4 text-black">
        <h2 className="mb-4 text-lg font-semibold">Selected Agents</h2>
        {selectedAgents.map((agent) => (
          <div key={agent.id} className="mb-2">
            <h3 className="font-bold">{agent.name}</h3>
            <p>Status: {agent.status}</p>
            <p>Position: ({agent.xPosition}, {agent.yPosition})</p>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}