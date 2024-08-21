import React from 'react';

export default function ChatGPTConnect() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-8">
      <h1 className="text-4xl font-bold mb-8 text-text-light dark:text-text-dark">Integrating with ChatGPT</h1>
      <div className="max-w-2xl text-text-light dark:text-text-dark">
        <h2 className="text-2xl font-semibold mb-4">Steps to Integrate:</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li>Sign up for an OpenAI account if you haven&apos;t already.</li>
          <li>Navigate to the OpenAI API dashboard and create a new API key.</li>
          <li>Install the OpenAI library in your project:
            <pre className="bg-surface-light dark:bg-surface-dark p-2 mt-2 rounded">npm install openai</pre>
          </li>
          <li>Set up your API key as an environment variable for security.</li>
          <li>Import and initialize the OpenAI client in your code:
            <pre className="bg-surface-light dark:bg-surface-dark p-2 mt-2 rounded">
              {`import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});`}
            </pre>
          </li>
          <li>Use the client to make API calls to ChatGPT:
            <pre className="bg-surface-light dark:bg-surface-dark p-2 mt-2 rounded">
              {`const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: "Hello, ChatGPT!" }],
});`}
            </pre>
          </li>
        </ol>
        <p className="mt-6">
          For more detailed information and advanced usage, please refer to the 
          <a href="https://platform.openai.com/docs/api-reference" className="text-accent-light dark:text-accent-dark hover:underline"> official OpenAI API documentation</a>.
        </p>
      </div>
    </div>
  );
}