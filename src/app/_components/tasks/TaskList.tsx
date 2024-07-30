import React, { useMemo } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import TaskItem from "./TaskItem";
import type { TaskStatus } from "~/server/db/schema";

interface TaskListProps {
  filter: "all" | TaskStatus;
}

export default function TaskList({ filter }: TaskListProps) {
  const { tasks } = useTaskContext();

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  return (
    <div>
      <ul>
        {filteredTasks.map((task) => (
          <TaskItem key={task.id} task={task} level={0} />
        ))}
      </ul>
    </div>
  );
}
