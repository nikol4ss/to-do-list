import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTaskDate(value?: string): Date | null {
  if (!value) return null;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const date = parseTaskDate(iso);
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(iso?: string): string {
  if (!iso) return "";
  const date = parseTaskDate(iso);
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function isOverdue(dueDate?: string): boolean {
  const date = parseTaskDate(dueDate);
  if (!date) return false;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < now;
}

export function getDueDateTone(
  dueDate?: string,
): "red" | "yellow" | "gray" | "default" {
  const date = parseTaskDate(dueDate);
  if (!date) return "default";

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 3) return "red";
  if (diffDays > 30) return "gray";
  if (diffDays <= 30) return "yellow";
  return "default";
}

export function toTaskDueDateValue(date?: string): string | undefined {
  if (!date) return undefined;
  const parsed = parseTaskDate(date);
  if (!parsed) return undefined;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromTaskDueDateValue(date?: string): string | undefined {
  if (!date) return undefined;
  return `${date}T12:00:00`;
}
