import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks, subtasks } from "~/server/db/schema";
import type { Subtask } from "~/server/db/schema";
import { eq } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.taskId, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // Fetch the task
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update the task status first
    await db.update(tasks)
      .set({ status: 'in_progress' as const })
      .where(eq(tasks.id, taskId));

    // Create OpenAI assistant
    const assistant = await openai.beta.assistants.create({
      name: "Task Delegator",
      instructions: `You are an AI assistant that helps break down tasks into subtasks. Given a task description, create a list of 3-5 specific, actionable subtasks that directly contribute to completing the main task. Your response should be a valid JSON object with the following structure:
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
      Ensure each subtask is clear, concise, and directly related to the main task. Provide an estimated time in minutes for each subtask.`,
      model: "gpt-4-0613",
    });

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add a message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Please break down this task into subtasks: ${task.description}`,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Retrieve the messages
    const messages = await openai.beta.threads.messages.list(thread.id);

    // Extract subtasks from the assistant's response
    const assistantMessage = messages.data.find(m => m.role === 'assistant');
    if (!assistantMessage) {
      throw new Error('No assistant message found');
    }

    const textContent = assistantMessage.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content found in assistant message');
    }

    let parsedContent: { subtasks: Array<{ description: string; estimatedTimeInMinutes: number }> };
    try {
      parsedContent = JSON.parse(textContent.text.value) as { subtasks: Array<{ description: string; estimatedTimeInMinutes: number }> };
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Invalid response format from OpenAI');
    }

    if (!Array.isArray(parsedContent.subtasks)) {
      throw new Error('Invalid subtasks format in OpenAI response');
    }

    // Create subtasks in the database
    await db.insert(subtasks).values(
      parsedContent.subtasks.map((subtask) => ({
        taskId,
        description: subtask.description,
        completed: false,
        estimatedTimeInMinutes: subtask.estimatedTimeInMinutes,
      }))
    ).returning();

    // Fetch the updated task with subtasks
    const updatedTaskWithSubtasks = await db
      .select({
        task: tasks,
        subtask: subtasks,
      })
      .from(tasks)
      .leftJoin(subtasks, eq(tasks.id, subtasks.taskId))
      .where(eq(tasks.id, taskId));

    // Format the response
    const formattedTask = updatedTaskWithSubtasks[0] ? {
      ...updatedTaskWithSubtasks[0].task,
      subtasks: updatedTaskWithSubtasks.map(row => row.subtask).filter((subtask): subtask is Subtask => subtask !== null),
    } : null;

    return NextResponse.json(formattedTask, { status: 200 });
  } catch (error) {
    console.error('Error delegating task:', error);
    return NextResponse.json({ error: 'Failed to delegate task' }, { status: 500 });
  }
}