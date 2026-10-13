import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogApi, type CreatePostInput, type ListPostsParams, type UpdatePostInput } from '../api/blog';
import { useAuth } from './useAuth';

const POSTS_KEY = ['blog', 'posts'] as const;

/** Chave de auth para isolar o cache entre sessão autenticada e visitante anônimo. */
export function useAuthScope() {
  const { session } = useAuth();
  return session ? 'auth' : 'anon';
}

export function useBlogPosts(params: ListPostsParams = {}) {
  const authKey = useAuthScope();
  return useQuery({
    queryKey: [...POSTS_KEY, authKey, params],
    queryFn: () => blogApi.listPosts(params),
    staleTime: 60_000,
  });
}

/** Carrega um post direto pela rota de detalhe (auth-aware: com Bearer retorna qualquer status). */
export function usePost(idOrSlug: string | undefined, opts: { includeProducts?: boolean } = {}) {
  const authKey = useAuthScope();
  return useQuery({
    queryKey: ['blog', 'post', idOrSlug, authKey, opts],
    queryFn: () => blogApi.getPost(idOrSlug as string, opts),
    enabled: !!idOrSlug,
    staleTime: 60_000,
  });
}

export interface PostProductCountState {
  count: number;
  isPending: boolean;
  isError: boolean;
}

/**
 * Contagem de produtos associados por post.
 * Uma query por post, mas TODAS em paralelo via useQueries e cacheadas
 * individualmente (o cache é compartilhado entre páginas/filtros).
 * Erro não quebra a listagem: a célula exibe '—'.
 */
export function usePostProductCounts(postIds: string[]) {
  const authKey = useAuthScope();
  const queries = useQueries({
    queries: postIds.map((id) => ({
      queryKey: ['blog', 'post-products', id, authKey] as const,
      queryFn: () => blogApi.listProductsByPost(id),
      enabled: !!id,
      staleTime: 60_000,
      // Erro aqui é cosmético (célula mostra '—'): não adianta insistir.
      retry: false,
    })),
  });

  const states = new Map<string, PostProductCountState>();
  postIds.forEach((id, i) => {
    const q = queries[i];
    states.set(id, {
      count: q.data?.length ?? 0,
      isPending: q.isPending,
      isError: q.isError,
    });
  });

  return (id: string) => states.get(id);
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => blogApi.createPost(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: POSTS_KEY }),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePostInput }) =>
      blogApi.updatePost(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: POSTS_KEY }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) => blogApi.deletePost(id, force),
    onSuccess: () => qc.invalidateQueries({ queryKey: POSTS_KEY }),
  });
}
