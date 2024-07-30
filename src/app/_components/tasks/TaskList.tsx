import React from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import TaskItem from "./TaskItem";
import EmptyState from "./EmptyState";
import type { TaskStatus, Task } from "~/server/db/schema";

interface TaskListProps {
  filter: TaskStatus | "all";
}

export default function TaskList({ filter }: TaskListProps) {
  const { tasks } = useTaskContext();

  const filterTasks = (taskList: Task[]): Task[] => {
    return taskList.filter((task) => 
      (filter === "all" || task.status === filter) && task.parentId === null
    );
  };

  const filteredTasks = filterTasks(tasks);

  if (filteredTasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="space-y-2">
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} level={0} />
      ))}
    </ul>
  );
}