import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Image as ImageIcon, X } from 'lucide-react';
import { useBlogCategories } from '../../hooks/useBlogCategories';
import { useCreatePost, usePost, useUpdatePost } from '../../hooks/useBlogPosts';
import { useProducts } from '../../hooks/useProducts';
import { blogApi, type CreatePostInput } from '../../api/blog';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { FormField, fieldClass, fieldErrorClass } from '../../components/ui/FormField';
import { ImageInput } from '../../components/ui/ImageInput';
import { formatCurrency } from '../../lib/format';
import type { BlogPost, PostStatus } from '../../types';

const POST_STATUSES: { value: PostStatus; label: string }[] = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
];

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string;
  cover_image_url: string;
  status: PostStatus;
  featured: boolean;
  tags: string;
  meta_title: string;
  meta_description: string;
     og_image_url: string;
     /** Produtos selecionados (associação é salva por rotas separadas, nunca no create/update). */
     product_ids: string[];
  }

const emptyForm: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category_id: '',
  cover_image_url: '',
  status: 'draft',
  featured: false,
  tags: '',
  meta_title: '',
  meta_description: '',
       og_image_url: '',
       product_ids: [],
  };

  function toForm(post: BlogPost): FormState {
    return {
      title: post.title,
      slug: post.slug ?? '',
      excerpt: post.excerpt ?? '',
      content: post.content ?? '',
      category_id: post.category_id ?? '',
      cover_image_url: post.cover_image_url ?? '',
      status: post.status,
      featured: post.featured,
      tags: (post.tags ?? []).join(', '),
      meta_title: post.meta_title ?? '',
      meta_description: post.meta_description ?? '',
      og_image_url: post.og_image_url ?? '',
      product_ids: [],
    };
  }

