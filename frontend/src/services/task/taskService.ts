import { apiEndpoints } from "@/lib/api";
import { ApiError, httpClient } from "@/lib/http";
import type { Task, TaskFormData } from "@/types";

interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

type TaskMutationData = Partial<TaskFormData> & {
  isDone?: boolean;
};

function normalizeTask(raw: any): Task {
  return {
    ...raw,
    id: String(raw.id),
    categoryId: raw.categoryId != null ? String(raw.categoryId) : undefined,
    categoryName: raw.categoryName ?? null,
    ownerId: raw.ownerId != null ? String(raw.ownerId) : "",
    ownerName: raw.ownerName ?? "",
    sharedWith: Array.isArray(raw.sharedWith) ? raw.sharedWith : [],
    shared: Boolean(raw.shared),
    sharePermission: raw.sharePermission ?? null,
  };
}

function buildWritePayload(data: TaskMutationData): Record<string, any> {
  const payload: Record<string, any> = {};

  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined)
    payload.description = data.description ?? "";
  if ("categoryId" in data)
    payload.category = data.categoryId ? Number(data.categoryId) : null;
  if ("dueDate" in data) payload.due_date = data.dueDate ?? null;
  if ("isDone" in data && data.isDone !== undefined) {
    payload.is_done = data.isDone;
  }

  return payload;
}

export const taskService = {
  async getAll(
    params?: Record<string, any>,
  ): Promise<Task[] | PaginatedResponse<Task>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `${apiEndpoints.tasks.list}?${queryString}`
      : apiEndpoints.tasks.list;
    const raw = await httpClient.get<any>(url);

    if (Array.isArray(raw)) {
      return raw.map(normalizeTask);
    }

    if (raw && Array.isArray(raw.results)) {
      return {
        results: raw.results.map(normalizeTask),
        count: raw.count ?? 0,
        next: raw.next,
        previous: raw.previous,
      };
    }

    return [];
  },

  async getById(id: string): Promise<Task> {
    if (!id)
      throw new ApiError("ID da tarefa é obrigatório", 400, "INVALID_TASK_ID");
    const raw = await httpClient.get<any>(apiEndpoints.tasks.detail(id));
    return normalizeTask(raw);
  },

  async getSharedWithMe(): Promise<Task[]> {
    const raw = await httpClient.get<any>(apiEndpoints.tasks.sharedWithMe);
    const items = Array.isArray(raw) ? raw : (raw?.results ?? []);
    return items.map(normalizeTask);
  },

  async create(taskData: TaskFormData): Promise<Task> {
    const raw = await httpClient.post<any>(
      apiEndpoints.tasks.create,
      buildWritePayload(taskData),
    );
    return normalizeTask(raw);
  },

  async update(id: string, taskData: TaskMutationData): Promise<Task> {
    const raw = await httpClient.patch<any>(
      apiEndpoints.tasks.update(id),
      buildWritePayload(taskData),
    );
    return normalizeTask(raw);
  },

  async delete(id: string): Promise<void> {
    await httpClient.delete(apiEndpoints.tasks.delete(id));
  },

  async toggleStatus(id: string): Promise<Task> {
    const raw = await httpClient.patch<any>(
      apiEndpoints.tasks.toggleStatus(id),
      {},
    );
    return normalizeTask(raw);
  },

  async share(
    id: string,
    username: string,
    permission: "read" | "edit" = "edit",
  ): Promise<Task> {
    if (!id || id === "undefined") {
      throw new ApiError("ID da tarefa é obrigatório", 400, "INVALID_TASK_ID");
    }

    const raw = await httpClient.post<any>(apiEndpoints.tasks.share(id), {
      shared_with_username: username,
      permission: permission,
    });
    return normalizeTask(raw);
  },

  async unshare(taskId: string, shareId: string): Promise<void> {
    if (!taskId || !shareId) {
      throw new ApiError(
        "IDs de tarefa e compartilhamento são obrigatórios",
        400,
      );
    }
    await httpClient.delete(apiEndpoints.tasks.unshare(taskId, shareId));
  },

  async updateShared(id: string, taskData: TaskMutationData): Promise<Task> {
    const raw = await httpClient.patch<any>(
      apiEndpoints.tasks.sharedEdit(id),
      buildWritePayload(taskData),
    );
    return normalizeTask(raw);
  },
};
