"use client";
import React, { useState, useEffect, useRef } from "react";
import { TaskProvider } from "~/app/_contexts/TaskContext";
import TaskList from "./TaskList";
import AddTaskForm from "./AddTaskForm";
import type { Task } from "~/server/db/schema";

interface TasksProps {
  initialTasks: Task[];
  userId: string;
}

export default function Tasks({ initialTasks, userId }: TasksProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000); // Hide scrollbar after 1 second of inactivity
    };

    const taskListElement = document.getElementById('task-list');
    if (taskListElement) {
      taskListElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (taskListElement) {
        taskListElement.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <TaskProvider initialTasks={initialTasks}>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-dark-bg">
        <div 
          id="task-list"
          className={`flex-grow overflow-y-auto p-6 sm:p-8 md:p-12 ${isScrolling ? 'scrollbar-show' : 'scrollbar-hide'}`}
        >
          <div className="w-full max-w-3xl mx-auto">
            <TaskList />
          </div>
        </div>
        <div className="sticky bottom-0 bg-gray-50 dark:bg-dark-bg p-4">
          <div className="max-w-3xl mx-auto">
            <AddTaskForm userId={userId} />
          </div>
        </div>
      </div>
    </TaskProvider>
  );
}