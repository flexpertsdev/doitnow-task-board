'use client';

import { Droppable } from '@hello-pangea/dnd';
import type { ListWithCards } from '@shared/types/api';
import { Card } from './Card';
import { AddCardButton } from './AddCardButton';
import { EditableText } from '../base/EditableText';
import { cn } from '@/utils/cn';

interface ListProps {
  list: ListWithCards;
  onUpdateName: (name: string) => void;
  onAddCard: (title: string) => void;
  onCardClick: (cardId: string) => void;
}

export function List({ list, onUpdateName, onAddCard, onCardClick }: ListProps) {
  return (
    <div className="list-container">
      {/* List Header */}
      <div className="flex items-center justify-between mb-2">
        <EditableText
          value={list.name}
          onConfirm={onUpdateName}
          className="flex-1 font-semibold"
        />
        <button className="p-1 rounded hover:bg-states-hover">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Cards Container */}
      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'space-y-2 min-h-[8px]',
              snapshot.isDraggingOver && 'bg-states-hover rounded'
            )}
          >
            {list.cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                onClick={() => onCardClick(card.id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Card Button */}
      <AddCardButton onAdd={onAddCard} />
    </div>
  );
}