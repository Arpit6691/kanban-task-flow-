export type ColumnId = 'pending' | 'in-progress' | 'completed';

export interface Card {
  id: string;
  title: string;
  description: string;
  columnId: ColumnId;
  createdAt: number;
}

export interface Column {
  id: ColumnId;
  title: string;
}

export interface KanbanState {
  cards: Card[];
  columns: Column[];
  addCard: (title: string, description: string, columnId?: ColumnId) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  moveCard: (cardId: string, newColumnId: ColumnId) => void;
  reorderCards: (activeId: string, overId: string) => void;
}
