import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogApi, type CreateCategoryInput, type UpdateCategoryInput } from '../api/blog';

const CATEGORIES_KEY = ['blog', 'categories'] as const;

export function useBlogCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => blogApi.listCategories(),
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => blogApi.createCategory(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      blogApi.updateCategory(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) => blogApi.deleteCategory(id, force),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
