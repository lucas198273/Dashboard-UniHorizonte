import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium', className)} {...props} />;
}
