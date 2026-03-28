import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Task } from '../types'
import { useAuth } from '../hooks/useAuth'
import { KanbanColumn } from '../components/KanbanColumn'
import { DashboardOverview } from '../components/DashboardOverview'
import { TaskModal } from '../components/TaskModal'

export default function DashboardPage() {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  function openCreate() {
    setEditTask(null)
    setModalOpen(true)
  }

  function openEdit(task: Task) {
    setEditTask(task)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditTask(null)
  }

  return (
    <div className="flex flex-col gap-6 font-sans animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            Olá, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Aqui está o resumo das suas tarefas de hoje.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm flex-shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nova tarefa</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      {/* Overview stats */}
      <DashboardOverview />

      {/* Kanban board */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Quadro de tarefas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <KanbanColumn
            title="Tarefas abertas"
            status="open"
            accentColor="#3b82f6"
            onEdit={openEdit}
          />
          <KanbanColumn
            title="Concluídas"
            status="completed"
            accentColor="#10b981"
            onEdit={openEdit}
          />
          <KanbanColumn
            title="Compartilhadas"
            status="shared"
            accentColor="#8b5cf6"
            onEdit={openEdit}
          />
        </div>
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={closeModal}
        editTask={editTask}
      />
    </div>
  )
}
