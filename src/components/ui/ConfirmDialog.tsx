import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Spinner } from './Spinner';
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onForce?: () => void;
  forceLabel?: string;
  errorMessage?: string | null;
}
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
  onForce,
  forceLabel = 'Forçar exclusão',
  errorMessage,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="rounded-full bg-red-50 p-2 text-red-600">
            <AlertTriangle className="size-5" />
          </span>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
          </div>
        </div>
        {errorMessage && (
          <div className="mb-4 mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        <div className="mt-6 flex items-center justify-end gap-3">
          {onForce && (
            <button
              type="button"
              onClick={onForce}
              disabled={loading}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {forceLabel}
            </button>
          )}
          <Button
            onClick={onCancel}
            disabled={loading}
            className="bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
          >
            {loading && <Spinner />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}