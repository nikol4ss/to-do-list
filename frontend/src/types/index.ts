export type TaskStatus = 'open' | 'completed' | 'shared'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Category {
  id: string
  name: string
  color: string // hex color
  ownerId: string
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  categoryId?: string
  ownerId: string
  sharedWith?: string[] // user ids
  dueDate?: string // ISO date string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface TaskFormData {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  categoryId?: string
  dueDate?: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface SignupData extends AuthCredentials {
  name: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export interface PaginationState {
  page: number
  pageSize: number
}

export interface FilterState {
  search: string
  categoryId?: string
  priority?: TaskPriority
  sortBy: 'createdAt' | 'dueDate' | 'priority'
  sortDir: 'asc' | 'desc'
}
