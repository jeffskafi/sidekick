import React from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

interface MessagePageProps {
  title: string;
  message: string;
}

export default function MessagePage({ title, message }: MessagePageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{title}</h1>
        <p className="mb-8 text-xl">{message}</p>
        <Link href="/settings">
          <Button>Return to Settings</Button>
        </Link>
      </div>
    </div>
  );
}