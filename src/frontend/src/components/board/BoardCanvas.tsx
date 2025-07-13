'use client';

import { useState } from 'react';
import type { BoardWithLists } from '@task-board/shared';
import { List } from './List';
import { AddListButton } from './AddListButton';
import { useBoardStore } from '@/stores/board';
import { useSession } from '@supabase/auth-helpers-react';

interface BoardCanvasProps {
  board: BoardWithLists;
}

export function BoardCanvas({ board }: BoardCanvasProps) {
  const session = useSession();
  const { updateList } = useBoardStore();

  const handleUpdateListName = async (listId: string, name: string) => {
    updateList(listId, { name });

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update list');
      }
    } catch (err) {
      console.error('Failed to update list:', err);
      // Should revert optimistic update
    }
  };

  const handleAddCard = async (listId: string, title: string) => {
    try {
      const response = await fetch(`/api/cards/lists/${listId}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to add card');
      }

      // Card will be added via WebSocket
    } catch (err) {
      console.error('Failed to add card:', err);
    }
  };

  const handleCardClick = (cardId: string) => {
    // TODO: Open card modal
    console.log('Open card:', cardId);
  };

  const handleAddList = async (name: string) => {
    try {
      const response = await fetch(`/api/lists/boards/${board.id}/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to add list');
      }

      // List will be added via WebSocket
    } catch (err) {
      console.error('Failed to add list:', err);
    }
  };

  return (
    <div className="board-canvas flex-1 bg-brand-primary">
      <div className="flex gap-2 h-full p-3 overflow-x-auto scrollbar-thin">
        {board.lists.map((list) => (
          <List
            key={list.id}
            list={list}
            onUpdateName={(name) => handleUpdateListName(list.id, name)}
            onAddCard={(title) => handleAddCard(list.id, title)}
            onCardClick={handleCardClick}
          />
        ))}
        <AddListButton onAdd={handleAddList} />
      </div>
    </div>
  );
}