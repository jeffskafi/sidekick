'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Stage, Layer, Circle, Text, Group, Rect } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Agent } from './AgentCanvasWrapper';
import styles from './ContextMenu.module.css';

interface AgentCanvasProps {
  agents: Agent[];
  onSelect: (agent: Agent | Agent[]) => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agentId: number) => void;
}

const AgentCanvas: React.FC<AgentCanvasProps> = ({ agents, onSelect, onEdit, onDelete }) => {
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [selectionArea, setSelectionArea] = useState<{ start: { x: number, y: number } | null, end: { x: number, y: number } | null }>({ start: null, end: null });
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, agent: Agent } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeStage = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    resizeStage();
    window.addEventListener('resize', resizeStage);
    return () => window.removeEventListener('resize', resizeStage);
  }, []);

  const handleAgentClick = useCallback((agent: Agent, event: KonvaEventObject<MouseEvent>) => {
    event.cancelBubble = true;
    setSelectedAgents([agent]);
    onSelect(agent);
  }, [onSelect]);

  const handleStageMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectionArea({ start: e.target.getStage().getPointerPosition()!, end: null });
      setIsDragging(true);
      setContextMenu(null);
    }
  }, []);

  const handleStageMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (isDragging) {
      setSelectionArea(prev => ({ ...prev, end: e.target.getStage()!.getPointerPosition()! }));
    }
  }, [isDragging]);

  const handleStageMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      const selected = agents.filter(agent => {
        if (!selectionArea.start || !selectionArea.end) return false;
        const x1 = Math.min(selectionArea.start.x, selectionArea.end.x);
        const x2 = Math.max(selectionArea.start.x, selectionArea.end.x);
        const y1 = Math.min(selectionArea.start.y, selectionArea.end.y);
        const y2 = Math.max(selectionArea.start.y, selectionArea.end.y);
        return agent.xPosition >= x1 && agent.xPosition <= x2 && agent.yPosition >= y1 && agent.yPosition <= y2;
      });
      setSelectedAgents(selected);
      onSelect(selected);
      setSelectionArea({ start: null, end: null });
    }
  }, [agents, isDragging, onSelect, selectionArea]);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>, agent: Agent) => {
    const node = e.target;
    const updatedAgent = { ...agent, xPosition: node.x(), yPosition: node.y() };
    onSelect(updatedAgent);
  };

  const handleContextMenu = useCallback((e: KonvaEventObject<PointerEvent>, agent: Agent) => {
    e.evt.preventDefault();
    if (stageRef.current) {
      const stage = stageRef.current;
      const pointerPosition = stage.getPointerPosition();
      if (pointerPosition) {
        setContextMenu({
          x: pointerPosition.x,
          y: pointerPosition.y,
          agent: agent
        });
      }
    }
  }, []);

  const handleStageClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '600px', background: '#f0f0f0', position: 'relative' }}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
      >
        <Layer>
          {agents.map((agent) => (
            <Group
              key={agent.id}
              x={agent.xPosition}
              y={agent.yPosition}
              draggable
              onClick={(e) => handleAgentClick(agent, e)}
              onDragEnd={(e) => handleDragEnd(e, agent)}
              onContextMenu={(e) => handleContextMenu(e, agent)}
            >
              <Circle
                radius={30}
                fill={agent.status === 'idle' ? '#3498db' : '#e74c3c'}
                stroke={selectedAgents.some(a => a.id === agent.id) ? 'yellow' : 'black'}
                strokeWidth={selectedAgents.some(a => a.id === agent.id) ? 4 : 1}
              />
              <Text
                text={agent.name}
                fontSize={14}
                fill="black"
                width={60}
                align="center"
                y={40}
                offsetX={30}
              />
            </Group>
          ))}
          {selectionArea.start && selectionArea.end && (
            <Rect
              x={Math.min(selectionArea.start.x, selectionArea.end.x)}
              y={Math.min(selectionArea.start.y, selectionArea.end.y)}
              width={Math.abs(selectionArea.end.x - selectionArea.start.x)}
              height={Math.abs(selectionArea.end.y - selectionArea.start.y)}
              fill="rgba(0, 0, 255, 0.1)"
              stroke="blue"
            />
          )}
        </Layer>
      </Stage>
      {contextMenu && (
        <div className={styles.contextMenu} style={{
          top: contextMenu.y,
          left: contextMenu.x,
        }}>
          <div className={styles.contextMenuItem} onClick={() => { onEdit(contextMenu.agent); setContextMenu(null); }}>
            Assign Task
          </div>
          <div className={styles.contextMenuItem} onClick={() => { onDelete(contextMenu.agent.id); setContextMenu(null); }}>
            Delete {contextMenu.agent.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCanvas;