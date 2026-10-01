import type * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import type { FieldSchema } from '@/types';

interface Props {
  field: FieldSchema;
  value: string;
  onChange: (value: string) => void;
}

export const TextAreaField: React.FC<Props> = ({ field, value, onChange }) => {
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
      <Textarea
        id={field.fieldId}
        placeholder={`${field.name}を入力`}
        rows={4}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
