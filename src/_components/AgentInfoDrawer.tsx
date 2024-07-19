"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAgentContext } from "~/contexts/AgentContext";
import { BottomSheet } from "./BottomSheet";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select";
import { X } from "lucide-react"; // Make sure to import the X icon from lucide-react

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
        style={{ minHeight: contentHeight ? `${contentHeight}px` : 'auto' }}
      >
        <h2 className="mb-4 text-lg font-semibold">Selected Agents</h2>
        {selectedAgents.map((agent) => (
          <div key={agent.id} className="mb-4 border border-gray-200 p-3 rounded-lg shadow-sm relative">
            <h3 className="font-bold text-lg">{agent.name}</h3>
            <p className="text-sm text-gray-600">Status: {agent.status}</p>
            <p className="text-sm text-gray-600">Position: ({agent.xPosition}, {agent.yPosition})</p>
            <p className="mt-2 text-sm font-medium">Skills:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {agent.skills?.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="relative mt-3">
              <Button
                className="w-auto px-4"
                onClick={() => setExpandedAgentId(expandedAgentId === agent.id ? null : agent.id)}
              >
                {expandedAgentId === agent.id ? "Close" : "Assign Work"}
              </Button>
              <AnimatePresence>
                {expandedAgentId === agent.id && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
                      onClick={() => setExpandedAgentId(null)}
                    />
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ 
                        originX: 0, 
                        originY: 0,
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        left: '10px',
                      }}
                      className="bg-white bg-opacity-70 backdrop-blur-md rounded-md shadow-lg border border-white border-opacity-20 max-w-md w-max z-50"
                    >
                      <div className="p-3 relative">
                        <button 
                          onClick={() => setExpandedAgentId(null)}
                          className="absolute top-2 left-2 text-gray-500 hover:text-gray-700"
                        >
                          <X size={20} />
                        </button>
                        <p className="text-sm mb-3 font-bold text-gray-800 pl-8">
                          Select a task to assign to {agent.name}:
                        </p>
                        <div className="bg-white bg-opacity-50 p-2 rounded">
                          <Select onValueChange={(value) => handleAssignWork(agent.id, value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose a task" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="task1">Patrol Area A</SelectItem>
                              <SelectItem value="task2">Investigate Anomaly B</SelectItem>
                              <SelectItem value="task3">Collect Resources at Point C</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}