import { useState } from 'react'
import { CheckCircle2, Circle, Calendar, Flag, MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Task } from '../types'
import { useTasks } from '../hooks/useTasks'
import { cn, formatDateShort, isOverdue, PRIORITY_LABELS, PRIORITY_COLORS } from '../lib/utils'
import { Dropdown, type DropdownItem } from './Dropdown'
import { ConfirmDialog } from './ConfirmDialog'

interface TaskCardProps {
  task: Task
  category?: { name: string; color: string }
  onEdit: (task: Task) => void
  onView: (task: Task) => void
}

export function TaskCard({ task, category, onEdit, onView }: TaskCardProps) {
  const { toggleComplete, deleteTask } = useTasks()
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleToggle() {
    setIsAnimating(true)
    await toggleComplete(task.id)
    setTimeout(() => setIsAnimating(false), 300)
  }

  async function handleDelete() {
    setShowDeleteConfirm(true)
  }

  async function confirmDelete() {
    setIsDeleting(true)
    await deleteTask(task.id)
    setShowDeleteConfirm(false)
  }

  const overdue = isOverdue(task.dueDate) && task.status !== 'completed'

  const dropdownItems: DropdownItem[] = [
    {
      id: 'view',
      label: 'Ver detalhes',
      icon: <Eye size={14} />,
      onClick: () => onView(task),
    },
    {
      id: 'edit',
      label: 'Editar',
      icon: <Pencil size={14} />,
      onClick: () => onEdit(task),
    },
    {
      id: 'delete',
      label: 'Deletar',
      icon: <Trash2 size={14} />,
      variant: 'destructive' as const,
      onClick: handleDelete,
    },
  ]

  return (
    <>
      <div
        className={cn(
          'group bg-card rounded-md border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in',
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
              <CheckCircle2 size={18} />
            ) : (
              <Circle size={18} />
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
              <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm font-medium', PRIORITY_COLORS[task.priority])}>
                <Flag size={10} />
                {PRIORITY_LABELS[task.priority]}
              </span>

              {/* Category */}
              {category && (
                <span
                  className="text-xs px-2 py-0.5 rounded-sm font-medium text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </span>
              )}

              {/* Due date */}
              {task.dueDate && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm font-medium',
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

          {/* Dropdown menu */}
          <div className="flex-shrink-0">
            <Dropdown
              trigger={<MoreVertical size={16} />}
              items={dropdownItems}
              align="right"
            />
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Deletar tarefa"
        description="Esta ação não pode ser desfeita. Tem certeza?"
        confirmLabel="Deletar"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}