export function BlogPostFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: categories } = useBlogCategories();
  const { data: post, isPending, error, refetch } = usePost(id);
  const { data: productsData } = useProducts({ limit: 100, status: 'active' });
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  /** Produtos já vinculados no servidor (base para o diff no submit). */
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [associating, setAssociating] = useState(false);

  function showFieldError(key: string, invalid: boolean): string | undefined {
    if (!invalid) return undefined;
    return touched[key] || submitted ? 'Este campo é obrigatório' : undefined;
  }

  function handleBlur(key: string) {
    setTouched((t) => ({ ...t, [key]: true }));
  }

  useEffect(() => {
    if (!post) return;
    setForm(toForm(post));
  }, [post]);

  // No modo edição, pré-seleciona os produtos já vinculados ao post.
  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    blogApi
      .listProductsByPost(id)
      .then((products) => {
        if (cancelled) return;
        const ids = products.map((p) => p.id);
        setSavedProductIds(ids);
        setForm((prev) => ({ ...prev, product_ids: ids }));
      })
      .catch((err: unknown) => {
        if (!cancelled) console.error('Falha ao carregar produtos do post', err);
      });
    return () => {
      cancelled = true;
    };
  }, [isEdit, id]);

  const mutation = isEdit ? updatePost : createPost;
  const saving = mutation.isPending || associating;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleProduct(productId: string) {
    setForm((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter((p) => p !== productId)
        : [...prev.product_ids, productId],
    }));
  }

  async function persistProductLinks(postId: string): Promise<void> {
    const selected = form.product_ids;
    const saved = new Set(savedProductIds);

    if (isEdit) {
      // Removidos: um por um (DELETE é por produto).
      const removed = savedProductIds.filter((pid) => !selected.includes(pid));
      for (const pid of removed) {
        await blogApi.dissociateProductFromPost(postId, pid);
      }
    }

    // Adicionados: em lote (POST aceita product_ids[]).
    const added = selected.filter((pid) => !saved.has(pid));
    if (added.length > 0) {
      await blogApi.associateProductsToPost(postId, added);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const payload: CreatePostInput = {
      title: form.title,
      content: form.content,
      slug: form.slug || undefined,
      excerpt: form.excerpt || null,
      category_id: form.category_id || null,
      cover_image_url: form.cover_image_url || null,
      status: form.status,
      featured: form.featured,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      og_image_url: form.og_image_url || null,
    };

    setAssociating(true);
    const finish = () => setAssociating(false);

    if (isEdit) {
      const postId = id as string;
      updatePost.mutate(
        { id: postId, input: payload },
        {
          onSuccess: async () => {
            try {
              await persistProductLinks(postId);
              navigate('/admin/blog/posts');
            } catch (err) {
              finish();
              // O post já foi salvo; apenas informa que a associação falhou.
              toast.error(
                `Post salvo, mas houve erro ao atualizar os produtos relacionados: ${
                  err instanceof Error ? err.message : 'erro desconhecido'
                }`,
              );
            }
          },
          onError: finish,
        },
      );
    } else {
      createPost.mutate(payload, {
        onSuccess: async (created) => {
          try {
            if (form.product_ids.length > 0) {
              await blogApi.associateProductsToPost(created.id, form.product_ids);
            }
            navigate('/admin/blog/posts');
          } catch (err) {
            finish();
            // Não desfaz o post: apenas avisa que a associação falhou.
            toast.error(
              `Post criado, mas houve erro ao vincular os produtos: ${
                err instanceof Error ? err.message : 'erro desconhecido'
              }`,
            );
          }
        },
        onError: finish,
      });
    }
  }

  if (isEdit && isPending) return <LoadingState message="Carregando post…" />;
  if (isEdit && error) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  }

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Editar post' : 'Novo post'}</h1>
        <Link
          to="/admin/blog/posts"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Voltar
        </Link>
      </header>

      {mutation.isError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutation.error?.message ?? 'Erro ao salvar o post.'}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <FormField label="Título" htmlFor="title"
          required
          error={showFieldError('title', !form.title.trim())}
        >
          <input
            id="title"
            maxLength={200}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            className={`${fieldClass} ${showFieldError('title', !form.title.trim()) ? fieldErrorClass : ''}`}
          />
        </FormField>

        <FormField
          label="Slug"
          htmlFor="slug"
          hint="Deixe em branco para gerar automaticamente a partir do título."
        >
          <input
            id="slug"
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="gerado automaticamente"
            className={fieldClass}
          />
        </FormField>

        <FormField label="Resumo" htmlFor="excerpt">
          <textarea
            id="excerpt"
            rows={3}
            value={form.excerpt}
            onChange={(e) => set('excerpt', e.target.value)}
            className={fieldClass}
          />
        </FormField>

        <FormField label="Conteúdo" htmlFor="content"
            required
            error={showFieldError('content', !form.content.trim())}
          >
          <textarea
            id="content"
            rows={14}
            value={form.content}
            onChange={(e) => set('content', e.target.value)}
            className={`${fieldClass} font-mono`}
          />
        </FormField>

        <FormField label="Categoria" htmlFor="category_id">
          <select
            id="category_id"
            value={form.category_id}
            onChange={(e) => set('category_id', e.target.value)}
            className={fieldClass}
          >
            <option value="">Sem categoria</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Imagem de capa" htmlFor="cover_image_url">
          <ImageInput
            kind="blog"
            value={form.cover_image_url}
            onChange={(url) => set('cover_image_url', url)}
            hint="Cole uma URL ou envie um arquivo (mÃ¡x. 5 MB)."
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Status" htmlFor="status" required>
            <select
              id="status"
              value={form.status}
              onChange={(e) => set('status', e.target.value as PostStatus)}
              className={fieldClass}
            >
              {POST_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tags" htmlFor="tags" hint="Separe por vírgula. Ex.: viagem, europa, dicas">
            <input
              id="tags"
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              className={fieldClass}
            />
          </FormField>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="featured"
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="size-4 rounded border-slate-300"
          />
          <label htmlFor="featured" className="text-sm font-medium text-slate-700">
            Post em destaque
          </label>
        </div>

        <FormField
          label="Produtos relacionados"
          htmlFor="product_picker"
          hint="Selecione os produtos que serão exibidos junto a este post."
        >
          <select
            id="product_picker"
            value=""
            onChange={(e) => {
              if (e.target.value) toggleProduct(e.target.value);
            }}
            className={fieldClass}
          >
            <option value="">Adicionar produto…</option>
            {(productsData?.items ?? [])
              .filter((p) => !form.product_ids.includes(p.id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
          </select>

          {form.product_ids.length > 0 && (
            <ul className="mt-2 space-y-2">
              {form.product_ids.map((pid) => {
                const product = (productsData?.items ?? []).find((p) => p.id === pid);
                if (!product) return null;
                return (
                  <li
                    key={pid}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
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
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-200 text-slate-400">
                        <ImageIcon className="size-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{product.nome}</p>
                      <p className="text-xs text-slate-500">
                        {product.preco != null ? formatCurrency(product.preco) : 'Sem preço'}
                        {product.sku ? ` · ${product.sku}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleProduct(pid)}
                      className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                      aria-label={`Remover ${product.nome}`}
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </FormField>

        <FormField label="Meta title" htmlFor="meta_title">
          <input
            id="meta_title"
            value={form.meta_title}
            onChange={(e) => set('meta_title', e.target.value)}
            className={fieldClass}
          />
        </FormField>

        <FormField label="Meta description" htmlFor="meta_description">
          <textarea
            id="meta_description"
            rows={3}
            value={form.meta_description}
            onChange={(e) => set('meta_description', e.target.value)}
            className={fieldClass}
          />
        </FormField>

        <FormField label="URL da imagem OG" htmlFor="og_image_url">
          <input
            id="og_image_url"
            type="url"
            value={form.og_image_url}
            onChange={(e) => set('og_image_url', e.target.value)}
            className={fieldClass}
          />
        </FormField>

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
            onClick={() => navigate('/admin/blog/posts')}
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
