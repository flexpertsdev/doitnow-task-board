'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@supabase/auth-helpers-react';

export default function HomePage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session) {
      router.push('/boards');
    }
  }, [session, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-xxl font-bold mb-4">Welcome to Task Board</h1>
      <p className="text-lg text-text-secondary mb-8">
        Organize anything, together
      </p>
      <div className="flex gap-4">
        <Link
          href="/auth/signin"
          className="px-6 py-3 bg-brand-primary text-text-inverse rounded-md hover:bg-brand-secondary transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="px-6 py-3 bg-ui-surface text-text-primary rounded-md hover:bg-states-hover transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}