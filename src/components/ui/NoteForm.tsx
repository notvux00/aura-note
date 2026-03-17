"use client";

import { useState } from "react";
import { Note } from "@/types/note";
import { X, Save, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface NoteFormProps {
  initialData?: Note;
  onSave: (title: string, content: string, dueDate: number | null) => void;
  onCancel: () => void;
}

export function NoteForm({ initialData, onSave, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [dueDateStr, setDueDateStr] = useState(
    initialData?.dueDate ? format(initialData.dueDate, "yyyy-MM-dd'T'HH:mm") : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const parsedDate = dueDateStr ? new Date(dueDateStr).getTime() : null;
    onSave(title, content, parsedDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            {initialData ? "Edit Note" : "Create Note"}
          </h2>
          <button 
            onClick={onCancel}
            className="p-2 -mr-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            autoFocus
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-lg font-medium text-foreground placeholder:text-muted/60 border-none focus:outline-none focus:ring-0 px-1"
          />
          
          <textarea
            placeholder="Type your notes here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full bg-surface/50 border border-border rounded-xl p-4 text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none"
          />

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-muted" />
              </div>
              <input
                type="datetime-local"
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full bg-surface/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all color-scheme-dark"
                style={{ colorScheme: "dark" }}
              />
            </div>
            
            <button
              type="submit"
              disabled={!title.trim() && !content.trim()}
              className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
            >
              <Save className="w-4 h-4" />
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
