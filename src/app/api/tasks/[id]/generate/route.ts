import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks, taskRelationships, type Task, type NewTask } from "~/server/db/schema";
import { eq, and } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type SubtaskInput = Omit<NewTask, 'userId'>;
type TaskWithoutChildCount = Omit<Task, 'childCount'>;

async function generateSubtasks(description: string): Promise<SubtaskInput[]> {
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
        content: `Please break down this task into subtasks: ${description}`
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

  return parsedContent.subtasks.map((subtask): SubtaskInput => ({
    description: subtask.description,
    completed: false,
    status: 'todo',
    priority: 'none',
    dueDate: null,
  }));
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.id);
    const [parentTask] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    if (!parentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const subtaskInputs = await generateSubtasks(parentTask.description);

    const subtasks = await db.transaction(async (tx) => {
      const createdSubtasks: TaskWithoutChildCount[] = [];
      for (const subtaskInput of subtaskInputs) {
        const newSubtask: NewTask = {
          ...subtaskInput,
          userId,
        };

        const [insertedTask] = await tx
          .insert(tasks)
          .values(newSubtask)
          .returning();

        if (!insertedTask) {
          throw new Error('Failed to insert subtask');
        }

        await tx.insert(taskRelationships).values({
          parentTaskId: parentTask.id,
          childTaskId: insertedTask.id,
        });

        createdSubtasks.push(insertedTask);
      }
      return createdSubtasks;
    });

    // Add childCount of 0 to each subtask before sending the response
    const subtasksWithChildCount: Task[] = subtasks.map(task => ({
      ...task,
      childCount: 0
    }));

    return NextResponse.json(subtasksWithChildCount, { status: 201 });
  } catch (error) {
    console.error('Error generating subtasks:', error);
    return NextResponse.json({ error: 'Failed to generate subtasks' }, { status: 500 });
  }
}