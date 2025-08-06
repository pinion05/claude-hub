import Link from 'next/link';
import { Button } from '@/components/atoms/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h2 className="text-6xl font-bold text-accent mb-4">404</h2>
        <p className="text-xl text-gray-400 mb-6">
          Page not found
        </p>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button variant="primary">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}