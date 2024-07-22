import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Agent } from "~/server/db/schema";

interface AssignWorkPopupProps {
  agents: Agent[];
  onClose: () => void;
  onAssign: (agentId: number) => void;
}

export const AssignWorkPopup: React.FC<AssignWorkPopupProps> = ({ agents, onClose, onAssign }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white p-4 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Assign Task to Agent</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <ul>
          {agents.map((agent) => (
            <li key={agent.id} className="mb-2">
              <Button onClick={() => onAssign(agent.id)} className="w-full">
                {agent.name}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};