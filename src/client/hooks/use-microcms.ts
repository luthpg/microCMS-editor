import { hc } from 'hono/client';
import { useCallback, useState } from 'react';
import type { AppType } from '@/index';
import type {
  ApiListItem,
  ApiSchema,
  ContentItem,
  MicroCMSListResponse,
} from '@/types';

const rpc = hc<AppType>('/');

export function useMicroCMS(domain: string, apiKey: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback(
    () => ({
      'x-microcms-domain': domain.trim(),
      'x-microcms-key': apiKey.trim(),
    }),
    [domain, apiKey],
  );

  /**
   * API一覧を取得 (Management API)
   */
  const fetchApis = useCallback(
    async (
      domainOverride?: string,
      apiKeyOverride?: string,
    ): Promise<ApiListItem[]> => {
      const d = (domainOverride ?? domain).trim();
      const k = (apiKeyOverride ?? apiKey).trim();
      if (!d || !k) return [];
      try {
        const res = await rpc.api.apis.$get({
          header: {
            'x-microcms-domain': d,
            'x-microcms-key': k,
          },
        });
        if (!res.ok) {
          throw new Error(`API一覧の取得に失敗しました (${res.status})`);
        }
        return (await res.json()) as ApiListItem[];
      } catch (err: unknown) {
        console.error('fetchApis error:', err);
        return [];
      }
    },
    [domain, apiKey],
  );

  /**
   * エンドポイントのスキーマを取得
   */
  const fetchSchema = useCallback(
    async (endpoint: string): Promise<ApiSchema | null> => {
      if (!domain || !apiKey || !endpoint) return null;
      try {
        const res = await rpc.api.schema.$get({
          header: getHeaders(),
          query: { endpoint },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`スキーマ取得失敗: ${text}`);
        }
        return (await res.json()) as ApiSchema;
      } catch (err: unknown) {
        console.error('fetchSchema error:', err);
        setError(
          err instanceof Error ? err.message : 'スキーマの取得に失敗しました',
        );
        return null;
      }
    },
    [domain, apiKey, getHeaders],
  );

  /**
   * コンテンツ一覧またはオブジェクトを取得
   */
  const fetchContents = useCallback(
    async (
      endpoint: string,
      isObject: boolean,
      offset = 0,
      limit = 30,
    ): Promise<{
      items: ContentItem[];
      singleObject: ContentItem | null;
      totalCount: number;
    }> => {
      if (!domain || !apiKey || !endpoint) {
        return { items: [], singleObject: null, totalCount: 0 };
      }

      setLoading(true);
      setError(null);

      try {
        const res = await rpc.api.contents.$get({
          header: getHeaders(),
          query: {
            endpoint,
            isObject: String(isObject),
            limit: String(limit),
            offset: String(offset),
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`コンテンツ取得失敗 (${res.status}): ${text}`);
        }

        const data = (await res.json()) as unknown;

        if (isObject) {
          return {
            items: [],
            singleObject: data as ContentItem,
            totalCount: 1,
          };
        }

        const listData = data as MicroCMSListResponse;
        return {
          items: listData.contents ?? [],
          singleObject: null,
          totalCount: listData.totalCount ?? 0,
        };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'コンテンツの取得に失敗しました';
        setError(msg);
        return { items: [], singleObject: null, totalCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    [domain, apiKey, getHeaders],
  );

  /**
   * コンテンツの保存（新規作成 / 更新）
   */
  const saveContent = useCallback(
    async ({
      endpoint,
      isObject,
      contentId,
      customId,
      data,
    }: {
      endpoint: string;
      isObject: boolean;
      contentId?: string;
      customId?: string;
      data: Record<string, unknown>;
    }): Promise<{ success: boolean; data?: unknown; error?: string }> => {
      try {
        setLoading(true);
        let method: 'POST' | 'PATCH' | 'PUT' = 'POST';

        if (isObject) {
          method = 'PATCH';
        } else if (contentId) {
          method = 'PATCH';
        } else if (customId && customId.trim().length > 0) {
          method = 'PUT';
        }

        const res = await rpc.api.contents.$post({
          header: getHeaders(),
          query: {
            endpoint,
            isObject: String(isObject),
            contentId: contentId ?? '',
            customId: customId ?? '',
            status: '',
            _method: method,
          },
          json: data,
        });

        if (!res.ok) {
          const errRes = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          throw new Error(
            errRes.message || `保存に失敗しました (${res.status})`,
          );
        }

        const resData = await res.json();
        return { success: true, data: resData };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'コンテンツの保存に失敗しました';
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [getHeaders],
  );

  /**
   * コンテンツの削除
   */
  const deleteContent = useCallback(
    async (
      endpoint: string,
      contentId: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);
        const res = await rpc.api.contents.$delete({
          header: getHeaders(),
          query: { endpoint, contentId },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`削除に失敗しました: ${text}`);
        }

        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '削除に失敗しました';
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [getHeaders],
  );

  /**
   * メディアファイルのアップロード
   */
  const uploadMedia = useCallback(
    async (file: File): Promise<{ url: string } | null> => {
      try {
        const formData = new FormData();
        formData.append('files', file);

        const res = await fetch('/api/media', {
          method: 'POST',
          headers: getHeaders(),
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`アップロード失敗 (${res.status})`);
        }

        const data = (await res.json()) as { url: string };
        return data;
      } catch (err: unknown) {
        console.error('Media upload error:', err);
        return null;
      }
    },
    [getHeaders],
  );

  /**
   * 参照フィールド用：参照先エンドポイントのアイテム候補を取得
   */
  const fetchRelationOptions = useCallback(
    async (relEndpoint: string): Promise<ContentItem[]> => {
      if (!domain || !apiKey || !relEndpoint) return [];
      try {
        const res = await rpc.api.contents.$get({
          header: getHeaders(),
          query: {
            endpoint: relEndpoint,
            isObject: 'false',
            limit: '100',
            offset: '0',
          },
        });
        if (!res.ok) return [];
        const data = (await res.json()) as unknown as MicroCMSListResponse;
        return data.contents ?? [];
      } catch (err: unknown) {
        console.error('fetchRelationOptions error:', err);
        return [];
      }
    },
    [domain, apiKey, getHeaders],
  );

  return {
    loading,
    error,
    fetchApis,
    fetchSchema,
    fetchContents,
    saveContent,
    deleteContent,
    uploadMedia,
    fetchRelationOptions,
  };
}
