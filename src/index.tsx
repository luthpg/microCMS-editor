/** @jsxImportSource hono/jsx */
import type { Context } from 'hono';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { renderer } from './renderer';
import type { ApiListItem, ApiSchema, FieldSchema } from './types';

type AppEnv = { Bindings: CloudflareBindings };

const app = new Hono<AppEnv>();

app.use(renderer);

// ヘッダー検証ヘルパー（ドメインのホワイトリスト正規表現チェック付き）
function getClientCredentials(
  headers: Record<string, string | undefined>,
  c: Context<AppEnv>,
) {
  const domain = headers['x-microcms-domain'];
  const key = headers['x-microcms-key'];
  if (!domain || !key) return c.json({ error: 'Auth headers missing' }, 400);
  if (!/^[a-z0-9-]{1,63}$/i.test(domain)) {
    return c.json({ error: 'Invalid microCMS domain' }, 400);
  }
  return {
    'x-microcms-domain': domain,
    'x-microcms-key': key,
  };
}

// RPC APIルート定義
const apiRoutes = app
  .basePath('/api')

  // 0. API一覧取得 (Management API プロキシ)
  .get('/apis', validator('header', getClientCredentials), async (c) => {
    const { 'x-microcms-domain': domain, 'x-microcms-key': key } =
      c.req.valid('header');

    const res = await fetch(
      `https://${domain}.microcms-management.io/api/v1/apis`,
      { headers: { 'X-MICROCMS-API-KEY': key } },
    );

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      return c.json(
        { error: `Management API error (${res.status}): ${err}` },
        400,
      );
    }

    const data = await res.json<{ contents?: ApiListItem[] }>();
    return c.json((data.contents ?? []) as ApiListItem[], 200);
  })

  // 1. スキーマ取得 (Management API プロキシ)
  .get(
    '/schema',
    validator('header', getClientCredentials),
    validator('query', (query, c) => {
      const endpoint = Array.isArray(query.endpoint)
        ? query.endpoint[0]
        : query.endpoint;
      if (!endpoint) return c.json({ error: 'Missing endpoint' }, 400);
      return { endpoint: String(endpoint) };
    }),
    async (c) => {
      const { 'x-microcms-domain': domain, 'x-microcms-key': key } =
        c.req.valid('header');
      const { endpoint } = c.req.valid('query');
      const ep = encodeURIComponent(endpoint);

      const res = await fetch(
        `https://${domain}.microcms-management.io/api/v1/apis/${ep}`,
        {
          headers: { 'X-MICROCMS-API-KEY': key },
        },
      );

      if (!res.ok) {
        const err = await res.text().catch(() => '');
        return c.json(
          { error: `Management API error (${res.status}): ${err}` },
          400,
        );
      }

      const data = await res.json<Record<string, unknown>>();
      // Management API は "apiFields" キーでフィールド定義を返す
      const result: ApiSchema = {
        apiType: (data.apiType ?? 'list') as 'list' | 'object',
        fields: (data.apiFields ?? []) as FieldSchema[],
      };
      return c.json(result, 200);
    },
  )

  // 2. コンテンツ取得 (一覧 / 単一オブジェクト)
  .get(
    '/contents',
    validator('header', getClientCredentials),
    validator('query', (query, c) => {
      const endpoint = Array.isArray(query.endpoint)
        ? query.endpoint[0]
        : query.endpoint;
      if (!endpoint) return c.json({ error: 'Missing endpoint' }, 400);
      const isObject =
        (Array.isArray(query.isObject) ? query.isObject[0] : query.isObject) ===
        'true';
      const limit = String(
        Array.isArray(query.limit) ? query.limit[0] : (query.limit ?? '50'),
      );
      const offset = String(
        Array.isArray(query.offset) ? query.offset[0] : (query.offset ?? '0'),
      );
      return {
        endpoint: String(endpoint),
        isObject,
        limit,
        offset,
      };
    }),
    async (c) => {
      const { 'x-microcms-domain': domain, 'x-microcms-key': key } =
        c.req.valid('header');
      const { endpoint, isObject, limit, offset } = c.req.valid('query');
      const ep = encodeURIComponent(endpoint);

      const url = isObject
        ? `https://${domain}.microcms.io/api/v1/${ep}?draftKey=1`
        : `https://${domain}.microcms.io/api/v1/${ep}?draftKey=1&limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;

      const res = await fetch(url, {
        headers: { 'X-MICROCMS-API-KEY': key },
      });
      const data = await res.json<unknown>().catch(() => ({}));
      if (!res.ok) {
        return c.json(
          { error: `microCMS error (${res.status})`, detail: data },
          400,
        );
      }
      return c.json(data, 200);
    },
  )

  // 3. コンテンツ保存・作成・更新
  .post(
    '/contents',
    validator('header', getClientCredentials),
    validator('query', (query, c) => {
      const endpoint = Array.isArray(query.endpoint)
        ? query.endpoint[0]
        : query.endpoint;
      if (!endpoint) return c.json({ error: 'Missing endpoint' }, 400);
      const isObject =
        (Array.isArray(query.isObject) ? query.isObject[0] : query.isObject) ===
        'true';
      const contentId = String(
        Array.isArray(query.contentId)
          ? query.contentId[0]
          : (query.contentId ?? ''),
      );
      const customId = String(
        Array.isArray(query.customId)
          ? query.customId[0]
          : (query.customId ?? ''),
      );
      const status = String(
        Array.isArray(query.status) ? query.status[0] : (query.status ?? ''),
      );
      const _method = String(
        Array.isArray(query._method)
          ? query._method[0]
          : (query._method ?? 'POST'),
      );
      return {
        endpoint: String(endpoint),
        isObject,
        contentId,
        customId,
        status,
        _method,
      };
    }),
    validator('json', (json) => {
      return json as Record<string, unknown>;
    }),
    async (c) => {
      const { 'x-microcms-domain': domain, 'x-microcms-key': key } =
        c.req.valid('header');
      const { endpoint, isObject, contentId, customId, status, _method } =
        c.req.valid('query');
      const payload = c.req.valid('json');

      const ep = encodeURIComponent(endpoint);
      let targetUrl = `https://${domain}.microcms.io/api/v1/${ep}`;
      let method = (_method || 'POST').toUpperCase();

      if (isObject) {
        method = 'PATCH';
      } else if (contentId) {
        targetUrl += `/${encodeURIComponent(contentId)}`;
      } else if (customId) {
        targetUrl += `/${encodeURIComponent(customId)}`;
        method = 'PUT';
      }

      if (status === 'draft') {
        targetUrl += `${targetUrl.includes('?') ? '&' : '?'}status=draft`;
      }

      const res = await fetch(targetUrl, {
        method,
        headers: {
          'X-MICROCMS-API-KEY': key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json<unknown>().catch(() => ({}));
      if (!res.ok) {
        const message =
          (data as { message?: string })?.message ??
          `保存に失敗しました (${res.status})`;
        return c.json({ message, detail: data }, 400);
      }
      return c.json(data, 200);
    },
  )

  // 4. コンテンツ削除
  .delete(
    '/contents',
    validator('header', getClientCredentials),
    validator('query', (query, c) => {
      const endpoint = Array.isArray(query.endpoint)
        ? query.endpoint[0]
        : query.endpoint;
      const contentId = Array.isArray(query.contentId)
        ? query.contentId[0]
        : query.contentId;
      if (!endpoint || !contentId)
        return c.json({ error: 'Missing parameter' }, 400);
      return {
        endpoint: String(endpoint),
        contentId: String(contentId),
      };
    }),
    async (c) => {
      const { 'x-microcms-domain': domain, 'x-microcms-key': key } =
        c.req.valid('header');
      const { endpoint, contentId } = c.req.valid('query');
      const ep = encodeURIComponent(endpoint);
      const cid = encodeURIComponent(contentId);

      const res = await fetch(
        `https://${domain}.microcms.io/api/v1/${ep}/${cid}`,
        {
          method: 'DELETE',
          headers: { 'X-MICROCMS-API-KEY': key },
        },
      );
      if (!res.ok) return c.json({ error: 'Delete failed' }, 400);
      return c.json({ success: true }, 200);
    },
  )

  // 5. 画像アップロード (Media API は management.io)
  .post('/media', validator('header', getClientCredentials), async (c) => {
    const { 'x-microcms-domain': domain, 'x-microcms-key': key } =
      c.req.valid('header');
    const body = await c.req.parseBody();
    const file = body.files;
    if (!(file instanceof File)) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const formData = new FormData();
    formData.append('files', file);

    const res = await fetch(
      `https://${domain}.microcms-management.io/api/v1/media`,
      {
        method: 'POST',
        headers: { 'X-MICROCMS-API-KEY': key },
        body: formData,
      },
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return c.json(
        { error: `Media upload error (${res.status}): ${errText}` },
        400,
      );
    }
    const data = await res.json<{ url: string }>();
    return c.json(data, 200);
  });

// クライアント配信用ルート
app.get('*', (c) => {
  return c.render(<div id="root" />);
});

export type AppType = typeof apiRoutes;

export default app;
