import { env } from '../config/env';
import { supabase } from '../config/supabase';
import type { ApiResponse } from '../types/api';
import { ApiError } from './errors';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: Method;
  body?: unknown;
  signal?: AbortSignal;
  skipAuth?: boolean;
  /** Flag interna: impede loop infinito de retry em 401. */
  _retry?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, skipAuth, _retry = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Slug do tenant sempre enviado — o backend o ignora quando há Bearer.
    'X-Tenant-Slug': env.DEFAULT_TENANT_SLUG,
  };

  if (!skipAuth) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${env.API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  // 401 na primeira tentativa: renova a sessão e refaz a request UMA vez.
  // IMPORTANTE: nunca chamar signOut aqui — o auto-logout fecha o ciclo
  // 401 -> signOut -> 403 -> sessão limpa -> mais 401.
  if (res.status === 401 && !_retry && !skipAuth) {
    const { data } = await supabase.auth.refreshSession();
    if (data.session) {
      return apiRequest<T>(path, { ...options, _retry: true });
    }
    // Sem refresh possível: apenas lança. Quem chama decide o que fazer.
    throw new ApiError('Sessão expirada. Faça login novamente.', 401);
  }

  let payload: ApiResponse<T>;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError('Resposta inválida do servidor', res.status);
  }

  if (!payload.success) {
    throw new ApiError(payload.message, res.status);
  }

  return payload.data as T;
}
