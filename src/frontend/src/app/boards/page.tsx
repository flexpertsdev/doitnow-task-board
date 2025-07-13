'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@supabase/auth-helpers-react';
import { useSupabase } from '@/app/providers';
import { Button } from '@/components/base/Button';

export default function BoardsPage() {
  const router = useRouter();
  const session = useSession();
  const supabase = useSupabase();
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [boardName, setBoardName] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    loadBoards();
  }, [session]);

  const loadBoards = async () => {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('created_by', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoards(data || []);
    } catch (err) {
      console.error('Error loading boards:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) return;

    setCreating(true);
    try {
      const slug = boardName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { data, error } = await supabase
        .from('boards')
        .insert({
          name: boardName,
          slug: slug,
          created_by: session?.user?.id,
          visibility: 'private'
        })
        .select()
        .single();

      if (error) throw error;
      
      router.push(`/b/${data.id}`);
    } catch (err) {
      console.error('Error creating board:', err);
      alert('Failed to create board. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ui-surface">
      <nav className="bg-ui-background shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Task Board</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-text-secondary">{session?.user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-text-secondary hover:text-text-primary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Boards</h2>
          
          <form onSubmit={createBoard} className="flex gap-2 mb-6">
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Enter board name..."
              className="flex-1 px-3 py-2 border-2 border-ui-border rounded-md focus:outline-none focus:border-states-focus"
              disabled={creating}
            />
            <Button type="submit" loading={creating}>
              Create Board
            </Button>
          </form>

          {boards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">No boards yet. Create your first board!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/b/${board.id}`}
                  className="block p-6 bg-ui-background rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">{board.name}</h3>
                  <p className="text-sm text-text-secondary">
                    Created {new Date(board.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}