// components/AgentGroup.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Group, Circle, Text, Rect } from "react-konva";
import Konva from "konva";
import type { Agent } from "~/server/db/schema";

interface AgentGroupProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agent: Agent) => void;
  allAgents: Agent[]; // We need this to check for duplicate names
}

const AgentGroup: React.FC<AgentGroupProps> = ({ agent, isSelected, onSelect, allAgents }) => {

  // TODO: REMOVE AFTER TESTING
  // agent.status = 'task_complete';
  agent.status = 'working';
  // agent.status = 'needs_human_input';
  // agent.status = 'error';

  console.log('Agent:', agent);
  const [isHovered, setIsHovered] = useState(false);
  const hoverCircleRef = useRef<Konva.Circle>(null);
  const statusRectRef = useRef<Konva.Rect>(null);

  const handleClick = () => {
    onSelect(agent);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "task_complete": return "#4CAF50"; // Green
      case "working": return "#FF6F00"; // Amber
      case "needs_human_input": return "#FF6F00"; // Amber
      case "error": return "#F44336"; // Red
      default: return "#999"; // Grey for idle
    }
  };

  const getAgentIdentifier = (name: string) => {
    name = name.trim();

    if (name.length <= 2) {
      return name;
    }
    
    const baseIdentifier = name.slice(0, 2);
    const firstLetter = baseIdentifier[0]!.toUpperCase();
    const secondLetter = baseIdentifier[1]!.toLowerCase();
    const identifier = firstLetter + secondLetter;
    
    // Check for duplicate names
    const duplicates = allAgents.filter(a => a.name === name);
    if (duplicates.length > 1) {
      const index = duplicates.findIndex(a => a.id === agent.id) + 1;
      return `${firstLetter}${index}`;
    }
    
    return identifier;
  };

  // Create a memoized easing function
  const easeInOut = useCallback((t: number, b: number, c: number, d: number): number => {
    return Konva.Easings.EaseInOut(t, b, c, d) as number;
  }, []);

  useEffect(() => {
    if (hoverCircleRef.current) {
      const tween = new Konva.Tween({
        node: hoverCircleRef.current,
        duration: 0.2,
        easing: easeInOut,
        strokeWidth: isHovered || isSelected ? 2 : 0,
      });
      tween.play();
    }

    let anim: Konva.Animation | null = null;

    // Add morphing animation for the status indicator when status is 'working'
    if (statusRectRef.current && agent.status === 'working') {
      anim = new Konva.Animation((frame) => {
        if (frame && statusRectRef.current) {
          const size = 10; // Base size of the status indicator
          const minCornerRadius = size / 6; // Minimum corner radius (more square-like)
          const maxCornerRadius = size / 2; // Maximum corner radius (circle-like)
          
          // Calculate corner radius based on time
          const cornerRadius = minCornerRadius + (maxCornerRadius - minCornerRadius) * 
            (Math.sin(frame.time * 2 * Math.PI / 2000) + 1) / 2;
          
          statusRectRef.current.cornerRadius(cornerRadius);
        }
      }, [statusRectRef.current.getLayer()]);
      anim.start();
    }

    return () => {
      if (anim) {
        anim.stop();
      }
    };
  }, [agent.status, isHovered, isSelected, easeInOut]);

  return (
    <Group
      x={agent.xPosition}
      y={agent.yPosition}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover effect with easing (now first, so it's drawn behind other elements) */}
      <Circle
        ref={hoverCircleRef}
        radius={32}
        stroke="#5c5c5c"
        strokeWidth={0}
      />
      {/* Main circle */}
      <Circle
        radius={30}
        fill="#f0f0f0"
        stroke={getStatusColor(agent.status)}
        strokeWidth={2}
      />
      {/* Status indicator */}
      <Rect
        ref={statusRectRef}
        width={10}
        height={10}
        fill={getStatusColor(agent.status)}
        x={-5}
        y={-5}
        cornerRadius={5} // Start with rounded corners
      />
      {/* Agent ID badge */}
      <Group x={-20} y={-20}>
        <Circle
          radius={10}
          fill="#5c5c5c"
        />
        <Text
          text={getAgentIdentifier(agent.name)}
          fontSize={10}
          fill="#f0f0f0"
          width={20}
          height={20}
          align="center"
          verticalAlign="middle"
          offsetX={10}
          offsetY={10}
        />
      </Group>
    </Group>
  );
};

export default AgentGroup;