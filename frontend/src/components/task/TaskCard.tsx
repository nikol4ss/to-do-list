import { ConfirmDialog, Dropdown } from "@/components/ui";
import { useTasks } from "@/hooks";
import { useAuth } from "@/hooks/use-auth";
import { cn, formatDateShort, getDueDateTone, isOverdue } from "@/lib/utils";
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
  const { user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [shareUsername, setShareUsername] = useState("");
  const [sharePermission, setSharePermission] = useState<"read" | "edit">(
    "edit",
  );
  const [isSharing, setIsSharing] = useState(false);

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
    const username = shareUsername.trim();
    if (!username) return;
    setIsSharing(true);
    try {
      await shareTask(task.id, username, sharePermission);
      setShareUsername("");
      setSharePermission("edit");
      setShowSharePrompt(false);
    } catch {
      return;
    } finally {
      setIsSharing(false);
    }
  }

  const overdue = isOverdue(task.dueDate);
  const dueDateTone = getDueDateTone(task.dueDate);
  const isOwner = String(task.ownerId) === String(user?.id ?? "");
  const canEdit = isOwner || task.sharePermission === "edit";
  const resolvedCategoryName = category?.name || task.categoryName || null;
  const resolvedCategoryColor = category?.color;

  const dropdownItems: DropdownItem[] = [
    {
      id: "view",
      label: "Ver detalhes",
      icon: <Eye size={14} />,
      onClick: () => onView(task),
    },
  ];

  if (canEdit) {
    dropdownItems.push({
      id: "edit",
      label: "Editar",
      icon: <Pencil size={14} />,
      onClick: () => onEdit(task),
    });
  }

  if (isOwner) {
    dropdownItems.push(
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
    );
  }

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
            disabled={!canEdit}
            className={cn(
              "flex-shrink-0 mt-0.5 transition-colors",
              task.isDone
                ? "text-green-600"
                : "text-muted-foreground hover:text-primary",
              !canEdit &&
                "cursor-not-allowed opacity-50 hover:text-muted-foreground",
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

            {!isOwner && task.ownerName && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Compartilhado por{" "}
                <span className="font-medium">@{task.ownerName}</span>
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {resolvedCategoryName && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-sm font-medium",
                    resolvedCategoryColor
                      ? "text-white"
                      : "bg-muted text-muted-foreground",
                  )}
                  style={
                    resolvedCategoryColor
                      ? { backgroundColor: resolvedCategoryColor }
                      : undefined
                  }
                >
                  {resolvedCategoryName}
                </span>
              )}

              {task.dueDate && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm font-medium",
                    overdue || dueDateTone === "red"
                      ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      : dueDateTone === "yellow"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        : dueDateTone === "gray"
                          ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          : "bg-muted text-muted-foreground",
                  )}
                >
                  <Calendar size={10} />
                  {formatDateShort(task.dueDate)}
                </span>
              )}

              {task.shared && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                  <Users size={10} />
                  {isOwner
                    ? "Compartilhada"
                    : task.sharePermission === "edit"
                      ? "Recebida com edição"
                      : "Recebida com visualização"}
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
                    htmlFor="share-username"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Nome de usuário
                  </label>
                  <input
                    id="share-username"
                    type="text"
                    placeholder="nome_do_usuario"
                    value={shareUsername}
                    onChange={(e) => setShareUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleShare()}
                    className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Informe o nome de usuário de quem receberá acesso.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="share-permission"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Permissão
                  </label>
                  <select
                    id="share-permission"
                    value={sharePermission}
                    onChange={(e) =>
                      setSharePermission(e.target.value as "read" | "edit")
                    }
                    className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  >
                    <option value="edit">Editar</option>
                    <option value="read">Visualizar</option>
                  </select>
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
                    disabled={!shareUsername.trim() || isSharing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {isSharing && (
                      <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    )}
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
