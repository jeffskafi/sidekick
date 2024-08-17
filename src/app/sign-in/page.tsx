import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');

  return (
    <SignIn
      afterSignInUrl={redirectUrl ?? "/"}
      redirectUrl={redirectUrl ?? "/"}
    />
  );
}