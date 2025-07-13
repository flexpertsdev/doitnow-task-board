'use client';

import type { BoardWithLists } from '@task-board/shared';
import { EditableText } from '../base/EditableText';
import { Button } from '../base/Button';

interface BoardHeaderProps {
  board: BoardWithLists;
}

export function BoardHeader({ board }: BoardHeaderProps) {
  const handleUpdateName = async (name: string) => {
    // TODO: Implement board name update
    console.log('Update board name:', name);
  };

  return (
    <header className="h-12 px-4 flex items-center justify-between bg-black/10">
      <div className="flex items-center gap-4">
        <EditableText
          value={board.name}
          onConfirm={handleUpdateName}
          className="text-lg font-bold text-white"
          inputClassName="bg-white/20 text-white"
        />
        <button className="p-1 text-white/80 hover:text-white">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm">
          Invite
        </Button>
        <button className="p-2 text-white/80 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </header>
  );
}