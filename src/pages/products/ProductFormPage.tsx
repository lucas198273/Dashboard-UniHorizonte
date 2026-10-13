import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProductCategories } from '../../hooks/useProductCategories';
import { useCreateProduct, useProduct, useUpdateProduct } from '../../hooks/useProducts';
import type { CreateProductInput } from '../../api/products';
import { Trash2 } from 'lucide-react';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { getErrorMessage } from '../../lib/errors';
import { FormField, fieldClass, fieldErrorClass } from '../../components/ui/FormField';
import { ImageInput } from '../../components/ui/ImageInput';
import type {
  ProductLevel,
  ProductModality,
  ProductStatus,
} from '../../types';

const PRODUCT_STATUSES: { value: ProductStatus; label: string }[] = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'active', label: 'Ativo' },
  { value: 'archived', label: 'Arquivado' },
];

const COURSE_MODALITIES: { value: ProductModality; label: string }[] = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'online', label: 'Online' },
  { value: 'hibrido', label: 'Híbrido' },
];

const COURSE_LEVELS: { value: ProductLevel; label: string }[] = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
];

interface FormState {
  nome: string;
  slug: string;
  sku: string;
  descricao: string;
  preco: string;
  category_id: string;
  status: ProductStatus;
  display_order: string;
  featured: boolean;
  images: string[];
  meta_title: string;
  meta_description: string;
  modality: ProductModality | '';
  workload_hours: string;
  duration_months: string;
  level: ProductLevel | '';
  certification: boolean;
  certification_name: string;
  start_date: string;
  enrollment_deadline: string;
  syllabus: string;
  requirements: string;
  coordinator_name: string;
  coordinator_bio: string;
  coordinator_photo_url: string;
  video_url: string;
  tags: string[];
}

const emptyForm: FormState = {
  nome: '',
  slug: '',
  sku: '',
  descricao: '',
  preco: '',
  category_id: '',
  status: 'draft',
  display_order: '0',
  featured: false,
  images: [],
  meta_title: '',
  meta_description: '',
  modality: '',
  workload_hours: '',
  duration_months: '',
  level: '',
  certification: false,
  certification_name: '',
  start_date: '',
  enrollment_deadline: '',
  syllabus: '',
  requirements: '',
  coordinator_name: '',
  coordinator_bio: '',
  coordinator_photo_url: '',
  video_url: '',
  tags: [],
};

type CourseFieldErrors = Partial<Record<keyof FormState, string>>;

