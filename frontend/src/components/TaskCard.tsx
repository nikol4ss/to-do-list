import { useState } from 'react'
import { CheckCircle2, Circle, Pencil, Trash2, Calendar, Flag } from 'lucide-react'
import type { Task } from '../types'
import { useTasks } from '../hooks/useTasks'
import { cn, formatDateShort, isOverdue, PRIORITY_LABELS, PRIORITY_COLORS } from '../lib/utils'

interface TaskCardProps {
  task: Task
  category?: { name: string; color: string }
  onEdit: (task: Task) => void
}

export function TaskCard({ task, category, onEdit }: TaskCardProps) {
  const { toggleComplete, deleteTask } = useTasks()
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleToggle() {
    setIsAnimating(true)
    await toggleComplete(task.id)
    setTimeout(() => setIsAnimating(false), 300)
  }

  async function handleDelete() {
    setIsDeleting(true)
    await deleteTask(task.id)
  }

  const overdue = isOverdue(task.dueDate) && task.status !== 'completed'

  return (
    <div
      className={cn(
        'group bg-card rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in',
        task.status === 'completed' && 'opacity-70',
        isDeleting && 'opacity-0 scale-95 pointer-events-none'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={cn(
            'flex-shrink-0 mt-0.5 text-muted-foreground hover:text-primary transition-colors',
            isAnimating && 'animate-check-pop',
            task.status === 'completed' && 'text-emerald-500 hover:text-emerald-600'
          )}
          aria-label={task.status === 'completed' ? 'Marcar como aberta' : 'Marcar como concluída'}
        >
          {task.status === 'completed' ? (
            <CheckCircle2 size={20} />
          ) : (
            <Circle size={20} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium text-card-foreground leading-relaxed text-balance',
              task.status === 'completed' && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Priority */}
            <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', PRIORITY_COLORS[task.priority])}>
              <Flag size={10} />
              {PRIORITY_LABELS[task.priority]}
            </span>

            {/* Category */}
            {category && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
            )}

            {/* Due date */}
            {task.dueDate && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                  overdue
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Calendar size={10} />
                {formatDateShort(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
            aria-label="Editar tarefa"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Excluir tarefa"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
