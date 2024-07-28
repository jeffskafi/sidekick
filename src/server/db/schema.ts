import { pgTable, serial, text, integer, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  description: text('description').notNull(),
  completed: boolean('completed').notNull().default(false),
  status: text('status').notNull().default('todo'),
  priority: text('priority').notNull().default('none'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const taskRelationships = pgTable('task_relationships', {
  id: serial('id').primaryKey(),
  parentTaskId: integer('parent_task_id').notNull().references(() => tasks.id),
  childTaskId: integer('child_task_id').notNull().references(() => tasks.id),
}, (table) => {
  return {
    uniqRelationship: uniqueIndex('uniq_parent_child').on(table.parentTaskId, table.childTaskId),
  }
});

export type Task = typeof tasks.$inferSelect & { childCount: number };
export type NewTask = typeof tasks.$inferInsert;
export type TaskRelationship = typeof taskRelationships.$inferSelect;
export type NewTaskRelationship = typeof taskRelationships.$inferInsert;