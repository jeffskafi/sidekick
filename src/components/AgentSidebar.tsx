'use client';

import React from 'react';
import type { Agent } from './AgentCanvas'; // Use import type

interface AgentSidebarProps {
  selectedAgent: Agent | null;
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ selectedAgent }) => {
  if (!selectedAgent) {
    return <div className="p-4">Select an agent to see details</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{selectedAgent.name}</h2>
      <p>Status: {selectedAgent.status}</p>
      <p>Position: ({selectedAgent.xPosition}, {selectedAgent.yPosition})</p>
      <h3 className="text-lg font-semibold mt-4">Skills:</h3>
      <ul>
        {Object.entries(selectedAgent.skills).map(([skill, values]) => (
          <li key={skill}>{skill}: {values.join(', ')}</li>
        ))}
      </ul>
      <p>Created: {new Date(selectedAgent.createdAt).toLocaleString()}</p>
      <p>Updated: {new Date(selectedAgent.updatedAt).toLocaleString()}</p>
    </div>
  );
};

export default AgentSidebar;