import { ConfirmDialog, Dropdown } from "@/components/ui";
import { useTasks } from "@/hooks";
import { cn, formatDateShort, isOverdue } from "@/lib/utils";
import type { Category, DropdownItem, Task } from "@/types";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

interface TaskCardProps {
  task: Task;
  category?: Category;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
}

export function TaskCard({ task, category, onEdit, onView }: TaskCardProps) {
  const { toggleComplete, deleteTask, shareTask } = useTasks();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [shareEmail, setShareEmail] = useState("");

  async function handleToggle() {
    setIsAnimating(true);
    await toggleComplete(task.id);
    setTimeout(() => setIsAnimating(false), 300);
  }

  async function confirmDelete() {
    setIsDeleting(true);
    await deleteTask(task.id);
    setShowDeleteConfirm(false);
  }

  async function handleShare() {
    if (!shareEmail.trim()) return;
    try {
      await shareTask(task.id, shareEmail.trim());
      setShareEmail("");
      setShowSharePrompt(false);
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  }

  const overdue = isOverdue(task.dueDate);

  const dropdownItems: DropdownItem[] = [
    {
      id: "view",
      label: "Ver detalhes",
      icon: <Eye size={14} />,
      onClick: () => onView(task),
    },
    {
      id: "edit",
      label: "Editar",
      icon: <Pencil size={14} />,
      onClick: () => onEdit(task),
    },
    {
      id: "share",
      label: "Compartilhar",
      icon: <Users size={14} />,
      onClick: () => setShowSharePrompt(true),
    },
    {
      id: "delete",
      label: "Deletar",
      icon: <Trash2 size={14} />,
      variant: "destructive" as const,
      onClick: () => setShowDeleteConfirm(true),
    },
  ];

  return (
    <>
      <div
        className={cn(
          "group bg-card rounded-md border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in",
          isDeleting && "opacity-0 scale-95 pointer-events-none",
        )}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggle}
            className={cn(
              "flex-shrink-0 mt-0.5 transition-colors",
              task.isDone
                ? "text-green-600"
                : "text-muted-foreground hover:text-primary",
              isAnimating && "animate-check-pop",
            )}
            aria-label="Alternar tarefa"
          >
            {task.isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          </button>

          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-medium text-card-foreground leading-relaxed text-balance",
                task.isDone && "line-through text-muted-foreground",
              )}
            >
              {task.title}
            </p>

            {task.description && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {category && (
                <span
                  className="text-xs px-2 py-0.5 rounded-sm font-medium text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </span>
              )}

              {task.dueDate && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm font-medium",
                    overdue
                      ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Calendar size={10} />
                  {formatDateShort(task.dueDate)}
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0">
            <Dropdown
              trigger={<MoreVertical size={16} />}
              items={dropdownItems}
              align="right"
            />
          </div>
        </div>
      </div>

      {/* Share dialog — usa design system em vez de estilos crus */}
      {showSharePrompt && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={() => setShowSharePrompt(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">
                  Compartilhar tarefa
                </h3>
                <button
                  onClick={() => setShowSharePrompt(false)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-5 py-4 flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="share-email"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    E-mail do usuário
                  </label>
                  <input
                    id="share-email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleShare()}
                    className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSharePrompt(false)}
                    className="flex-1 py-2.5 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={!shareEmail.trim()}
                    className="flex-1 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    Compartilhar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
  );
}
