"use client";

import { useState, useEffect } from 'react';
import { Note } from '@/types/note';

const STORAGE_KEY = 'aura_notes_data';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse notes from local storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveToStorage = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
  };

  const addNote = (title: string, content: string, dueDate: number | null = null) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueDate,
      completed: false,
    };
    saveToStorage([newNote, ...notes]);
  };

  const updateNote = (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
    );
    saveToStorage(updatedNotes);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveToStorage(updatedNotes);
  };

  const toggleCompleted = (id: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, completed: !note.completed, updatedAt: Date.now() } : note
    );
    saveToStorage(updatedNotes);
  };

  return {
    notes,
    isLoaded,
    addNote,
    updateNote,
    deleteNote,
    toggleCompleted,
  };
}
