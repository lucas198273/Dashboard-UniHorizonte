import { apiRequest } from '../lib/http';
import { buildQuery } from './blog';
import type {
  CategoryStatus,
  PaginatedData,
  Product,
  ProductCategory,
  ProductImage,
  ProductKind,
  ProductLevel,
  ProductModality,
  ProductStatus,
} from '../types';

export interface ListProductsParams {
  page?: number;
  limit?: number;
  /** UUID da categoria */
  category?: string;
  status?: ProductStatus;
  modality?: ProductModality;
  level?: ProductLevel;
}

export interface CreateProductInput {
  nome: string;
  slug?: string;
  sku?: string | null;
  descricao?: string | null;
  preco?: number | null;
  category_id?: string | null;
  images?: ProductImage[];
  status?: ProductStatus;
  display_order?: number;
  featured?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  kind?: ProductKind;
  modality?: ProductModality | null;
  workload_hours?: number | null;
  duration_months?: number | null;
  level?: ProductLevel | null;
  certification?: boolean;
  certification_name?: string | null;
  start_date?: string | null;
  enrollment_deadline?: string | null;
  syllabus?: string | null;
  requirements?: string | null;
  coordinator_name?: string | null;
  coordinator_bio?: string | null;
  coordinator_photo_url?: string | null;
  video_url?: string | null;
  tags?: string[];
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface CreateProductCategoryInput {
  nome: string;
  slug?: string;
  descricao?: string | null;
  parent_id?: string | null;
  display_order?: number;
}

export interface UpdateProductCategoryInput extends Partial<CreateProductCategoryInput> {
  status?: CategoryStatus;
}

export const productsApi = {
  /** Rota dedicada ao painel: retorna todos os status. */
  listProducts: (p: ListProductsParams = {}): Promise<PaginatedData<Product>> =>
    apiRequest<PaginatedData<Product>>(`/api/products/admin/list${buildQuery(p)}`),

  getProduct: (idOrSlug: string): Promise<Product> =>
    apiRequest<Product>(`/api/products/${encodeURIComponent(idOrSlug)}`),

  createProduct: (input: CreateProductInput): Promise<Product> =>
    apiRequest<Product>('/api/products', { method: 'POST', body: input }),

  updateProduct: (id: string, input: UpdateProductInput): Promise<Product> =>
    apiRequest<Product>(`/api/products/${encodeURIComponent(id)}`, { method: 'PUT', body: input }),
  deleteProduct: (id: string, force = false): Promise<{ id: string }> =>
    apiRequest<{ id: string }>(`/api/products/${encodeURIComponent(id)}${force ? '?force=true' : ''}`, {
      method: 'DELETE',
    }),
  listCategories: (): Promise<ProductCategory[]> =>
    apiRequest<ProductCategory[]>('/api/products/categories'),

  getCategory: (slugOrId: string): Promise<ProductCategory> =>
    apiRequest<ProductCategory>(`/api/products/categories/${encodeURIComponent(slugOrId)}`),

  createCategory: (input: CreateProductCategoryInput): Promise<ProductCategory> =>
    apiRequest<ProductCategory>('/api/products/categories', { method: 'POST', body: input }),

  updateCategory: (id: string, input: UpdateProductCategoryInput): Promise<ProductCategory> =>
    apiRequest<ProductCategory>(`/api/products/categories/${encodeURIComponent(id)}`, { method: 'PUT', body: input }),

  deleteCategory: (id: string, force = false): Promise<{ id: string }> =>
    apiRequest<{ id: string }>(`/api/products/categories/${encodeURIComponent(id)}?force=${force}`, {
      method: 'DELETE',
    }),
};

export const listProducts = productsApi.listProducts;
export const listProductCategories = (): Promise<ProductCategory[]> => productsApi.listCategories();
