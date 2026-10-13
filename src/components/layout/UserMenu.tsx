import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMe } from '../../hooks/useMe';
import { useAuth } from '../../hooks/useAuth';

export function UserMenu() {
  const { data: me } = useMe();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  async function handleSignOut() {
    setLeaving(true);
    try {
      await signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium text-slate-900">{me?.nome ?? 'Carregando…'}</p>
        <p className="text-xs text-slate-500">{me?.email ?? ''}</p>
      </div>
      <button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={leaving}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
      >
        <LogOut className="size-4" />
        Sair
      </button>
    </div>
  );
}
