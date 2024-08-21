import React from 'react';
import Link from 'next/link';

export default function ChatGPTConnect() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-8">
      <h1 className="text-4xl font-bold mb-8 text-text-light dark:text-text-dark">Connect to Sidekick GPT</h1>
      <div className="max-w-2xl text-text-light dark:text-text-dark">
        <ol className="list-decimal list-inside space-y-4">
          <li>Make sure you&apos;re logged into your Sidekick app account. If you don&apos;t have one, please create an account first.</li>
          <li>Once logged in, visit the Sidekick GPT at:
            <Link href="https://chatgpt.com/g/g-DMgdGagJK-sidekick" className="text-accent-light dark:text-accent-dark hover:underline ml-1">
              chatgpt.com/g/g-DMgdGagJK-sidekick
            </Link>
          </li>
          <li>When you ask the GPT a question, you&apos;ll be prompted to sign in. Click &apos;Sign in&apos; and follow the authentication process.</li>
          <li>After signing in, you&apos;ll be redirected back to ChatGPT and can start using the Sidekick GPT.</li>
        </ol>
        <h2 className="text-2xl font-semibold mt-8 mb-4">For Mobile Users:</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li>Ensure you&apos;re signed in on Safari first.</li>
          <li>Open the ChatGPT app and navigate to the Sidekick GPT.</li>
          <li>When prompted to sign in, tap &apos;Sign in&apos;. This will open a browser within the app.</li>
          <li>After signing in, close the in-app browser, and you&apos;re ready to use Sidekick GPT!</li>
        </ol>
        <p className="mt-6">
          That&apos;s it! You&apos;re now ready to use the Sidekick GPT for your task planning and productivity needs.
        </p>
      </div>
    </div>
  );
}