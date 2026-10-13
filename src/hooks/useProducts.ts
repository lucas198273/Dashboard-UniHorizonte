import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi, type CreateProductInput, type ListProductsParams, type UpdateProductInput } from '../api/products';
import { ApiError } from '../lib/errors';
import { useAuth } from './useAuth';

const PRODUCTS_KEY = ['products'] as const;

/** Não retenta em 401: o token já foi renovado por http.ts, repetir só multiplica requests. */
const retryGuard = (failureCount: number, error: unknown): boolean => {
  if (error instanceof ApiError && error.status === 401) return false;
  return failureCount < 2;
};

export function useAuthScope() {
  const { session } = useAuth();
  return session ? 'auth' : 'anon';
}

export function useProducts(params: ListProductsParams = {}) {
  const authKey = useAuthScope();
  return useQuery({
    queryKey: [...PRODUCTS_KEY, authKey, params],
    queryFn: () => productsApi.listProducts(params),
    staleTime: 60_000,
    retry: retryGuard,
  });
}

/** Carrega um produto direto pela rota de detalhe (auth-aware: com Bearer retorna qualquer status). */
export function useProduct(idOrSlug: string | undefined) {
  const authKey = useAuthScope();
  return useQuery({
    queryKey: ['products', 'product', idOrSlug, authKey],
    queryFn: () => productsApi.getProduct(idOrSlug as string),
    enabled: !!idOrSlug,
    staleTime: 60_000,
    retry: retryGuard,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.createProduct(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      productsApi.updateProduct(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) => productsApi.deleteProduct(id, force),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}
