import React from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import TaskItem from "./TaskItem";
import EmptyState from "./EmptyState";
import type { TaskStatus } from "~/server/db/schema";

interface TaskListProps {
  filter: TaskStatus | "all";
}

export default function TaskList({ filter }: TaskListProps) {
  const { tasks } = useTaskContext();

  const filteredTasks = filter === "all" 
    ? tasks.filter(task => task.parentId === null)
    : tasks.filter(task => task.status === filter && task.parentId === null);

  if (filteredTasks.length === 0) return <EmptyState />;

  return (
    <ul className="space-y-2">
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} level={0} />
      ))}
    </ul>
  );
}