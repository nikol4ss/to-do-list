import type { Category } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await fetch(`${BASE_URL}/categories/`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Erro ao carregar categorias')
    return res.json()
  },

  async create(data: Omit<Category, 'id' | 'ownerId'>): Promise<Category> {
    const res = await fetch(`${BASE_URL}/categories/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Erro ao criar categoria')
    return res.json()
  },

  async update(id: string, data: Partial<Omit<Category, 'id' | 'ownerId'>>): Promise<Category> {
    const res = await fetch(`${BASE_URL}/categories/${id}/`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Erro ao atualizar categoria')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/categories/${id}/`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Erro ao excluir categoria')
  },
}
