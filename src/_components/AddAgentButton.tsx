'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Agent } from "~/server/db/schema";

interface AddAgentButtonProps {
  onAgentAdded: (newAgent: Agent) => void;
  initialPosition?: { x: number; y: number };
}

interface SkillsResponse {
  results: string[];
}

export function AddAgentButton({ onAgentAdded, initialPosition }: AddAgentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentSkills, setAgentSkills] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillQuery, setSkillQuery] = useState('');

  const fetchSkills = useCallback(
    debounce(async (query: string) => {
      try {
        const response = await fetch(`/api/skills?query=${encodeURIComponent(query)}`);
        const data = await response.json() as SkillsResponse;
        setSkills(data.results);
      } catch (error) {
        console.error('Error fetching skills:', error);
        setSkills([]);
      }
    }, 50),
    []
  );

  useEffect(() => {
    if (skillQuery) {
      void fetchSkills(skillQuery);
    }
  }, [skillQuery, fetchSkills]);

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const skillsArray = agentSkills.split(',').map(skill => skill.trim()).filter(Boolean);

      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: agentName,
          skills: skillsArray,
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
      setAgentSkills('');
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
            <Label htmlFor="skills" className="text-right">
              Skills
            </Label>
            <Input
              id="skills"
              value={agentSkills}
              onChange={(e) => {
                setAgentSkills(e.target.value);
                setSkillQuery(e.target.value);
              }}
              className="col-span-3"
              placeholder="Enter skills separated by commas"
            />
          </div>
          <div>
            <Label className="text-right">Available Skills:</Label>
            <div className="mt-2">
              {skills.map((skill, index) => (
                <span key={index} className="mr-2">
                  {skill}
                </span>
              ))}
            </div>
          </div>
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

function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}