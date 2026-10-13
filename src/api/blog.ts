import { apiRequest } from '../lib/http';
import type { BlogCategory, BlogPost, CategoryStatus, PaginatedData, PostStatus, Product } from '../types';

export interface ListPostsParams {
  page?: number;
  limit?: number;
  status?: PostStatus;
  /** UUID da categoria */
  category?: string;
  tag?: string;
  featured?: boolean;
}

export interface CreatePostInput {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string | null;
  category_id?: string | null;
  cover_image_url?: string | null;
  status?: PostStatus;
  featured?: boolean;
  tags?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
}

export type UpdatePostInput = Partial<CreatePostInput>;

export interface CreateCategoryInput {
  nome: string;
  slug?: string;
  descricao?: string | null;
  parent_id?: string | null;
  display_order?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  status?: CategoryStatus;
}

export function buildQuery(params: object): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const blogApi = {
  listPosts: (p: ListPostsParams = {}): Promise<PaginatedData<BlogPost>> =>
    apiRequest<PaginatedData<BlogPost>>(`/api/blog/posts${buildQuery(p)}`),

  getPost: (idOrSlug: string, opts: { includeProducts?: boolean } = {}): Promise<BlogPost> =>
    apiRequest<BlogPost>(
      `/api/blog/posts/${encodeURIComponent(idOrSlug)}${opts.includeProducts ? '?include=products' : ''}`,
    ),

  createPost: (input: CreatePostInput): Promise<BlogPost> =>
    apiRequest<BlogPost>('/api/blog/posts', { method: 'POST', body: input }),

  updatePost: (id: string, input: UpdatePostInput): Promise<BlogPost> =>
    apiRequest<BlogPost>(`/api/blog/posts/${encodeURIComponent(id)}`, { method: 'PUT', body: input }),

  // ---- Associação post ↔ produtos (rotas dedicadas; nunca vai no create/update) ----
  associateProductsToPost: (postId: string, productIds: string[]): Promise<void> =>
    apiRequest<{ post_id: string }>(
      `/api/blog/posts/${encodeURIComponent(postId)}/products`,
      { method: 'POST', body: { product_ids: productIds } },
    ).then(() => undefined),

  dissociateProductFromPost: (postId: string, productId: string): Promise<void> =>
    apiRequest<unknown>(
      `/api/blog/posts/${encodeURIComponent(postId)}/products/${encodeURIComponent(productId)}`,
      { method: 'DELETE' },
    ).then(() => undefined),

  listProductsByPost: (postId: string): Promise<Product[]> =>
    apiRequest<Product[]>(`/api/blog/posts/${encodeURIComponent(postId)}/products`),

  deletePost: (id: string, force = false): Promise<{ id: string }> =>
    apiRequest<{ id: string }>(`/api/blog/posts/${encodeURIComponent(id)}${force ? '?force=true' : ''}`, {
      method: 'DELETE',
    }),
  listCategories: (): Promise<BlogCategory[]> =>
    apiRequest<BlogCategory[]>('/api/blog/categories'),

  getCategory: (slugOrId: string): Promise<BlogCategory> =>
    apiRequest<BlogCategory>(`/api/blog/categories/${encodeURIComponent(slugOrId)}`),

  createCategory: (input: CreateCategoryInput): Promise<BlogCategory> =>
    apiRequest<BlogCategory>('/api/blog/categories', { method: 'POST', body: input }),

  updateCategory: (id: string, input: UpdateCategoryInput): Promise<BlogCategory> =>
    apiRequest<BlogCategory>(`/api/blog/categories/${encodeURIComponent(id)}`, { method: 'PUT', body: input }),

  deleteCategory: (id: string, force = false): Promise<{ id: string }> =>
    apiRequest<{ id: string }>(`/api/blog/categories/${encodeURIComponent(id)}?force=${force}`, {
      method: 'DELETE',
    }),
};

export const listBlogPosts = (p: ListPostsParams = {}) => blogApi.listPosts(p);
export const listBlogCategories = (): Promise<BlogCategory[]> => blogApi.listCategories();
