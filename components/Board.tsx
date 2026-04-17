'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useKanbanStore } from '@/lib/store';
import { Column } from './Column';
import { Card } from './Card';
import { CardModal } from './CardModal';
import { Card as CardType, ColumnId } from '@/types/kanban';
import { createPortal } from 'react-dom';
import { Search, Filter, Moon, Sun, LayoutGrid } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export const Board = () => {
  const { cards, columns, addCard, deleteCard, updateCard, moveCard, reorderCards } = useKanbanStore();
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<ColumnId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredCards = cards.filter(
    (card) =>
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Card') {
      setActiveCard(event.active.data.current.card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === 'Card';
    const isOverACard = over.data.current?.type === 'Card';

    if (!isActiveACard) return;

    // Dropping a Card over another Card
    if (isActiveACard && isOverACard) {
      const activeCard = active.data.current.card as CardType;
      const overCard = over.data.current.card as CardType;

      if (activeCard.columnId !== overCard.columnId) {
        moveCard(activeId, overCard.columnId);
      }
    }

    // Dropping a Card over a Column
    const isOverAColumn = columns.some((col) => col.id === overId);
    if (isActiveACard && isOverAColumn) {
      const activeCard = active.data.current.card as CardType;
      if (activeCard.columnId !== overId) {
        moveCard(activeId, overId as ColumnId);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId !== overId) {
      reorderCards(activeId, overId);
    }

    setActiveCard(null);
  };

  const openCreateModal = (columnId?: ColumnId) => {
    setEditingCard(null);
    setActiveColumnId(columnId || 'pending');
    setIsModalOpen(true);
  };

  const openEditModal = (card: CardType) => {
    setEditingCard(card);
    setActiveColumnId(null);
    setIsModalOpen(true);
  };

  const handleSaveCard = (title: string, description: string, finalColumnId: ColumnId) => {
    if (editingCard) {
      updateCard(editingCard.id, { title, description, columnId: finalColumnId });
    } else {
      addCard(title, description, finalColumnId);
    }
    // Clear search so user can see the new/updated card
    setSearchQuery('');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background transition-colors duration-300 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(37,99,235,0.03),transparent_40%)] pointer-events-none" />
      
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/40 bg-card/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <div className="bg-primary/5 p-1 rounded-xl border border-primary/10 w-fit">
              <img src="/logo.png" alt="TaskFlow" className="h-12 w-auto min-w-[50px] object-contain" />
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">
              Manage your projects visually
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="rounded-full w-10 h-10 p-0"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5" />}
          </Button>
          <div className="h-8 w-[1px] bg-border mx-2" />
          <Button onClick={() => openCreateModal()} className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
            New Task
          </Button>
        </div>
      </header>

      {/* Board Layout */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-8 bg-background">
        <div className="flex gap-8 h-full min-w-max">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                cards={filteredCards.filter((c) => c.columnId === column.id)}
                onAddCard={() => openCreateModal(column.id)}
                onEditCard={openEditModal}
                onDeleteCard={(id) => {
                   if (confirm('Are you sure you want to delete this card?')) {
                     deleteCard(id);
                   }
                }}
              />
            ))}

            {typeof document !== 'undefined' &&
              createPortal(
                <DragOverlay>
                  {activeCard ? (
                    <Card
                      card={activeCard}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ) : null}
                </DragOverlay>,
                document.body
              )}
          </DndContext>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-border/40 bg-card/30 backdrop-blur-md flex items-center justify-between text-[11px] text-muted-foreground font-medium uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>System Operational</span>
          </div>
          <span>&copy; 2026 TaskFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
        </div>
      </footer>

      <CardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCard}
        initialCard={editingCard}
        defaultColumnId={activeColumnId || 'pending'}
      />
    </div>
  );
};
