import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { generateSubtasks } from '~/server/actions/taskActions';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;
    if (!taskId) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const generatedSubtasks = await generateSubtasks(taskId);
    return NextResponse.json(generatedSubtasks, { status: 201 });
  } catch (error) {
    console.error('Error generating subtasks:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}