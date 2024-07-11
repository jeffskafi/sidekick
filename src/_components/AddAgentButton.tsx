'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function AddAgentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentSkill, setAgentSkill] = useState('');
  const router = useRouter();

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
          skill: agentSkill,
          projectId: 1, // Replace with actual project ID or selection
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add agent');
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error adding agent:', error);
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
        <form onSubmit={handleAddAgent}>
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
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="skill" className="text-right">
                Skill
              </Label>
              <Input
                id="skill"
                value={agentSkill}
                onChange={(e) => setAgentSkill(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Agent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}