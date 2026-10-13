import { useRef, useState } from 'react';
import { Link2, Loader2, Upload } from 'lucide-react';
import { useUploadImage } from '../../hooks/useUploadImage';
import { getErrorMessage } from '../../lib/errors';

type Mode = 'url' | 'upload';

interface ImageInputProps {
  kind: 'blog' | 'product';
  value: string;
  onChange: (url: string) => void;
  urlPlaceholder?: string;
  hint?: string;
  className?: string;
}

/**
 * Campo de imagem com escolha explícita entre "colar URL" e "enviar arquivo".
 * Só um modo fica ativo por vez; upload preenche o mesmo `value`.
 */
export function ImageInput({
  kind,
  value,
  onChange,
  urlPlaceholder = 'https://exemplo.com/imagem.jpg',
  hint,
  className,
}: ImageInputProps) {
  const [mode, setMode] = useState<Mode>('url');
  const upload = useUploadImage(kind);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    upload.mutate(file, {
      onSuccess: (uploaded) => onChange(uploaded.url),
    });
  }

  return (
    <div className={className}>
      <div className="mb-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode('url')}
          aria-pressed={mode === 'url'}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
            mode === 'url'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Link2 className="size-4" />
          Colar URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          aria-pressed={mode === 'upload'}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
            mode === 'upload'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Upload className="size-4" />
          Enviar arquivo
        </button>
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={urlPlaceholder}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        />
      ) : (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = '';
            }}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
          />
          {upload.isPending && (
            <p className="inline-flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="size-4 animate-spin" />
              Enviando imagem…
            </p>
          )}
          {upload.isError && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {getErrorMessage(upload.error)}
            </p>
          )}
          {upload.isSuccess && value && (
            <p className="text-sm text-green-700">
              Imagem enviada: <span className="font-mono">{value}</span>
            </p>
          )}
        </div>
      )}

      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}