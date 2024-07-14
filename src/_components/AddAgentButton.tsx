'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverTrigger } from "~/components/ui/popover";
import type { Agent } from "~/server/db/schema";

interface AddAgentButtonProps {
  onAgentAdded: (newAgent: Agent) => void;
  initialPosition?: { x: number; y: number };
}

interface Skill {
  id: string; 
  name: string;
}

export function AddAgentButton(props: AddAgentButtonProps) {
  const { onAgentAdded, initialPosition } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentSkills, setAgentSkills] = useState<{ id: string; name: string }[]>([]);
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [skillQuery, setSkillQuery] = useState('');
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);

  const fetchSkills = useCallback(
    (query: string) => {
      const debouncedFetchSkills = debounce(async () => {
        try {
          const response = await fetch(`/api/skills?query=${encodeURIComponent(query)}`);
          const data = await response.json() as Skill[];
          setSkills(data || []);
        } catch (error) {
          setSkills([]);
        }
      }, 10);

      void debouncedFetchSkills();
    },
    []
  );

  useEffect(() => {
    if (skillQuery) {
      fetchSkills(skillQuery);
      setIsSkillsOpen(true);
    } else {
      setIsSkillsOpen(false);
    }
  }, [skillQuery, fetchSkills]);

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

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillQuery(e.currentTarget.value);
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="skills" className="text-right">
              Skills
            </Label>
            <Popover open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
              <PopoverTrigger asChild>
                <div className="col-span-3 relative">
                  <Input
                    id="skills"
                    value={skillQuery}
                    onChange={handleSkillInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter skills"
                    autoComplete="off"
                  />
                  {isSkillsOpen && skillQuery && (
                    <div className="absolute z-10 mt-2 w-full rounded-md border border-gray-300 bg-white py-2 shadow-lg">
                      {skills.length > 0 ? (
                        skills.map((skill, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setAgentSkills((prevSkills) => {
                                const skillsArray = prevSkills.map(s => s.name);
                                if (!skillsArray.includes(skill.name)) {
                                  return [...prevSkills, skill];
                                }
                                return prevSkills;
                              });
                              setSkillQuery('');
                              setIsSkillsOpen(false);
                            }}
                          >
                            {skill.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2">No skills found.</div>
                      )}
                    </div>
                  )}
                </div>
              </PopoverTrigger>
            </Popover>
          </div>
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
function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
    return func;
  }) as T;
}
