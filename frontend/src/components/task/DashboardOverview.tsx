import { useTasks } from "@/hooks";
import { Share2, Tag } from "lucide-react";

type OverviewCard = {
  label: string;
  value: string;
  helper: string;
  color: string;
  bg: string;
  accent: string;
  icon: typeof Tag;
  insights: string[];
};

export function DashboardOverview() {
  const { tasks, categories } = useTasks();

  const categoryCounts = new Map<string, number>();
  tasks.forEach((task) => {
    if (!task.categoryId) return;
    categoryCounts.set(
      String(task.categoryId),
      (categoryCounts.get(String(task.categoryId)) ?? 0) + 1,
    );
  });

  const sortedCategories = [...categoryCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  );

  const topCategoryEntry = sortedCategories[0];
  const topCategory = categories.find(
    (category) => String(category.id) === topCategoryEntry?.[0],
  );

  const sharedReceived = tasks.filter(
    (task) => task.shared && task.sharePermission !== "owner",
  );
  const sharedByYou = tasks.filter(
    (task) => task.sharePermission === "owner" && (task.sharedWith?.length ?? 0) > 0,
  );
  const sharedReadOnly = sharedReceived.filter(
    (task) => task.sharePermission === "read",
  ).length;
  const sharedEditable = sharedReceived.filter(
    (task) => task.sharePermission === "edit",
  ).length;
  const totalShareLinks = sharedByYou.reduce(
    (total, task) => total + (task.sharedWith?.length ?? 0),
    0,
  );

  const topCategoryInsights =
    sortedCategories.length > 0
      ? sortedCategories.slice(0, 3).map(([categoryId, count]) => {
          const category = categories.find(
            (item) => String(item.id) === String(categoryId),
          );
          return `${category?.name ?? "Sem nome"}: ${count} tarefa(s)`;
        })
      : [
          categories.length > 0
            ? `${categories.length} categoria(s) cadastrada(s), mas sem tarefas vinculadas`
            : "Nenhuma categoria cadastrada ainda",
        ];

  const sharedInsights =
    sharedReceived.length > 0 || sharedByYou.length > 0
      ? [
          `${sharedByYou.length} tarefa(s) sua(s) compartilhada(s)`,
          `${sharedReceived.length} tarefa(s) recebida(s)`,
          `${sharedEditable} com edição, ${sharedReadOnly} só leitura`,
        ]
      : [
          "Nenhum compartilhamento ativo no momento",
          "Compartilhe tarefas para colaborar com outros usuários",
        ];

  const cards: OverviewCard[] = [
    {
      label: "Categorias",
      value: topCategory?.name || "Sem categoria dominante",
      helper: topCategoryEntry
        ? `${topCategoryEntry[1]} tarefa(s) na categoria mais usada`
        : `${categories.length} categoria(s) cadastrada(s)`,
      icon: Tag,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      accent: topCategory?.color || "#2563eb",
      insights: topCategoryInsights,
    },
    {
      label: "Compartilhados",
      value:
        totalShareLinks > 0 || sharedReceived.length > 0
          ? `${totalShareLinks + sharedReceived.length} vínculo(s) ativo(s)`
          : "Nenhum compartilhamento ativo",
      helper: `${sharedReceived.length} recebida(s) e ${sharedByYou.length} enviada(s)`,
      icon: Share2,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      accent: "#7c3aed",
      insights: sharedInsights,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {cards.map(({ label, value, helper, icon: Icon, color, bg, accent, insights }) => (
        <div
          key={label}
          className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${bg}`}
            >
              <Icon size={18} className={color} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-medium leading-none text-muted-foreground">
                {label}
              </p>
              <div className="flex items-center gap-1.5">
                <p className="text-base font-bold leading-tight text-foreground">
                  {value}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
            </div>
          </div>

          <div className="mt-3 h-px w-full rounded-full bg-border" />

          <div className="mt-3 space-y-2">
            {insights.slice(0, 2).map((insight) => (
              <div key={insight} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span
                  className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <span>{insight}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 max-h-0 overflow-hidden border-t border-transparent pt-0 opacity-0 transition-all duration-200 group-hover:max-h-24 group-hover:border-border group-hover:pt-3 group-hover:opacity-100">
            <div className="space-y-2">
              {insights.slice(2).map((insight) => (
                <div key={insight} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span
                    className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
