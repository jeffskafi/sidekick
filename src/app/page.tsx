import { auth, clerkClient } from "@clerk/nextjs/server";
import dynamic from 'next/dynamic'
import LandingPage from "~/app/_components/LandingPage";
import { getTopLevelTasks } from "~/server/actions/taskActions";

const Tasks = dynamic(() => import('~/app/_components/tasks/Tasks'), { ssr: true })

interface UserPreferences {
  darkMode?: boolean;
  // Add other preference fields as needed
}

export default async function HomePage() {
  const { userId } = auth();
  
  if (!userId) {
    return <LandingPage />;
  }

  // Fetch user preferences
  const user = await clerkClient().users.getUser(userId);
  const preferences = user.publicMetadata as UserPreferences;
  const theme = preferences.darkMode ? "dark" : "light";

  const tasks = await getTopLevelTasks();

  return (
    <Tasks theme={theme} tasks={tasks} />
  );
}