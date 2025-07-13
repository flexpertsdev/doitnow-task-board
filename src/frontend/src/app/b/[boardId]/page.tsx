'use client';

import { useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import { useBoardStore } from '@/stores/board';
import { BoardHeader } from '@/components/board/BoardHeader';
import { BoardCanvas } from '@/components/board/BoardCanvas';
import { useSupabase } from '@/app/providers';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const session = useSession();
  const supabase = useSupabase();
  const boardId = params.boardId as string;

  const {
    board,
    loading,
    error,
    setBoard,
    setLoading,
    setError,
    moveCard,
    connectWebSocket,
    disconnectWebSocket,
  } = useBoardStore();

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    loadBoard();

    return () => {
      disconnectWebSocket();
    };
  }, [boardId, session]);

  const loadBoard = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/boards/${boardId}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load board');
      }

      const { data } = await response.json();
      setBoard(data);
      
      // Connect WebSocket
      if (session?.access_token) {
        connectWebSocket(boardId, session.access_token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !board) {
      return;
    }

    const { draggableId, source, destination } = result;

    // Optimistically update UI
    moveCard(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );

    // Send to server
    try {
      const response = await fetch(`/api/cards/${draggableId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          list_id: destination.droppableId,
          position: destination.index,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to move card');
        // Should revert optimistic update here
      }
    } catch (err) {
      console.error('Failed to move card:', err);
      // Should revert optimistic update here
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-states-error mb-4">{error}</p>
          <button
            onClick={loadBoard}
            className="px-4 py-2 bg-brand-primary text-text-inverse rounded-md hover:bg-brand-secondary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-brand-primary">
        <BoardHeader board={board} />
        <BoardCanvas board={board} />
      </div>
    </DragDropContext>
  );
}