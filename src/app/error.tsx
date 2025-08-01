'use client';

import { useEffect } from 'react';
import { Button } from '@/components/atoms/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h2 className="text-4xl font-bold text-accent mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-400 mb-6">
          An error occurred while loading this page.
        </p>
        <Button
          onClick={reset}
          variant="primary"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}