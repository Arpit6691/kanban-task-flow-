'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '@/types/kanban';
import { cn } from '@/lib/utils';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from './ui/Button';

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (id: string) => void;
}

export const Card = ({ card, onEdit, onDelete }: CardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'bg-primary/5 border-2 border-primary/20 rounded-xl h-[120px] min-h-[120px] opacity-50 mb-3'
        )}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-card text-card-foreground p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 mb-3 relative'
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(card)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(card.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{card.title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
        {card.description || 'No description'}
      </p>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/60 font-medium">
          {new Date(card.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
