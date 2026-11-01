// Ký JWT HS256 bằng secret DEV (giống application-local.yml của các service), để token giả lập
// ở frontend vẫn được outfit-service thật chấp nhận. Chỉ dùng khi dev — secret này công khai.
const DEV_SECRET = 'dev-only-secret-change-me-0123456789abcdef';
const enc = new TextEncoder();

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const json64 = (o: unknown) => b64url(enc.encode(JSON.stringify(o)));

export async function signDevJwt(sub: string, roles: string[], ttlSeconds = 8 * 3600) {
  const now = Math.floor(Date.now() / 1000);
  const data = `${json64({ alg: 'HS256', typ: 'JWT' })}.${json64({ sub, roles, iat: now, exp: now + ttlSeconds })}`;
  const key = await crypto.subtle.importKey('raw', enc.encode(DEV_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
  return { token: `${data}.${b64url(sig)}`, expiresAt: new Date((now + ttlSeconds) * 1000).toISOString() };
}
