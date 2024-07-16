"use client";

import React from "react";
import { useAgentContext } from "~/contexts/AgentContext";
import { BottomSheet } from "./BottomSheet";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { usePathname } from "next/navigation";

export function AgentInfoDrawer() {
  const { selectedAgents, selectAgents } = useAgentContext();
  const pathname = usePathname();

  // Only show the drawer if we're on the agents tab
  const isAgentsTab = pathname === "/" || pathname.includes("agents");

  return (
    <BottomSheet isOpen={isAgentsTab && selectedAgents.length > 0} onClose={() => selectAgents([])}>
      <div className="p-4 text-black">
        <h2 className="mb-4 text-lg font-semibold">Selected Agents</h2>
        {selectedAgents.map((agent) => (
          <div key={agent.id} className="mb-2">
            <h3 className="font-bold">{agent.name}</h3>
            <p>Status: {agent.status}</p>
            <p>Position: ({agent.xPosition}, {agent.yPosition})</p>
            <p className="mt-2">Skills:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {agent.skills?.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
            <Button className="mt-2" onClick={() => {
              // TODO: Add work to the agent
            }}>Give Work</Button>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}