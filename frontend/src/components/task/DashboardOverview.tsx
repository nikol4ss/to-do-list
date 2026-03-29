import { useTasks } from "@/hooks";
import { Share2, Tag } from "lucide-react";

export function DashboardOverview() {
  const { tasks, categories } = useTasks();

  const categoryCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.categoryId) {
      categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] ?? 0) + 1;
    }
  });

  const topCategoryId = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  const topCategory = categories.find((c) => c.id === topCategoryId);

  const stats = [
    {
      label: "Top Categoria",
      value: topCategory?.name || "Sem top categoria",
      icon: Tag,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Tarefas Conectadas",
      value: "Nenhuma tarefa compartilhada",
      icon: Share2,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 shadow-sm animate-fade-in"
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}
          >
            <Icon size={18} className={color} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium leading-none mb-1">
              {label}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-base font-bold text-foreground leading-tight">
                {value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
