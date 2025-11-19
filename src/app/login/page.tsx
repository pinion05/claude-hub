'use client';

import { LoginCard } from '@/components';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (username: string, password: string) => {
    // TODO: call the real authentication API
    const response = await fetch('/api/pinion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer temporary-token', // TODO: implement real token logic
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Failed to log in.');
    }

    // TODO: store the token (localStorage, cookie, etc.)
    const data = await response.json();
    console.log('Login successful:', data);

    // Redirect to the dashboard on success
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <LoginCard onLogin={handleLogin} />
    </div>
  );
}
