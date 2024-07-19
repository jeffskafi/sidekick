"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAgentContext } from "~/contexts/AgentContext";
import { BottomSheet } from "./BottomSheet";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { AssignWorkPopup } from "./AssignWorkPopup";

export function AgentInfoDrawer() {
  const { selectedAgents, selectAgents } = useAgentContext();
  const pathname = usePathname();
  const [expandedAgentId, setExpandedAgentId] = useState<number | null>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isAgentsTab = pathname === "/" || pathname.includes("agents");

  const handleAssignWork = (agentId: number, task: string) => {
    console.log(`Assigning task "${task}" to agent ${agentId}`);
    // Implement your work assignment logic here
    setExpandedAgentId(null); // Close the popup after assigning work
  };
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expandedAgentId]);

  return (
    <BottomSheet
      isOpen={isAgentsTab && selectedAgents.length > 0}
      onClose={() => selectAgents([])}
    >
      <div
        ref={contentRef}
        className="p-4 text-black transition-all duration-300 ease-in-out"
        style={{ minHeight: contentHeight ? `${contentHeight}px` : "auto" }}
      >
        {" "}
        <h2 className="mb-4 text-lg font-semibold">Selected Agents</h2>
        {selectedAgents.map((agent) => (
          <div
            key={agent.id}
            className="relative mb-4 rounded-lg border border-gray-200 p-3 shadow-sm"
          >
            <h3 className="text-lg font-bold">{agent.name}</h3>
            <p className="text-sm text-gray-600">Status: {agent.status}</p>
            <p className="text-sm text-gray-600">
              Position: ({agent.xPosition}, {agent.yPosition})
            </p>
            <p className="mt-2 text-sm font-medium">Skills:</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {agent.skills?.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="relative mt-3">
              <Button
                className={`w-auto px-4 bg-white bg-opacity-70 backdrop-blur-[20px] border border-white border-opacity-20 text-gray-800 hover:bg-white hover:bg-opacity-80 transition-all duration-300 ${
                  expandedAgentId === agent.id ? 'shadow-lg' : ''
                }`}
                onClick={() =>
                  setExpandedAgentId(
                    expandedAgentId === agent.id ? null : agent.id,
                  )
                }
              >
                Assign Work
              </Button>
              <AnimatePresence>
                {expandedAgentId === agent.id && (
                  <AssignWorkPopup
                    agentName={agent.name}
                    onClose={() => setExpandedAgentId(null)}
                    onAssignWork={(task) => handleAssignWork(agent.id, task)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}