import { CheckCircle, Circle, Share2, Tag } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'

export function DashboardOverview() {
  const { tasks, categories } = useTasks()

  const openCount = tasks.filter((t) => t.status === 'open').length
  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const sharedCount = tasks.filter((t) => t.status === 'shared').length

  // Category with most tasks
  const categoryCounts: Record<string, number> = {}
  tasks.forEach((t) => {
    if (t.categoryId) {
      categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] ?? 0) + 1
    }
  })
  const topCategoryId = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const topCategory = categories.find((c) => c.id === topCategoryId)

  const stats = [
    {
      label: 'Abertas',
      value: openCount,
      icon: Circle,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Concluídas',
      value: completedCount,
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Compartilhadas',
      value: sharedCount,
      icon: Share2,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
    {
      label: 'Categoria em alta',
      value: topCategory?.name ?? '—',
      icon: Tag,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      colorDot: topCategory?.color,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg, colorDot }) => (
        <div
          key={label}
          className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 shadow-sm animate-fade-in"
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
            <Icon size={18} className={color} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium leading-none mb-1">{label}</p>
            <div className="flex items-center gap-1.5">
              {colorDot && (
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorDot }} />
              )}
              <p className="text-lg font-bold text-foreground leading-none truncate">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
