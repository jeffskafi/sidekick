import { SignInButton, SignUpButton } from "@clerk/nextjs";

function AuthButtons() {
  return (
    <>
      <SignInButton mode="modal">
        <button className="text-foreground hover:text-foreground/80 transition-colors">
          Sign In
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="text-foreground hover:text-foreground/80 transition-colors ml-4">
          Sign Up
        </button>
      </SignUpButton>
    </>
  );
}

export default AuthButtons;