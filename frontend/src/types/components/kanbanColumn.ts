import { Task } from "@/types/task";
import { ColumnType } from "@/types/task/task";

export interface KanbanColumnProps {
  title: string;
  type: ColumnType;
  accentColor: string;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
}
