import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '../types'
import { authService } from '../services/authService'

// Demo mode: use a mock user so the app works without a real backend
const USE_MOCK_AUTH = true

const MOCK_USER: User = {
  id: 'u1',
  name: 'Demo User',
  email: 'demo@example.com',
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (USE_MOCK_AUTH) {
      const stored = localStorage.getItem('auth_user')
      return stored ? JSON.parse(stored) : MOCK_USER
    }
    const stored = localStorage.getItem('auth_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() =>
    USE_MOCK_AUTH ? 'mock-token' : localStorage.getItem('auth_token')
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!USE_MOCK_AUTH && token && !user) {
      setIsLoading(true)
      authService
        .getMe()
        .then((u) => {
          setUser(u)
          localStorage.setItem('auth_user', JSON.stringify(u))
        })
        .catch(() => {
          setToken(null)
          localStorage.removeItem('auth_token')
        })
        .finally(() => setIsLoading(false))
    }
  }, [token, user])

  const login = useCallback(async (email: string, password: string) => {
    if (USE_MOCK_AUTH) {
      const mockUser: User = { id: 'u1', name: 'Demo User', email }
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      setToken('mock-token')
      setUser(mockUser)
      return
    }
    const res = await authService.login({ email, password })
    localStorage.setItem('auth_token', res.token)
    localStorage.setItem('auth_user', JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    if (USE_MOCK_AUTH) {
      const mockUser: User = { id: 'u1', name, email }
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      setToken('mock-token')
      setUser(mockUser)
      return
    }
    const res = await authService.signup({ name, email, password })
    localStorage.setItem('auth_token', res.token)
    localStorage.setItem('auth_user', JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    if (USE_MOCK_AUTH) {
      localStorage.removeItem('auth_user')
      setToken(null)
      setUser(null)
      return
    }
    authService.logout()
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...data }
      localStorage.setItem('auth_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
