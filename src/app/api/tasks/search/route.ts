import { NextResponse } from 'next/server';
import { db } from "~/server/db";
import { tasks } from "~/server/db/schema";
import { eq, and, like } from 'drizzle-orm';
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const conditions = [eq(tasks.userId, userId)];

    if (query) {
      conditions.push(like(tasks.description, `%${query}%`));
    }
    if (status) {
      conditions.push(eq(tasks.status, status));
    }
    if (priority) {
      conditions.push(eq(tasks.priority, priority));
    }

    const searchResults = await db
      .select()
      .from(tasks)
      .where(and(...conditions));

    return NextResponse.json(searchResults, { status: 200 });
  } catch (error) {
    console.error('Error searching tasks:', error);
    return NextResponse.json({ error: 'Failed to search tasks' }, { status: 500 });
  }
}