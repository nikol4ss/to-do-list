import { apiEndpoints } from "@/lib/api";
import { ApiError, httpClient } from "@/lib/http";
import type { Category } from "@/types";

interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const response = await httpClient.get<
        Category[] | PaginatedResponse<Category>
      >(apiEndpoints.categories.list);

      return Array.isArray(response) ? response : response.results;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new ApiError(
          `Failed to fetch categories: ${error.message}`,
          error.status,
          "FETCH_CATEGORIES_ERROR",
        );
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Category> {
    try {
      if (!id) {
        throw new ApiError(
          "Category ID is required",
          400,
          "INVALID_CATEGORY_ID",
        );
      }

      return await httpClient.get<Category>(apiEndpoints.categories.detail(id));
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.isNotFoundError()) {
          throw new ApiError(`Category not found`, 404, "CATEGORY_NOT_FOUND");
        }
        throw new ApiError(
          `Failed to fetch category: ${error.message}`,
          error.status,
          "FETCH_CATEGORY_ERROR",
        );
      }
      throw error;
    }
  },

  async create(
    data: Omit<Category, "id" | "ownerId" | "createdAt" | "updatedAt">,
  ): Promise<Category> {
    try {
      if (!data.name) {
        throw new ApiError(
          "Category name is required",
          400,
          "INVALID_CATEGORY_DATA",
        );
      }

      return await httpClient.post<Category>(
        apiEndpoints.categories.create,
        data,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw new ApiError(
          `Failed to create category: ${error.message}`,
          error.status,
          "CREATE_CATEGORY_ERROR",
          error.data,
        );
      }
      throw error;
    }
  },

  async update(
    id: string,
    data: Partial<Omit<Category, "id" | "ownerId" | "createdAt" | "updatedAt">>,
  ): Promise<Category> {
    try {
      if (!id) {
        throw new ApiError(
          "Category ID is required",
          400,
          "INVALID_CATEGORY_ID",
        );
      }

      return await httpClient.patch<Category>(
        apiEndpoints.categories.update(id),
        data,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.isNotFoundError()) {
          throw new ApiError(`Category not found`, 404, "CATEGORY_NOT_FOUND");
        }
        throw new ApiError(
          `Failed to update category: ${error.message}`,
          error.status,
          "UPDATE_CATEGORY_ERROR",
          error.data,
        );
      }
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new ApiError(
          "Category ID is required",
          400,
          "INVALID_CATEGORY_ID",
        );
      }

      await httpClient.delete(apiEndpoints.categories.delete(id));
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.isNotFoundError()) {
          throw new ApiError(`Category not found`, 404, "CATEGORY_NOT_FOUND");
        }
        throw new ApiError(
          `Failed to delete category: ${error.message}`,
          error.status,
          "DELETE_CATEGORY_ERROR",
        );
      }
      throw error;
    }
  },
};
