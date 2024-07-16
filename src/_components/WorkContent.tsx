"use client";

import { useState } from "react";
import { useAgentContext } from "~/contexts/AgentContext";

export function WorkContent() {
  const { agents } = useAgentContext();
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [taskInput, setTaskInput] = useState("");

  const handleAgentSelect = (agentId: number) => {
    setSelectedAgent(agentId);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement task submission logic
    console.log(`Assigning task "${taskInput}" to agent ${selectedAgent}`);
    setTaskInput("");
  };

  return (
    <div className="flex h-full">
      <div className="w-1/3 overflow-y-auto bg-gray-800 p-4">
        <h2 className="mb-4 text-xl font-bold">Agents</h2>
        <ul>
          {agents.map((agent) => (
            <li
              key={agent.id}
              className={`mb-2 cursor-pointer rounded p-2 ${
                selectedAgent === agent.id ? "bg-blue-600" : "bg-gray-700"
              }`}
              onClick={() => handleAgentSelect(agent.id)}
            >
              {agent.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-2/3 overflow-y-auto bg-gray-700 p-4">
        <h2 className="mb-4 text-xl font-bold">Task Management</h2>
        {selectedAgent ? (
          <form onSubmit={handleTaskSubmit}>
            <textarea
              className="mb-4 w-full rounded bg-gray-800 p-2 text-white"
              rows={4}
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Enter task description..."
            />
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Assign Task
            </button>
          </form>
        ) : (
          <p>Select an agent to assign tasks</p>
        )}
      </div>
    </div>
  );
}
