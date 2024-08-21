'use server'

import { db } from '~/server/db';
import type { Task, TaskNode, NewTask, TaskUpdate, TaskSearchParams, TaskSelect } from '~/server/db/schema';
import { tasks, taskRelationships } from '~/server/db/schema';
import { eq, and, inArray, or, ilike, desc } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";
import OpenAI from 'openai';
import { rateLimit } from '~/server/ratelimit';
import { generateSubtasksSystemPrompt } from '~/prompts/generateSubtasksSystemPrompt';
import { generateSubtasksUserPrompt } from '~/prompts/generateSubtasksUserPrompt';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

console.log('Initializing taskActions...');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('OpenAI client initialized');

export async function getTopLevelTasks(): Promise<Task[]> {
  console.log('getTopLevelTasks called');
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  console.log('Fetching all tasks for user:', userId);
  const allTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt))
    .execute();

  console.log('Fetching task relationships');
  const relationships = await db
    .select()
    .from(taskRelationships)
    .execute();

  const taskMap = new Map<string, Task>();
  const topLevelTasks: Task[] = [];

  console.log('Processing tasks and relationships');
  allTasks.forEach(task => {
    taskMap.set(task.id, {
      ...task,
      children: [],
      parentId: null,
    });
  });

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

  taskMap.forEach(task => {
    if (task.parentId === null) {
      topLevelTasks.push(task);
    }
  });

  console.log('Returning top level tasks, count:', topLevelTasks.length);
  return topLevelTasks;
}

export async function createTask(newTask: NewTask): Promise<Task> {
  console.log('createTask called with:', newTask);
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  if (newTask.userId !== userId) throw new Error('Unauthorized: User ID mismatch');

  try {
    console.log('Inserting new task into database');
    const [insertedTask] = await db.insert(tasks).values(newTask).returning();

    if (!insertedTask) {
      throw new Error('Failed to insert task');
    }

    if (newTask.parentId) {
      console.log('Creating task relationship');
      const result = await db.insert(taskRelationships).values({
        parentTaskId: newTask.parentId,
        childTaskId: insertedTask.id,
      });

      if (!result) {
        throw new Error('Failed to create task relationship');
      }
    }

    console.log('Task created successfully:', insertedTask.id);
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
  console.log('updateTask called for task:', id, 'with updates:', updates);
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  return await db.transaction(async (tx) => {
    console.log('Updating task in database');
    const [updatedTask] = await tx
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!updatedTask) throw new Error('Task not found, not owned by user, or failed to update');

    console.log('Fetching task relationships');
    const relationships = await tx
      .select()
      .from(taskRelationships)
      .where(or(
        eq(taskRelationships.parentTaskId, id),
        eq(taskRelationships.childTaskId, id)
      ));

    const parentId = relationships.find(r => r.childTaskId === id)?.parentTaskId ?? null;

    console.log('Task updated successfully:', updatedTask.id);
    return {
      ...updatedTask,
      parentId,
      children: relationships.filter(r => r.parentTaskId === id).map(r => r.childTaskId),
    };
  });
}

export async function deleteTask(id: TaskSelect['id']): Promise<void> {
  console.log('deleteTask called for task:', id);
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  console.log('Getting descendant task IDs');
  const descendantIds = await getDescendantTaskIds(id);
  const allTaskIds = [id, ...descendantIds];

  await db.transaction(async (tx) => {
    console.log('Deleting task relationships');
    await tx
      .delete(taskRelationships)
      .where(
        or(
          inArray(taskRelationships.parentTaskId, allTaskIds),
          inArray(taskRelationships.childTaskId, allTaskIds)
        )
      );

    console.log('Deleting tasks');
    await tx
      .delete(tasks)
      .where(
        and(
          inArray(tasks.id, allTaskIds),
          eq(tasks.userId, userId)
        )
      );
  });

  console.log('Task and its descendants deleted successfully');
}

async function getDescendantTaskIds(taskId: TaskSelect['id']): Promise<TaskSelect['id'][]> {
  console.log('getDescendantTaskIds called for task:', taskId);
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  console.log('Fetching all tasks for user');
  const allTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .execute();

  console.log('Fetching all task relationships');
  const relationships = await db
    .select()
    .from(taskRelationships)
    .execute();

  const taskMap = new Map(allTasks.map(task => [task.id, { ...task, children: [] as string[] }]));

  console.log('Processing task relationships');
  relationships.forEach(rel => {
    if (rel.parentTaskId) {
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

  const descendants = collectDescendants(taskId).filter(id => id !== taskId);
  console.log('Descendant tasks found:', descendants.length);
  return descendants;
}

export async function moveTask(taskId: TaskSelect['id'], newParentId: TaskSelect['id'] | null): Promise<void> {
  console.log('moveTask called for task:', taskId, 'to new parent:', newParentId);
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  await db.transaction(async (tx) => {
    console.log('Fetching task to be moved');
    const [task] = await tx
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    if (!task) throw new Error('Task not found');

    console.log('Deleting old task relationship');
    await tx
      .delete(taskRelationships)
      .where(eq(taskRelationships.childTaskId, taskId));

    if (newParentId !== null) {
      console.log('Fetching new parent task');
      const [newParent] = await tx
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, newParentId), eq(tasks.userId, userId)));

      if (!newParent) throw new Error('New parent task not found');

      console.log('Creating new task relationship');
      await tx.insert(taskRelationships).values({
        parentTaskId: newParentId,
        childTaskId: taskId,
      });
    }
  });

  console.log('Task moved successfully');
}

