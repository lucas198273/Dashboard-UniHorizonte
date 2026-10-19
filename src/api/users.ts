import { apiRequest } from '../lib/http';
import type { AuthUser } from '../types/auth';

export const usersApi = {
  me: (): Promise<AuthUser> => apiRequest<AuthUser>('/api/users/me'),
};


export const getMe = usersApi.me;
