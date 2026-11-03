import type { AdminUsersPage } from '../../../interface/dto/admin/auth/AdminUsers';
import { authApi, unwrap } from '../../shared/api/client';

export const listAdminUsers = (page: number, search: string, size = 10): Promise<AdminUsersPage> =>
  unwrap(authApi.GET('/api/admin/auth/users', { params: { query: { page, size, search } } }));
