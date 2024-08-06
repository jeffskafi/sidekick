'use server'

import { db } from '~/server/db';
import type { Task, TaskNode, NewTask, TaskUpdate, TaskSearchParams, TaskSelect } from '~/server/db/schema';
import { tasks, taskRelationships } from '~/server/db/schema';
import { eq, and, inArray, or, ilike, desc } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";
import OpenAI from 'openai';
import { rateLimit } from '~/server/ratelimit';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getTopLevelTasks(): Promise<Task[]> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const allTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt)) // Sort by creation date, newest first
    .execute();

  const relationships = await db
    .select()
    .from(taskRelationships)
    .execute();

  const taskMap = new Map<string, Task>();
  const topLevelTasks: Task[] = [];

  // Create Task objects and store them in the map
  allTasks.forEach(task => {
    taskMap.set(task.id, {
      ...task,
      children: [],
      parentId: null,
    });
  });

  // Establish parent-child relationships
  relationships.forEach(rel => {
    if (rel.parentTaskId !== null) {
      const childTask = taskMap.get(rel.childTaskId);
      const parentTask = taskMap.get(rel.parentTaskId);
      if (childTask && parentTask) {
        childTask.parentId = rel.parentTaskId;
        parentTask.children.push(rel.childTaskId);
      }
    }
  });

  // Collect top-level tasks
  taskMap.forEach(task => {
    if (task.parentId === null) {
      topLevelTasks.push(task);
    }
  });

  return topLevelTasks;
}

export async function createTask(newTask: NewTask): Promise<Task> {
  const { userId } = auth(); // Get the userId from the authenticated session
  if (!userId) throw new Error('Unauthorized');

  // Ensure the userId from the auth matches the one in newTask
  if (newTask.userId !== userId) throw new Error('Unauthorized: User ID mismatch');

  try {
    // Insert the task into the database
    const [insertedTask] = await db.insert(tasks).values(newTask).returning();

    if (!insertedTask) {
      throw new Error('Failed to insert task');
    }

    // Handle parent-child relationship if parentId is provided
    if (newTask.parentId) {
      const result = await db.insert(taskRelationships).values({
        parentTaskId: newTask.parentId,
        childTaskId: insertedTask.id,
      });

      if (!result) {
        throw new Error('Failed to create task relationship');
      }
    }

    // Return the created task
    return {
      ...insertedTask,
      parentId: newTask.parentId ?? null,
      children: [],
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error('Failed to create task');
  }
}

export async function updateTask(id: TaskSelect['id'], updates: TaskUpdate): Promise<Task> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  return await db.transaction(async (tx) => {
    // Ensure the task belongs to the authenticated user and update it
    const [updatedTask] = await tx
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!updatedTask) throw new Error('Task not found, not owned by user, or failed to update');

    // Get both child and parent relationships in one query
    const relationships = await tx
      .select()
      .from(taskRelationships)
      .where(or(
        eq(taskRelationships.parentTaskId, id),
        eq(taskRelationships.childTaskId, id)
      ));

    const parentId = relationships.find(r => r.childTaskId === id)?.parentTaskId ?? null;

    return {
      ...updatedTask,
      parentId,
      children: relationships.filter(r => r.parentTaskId === id).map(r => r.childTaskId),
    };
  });
}

export async function deleteTask(id: TaskSelect['id']): Promise<void> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const descendantIds = await getDescendantTaskIds(id);
  const allTaskIds = [id, ...descendantIds];

  await db.transaction(async (tx) => {
    // Delete all relationships
    await tx
      .delete(taskRelationships)
      .where(
        or(
          inArray(taskRelationships.parentTaskId, allTaskIds),
          inArray(taskRelationships.childTaskId, allTaskIds)
        )
      );

    // Delete all tasks
    await tx
      .delete(tasks)
      .where(
        and(
          inArray(tasks.id, allTaskIds),
          eq(tasks.userId, userId)
        )
      );
  });
}

async function getDescendantTaskIds(taskId: TaskSelect['id']): Promise<TaskSelect['id'][]> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const allTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .execute();

  const relationships = await db
    .select()
    .from(taskRelationships)
    .execute();

  const taskMap = new Map(allTasks.map(task => [task.id, { ...task, children: [] as string[] }]));

  relationships.forEach(rel => {
    if (rel.parentTaskId) {  // Check if parentTaskId is not null
      const parentTask = taskMap.get(rel.parentTaskId);
      if (parentTask) {
        parentTask.children.push(rel.childTaskId);
      }
    }
  });

  function collectDescendants(id: TaskSelect['id']): TaskSelect['id'][] {
    const task = taskMap.get(id);
    if (!task) return [];
    return [id, ...task.children.flatMap(collectDescendants)];
  }

  return collectDescendants(taskId).filter(id => id !== taskId);
}

