import { Edit3 } from 'lucide-react';
import type * as React from 'react';
import { formatDate } from '@/client/utils/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiSchema, ContentItem } from '@/types';

interface Props {
  schema: ApiSchema;
  objectData: ContentItem | null;
  onOpenEdit: () => void;
}

export const ObjectView: React.FC<Props> = ({
  schema,
  objectData,
  onOpenEdit,
}) => {
  return (
    <div className="p-4 space-y-4 pb-24">
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">
              オブジェクト設定
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              最終更新: {formatDate(objectData?.updatedAt as string)}
            </p>
          </div>
          <Button
            size="sm"
            onClick={onOpenEdit}
            className="gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Edit3 className="h-4 w-4" />
            編集する
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          {schema.fields.map((field) => {
            const val = objectData ? objectData[field.fieldId] : null;

            return (
              <div
                key={field.fieldId}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/60 dark:bg-slate-950/40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {field.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {field.kind}
                  </span>
                </div>

                <div className="text-sm text-slate-900 dark:text-slate-100 break-words">
                  {val == null ? (
                    <span className="text-xs text-slate-400 italic">
                      未設定
                    </span>
                  ) : typeof val === 'object' ? (
                    'url' in val ? (
                      <div className="mt-1">
                        <img
                          src={(val as { url: string }).url}
                          alt={field.name}
                          className="max-h-36 rounded-lg object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        />
                      </div>
                    ) : (
                      <pre className="max-h-32 overflow-auto rounded bg-slate-100 p-2 text-xs font-mono dark:bg-slate-900">
                        {JSON.stringify(val, null, 2)}
                      </pre>
                    )
                  ) : field.kind === 'richEditor' ||
                    field.kind === 'richEditorV2' ? (
                    <div
                      className="max-h-36 overflow-auto rounded bg-white p-2.5 text-xs prose-preview border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                      /* biome-ignore lint/security/noDangerouslySetInnerHtml: microCMS preview */
                      dangerouslySetInnerHTML={{ __html: String(val) }}
                    />
                  ) : typeof val === 'boolean' ? (
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                        val
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {val ? '有効 (true)' : '無効 (false)'}
                    </span>
                  ) : (
                    <span>{String(val)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
