export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  dueDate?: number | null; 
  completed: boolean;
}