export async function moveTask(taskId: TaskSelect['id'], newParentId: TaskSelect['id'] | null): Promise<void> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  await db.transaction(async (tx) => {
    const [task] = await tx
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    if (!task) throw new Error('Task not found');

    await tx
      .delete(taskRelationships)
      .where(eq(taskRelationships.childTaskId, taskId));

    if (newParentId !== null) {
      const [newParent] = await tx
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, newParentId), eq(tasks.userId, userId)));

      if (!newParent) throw new Error('New parent task not found');

      await tx.insert(taskRelationships).values({
        parentTaskId: newParentId,
        childTaskId: taskId,
      });
    }
  });
}

export async function searchTasks(params: TaskSearchParams): Promise<Task[]> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const searchResults = await db.select()
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      params.query ? ilike(tasks.description, `%${params.query}%`) : undefined,
      params.status ? eq(tasks.status, params.status) : undefined,
      params.priority ? eq(tasks.priority, params.priority) : undefined,
      params.completed !== undefined ? eq(tasks.completed, params.completed) : undefined,
      params.dueDate ? eq(tasks.dueDate, params.dueDate) : undefined
    ))
    .execute();

  // Fetch relationships for the found tasks
  const taskIds = searchResults.map(task => task.id);
  const relationships = await db
    .select()
    .from(taskRelationships)
    .where(or(
      inArray(taskRelationships.parentTaskId, taskIds),
      inArray(taskRelationships.childTaskId, taskIds)
    ))
    .execute();

  // Map the results to include parentId and children
  return searchResults.map(task => ({
    ...task,
    parentId: relationships.find(r => r.childTaskId === task.id)?.parentTaskId ?? null,
    children: relationships
      .filter(r => r.parentTaskId === task.id)
      .map(r => r.childTaskId),
  }));
}

async function getAncestralChain(taskId: TaskSelect['id'], userId: string): Promise<TaskNode | null> {
  // Fetch all tasks for the user in one query
  const allTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .execute();

  // Fetch all relationships in one query
  const allRelationships = await db
    .select()
    .from(taskRelationships)
    .execute();

  // Create a map of tasks and their relationships
  const taskMap = new Map<string, TaskNode>();
  allTasks.forEach(task => {
    taskMap.set(task.id, { ...task, parentId: null, children: [] });
  });

  // Establish parent-child relationships
  allRelationships.forEach(rel => {
    if (rel.parentTaskId !== null) {
      const child = taskMap.get(rel.childTaskId);
      const parent = taskMap.get(rel.parentTaskId);
      if (child && parent) {
        child.parentId = rel.parentTaskId;
        parent.children.push(child);
      }
    }
  });

  // Function to recursively build the ancestral chain
  function buildChain(id: string): TaskNode | null {
    const task = taskMap.get(id);
    if (!task) return null;

    if (task.parentId !== null) {
      const parent = buildChain(task.parentId);
      if (parent) {
        parent.children = parent.children.filter(child => child.id !== id);
        parent.children.push(task);
        return parent;
      }
    }

    return task;
  }

  return buildChain(taskId);
}

