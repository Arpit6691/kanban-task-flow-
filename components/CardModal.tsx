'use client';

import React, { useState, useEffect } from 'react';
import { Card, ColumnId } from '@/types/kanban';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, columnId: ColumnId) => void;
  initialCard?: Card | null;
  defaultColumnId?: ColumnId;
}

export const CardModal = ({ isOpen, onClose, onSave, initialCard, defaultColumnId }: CardModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState<ColumnId>('pending');

  useEffect(() => {
    if (initialCard) {
      setTitle(initialCard.title);
      setDescription(initialCard.description);
      setColumnId(initialCard.columnId);
    } else {
      setTitle('');
      setDescription('');
      setColumnId(defaultColumnId || 'pending');
    }
  }, [initialCard, isOpen, defaultColumnId]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title, description, columnId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-card text-card-foreground p-6 rounded-2xl shadow-2xl border border-border overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">
              {initialCard ? 'Edit Card' : 'Create New Card'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Title</label>
              <Input
                placeholder="Enter card title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Status / Column</label>
              <div className="flex gap-2">
                {(['pending', 'in-progress', 'completed'] as ColumnId[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => setColumnId(id)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border",
                      columnId === id 
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" 
                        : "bg-secondary/50 text-muted-foreground border-transparent hover:border-border"
                    )}
                  >
                    {id.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Description</label>
              <Textarea
                placeholder="Add a detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {initialCard ? 'Save Changes' : 'Create Card'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
