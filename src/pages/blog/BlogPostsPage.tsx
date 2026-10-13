import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, Package, Pencil, Trash2 } from 'lucide-react';
import { useBlogPosts, useDeletePost, usePostProductCounts } from '../../hooks/useBlogPosts';
import { useBlogCategories } from '../../hooks/useBlogCategories';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { getErrorMessage } from '../../lib/errors';
import { formatDate } from '../../lib/format';
import type { BlogPost } from '../../types';

const statusColors: Record<BlogPost['status'], string> = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-amber-100 text-amber-700',
};

export function BlogPostsPage() {
  const [page, setPage] = useState(1);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<BlogPost | null>(null);

  const { data, isPending, error, refetch } = useBlogPosts({ page, limit: 20 });
  const { data: categories } = useBlogCategories();
  const deletePost = useDeletePost();
  const handleDelete = (id: string, force = false) => {
    deletePost.mutate(
      { id, force },
      {
        onSuccess: () => {
          setToDelete(null);
          setDeleteError(null);
        },
        onError: (err) => {
          setDeleteError(getErrorMessage(err));
        },
      },
    );
  };

  const items = data?.items ?? [];
  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.nome]));
  const getProductCount = usePostProductCounts(items.map((p) => p.id));

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Posts do Blog</h1>
        <Link
          to="/admin/blog/posts/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Novo post
        </Link>
      </header>

      {isPending && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={() => void refetch()} />}

      {!isPending && !error && items.length === 0 && (
        <EmptyState
          title="Nenhum post publicado"
          description="Os posts criados no painel aparecerão aqui."
        />
      )}

      {!isPending && !error && items.length > 0 && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Título</TableHeaderCell>
                <TableHeaderCell>Slug</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Categoria</TableHeaderCell>
                <TableHeaderCell>Produtos</TableHeaderCell>
                <TableHeaderCell>Criado em</TableHeaderCell>
                <TableHeaderCell className="text-right">Ações</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((post, index) => (
                <TableRow key={post.id} striped={index % 2 === 1}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-400">
                          <ImageIcon className="size-4" />
                        </div>
                      )}
                      <span className="font-medium text-slate-900">
                        {post.title}
                        {post.featured && <Badge className="ml-2 bg-blue-100 text-blue-700">Destaque</Badge>}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{post.slug}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[post.status]}>{post.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {post.category_id ? (categoryName.get(post.category_id) ?? '—') : '—'}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const state = getProductCount(post.id);
                      if (!state || state.isPending) {
                        return <span className="inline-block h-5 w-10 animate-pulse rounded bg-slate-200" />;
                      }
                      if (state.isError) return <span className="text-slate-400">—</span>;
                      return state.count > 0 ? (
                        <Badge className="inline-flex items-center gap-1 bg-blue-100 text-blue-700">
                          <Package className="size-3" />
                          {state.count}
                        </Badge>
                      ) : (
                        <Badge className="inline-flex items-center gap-1 bg-slate-100 text-slate-400">
                          <Package className="size-3" />
                          0
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>{formatDate(post.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <Link
                        to={`/admin/blog/posts/${post.id}/edit`}
                        aria-label={`Editar ${post.title}`}
                        className="inline-flex rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToDelete(post)}
                        aria-label={`Excluir ${post.title}`}
                        className="inline-flex rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination page={page} totalPages={data?.meta.totalPages ?? 0} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir post"
        message={`Tem certeza que deseja excluir "${toDelete?.title ?? ''}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deletePost.isPending}
        errorMessage={deleteError}
        onCancel={() => {
          setToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={() => {
          if (!toDelete) return;
          handleDelete(toDelete.id, false);
        }}
        onForce={() => {
          if (!toDelete) return;
          handleDelete(toDelete.id, true);
        }}
      />
    </section>
  );
}
