import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCreateCategory, useProductCategories, useUpdateCategory } from '../../hooks/useProductCategories';
import type { CreateProductCategoryInput } from '../../api/products';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { getErrorMessage } from '../../lib/errors';
import { FormField, fieldClass, fieldErrorClass } from '../../components/ui/FormField';
import type { CategoryStatus } from '../../types';

const CATEGORY_STATUSES: { value: CategoryStatus; label: string }[] = [
  { value: 'active', label: 'Ativa' },
  { value: 'archived', label: 'Arquivada' },
];

interface FormState {
  nome: string;
  slug: string;
  descricao: string;
  parent_id: string;
  display_order: string;
  status: CategoryStatus;
}

const emptyForm: FormState = {
  nome: '',
  slug: '',
  descricao: '',
  parent_id: '',
  display_order: '0',
  status: 'active',
};

export function ProductCategoryFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: categories, isPending, error, refetch } = useProductCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  function showFieldError(key: string, invalid: boolean): string | undefined {
    if (!invalid) return undefined;
    return touched[key] || submitted ? 'Este campo é obrigatório' : undefined;
  }

  function handleBlur(key: string) {
    setTouched((t) => ({ ...t, [key]: true }));
  }

  const current = isEdit ? (categories ?? []).find((c) => c.id === id) : undefined;
  const parents = (categories ?? []).filter((c) => c.id !== id);

  useEffect(() => {
    if (!current) return;
    setForm({
      nome: current.nome,
      slug: current.slug ?? '',
      descricao: current.descricao ?? '',
      parent_id: current.parent_id ?? '',
      display_order: String(current.display_order ?? 0),
      status: current.status,
    });
  }, [current]);

  const mutation = isEdit ? updateCategory : createCategory;
  const saving = mutation.isPending;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const payload: CreateProductCategoryInput = {
      nome: form.nome,
      slug: form.slug || undefined,
      descricao: form.descricao || null,
      parent_id: form.parent_id || null,
      display_order: Number(form.display_order) || 0,
      ...(isEdit ? { status: form.status } : {}),
    };

    const onSuccess = () => navigate('/admin/products/categories');

    if (isEdit) {
      updateCategory.mutate({ id: id as string, input: payload }, { onSuccess });
    } else {
      createCategory.mutate(payload, { onSuccess });
    }
  }

  if (isEdit && isPending) return <LoadingState message="Carregando categoria…" />;
  if (isEdit && error) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }
  if (isEdit && !isPending && !current) {
    return <ErrorState message="Categoria não encontrada." />;
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? 'Editar categoria' : 'Nova categoria'}
        </h1>
        <Link
          to="/admin/products/categories"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Voltar
        </Link>
      </header>

      {mutation.isError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutation.error?.message ?? 'Erro ao salvar a categoria.'}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <FormField label="Nome" htmlFor="nome"
          required
          error={showFieldError('nome', !form.nome.trim())}
        >
          <input
            id="nome"
            value={form.nome}
            onChange={(e) => set('nome', e.target.value)}
            onBlur={() => handleBlur('nome')}
            className={`${fieldClass} ${showFieldError('nome', !form.nome.trim()) ? fieldErrorClass : ''}`}
          />
        </FormField>

        <FormField
          label="Slug"
          htmlFor="slug"
          hint="Deixe em branco para gerar automaticamente a partir do nome."
        >
          <input
            id="slug"
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="gerado automaticamente"
            className={fieldClass}
          />
        </FormField>

        <FormField label="Descrição" htmlFor="descricao">
          <textarea
            id="descricao"
            rows={4}
            value={form.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            className={fieldClass}
          />
        </FormField>

        <FormField label="Categoria pai" htmlFor="parent_id">
          <select
            id="parent_id"
            value={form.parent_id}
            onChange={(e) => set('parent_id', e.target.value)}
            className={fieldClass}
          >
            <option value="">Sem categoria pai</option>
            {parents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Ordem de exibição" htmlFor="display_order">
            <input
              id="display_order"
              type="number"
              value={form.display_order}
              onChange={(e) => set('display_order', e.target.value)}
              className={fieldClass}
            />
          </FormField>

          {isEdit && (
            <FormField label="Status" htmlFor="status" required>
              <select
                id="status"
                value={form.status}
                onChange={(e) => set('status', e.target.value as CategoryStatus)}
                className={fieldClass}
              >
                {CATEGORY_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </FormField>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products/categories')}
            disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
