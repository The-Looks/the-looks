import createClient, { type Middleware } from 'openapi-fetch';
import { session } from '../lib/session';
import type { paths as AuthPaths } from './schema/auth';
import type { paths as BillingPaths } from './schema/billing';
import type { paths as OutfitPaths } from './schema/outfit';
import type { paths as VotingPaths } from './schema/voting';
import type { paths as WardrobePaths } from './schema/wardrobe';

/** Làm mới access token khi cần, rồi gắn Bearer token cho API có bảo vệ. */
const auth: Middleware = {
  async onRequest({ request }) {
    const path = new URL(request.url).pathname;
    if (!path.startsWith('/api/app/') && !path.startsWith('/api/admin/')) return request;
    const token = await session.validToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  },
  onResponse({ response }) {
    if (response.status === 401 && session.getToken()) session.clear();
    return response;
  },
};

/**
 * Mỗi request ghi một Idempotency-Key riêng: nếu mạng/proxy gửi lại cùng request, backend trả lại kết quả
 * lần đầu thay vì làm lại (IdempotencyFilter trong be/packages/observability).
 */
const idempotency: Middleware = {
  onRequest({ request }) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      request.headers.set('Idempotency-Key', crypto.randomUUID());
    }
    return request;
  },
};

// Cùng origin: Vite proxy (dev) / Vercel rewrites (prod) chuyển /api/... tới đúng service.
function client<Paths extends object>() {
  const c = createClient<Paths>({ baseUrl: globalThis.location?.origin ?? 'http://localhost' });
  c.use(auth, idempotency);
  return c;
}

export const authApi = client<AuthPaths>();
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
    const message =
      typeof detail === 'string' && detail ? detail : (DEFAULT_MESSAGE[response.status] ?? 'Có lỗi xảy ra.');
    throw new ApiError(response.status, message);
  }
  return data as T;
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Có lỗi xảy ra.');
