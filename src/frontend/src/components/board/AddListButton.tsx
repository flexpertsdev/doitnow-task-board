'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface AddListButtonProps {
  onAdd: (name: string) => void;
}

export function AddListButton({ onAdd }: AddListButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onAdd(trimmed);
      setName('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isAdding) {
    return (
      <div className="list-container bg-ui-surface">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter list title..."
          className="w-full p-2 rounded-sm border-2 border-transparent bg-ui-background focus:outline-none focus:border-states-focus"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-brand-primary text-text-inverse rounded-sm hover:bg-brand-secondary transition-colors text-sm"
          >
            Add list
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 hover:bg-states-hover rounded-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className={cn(
        'list-container',
        'bg-white/20 hover:bg-white/30 transition-colors',
        'flex items-center gap-2 text-white cursor-pointer'
      )}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add another list
    </button>
  );
}