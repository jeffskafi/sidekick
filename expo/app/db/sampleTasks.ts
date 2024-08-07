import { Task } from "./schema";

export const sampleTasks: Task[] = [
  {
    id: "1",
    userId: "user1",
    description: "Complete building the react native app",
    completed: false,
    status: "todo",
    priority: "high",
    dueDate: new Date("2023-12-31"),
    createdAt: new Date(),
    updatedAt: new Date(),
    parentId: null,
    children: [],
  },
  {
    id: "2",
    userId: "user1",
    description: "Schedule annual checkup with the doctor",
    completed: false,
    status: "todo",
    priority: "medium",
    dueDate: new Date("2023-11-15"),
    createdAt: new Date(),
    updatedAt: new Date(),
    parentId: null,
    children: [],
  },
];