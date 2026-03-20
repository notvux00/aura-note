"use client";

import { Note } from "@/types/note";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { Calendar, Trash2, Edit2, CheckCircle2, Circle } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onView: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onView, onDelete, onToggleComplete }: NoteCardProps) {
  
  const getDueDateStatus = () => {
    if (!note.dueDate || note.completed) return "normal";
    if (isPast(note.dueDate)) return "overdue";
    if (isToday(note.dueDate) || isTomorrow(note.dueDate)) return "soon";
    return "normal";
  };

  const status = getDueDateStatus();

  return (
    <div 
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl p-5 transition-all duration-300",
        "glass-panel hover:-translate-y-1 hover:shadow-xl cursor-pointer",
        status === "overdue" && "border-danger/20 shadow-sm",
        status === "soon" && "border-warning/30 shadow-sm",
        note.completed && "opacity-60 grayscale hover:opacity-100 border-border/50 bg-surface-hover"
      )}
      onClick={() => onView(note)}
    >
      {/* Header Layout */}
      <div className="flex items-start justify-between gap-4">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(note.id);
          }}
          className="mt-1 flex-shrink-0 text-muted hover:text-accent transition-colors focus:outline-none"
        >
          {note.completed ? (
            <CheckCircle2 className="w-5 h-5 text-accent" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "text-lg font-medium tracking-tight text-foreground truncate transition-all duration-300",
            note.completed && "line-through text-muted"
          )}>
            {note.title || "Untitled Note"}
          </h3>
          
          {/* Due date badge relative to completion */}
          {note.dueDate && (
            <div className={cn(
              "mt-1.5 flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full w-max text-accent border border-accent/20 bg-accent/5",
              status === "overdue" && "text-danger border-danger/20 bg-danger/5",
              status === "soon" && "text-warning border-warning/20 bg-warning/5",
              note.completed && "text-muted border-muted/20 bg-muted/5 opacity-50"
            )}>
              <Calendar className="w-3 h-3" />
              {format(note.dueDate, "MMM d, yyyy - h:mm a")}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 mt-1 pl-9">
        <div className={cn(
          "text-sm",
          note.completed && "opacity-50 grayscale"
        )}>
          <MarkdownRenderer 
            content={note.content} 
            className="line-clamp-4" 
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pl-9 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">
          {format(note.updatedAt, "MMM d")}
        </span>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
