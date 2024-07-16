'use client';

import React from 'react';
import { AddAgentDialog } from './AddAgentDialogue';
import { useAgentContext } from '~/contexts/AgentContext';

export function AddAgentButton() {
  const { handleAgentAdded } = useAgentContext();

  return <AddAgentDialog onAgentAdded={handleAgentAdded} />;
}