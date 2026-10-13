import { Spinner } from '../ui/Spinner';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Carregando…', className }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className ?? ''}`} role="status">
      <Spinner />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
