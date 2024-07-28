import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  text,
  integer,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const createTable = pgTableCreator((name) => `command-center_${name}`);

// Enums
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done', 'failed', 'exception', 'needs_human_input']);

// Projects (Canvas)
export const projects = createTable(
  "project",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  }
);

// Tasks (similar to comments in a Reddit-like system)
export const tasks = createTable(
  "task",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => projects.id).notNull(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    parentId: integer("parent_id"),
    description: text("description").notNull(),
    completed: boolean("completed").notNull().default(false),
    status: taskStatusEnum("status").notNull().default('todo'),
    priority: varchar("priority", { length: 10 }).notNull().default('none'),
    dueDate: varchar("due_date", { length: 30 }), // ISO date string
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    statusIndex: index("task_status_idx").on(table.status),
    projectIndex: index("task_project_idx").on(table.projectId),
    userIndex: index("task_user_idx").on(table.userId),
    parentIndex: index("task_parent_idx").on(table.parentId),
    dueDateIndex: index("task_due_date_idx").on(table.dueDate),
  })
);

// Export base types
export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;

// Export Zod schemas
export const insertTaskSchema = createInsertSchema(tasks);
export const selectTaskSchema = createSelectSchema(tasks);

// Recursive task type for hierarchical structure
export interface TaskNode extends Task {
  subtasks: TaskNode[];
}

// Helper function to create a TaskNode from a Task
export function createTaskNode(task: Task): TaskNode {
  return {
    ...task,
    subtasks: [],
  };
}

// Helper function to add a subtask to a TaskNode
export function addSubtask(parent: TaskNode, subtask: Task): void {
  parent.subtasks.push(createTaskNode(subtask));
}

// Helper function to build a task tree
export function buildTaskTree(tasks: Task[]): TaskNode[] {
  const taskMap = new Map<number, TaskNode>();
  const rootTasks: TaskNode[] = [];

  tasks.forEach(task => {
    const taskNode = createTaskNode(task);
    taskMap.set(task.id, taskNode);

    if (task.parentId === null) {
      rootTasks.push(taskNode);
    } else {
      const parent = taskMap.get(task.parentId);
      if (parent) {
        parent.subtasks.push(taskNode);
      }
    }
  });

  return rootTasks;
}