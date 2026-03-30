/// <reference types="vite/client" />
import { ApiError } from "@/lib/http/errors";

export function handleApiError(error: unknown): {
  message: string;
  code?: string;
  validationErrors?: Record<string, string[]>;
  isRetryable: boolean;
  status?: number;
} {
  if (error instanceof ApiError) {
    const data = error.data as Record<string, any>;

    if (data && typeof data === "object" && !Array.isArray(data)) {
      const specificMessage = getValidationErrorMessage(
        data as Record<string, string[]>,
      );
      return {
        message: specificMessage,
        code: error.code,
        validationErrors: data as Record<string, string[]>,
        isRetryable: error.isRetryable,
        status: error.status,
      };
    }

    if (
      error.message &&
      error.message !== "An unexpected error occurred" &&
      !error.message.includes("status code")
    ) {
      return {
        message: error.message,
        code: error.code,
        isRetryable: error.isRetryable,
        status: error.status,
      };
    }

    return {
      message: error.getUserMessage(),
      code: error.code,
      isRetryable: error.isRetryable,
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || "Ocorreu um erro inesperado",
      isRetryable: false,
    };
  }

  return {
    message: "Ocorreu um erro inesperado",
    isRetryable: false,
  };
}

export function getValidationErrorMessage(
  validationErrors: Record<string, string[] | string>,
): string {
  if (!validationErrors || Object.keys(validationErrors).length === 0) {
    return "Erro de validação";
  }

  const priorityFields = [
    "non_field_errors",
    "detail",
    "error",
    "username",
    "email",
    "password",
    "first_name",
    "last_name",
  ];

  for (const field of priorityFields) {
    const errorValue = validationErrors[field];
    if (errorValue) {
      if (Array.isArray(errorValue)) {
        return errorValue[0];
      }

      return String(errorValue);
    }
  }

  const firstKey = Object.keys(validationErrors)[0];
  const firstError = validationErrors[firstKey];

  return Array.isArray(firstError) ? firstError[0] : String(firstError);
}

export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && error.isAuthError();
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.isNetworkError();
}

export function createErrorToast(error: unknown): {
  message: string;
  type: "error" | "warning";
} {
  const handled = handleApiError(error);

  return {
    message: handled.message,
    type: handled.status === 429 ? "warning" : "error",
  };
}

export function logApiError(error: unknown, context?: string): void {
  const isDev = (import.meta.env.DEV as boolean) || false;
  if (!isDev) return;

  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : "[API Error]";

  if (error instanceof ApiError) {
    console.error(`${prefix} ${timestamp}`, {
      message: error.message,
      status: error.status,
      data: error.data,
      isRetryable: error.isRetryable,
    });
  } else {
    console.error(`${prefix} ${timestamp}`, error);
  }
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
        if (onRetry) onRetry(attempt, lastError);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("A operação falhou após várias tentativas");
}
