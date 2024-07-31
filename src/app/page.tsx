import { auth } from "@clerk/nextjs/server";
import dynamic from 'next/dynamic'
import LandingPage from "~/app/_components/LandingPage";
import { getTopLevelTasks } from "~/server/actions/taskActions";

const Tasks = dynamic(() => import('~/app/_components/tasks/Tasks'), { ssr: true })

export default async function HomePage() {
  const { userId } = auth();
  
  if (!userId) {
    return <LandingPage />;
  }

  // Fetch user preferences
  const tasks = await getTopLevelTasks();

  return (
    <Tasks initialTasks={tasks} userId={userId} />
  );
}