import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from "~/server/db";
import { tasks, subtasks } from "~/server/db/schema";
import { eq } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: NextRequest,
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

    const { preserveDueDate, dueDate } = await req.json() as { preserveDueDate: boolean, dueDate: string | null };

    // Fetch the task
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Delete existing subtasks
    await db.delete(subtasks).where(eq(subtasks.taskId, taskId));

    // Generate new subtasks using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
          content: `Please break down this task into subtasks: ${task.description}`
        }
      ],
    });

    const message = completion.choices[0]?.message.content;
    if (!message) {
      throw new Error('No message found in OpenAI response');
    }

    let parsedContent: { subtasks: Array<{ description: string; estimatedTimeInMinutes: number }> };
    try {
      parsedContent = JSON.parse(message) as { subtasks: Array<{ description: string; estimatedTimeInMinutes: number }> };
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Invalid response format from OpenAI');
    }

    if (!Array.isArray(parsedContent.subtasks)) {
      throw new Error('Invalid subtasks format in OpenAI response');
    }

    // Insert new subtasks
    await db.insert(subtasks).values(
      parsedContent.subtasks.map((subtask) => ({
        taskId,
        description: subtask.description,
        completed: false,
        estimatedTimeInMinutes: subtask.estimatedTimeInMinutes,
      }))
    );

    // Update the task status and due date
    await db.update(tasks)
      .set({ 
        status: 'in_progress' as const,
        hasDueDate: preserveDueDate,
        dueDate: preserveDueDate ? dueDate : null
      })
      .where(eq(tasks.id, taskId));

    // Fetch the updated task with new subtasks
    const [updatedTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    const updatedSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));

    // Format the response
    const formattedTask = updatedTask ? {
      ...updatedTask,
      subtasks: updatedSubtasks,
    } : null;

    return NextResponse.json(formattedTask, { status: 200 });
  } catch (error) {
    console.error('Error delegating task:', error);
    return NextResponse.json({ error: 'Failed to delegate task' }, { status: 500 });
  }
}