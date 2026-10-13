import { useMutation } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { env } from '../config/env';
import { ApiError } from '../lib/errors';

export interface UploadedImage {
  url: string;
  path: string;
  size: number;
  mimetype: string;
}

export function useUploadImage(kind: 'blog' | 'product') {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadedImage> => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new ApiError('Sessão expirada', 401);

      const formData = new FormData();
      formData.append('file', file);

      const endpoint =
        kind === 'blog' ? '/api/blog/upload' : '/api/products/upload';

      const res = await fetch(`${env.API_URL}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        // do NOT set Content-Type; the browser sets it with the boundary
        body: formData,
      });

      const payload = await res.json();
      if (!payload.success) {
        throw new ApiError(payload.message || 'Erro no upload', res.status);
      }
      return payload.data as UploadedImage;
    },
  });
}
