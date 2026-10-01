import { Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import type * as React from 'react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FieldSchema, MediaValue, UploadMediaResult } from '@/types';

interface Props {
  field: FieldSchema;
  value: MediaValue | string | null | undefined;
  onChange: (value: MediaValue | string | null) => void;
  onUpload?: (file: File) => Promise<UploadMediaResult>;
}

export const MediaField: React.FC<Props> = ({
  field,
  value,
  onChange,
  onUpload,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUrl =
    typeof value === 'string'
      ? value
      : value && typeof value === 'object' && 'url' in value
        ? (value as MediaValue).url
        : '';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    try {
      setUploading(true);
      setUploadError(null);
      const res = await onUpload(file);
      if ('error' in res) {
        setUploadError(res.error);
      } else if (res.url) {
        if (typeof value === 'object' && value !== null) {
          onChange({ ...(value as MediaValue), url: res.url });
        } else {
          onChange({ url: res.url });
        }
      }
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'アップロードに失敗しました',
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlChange = (url: string) => {
    setUploadError(null);
    if (!url) {
      onChange(null);
      return;
    }
    if (typeof value === 'object' && value !== null) {
      onChange({ ...(value as MediaValue), url });
    } else {
      onChange({ url });
    }
  };

  const handleClear = () => {
    setUploadError(null);
    onChange(null);
  };

  return (
    <div className="space-y-2">
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

      {/* プレビュー表示 */}
      {currentUrl ? (
        <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900 max-h-48 flex items-center justify-center">
          <img
            src={currentUrl}
            alt={field.name}
            className="max-h-48 w-full object-contain"
          />
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="destructive"
              size="iconSm"
              onClick={handleClear}
              title="画像を削除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <ImageIcon className="h-8 w-8 text-slate-400 mb-2" />
          <p className="text-xs text-slate-500 mb-3">
            画像が選択されていません
          </p>
          {onUpload && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  アップロード中...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  画像をアップロード
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {uploadError && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {uploadError}
        </p>
      )}

      {/* ファイル選択インプット（非表示） */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* URL直接入力欄 & アップロード切り替え */}
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="画像URL (https://...)"
          value={currentUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="text-base"
        />
        {onUpload && currentUrl && (
          <Button
            type="button"
            variant="outline"
            size="default"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            title="別の画像をアップロード"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
