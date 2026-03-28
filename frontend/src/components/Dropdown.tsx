import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../lib/utils'

export interface DropdownItem {
  id: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive'
  onClick: () => void
}

interface DropdownProps {
  items: DropdownItem[]
  trigger: React.ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ items, trigger, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  function handleItemClick(item: DropdownItem) {
    item.onClick()
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Abrir menu"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-1 min-w-[140px] bg-card border border-border rounded-md shadow-lg z-[60] animate-fade-in',
            align === 'left' ? 'left-0' : 'right-0'
          )}
        >
          {items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                'w-full text-left px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                item.variant === 'destructive'
                  ? 'text-destructive hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-foreground hover:bg-muted',
                idx === 0 ? 'rounded-t-md' : '',
                idx === items.length - 1 ? 'rounded-b-md' : ''
              )}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
