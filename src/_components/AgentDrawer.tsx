'use client';

import React from "react";
import { useAgentContext } from "~/contexts/AgentContext";
import {
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "~/components/ui/drawer";
import { X } from "lucide-react";

const AgentDrawer: React.FC = () => {
  const { selectedAgents } = useAgentContext();

  return (
    <div>
      <DrawerHeader className="relative">
        <DrawerClose className="absolute right-2 top-2">
          <X className="h-4 w-4" />
        </DrawerClose>
        <DrawerTitle>Agent Data</DrawerTitle>
        <DrawerDescription>View and manage your agents</DrawerDescription>
      </DrawerHeader>
      <div className="overflow-auto p-4">
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
      </div>
      <DrawerFooter>
        <p>Total Agents: {selectedAgents.length}</p>
      </DrawerFooter>
    </div>
  );
};

export default AgentDrawer;