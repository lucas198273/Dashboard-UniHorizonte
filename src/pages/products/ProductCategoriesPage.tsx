import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { useDeleteCategory, useProductCategories } from '../../hooks/useProductCategories';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { getErrorMessage } from '../../lib/errors';
import type { ProductCategory } from '../../types';

const statusColors: Record<ProductCategory['status'], string> = {
  active: 'bg-green-100 text-green-700',
  archived: 'bg-amber-100 text-amber-700',
};

export function ProductCategoriesPage() {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ProductCategory | null>(null);

  const { data, isPending, error, refetch } = useProductCategories();
  const deleteCategory = useDeleteCategory();
  const handleDelete = (id: string, force = false) => {
    deleteCategory.mutate(
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

  const items = data ?? [];
  const parentName = new Map(items.map((c) => [c.id, c.nome]));

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Categorias de Produtos</h1>
        <Link
          to="/admin/products/categories/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Nova categoria
        </Link>
      </header>

      {isPending && <LoadingState />}
      {error ? <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} /> : null}

      {!isPending && !error && items.length === 0 && (
        <EmptyState
          title="Nenhuma categoria"
          description="Crie a primeira categoria para organizar seus produtos."
        />
      )}

      {!isPending && !error && items.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nome</TableHeaderCell>
              <TableHeaderCell>Slug</TableHeaderCell>
              <TableHeaderCell>Categoria pai</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Ações</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((category, index) => (
              <TableRow key={category.id} striped={index % 2 === 1}>
                <TableCell className="font-medium text-slate-900">{category.nome}</TableCell>
                <TableCell className="text-slate-500">{category.slug}</TableCell>
                <TableCell>
                  {category.parent_id ? (parentName.get(category.parent_id) ?? '—') : '—'}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[category.status]}>{category.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1">
                    <Link
                      to={`/admin/products/categories/${category.id}/edit`}
                      aria-label={`Editar ${category.nome}`}
                      className="inline-flex rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete(category)}
                      aria-label={`Excluir ${category.nome}`}
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
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${toDelete?.nome ?? ''}"?`}
        confirmLabel="Excluir"
        loading={deleteCategory.isPending}
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
