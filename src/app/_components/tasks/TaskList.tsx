import React, { useMemo } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import TaskItem from "./TaskItem";
import type { TaskStatus } from "~/server/db/schema";

interface TaskListProps {
  filter: 'all' | TaskStatus;
}

export default function TaskList({ filter }: TaskListProps) {
  const { tasks } = useTaskContext();

  const filteredTasks = useMemo(() => {
    const topLevelTasks = tasks.filter(task => task.parentId === null);
    if (filter === 'all') return topLevelTasks;
    return topLevelTasks.filter(task => task.status === filter);
  }, [tasks, filter]);

  return (
    <div className="task-list">
      <ul className="space-y-2">
        {filteredTasks.map((task) => (
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