export async function searchTasks(params: TaskSearchParams): Promise<Task[]> {
  console.log('searchTasks called with params:', params);
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  console.log('Searching for tasks');
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

  console.log('Search results found:', searchResults.length);

  const taskIds = searchResults.map(task => task.id);
  console.log('Fetching relationships for found tasks');
  const relationships = await db
    .select()
    .from(taskRelationships)
    .where(or(
      inArray(taskRelationships.parentTaskId, taskIds),
      inArray(taskRelationships.childTaskId, taskIds)
    ))
    .execute();

  console.log('Mapping search results with relationships');
  return searchResults.map(task => ({
    ...task,
    parentId: relationships.find(r => r.childTaskId === task.id)?.parentTaskId ?? null,
    children: relationships
      .filter(r => r.parentTaskId === task.id)
      .map(r => r.childTaskId),
  }));
}

async function getAncestralChain(taskId: TaskSelect['id'], userId: string): Promise<TaskNode | null> {
  console.log('getAncestralChain called for task:', taskId);
  console.log('Fetching all tasks for user');
  const allTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .execute();

  console.log('Fetching all relationships');
  const allRelationships = await db
    .select()
    .from(taskRelationships)
    .execute();

  console.log('Creating task map');
  const taskMap = new Map<string, TaskNode>();
  allTasks.forEach(task => {
    taskMap.set(task.id, { ...task, parentId: null, children: [] });
  });

  console.log('Establishing parent-child relationships');
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

  console.log('Building ancestral chain');
  const chain = buildChain(taskId);
  console.log('Ancestral chain built');
  return chain;
}

export async function generateSubtasks(taskId: TaskSelect['id']): Promise<Task[]> {
  console.log('generateSubtasks called for task:', taskId);
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  console.log('Checking rate limit');
  const { success } = await rateLimit.limit(userId);

  if (!success) {
    throw new Error('Rate limit exceeded');
  }

  console.log('Fetching parent task');
  const [parentTask] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

  if (!parentTask) throw new Error('Task not found');

  console.log('Getting ancestral chain');
  const ancestralChain = await getAncestralChain(taskId, userId);

  if (!ancestralChain) throw new Error('Task not found');

const Subtask = zodResponseFormat(
  z.object({
    subtasks: z.array(
      z.object({
        description: z.string(),
        estimatedTimeInMinutes: z.number().int(),
      })
    ),
  }),
  'generated_subtasks'
);

  console.log('Calling OpenAI API');
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    response_format: Subtask,
    messages: [
      {
        role: "system",
        content: generateSubtasksSystemPrompt(taskId)
      },
      {
        role: "user",
        content: generateSubtasksUserPrompt(taskId, parentTask.description, ancestralChain)
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

    console.log('Creating subtasks in database');
    const subtasks = await db.transaction(async (tx) => {
      const createdSubtasks: Task[] = [];
      for (const subtaskInput of parsedContent.subtasks) {
        console.log('Inserting subtask:', subtaskInput.description);
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

        console.log('Creating task relationship for subtask:', insertedTask.id);
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
  console.log('getSubtasks called with taskId:', taskId);
  const { userId } = auth();
  if (!userId) {
    console.log('Unauthorized: userId not found');
    throw new Error('Unauthorized');
  }
  console.log('Authorized user:', userId);

  // Fetch subtasks
  console.log('Fetching subtasks');
  const subtasks = await db
    .select()
    .from(tasks)
    .innerJoin(
      taskRelationships,
      eq(taskRelationships.childTaskId, tasks.id)
    )
    .where(eq(taskRelationships.parentTaskId, taskId))
  console.log('Fetched subtasks:', subtasks);

  // Fetch child relationships for all subtasks in one query
  console.log('Fetching child relationships');
  const childRelationships = await db
    .select()
    .from(taskRelationships)
    .where(inArray(taskRelationships.parentTaskId, subtasks.map(t => t.tasks.id)));
  console.log('Fetched child relationships:', childRelationships);

  // Map subtasks to Task type
  console.log('Mapping subtasks to Task type');
  const mappedSubtasks = subtasks.map(subtask => {
    const children = childRelationships
      .filter(r => r.parentTaskId === subtask.tasks.id)
      .map(r => r.childTaskId);
    console.log(`Mapped subtask ${subtask.tasks.id} with ${children.length} children`);
    return {
      ...subtask.tasks,
      parentId: taskId,
      children,
    };
  });

  console.log('Returning mapped subtasks');
  return mappedSubtasks;
}