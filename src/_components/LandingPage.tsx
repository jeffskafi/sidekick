import AuthButtons from '~/components/ui/auth-buttons';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Sidekick</h1>
      <p className="text-xl mb-8">Your AI-powered productivity assistant</p>
      <div className="flex space-x-4">
        <AuthButtons />
      </div>
    </div>
  );
}