import React from 'react';
import { BoardWithLists } from '@shared/types/api';

interface BoardHeaderProps {
  board: BoardWithLists;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ board }) => {
  return (
    <div className="bg-white shadow px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">{board.name}</h1>
      <div className="flex items-center space-x-2">
        <button className="text-gray-600 hover:text-gray-900">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};