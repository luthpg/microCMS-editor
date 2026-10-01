export type FieldKind =
  | 'text'
  | 'textArea'
  | 'richEditor'
  | 'richEditorV2'
  | 'number'
  | 'boolean'
  | 'date'
  | 'media'
  | 'select'
  | 'selectRule'
  | 'relation'
  | 'repeater'
  | 'file';

export interface SelectRule {
  multiple?: boolean;
  isMultiple?: boolean;
  options?: (
    | string
    | { id?: string; value?: string; name?: string; label?: string }
  )[];
  items?: (
    | string
    | { id?: string; value?: string; name?: string; label?: string }
  )[];
  [key: string]: unknown;
}

export interface FieldSchema {
  fieldId: string;
  name: string;
  kind: FieldKind;
  required?: boolean;
  isUnique?: boolean;
  multiple?: boolean;
  isMultiple?: boolean;
  description?: string;
  selectItems?: (string | { value: string; label?: string })[];
  selectRule?: string | SelectRule;
  /** Management API v1 形式 */
  referenceApi?: { id: string };
  /** Management API が返す実際のキー名 */
  referencedApiEndpoint?: string;
  [key: string]: unknown;
}

export interface ApiSchema {
  apiType: 'list' | 'object';
  fields: FieldSchema[];
}

export interface ContentItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;
  [key: string]: unknown;
}

export interface AppSettings {
  domain: string;
  apiKey: string;
  endpoint: string;
}

export interface ApiListItem {
  apiId: string;
  apiName: string;
  type: 'list' | 'page';
}

export interface MediaValue {
  url: string;
  width?: number;
  height?: number;
}

export interface MicroCMSListResponse<T = ContentItem> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

export type SaveStatus = 'draft' | '';

export type UploadMediaResult = { url: string } | { error: string };
