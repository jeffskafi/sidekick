'use client';

import React from 'react';
import { Button } from "~/components/ui/button";

export default function ChatGPTConnect() {
  const handleConnect = () => {
    window.location.href = 'https://chat.openai.com/aip/g-9eb6514376d9b4df496d373aad06207aa5940c83/oauth/callback';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Connect with ChatGPT</h1>
      <Button 
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleConnect}
      >
        Connect
      </Button>
    </div>
  );
}