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
    return <EmptyState />;
  }

  return (
    <div className="task-list w-full">
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