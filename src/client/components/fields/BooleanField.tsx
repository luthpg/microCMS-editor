import type * as React from 'react';
import { Switch } from '@/components/ui/switch';
import type { FieldSchema } from '@/types';

interface Props {
  field: FieldSchema;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const BooleanField: React.FC<Props> = ({ field, value, onChange }) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-0.5 pr-4">
        <label
          htmlFor={field.fieldId}
          className="text-xs font-semibold text-slate-800 dark:text-slate-200"
        >
          {field.name}
          {field.required && (
            <span className="ml-1 text-red-500 font-bold">*</span>
          )}
        </label>
        {field.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {field.description}
          </p>
        )}
        <p className="text-[10px] text-slate-400 font-mono">{field.fieldId}</p>
      </div>
      <Switch
        id={field.fieldId}
        checked={Boolean(value)}
        onCheckedChange={onChange}
      />
    </div>
  );
};
