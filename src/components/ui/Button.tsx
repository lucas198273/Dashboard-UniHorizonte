import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function Button({ className, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cn('rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white', className)} {...props} />;
}
