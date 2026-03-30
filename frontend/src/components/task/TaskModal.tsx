import { useTasks } from "@/hooks";
import { useAuth } from "@/hooks/use-auth";
import { cn, fromTaskDueDateValue, toTaskDueDateValue } from "@/lib/utils";
import type { Task, TaskFormData } from "@/types";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

const defaultForm: TaskFormData = {
  title: "",
  description: "",
  categoryId: "",
  dueDate: "",
};

export function TaskModal({ isOpen, onClose, editTask }: TaskModalProps) {
  const { createTask, updateTask, categories } = useTasks();
  const { user } = useAuth();
  const [form, setForm] = useState<TaskFormData>(defaultForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof TaskFormData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const isOwner = editTask
    ? String(editTask.ownerId) === String(user?.id ?? "")
    : true;
  const sharedCategoryLabel = editTask?.categoryName ?? "Sem categoria";

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title,
        description: editTask.description ?? "",
        categoryId: editTask.categoryId ?? "",
        dueDate: toTaskDueDateValue(editTask.dueDate) ?? "",
      });
    } else {
      setForm({ ...defaultForm });
    }
    setErrors({});
  }, [editTask, isOpen]);

  function validate() {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Título obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    const payload: TaskFormData = {
      ...form,
      categoryId: form.categoryId || undefined,
      dueDate: fromTaskDueDateValue(form.dueDate),
    };

    try {
      if (editTask?.id) {
        await updateTask(editTask.id, payload);
      } else {
        await createTask(payload);
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-xl animate-fade-in overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2
            id="modal-title"
            className="text-base font-semibold text-foreground"
          >
            {editTask ? "Editar tarefa" : "Nova tarefa"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="px-6 py-5 flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Título <span className="text-destructive">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Ex: Revisar relatório mensal"
              className={cn(
                "w-full px-3 py-2.5 rounded-md border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
                errors.title ? "border-destructive" : "border-border",
              )}
              autoFocus
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-desc"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Descrição
            </label>
            <textarea
              id="task-desc"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Detalhes sobre a tarefa..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="task-category"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Categoria
              </label>
              {editTask && !isOwner ? (
                <div className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-muted text-muted-foreground">
                  {sharedCategoryLabel}
                </div>
              ) : (
                <select
                  id="task-category"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categoryId: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label
                htmlFor="task-due"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Prazo
              </label>
              <input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {editTask ? "Salvar" : "Criar tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
