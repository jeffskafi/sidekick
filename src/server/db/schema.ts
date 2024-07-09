import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  text,
  integer,
  jsonb,
  pgEnum,
  unique
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `ai_management_${name}`);

// Enums
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done', 'failed', 'exception']);
export const agentStatusEnum = pgEnum('agent_status', ['idle', 'active']);
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

// Agents
export const agents = createTable(
  "agent",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => projects.id).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    status: agentStatusEnum("status").notNull().default('idle'),
    skills: jsonb("skills"),
    xPosition: integer("x_position").notNull().default(0),
    yPosition: integer("y_position").notNull().default(0),
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
    status: taskStatusEnum("status").notNull().default('todo'),
    agentId: integer("agent_id").references(() => agents.id),
    storyId: integer("story_id").references(() => stories.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    agentIndex: index("task_agent_idx").on(table.agentId),
    storyIndex: index("task_story_idx").on(table.storyId),
    statusIndex: index("task_status_idx").on(table.status),
  })
);