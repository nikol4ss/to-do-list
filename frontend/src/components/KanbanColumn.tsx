import { useState } from 'react'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task, FilterState, PaginationState, TaskPriority } from '../types'
import { useFilteredTasks } from '../hooks/useTasks'
import { TaskCard } from './TaskCard'
import { cn } from '../lib/utils'

const PAGE_SIZE = 5

interface KanbanColumnProps {
  title: string
  status: Task['status']
  accentColor: string
  onEdit: (task: Task) => void
  onView: (task: Task) => void
}

export function KanbanColumn({ title, status, accentColor, onEdit, onView }: KanbanColumnProps) {
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    sortBy: 'createdAt',
    sortDir: 'desc',
  })
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: PAGE_SIZE })
  const [showFilters, setShowFilters] = useState(false)

  const { tasks, total, categories } = useFilteredTasks(status, filter, pagination)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function handleSearch(value: string) {
    setFilter((f) => ({ ...f, search: value }))
    setPagination((p) => ({ ...p, page: 1 }))
  }

  function handleCategory(id: string) {
    setFilter((f) => ({ ...f, categoryId: f.categoryId === id ? undefined : id }))
    setPagination((p) => ({ ...p, page: 1 }))
  }

  function handlePriority(p: TaskPriority | '') {
    setFilter((f) => ({ ...f, priority: p || undefined }))
    setPagination((p2) => ({ ...p2, page: 1 }))
  }

  return (
    <div className="flex flex-col min-w-0 bg-muted/40 rounded-xl border border-border overflow-hidden">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {total}
          </span>
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
            showFilters && 'bg-accent text-accent-foreground'
          )}
          aria-label="Filtros"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="px-4 py-3 bg-card border-b border-border flex flex-col gap-2 animate-fade-in">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar tarefa..."
              value={filter.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          {/* Category & Priority filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={filter.categoryId ?? ''}
              onChange={(e) => handleCategory(e.target.value)}
              className="text-xs px-2 py-1 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              aria-label="Filtrar por categoria"
            >
              <option value="">Categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={filter.priority ?? ''}
              onChange={(e) => handlePriority(e.target.value as TaskPriority | '')}
              className="text-xs px-2 py-1 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              aria-label="Filtrar por prioridade"
            >
              <option value="">Prioridade</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
            <select
              value={`${filter.sortBy}-${filter.sortDir}`}
              onChange={(e) => {
                const [sortBy, sortDir] = e.target.value.split('-') as [FilterState['sortBy'], FilterState['sortDir']]
                setFilter((f) => ({ ...f, sortBy, sortDir }))
              }}
              className="text-xs px-2 py-1 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              aria-label="Ordenar por"
            >
              <option value="createdAt-desc">Mais recentes</option>
              <option value="createdAt-asc">Mais antigas</option>
              <option value="priority-desc">Maior prioridade</option>
              <option value="dueDate-asc">Prazo próximo</option>
            </select>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="flex-1 flex flex-col gap-2.5 p-3 overflow-y-auto min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={categories.find((c) => c.id === task.categoryId)}
              onEdit={onEdit}
              onView={onView}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-card">
          <span className="text-xs text-muted-foreground">
            {(pagination.page - 1) * PAGE_SIZE + 1}–{Math.min(pagination.page * PAGE_SIZE, total)} de {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page === 1}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-medium text-foreground px-1">
              {pagination.page} / {totalPages}
            </span>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.min(totalPages, p.page + 1) }))}
              disabled={pagination.page === totalPages}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Próxima página"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
