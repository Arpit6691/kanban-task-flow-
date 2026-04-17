'use client';

import React, { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Card as CardType } from '@/types/kanban';
import { Card } from './Card';
import { cn } from '@/lib/utils';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/Button';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onAddCard: (columnId: string) => void;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (id: string) => void;
}

export const Column = ({ column, cards, onAddCard, onEditCard, onDeleteCard }: ColumnProps) => {
  const cardIds = useMemo(() => cards.map((c) => c.id), [cards]);

  return (
    <div className="flex flex-col w-full min-w-[300px] h-[calc(100vh-200px)] bg-secondary/30 rounded-2xl border border-border/50 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-sm tracking-wide uppercase text-muted-foreground">
            {column.title}
          </h2>
          <span className="bg-background text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-bold border border-border shadow-sm">
            {cards.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 scrollbar-hide pb-4">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col">
            {cards.map((card) => (
              <Card 
                key={card.id} 
                card={card} 
                onEdit={onEditCard} 
                onDelete={onDeleteCard} 
              />
            ))}
            
            {cards.length === 0 && (
              <div className="mt-8 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-medium">No cards yet</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs h-8 text-primary"
                  onClick={() => onAddCard(column.id)}
                >
                  Add Card
                </Button>
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      <div className="p-3 border-t border-border/50 bg-background/20">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground text-sm h-10 gap-2 border border-transparent hover:border-border/50 transition-all hover:bg-background"
          onClick={() => onAddCard(column.id)}
        >
          <Plus className="h-4 w-4" />
          Add a card
        </Button>
      </div>
    </div>
  );
};
