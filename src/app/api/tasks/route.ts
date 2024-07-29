import { NextResponse } from 'next/server';
import { getTopLevelTasks, createTask, updateTask, deleteTask, moveTask, searchTasks, getSubtasks } from '~/server/actions/taskActions';
import { auth } from "@clerk/nextjs/server";
import type { NewTask, TaskUpdate, TaskSearchParams, TaskSelect } from '~/server/db/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId') as TaskSelect['id'] | undefined;

    if (taskId) {
      const subtasks = await getSubtasks(taskId);
      return NextResponse.json(subtasks, { status: 200 });
    } else {
      const tasks = await getTopLevelTasks();
      return NextResponse.json(tasks, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as Omit<NewTask, 'userId'>;
    
    const taskInput: NewTask = {
      ...body,
      userId,
    };

    const newTask = await createTask(taskInput);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const body = await request.json() as TaskUpdate;
    
    const updatedTask = await updateTask(taskId, body);
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }
    await deleteTask(taskId);
    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const newParentId = searchParams.get('newParentId');
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }
    await moveTask(taskId, newParentId);
    return NextResponse.json({ message: 'Task moved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error moving task:', error);
    return NextResponse.json({ error: 'Failed to move task' }, { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams: TaskSearchParams = {
      query: url.searchParams.get('query') ?? undefined,
      status: url.searchParams.get('status') as TaskSearchParams['status'] ?? undefined,
      priority: url.searchParams.get('priority') as TaskSearchParams['priority'] ?? undefined,
      completed: url.searchParams.get('completed') === 'true' ? true : url.searchParams.get('completed') === 'false' ? false : undefined,
      dueDate: url.searchParams.get('dueDate') ? new Date(url.searchParams.get('dueDate')!) : undefined,
    };
    const searchResults = await searchTasks(searchParams);
    return NextResponse.json(searchResults, { status: 200 });
  } catch (error) {
    console.error('Error searching tasks:', error);
    return NextResponse.json({ error: 'Failed to search tasks' }, { status: 500 });
  }
}