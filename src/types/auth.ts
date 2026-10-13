export type Role = 'admin' | 'editor' | 'user';

export interface AuthUser {
  id: string;
  tenant_id: string;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
