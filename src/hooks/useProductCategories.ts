import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  productsApi,
  type CreateProductCategoryInput,
  type UpdateProductCategoryInput,
} from '../api/products';
import { ApiError } from '../lib/errors';

const CATEGORIES_KEY = ['products', 'categories'] as const;

/** Não retenta em 401: o token já foi renovado por http.ts, repetir só multiplica requests. */
const retryGuard = (failureCount: number, error: unknown): boolean => {
  if (error instanceof ApiError && error.status === 401) return false;
  return failureCount < 2;
};

export function useProductCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => productsApi.listCategories(),
    staleTime: 60_000,
    retry: retryGuard,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductCategoryInput) => productsApi.createCategory(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductCategoryInput }) =>
      productsApi.updateCategory(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) => productsApi.deleteCategory(id, force),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
