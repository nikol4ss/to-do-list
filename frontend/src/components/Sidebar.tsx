import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  LogOut,
  Sun,
  Moon,
  CheckSquare,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Perfil', icon: User },
]

interface SidebarProps {
  onClose?: () => void
}

function SidebarContent({ onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="flex flex-col h-full py-5 px-4" aria-label="Navegação principal">
      {/* Logo */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-foreground/20 flex items-center justify-center flex-shrink-0">
            <CheckSquare size={16} className="text-sidebar-foreground" />
          </div>
          <span className="text-sidebar-foreground font-semibold text-base">To-Do List</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground p-1 lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <ul className="flex flex-col gap-1 flex-1" role="list">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-foreground/15 text-sidebar-foreground'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Bottom section */}
      <div className="flex flex-col gap-2 border-t border-sidebar-border pt-4">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground transition-all w-full text-left"
          aria-label={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          {theme === 'light' ? 'Modo escuro' : 'Modo claro'}
        </button>

        {/* User profile quick link */}
        {user && (
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-sidebar-foreground/10 transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-sidebar-foreground/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sidebar-foreground text-xs font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sidebar-foreground text-sm font-medium truncate">{user.name}</p>
              <p className="text-sidebar-foreground/50 text-xs truncate">{user.email}</p>
            </div>
          </NavLink>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/60 hover:bg-red-500/10 hover:text-red-400 transition-all w-full text-left"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-sidebar border-r border-sidebar-border flex-shrink-0 h-svh sticky top-0 animate-slide-in-left">
      <SidebarContent />
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-sidebar text-sidebar-foreground shadow-md"
        aria-label="Abrir menu"
        aria-expanded={open}
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu lateral"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="relative w-64 bg-sidebar h-full shadow-xl animate-slide-in-left z-50">
            <SidebarContent onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
