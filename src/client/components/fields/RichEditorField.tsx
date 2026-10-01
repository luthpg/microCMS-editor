import DOMPurify from 'dompurify';
import { Code, Eye, Heading2, Heading3, Link as LinkIcon } from 'lucide-react';
import type * as React from 'react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { FieldSchema } from '@/types';

interface Props {
  field: FieldSchema;
  value: string;
  onChange: (value: string) => void;
}

export const RichEditorField: React.FC<Props> = ({
  field,
  value,
  onChange,
}) => {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSnippet = (before: string, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selection = currentText.substring(start, end);
    const replacement = `${before}${selection || 'テキスト'}${after}`;

    const newText =
      currentText.substring(0, start) +
      replacement +
      currentText.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selection ? selection.length : 4),
      );
    }, 50);
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
          {field.fieldId} ({field.kind})
        </span>
      </div>
      {field.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {field.description}
        </p>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'edit' | 'preview')}>
        <div className="flex items-center justify-between">
          {/* モバイル向けクイックHTML挿入ツールバー */}
          {tab === 'edit' && (
            <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => insertSnippet('<h2>', '</h2>')}
              >
                <Heading2 className="h-3 w-3 mr-0.5" /> H2
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => insertSnippet('<h3>', '</h3>')}
              >
                <Heading3 className="h-3 w-3 mr-0.5" /> H3
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => insertSnippet('<p>', '</p>')}
              >
                P
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => insertSnippet('<strong>', '</strong>')}
              >
                B
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() =>
                  insertSnippet('<a href="https://" target="_blank">', '</a>')
                }
              >
                <LinkIcon className="h-3 w-3" />
              </Button>
            </div>
          )}

          <TabsList className="ml-auto h-8">
            <TabsTrigger value="edit" className="h-6 px-2.5 text-xs gap-1">
              <Code className="h-3 w-3" /> エディタ
            </TabsTrigger>
            <TabsTrigger value="preview" className="h-6 px-2.5 text-xs gap-1">
              <Eye className="h-3 w-3" /> プレビュー
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="mt-1">
          <Textarea
            ref={textareaRef}
            id={field.fieldId}
            placeholder="HTMLまたはテキストを入力..."
            rows={8}
            className="font-mono text-base leading-relaxed"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-1">
          <div className="min-h-[180px] max-h-[300px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 prose-preview dark:border-slate-800 dark:bg-slate-900/60">
            {value ? (
              <div
                /* biome-ignore lint/security/noDangerouslySetInnerHtml: microCMS rich editor HTML preview (sanitized) */
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(value),
                }}
              />
            ) : (
              <p className="text-xs text-slate-400 italic">プレビューなし</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
