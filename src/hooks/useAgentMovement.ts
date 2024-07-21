import { useCallback } from 'react';
import type Konva from 'konva';
import { easeInOut } from '../helpers/movement';
import type { Agent } from '~/server/db/schema';

const CELL_SIZE = 65; // Size of each grid cell, should be at least the agent's diameter

type GridCell = {
  x: number;
  y: number;
  occupied: boolean;
};

function createGrid(width: number, height: number, agents: Agent[]): GridCell[][] {
  const gridWidth = Math.ceil(width / CELL_SIZE);
  const gridHeight = Math.ceil(height / CELL_SIZE);
  const grid: GridCell[][] = Array.from({ length: gridHeight }, (_, y) =>
    Array.from({ length: gridWidth }, (_, x) => ({
      x: x * CELL_SIZE,
      y: y * CELL_SIZE,
      occupied: false
    }))
  );

  // Mark cells as occupied based on current agent positions
  agents.forEach(agent => {
    const cellX = Math.floor(agent.xPosition / CELL_SIZE);
    const cellY = Math.floor(agent.yPosition / CELL_SIZE);
    if (grid[cellY]?.[cellX]) {
      grid[cellY][cellX].occupied = true;
    }
  });

  return grid;
}

function findNearestFreeCell(grid: GridCell[][], targetX: number, targetY: number): GridCell | null {
  const targetCellX = Math.floor(targetX / CELL_SIZE);
  const targetCellY = Math.floor(targetY / CELL_SIZE);

  let nearestFreeCell: GridCell | null = null;
  let minDistance = Infinity;

  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    if (row) {
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        if (cell && !cell.occupied) {
          const distance = Math.sqrt(Math.pow(x - targetCellX, 2) + Math.pow(y - targetCellY, 2));
          if (distance < minDistance) {
            minDistance = distance;
            nearestFreeCell = cell;
          }
        }
      }
    }
  }

  return nearestFreeCell;
}

export function useAgentMovement(onUpdateAgent: (agent: Agent) => Promise<void>) {
  const moveAgent = useCallback((agent: Agent, newCell: GridCell, group: Konva.Group) => {
    group.to({
      x: newCell.x,
      y: newCell.y,
      duration: 0.15,
      easing: easeInOut,
      onFinish: () => {
        const updatedAgent: Agent = { ...agent, xPosition: newCell.x, yPosition: newCell.y };
        onUpdateAgent(updatedAgent).catch(error => {
          console.error('Failed to update agent:', error);
        });
      },
    });
  }, [onUpdateAgent]);

  const moveSingleAgent = useCallback(
    (agent: Agent, newPosition: { x: number; y: number }, stage: Konva.Stage, allAgents: Agent[]) => {
      const grid = createGrid(stage.width(), stage.height(), allAgents);
      const targetX = newPosition.x / stage.scaleX();
      const targetY = newPosition.y / stage.scaleY();
      
      const nearestFreeCell = findNearestFreeCell(grid, targetX, targetY);
      
      if (nearestFreeCell) {
        const group = stage.findOne(`#agent-${agent.id}`) as Konva.Group | null;
        if (group) {
          moveAgent(agent, nearestFreeCell, group);
        }
      }
    },
    [moveAgent]
  );

  const moveAgentGroup = useCallback(
    (agents: Agent[], newPosition: { x: number; y: number }, stage: Konva.Stage, allAgents: Agent[]) => {
      const grid = createGrid(stage.width(), stage.height(), allAgents);
      const targetX = newPosition.x / stage.scaleX();
      const targetY = newPosition.y / stage.scaleY();

      agents.forEach(agent => {
        const nearestFreeCell = findNearestFreeCell(grid, targetX, targetY);
        if (nearestFreeCell) {
          const group = stage.findOne(`#agent-${agent.id}`) as Konva.Group | null;
          if (group) {
            moveAgent(agent, nearestFreeCell, group);
            // Mark the cell as occupied so other agents won't move there
            const cellX = Math.floor(nearestFreeCell.x / CELL_SIZE);
            const cellY = Math.floor(nearestFreeCell.y / CELL_SIZE);
            if (grid[cellY]?.[cellX]) {
              grid[cellY][cellX].occupied = true;
            }
          }
        }
      });
    },
    [moveAgent]
  );

  return { moveSingleAgent, moveAgentGroup };
}