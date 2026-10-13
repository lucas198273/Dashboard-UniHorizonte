import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { useDeleteProduct, useProducts } from '../../hooks/useProducts';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { getErrorMessage } from '../../lib/errors';
import { formatCurrency } from '../../lib/format';
import type { Product, ProductLevel, ProductModality } from '../../types';

const statusColors: Record<Product['status'], string> = {
  draft: 'bg-slate-100 text-slate-700',
  active: 'bg-green-100 text-green-700',
  archived: 'bg-amber-100 text-amber-700',
};

const modalityLabels: Record<ProductModality, string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido',
};

const levelLabels: Record<ProductLevel, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [modality, setModality] = useState<ProductModality | ''>('');
  const [level, setLevel] = useState<ProductLevel | ''>('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const { data, isPending, error, refetch } = useProducts({
    page,
    limit: 20,
    ...(modality ? { modality } : {}),
    ...(level ? { level } : {}),
  });
  const deleteProduct = useDeleteProduct();
  const handleDelete = (id: string, force = false) => {
    deleteProduct.mutate(
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

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select
            id="modality"
            value={modality}
            onChange={(e) => {
              setModality(e.target.value as ProductModality | '');
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            aria-label="Filtrar por modalidade"
          >
            <option value="">Todas as modalidades</option>
            {Object.entries(modalityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            id="level"
            value={level}
            onChange={(e) => {
              setLevel(e.target.value as ProductLevel | '');
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            aria-label="Filtrar por nível"
          >
            <option value="">Todos os níveis</option>
            {Object.entries(levelLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Link
            to="/admin/products/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            Novo produto
          </Link>
        </div>
      </header>

      {isPending && <LoadingState />}
      {error ? <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} /> : null}

      {!isPending && !error && items.length === 0 && (
        <EmptyState
          title="Nenhum produto"
          description="Os produtos cadastrados aparecerão aqui."
        />
      )}

      {!isPending && !error && items.length > 0 && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>SKU</TableHeaderCell>
                <TableHeaderCell>Preço</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Ações</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((product, index) => (
                <TableRow key={product.id} striped={index % 2 === 1}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.images[0]?.url ? (
                        <img
                          src={product.images[0].url}
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
                      <div>
                        <div className="font-medium text-slate-900">
                          {product.nome}
                          {product.featured && <Badge className="ml-2 bg-blue-100 text-blue-700">Destaque</Badge>}
                        </div>
                        {(product.modality || product.workload_hours != null || product.level) && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {product.modality && (
                              <Badge className="bg-slate-100 text-slate-700">
                                {modalityLabels[product.modality]}
                              </Badge>
                            )}
                            {product.workload_hours != null && (
                              <Badge className="bg-slate-100 text-slate-700">{product.workload_hours}h</Badge>
                            )}
                            {product.level && (
                              <Badge className="bg-slate-100 text-slate-700">
                                {levelLabels[product.level]}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{product.sku ?? '—'}</TableCell>
                  <TableCell>{product.preco != null ? formatCurrency(product.preco) : '—'}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[product.status]}>{product.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        aria-label={`Editar ${product.nome}`}
                        className="inline-flex rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToDelete(product)}
                        aria-label={`Excluir ${product.nome}`}
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
        title="Excluir produto"
        message={`Tem certeza que deseja excluir "${toDelete?.nome ?? ''}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleteProduct.isPending}
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
