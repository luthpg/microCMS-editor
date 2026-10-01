import { Check, Loader2, Sparkles } from 'lucide-react';
import type * as React from 'react';
import { useEffect, useState } from 'react';
import { getItemTitle } from '@/client/utils/helpers';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import type {
  ApiSchema,
  ContentItem,
  SaveStatus,
  UploadMediaResult,
} from '@/types';
import { FieldRenderer } from './fields/FieldRenderer';

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  schema: ApiSchema;
  item: ContentItem | null; // nullなら新規作成
  endpoint: string;
  isObject: boolean;
  onSave: (params: {
    endpoint: string;
    isObject: boolean;
    contentId?: string;
    customId?: string;
    data: Record<string, unknown>;
    status: SaveStatus;
  }) => Promise<{ success: boolean; error?: string }>;
  onUpload?: (file: File) => Promise<UploadMediaResult>;
  fetchRelationOptions?: (endpoint: string) => Promise<ContentItem[]>;
}

export const EditorDrawer: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  schema,
  item,
  endpoint,
  isObject,
  onSave,
  onUpload,
  fetchRelationOptions,
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [customId, setCustomId] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // item や 表示状態が変わったら formData を初期化
  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({ ...item });
        setCustomId(item.id || '');
      } else {
        setFormData({});
        setCustomId('');
      }
      setErrorMsg(null);
    }
  }, [item, isOpen]);

  const handleFieldChange = (fieldId: string, val: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const handleSave = async (status: SaveStatus) => {
    setErrorMsg(null);
    setSaving(true);

    // 必須チェックなど
    for (const field of schema.fields) {
      if (field.required) {
        const val = formData[field.fieldId];
        if (val == null || val === '') {
          setErrorMsg(`「${field.name}」は必須項目です`);
          setSaving(false);
          return;
        }
      }
    }

    const payload: Record<string, unknown> = {};
    const normalizeValue = (value: unknown, key: 'id' | 'url'): unknown => {
      if (Array.isArray(value)) {
        return value.map((entry) => normalizeValue(entry, key));
      }
      if (value != null && typeof value === 'object' && key in value) {
        return (value as Record<string, unknown>)[key];
      }
      return value;
    };

    for (const field of schema.fields) {
      if (field.fieldId in formData) {
        const val = formData[field.fieldId];
        if (field.kind === 'relation') {
          payload[field.fieldId] = normalizeValue(val, 'id');
        } else if (field.kind === 'media') {
          payload[field.fieldId] = normalizeValue(val, 'url');
        } else if (field.kind === 'select' || field.kind === 'selectRule') {
          // microCMS はセレクトフィールドに常に配列 (string[]) を要求
          if (Array.isArray(val)) {
            payload[field.fieldId] = val.map(String);
          } else if (val != null && val !== '') {
            payload[field.fieldId] = [String(val)];
          } else {
            payload[field.fieldId] = [];
          }
        } else {
          payload[field.fieldId] = val;
        }
      }
    }

    const res = await onSave({
      endpoint,
      isObject,
      contentId: item?.id,
      customId: item ? undefined : customId,
      data: payload,
      status,
    });

    setSaving(false);

    if (res.success) {
      onOpenChange(false);
    } else {
      setErrorMsg(res.error || '保存に失敗しました');
    }
  };

  const isEditing = Boolean(item);
  const titleText = isObject
    ? 'コンテンツを編集'
    : isEditing
      ? `「${getItemTitle(item)}」を編集`
      : '新規コンテンツ作成';

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent className="max-h-[94dvh] flex flex-col">
        {/* シートヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-slate-800 shrink-0">
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              キャンセル
            </Button>
          </DrawerClose>
          <div className="text-center px-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
              {titleText}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">{endpoint}</p>
          </div>
          <Button
            size="sm"
            disabled={saving}
            onClick={() => handleSave('')}
            className="h-8 px-3 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium shrink-0"
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            公開
          </Button>
        </div>

        {/* エラーアラート */}
        {errorMsg && (
          <div className="mx-4 mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-600 border border-red-200 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400 shrink-0">
            {errorMsg}
          </div>
        )}

        {/* フォーム本体（スクロール領域） */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-8">
          {/* 新規作成時のカスタムID入力欄（リスト形式のみ） */}
          {!isObject && !isEditing && (
            <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80 dark:bg-slate-900/60 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="custom_content_id"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  コンテンツ ID (任意)
                </label>
                <span className="text-[10px] text-slate-400">
                  未入力時は自動採番
                </span>
              </div>
              <Input
                id="custom_content_id"
                placeholder="例: article-01 (半角英数・記号)"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                className="bg-white dark:bg-slate-950 font-mono text-base"
              />
            </div>
          )}

          {/* 各フィールド描画 */}
          {schema.fields.length > 0 ? (
            schema.fields.map((field) => (
              <FieldRenderer
                key={field.fieldId}
                field={field}
                value={formData[field.fieldId]}
                onChange={(val) => handleFieldChange(field.fieldId, val)}
                onUpload={onUpload}
                fetchRelationOptions={fetchRelationOptions}
              />
            ))
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Sparkles className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">
                フィールド定義が見つかりません
              </p>
              <p className="text-xs mt-1">
                APIの管理権限、またはスキーマ設定をご確認ください
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-2 border-t border-slate-100 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur-xs shrink-0">
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="flex-1"
          >
            下書き保存
          </Button>
          <Button
            disabled={saving}
            onClick={() => handleSave('')}
            className="flex-1 gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            公開
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
