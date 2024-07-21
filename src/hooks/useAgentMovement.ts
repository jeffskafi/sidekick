import { useCallback } from 'react';
import type { Agent } from '~/server/db/schema';
import { easeInOut } from '../helpers/movement';
import type Konva from 'konva';

const CELL_SIZE = 65; // Size of each grid cell, should be at least the agent's diameter

type GridCell = {
  x: number;
  y: number;
  occupied: boolean;
};

function createGrid(width: number, height: number, agents: Agent[]): GridCell[][] {
  const grid: GridCell[][] = [];
  for (let y = 0; y < height; y += CELL_SIZE) {
    const row: GridCell[] = [];
    for (let x = 0; x < width; x += CELL_SIZE) {
      row.push({ x, y, occupied: false });
    }
    grid.push(row);
  }

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
  const moveSingleAgent = useCallback(
    (agent: Agent, newPosition: { x: number; y: number }, stage: Konva.Stage, allAgents: Agent[]) => {
      const grid = createGrid(stage.width(), stage.height(), allAgents);
      const targetX = newPosition.x / stage.scaleX();
      const targetY = newPosition.y / stage.scaleY();
      
      const nearestFreeCell = findNearestFreeCell(grid, targetX, targetY);
      
      if (nearestFreeCell) {
        const group = stage.findOne(`#agent-${agent.id}`) as Konva.Group | null;
        if (group) {
          group.to({
            x: nearestFreeCell.x,
            y: nearestFreeCell.y,
            duration: 0.15,
            easing: easeInOut,
            onFinish: () => {
              const updatedAgent: Agent = { ...agent, xPosition: nearestFreeCell.x, yPosition: nearestFreeCell.y };
              onUpdateAgent(updatedAgent).catch(error => {
                console.error('Failed to update agent:', error);
              });
            },
          });
        }
      }
    },
    [onUpdateAgent]
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
            group.to({
              x: nearestFreeCell.x,
              y: nearestFreeCell.y,
              duration: 0.15,
              easing: easeInOut,
              onFinish: () => {
                const updatedAgent: Agent = { ...agent, xPosition: nearestFreeCell.x, yPosition: nearestFreeCell.y };
                onUpdateAgent(updatedAgent).catch(error => {
                  console.error('Failed to update agent:', error);
                });
              },
            });
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
    [onUpdateAgent]
  );

  return { moveSingleAgent, moveAgentGroup };
}