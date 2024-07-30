import React from "react";
import type { Task } from "~/server/db/schema";
import EmptyState from "./EmptyState";
import TaskItem from "./TaskItem";
import { getTopLevelTasks } from "~/server/actions/taskActions";
import { auth } from "@clerk/nextjs/server";
import AddTaskForm from "./AddTaskForm";

interface TasksProps {
  theme: "light" | "dark";
}

export default async function Tasks({ theme }: TasksProps) {
  const { userId } = auth();
  if (!userId) throw new Error("User must be logged in");

  const tasks = await getTopLevelTasks();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex h-screen flex-col">
            <AddTaskForm userId={userId} theme={theme} />
            <TaskList tasks={tasks} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}

// This can be a server component
function TaskList({ tasks }: { tasks: Task[], theme: "light" | "dark" }) {
  if (tasks.length === 0) return <EmptyState />;

  return (
    <div className="flex-grow overflow-hidden">
      <ul className="h-full space-y-2 overflow-y-auto pr-2">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </div>
  );
}