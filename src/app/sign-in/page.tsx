import { SignIn } from "@clerk/nextjs";
import { useRouter } from 'next/router';

export default function SignInPage() {
  const router = useRouter();
  const { redirect_url } = router.query;
  const forceRedirectUrl = redirect_url ? redirect_url.toString() : "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
      <SignIn
        forceRedirectUrl={forceRedirectUrl}
      />
    </div>
  );
}
