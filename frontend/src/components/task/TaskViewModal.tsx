import { useTasks } from "@/hooks";
import { useAuth } from "@/hooks/use-auth";
import { formatDateShort } from "@/lib/utils";
import type { Task } from "@/types";
import { Calendar, Clock, FolderOpen, Users, X } from "lucide-react";

interface TaskViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: () => void;
}

export function TaskViewModal({
  isOpen,
  onClose,
  task,
  onEdit,
}: TaskViewModalProps) {
  const { user } = useAuth();
  const { categories } = useTasks();
  const category = task?.categoryId
    ? categories.find((c) => c.id === task.categoryId)
    : undefined;
  const isOwner = task ? String(task.ownerId) === String(user?.id ?? "") : false;
  const canEdit = isOwner || task?.sharePermission === "edit";
  const categoryLabel = category?.name || task?.categoryName || null;
  const categoryColor = category?.color;

  if (!isOpen || !task) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-md shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Detalhes da tarefa
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-xl font-bold text-foreground leading-snug text-balance">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <FolderOpen size={12} />
                    Categoria
                  </span>
                  {categoryLabel ? (
                    <span
                      className={
                        categoryColor
                          ? "inline-flex items-center w-fit text-xs px-2 py-1 rounded font-medium text-white"
                          : "inline-flex items-center w-fit text-xs px-2 py-1 rounded font-medium bg-muted text-muted-foreground"
                      }
                      style={
                        categoryColor
                          ? { backgroundColor: categoryColor }
                          : undefined
                      }
                    >
                      {categoryLabel}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Sem categoria
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar size={12} />
                    Data de entrega
                  </span>
                  <span className="text-sm text-foreground">
                    {task.dueDate ? formatDateShort(task.dueDate) : "Sem data"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Clock size={12} />
                    Criada em
                  </span>
                  <span className="text-sm text-foreground">
                    {formatDateShort(task.createdAt)}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Status
                  </span>
                  <span
                    className={
                      task.isDone
                        ? "text-sm font-medium text-emerald-600 dark:text-emerald-400"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {task.isDone ? "Concluída ✓" : "Em aberto"}
                  </span>
                </div>
              </div>

              {task.isDone && (
                <div className="flex flex-col gap-1 pt-2 border-t border-border">
                  <span className="text-xs font-medium text-muted-foreground">
                    Concluída em
                  </span>
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {formatDateShort(task.updatedAt)}
                  </span>
                </div>
              )}

              {Array.isArray(task.sharedWith) && task.sharedWith.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Users size={12} />
                    Compartilhada com
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {task.sharedWith.map((username) => (
                      <span
                        key={username}
                        className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium"
                      >
                        @{username}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={onEdit}
              disabled={!canEdit}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {canEdit ? "Editar" : "Somente visualizar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
