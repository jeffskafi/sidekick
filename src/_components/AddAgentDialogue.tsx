import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { SkillInput } from './SkillInput';
import { SelectedSkills } from './SelectedSkills';
import type { Agent } from "~/server/db/schema";

interface AddAgentDialogProps {
  onAgentAdded: (newAgent: Agent) => void;
  initialPosition?: { x: number; y: number };
}

export function AddAgentDialog({ onAgentAdded, initialPosition }: AddAgentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentSkills, setAgentSkills] = useState<{ id: string; name: string }[]>([]);

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: agentName,
          skills: agentSkills.map(skill => skill.name),
          projectId: 1, // Replace with actual project ID or selection
          xPosition: initialPosition?.x ?? 0,
          yPosition: initialPosition?.y ?? 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add agent');
      }

      const newAgent: Agent = await response.json() as Agent;
      onAgentAdded(newAgent);
      setIsOpen(false);
      setAgentName('');
      setAgentSkills([]);
    } catch (error) {
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Add Agent</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="col-span-3"
              autoComplete="off"
            />
          </div>
          <SkillInput agentSkills={agentSkills} setAgentSkills={setAgentSkills} />
          <SelectedSkills agentSkills={agentSkills} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} onClick={handleAddAgent}>
            {isLoading ? 'Adding...' : 'Add Agent'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}