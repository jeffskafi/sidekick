'use client';

import React from 'react';
import { Label } from "~/components/ui/label";

interface SelectedSkillsProps {
  agentSkills: { id: string; name: string }[];
}

export function SelectedSkills({ agentSkills }: SelectedSkillsProps) {
  return (
    <div>
      <Label className="text-right">Selected Skills:</Label>
      <div className="mt-2">
        {agentSkills.map((skill, index) => (
          <span key={index} className="mr-2">
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
}