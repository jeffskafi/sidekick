"use client";

import React from "react";
import { useAgentContext } from "~/contexts/AgentContext";
import { BottomSheet } from "./BottomSheet";

export function AgentDrawer() {
  const { selectedAgents, selectAgents } = useAgentContext();

  return (
    <BottomSheet isOpen={selectedAgents.length > 0} onClose={() => selectAgents([])}>
      <div className="p-4 text-black">
        {selectedAgents.map((agent) => (
          <div key={agent.id} className="mb-4 rounded border p-2">
            <h3 className="font-bold">{agent.name}</h3>
            <p>Status: {agent.status}</p>
            <p>
              Position: ({agent.xPosition}, {agent.yPosition})
            </p>
            <p>Skills: {agent.skills?.join(", ") ?? "None"}</p>
          </div>
        ))}
        <p className="mt-4">Total Agents: {selectedAgents.length}</p>
      </div>
    </BottomSheet>
  );
}