'use server'

import { db } from '~/server/db';
import type { Task, NewTask, TaskUpdate, TaskSearchParams, TaskSelect } from '~/server/db/schema';
import { tasks, taskRelationships } from '~/server/db/schema';
import { eq, and, inArray, or, ilike } from 'drizzle-orm';
import { auth, currentUser } from "@clerk/nextjs/server";
import type { User } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getTopLevelTasks(): Promise<Task[]> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const topLevelTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .execute();

  if (topLevelTasks.length === 0) return [];

  const relationships = await db
    .select()
    .from(taskRelationships)
    .where(inArray(taskRelationships.parentTaskId, topLevelTasks.map(t => t.id)))
    .execute();


  return topLevelTasks.map(task => ({
    ...task,
    children: relationships.filter(r => r.parentTaskId === task.id).map(r => r.childTaskId),
    parentId: null,
  }));
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
  const user = await currentUser();

  if (!user) {
    throw new Error('Unauthorized: No user found');
  }

  await db.transaction(async (tx) => {
    // Function to recursively delete tasks and their relationships
    async function recursiveDelete(taskId: TaskSelect['id'], userId: User['id']) {
      // Get all child tasks
      const childTasks = await tx
        .select()
        .from(taskRelationships)
        .where(eq(taskRelationships.parentTaskId, taskId));

      // Recursively delete all child tasks
      for (const childTask of childTasks) {
        await recursiveDelete(childTask.childTaskId, userId);
      }

      // Delete relationships where this task is a child
      await tx
        .delete(taskRelationships)
        .where(eq(taskRelationships.childTaskId, taskId));

      // Delete relationships where this task is a parent
      await tx
        .delete(taskRelationships)
        .where(eq(taskRelationships.parentTaskId, taskId));

      // Delete the task itself
      await tx
        .delete(tasks)
        .where(
          and(
            eq(tasks.id, taskId),
            eq(tasks.userId, userId)
          )
        );
    }

    // Start the recursive deletion from the given task ID
    await recursiveDelete(id, user.id);
  });
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
  const relationships = await db.select()
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

export async function generateSubtasks(taskId: TaskSelect['id']): Promise<Task[]> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const [parentTask] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

  if (!parentTask) throw new Error('Task not found');

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",  // Ensure this is a valid model name
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an AI assistant that helps break down tasks into subtasks. Given a task description, create a list of 3-5 specific, actionable subtasks that directly contribute to completing the main task. Your response should be a valid JSON object with the following structure:
        {
          "subtasks": [
            {
              "description": "Subtask 1 description",
              "estimatedTimeInMinutes": 30
            },
            {
              "description": "Subtask 2 description",
              "estimatedTimeInMinutes": 45
            },
            ...
          ]
        }
        Ensure each subtask is clear, concise, and directly related to the main task. Provide an estimated time in minutes for each subtask.

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
                    "minLength": 1,
                    "maxLength": 200
                  },
                  "estimatedTimeInMinutes": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 480
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

        Adhere strictly to this schema when generating the response.`
      },
      {
        role: "user",
        content: `Please break down this task into subtasks: ${parentTask.description}`
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

export async function getSubtasks(taskId: TaskSelect['id']): Promise<Task[]> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  // First, verify that the parent task exists and belongs to the user
  const [parentTask] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

  if (!parentTask) throw new Error('Parent task not found');

  // Fetch subtasks
  const subtasks = await db
    .select()
    .from(tasks)
    .innerJoin(
      taskRelationships,
      eq(taskRelationships.childTaskId, tasks.id)
    )
    .where(eq(taskRelationships.parentTaskId, taskId));

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