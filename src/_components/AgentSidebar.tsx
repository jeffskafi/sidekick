'use client';

import React from 'react';
import type { Agent } from '~/server/db/schema';

interface AgentSidebarProps {
  selectedAgents: Agent[];
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ selectedAgents }) => {
  if (selectedAgents.length === 0) {
    return <div className="p-4">Select one or more agents to see details</div>;
  }

  if (selectedAgents.length === 1) {
    const agent = selectedAgents[0];
    if (!agent) return null;

    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">{agent.name}</h2>
        <p>Status: {agent.status}</p>
        <p>Position: ({agent.xPosition}, {agent.yPosition})</p>
        <h3 className="text-lg font-semibold mt-4">Skills:</h3>
        <ul>
          {agent.skills?.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
        <p>Created: {agent.createdAt.toLocaleString()}</p>
        <p>Updated: {agent.updatedAt?.toLocaleString() ?? 'N/A'}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Selected Agents: {selectedAgents.length}</h2>
      <ul>
        {selectedAgents.map(agent => (
          <li key={agent.id} className="mb-2">
            <strong>{agent.name}</strong> - Status: {agent.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AgentSidebar;