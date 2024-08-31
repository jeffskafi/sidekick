import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LandingPage from "~/app/_components/LandingPage";
import { SignUp } from "@clerk/nextjs";

export default async function HomePage() {
  const { userId } = auth();

  if (!userId) {
    return <LandingPage />;
  }

  redirect("/tasks");
}

export function SignUpPage() {
  return <SignUp />;
}
