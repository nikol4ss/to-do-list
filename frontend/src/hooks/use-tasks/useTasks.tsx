import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/apiUtils";
import { categoryService } from "@/services/category";
import { taskService } from "@/services/task";
import type {
  Category,
  FilterState,
  PaginationState,
  Task,
  TaskFormData,
} from "@/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface TasksContextType {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
  createTask: (data: TaskFormData) => Promise<void>;
  updateTask: (id: string, data: Partial<TaskFormData>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  shareTask: (
    id: string,
    username: string,
    permission?: "read" | "edit",
  ) => Promise<void>;
  unshareTask: (id: string, username: string) => Promise<void>;
  createCategory: (
    data: Omit<Category, "id" | "ownerId" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateCategory: (
    id: string,
    data: Partial<Omit<Category, "id" | "ownerId" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | null>(null);

function normalizeCategoryId(cat: Category): Category {
  return { ...cat, id: String(cat.id) };
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [tasksData, categoriesData, sharedData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll(),
        taskService.getSharedWithMe(),
      ]);

      const ownTasks: Task[] = Array.isArray(tasksData)
        ? tasksData
        : "results" in tasksData
          ? (tasksData as { results: Task[] }).results
          : [];

      const taskMap = new Map<string, Task>(ownTasks.map((t) => [t.id, t]));
      sharedData.forEach((t) => {
        if (!taskMap.has(t.id)) {
          taskMap.set(t.id, { ...t, shared: true });
        }
      });

      setTasks(Array.from(taskMap.values()));
      setCategories(categoriesData.map(normalizeCategoryId));
    } catch (error) {
      const { message } = handleApiError(error);
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setTasks([]);
      setCategories([]);
    }
  }, [fetchData, isAuthenticated]);

  const upsertTask = useCallback((updated: Task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => String(t.id) === String(updated.id));
      if (!exists) {
        return [updated, ...prev];
      }
      return prev.map((t) =>
        String(t.id) === String(updated.id) ? updated : t,
      );
    });
  }, []);

  const getTaskById = useCallback(
    (id: string) => tasks.find((task) => String(task.id) === String(id)),
    [tasks],
  );

  const isOwnedTask = useCallback(
    (task?: Task | null) =>
      Boolean(task && user && String(task.ownerId) === String(user.id)),
    [user],
  );

  const createTask = useCallback(
    async (data: TaskFormData) => {
      try {
        const newTask = await taskService.create(data);
        upsertTask(newTask);
        await fetchData();
        addToast("Tarefa criada!", "success");
      } catch (error) {
        const { message } = handleApiError(error);
        addToast(message, "error");
        throw error;
      }
    },
    [addToast, fetchData, upsertTask],
  );

  const updateTask = useCallback(
    async (id: string, data: Partial<TaskFormData>) => {
      try {
        const currentTask = getTaskById(id);
        const updated = isOwnedTask(currentTask)
          ? await taskService.update(id, data)
          : await taskService.updateShared(id, data);
        upsertTask(updated);
        await fetchData();
        addToast("Tarefa atualizada!", "success");
      } catch (error) {
        const { message } = handleApiError(error);
        addToast(message, "error");
        throw error;
      }
    },
    [addToast, fetchData, getTaskById, isOwnedTask, upsertTask],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      try {
        const currentTask = getTaskById(id);
        if (!isOwnedTask(currentTask)) {
          throw new Error(
            "Somente o proprietário pode excluir uma tarefa compartilhada.",
          );
        }

        await taskService.delete(id);
        setTasks((prev) => prev.filter((t) => String(t.id) !== String(id)));
        await fetchData();
        addToast("Tarefa deletada!", "success");
      } catch (error) {
        const { message } = handleApiError(error);
        addToast(message, "error");
        throw error;
      }
    },
    [addToast, fetchData, getTaskById, isOwnedTask],
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      try {
        const currentTask = getTaskById(id);
        const updated = isOwnedTask(currentTask)
          ? await taskService.toggleStatus(id)
          : await taskService.updateShared(id, {
              isDone: !(currentTask?.isDone ?? false),
            });
        upsertTask(updated);
        await fetchData();
        const msg = updated.isDone ? "Tarefa concluída!" : "Tarefa reaberta!";
        addToast(msg, "success");
      } catch (error) {
        const { message } = handleApiError(error);
        addToast(message, "error");
        throw error;
      }
    },
    [addToast, fetchData, getTaskById, isOwnedTask, upsertTask],
  );

  const shareTask = useCallback(
    async (
      id: string,
      username: string,
      permission: "read" | "edit" = "edit",
    ) => {
      try {
        const currentTask = getTaskById(id);
        if (!isOwnedTask(currentTask)) {
          throw new Error(
            "Somente o proprietário pode compartilhar esta tarefa.",
          );
        }

        const updated = await taskService.share(id, username, permission);
        upsertTask(updated);
        await fetchData();
        addToast("Tarefa compartilhada!", "success");
      } catch (error) {
        const { message } = handleApiError(error);
        addToast(message, "error");
        throw error;
      }
    },
    [addToast, fetchData, getTaskById, isOwnedTask, upsertTask],
  );

  const unshareTask = useCallback(
    async (id: string, shareId: string) => {
      try {
        const currentTask = getTaskById(id);
        if (!isOwnedTask(currentTask)) {
          throw new Error(
            "Somente o proprietário pode remover compartilhamentos desta tarefa.",
          );
        }

        await taskService.unshare(id, shareId);
        await fetchData();
        addToast("Compartilhamento removido!", "success");
      } catch (error) {
        const { message } = handleApiError(error);
        addToast(message, "error");
        throw error;
      }
    },
    [addToast, fetchData, getTaskById, isOwnedTask],
  );

  const createCategory = useCallback(
    async (
      data: Omit<Category, "id" | "ownerId" | "createdAt" | "updatedAt">,
    ) => {
      try {
        const newCat = await categoryService.create(data);
        setCategories((prev) => [...prev, normalizeCategoryId(newCat)]);
        addToast("Categoria criada!", "success");
      } catch (error) {
        const { message } = handleApiError(error);
        addToast(message, "error");
        throw error;
      }
    },
    [addToast],
  );

  const updateCategory = useCallback(
    async (
      id: string,
      data: Partial<
        Omit<Category, "id" | "ownerId" | "createdAt" | "updatedAt">
      >,
    ) => {
      try {
        const updated = await categoryService.update(id, data);
        setCategories((prev) =>
          prev.map((c) =>
            String(c.id) === String(id) ? normalizeCategoryId(updated) : c,
          ),
        );
        addToast("Categoria atualizada!", "success");
      } catch (error) {
        const { message } = handleApiError(error);
        addToast(message, "error");
        throw error;
      }
    },
    [addToast],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        await categoryService.delete(id);
        setCategories((prev) =>
          prev.filter((c) => String(c.id) !== String(id)),
        );
        addToast("Categoria deletada!", "success");
      } catch (error) {
        const { message } = handleApiError(error);
        addToast(message, "error");
        throw error;
      }
    },
    [addToast],
  );

  const value: TasksContextType = {
    tasks,
    categories,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    shareTask,
    unshareTask,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchData,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks(): TasksContextType {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks deve ser usado dentro de TasksProvider");
  }
  return context;
}

