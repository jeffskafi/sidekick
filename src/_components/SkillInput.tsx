'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Popover, PopoverTrigger } from "~/components/ui/popover";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface Skill {
  id: string;
  name: string;
}

interface SkillInputProps {
  agentSkills: { id: string; name: string }[];
  setAgentSkills: React.Dispatch<
    React.SetStateAction<{ id: string; name: string }[]>
  >;
}

export function SkillInput(props: SkillInputProps) {
  const { setAgentSkills } = props;
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);

  const fetchSkills = useCallback((query: string) => {
    const debouncedFetchSkills = debounce(async () => {
      try {
        const response = await fetch(
          `/api/skills?query=${encodeURIComponent(query)}`,
        );
        const data = (await response.json()) as Skill[];
        setSkills(data || []);
      } catch (error) {
        setSkills([]);
      }
    }, 10);

    void debouncedFetchSkills();
  }, []);

  useEffect(() => {
    if (skillQuery) {
      fetchSkills(skillQuery);
      setIsSkillsOpen(true);
    } else {
      setIsSkillsOpen(false);
    }
  }, [skillQuery, fetchSkills]);

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillQuery(e.currentTarget.value);
  };

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="skills" className="text-right">
        Skills
      </Label>
      <Popover open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
        <PopoverTrigger asChild>
          <div className="relative col-span-3">
            <Input
              id="skills"
              value={skillQuery}
              onChange={handleSkillInputChange}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter skills"
              autoComplete="off"
            />
            {isSkillsOpen && skillQuery && (
              <div className="absolute z-10 mt-2 w-full rounded-md border border-gray-300 bg-white py-2 shadow-lg">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <div
                      key={index}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setAgentSkills((prevSkills) => {
                          const skillsArray = prevSkills.map((s) => s.name);
                          if (!skillsArray.includes(skill.name)) {
                            return [...prevSkills, skill];
                          }
                          return prevSkills;
                        });
                        setSkillQuery("");
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
  );
}

function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  delay: number,
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