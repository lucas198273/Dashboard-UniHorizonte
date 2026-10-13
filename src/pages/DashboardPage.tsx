import { Link } from 'react-router-dom';
import { FileText, FolderTree, Package, Tags } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMe } from '../hooks/useMe';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { useBlogCategories } from '../hooks/useBlogCategories';
import { useProducts } from '../hooks/useProducts';
import { useProductCategories } from '../hooks/useProductCategories';
import { Card } from '../components/ui/Card';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../lib/errors';
import { LoadingState } from '../components/common/LoadingState';

const shortcuts: { to: string; label: string }[] = [
  { to: '/admin/blog/posts', label: 'Posts do Blog' },
  { to: '/admin/blog/categories', label: 'Categorias do Blog' },
  { to: '/admin/products', label: 'Produtos' },
  { to: '/admin/products/categories', label: 'Categorias de Produtos' },
];

function StatCard({
  label,
  value,
  to,
  icon,
}: {
  label: string;
  value: number | undefined;
  to: string;
  icon: ReactNode;
}) {
  return (
    <Link to={to}>
      <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
        <span className="rounded-lg bg-slate-100 p-3 text-slate-700">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </Card>
    </Link>
  );
}

export function DashboardPage() {
  const { data: me, isLoading: meLoading, error: meError } = useMe();
  const posts = useBlogPosts({ limit: 1 });
  const products = useProducts({ limit: 1 });
  const blogCategories = useBlogCategories();
  const productCategories = useProductCategories();

  const anyLoading =
    meLoading || posts.isLoading || products.isLoading ||
    blogCategories.isLoading || productCategories.isLoading;

  const anyError = meError ?? posts.error ?? products.error ?? blogCategories.error ?? productCategories.error;

  if (anyLoading) return <LoadingState />;
  if (anyError) return <ErrorState message={getErrorMessage(anyError)} onRetry={() => void posts.refetch()} />;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bem-vindo, {me?.nome ?? 'usuário'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Posts"
          value={posts.data?.meta.total}
          to="/admin/blog/posts"
          icon={<FileText className="size-5" />}
        />
        <StatCard
          label="Categorias do blog"
          value={blogCategories.data?.length}
          to="/admin/blog/categories"
          icon={<Tags className="size-5" />}
        />
        <StatCard
          label="Produtos"
          value={products.data?.meta.total}
          to="/admin/products"
          icon={<Package className="size-5" />}
        />
        <StatCard
          label="Categorias de produtos"
          value={productCategories.data?.length}
          to="/admin/products/categories"
          icon={<FolderTree className="size-5" />}
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Atalhos</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {shortcuts.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