export function useFilteredTasks(
  status: "open" | "done" | "shared",
  filter: FilterState,
  pagination: PaginationState,
): { tasks: Task[]; total: number; categories: Category[] } {
  const { tasks, categories } = useTasks();
  const { user } = useAuth();

  return useMemo(() => {
    const search = String(filter.search ?? "").toLowerCase();

    const filtered = tasks.filter((task) => {
      const isOwner = String(task.ownerId) === String(user?.id ?? "");
      const isSharedTask = !isOwner && task.shared === true;

      if (status === "open") {
        if (!isOwner || task.isDone) return false;
      }

      if (status === "shared") {
        if (!isSharedTask || task.isDone) return false;
      }

      if (status === "done") {
        if (!task.isDone) return false;
      }

      if (search) {
        const title = String(task.title ?? "").toLowerCase();
        const desc = String(task.description ?? "").toLowerCase();
        if (!title.includes(search) && !desc.includes(search)) return false;
      }

      if (
        filter.categoryId &&
        String(task.categoryId) !== String(filter.categoryId)
      ) {
        return false;
      }

      return true;
    });

    const dir = filter.sortDir === "asc" ? 1 : -1;

    const sorted = [...filtered].sort((a, b) => {
      const aVal = String(a[filter.sortBy as keyof Task] ?? "");
      const bVal = String(b[filter.sortBy as keyof Task] ?? "");
      if (aVal < bVal) return -dir;
      if (aVal > bVal) return dir;
      return 0;
    });

    const start = (pagination.page - 1) * pagination.pageSize;
    const paged = sorted.slice(start, start + pagination.pageSize);

    return { tasks: paged, total: filtered.length, categories };
  }, [
    tasks,
    categories,
    user,
    status,
    filter.search,
    filter.categoryId,
    filter.sortBy,
    filter.sortDir,
    pagination.page,
    pagination.pageSize,
  ]);
}
