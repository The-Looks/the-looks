// Token giả chỉ dùng khi toàn bộ API liên quan được MSW mô phỏng.
// Không đưa private key hoặc HMAC secret của backend vào frontend.
const enc = new TextEncoder();

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const json64 = (o: unknown) => b64url(enc.encode(JSON.stringify(o)));

export function makeMockJwt(sub: string, roles: string[], ttlSeconds = 8 * 3600) {
  const now = Math.floor(Date.now() / 1000);
  const data = `${json64({ alg: 'none', typ: 'JWT' })}.${json64({ sub, roles, iat: now, exp: now + ttlSeconds })}`;
  return { token: `${data}.`, expiresAt: new Date((now + ttlSeconds) * 1000).toISOString() };
}
