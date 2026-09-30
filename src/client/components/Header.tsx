import { ChevronDown, Plus, RefreshCw, Search, Settings } from 'lucide-react';
import type * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  domain: string;
  endpoint: string;
  isObject: boolean;
  totalCount: number;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenCreate: () => void;
}

export const Header: React.FC<Props> = ({
  domain,
  endpoint,
  isObject,
  totalCount,
  loading,
  searchQuery,
  onSearchChange,
  onRefresh,
  onOpenSettings,
  onOpenCreate,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
      {/* 上段：ブランド＆アクション */}
      <div className="flex h-14 items-center justify-between px-4">
        {/* 左側：エンドポイント情報 */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-left active:opacity-75 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-xs">
            m
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {endpoint || '未設定'}
              </span>
              <Badge
                variant={isObject ? 'secondary' : 'default'}
                className="h-4 px-1 text-[9px] font-semibold"
              >
                {isObject ? 'Object' : `${totalCount}件`}
              </Badge>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
              {domain ? `${domain}.microcms.io` : 'タップして設定'}
            </p>
          </div>
        </button>

        {/* 右側：ボタン群 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onRefresh}
            disabled={loading}
            title="再読み込み"
            className="text-slate-600 dark:text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="iconSm"
            onClick={onOpenSettings}
            title="設定"
            className="text-slate-600 dark:text-slate-300"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {!isObject && endpoint && (
            <Button
              size="sm"
              onClick={onOpenCreate}
              className="ml-1 h-8 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5 mr-0.5" />
              追加
            </Button>
          )}
        </div>
      </div>

      {/* 下段：検索バー（リストAPIの場合のみ） */}
      {!isObject && endpoint && (
        <div className="px-4 pb-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="タイトルやIDで検索..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 rounded-xl bg-slate-100/80 pl-8 text-xs border-transparent focus:bg-white dark:bg-slate-800/80 dark:focus:bg-slate-900"
            />
          </div>
        </div>
      )}
    </header>
  );
};
