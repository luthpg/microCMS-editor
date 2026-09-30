import { AlertTriangle, Settings as SettingsIcon } from 'lucide-react';
import type * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMicroCMS } from '@/client/hooks/use-microcms';
import { useSettings } from '@/client/hooks/use-settings';
import { Button } from '@/components/ui/button';
import type { ApiSchema, ContentItem, SaveStatus } from '@/types';
import { ContentList } from './ContentList';
import { EditorDrawer } from './EditorDrawer';
import { Header } from './Header';
import { ObjectView } from './ObjectView';
import { SettingsDrawer } from './SettingsDrawer';
import { Toast, type ToastData } from './Toast';

export const App: React.FC = () => {
  const {
    domain,
    apiKey,
    endpoint,
    theme,
    toggleTheme,
    isConfigured,
    saveSettings,
  } = useSettings();

  const {
    loading,
    error: apiError,
    fetchApis,
    fetchSchema,
    fetchContents,
    saveContent,
    deleteContent,
    uploadMedia,
    fetchRelationOptions,
  } = useMicroCMS(domain, apiKey);

  // 画面状態
  const [isSettingsOpen, setIsSettingsOpen] = useState(!isConfigured);
  const [schema, setSchema] = useState<ApiSchema>({
    apiType: 'list',
    fields: [],
  });
  const [items, setItems] = useState<ContentItem[]>([]);
  const [singleObject, setSingleObject] = useState<ContentItem | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastData | null>(null);

  // ページネーション状態
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 30;

  // エディタ状態
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ id: Date.now().toString(), type, message });
    },
    [],
  );

  // データの読み込み (offset 0 からリセットして取得)
  const loadData = useCallback(
    async (targetEndpoint = endpoint) => {
      if (!domain || !apiKey || !targetEndpoint) {
        setIsSettingsOpen(true);
        return;
      }

      // 1. スキーマを取得
      const schemaData = await fetchSchema(targetEndpoint);
      if (schemaData) {
        setSchema(schemaData);

        // 2. コンテンツを取得
        const isObj = schemaData.apiType === 'object';
        const contentRes = await fetchContents(targetEndpoint, isObj, 0, limit);

        setItems(contentRes.items);
        setOffset(contentRes.items.length);
        setSingleObject(contentRes.singleObject);
        setTotalCount(contentRes.totalCount);
      }
    },
    [domain, apiKey, endpoint, fetchSchema, fetchContents],
  );

  // さらに読み込む
  const handleLoadMore = async () => {
    if (loadingMore || items.length >= totalCount) return;
    setLoadingMore(true);
    try {
      const contentRes = await fetchContents(endpoint, false, offset, limit);
      setItems((prev) => [...prev, ...contentRes.items]);
      setOffset((prev) => prev + contentRes.items.length);
    } finally {
      setLoadingMore(false);
    }
  };

  // 初回マウント時、または設定変更時に読み込み
  useEffect(() => {
    if (domain && apiKey && endpoint) {
      loadData(endpoint);
    }
  }, [domain, apiKey, endpoint, loadData]);

  // アイテム選択（編集）
  const handleSelectItem = (item: ContentItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  // 新規作成
  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  // 単一オブジェクトの編集
  const handleOpenObjectEdit = () => {
    setEditingItem(singleObject);
    setIsEditorOpen(true);
  };

  // 保存処理
  const handleSave = async (params: {
    endpoint: string;
    isObject: boolean;
    contentId?: string;
    customId?: string;
    data: Record<string, unknown>;
    status: SaveStatus;
  }) => {
    const res = await saveContent(params);
    if (res.success) {
      showToast(
        params.contentId
          ? 'コンテンツを更新しました'
          : 'コンテンツを新規作成しました',
      );
      loadData(endpoint);
      return { success: true };
    }
    showToast(res.error || '保存に失敗しました', 'error');
    return { success: false, error: res.error };
  };

  // 削除処理
  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `ID:「${id}」を削除してもよろしいですか？\nこの操作は取り消せません。`,
      )
    ) {
      return;
    }
    const res = await deleteContent(endpoint, id);
    if (res.success) {
      showToast('コンテンツを削除しました');
      loadData(endpoint);
    } else {
      showToast(res.error || '削除に失敗しました', 'error');
    }
  };

  // 検索フィルタリング（フロントエンド側）
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => {
      if (item.id?.toLowerCase().includes(q)) return true;
      for (const [key, val] of Object.entries(item)) {
        if (
          !['createdAt', 'updatedAt', 'publishedAt', 'revisedAt'].includes(
            key,
          ) &&
          typeof val === 'string' &&
          val.toLowerCase().includes(q)
        ) {
          return true;
        }
      }
      return false;
    });
  }, [items, searchQuery]);

  const isObject = schema.apiType === 'object';
  const hasMore = !isObject && items.length < totalCount;

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-900 select-none overflow-hidden font-sans dark:bg-slate-950 dark:text-slate-100">
      {/* ヘッダー */}
      <Header
        domain={domain}
        endpoint={endpoint}
        isObject={isObject}
        totalCount={totalCount}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={() => loadData(endpoint)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCreate={handleOpenCreate}
      />

      {/* エラーバー表示 */}
      {apiError && (
        <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400 border-b border-red-500/20">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="flex-1 truncate">{apiError}</p>
          <button
            type="button"
            onClick={() => loadData(endpoint)}
            className="text-[11px] font-semibold underline"
          >
            再試行
          </button>
        </div>
      )}

      {/* メインコンテンツ領域（スクロール可） */}
      <main className="flex-1 overflow-y-auto">
        {!isConfigured ? (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[70vh]">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600/10 text-blue-600 mb-4 dark:bg-blue-950/60 dark:text-blue-400">
              <SettingsIcon className="h-8 w-8" />
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              microCMSの接続設定が必要です
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-5 max-w-[260px]">
              サービスID、APIキー、エンドポイントを設定して microCMS
              のデータを同期しましょう。
            </p>
            <Button
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
            >
              設定を開く
            </Button>
          </div>
        ) : isObject ? (
          <ObjectView
            schema={schema}
            objectData={singleObject}
            onOpenEdit={handleOpenObjectEdit}
          />
        ) : (
          <ContentList
            items={filteredItems}
            totalCount={totalCount}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onSelectItem={handleSelectItem}
            onDeleteItem={handleDeleteItem}
            onOpenCreate={handleOpenCreate}
          />
        )}
      </main>

      {/* エディタ用ボトムシート */}
      <EditorDrawer
        isOpen={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        schema={schema}
        item={editingItem}
        endpoint={endpoint}
        isObject={isObject}
        onSave={handleSave}
        onUpload={uploadMedia}
        fetchRelationOptions={fetchRelationOptions}
      />

      {/* 設定用ドロワー */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={{ domain, apiKey, endpoint }}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSave={(newSettings) => {
          saveSettings(newSettings);
        }}
        onFetchApis={fetchApis}
      />

      {/* トースト通知 */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};
