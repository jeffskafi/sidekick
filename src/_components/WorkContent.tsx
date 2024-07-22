"use client";

import { useState } from "react";
import { useAgentContext } from "~/contexts/AgentContext";
import { useTaskContext } from "~/contexts/TaskContext";
import type { Agent, Task } from "~/server/db/schema";

export function WorkContent() {
  const { agents, updateAgent } = useAgentContext();
  const { tasks, addTask, updateTask, deleteTask } = useTaskContext();
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [taskInput, setTaskInput] = useState("");

  const handleAgentSelect = (agentId: number) => {
    setSelectedAgent(agentId);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !taskInput.trim()) return;

    try {
      await addTask({
        description: taskInput,
        projectId: 1, // Assuming project ID 1 for now
        agentId: selectedAgent,
        status: 'todo',
      });
      await updateAgent({
        ...agents.find(a => a.id === selectedAgent)!,
        status: 'needs_human_input'
      });
      setTaskInput("");
    } catch (error) {
      console.error("Failed to assign task:", error);
    }
  };

  const handleTaskStatusChange = async (task: Task, newStatus: Task['status']) => {
    await updateTask({ ...task, status: newStatus });
    const agent = agents.find(a => a.id === task.agentId);
    if (agent) {
      let newAgentStatus: Agent['status'] = 'idle';
      switch (newStatus) {
        case 'todo':
          newAgentStatus = 'needs_human_input';
          break;
        case 'in_progress':
          newAgentStatus = 'working';
          break;
        case 'done':
          newAgentStatus = 'task_complete';
          break;
        case 'failed':
        case 'exception':
          newAgentStatus = 'error';
          break;
      }
      await updateAgent({ ...agent, status: newAgentStatus });
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    await deleteTask(taskId);
  };

  return (
    <div className="flex h-full">
      <div className="w-1/3 overflow-y-auto bg-gray-800 p-4">
        <h2 className="mb-4 text-xl font-bold">Agents</h2>
        <ul>
          {agents.map((agent) => (
            <li
              key={agent.id}
              className={`mb-2 cursor-pointer rounded p-2 ${
                selectedAgent === agent.id ? "bg-blue-600" : "bg-gray-700"
              }`}
              onClick={() => handleAgentSelect(agent.id)}
            >
              {agent.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-2/3 overflow-y-auto bg-gray-700 p-4">
        <h2 className="mb-4 text-xl font-bold">Task Management</h2>
        {selectedAgent ? (
          <>
            <form onSubmit={handleTaskSubmit} className="mb-4">
              <textarea
                className="mb-4 w-full rounded bg-gray-800 p-2 text-white"
                rows={4}
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Enter task description..."
              />
              <button
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Assign Task
              </button>
            </form>
            <div>
              <h3 className="mb-2 text-lg font-semibold">Assigned Tasks</h3>
              <ul>
                {tasks
                  .filter((task) => task.agentId === selectedAgent)
                  .map((task) => (
                    <li key={task.id} className="mb-2 rounded bg-gray-600 p-2">
                      <p>{task.description}</p>
                      <div className="mt-2 flex justify-between">
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task, e.target.value as Task['status'])}
                          className="rounded bg-gray-800 text-white"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                          <option value="failed">Failed</option>
                          <option value="exception">Exception</option>
                        </select>
                        <button
                          onClick={() => handleTaskDelete(task.id)}
                          className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </>
        ) : (
          <p>Select an agent to assign tasks</p>
        )}
      </div>
    </div>
  );
}