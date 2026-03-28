import { X, Calendar, Flag, FolderOpen, Clock, User } from 'lucide-react'
import type { Task, Category } from '../types'
import { cn, formatDateShort, PRIORITY_LABELS, PRIORITY_COLORS } from '../lib/utils'

interface TaskViewModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  category?: Category
  onEdit: () => void
}

export function TaskViewModal({ isOpen, onClose, task, category, onEdit }: TaskViewModalProps) {
  if (!isOpen || !task) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-md shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Detalhes da tarefa</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-5">
              {/* Title */}
              <div>
                <h3 className="text-xl font-bold text-foreground leading-snug text-balance">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <div className="flex flex-wrap gap-2">
                <span className={cn(
                  'inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium',
                  task.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  task.status === 'shared' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                )}>
                  {task.status === 'completed' ? 'Concluída' : task.status === 'shared' ? 'Compartilhada' : 'Aberta'}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Flag size={12} />
                    Prioridade
                  </span>
                  <span className={cn('inline-flex items-center w-fit text-xs px-2 py-1 rounded font-medium', PRIORITY_COLORS[task.priority])}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <FolderOpen size={12} />
                    Categoria
                  </span>
                  {category ? (
                    <span
                      className="inline-flex items-center w-fit text-xs px-2 py-1 rounded font-medium text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sem categoria</span>
                  )}
                </div>

                {/* Due date */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar size={12} />
                    Data de entrega
                  </span>
                  <span className="text-sm text-foreground">
                    {task.dueDate ? formatDateShort(task.dueDate) : 'Sem data'}
                  </span>
                </div>

                {/* Created at */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Clock size={12} />
                    Criada em
                  </span>
                  <span className="text-sm text-foreground">
                    {formatDateShort(task.createdAt)}
                  </span>
                </div>
              </div>

              {/* Completed info */}
              {task.completedAt && (
                <div className="flex flex-col gap-1 pt-2 border-t border-border">
                  <span className="text-xs font-medium text-muted-foreground">Concluída em</span>
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {formatDateShort(task.completedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