function isValidUri(value: string): boolean {
  try {
    return new URL(value).protocol.length > 0;
  } catch {
    return false;
  }
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateCourseFields(form: FormState): CourseFieldErrors {
  const errors: CourseFieldErrors = {};
  const workloadHours = form.workload_hours.trim();
  const durationMonths = form.duration_months.trim();

  if (workloadHours && (!/^\d+$/.test(workloadHours) || Number(workloadHours) <= 0)) {
    errors.workload_hours = 'Informe um número inteiro maior que zero.';
  }
  if (durationMonths && (!/^\d+$/.test(durationMonths) || Number(durationMonths) <= 0)) {
    errors.duration_months = 'Informe um número inteiro maior que zero.';
  }
  if (form.video_url.trim() && !isValidUri(form.video_url.trim())) {
    errors.video_url = 'Informe uma URI válida.';
  }
  if (form.coordinator_photo_url.trim() && !isValidUri(form.coordinator_photo_url.trim())) {
    errors.coordinator_photo_url = 'Informe uma URI válida.';
  }
  if (form.start_date && !isValidIsoDate(form.start_date)) {
    errors.start_date = 'Informe uma data ISO válida.';
  }
  if (form.enrollment_deadline && !isValidIsoDate(form.enrollment_deadline)) {
    errors.enrollment_deadline = 'Informe uma data ISO válida.';
  }
  if (form.certification_name.trim().length > 200) {
    errors.certification_name = 'Use no máximo 200 caracteres.';
  }
  if (form.coordinator_name.trim().length > 200) {
    errors.coordinator_name = 'Use no máximo 200 caracteres.';
  }
  if (form.coordinator_bio.length > 1000) {
    errors.coordinator_bio = 'Use no máximo 1000 caracteres.';
  }
  if (form.tags.length > 20 || form.tags.some((tag) => tag.trim().length > 40)) {
    errors.tags = 'Use até 20 etiquetas, com no máximo 40 caracteres cada.';
  }

  return errors;
}

export function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: categories } = useProductCategories();
  const { data: product, isPending, error, refetch } = useProduct(id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const courseDetailsRef = useRef<HTMLDetailsElement>(null);
  const courseContentRef = useRef<HTMLDetailsElement>(null);
  const coordinatorRef = useRef<HTMLDetailsElement>(null);
  const courseErrors = validateCourseFields(form);

  function showFieldError(key: string, invalid: boolean): string | undefined {
    if (!invalid) return undefined;
    return touched[key] || submitted ? 'Este campo �© obrigat�³rio' : undefined;
  }

  function handleBlur(key: string) {
    setTouched((t) => ({ ...t, [key]: true }));
  }

  useEffect(() => {
    if (!product) return;
    setForm({
      nome: product.nome,
      slug: product.slug ?? '',
      sku: product.sku ?? '',
      descricao: product.descricao ?? '',
      preco: product.preco != null ? String(product.preco) : '',
      category_id: product.category_id ?? '',
      status: product.status,
      display_order: String(product.display_order ?? 0),
      featured: product.featured ?? false,
      images: (product.images ?? []).map((img) => img.url),
      meta_title: product.meta_title ?? '',
      meta_description: product.meta_description ?? '',
      modality: product.modality ?? '',
      workload_hours: product.workload_hours != null ? String(product.workload_hours) : '',
      duration_months: product.duration_months != null ? String(product.duration_months) : '',
      level: product.level ?? '',
      certification: product.certification ?? false,
      certification_name: product.certification_name ?? '',
      start_date: product.start_date?.slice(0, 10) ?? '',
      enrollment_deadline: product.enrollment_deadline?.slice(0, 10) ?? '',
      syllabus: product.syllabus ?? '',
      requirements: product.requirements ?? '',
      coordinator_name: product.coordinator_name ?? '',
      coordinator_bio: product.coordinator_bio ?? '',
      coordinator_photo_url: product.coordinator_photo_url ?? '',
      video_url: product.video_url ?? '',
      tags: product.tags ?? [],
    });
  }, [product]);

  const mutation = isEdit ? updateProduct : createProduct;
  const saving = mutation.isPending;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errors = validateCourseFields(form);
    if (Object.keys(errors).length > 0) {
      const detailsErrors = ['modality', 'workload_hours', 'duration_months', 'level', 'certification',
        'certification_name', 'start_date', 'enrollment_deadline'];
      const contentErrors = ['syllabus', 'requirements', 'tags', 'video_url'];
      const coordinatorErrors = ['coordinator_name', 'coordinator_bio', 'coordinator_photo_url'];
      if (Object.keys(errors).some((key) => detailsErrors.includes(key))) {
        if (courseDetailsRef.current) courseDetailsRef.current.open = true;
      }
      if (Object.keys(errors).some((key) => contentErrors.includes(key))) {
        if (courseContentRef.current) courseContentRef.current.open = true;
      }
      if (Object.keys(errors).some((key) => coordinatorErrors.includes(key))) {
        if (coordinatorRef.current) coordinatorRef.current.open = true;
      }
      return;
    }
    const preco = form.preco.trim() === '' ? null : Number(form.preco);
    const payload: CreateProductInput = {
      nome: form.nome,
      kind: 'course',
      slug: form.slug || undefined,
      sku: form.sku || null,
      descricao: form.descricao || null,
      preco: preco != null && Number.isNaN(preco) ? null : preco,
      category_id: form.category_id || null,
      images: form.images
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url, i) => ({ url, displayOrder: i })),
      status: form.status,
      display_order: Number(form.display_order) || 0,
      featured: form.featured,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      modality: form.modality || null,
      workload_hours: form.workload_hours.trim() ? Number(form.workload_hours) : null,
      duration_months: form.duration_months.trim() ? Number(form.duration_months) : null,
      level: form.level || null,
      certification: form.certification,
      certification_name: form.certification ? form.certification_name.trim() || null : null,
      start_date: form.start_date || null,
      enrollment_deadline: form.enrollment_deadline || null,
      syllabus: form.syllabus || null,
      requirements: form.requirements || null,
      coordinator_name: form.coordinator_name.trim() || null,
      coordinator_bio: form.coordinator_bio || null,
      coordinator_photo_url: form.coordinator_photo_url.trim() || null,
      video_url: form.video_url.trim() || null,
      tags: form.tags.map((tag) => tag.trim()).filter(Boolean),
    };

    const onSuccess = () => navigate('/admin/products');

    if (isEdit) {
      updateProduct.mutate({ id: id as string, input: payload }, { onSuccess });
    } else {
      createProduct.mutate(payload, { onSuccess });
    }
  }

  if (isEdit && isPending) return <LoadingState message="Carregando produto…" />;
  if (isEdit && error) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Editar produto' : 'Novo produto'}</h1>
        <Link to="/admin/products" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Voltar
        </Link>
      </header>

      {mutation.isError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutation.error?.message ?? 'Erro ao salvar o produto.'}
        </div>
      )}

      <form noValidate onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Slug"
            htmlFor="slug"
            hint="Deixe em branco para gerar automaticamente."
          >
            <input
              id="slug"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="gerado automaticamente"
              className={fieldClass}
            />
          </FormField>

          <FormField label="SKU" htmlFor="sku">
            <input
              id="sku"
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              className={fieldClass}
            />
          </FormField>
        </div>

        <FormField label="Descrição" htmlFor="descricao">
          <textarea
            id="descricao"
            rows={5}
            value={form.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            className={fieldClass}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Preço" htmlFor="preco">
            <input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={form.preco}
              onChange={(e) => set('preco', e.target.value)}
              className={fieldClass}
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

          <FormField label="Ordem de exibição" htmlFor="display_order">
            <input
              id="display_order"
              type="number"
              value={form.display_order}
              onChange={(e) => set('display_order', e.target.value)}
              className={fieldClass}
            />
          </FormField>
        </div>

        <FormField label="Status" htmlFor="status" required>
          <select
            id="status"
            value={form.status}
            onChange={(e) => set('status', e.target.value as ProductStatus)}
            className={fieldClass}
          >
            {PRODUCT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </FormField>

        <div className="flex items-center gap-2">
          <input
            id="featured"
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="size-4 rounded border-slate-300"
          />
          <label htmlFor="featured" className="text-sm font-medium text-slate-700">
            Produto em destaque
          </label>
          <span className="text-xs text-slate-500">Aparece em destaque na home do site público</span>
        </div>
        <FormField label="Imagens" htmlFor="images">
          <div className="space-y-3">
            {form.images.map((img, i) => (
              <div key={i} className="flex items-start gap-2">
                <ImageInput
                  kind="product"
                  value={img}
                  onChange={(url) => {
                    const next = [...form.images];
                    next[i] = url;
                    set('images', next);
                  }}
                  hint={i === 0 ? 'A primeira imagem será a capa do produto.' : undefined}
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                    aria-label={`Remover imagem ${i + 1}`}
                    className="mt-1 rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => set('images', [...form.images, ''])}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              + Adicionar imagem
            </button>
          </div>
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

        <details
          ref={courseDetailsRef}
          className="rounded-lg border border-slate-200"
          onToggle={(event) => {
            if (!event.currentTarget.open && Object.keys(courseErrors).some((key) =>
              ['modality', 'workload_hours', 'duration_months', 'level', 'certification',
                'certification_name', 'start_date', 'enrollment_deadline'].includes(key))) {
              event.currentTarget.open = true;
            }
          }}
        >
          <summary className="cursor-pointer px-4 py-3 font-semibold text-slate-800">
            Detalhes do curso
          </summary>
          <div className="grid gap-4 border-t border-slate-200 p-4 sm:grid-cols-2">
            <FormField label="Modalidade" htmlFor="modality" error={submitted ? courseErrors.modality : undefined}>
              <select
                id="modality"
                value={form.modality}
                onChange={(e) => set('modality', e.target.value as ProductModality | '')}
                className={fieldClass}
              >
                <option value="">—</option>
                {COURSE_MODALITIES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Nível" htmlFor="level" error={submitted ? courseErrors.level : undefined}>
              <select
                id="level"
                value={form.level}
                onChange={(e) => set('level', e.target.value as ProductLevel | '')}
                className={fieldClass}
              >
                <option value="">—</option>
                {COURSE_LEVELS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </FormField>
            <FormField
              label="Carga horária (horas)"
              htmlFor="workload_hours"
              error={submitted || touched.workload_hours ? courseErrors.workload_hours : undefined}
            >
              <input
                id="workload_hours"
                type="number"
                min="1"
                step="1"
                value={form.workload_hours}
                onChange={(e) => set('workload_hours', e.target.value)}
                onBlur={() => handleBlur('workload_hours')}
                className={`${fieldClass} ${courseErrors.workload_hours && (submitted || touched.workload_hours) ? fieldErrorClass : ''}`}
              />
            </FormField>
            <FormField
              label="Duração (meses)"
              htmlFor="duration_months"
              error={submitted || touched.duration_months ? courseErrors.duration_months : undefined}
            >
              <input
                id="duration_months"
                type="number"
                min="1"
                step="1"
                value={form.duration_months}
                onChange={(e) => set('duration_months', e.target.value)}
                onBlur={() => handleBlur('duration_months')}
                className={`${fieldClass} ${courseErrors.duration_months && (submitted || touched.duration_months) ? fieldErrorClass : ''}`}
              />
            </FormField>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="certification"
                type="checkbox"
                checked={form.certification}
                onChange={(e) => set('certification', e.target.checked)}
                className="size-4 rounded border-slate-300"
              />
              <label htmlFor="certification" className="text-sm font-medium text-slate-700">
                Oferece certificação
              </label>
            </div>
            {form.certification && (
              <FormField
                label="Nome da certificação"
                htmlFor="certification_name"
                error={submitted || touched.certification_name ? courseErrors.certification_name : undefined}
              >
                <input
                  id="certification_name"
                  type="text"
                  maxLength={200}
                  value={form.certification_name}
                  onChange={(e) => set('certification_name', e.target.value)}
                  onBlur={() => handleBlur('certification_name')}
                  className={`${fieldClass} ${courseErrors.certification_name && (submitted || touched.certification_name) ? fieldErrorClass : ''}`}
                />
              </FormField>
            )}
            <FormField
              label="Data de início"
              htmlFor="start_date"
              error={submitted || touched.start_date ? courseErrors.start_date : undefined}
            >
              <input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)}
                onBlur={() => handleBlur('start_date')}
                className={fieldClass}
              />
            </FormField>
            <FormField
              label="Prazo de inscrição"
              htmlFor="enrollment_deadline"
              error={submitted || touched.enrollment_deadline ? courseErrors.enrollment_deadline : undefined}
            >
              <input
                id="enrollment_deadline"
                type="date"
                value={form.enrollment_deadline}
                onChange={(e) => set('enrollment_deadline', e.target.value)}
                onBlur={() => handleBlur('enrollment_deadline')}
                className={fieldClass}
              />
            </FormField>
          </div>
        </details>

        <details
          ref={courseContentRef}
          className="rounded-lg border border-slate-200"
          onToggle={(event) => {
            if (!event.currentTarget.open && Object.keys(courseErrors).some((key) =>
              ['syllabus', 'requirements', 'tags', 'video_url'].includes(key))) {
              event.currentTarget.open = true;
            }
          }}
        >
          <summary className="cursor-pointer px-4 py-3 font-semibold text-slate-800">
            Conteúdo do curso
          </summary>
          <div className="space-y-4 border-t border-slate-200 p-4">
            <FormField label="Ementa" htmlFor="syllabus">
              <textarea
                id="syllabus"
                rows={5}
                value={form.syllabus}
                onChange={(e) => set('syllabus', e.target.value)}
                className={fieldClass}
              />
            </FormField>
            <FormField label="Pré-requisitos" htmlFor="requirements">
              <textarea
                id="requirements"
                rows={4}
                value={form.requirements}
                onChange={(e) => set('requirements', e.target.value)}
                className={fieldClass}
              />
            </FormField>
            <FormField
              label="Etiquetas"
              htmlFor="tagDraft"
              hint="Até 20 etiquetas, com no máximo 40 caracteres cada."
              error={submitted ? courseErrors.tags : undefined}
            >
              <div className="flex gap-2">
                <input
                  id="tagDraft"
                  value={tagDraft}
                  maxLength={40}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const tag = tagDraft.trim();
                      if (tag && form.tags.length < 20 && !form.tags.includes(tag)) {
                        set('tags', [...form.tags, tag]);
                        setTagDraft('');
                      }
                    }
                  }}
                  className={fieldClass}
                />
                <button
                  type="button"
                  disabled={!tagDraft.trim() || form.tags.length >= 20}
                  onClick={() => {
                    const tag = tagDraft.trim();
                    if (tag && form.tags.length < 20 && !form.tags.includes(tag)) {
                      set('tags', [...form.tags, tag]);
                      setTagDraft('');
                    }
                  }}
                  className="shrink-0 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Adicionar
                </button>
              </div>
              {form.tags.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {form.tags.map((tag, index) => (
                    <li key={`${tag}-${index}`} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {tag}
                      <button
                        type="button"
                        aria-label={`Remover etiqueta ${tag}`}
                        onClick={() => set('tags', form.tags.filter((_, tagIndex) => tagIndex !== index))}
                        className="text-slate-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </FormField>
            <FormField
              label="URL do vídeo"
              htmlFor="video_url"
              error={submitted || touched.video_url ? courseErrors.video_url : undefined}
            >
              <input
                id="video_url"
                type="url"
                value={form.video_url}
                onChange={(e) => set('video_url', e.target.value)}
                onBlur={() => handleBlur('video_url')}
                className={`${fieldClass} ${courseErrors.video_url && (submitted || touched.video_url) ? fieldErrorClass : ''}`}
              />
            </FormField>
          </div>
        </details>

        <details
          ref={coordinatorRef}
          className="rounded-lg border border-slate-200"
          onToggle={(event) => {
            if (!event.currentTarget.open && Object.keys(courseErrors).some((key) =>
              ['coordinator_name', 'coordinator_bio', 'coordinator_photo_url'].includes(key))) {
              event.currentTarget.open = true;
            }
          }}
        >
          <summary className="cursor-pointer px-4 py-3 font-semibold text-slate-800">
            Coordenação
          </summary>
          <div className="space-y-4 border-t border-slate-200 p-4">
            <FormField
              label="Nome do coordenador"
              htmlFor="coordinator_name"
              error={submitted || touched.coordinator_name ? courseErrors.coordinator_name : undefined}
            >
              <input
                id="coordinator_name"
                type="text"
                maxLength={200}
                value={form.coordinator_name}
                onChange={(e) => set('coordinator_name', e.target.value)}
                onBlur={() => handleBlur('coordinator_name')}
                className={`${fieldClass} ${courseErrors.coordinator_name && (submitted || touched.coordinator_name) ? fieldErrorClass : ''}`}
              />
            </FormField>
            <FormField
              label="Biografia do coordenador"
              htmlFor="coordinator_bio"
              error={submitted || touched.coordinator_bio ? courseErrors.coordinator_bio : undefined}
            >
              <textarea
                id="coordinator_bio"
                rows={4}
                maxLength={1000}
                value={form.coordinator_bio}
                onChange={(e) => set('coordinator_bio', e.target.value)}
                onBlur={() => handleBlur('coordinator_bio')}
                className={`${fieldClass} ${courseErrors.coordinator_bio && (submitted || touched.coordinator_bio) ? fieldErrorClass : ''}`}
              />
            </FormField>
            <FormField
              label="Foto do coordenador"
              htmlFor="coordinator_photo_url"
              error={submitted || touched.coordinator_photo_url ? courseErrors.coordinator_photo_url : undefined}
            >
              <ImageInput
                kind="product"
                value={form.coordinator_photo_url}
                onChange={(url) => set('coordinator_photo_url', url)}
              />
            </FormField>
          </div>
        </details>

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
            onClick={() => navigate('/admin/products')}
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
