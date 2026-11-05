import { authApi, unwrap } from '../../shared/api/client';

export const authRequests = {
  passwordPolicy: () => unwrap(authApi.GET('/api/public/auth/password-policy')),
  register: (body: { username: string; email: string; password: string; acceptedTerms: boolean }) =>
    unwrap(authApi.POST('/api/public/auth/register', { body })),
  login: (email: string, password: string) =>
    unwrap(authApi.POST('/api/public/auth/login', { body: { email, password } })),
  me: () => unwrap(authApi.GET('/api/app/me')),
};
