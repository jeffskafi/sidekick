import { sql } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  text,
  integer,
  doublePrecision,
  pgEnum,
  unique,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const createTable = pgTableCreator((name) => `command-center_${name}`);

// Enums
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done', 'failed', 'exception', 'needs_human_input']);
export const agentStatusEnum = pgEnum('agent_status', [
  'idle',
  'task_complete',
  'working',
  'needs_human_input',
  'error'
]);
export const crewTypeEnum = pgEnum('crew_type', ['hierarchical', 'sequential']);

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

// Skills
export const skills = createTable(
  "skill",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    nameIndex: index("skill_name_idx").on(table.name),
  })
);

// AgentSkills (junction table)
export const agentSkills = createTable(
  "agent_skill",
  {
    id: serial("id").primaryKey(),
    agentId: integer("agent_id").notNull().references(() => agents.id),
    skillId: integer("skill_id").notNull().references(() => skills.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    agentSkillIndex: index("agent_skill_idx").on(table.agentId, table.skillId),
    uniqueAgentSkill: unique().on(table.agentId, table.skillId),
  })
);

// Agents
export const agents = createTable(
  "agent",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => projects.id).notNull(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    status: agentStatusEnum("status").notNull().default('idle'),
    xPosition: doublePrecision("x_position").notNull(),
    yPosition: doublePrecision("y_position").notNull(),
    openaiAssistantId: varchar("openai_assistant_id", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    nameIndex: index("agent_name_idx").on(table.name),
    statusIndex: index("agent_status_idx").on(table.status),
    userAgentNameUnique: unique().on(table.userId, table.name),
  })
);

// Crews
export const crews = createTable(
  "crew",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => projects.id).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    type: crewTypeEnum("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    nameIndex: index("crew_name_idx").on(table.name),
  })
);

// CrewAgents (junction table)
export const crewAgents = createTable(
  "crew_agent",
  {
    id: serial("id").primaryKey(),
    crewId: integer("crew_id").notNull().references(() => crews.id),
    agentId: integer("agent_id").notNull().references(() => agents.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    crewAgentIndex: index("crew_agent_idx").on(table.crewId, table.agentId),
    uniqueCrewAgent: unique().on(table.crewId, table.agentId),
  })
);

// Stories
export const stories = createTable(
  "story",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => projects.id).notNull(),
    crewId: integer("crew_id").notNull().references(() => crews.id),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    crewIndex: index("story_crew_idx").on(table.crewId),
  })
);

// Tasks
export const tasks = createTable(
  "task",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => projects.id).notNull(),
    description: text("description").notNull(),
    completed: boolean("completed").notNull().default(false),
    status: taskStatusEnum("status").notNull().default('todo'),
    priority: varchar("priority", { length: 10 }).notNull().default('none'),
    hasDueDate: boolean("has_due_date").notNull().default(false),
    dueDate: timestamp("due_date", { withTimezone: true }),
    agentId: integer("agent_id").references(() => agents.id),
    openaiAssistantId: varchar("openai_assistant_id", { length: 256 }),
    openaiThreadId: varchar("openai_thread_id", { length: 256 }),
    openaiRunId: varchar("openai_run_id", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    agentIndex: index("task_agent_idx").on(table.agentId),
    statusIndex: index("task_status_idx").on(table.status),
    projectIndex: index("task_project_idx").on(table.projectId),
  })
);

// Subtasks
export const subtasks = createTable(
  "subtask",
  {
    id: serial("id").primaryKey(),
    taskId: integer("task_id").references(() => tasks.id).notNull(),
    description: text("description").notNull(),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    taskIndex: index("subtask_task_idx").on(table.taskId),
  })
);

// Update the Task type
export type Task = InferSelectModel<typeof tasks> & {
  subtasks?: Subtask[];
};
export type NewTask = InferInsertModel<typeof tasks>;
export type Subtask = InferSelectModel<typeof subtasks>;
export type NewSubtask = InferInsertModel<typeof subtasks>;

// Threads
export const threads = createTable(
  "thread",
  {
    id: serial("id").primaryKey(),
    openaiThreadId: varchar("openai_thread_id", { length: 256 }).notNull().unique(),
    agentId: integer("agent_id").references(() => agents.id).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  }
);

// Export Zod schemas
export const insertAgentSchema = createInsertSchema(agents);
export const selectAgentSchema = createSelectSchema(agents);

// Export types
export type Agent = InferSelectModel<typeof agents> & { skills?: string[] };