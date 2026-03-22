"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useNotes } from "@/hooks/useNotes";
import { NoteCard } from "@/components/ui/NoteCard";
import { NoteForm } from "@/components/ui/NoteForm";
import { NoteView } from "@/components/ui/NoteView";
import { Note } from "@/types/note";
import { Plus, NotebookPen, LogOut } from "lucide-react";

export default function Dashboard() {
  const [userId, setUserId] = useState<string | undefined>();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  // Route Protection & Auth State listener
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if we are currently handling an OAuth redirect
      const hasAuthParams = window.location.hash.includes("access_token") || 
                           window.location.hash.includes("error") ||
                           window.location.search.includes("code=");

      if (!session && !hasAuthParams) {
        router.push("/login");
      } else if (session) {
        setUserId(session.user.id);
      }
      setIsAuthLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setUserId(undefined);
          router.push("/login");
        } else if (session) {
          setUserId(session.user.id);
          setIsAuthLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  // Hook now correctly receives userId
  const { notes, isLoaded, error, addNote, updateNote, deleteNote, toggleCompleted } = useNotes(userId);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [viewingNote, setViewingNote] = useState<Note | undefined>();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Prevent hydration mismatch & unauthorized flashing
  if (isAuthLoading || (!isLoaded && userId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <NotebookPen className="w-12 h-12 text-accent/50" />
          <p className="text-muted font-medium">Loading Aura Workspace...</p>
        </div>
      </div>
    );
  }

  // If there's no userId (meaning redirect is in progress), render nothing
  if (!userId) {
    return null;
  }

  const handleCreateNew = () => {
    setEditingNote(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleView = (note: Note) => {
    setViewingNote(note);
  };

  const handleSave = (title: string, content: string, dueDate: number | null) => {
    if (editingNote) {
      updateNote(editingNote.id, { title, content, dueDate });
    } else {
      addNote(title, content, dueDate);
    }
    setIsFormOpen(false);
  };

  // Sort notes: Overdue first, then upcoming, then incomplete without date, then completed
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    return b.updatedAt - a.updatedAt;
  });

  const pendingCount = notes.filter(n => !n.completed).length;

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none opacity-80" />

      {/* Header */}
      <header className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 mb-16 space-y-4 md:space-y-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl border border-border shadow-sm">
              <NotebookPen className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Aura Notes
              </h1>
              <p className="text-muted font-medium mt-1 inline-flex items-center gap-2">
                {pendingCount} {pendingCount === 1 ? 'task' : 'tasks'} pending
                {error && <span className="text-danger text-xs ml-2 bg-danger-transparent px-2 py-1 rounded-full">{error}</span>}
              </p>
            </div>
          </div>
          
          {/* Mobile Logout (shows up next to logo on mobile only) */}
          <button 
            onClick={handleLogout}
            className="md:hidden p-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-xl transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <button 
            onClick={handleLogout}
            className="hidden md:flex p-3 text-muted hover:text-danger hover:bg-danger-transparent rounded-xl transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>

          <button 
            onClick={handleCreateNew}
            className="group relative px-6 py-3 bg-foreground text-surface font-semibold rounded-2xl flex items-center justify-center w-full md:w-auto gap-2 hover:bg-foreground/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Plus className="w-5 h-5" />
            <span>New Note</span>
          </button>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedNotes.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl glass-panel text-center">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 border border-border shadow-inner">
              <NotebookPen className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">Workspace is empty</h3>
            <p className="text-muted max-w-sm">
              You don&apos;t have any notes or reminders yet. Create a new note to get started.
            </p>
            <button 
              onClick={handleCreateNew}
              className="mt-6 text-accent hover:text-accent-hover font-medium underline underline-offset-4"
            >
              Create your first note
            </button>
          </div>
        ) : (
          sortedNotes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onEdit={handleEdit}
              onView={handleView}
              onDelete={deleteNote}
              onToggleComplete={toggleCompleted}
            />
          ))
        )}
      </div>

      {isFormOpen && (
        <NoteForm 
          key={editingNote?.id || 'new'}
          initialData={editingNote} 
          onSave={handleSave} 
          onCancel={() => setIsFormOpen(false)} 
        />
      )}

      {viewingNote && (
        <NoteView 
          note={viewingNote} 
          onClose={() => setViewingNote(undefined)} 
          onToggleComplete={toggleCompleted}
        />
      )}
    </main>
  );
}
