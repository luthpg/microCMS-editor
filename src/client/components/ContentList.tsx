import {
  Calendar,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import type * as React from 'react';
import {
  formatDate,
  getItemThumbnail,
  getItemTitle,
} from '@/client/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContentItem } from '@/types';

interface Props {
  items: ContentItem[];
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectItem: (item: ContentItem) => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => void;
  onOpenCreate: () => void;
}

export const ContentList: React.FC<Props> = ({
  items,
  totalCount,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onSelectItem,
  onDeleteItem,
  onOpenCreate,
}) => {
  if (loading && items.length === 0) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900"
          >
            <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3 dark:bg-slate-800">
          <FileText className="h-7 w-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          コンテンツがありません
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4 max-w-[240px]">
          まだ記事やレコードが作成されていないか、検索条件に一致しません。
        </p>
        <Button onClick={onOpenCreate} className="gap-1 rounded-xl">
          <Plus className="h-4 w-4" />
          新規コンテンツを作成
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2.5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
      {items.map((item) => {
        const title = getItemTitle(item);
        const thumb = getItemThumbnail(item);
        const isDraft = !item.publishedAt;

        return (
          <Card
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all active:scale-[0.99] active:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:active:bg-slate-800/80"
          >
            {/* サムネイル画像（ある場合） */}
            {thumb ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <img
                  src={thumb}
                  alt={title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
            )}

            {/* 本文情報 */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant={isDraft ? 'draft' : 'success'}
                  className="text-[10px] h-4.5 px-2"
                >
                  {isDraft ? '下書き' : '公開中'}
                </Badge>
                <span className="text-[10px] text-slate-400 font-mono truncate">
                  ID: {item.id}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {title}
              </h4>

              <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(item.updatedAt || item.createdAt)}</span>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => onDeleteItem(item.id, e)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg active:bg-red-50 transition-colors"
                title="削除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>
          </Card>
        );
      })}

      {/* ページネーション: さらに読み込む */}
      {hasMore && (
        <div className="pt-2 text-center">
          <Button
            variant="outline"
            disabled={loadingMore}
            onClick={onLoadMore}
            className="w-full rounded-xl py-5 text-xs text-slate-600 dark:text-slate-300"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                読み込み中...
              </>
            ) : (
              `さらに読み込む (全${totalCount}件中 ${items.length}件表示)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
