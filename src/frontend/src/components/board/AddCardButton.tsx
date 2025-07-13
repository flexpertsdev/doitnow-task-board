'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface AddCardButtonProps {
  onAdd: (title: string) => void;
}

export function AddCardButton({ onAdd }: AddCardButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isAdding && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed) {
      onAdd(trimmed);
      setTitle('');
      // Keep form open for quick addition
      textareaRef.current?.focus();
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isAdding) {
    return (
      <div className="mt-2">
        <textarea
          ref={textareaRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a title for this card..."
          className="w-full p-2 rounded-sm border-2 border-transparent bg-ui-background resize-none focus:outline-none focus:border-states-focus"
          rows={3}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-brand-primary text-text-inverse rounded-sm hover:bg-brand-secondary transition-colors text-sm"
          >
            Add card
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
        'w-full mt-2 p-2 text-left rounded-sm',
        'hover:bg-states-hover transition-colors',
        'flex items-center gap-2 text-text-secondary'
      )}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add a card
    </button>
  );
}