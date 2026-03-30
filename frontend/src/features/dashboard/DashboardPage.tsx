import { useTasks } from "@/hooks";
import { useAuth } from "@/hooks/use-auth";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { DashboardOverview, KanbanColumn, TaskModal } from "@/components/task";
import { TaskViewModal } from "@/components/task/TaskViewModal";
import type { Task } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks } = useTasks();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTaskId, setViewTaskId] = useState<string | null>(null);

  const editTask = useMemo(
    () => tasks.find((task) => String(task.id) === String(editTaskId)) ?? null,
    [editTaskId, tasks],
  );

  const viewTask = useMemo(
    () => tasks.find((task) => String(task.id) === String(viewTaskId)) ?? null,
    [tasks, viewTaskId],
  );

  function openCreate() {
    setEditTaskId(null);
    setEditModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditTaskId(task.id);
    setEditModalOpen(true);
  }

  function openView(task: Task) {
    setViewTaskId(task.id);
    setViewModalOpen(true);
  }

  function closeEditModal() {
    setEditModalOpen(false);
    setEditTaskId(null);
  }

  function closeViewModal() {
    setViewModalOpen(false);
    setViewTaskId(null);
  }

  function openEditFromView() {
    const task = viewTask;
    closeViewModal();
    if (task) openEdit(task);
  }

  const displayName = user?.first_name || user?.username || "usuário";

  return (
    <div className="flex flex-col gap-6 font-sans animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            Olá, {displayName}!
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Aqui está o resumo das suas tarefas de hoje.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm flex-shrink-0"
        >
          <Plus size={17} />
          <span className="hidden sm:inline">Nova tarefa</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      <DashboardOverview />

      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Quadro de tarefas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <KanbanColumn
            title="Tarefas abertas"
            type="open"
            accentColor="#3b82f6"
            onEdit={openEdit}
            onView={openView}
          />
          <KanbanColumn
            title="Compartilhadas"
            type="shared"
            accentColor="#8b5cf6"
            onEdit={openEdit}
            onView={openView}
          />
          <KanbanColumn
            title="Concluídas"
            type="done"
            accentColor="#10b981"
            onEdit={openEdit}
            onView={openView}
          />
        </div>
      </div>

      <TaskModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        editTask={editTask}
      />

      <TaskViewModal
        isOpen={viewModalOpen}
        onClose={closeViewModal}
        task={viewTask}
        onEdit={openEditFromView}
      />
    </div>
  );
}
