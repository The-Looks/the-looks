import type { components as AuthComponents } from '../../../interface/dto/guest/auth/auth';
import type { components as VotingComponents } from '../../../interface/dto/shared/voting/voting';
import { authApi, billingApi, outfitApi, unwrap, votingApi, wardrobeApi } from '../../shared/api/client';

export type AdminUserDetail = AuthComponents['schemas']['AdminUserDetail'];
export type AdminRole = AuthComponents['schemas']['AdminRole'];
export type AdminPermission = AuthComponents['schemas']['AdminPermission'];
export type AdminAudit = AuthComponents['schemas']['AdminAudit'];
export type AccountDeletion = AuthComponents['schemas']['AccountDeletion'];
export type PollReport = VotingComponents['schemas']['PollReport'];
export type PollModerationAudit = VotingComponents['schemas']['PollModerationAudit'];

export const management = {
  user: (id: string) => unwrap(authApi.GET('/api/admin/auth/users/{id}', { params: { path: { id } } })),
  status: (id: string, status: 'ACTIVE' | 'LOCKED') =>
    unwrap(authApi.PUT('/api/admin/auth/users/{id}/status', { params: { path: { id } }, body: { status } })),
  grantRole: (id: string, role: string) =>
    unwrap(authApi.PUT('/api/admin/auth/users/{id}/roles/{role}', { params: { path: { id, role } } })),
  revokeRole: (id: string, role: string) =>
    unwrap(authApi.DELETE('/api/admin/auth/users/{id}/roles/{role}', { params: { path: { id, role } } })),
  roles: () => unwrap(authApi.GET('/api/admin/auth/roles')),
  createRole: (code: string, name: string) => unwrap(authApi.POST('/api/admin/auth/roles', { body: { code, name } })),
  updateRole: (code: string, name: string) => unwrap(authApi.PUT('/api/admin/auth/roles/{code}', { params: { path: { code } }, body: { name } })),
  deleteRole: (code: string) => unwrap(authApi.DELETE('/api/admin/auth/roles/{code}', { params: { path: { code } } })),
  rolePermissions: (code: string, permissions: string[]) =>
    unwrap(authApi.PUT('/api/admin/auth/roles/{code}/permissions', { params: { path: { code } }, body: { permissions } })),
  permissions: () => unwrap(authApi.GET('/api/admin/auth/permissions')),
  createPermission: (code: string, description: string) =>
    unwrap(authApi.POST('/api/admin/auth/permissions', { body: { code, description } })),
  updatePermission: (code: string, description: string) =>
    unwrap(authApi.PUT('/api/admin/auth/permissions/{code}', { params: { path: { code } }, body: { description } })),
  deletePermission: (code: string) => unwrap(authApi.DELETE('/api/admin/auth/permissions/{code}', { params: { path: { code } } })),
  audit: (search: string, outcome: 'ALL' | 'SUCCESS' | 'FAILED') =>
    unwrap(authApi.GET('/api/admin/auth/audit', { params: { query: { search, outcome, limit: 100 } } })),
  deletion: (id: string) => unwrap(authApi.GET('/api/admin/auth/users/{id}/deletion', { params: { path: { id } } })),
  startDeletion: (id: string) => unwrap(authApi.POST('/api/admin/auth/users/{id}/deletion', { params: { path: { id } } })),
  wardrobe: (id: string) => unwrap(wardrobeApi.GET('/api/admin/wardrobe/users/{id}/data', { params: { path: { id } } })),
  outfit: (id: string) => unwrap(outfitApi.GET('/api/admin/outfits/users/{id}/data', { params: { path: { id } } })),
  billing: (id: string) => unwrap(billingApi.GET('/api/admin/billing/users/{id}/data', { params: { path: { id } } })),
  polls: (id: string) => unwrap(votingApi.GET('/api/admin/polls/users/{id}/data', { params: { path: { id } } })),
  reports: (status: 'OPEN' | 'IGNORED' | 'HIDDEN' | 'ALL') =>
    unwrap(votingApi.GET('/api/admin/polls/reports', { params: { query: { status } } })),
  decideReport: (id: string, status: 'IGNORED' | 'HIDDEN') =>
    unwrap(votingApi.PUT('/api/admin/polls/reports/{id}', { params: { path: { id } }, body: { status } })),
  moderationAudit: () => unwrap(votingApi.GET('/api/admin/polls/audit')),
};
