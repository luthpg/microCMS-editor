import { Check, Key, Layers, Moon, RefreshCw, Server, Sun } from 'lucide-react';
import type * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { ApiListItem, AppSettings } from '@/types';

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSave: (settings: AppSettings) => void;
  onFetchApis: () => Promise<ApiListItem[]>;
}

export const SettingsDrawer: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  settings,
  theme,
  onToggleTheme,
  onSave,
  onFetchApis,
}) => {
  const [domain, setDomain] = useState(settings.domain);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [endpoint, setEndpoint] = useState(settings.endpoint);
  const [apiList, setApiList] = useState<ApiListItem[]>([]);
  const [loadingApis, setLoadingApis] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDomain(settings.domain);
      setApiKey(settings.apiKey);
      setEndpoint(settings.endpoint);
    }
  }, [settings, isOpen]);

  // ドメインとAPIキーが入っていれば、API一覧を取得してみる
  const loadApiList = useCallback(async () => {
    if (!domain || !apiKey) return;
    setLoadingApis(true);
    try {
      const list = await onFetchApis();
      setApiList(list);
    } finally {
      setLoadingApis(false);
    }
  }, [domain, apiKey, onFetchApis]);

  useEffect(() => {
    if (isOpen && domain && apiKey) {
      loadApiList();
    }
  }, [isOpen, domain, apiKey, loadApiList]);

  const handleSave = () => {
    onSave({ domain, apiKey, endpoint });
    onOpenChange(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92dvh] flex flex-col">
        <DrawerHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <DrawerTitle className="text-base font-bold">
            microCMS 接続設定
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* ドメイン入力 */}
          <div className="space-y-1.5">
            <label
              htmlFor="settings_domain"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <Server className="h-3.5 w-3.5 text-blue-500" />
              サービスID / ドメイン
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="settings_domain"
                placeholder="例: your-service"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <span className="text-xs text-slate-400 shrink-0">
                .microcms.io
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              microCMSダッシュボードのURLサブドメインを入力
            </p>
          </div>

          {/* APIキー入力 */}
          <div className="space-y-1.5">
            <label
              htmlFor="settings_api_key"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <Key className="h-3.5 w-3.5 text-amber-500" />
              APIキー (X-MICROCMS-API-KEY)
            </label>
            <Input
              id="settings_api_key"
              type="password"
              placeholder="APIキーを貼り付け"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-[11px] text-slate-400">
              コンテンツの読み取り・書き込み権限を持つキーを使用
            </p>
          </div>

          {/* APIエンドポイント選択 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="settings_endpoint"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Layers className="h-3.5 w-3.5 text-emerald-500" />
                対象エンドポイント
              </label>
              {domain && apiKey && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={loadingApis}
                  onClick={loadApiList}
                  className="h-6 px-2 text-[11px] gap-1 text-blue-600"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${loadingApis ? 'animate-spin' : ''}`}
                  />
                  API一覧を取得
                </Button>
              )}
            </div>

            {/* API一覧が取得できている場合はバッジ/リストでタップ選択 */}
            {apiList.length > 0 && (
              <div className="space-y-1 rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-[10px] text-slate-400 px-1 mb-1">
                  登録されているAPIからタップで選択:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {apiList.map((item) => {
                    const isSelected = endpoint === item.apiId;
                    return (
                      <button
                        key={item.apiId}
                        type="button"
                        onClick={() => setEndpoint(item.apiId)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                      >
                        <span>{item.apiName || item.apiId}</span>
                        <Badge
                          variant={
                            item.type === 'page' ? 'secondary' : 'outline'
                          }
                          className="px-1 py-0 text-[9px] h-4"
                        >
                          {item.type === 'page' ? 'オブジェクト' : 'リスト'}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Input
              id="settings_endpoint"
              placeholder="エンドポイント名 (例: blogs, news)"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </div>

          {/* 外観（ダークモード） */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4 text-indigo-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  ダークモード
                </p>
                <p className="text-[10px] text-slate-400">
                  {theme === 'dark' ? 'ダーク' : 'ライト'} 表示中
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={onToggleTheme}
            />
          </div>
        </div>

        {/* フッター */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800 flex gap-2">
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">
              閉じる
            </Button>
          </DrawerClose>
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            <Check className="h-4 w-4" />
            設定を保存
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
