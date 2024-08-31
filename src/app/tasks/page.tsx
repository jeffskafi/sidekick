import { auth } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";
import { getTopLevelTasks } from "~/server/actions/taskActions";

const Tasks = dynamic(() => import("~/app/_components/tasks/Tasks"), {
  ssr: false,
});

export default async function TasksPage() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const initialTasks = await getTopLevelTasks();

  return (
    <div className="h-full w-full">
      <Tasks initialTasks={initialTasks} userId={userId} />
    </div>
  );
}
