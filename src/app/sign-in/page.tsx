import { SignIn } from "@clerk/nextjs";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  const redirectUrl = searchParams.redirect_url ?? "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
      <SignIn
        // afterSignInUrl={redirectUrl}
        // redirectUrl={redirectUrl}
        forceRedirectUrl={redirectUrl}
      />
    </div>
  );
}