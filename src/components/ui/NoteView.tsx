"use client";

import { Note } from "@/types/note";
import { X, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { cn } from "@/lib/utils";

interface NoteViewProps {
  note: Note;
  onClose: () => void;
}

export function NoteView({ note, onClose }: NoteViewProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl glass-panel rounded-2xl flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-foreground tracking-tight truncate">
              {note.title || "Untitled Note"}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Updated {format(note.updatedAt, "MMM d, yyyy")}
              </div>
              {note.dueDate && (
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full border",
                  note.completed ? "border-muted/20 bg-muted/5 opacity-50" : "border-accent/20 bg-accent/5 text-accent"
                )}>
                  <Calendar className="w-3.5 h-3.5" />
                  Due {format(note.dueDate, "MMM d, yyyy - h:mm a")}
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-full transition-colors ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <MarkdownRenderer content={note.content} />
          {!note.content && (
            <p className="text-muted italic">No content provided.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface/30 border-t border-border/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-surface hover:bg-surface-hover border border-border text-foreground text-sm font-medium rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
