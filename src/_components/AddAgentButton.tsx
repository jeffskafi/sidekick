'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "~/components/ui/button";

export function AddAgentButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddAgent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Agent', // You might want to prompt for a name
          projectId: 1, // Replace with actual project ID or selection
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add agent');
      }

      // Refresh the current route
      router.refresh();
    } catch (error) {
      console.error('Error adding agent:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="default"
      onClick={handleAddAgent} 
      disabled={isLoading}
    >
      {isLoading ? 'Adding...' : 'Add Agent'}
    </Button>
  );
}