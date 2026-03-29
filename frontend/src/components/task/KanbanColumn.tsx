import { cn } from "@/lib/utils";
import type { FilterState, KanbanColumnProps, PaginationState } from "@/types";

import { useFilteredTasks } from "@/hooks/use-tasks/useTasks";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { TaskCard } from "./TaskCard";

const PAGE_SIZE = 5;

export function KanbanColumn({
  title,
  type,
  accentColor,
  onEdit,
  onView,
}: KanbanColumnProps) {
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [showFilters, setShowFilters] = useState(false);

  const { tasks, total, categories } = useFilteredTasks(
    type,
    filter,
    pagination,
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleSearch(value: string) {
    setFilter((f) => ({ ...f, search: value }));
    setPagination((p) => ({ ...p, page: 1 }));
  }

  function handleCategory(id: string) {
    setFilter((f) => ({
      ...f,
      categoryId: f.categoryId === id ? undefined : id,
    }));
    setPagination((p) => ({ ...p, page: 1 }));
  }

  return (
    <div className="flex flex-col min-w-0 bg-muted/40 rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {total}
          </span>
        </div>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            showFilters && "bg-accent text-accent-foreground",
          )}
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {showFilters && (
        <div className="px-4 py-3 bg-card border-b border-border flex flex-col gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={filter.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-input"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={filter.categoryId ?? ""}
              onChange={(e) => handleCategory(e.target.value)}
              className="text-xs px-2 py-1 rounded-md border border-border bg-input"
            >
              <option value="">Categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={`${filter.sortBy}-${filter.sortDir}`}
              onChange={(e) => {
                const [sortBy, sortDir] = e.target.value.split("-") as [
                  FilterState["sortBy"],
                  FilterState["sortDir"],
                ];
                setFilter((f) => ({ ...f, sortBy, sortDir }));
              }}
              className="text-xs px-2 py-1 rounded-md border border-border bg-input"
            >
              <option value="createdAt-desc">Mais recentes</option>
              <option value="createdAt-asc">Mais antigas</option>
              <option value="dueDate-asc">Prazo próximo</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-2.5 p-3 overflow-y-auto min-h-[200px]">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Nenhuma tarefa encontrada
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={categories.find(
                (c) => String(c.id) === String(task.categoryId),
              )}
              onEdit={onEdit}
              onView={onView}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-card">
          <span className="text-xs text-muted-foreground">
            {(pagination.page - 1) * PAGE_SIZE + 1}-
            {Math.min(pagination.page * PAGE_SIZE, total)} de {total}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  page: Math.max(1, p.page - 1),
                }))
              }
              disabled={pagination.page === 1}
              className="p-1 rounded-md disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="text-xs px-1">
              {pagination.page} / {totalPages}
            </span>

            <button
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  page: Math.min(totalPages, p.page + 1),
                }))
              }
              disabled={pagination.page === totalPages}
              className="p-1 rounded-md disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
