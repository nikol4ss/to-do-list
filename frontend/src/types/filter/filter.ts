export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface FilterState {
  search: string;
  categoryId?: string;
  priority?: string;
  sortBy: "createdAt" | "dueDate" | "priority";
  sortDir: "asc" | "desc";
}
