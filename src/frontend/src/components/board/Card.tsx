'use client';

import { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { CardWithDetails } from '@task-board/shared';
import { cn } from '@/utils/cn';

interface CardProps {
  card: CardWithDetails;
  index: number;
  onClick?: () => void;
}

export const Card = memo(function Card({ card, index, onClick }: CardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn(
            'card',
            snapshot.isDragging && 'dragging'
          )}
        >
          {/* Labels */}
          {card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((label) => (
                <span
                  key={label.id}
                  className="h-2 w-10 rounded-sm"
                  style={{ backgroundColor: label.color }}
                  title={label.name}
                />
              ))}
            </div>
          )}

          {/* Title */}
          <div className="text-text-primary">{card.title}</div>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2">
            {card.badges.due_date && (
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(card.badges.due_date).toLocaleDateString()}
              </span>
            )}
            {card.badges.comments > 0 && (
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {card.badges.comments}
              </span>
            )}
            {card.badges.attachments > 0 && (
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {card.badges.attachments}
              </span>
            )}
          </div>

          {/* Members */}
          {card.members.length > 0 && (
            <div className="flex -space-x-2 mt-2">
              {card.members.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="w-6 h-6 rounded-full bg-states-hover border-2 border-ui-background flex items-center justify-center text-xs font-medium"
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {card.members.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-states-hover border-2 border-ui-background flex items-center justify-center text-xs font-medium">
                  +{card.members.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
});