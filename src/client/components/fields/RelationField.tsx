import { ExternalLink, Loader2, X } from 'lucide-react';
import type * as React from 'react';
import { useEffect, useState } from 'react';
import { getItemTitle } from '@/client/utils/helpers';
import { Button } from '@/components/ui/button';
import type { ContentItem, FieldSchema } from '@/types';

interface Props {
  field: FieldSchema;
  value: ContentItem | string | null | undefined;
  onChange: (value: string | null) => void;
  fetchOptions?: (endpoint: string) => Promise<ContentItem[]>;
}

export const RelationField: React.FC<Props> = ({
  field,
  value,
  onChange,
  fetchOptions,
}) => {
  const [options, setOptions] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const targetEndpoint =
    field.referenceApi?.id || field.referencedApiEndpoint || '';

  const selectedId =
    typeof value === 'string'
      ? value
      : value && typeof value === 'object' && 'id' in value
        ? (value as ContentItem).id
        : '';

  useEffect(() => {
    if (!targetEndpoint || !fetchOptions) return;
    let isMounted = true;
    setLoading(true);
    fetchOptions(targetEndpoint)
      .then((items) => {
        if (isMounted) setOptions(items);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [targetEndpoint, fetchOptions]);

  const selectedItem =
    options.find((item) => item.id === selectedId) ||
    (typeof value === 'object' && value !== null
      ? (value as ContentItem)
      : null);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={field.fieldId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {field.name}
          {field.required && (
            <span className="ml-1 text-red-500 font-bold">*</span>
          )}
        </label>
        <span className="text-[10px] text-slate-400 font-mono">
          {field.fieldId} ({targetEndpoint || '参照先未定義'})
        </span>
      </div>
      {field.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {field.description}
        </p>
      )}

      {selectedId ? (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 truncate">
              {getItemTitle(selectedItem)}
            </p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
              ID: {selectedId}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            onClick={() => onChange(null)}
            title="参照を解除"
          >
            <X className="h-4 w-4 text-slate-500 hover:text-red-500" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <select
            id={field.fieldId}
            value=""
            disabled={loading || !targetEndpoint}
            onChange={(e) => onChange(e.target.value || null)}
            className="flex h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">
              {loading
                ? '候補を読み込み中...'
                : targetEndpoint
                  ? `${targetEndpoint} から選択...`
                  : '参照先が指定されていません'}
            </option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {getItemTitle(opt)} (ID: {opt.id})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
