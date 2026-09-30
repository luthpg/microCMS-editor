import type * as React from 'react';
import type { ContentItem, FieldSchema, MediaValue } from '@/types';
import { BooleanField } from './BooleanField';
import { DateField } from './DateField';
import { MediaField } from './MediaField';
import { NumberField } from './NumberField';
import { RelationField } from './RelationField';
import { RichEditorField } from './RichEditorField';
import { SelectField } from './SelectField';
import { TextAreaField } from './TextAreaField';
import { TextField } from './TextField';

interface Props {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  onUpload?: (file: File) => Promise<{ url: string } | null>;
  fetchRelationOptions?: (endpoint: string) => Promise<ContentItem[]>;
}

export const FieldRenderer: React.FC<Props> = ({
  field,
  value,
  onChange,
  onUpload,
  fetchRelationOptions,
}) => {
  switch (field.kind) {
    case 'text':
      return (
        <TextField
          field={field}
          value={(value as string) ?? ''}
          onChange={onChange}
        />
      );

    case 'textArea':
      return (
        <TextAreaField
          field={field}
          value={(value as string) ?? ''}
          onChange={onChange}
        />
      );

    case 'richEditor':
    case 'richEditorV2':
      return (
        <RichEditorField
          field={field}
          value={(value as string) ?? ''}
          onChange={onChange}
        />
      );

    case 'number':
      return (
        <NumberField
          field={field}
          value={value as number}
          onChange={onChange}
        />
      );

    case 'boolean':
      return (
        <BooleanField
          field={field}
          value={Boolean(value)}
          onChange={onChange}
        />
      );

    case 'date':
      return (
        <DateField
          field={field}
          value={(value as string) ?? ''}
          onChange={onChange}
        />
      );

    case 'media':
      return (
        <MediaField
          field={field}
          value={value as MediaValue | string}
          onChange={onChange}
          onUpload={onUpload}
        />
      );

    case 'select':
    case 'selectRule':
      return (
        <SelectField
          field={field}
          value={value as string | string[]}
          onChange={onChange}
        />
      );

    case 'relation':
      return (
        <RelationField
          field={field}
          value={value as ContentItem | string}
          onChange={onChange}
          fetchOptions={fetchRelationOptions}
        />
      );

    case 'repeater':
      return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold">{field.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              repeater (編集対象外)
            </span>
          </div>
          <p className="text-slate-500 mb-2">
            ※ 繰り返しフィールドは現在モバイル閲覧のみ対応しています
          </p>
          <pre className="max-h-28 overflow-auto rounded bg-white p-2 text-[10px] dark:bg-slate-950">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      );

    default:
      // 未知または未対応フィールドのフォールバック
      return (
        <div className="space-y-1.5">
          <label
            htmlFor={field.fieldId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {field.name} ({field.kind})
          </label>
          <input
            id={field.fieldId}
            type="text"
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-base shadow-sm dark:border-slate-800 dark:bg-slate-900"
            value={
              typeof value === 'string' ? value : JSON.stringify(value ?? '')
            }
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
};
