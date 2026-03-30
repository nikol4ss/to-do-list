export type ColumnType = "open" | "done" | "shared";

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  categoryName?: string | null;
  ownerId: string;
  ownerName?: string;
  shared?: boolean;
  sharedWith?: string[];
  sharePermission?: "owner" | "read" | "edit" | null;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  isDone: boolean;
}

export interface TaskFormData {
  title: string;
  description?: string;
  categoryId?: string;
  dueDate?: string;
}
