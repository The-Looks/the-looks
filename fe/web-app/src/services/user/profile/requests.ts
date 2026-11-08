import type { components } from '../../../interface/dto/guest/auth/auth';
import { ApiError, authApi, unwrap } from '../../shared/api/client';
import { session } from '../../shared/session';

export type UserProfile = components['schemas']['UserProfile'];
export const profileKey = ['me', 'profile'] as const;

export const profileRequests = {
  get: () => unwrap(authApi.GET('/api/app/me/profile')),
  update: (username: string, city: string) =>
    unwrap(authApi.PUT('/api/app/me/profile', { body: { username, city: city.trim() || null } })),
  removeAvatar: () => unwrap(authApi.DELETE('/api/app/me/avatar')),
  async uploadAvatar(file: File): Promise<UserProfile> {
    if (file.size > 2 * 1024 * 1024) throw new ApiError(413, 'Ảnh đại diện phải nhỏ hơn 2 MB.');
    if (!(await session.ensureValid())) throw new ApiError(401, 'Phiên đăng nhập đã hết.');
    const body = new FormData();
    body.set('file', file);
    const response = await fetch('/api/app/me/avatar', {
      method: 'POST', credentials: 'same-origin', body,
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    });
    if (!response.ok) {
      const problem = await response.json().catch(() => null) as { detail?: string } | null;
      throw new ApiError(response.status, problem?.detail ?? 'Không tải được ảnh đại diện.');
    }
    return response.json() as Promise<UserProfile>;
  },
  deleteAccount: () => unwrap(authApi.POST('/api/app/me/deletion')),
};
