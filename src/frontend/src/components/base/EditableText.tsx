'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface EditableTextProps {
  value: string;
  onConfirm: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function EditableText({
  value,
  onConfirm,
  placeholder = 'Enter text...',
  className,
  inputClassName,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleConfirm = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onConfirm(trimmed);
    }
    setEditValue(value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleConfirm}
        onKeyDown={handleKeyDown}
        className={cn('editable-text', inputClassName)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn('editable-text cursor-text', className)}
    >
      {value || <span className="text-text-disabled">{placeholder}</span>}
    </div>
  );
}