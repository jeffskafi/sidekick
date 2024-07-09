import { revalidatePath } from 'next/cache'
import { db } from "../server/db";
import { projects } from "../server/db/schema";

async function createProject() {
  'use server'
  
  await db.insert(projects).values({
    name: 'New Project',
  });
  revalidatePath('/');
}

export function AddProjectButton() {
  return (
    <form action={createProject}>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create Project
      </button>
    </form>
  );
}