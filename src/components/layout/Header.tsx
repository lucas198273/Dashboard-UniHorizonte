import { UserMenu } from './UserMenu';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <strong className="text-slate-900">Painel de Gestão</strong>
      <UserMenu />
    </header>
  );
}
