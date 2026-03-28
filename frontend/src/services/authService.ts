import type { AuthCredentials, AuthResponse, SignupData, User } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

function getToken(): string | null {
  return localStorage.getItem('auth_token')
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.detail ?? 'Credenciais inválidas')
    }
    return res.json()
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.detail ?? 'Erro ao criar conta')
    }
    return res.json()
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${BASE_URL}/users/me/`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Sessão expirada')
    return res.json()
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await fetch(`${BASE_URL}/users/me/`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Erro ao atualizar perfil')
    return res.json()
  },

  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  },
}
