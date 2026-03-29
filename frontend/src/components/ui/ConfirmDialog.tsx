import { cn } from "@/lib/utils";
import { ConfirmDialogProps } from "@/types/components";

import { useEffect, useState } from "react";

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/50 animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-card border border-border rounded-md shadow-lg max-w-sm w-full relative z-[10000]">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>

          <div className="px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || isLoading}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2",
                variant === "destructive"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-primary hover:bg-primary/90",
              )}
            >
              {(isSubmitting || isLoading) && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
