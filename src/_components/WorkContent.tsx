"use client";

import { useState, useEffect } from "react";
import { useAgentContext } from "~/contexts/AgentContext";
import { useTaskContext } from "~/contexts/TaskContext";
import type { Agent, Task } from "~/server/db/schema";
import { AssignWorkPopup } from "./AssignWorkPopup";

export function WorkContent() {
  const { agents } = useAgentContext();
  const { tasks, addTask, updateTask, deleteTask } = useTaskContext();
  const [taskInput, setTaskInput] = useState("");
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    try {
      await addTask({
        description: taskInput,
        projectId: 1, // Assuming project ID 1 for now
        status: 'todo',
      });
      setTaskInput("");
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleAssignTask = (task: Task) => {
    setSelectedTask(task);
    setShowAssignPopup(true);
  };

  const handleAssignWorkSubmit = async (agentId: number) => {
    if (selectedTask) {
      try {
        await updateTask({ ...selectedTask, agentId, status: 'in_progress' });
        setShowAssignPopup(false);
      } catch (error) {
        console.error("Failed to assign task:", error);
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      <form onSubmit={handleTaskSubmit} className="mb-4">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Enter new task"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded">Add Task</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="mb-2 p-2 border rounded">
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            {!task.agentId && (
              <button onClick={() => handleAssignTask(task)} className="mt-2 bg-green-500 text-white p-1 rounded">
                Assign to Agent
              </button>
            )}
          </li>
        ))}
      </ul>
      {showAssignPopup && (
        <AssignWorkPopup
          agents={agents}
          onClose={() => setShowAssignPopup(false)}
          onAssign={handleAssignWorkSubmit}
        />
      )}
    </div>
  );
}