export async function generateSubtasks(taskId: TaskSelect['id']): Promise<Task[]> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const { success } = await rateLimit.limit(userId);

  if (!success) {
    throw new Error('Rate limit exceeded');
  }

  const [parentTask] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

  if (!parentTask) throw new Error('Task not found');

  const ancestralChain = await getAncestralChain(taskId, userId);

  if (!ancestralChain) throw new Error('Task not found');

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an AI task decomposition specialist. Your role is to break down tasks into precise, actionable subtasks. Given a task description and its hierarchical position, generate 3 to 5 subtasks that directly contribute to completing the main task. Each subtask must be specific, measurable, and achievable.

        Requirements:
        1. Generate 3 to 5 subtasks, no more, no less.
        2. Each subtask description must be between 10 and 150 characters.
        3. Estimated time for each subtask must be between 5 and 240 minutes.
        4. Subtasks must be concrete actions, not vague goals.
        5. Consider the task's context within its hierarchy when generating subtasks.
        6. Ensure subtasks are mutually exclusive and collectively exhaustive.
        7. If subtasks already exist, generate entirely new ones without repetition.

        Your response must be a valid JSON object with the following structure:
        {
          "subtasks": [
            {
              "description": "Specific, actionable subtask description",
              "estimatedTimeInMinutes": 30
            },
            {
              "description": "Subtask 2 description",
              "estimatedTimeInMinutes": 45
            },
            ...
          ]
        }
        Ensure each subtask is clear, concise, and directly related to the main task. Provide an estimated time in minutes for each subtask. Consider the task's context within its hierarchy when generating subtasks.

        JSON Schema:
        {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "type": "object",
          "properties": {
            "subtasks": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "description": {
                    "type": "string",
                    "minLength": 10,
                    "maxLength": 150
                  },
                  "estimatedTimeInMinutes": {
                    "type": "integer",
                    "minimum": 5,
                    "maximum": 240
                  }
                },
                "required": ["description", "estimatedTimeInMinutes"]
              },
              "minItems": 3,
              "maxItems": 5
            }
          },
          "required": ["subtasks"]
        }

        Adhere strictly to this schema and requirements when generating the response.`
      },
      {
        role: "user",
        content: `Generate 3 to 5 new, non-overlapping subtasks for the following task:
        TASK ID: ${taskId}

        TASK HIERARCHY CONTEXT:
        ${JSON.stringify(ancestralChain, null, 2)}

        Rules:
        1. Analyze the task hierarchy to understand the context.
        2. Ensure each subtask is unique and doesn't repeat any existing tasks in the hierarchy.
        3. Make subtasks specific to the immediate parent task, not to higher-level ancestors.
        4. Balance the estimated times so they sum up close to the parent task's total estimated time, if available.
        5. If the parent task is a leaf node, focus on breaking it down into logical next steps.
        6. For tasks higher in the hierarchy, create subtasks that represent major components or phases.

        Provide your response as a valid JSON object adhering to the specified schema.`
      }
    ],
  });

  const message = completion.choices[0]?.message.content;
  if (!message) throw new Error('No message found in OpenAI response');

    // Define the expected structure of the parsed content
    interface ParsedContent {
      subtasks: Array<{
        description: string;
        estimatedTimeInMinutes: number;
    }>;
  }
  try {
    const parsedContent = JSON.parse(message) as ParsedContent;
    if (!Array.isArray(parsedContent.subtasks)) {
      throw new Error('Invalid subtasks format in OpenAI response');
    }

    const subtasks = await db.transaction(async (tx) => {
      const createdSubtasks: Task[] = [];
      for (const subtaskInput of parsedContent.subtasks) {
        const [insertedTask] = await tx
          .insert(tasks)
          .values({
            description: subtaskInput.description,
            userId,
            completed: false,
            status: 'todo',
            priority: 'none',
            dueDate: null,
          })
          .returning();

        if (!insertedTask) throw new Error('Failed to insert subtask');

        await tx.insert(taskRelationships).values({
          parentTaskId: parentTask.id,
          childTaskId: insertedTask.id,
        });

        createdSubtasks.push({
          ...insertedTask,
          parentId: parentTask.id,
          children: [],
        });
      }
      return createdSubtasks;
    });

    return subtasks;
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    throw new Error('Invalid response format from OpenAI');
  }
}

export async function refreshSubtasks(taskId: TaskSelect['id']): Promise<Task[]> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  return await db.transaction(async (tx) => {
    // Get the task
    const [task] = await tx
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    if (!task) throw new Error('Task not found');

    // Recursively delete all subtasks
    async function deleteSubtasksRecursive(parentId: string) {
      const childTaskIds = await tx
        .select({ id: tasks.id })
        .from(tasks)
        .innerJoin(taskRelationships, eq(taskRelationships.childTaskId, tasks.id))
        .where(eq(taskRelationships.parentTaskId, parentId));

      for (const { id } of childTaskIds) {
        await deleteSubtasksRecursive(id);
        await tx.delete(taskRelationships).where(eq(taskRelationships.childTaskId, id));
        await tx.delete(tasks).where(eq(tasks.id, id));
      }
    }

    await deleteSubtasksRecursive(taskId);

    const newSubtasks = await generateSubtasks(taskId);

    return [{ ...task, children: newSubtasks.map(subtask => subtask.id), parentId: null }, ...newSubtasks];
  });
}

export async function getSubtasks(taskId: TaskSelect['id']): Promise<Task[]> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const parentTask = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .execute();

  if (parentTask.length === 0) {
    return []; // Return an empty array if the parent task is not found
  }

  // Fetch subtasks
  const subtasks = await db
    .select()
    .from(tasks)
    .innerJoin(
      taskRelationships,
      eq(taskRelationships.childTaskId, tasks.id)
    )
    .where(eq(taskRelationships.parentTaskId, taskId));

    if (subtasks.length === 0) {
      return []; // Return an empty array if there are no subtasks
    }

  // Fetch child relationships for all subtasks in one query
  const childRelationships = await db
    .select()
    .from(taskRelationships)
    .where(inArray(taskRelationships.parentTaskId, subtasks.map(t => t.tasks.id)));

  // Map subtasks to Task type
  return subtasks.map(subtask => ({
    ...subtask.tasks,
    parentId: taskId,
    children: childRelationships
      .filter(r => r.parentTaskId === subtask.tasks.id)
      .map(r => r.childTaskId),
  }));
}