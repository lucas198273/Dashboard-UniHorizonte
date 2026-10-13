import { Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { ErrorPage } from '../pages/ErrorPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { BlogCategoriesPage } from '../pages/blog/BlogCategoriesPage';
import { BlogCategoryFormPage } from '../pages/blog/BlogCategoryFormPage';
import { BlogPostsPage } from '../pages/blog/BlogPostsPage';
import { BlogPostFormPage } from '../pages/blog/BlogPostFormPage';
import { ProductCategoriesPage } from '../pages/products/ProductCategoriesPage';
import { ProductCategoryFormPage } from '../pages/products/ProductCategoryFormPage';
import { ProductsPage } from '../pages/products/ProductsPage';
import { ProductFormPage } from '../pages/products/ProductFormPage';
import { RequireAuth } from './guards';

export const routes = [
  // ---- Público ----
  { path: '/login', element: <LoginPage /> },

  // ---- Raiz redireciona para o dashboard ----
  { path: '/', element: <Navigate to="/admin/dashboard" replace /> },

  // ---- Área autenticada ----
  {
    path: '/admin',
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'blog/posts', element: <BlogPostsPage /> },
          { path: 'blog/posts/new', element: <BlogPostFormPage /> },
          { path: 'blog/posts/:id/edit', element: <BlogPostFormPage /> },
          { path: 'blog/categories', element: <BlogCategoriesPage /> },
          { path: 'blog/categories/new', element: <BlogCategoryFormPage /> },
          { path: 'blog/categories/:id/edit', element: <BlogCategoryFormPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'products/new', element: <ProductFormPage /> },
          { path: 'products/:id/edit', element: <ProductFormPage /> },
          { path: 'products/categories', element: <ProductCategoriesPage /> },
          { path: 'products/categories/new', element: <ProductCategoryFormPage /> },
          { path: 'products/categories/:id/edit', element: <ProductCategoryFormPage /> },
          { path: 'error', element: <ErrorPage /> },
        ],
      },
    ],
  },

  // ---- Fallback ----
  { path: '*', element: <NotFoundPage /> },
];