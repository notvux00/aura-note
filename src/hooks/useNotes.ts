"use client";

import { useState, useEffect, useCallback } from "react";
import { Note } from "@/types/note";
import { supabase } from "@/lib/supabase";

const LOCAL_STORAGE_KEY = "aura_notes_data";

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to map DB record to Note type
  const mapDbNoteToNote = useCallback((d: any): Note => ({
    id: String(d.id),
    title: String(d.title),
    content: String(d.body),
    createdAt: new Date(String(d.created_at)).getTime(),
    updatedAt: new Date(String(d.updated_at)).getTime(),
    dueDate: d.due_date ? new Date(String(d.due_date)).getTime() : null,
    completed: Boolean(d.is_completed),
  }), []);

  // Function to load notes from Supabase
  const loadNotesFromSupabase = useCallback(async () => {
    if (!userId) {
      setNotes([]);
      setIsLoaded(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setNotes(data.map(mapDbNoteToNote));
    } catch (e) {
      console.error("Failed to load notes from Supabase", e);
      setError("Không thể lấy ghi chú. Vui lòng kiểm tra lại kết nối mạng!");
    } finally {
      setIsLoaded(true);
    }
  }, [userId, mapDbNoteToNote]);

  useEffect(() => {
    // Wipe local storage data as requested to save space
    if (typeof window !== "undefined") {
      try {
        if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch (e) {
        // Ignore
      }
    }

    loadNotesFromSupabase();

    // Subscribe to Realtime changes
    if (!userId) return;

    const channel = supabase
      .channel(`public:notes:user=${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newNote = mapDbNoteToNote(payload.new);
            setNotes((prev) => {
              if (prev.find((n) => n.id === newNote.id)) return prev;
              return [newNote, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedNote = mapDbNoteToNote(payload.new);
            setNotes((prev) =>
              prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = String(payload.old.id);
            setNotes((prev) => prev.filter((n) => n.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadNotesFromSupabase, mapDbNoteToNote]);

  const addNote = async (
    title: string,
    content: string,
    dueDate: number | null = null
  ) => {
    if (!userId) return;

    // Optimistic UI updates could be implemented here, 
    // but building an online-only requirement means we should wait for the DB.
    try {
      const { data, error } = await supabase
        .from("notes")
        .insert([
          {
            user_id: userId,
            title,
            body: content,
            due_date: dueDate ? new Date(dueDate).toISOString() : null,
            is_completed: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        id: data.id,
        title: data.title,
        content: data.body,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        dueDate: data.due_date ? new Date(data.due_date).getTime() : null,
        completed: data.is_completed,
      };

      setNotes((prev) => [newNote, ...prev]);
    } catch (e) {
      console.error("Failed to insert note:", e);
      alert("Lỗi mạng: Không thể tạo ghi chú.");
    }
  };

  const updateNote = async (
    id: string,
    updates: Partial<Omit<Note, "id" | "createdAt">>
  ) => {
    if (!userId) return;

    try {
      // Map JS properties back to Supabase columns
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.body = updates.content;
      if (updates.completed !== undefined)
        dbUpdates.is_completed = updates.completed;
      if (updates.dueDate !== undefined)
        dbUpdates.due_date = updates.dueDate
          ? new Date(updates.dueDate).toISOString()
          : null;

      const { data, error } = await supabase
        .from("notes")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id
            ? {
                ...note,
                ...updates,
                updatedAt: new Date(data.updated_at).getTime(),
              }
            : note
        )
      );
    } catch (e) {
      console.error("Failed to update note:", e);
      alert("Lỗi mạng: Không thể cập nhật ghi chú.");
    }
  };

  const deleteNote = async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;

      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (e) {
      console.error("Failed to delete note:", e);
      alert("Lỗi mạng: Không thể xóa ghi chú.");
    }
  };

  const toggleCompleted = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      await updateNote(id, { completed: !note.completed });
    }
  };

  return {
    notes,
    isLoaded,
    error,
    addNote,
    updateNote,
    deleteNote,
    toggleCompleted,
  };
}
