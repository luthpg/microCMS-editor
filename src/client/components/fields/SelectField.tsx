import { ChevronDown, ListFilter } from 'lucide-react';
import type * as React from 'react';
import { useMemo } from 'react';
import type { FieldSchema } from '@/types';

interface Props {
  field: FieldSchema;
  value: string | string[] | null | undefined;
  onChange: (value: string[]) => void;
}

interface OptionItem {
  value: string;
  label: string;
}

export const SelectField: React.FC<Props> = ({ field, value, onChange }) => {
  // 様々な形式の選択肢（selectItems, items, options 等）を安全に抽出・正規化
  const options: OptionItem[] = useMemo(() => {
    const rawList =
      field.selectItems ??
      (field as Record<string, unknown>).items ??
      (field as Record<string, unknown>).options ??
      (
        (field as Record<string, unknown>).selectRule as
          | Record<string, unknown>
          | undefined
      )?.options ??
      (
        (field as Record<string, unknown>).selectRule as
          | Record<string, unknown>
          | undefined
      )?.items;

    if (!Array.isArray(rawList)) return [];

    return rawList.map((item): OptionItem => {
      if (typeof item === 'string') {
        return { value: item, label: item };
      }
      if (item != null && typeof item === 'object') {
        const valObj = item as Record<string, unknown>;
        const val =
          valObj.value != null
            ? String(valObj.value)
            : valObj.id != null
              ? String(valObj.id)
              : valObj.name != null
                ? String(valObj.name)
                : '';
        const lbl =
          valObj.label != null
            ? String(valObj.label)
            : valObj.name != null
              ? String(valObj.name)
              : val;
        return { value: val, label: lbl };
      }
      return { value: String(item), label: String(item) };
    });
  }, [field]);

  // 複数選択（多択）の判定: selectRule.multiple, field.multiple, field.isMultiple 等に対応
  const isMultiple = useMemo(() => {
    if (field.multiple === true || field.isMultiple === true) return true;
    const rule = field.selectRule;
    if (rule === 'multiple' || rule === 'multi') return true;
    if (rule != null && typeof rule === 'object') {
      const ruleObj = rule as Record<string, unknown>;
      if (ruleObj.multiple === true || ruleObj.isMultiple === true) return true;
    }
    // 既存データが複数要素の配列なら多択とみなす
    if (Array.isArray(value) && value.length > 1) return true;
    return false;
  }, [field, value]);

  // 単一選択時も microCMS の仕様に合わせて配列 (string[]) として返却
  const handleSingleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange(val ? [val] : []);
  };

  const handleMultipleToggle = (itemVal: string) => {
    const currentList = Array.isArray(value)
      ? [...value]
      : typeof value === 'string' && value
        ? [value]
        : [];
    const index = currentList.indexOf(itemVal);
    if (index > -1) {
      currentList.splice(index, 1);
    } else {
      currentList.push(itemVal);
    }
    onChange(currentList);
  };

  const stringValue = Array.isArray(value)
    ? (value[0] ?? '')
    : typeof value === 'string'
      ? value
      : '';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={field.fieldId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
        >
          <ListFilter className="h-3.5 w-3.5 text-blue-500" />
          {field.name}
          {field.required && (
            <span className="ml-0.5 text-red-500 font-bold">*</span>
          )}
        </label>
        <span className="text-[10px] text-slate-400 font-mono">
          {field.fieldId} ({options.length}項目)
        </span>
      </div>

      {field.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {field.description}
        </p>
      )}

      {isMultiple ? (
        // 複数選択用のチップ選択UI
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5 pt-1">
            {options.map((opt) => {
              const isSelected =
                Array.isArray(value) && value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleMultipleToggle(opt.value)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                      : 'border border-slate-200 bg-white text-slate-700 active:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {opt.label || opt.value}
                </button>
              );
            })}
          </div>
          {options.length === 0 && (
            <p className="text-xs text-slate-400 italic py-1">
              選択肢が設定されていません
            </p>
          )}
        </div>
      ) : (
        // 単一選択用のプルダウン（ネイティブセレクト）
        <div className="relative">
          <select
            id={field.fieldId}
            value={stringValue}
            onChange={handleSingleChange}
            className="flex h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-10 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">-- 選択してください --</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label || opt.value}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );
};
