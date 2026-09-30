import type * as React from 'react';
import { Input } from '@/components/ui/input';
import type { FieldSchema } from '@/types';

interface Props {
  field: FieldSchema;
  value: string;
  onChange: (value: string) => void;
}

export const DateField: React.FC<Props> = ({ field, value, onChange }) => {
  // ISO文字列から datetime-local 入力用形式 (YYYY-MM-DDTHH:mm) に変換
  const formatForInput = (isoStr: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      if (Number.isNaN(d.getTime())) return '';
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      onChange('');
      return;
    }
    try {
      const d = new Date(val);
      onChange(d.toISOString());
    } catch {
      onChange(val);
    }
  };

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
          {field.fieldId}
        </span>
      </div>
      {field.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {field.description}
        </p>
      )}
      <Input
        id={field.fieldId}
        type="datetime-local"
        value={formatForInput(value)}
        onChange={handleChange}
      />
    </div>
  );
};
