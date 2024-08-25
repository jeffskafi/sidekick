import React, { useMemo } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import TaskItem from "./TaskItem";
import EmptyState from "./EmptyState";

export default function TaskList() {
  const { tasks } = useTaskContext();

  const topLevelTasks = useMemo(() => {
    return tasks.filter(task => task.parentId === null);
  }, [tasks]);

  if (topLevelTasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="task-list w-full py-4">
      <ul className="space-y-2 w-full">
        {topLevelTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            level={0}
          />
        ))}
      </ul>
    </div>
  );
}