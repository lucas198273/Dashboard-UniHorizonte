import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  const safeTotal = Math.max(totalPages, 0);
  const isFirst = page <= 1;
  const isLast = page >= safeTotal || safeTotal === 0;

  return (
    <nav
      aria-label="Paginação"
      className={cn('flex items-center justify-end gap-3 text-sm text-slate-600', className)}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={isFirst}
        aria-label="Página anterior"
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
        Anterior
      </button>

      <span className="text-sm">
        Página <strong className="font-semibold text-slate-900">{page}</strong> de{' '}
        <strong className="font-semibold text-slate-900">{Math.max(safeTotal, 1)}</strong>
      </span>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={isLast}
        aria-label="Próxima página"
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Próxima
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
