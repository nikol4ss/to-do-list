import type { Task, TaskFormData } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const taskService = {
  async getAll(): Promise<Task[]> {
    const res = await fetch(`${BASE_URL}/tasks/`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Erro ao carregar tarefas')
    return res.json()
  },

  async create(data: TaskFormData): Promise<Task> {
    const res = await fetch(`${BASE_URL}/tasks/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Erro ao criar tarefa')
    return res.json()
  },

  async update(id: string, data: Partial<TaskFormData>): Promise<Task> {
    const res = await fetch(`${BASE_URL}/tasks/${id}/`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Erro ao atualizar tarefa')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/tasks/${id}/`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Erro ao excluir tarefa')
  },
}
