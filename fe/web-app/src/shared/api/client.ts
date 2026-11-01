import createClient, { type Middleware } from 'openapi-fetch';
import { session } from '../lib/session';
import type { paths as BillingPaths } from './schema/billing';
import type { paths as IdentityPaths } from './schema/identity';
import type { paths as OutfitPaths } from './schema/outfit';
import type { paths as VotingPaths } from './schema/voting';
import type { paths as WardrobePaths } from './schema/wardrobe';

/** Gắn JWT vào mọi request; 401 → xoá phiên, RequireAuth tự đưa về /login. */
const auth: Middleware = {
  onRequest({ request }) {
    const token = session.getToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  },
  onResponse({ response }) {
    if (response.status === 401 && session.getToken()) session.clear();
    return response;
  },
};

// Cùng origin: Vite proxy (dev) / Vercel rewrites (prod) chuyển /api/... tới đúng service.
function client<Paths extends object>() {
  const c = createClient<Paths>({ baseUrl: globalThis.location?.origin ?? 'http://localhost' });
  c.use(auth);
  return c;
}

export const identityApi = client<IdentityPaths>();
export const wardrobeApi = client<WardrobePaths>();
export const outfitApi = client<OutfitPaths>();
export const votingApi = client<VotingPaths>();
export const billingApi = client<BillingPaths>();

const DEFAULT_MESSAGE: Record<number, string> = {
  400: 'Dữ liệu chưa hợp lệ.',
  401: 'Phiên đăng nhập đã hết, vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền làm việc này.',
  404: 'Không tìm thấy dữ liệu.',
  409: 'Dữ liệu bị trùng.',
  410: 'Link đã hết hạn.',
  429: 'Bạn thao tác quá nhanh, thử lại sau ít phút.',
  503: 'Dịch vụ tạm thời không khả dụng, thử lại sau.',
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type FetchResult<T> = { data?: T; error?: unknown; response: Response };

/** Lấy data hoặc ném ApiError (thông điệp lấy từ "detail" của Problem nếu có). 204 → undefined. */
export async function unwrap<T>(request: Promise<FetchResult<T>>): Promise<T> {
  let result: FetchResult<T>;
  try {
    result = await request;
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.');
  }
  const { data, error, response } = result;
  if (!response.ok || error !== undefined) {
    const detail = (error as { detail?: unknown } | undefined)?.detail;
    const message = typeof detail === 'string' && detail ? detail : (DEFAULT_MESSAGE[response.status] ?? 'Có lỗi xảy ra.');
    throw new ApiError(response.status, message);
  }
  return data as T;
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Có lỗi xảy ra.');
