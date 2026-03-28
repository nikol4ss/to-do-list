import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Task, Category, TaskFormData, FilterState, PaginationState } from '../types'
import { taskService } from '../services/taskService'
import { categoryService } from '../services/categoryService'
import { useToast } from './useToast'

// --- Mock data for demo (used when no backend is available) ---
const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Trabalho', color: '#0f4c75', ownerId: 'u1' },
  { id: 'cat-2', name: 'Pessoal', color: '#1a8fa0', ownerId: 'u1' },
  { id: 'cat-3', name: 'Saúde', color: '#38a169', ownerId: 'u1' },
  { id: 'cat-4', name: 'Financeiro', color: '#d69e2e', ownerId: 'u1' },
]

const today = new Date().toISOString()
const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Revisar relatório mensal', description: 'Conferir dados do relatório Q2', status: 'open', priority: 'high', categoryId: 'cat-1', ownerId: 'u1', createdAt: today, updatedAt: today, dueDate: new Date(Date.now() + 86400000 * 2).toISOString() },
  { id: 't2', title: 'Reunião com equipe de design', description: 'Apresentar protótipos da nova interface', status: 'open', priority: 'medium', categoryId: 'cat-1', ownerId: 'u1', createdAt: today, updatedAt: today },
  { id: 't3', title: 'Atualizar documentação API', status: 'open', priority: 'low', categoryId: 'cat-1', ownerId: 'u1', createdAt: today, updatedAt: today },
  { id: 't4', title: 'Consulta médica', status: 'completed', priority: 'high', categoryId: 'cat-3', ownerId: 'u1', createdAt: today, updatedAt: today, completedAt: today },
  { id: 't5', title: 'Pagar contas do mês', status: 'completed', priority: 'high', categoryId: 'cat-4', ownerId: 'u1', createdAt: today, updatedAt: today, completedAt: today },
  { id: 't6', title: 'Revisão de código do colega', description: 'PR #142 aguardando review', status: 'shared', priority: 'medium', categoryId: 'cat-1', ownerId: 'u2', sharedWith: ['u1'], createdAt: today, updatedAt: today },
  { id: 't7', title: 'Planejamento sprint Q3', status: 'shared', priority: 'high', categoryId: 'cat-1', ownerId: 'u2', sharedWith: ['u1'], createdAt: today, updatedAt: today },
  { id: 't8', title: 'Treino na academia', status: 'open', priority: 'medium', categoryId: 'cat-3', ownerId: 'u1', createdAt: today, updatedAt: today },
]

interface TaskContextValue {
  tasks: Task[]
  categories: Category[]
  isLoading: boolean
  loadData: () => Promise<void>
  createTask: (data: TaskFormData) => Promise<void>
  updateTask: (id: string, data: Partial<TaskFormData>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleComplete: (id: string) => Promise<void>
  createCategory: (name: string, color: string) => Promise<void>
  updateCategory: (id: string, name: string, color: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

const TaskContext = createContext<TaskContextValue | null>(null)

const USE_MOCK = true // toggle to false when backend is ready

export function TaskProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast()
  const [tasks, setTasks] = useState<Task[]>(USE_MOCK ? MOCK_TASKS : [])
  const [categories, setCategories] = useState<Category[]>(USE_MOCK ? MOCK_CATEGORIES : [])
  const [isLoading, setIsLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (USE_MOCK) return
    setIsLoading(true)
    try {
      const [t, c] = await Promise.all([taskService.getAll(), categoryService.getAll()])
      setTasks(t)
      setCategories(c)
    } catch {
      addToast('Erro ao carregar dados', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  const createTask = useCallback(async (data: TaskFormData) => {
    if (USE_MOCK) {
      const newTask: Task = {
        ...data,
        id: `t${Date.now()}`,
        ownerId: 'u1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setTasks((prev) => [newTask, ...prev])
      addToast('Tarefa criada com sucesso!', 'success')
      return
    }
    try {
      const task = await taskService.create(data)
      setTasks((prev) => [task, ...prev])
      addToast('Tarefa criada com sucesso!', 'success')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao criar tarefa', 'error')
    }
  }, [addToast])

  const updateTask = useCallback(async (id: string, data: Partial<TaskFormData>) => {
    if (USE_MOCK) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t))
      )
      addToast('Tarefa atualizada!', 'success')
      return
    }
    try {
      const updated = await taskService.update(id, data)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      addToast('Tarefa atualizada!', 'success')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao atualizar', 'error')
    }
  }, [addToast])

  const deleteTask = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
      addToast('Tarefa excluída', 'info')
      return
    }
    try {
      await taskService.delete(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
      addToast('Tarefa excluída', 'info')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao excluir', 'error')
    }
  }, [addToast])

  const toggleComplete = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const newStatus = task.status === 'completed' ? 'open' : 'completed'
    const extra = newStatus === 'completed' ? { completedAt: new Date().toISOString() } : { completedAt: undefined }
    await updateTask(id, { status: newStatus, ...extra })
  }, [tasks, updateTask])

  const createCategory = useCallback(async (name: string, color: string) => {
    if (USE_MOCK) {
      const cat: Category = { id: `cat-${Date.now()}`, name, color, ownerId: 'u1' }
      setCategories((prev) => [...prev, cat])
      addToast('Categoria criada!', 'success')
      return
    }
    try {
      const cat = await categoryService.create({ name, color })
      setCategories((prev) => [...prev, cat])
      addToast('Categoria criada!', 'success')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao criar categoria', 'error')
    }
  }, [addToast])

  const updateCategory = useCallback(async (id: string, name: string, color: string) => {
    if (USE_MOCK) {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name, color } : c)))
      addToast('Categoria atualizada!', 'success')
      return
    }
    try {
      const updated = await categoryService.update(id, { name, color })
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      addToast('Categoria atualizada!', 'success')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao atualizar categoria', 'error')
    }
  }, [addToast])

  const deleteCategory = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      addToast('Categoria excluída', 'info')
      return
    }
    try {
      await categoryService.delete(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      addToast('Categoria excluída', 'info')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao excluir categoria', 'error')
    }
  }, [addToast])

  return (
    <TaskContext.Provider
      value={{ tasks, categories, isLoading, loadData, createTask, updateTask, deleteTask, toggleComplete, createCategory, updateCategory, deleteCategory }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used within TaskProvider')
  return ctx
}

// Utility: filter & paginate tasks
export function useFilteredTasks(
  status: Task['status'],
  filter: FilterState,
  pagination: PaginationState
) {
  const { tasks, categories } = useTasks()

  let filtered = tasks.filter((t) => t.status === status)

  if (filter.search) {
    const q = filter.search.toLowerCase()
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
  }
  if (filter.categoryId) {
    filtered = filtered.filter((t) => t.categoryId === filter.categoryId)
  }
  if (filter.priority) {
    filtered = filtered.filter((t) => t.priority === filter.priority)
  }

  filtered = [...filtered].sort((a, b) => {
    const dir = filter.sortDir === 'asc' ? 1 : -1
    if (filter.sortBy === 'priority') {
      const order = { high: 3, medium: 2, low: 1 }
      return (order[a.priority] - order[b.priority]) * dir
    }
    const aVal = filter.sortBy === 'dueDate' ? (a.dueDate ?? '') : a.createdAt
    const bVal = filter.sortBy === 'dueDate' ? (b.dueDate ?? '') : b.createdAt
    return aVal.localeCompare(bVal) * dir
  })

  const total = filtered.length
  const start = (pagination.page - 1) * pagination.pageSize
  const paginated = filtered.slice(start, start + pagination.pageSize)

  return { tasks: paginated, total, categories }
}
