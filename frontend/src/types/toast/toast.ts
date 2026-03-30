export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}
