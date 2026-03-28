import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className={cn(
        'p-2 rounded-md bg-card border border-border text-foreground hover:bg-muted transition-colors',
        className
      )}
      aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
