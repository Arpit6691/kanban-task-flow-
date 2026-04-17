import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KanbanState, Card, ColumnId } from '@/types/kanban';
import { arrayMove } from '@dnd-kit/sortable';

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      cards: [],
      columns: [
        { id: 'pending', title: 'Pending' },
        { id: 'in-progress', title: 'In Progress' },
        { id: 'completed', title: 'Completed' },
      ],
      addCard: (title, description, columnId) =>
        set((state) => ({
          cards: [
            ...state.cards,
            {
              id: crypto.randomUUID(),
              title,
              description,
              columnId: columnId || 'pending',
              createdAt: Date.now(),
            },
          ],
        })),
      updateCard: (id, updates) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, ...updates } : card
          ),
        })),
      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        })),
      moveCard: (cardId, newColumnId) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === cardId ? { ...card, columnId: newColumnId } : card
          ),
        })),
      reorderCards: (activeId, overId) =>
        set((state) => {
          const activeIndex = state.cards.findIndex((c) => c.id === activeId);
          const overIndex = state.cards.findIndex((c) => c.id === overId);
          
          if (activeIndex !== -1 && overIndex !== -1) {
            const activeCard = state.cards[activeIndex];
            const overCard = state.cards[overIndex];
            
            // If they are in different columns, update the columnId first
            if (activeCard.columnId !== overCard.columnId) {
              const updatedCards = [...state.cards];
              updatedCards[activeIndex] = { ...activeCard, columnId: overCard.columnId };
              return { cards: arrayMove(updatedCards, activeIndex, overIndex) };
            }
            
            return { cards: arrayMove(state.cards, activeIndex, overIndex) };
          }
          return state;
        }),
    }),
    {
      name: 'kanban-storage',
    }
  )
);
