import type { ContentItem } from '@/types';

/**
 * microCMSのコンテンツアイテムから表示用タイトルを自動抽出する
 */
export function getItemTitle(item: ContentItem | null | undefined): string {
  if (item == null) return '無題';

  const titleKeys = [
    'title',
    'name',
    'label',
    'subject',
    'headline',
    'heading',
    'summary',
  ];

  for (const key of titleKeys) {
    const val = item[key];
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim();
    }
  }

  // 文字列型フィールドの先頭を探す
  for (const [key, val] of Object.entries(item)) {
    if (
      !['id', 'createdAt', 'updatedAt', 'publishedAt', 'revisedAt'].includes(
        key,
      ) &&
      typeof val === 'string' &&
      val.trim().length > 0
    ) {
      return val.trim();
    }
  }

  return item.id ? `ID: ${item.id}` : '無題';
}

/**
 * ISO日付文字列を読みやすい形式に変換
 */
export function formatDate(dateStr?: string | null): string {
  if (dateStr == null || !dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

/**
 * サムネイル画像のURLをアイテムから探す
 */
export function getItemThumbnail(
  item: ContentItem | null | undefined,
): string | null {
  if (item == null) return null;

  for (const val of Object.values(item)) {
    if (val != null && typeof val === 'object' && 'url' in val) {
      const url = (val as { url?: unknown }).url;
      if (typeof url === 'string' && url.startsWith('http')) {
        return url;
      }
    }
  }
  return null;
}
