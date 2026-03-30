import { AxiosError } from "axios";

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly data?: unknown;
  public readonly isRetryable: boolean;
  public readonly timestamp: Date;

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    data?: unknown,
    isRetryable: boolean = false,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
    this.isRetryable = isRetryable;
    this.timestamp = new Date();

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  isNetworkError(): boolean {
    return [0, 408, 429, 500, 502, 503, 504].includes(this.status);
  }

  isAuthError(): boolean {
    return this.status === 401;
  }

  isForbiddenError(): boolean {
    return this.status === 403;
  }

  isNotFoundError(): boolean {
    return this.status === 404;
  }

  isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }

  getUserMessage(): string {
    const isGenericAxiosMessage = this.message?.includes(
      "Request failed with status code",
    );
    const isDefaultMessage = this.message === "An unexpected error occurred";

    if (this.message && !isGenericAxiosMessage && !isDefaultMessage) {
      return this.message;
    }

    const statusMessages: Record<number, string> = {
      400: "Dados inválidos. Por favor, verifique os campos.",
      401: "Credenciais incorretas ou sessão expirada.",
      403: "Você não tem permissão para acessar este recurso.",
      404: "O recurso solicitado não foi encontrado.",
      408: "O servidor demorou muito a responder. Tente novamente.",
      409: "Conflito de dados. O registro já pode existir.",
      422: "Erro de validação. Verifique os dados inseridos.",
      429: "Muitas tentativas. Por favor, aguarde um momento.",
      500: "Erro interno no servidor. Tente novamente mais tarde.",
      502: "Servidor temporariamente indisponível.",
      503: "Serviço em manutenção. Tente novamente mais tarde.",
      504: "O gateway demorou a responder.",
    };

    return (
      statusMessages[this.status] ||
      "Ocorreu um erro inesperado. Tente novamente."
    );
  }

  getValidationErrors(): Record<string, string[]> {
    if (this.status !== 400 && this.status !== 422 && this.status !== 404) {
      return {};
    }

    const errors: Record<string, string[]> = {};
    const data = this.data as any;

    if (!data) return errors;

    if (typeof data === "object") {
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          errors[key] = value.map((v) => String(v));
        } else if (typeof value === "string") {
          errors[key] = [value];
        } else if (typeof value === "object" && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            const fullKey = `${key}.${subKey}`;
            if (Array.isArray(subValue)) {
              errors[fullKey] = subValue.map((v) => String(v));
            } else {
              errors[fullKey] = [String(subValue)];
            }
          });
        }
      });
    }

    return errors;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      isRetryable: this.isRetryable,
      timestamp: this.timestamp,
      data: this.data,
    };
  }
}

export class NetworkError extends ApiError {
  constructor(
    message: string = "Erro de conexão de rede",
    originalError?: Error,
  ) {
    super(message, 0, "NETWORK_ERROR", originalError, true);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string = "Tempo limite atingido", timeoutMs?: number) {
    super(message, 408, "TIMEOUT_ERROR", { timeoutMs }, true);
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class AuthError extends ApiError {
  constructor(message: string = "Falha na autenticação", data?: unknown) {
    super(message, 401, "AUTH_ERROR", data, false);
    this.name = "AuthError";
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = "Erro de validação", data?: unknown) {
    super(message, 422, "VALIDATION_ERROR", data, false);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export function parseAxiosError(error: AxiosError): ApiError {
  const status = error.response?.status || 0;
  const data = error.response?.data;

  let message = "An unexpected error occurred";

  if (data && typeof data === "object") {
    const dataObj = data as any;

    const extractFirstMessage = (value: unknown): string | undefined => {
      if (typeof value === "string" && value.trim()) return value;
      if (Array.isArray(value)) {
        for (const item of value) {
          const extracted = extractFirstMessage(item);
          if (extracted) return extracted;
        }
        return undefined;
      }
      if (value && typeof value === "object") {
        for (const nested of Object.values(value)) {
          const extracted = extractFirstMessage(nested);
          if (extracted) return extracted;
        }
      }
      return undefined;
    };

    message =
      dataObj.detail ||
      dataObj.message ||
      dataObj.error ||
      (Array.isArray(dataObj.non_field_errors)
        ? dataObj.non_field_errors[0]
        : dataObj.non_field_errors) ||
      message;

    if (status === 401 || status === 400 || status === 403 || status === 404) {
      const fieldMessage = extractFirstMessage(dataObj);
      if (fieldMessage) {
        message = fieldMessage;
      }
    }

    if (Array.isArray(message)) {
      message = message.join(", ");
    }
  } else if (
    error.message &&
    error.message !== "Network Error" &&
    !error.message.includes("status code")
  ) {
    message = error.message;
  }

  const isRetryable =
    [408, 429, 500, 502, 503, 504].includes(status) || status === 0;

  if (status === 401) return new AuthError(message, data);
  if (status === 422 || status === 400)
    return new ValidationError(message, data);
  if (status === 0)
    return new NetworkError(
      message === "An unexpected error occurred" ? "Erro de conexão" : message,
    );
  if (status === 408) return new TimeoutError(message);

  return new ApiError(message, status, undefined, data, isRetryable);
}
