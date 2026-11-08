import { delay, http, HttpResponse, type HttpHandler } from 'msw';
import type { Category, OutfitSuggestion, Poll, SavedOutfit, Scan, StylePreferences, WardrobeItem } from '../../../interface/dto/types';
import { readWardrobeFilters } from '../../user/wardrobe/filters';
import { DEMO_USER, sampleCloset } from './data';

// Giả lập API theo đúng contract trong be/packages/contracts. Dữ liệu chỉ nằm trong bộ nhớ trình duyệt.
const problem = (status: number, detail: string) =>
  HttpResponse.json(
    { status, title: 'Error', detail },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );

// ---------------- auth ----------------
let refreshActive = false;
let activeUser = DEMO_USER;
const registered = new Map<string, typeof DEMO_USER>();
const accountSetup = new Map<string, { closet: WardrobeItem[]; preferences: StylePreferences }>();

function switchMockAccount(user: typeof DEMO_USER) {
  if (activeUser.id !== user.id) {
    accountSetup.set(activeUser.id, { closet, preferences });
    const setup = accountSetup.get(user.id);
    closet = setup?.closet ?? [];
    preferences = setup?.preferences ?? {};
  }
  activeUser = user;
}
// MSW handlers are recreated on a full OAuth redirect. Persist only the demo identity,
// never a token, so the mock callback can restore its session via /refresh.
const mockSessionKey = 'thelooks:mock-auth-session';
function rememberMockSession() {
  sessionStorage.setItem(mockSessionKey, JSON.stringify(activeUser));
}
function restoreMockSession() {
  if (refreshActive) return true;
  const saved = sessionStorage.getItem(mockSessionKey);
  if (!saved) return false;
  try {
    const user = JSON.parse(saved) as typeof DEMO_USER;
    if (user.id !== DEMO_USER.id) registered.set(user.email.toLowerCase(), user);
    switchMockAccount(user);
    refreshActive = true;
    return true;
  } catch {
    sessionStorage.removeItem(mockSessionKey);
    return false;
  }
}
const auth: HttpHandler[] = [
  http.get('*/api/public/auth/password-policy', () =>
    HttpResponse.json({ minLength: 8, strongLength: 12, recommendedCharacterTypes: 3 })),
  http.post('*/api/public/auth/register', async ({ request }) => {
    const body = (await request.json()) as { email: string; username: string; password: string };
    if (body.password.length < 8) return problem(400, 'Mật khẩu phải có ít nhất 8 ký tự');
    const user = { ...DEMO_USER, id: crypto.randomUUID(), email: body.email, username: body.username, createdAt: new Date().toISOString() };
    registered.set(user.email.toLowerCase(), user);
    return HttpResponse.json(user, { status: 201 });
  }),
  http.post('*/api/public/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    await delay(300);
    if (!body.email || !body.password) return problem(401, 'Sai email hoặc mật khẩu');
    refreshActive = true;
    switchMockAccount(body.email.toLowerCase() === 'admin@thelooks.local'
      ? { ...DEMO_USER, email: body.email, username: 'Quản trị viên', roles: ['USER', 'ADMIN'], permissions: ['ACCOUNT_READ_SELF', 'ADMIN_ACCESS', 'USER_MANAGE', 'ROLE_MANAGE', 'AUDIT_READ', 'REPORT_MODERATE', 'USER_DELETE', 'BILLING_STATS_READ', 'AI_USAGE_READ', 'AFFILIATE_STATS_READ'] }
      : registered.get(body.email.toLowerCase()) ?? { ...DEMO_USER, email: body.email });
    rememberMockSession();
    return HttpResponse.json({ expiresAt: new Date(Date.now() + 30 * 60_000).toISOString() });
  }),
  http.post('*/api/public/auth/refresh', async () => {
    if (!restoreMockSession()) return problem(401, 'Chưa có phiên đăng nhập');
    return HttpResponse.json({ expiresAt: new Date(Date.now() + 30 * 60_000).toISOString() });
  }),
  http.post('*/api/public/auth/logout', () => {
    refreshActive = false;
    switchMockAccount(DEMO_USER);
    sessionStorage.removeItem(mockSessionKey);
    return new HttpResponse(null, { status: 204 });
  }),
  http.get('*/api/public/auth/google/start', ({ request }) => {
    refreshActive = true;
    switchMockAccount(DEMO_USER);
    rememberMockSession();
    return HttpResponse.redirect(new URL('/auth/callback', request.url).toString(), 302);
  }),
  http.get('*/api/app/me', () => HttpResponse.json(activeUser)),
  http.get('*/api/app/me/auth-methods', () => HttpResponse.json({ hasPassword: true })),
];

// ---------------- wardrobe ----------------
let closet: WardrobeItem[] = structuredClone(sampleCloset);
const scans = new Map<string, Scan>();
const guessCategories: Category[] = ['TOP', 'BOTTOM', 'DRESS', 'SHOES'];

const wearHistory = new Map<string, { wearCount: number; lastWornAt: string }>();
const mockItemCost = (item: WardrobeItem) => {
  const wearCount = wearHistory.get(item.id)?.wearCount ?? 0;
  const price = item.purchasePrice;
  return { item, wearCount, costPerWear: price == null || wearCount === 0 ? null : Math.round((price / wearCount + Number.EPSILON) * 100) / 100,
    status: price == null ? 'MISSING_PRICE' : wearCount === 0 ? 'NEVER_WORN' : 'CALCULATED' };
};
const wardrobe: HttpHandler[] = [
  http.get('*/api/app/wardrobe/cost-per-wear', () => {
    if (!([...entitlements().features] as readonly string[]).includes('COST_PER_WEAR')) return problem(403, 'Chi phí mỗi lần mặc cần gói Pro');
    const all = closet.filter((item) => item.status === 'CONFIRMED').map(mockItemCost)
      .sort((a, b) => (b.costPerWear ?? -1) - (a.costPerWear ?? -1) || b.item.createdAt.localeCompare(a.item.createdAt) || a.item.id.localeCompare(b.item.id));
    return HttpResponse.json({ items: all.slice(0, 10), totalItems: all.length });
  }),
  http.get('*/api/app/wardrobe/items/:id/cost-per-wear', ({ params }) => {
    if (!([...entitlements().features] as readonly string[]).includes('COST_PER_WEAR')) return problem(403, 'Chi phí mỗi lần mặc cần gói Pro');
    const item = closet.find((i) => i.id === params.id);
    if (!item) return problem(404, 'Không tìm thấy món đồ');
    if (item.status !== 'CONFIRMED') return problem(409, 'Xác nhận món đồ trước khi xem chi phí');
    return HttpResponse.json(mockItemCost(item));
  }),
  http.get('*/api/app/wardrobe/stats', () => {
    if (!([...entitlements().features] as readonly string[]).includes('WARDROBE_STATS')) return problem(403, 'Thống kê tủ đồ cần gói Pro');
    const all = closet.filter((item) => item.status === 'CONFIRMED');
    const groups = (category: boolean) => {
      const counts = new Map<string, number>();
      all.forEach((item) => {
        const values = category ? [item.category ?? 'UNKNOWN'] : [...new Set(item.colors?.map((color) => color.trim().toLowerCase()).filter(Boolean))];
        (values.length ? values : ['UNKNOWN']).forEach((key) => counts.set(key, (counts.get(key) ?? 0) + 1));
      });
      return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
    };
    const now = Date.now();
    const wornItems = all.filter((item) => wearHistory.has(item.id)).length;
    const unused = all.map((item) => {
      const lastWornAt = wearHistory.get(item.id)?.lastWornAt ?? null;
      return { item, lastWornAt, daysSinceWear: lastWornAt ? Math.max(0, Math.floor((now - Date.parse(lastWornAt)) / 86400000)) : null };
    }).filter((entry) => entry.daysSinceWear === null || entry.daysSinceWear >= 30)
      .sort((a, b) => (a.lastWornAt ?? '').localeCompare(b.lastWornAt ?? '') || a.item.createdAt.localeCompare(b.item.createdAt) || a.item.id.localeCompare(b.item.id));
    return HttpResponse.json({ totalItems: all.length, wornItems, neverWornItems: all.length - wornItems,
      wearRatePercent: all.length ? Math.round(1000 * wornItems / all.length) / 10 : 0,
      byCategory: groups(true), byColor: groups(false), inactiveCount: unused.length, inactiveAfterDays: 30, unusedItems: unused.slice(0, 10),
      declutterAfterDays: 90, declutterItems: unused.filter((e) => e.daysSinceWear === null ? now - Date.parse(e.item.createdAt) >= 90 * 86400000 : e.daysSinceWear >= 90).slice(0, 20),
      asOf: new Date(now).toISOString() });
  }),
  http.get('*/api/app/wardrobe/items/search', ({ request }) => {
    const f = readWardrobeFilters(new URL(request.url).searchParams);
    const labels: Record<string, string> = { TOP: 'áo', BOTTOM: 'quần', DRESS: 'váy', OUTERWEAR: 'áo khoác', SHOES: 'giày', BAG: 'túi', ACCESSORY: 'phụ kiện' };
    const matches = closet.filter((item) => (f.status ? item.status === f.status : item.status !== 'ARCHIVED' && item.status !== 'SOLD')
      && (!f.category || item.category === f.category)
      && (!f.color?.trim() || item.colors?.some((color) => color.toLowerCase() === f.color?.trim().toLowerCase()))
      && (!f.season || !item.seasons?.length || item.seasons.includes(f.season))
      && (!f.style?.trim() || item.styleTags?.some((style) => style.toLowerCase() === f.style?.trim().toLowerCase()))
      && (!f.q?.trim() || [item.category, labels[item.category ?? ''], item.material, item.colors?.join(' '), item.styleTags?.join(' ')].join(' ').toLowerCase().includes(f.q.trim().toLowerCase())))
      .sort((a, b) => f.sort === 'NEWEST'
        ? b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id)
        : (wearHistory.get(a.id)?.lastWornAt ?? '').localeCompare(wearHistory.get(b.id)?.lastWornAt ?? '') || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
    return HttpResponse.json({ items: matches.slice(f.page * f.size, (f.page + 1) * f.size), total: matches.length, page: f.page, size: f.size });
  }),
  http.get('*/api/app/wardrobe/items', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    return HttpResponse.json(
      closet.filter((i) => (status ? i.status === status : i.status !== 'ARCHIVED' && i.status !== 'SOLD') && (!category || i.category === category)),
    );
  }),
  // Giả lập quét ảnh: mỗi ảnh ra 1–3 món sau ~2 giây (ảnh mock không cắt được nên dùng lại ảnh gốc)
  http.post('*/api/app/wardrobe/scans', async ({ request }) => {
    const owner = activeUser.id;
    const form = await request.formData();
    const images = form.getAll('images').filter((f): f is File => f instanceof File);
    if (images.length === 0) return problem(400, 'Thiếu ảnh');
    if (images.length > 10) return problem(400, 'Tối đa 10 ảnh mỗi lần');
    const scan: Scan = {
      id: crypto.randomUUID(),
      status: 'PROCESSING',
      imageCount: images.length,
      items: [],
      skippedForLimit: 0,
      createdAt: new Date().toISOString(),
    };
    scans.set(scan.id, scan);
    setTimeout(() => {
      const created: WardrobeItem[] = images.flatMap((file, i) =>
        Array.from({ length: 1 + ((i + file.size) % 3) }, (_, k) => ({
          id: crypto.randomUUID(),
          status: 'PENDING_REVIEW' as const,
          category: guessCategories[(i + k) % guessCategories.length],
          colors: ['white'],
          seasons: [],
          styleTags: ['casual'],
          imageUrl: URL.createObjectURL(file),
          scanId: scan.id,
          confidence: 0.8,
          createdAt: new Date().toISOString(),
        })),
      );
      const prior = accountSetup.get(owner);
      if (owner === activeUser.id) closet = [...created, ...closet];
      else if (prior) prior.closet = [...created, ...prior.closet];
      scans.set(scan.id, { ...scan, status: 'DONE', items: created });
    }, 2000);
    return HttpResponse.json(scan, { status: 202 });
  }),
  http.get('*/api/app/wardrobe/scans/:id', ({ params }) => {
    const scan = scans.get(String(params.id));
    return scan ? HttpResponse.json({ ...scan, items: scan.items.map((item) => closet.find((current) => current.id === item.id)).filter(Boolean) }) : problem(404, 'Không tìm thấy lần quét');
  }),
  http.get('*/api/app/wardrobe/items/:id', ({ params }) => {
    const item = closet.find((i) => i.id === params.id);
    return item ? HttpResponse.json(item) : problem(404, 'Không tìm thấy món đồ');
  }),
  http.post('*/api/app/wardrobe/items/confirm', async ({ request }) => {
    const body = await request.json() as { items?: { itemId: string; attributes: Partial<WardrobeItem> }[] };
    if (!body.items?.length || body.items.length > 100) return problem(400, 'Chọn từ 1 đến 100 món');
    if (new Set(body.items.map((item) => item.itemId)).size !== body.items.length) return problem(409, 'Món bị trùng');
    for (const entry of body.items) {
      const item = closet.find((i) => i.id === entry.itemId);
      if (!item) return problem(404, 'Không tìm thấy món đồ');
      if (!['PENDING_REVIEW', 'RECOGNITION_FAILED'].includes(item.status)) return problem(409, 'Món không còn chờ xác nhận');
      if (!entry.attributes?.category) return problem(400, 'Cần chọn loại đồ');
    }
    const saved = body.items.map((entry) => ({ ...closet.find((i) => i.id === entry.itemId)!, ...entry.attributes, status: 'CONFIRMED' as const }));
    closet = closet.map((item) => saved.find((s) => s.id === item.id) ?? item);
    return HttpResponse.json(saved);
  }),
  http.post('*/api/app/wardrobe/items/:id/confirm', async ({ params, request }) => {
    const attrs = (await request.json()) as Partial<WardrobeItem>;
    if (attrs.purchasePrice != null && (attrs.purchasePrice < 0 || !Number.isFinite(attrs.purchasePrice))) return problem(400, 'Giá mua phải không âm');
    if ((attrs.brand?.length ?? 0) > 100) return problem(400, 'Thương hiệu tối đa 100 ký tự');
    closet = closet.map((i) => (i.id === params.id ? { ...i, ...attrs, status: 'CONFIRMED' } : i));
    return HttpResponse.json(closet.find((i) => i.id === params.id));
  }),
  http.put('*/api/app/wardrobe/items/:id', async ({ params, request }) => {
    const attrs = (await request.json()) as Partial<WardrobeItem>;
    if (attrs.purchasePrice != null && (attrs.purchasePrice < 0 || !Number.isFinite(attrs.purchasePrice))) return problem(400, 'Giá mua phải không âm');
    if ((attrs.brand?.length ?? 0) > 100) return problem(400, 'Thương hiệu tối đa 100 ký tự');
    closet = closet.map((i) => (i.id === params.id ? { ...i, ...attrs } : i));
    return HttpResponse.json(closet.find((i) => i.id === params.id));
  }),
  http.patch('*/api/app/wardrobe/items/batch', async ({ request }) => {
    const { itemIds, status } = (await request.json()) as { itemIds: string[]; status: WardrobeItem['status'] };
    const owned = ['CONFIRMED', 'ARCHIVED', 'SOLD'];
    const selected = closet.filter((i) => itemIds.includes(i.id));
    if (selected.length !== itemIds.length) return problem(404, 'Không tìm thấy món đồ');
    if (!owned.includes(status) || selected.some((i) => !owned.includes(i.status))) return problem(409, 'Có món chưa xác nhận. Xác nhận món đồ trước khi cất đi hoặc đánh dấu đã bán.');
    closet = closet.map((i) => (itemIds.includes(i.id) ? { ...i, status } : i));
    return HttpResponse.json(closet.filter((i) => itemIds.includes(i.id)));
  }),
  http.post('*/api/app/wardrobe/items/batch-delete', async ({ request }) => {
    const { itemIds } = (await request.json()) as { itemIds: string[] };
    closet = closet.filter((i) => !itemIds.includes(i.id));
    return new HttpResponse(null, { status: 204 });
  }),
  http.delete('*/api/app/wardrobe/items/:id', ({ params }) => {
    closet = closet.filter((i) => i.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];

// ---------------- outfit (chỉ khi không chạy outfit-service thật) ----------------
let savedOutfits: SavedOutfit[] = [];
const wearPlans = new Map<string, string>();
const disliked = new Set<string>();
const comboKey = (ids: string[]) => [...ids].sort().join(',');
const confirmed = () => closet.filter((i) => i.status === 'CONFIRMED');
const toItem = (i: WardrobeItem) => ({ id: i.id, category: i.category ?? 'TOP', imageUrl: i.imageUrl ?? undefined });

function mockSuggestions(occasion?: string): OutfitSuggestion[] {
  const by = (c: string) => confirmed().filter((i) => i.category === c);
  const shoes = by('SHOES')[0];
  const combos = by('TOP').flatMap((t) => by('BOTTOM').map((b) => [t, b]));
  return combos
    .map((c) => [...c, ...(shoes ? [shoes] : [])])
    .filter((c) => !disliked.has(comboKey(c.map((i) => i.id))))
    .slice(0, 3)
    .map((c, k) => ({
      items: c.map(toItem),
      occasion: occasion as OutfitSuggestion['occasion'],
      score: 0.9 - k * 0.08,
      reason: 'Dữ liệu giả lập · Có món bạn chưa mặc lần nào',
    }));
}

let preferences: StylePreferences = {
  gender: null,
  styles: [],
  budget: null,
};

const outfit: HttpHandler[] = [
  http.get('*/api/app/outfits/wear-summary', () => HttpResponse.json([...wearHistory].map(([itemId, history]) => ({ itemId, ...history })))),
  http.get('*/api/app/outfits/suggestions', ({ request }) =>
    HttpResponse.json(mockSuggestions(new URL(request.url).searchParams.get('occasion') ?? undefined)),
  ),
  http.get('*/api/app/outfits/weather', () => HttpResponse.json({ temperatureC: 31, rainy: false })),
  http.get('*/api/app/outfits/quick-pick', () => {
    const s = mockSuggestions()[0];
    return s ? HttpResponse.json(s) : new HttpResponse(null, { status: 204 });
  }),
  http.get('*/api/app/outfits/preferences', () => HttpResponse.json(preferences)),
  http.put('*/api/app/outfits/preferences', async ({ request }) => {
    preferences = (await request.json()) as typeof preferences;
    return HttpResponse.json(preferences);
  }),
  http.get('*/api/app/outfits/shopping', () =>
    HttpResponse.json({
      gap: { category: 'SHOES', label: 'giày' },
      products: [1, 2, 3].map((n) => ({
        id: `mock-${n}`,
        title: `Giày sneaker trắng basic mẫu ${n} (dữ liệu giả lập)`,
        imageUrl: null,
        minPriceVnd: 250000 + n * 50000,
        maxPriceVnd: 300000 + n * 50000,
        shopName: 'Shop mẫu',
        unitsSold: 1000 * n,
        source: 'TIKTOK_SHOP',
      })),
    }),
  ),
  http.post('*/api/app/outfits/shopping/:id/open', () => HttpResponse.json({ url: 'https://shop.tiktok.com/' })),
  http.get('*/api/app/outfits/calendar', () =>
    HttpResponse.json([...wearPlans].map(([date, plannedOutfitId]) => ({ date, plannedOutfitId, wornOutfitIds: [] })))),
  http.put('*/api/app/outfits/calendar/:date', async ({ params, request }) => {
    const body = await request.json() as { outfitId: string };
    wearPlans.set(String(params.date), body.outfitId);
    return new HttpResponse(null, { status: 204 });
  }),
  http.delete('*/api/app/outfits/calendar/:date', ({ params }) => {
    wearPlans.delete(String(params.date));
    return new HttpResponse(null, { status: 204 });
  }),
  http.get('*/api/app/outfits', () => HttpResponse.json(savedOutfits)),
  http.post('*/api/app/outfits', async ({ request }) => {
    const body = (await request.json()) as { itemIds: string[]; occasion?: SavedOutfit['occasion'] };
    const o: SavedOutfit = {
      id: crypto.randomUUID(),
      itemIds: body.itemIds,
      occasion: body.occasion,
      createdAt: new Date().toISOString(),
    };
    savedOutfits = [o, ...savedOutfits];
    return HttpResponse.json(o, { status: 201 });
  }),
  http.get('*/api/app/outfits/:id', ({ params }) => {
    const o = savedOutfits.find((x) => x.id === params.id);
    if (!o) return problem(404, 'Không tìm thấy outfit');
    return HttpResponse.json({ ...o, itemImageUrls: [] });
  }),
  http.post('*/api/app/outfits/feedback', async ({ request }) => {
    const body = (await request.json()) as { itemIds: string[]; vote: 'LIKE' | 'DISLIKE' };
    if (body.vote === 'DISLIKE') disliked.add(comboKey(body.itemIds));
    return new HttpResponse(null, { status: 204 });
  }),
  http.post('*/api/app/outfits/:id/wear', ({ params }) => {
    const outfit = savedOutfits.find((item) => item.id === params.id);
    if (!outfit) return problem(404, 'Không tìm thấy outfit');
    outfit.itemIds.forEach((id) => wearHistory.set(id, { wearCount: (wearHistory.get(id)?.wearCount ?? 0) + 1, lastWornAt: new Date().toISOString() }));
    return new HttpResponse(null, { status: 204 });
  }),
];

// ---------------- voting ----------------
const option = (outfitId: string) => ({ outfitId, imageUrls: [] as string[] });
let polls: Poll[] = [
  {
    code: 'demo42',
    question: 'Đi hẹn hò tối nay nên mặc bộ nào?',
    optionA: option('00000000-0000-4000-8000-00000000a001'),
    optionB: option('00000000-0000-4000-8000-00000000b001'),
    expiresAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
    result: { votesA: 12, votesB: 6, percentA: 67, percentB: 33 },
  },
];
const votedPolls = new Set<string>();

const voting: HttpHandler[] = [
  http.get('*/api/app/polls', () => HttpResponse.json(polls)),
  http.post('*/api/app/polls', async ({ request }) => {
    const body = (await request.json()) as {
      outfitAId: string;
      outfitBId: string;
      question?: string;
      ttlHours?: number;
    };
    const code = Math.random().toString(36).slice(2, 8);
    const expiresAt = new Date(Date.now() + (body.ttlHours ?? 24) * 3600_000).toISOString();
    polls = [
      {
        code,
        question: body.question,
        optionA: option(body.outfitAId),
        optionB: option(body.outfitBId),
        expiresAt,
        result: { votesA: 0, votesB: 0, percentA: 0, percentB: 0 },
      },
      ...polls,
    ];
    return HttpResponse.json({ code, shareUrl: `${location.origin}/v/${code}`, expiresAt }, { status: 201 });
  }),
  http.get('*/api/public/polls/:code', ({ params }) => {
    const p = polls.find((x) => x.code === params.code);
    return p ? HttpResponse.json(p) : problem(404, 'Không có bình chọn với mã này');
  }),
  http.post('*/api/public/polls/:code/votes', async ({ params, request }) => {
    const code = String(params.code);
    const poll = polls.find((x) => x.code === code);
    if (!poll) return problem(404, 'Không có bình chọn với mã này');
    if (Date.parse(poll.expiresAt) <= Date.now()) return problem(410, 'Link đã hết hạn');
    if (votedPolls.has(code)) return problem(409, 'Bạn đã bình chọn');
    const body = (await request.json()) as { choice?: string };
    if (body.choice !== 'A' && body.choice !== 'B') return problem(400, 'Lựa chọn không hợp lệ');
    votedPolls.add(code);
    const votesA = (poll.result?.votesA ?? 0) + Number(body.choice === 'A');
    const votesB = (poll.result?.votesB ?? 0) + Number(body.choice === 'B');
    const total = votesA + votesB;
    poll.result = {
      votesA,
      votesB,
      percentA: Math.round((votesA / total) * 100),
      percentB: Math.round((votesB / total) * 100),
    };
    return HttpResponse.json(poll.result);
  }),
];

// ---------------- billing ----------------
const PLANS = [
  {
    plan: 'FREE',
    name: 'Free',
    monthlyPriceVnd: 0,
    yearlyPriceVnd: 0,
    limits: { wardrobeItems: 50, aiSuggestionsPerDay: 3 },
    features: [],
  },
  {
    plan: 'PLUS',
    name: 'Plus',
    monthlyPriceVnd: 49000,
    yearlyPriceVnd: 499000,
    limits: { wardrobeItems: 300, aiSuggestionsPerDay: 20 },
    features: [],
  },
  {
    plan: 'PRO',
    name: 'Pro',
    monthlyPriceVnd: 79000,
    yearlyPriceVnd: 799000,
    limits: { wardrobeItems: null, aiSuggestionsPerDay: 100 },
    features: ['WARDROBE_STATS', 'COST_PER_WEAR', 'WEAR_CALENDAR', 'TRY_ON_3D'],
  },
] as const;
let myPlan: {
  plan: 'FREE' | 'PLUS' | 'PRO';
  expiresAt: string | null;
  period: 'MONTHLY' | 'YEARLY' | null;
  autoRenew: boolean;
  status: 'ACTIVE' | null;
} = { plan: 'FREE', expiresAt: null, period: null, autoRenew: false, status: null };
const orders = new Map<
  number,
  { plan: 'PLUS' | 'PRO'; period: 'MONTHLY' | 'YEARLY'; amountVnd: number; status: string; createdAt: string }
>();
let nextOrder = 100001;
const entitlements = () => {
  const p = PLANS.find((x) => x.plan === myPlan.plan)!;
  return { ...myPlan, limits: p.limits, features: p.features };
};

const billing: HttpHandler[] = [
  http.get('*/api/public/billing/plans', () => HttpResponse.json(PLANS)),
  http.get('*/api/app/billing/me', () => HttpResponse.json(entitlements())),
  http.put('*/api/app/billing/me/auto-renew', async ({ request }) => {
    if (myPlan.plan === 'FREE') return problem(400, 'Bạn đang dùng gói Free, không có gì để gia hạn');
    myPlan.autoRenew = ((await request.json()) as { enabled: boolean }).enabled;
    return HttpResponse.json(entitlements());
  }),
  http.post('*/api/app/billing/checkout', async ({ request }) => {
    const body = (await request.json()) as { plan: 'PLUS' | 'PRO'; period: 'MONTHLY' | 'YEARLY' };
    const p = PLANS.find((x) => x.plan === body.plan)!;
    const orderCode = nextOrder++;
    const order = {
      plan: body.plan,
      period: body.period,
      amountVnd: body.period === 'MONTHLY' ? p.monthlyPriceVnd : p.yearlyPriceVnd,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    orders.set(orderCode, order);
    const checkoutUrl = `${location.origin}/billing/result?orderCode=${orderCode}&status=PAID&fake=1`;
    return HttpResponse.json({ orderCode, ...order, checkoutUrl }, { status: 201 });
  }),
  http.post('*/api/app/billing/orders/:code/confirm', ({ params }) => {
    const code = Number(params.code);
    const order = orders.get(code);
    if (!order) return problem(404, `Không tìm thấy đơn ${code}`);
    if (order.status === 'PENDING') {
      order.status = 'PAID';
      const months = order.period === 'MONTHLY' ? 1 : 12;
      const expires = new Date();
      expires.setMonth(expires.getMonth() + months);
      myPlan = {
        plan: order.plan,
        expiresAt: expires.toISOString(),
        period: order.period,
        autoRenew: true,
        status: 'ACTIVE',
      };
    }
    return HttpResponse.json({ orderCode: code, ...order });
  }),
];

// Các màn quản trị dùng chung dữ liệu mẫu trong dev:mock để thử luồng mà không cần PostgreSQL.
const managedUser = {
  id: '22222222-2222-4222-8222-222222222222', username: 'Người dùng thử', email: 'user@thelooks.local',
  status: 'ACTIVE', emailVerified: true, createdAt: new Date().toISOString(), roles: ['USER'],
  permissions: ['ACCOUNT_READ_SELF'],
};
const adminRoles = [
  { code: 'USER', name: 'Người dùng', permissions: ['ACCOUNT_READ_SELF'], system: true },
  { code: 'ADMIN', name: 'Quản trị viên', permissions: ['ACCOUNT_READ_SELF', 'ADMIN_ACCESS', 'USER_MANAGE', 'ROLE_MANAGE', 'AUDIT_READ', 'REPORT_MODERATE', 'USER_DELETE', 'BILLING_STATS_READ', 'AI_USAGE_READ', 'AFFILIATE_STATS_READ'], system: true },
];
const adminPermissions = adminRoles[1]!.permissions.map((code) => ({ code, description: code, system: true }));
let managedDeleted = false;
const adminLog: { id: string; actorId: string; targetId: string; action: string; detail: string | null; outcome: 'SUCCESS' | 'FAILED'; createdAt: string }[] = [];
const deletionJobs = new Map<string, { targetId: string; actorId: string; step: string; status: string; lastError: null; createdAt: string; updatedAt: string }>();
const demoReports: { id: string; pollCode: string; question: string | undefined; reason: string; status: string; createdAt: string }[] = [];
const logAdmin = (targetId: string, action: string, detail: string | null = null) => adminLog.unshift({
  id: crypto.randomUUID(), actorId: activeUser.id, targetId, action, detail, outcome: 'SUCCESS', createdAt: new Date().toISOString(),
});
const detail = (id: string) => id === managedUser.id && !managedDeleted ? managedUser : id === activeUser.id
  ? { ...activeUser, status: 'ACTIVE', emailVerified: true } : null;

auth.push(
  http.get('*/api/admin/auth/users', ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    const items = [detail(activeUser.id)!, ...(managedDeleted ? [] : [managedUser])].filter((u) =>
      !search || u.username.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
    return HttpResponse.json({ items, total: items.length, page: 0, size: 10 });
  }),
  http.get('*/api/admin/auth/users/:id', ({ params }) => {
    const user = detail(String(params.id)); return user ? HttpResponse.json(user) : problem(404, 'Không tìm thấy tài khoản');
  }),
  http.put('*/api/admin/auth/users/:id/status', async ({ params, request }) => {
    if (params.id !== managedUser.id) return problem(409, 'Không thể tự khóa tài khoản');
    managedUser.status = ((await request.json()) as { status: string }).status;
    logAdmin(managedUser.id, managedUser.status === 'LOCKED' ? 'USER_LOCK' : 'USER_UNLOCK');
    return HttpResponse.json(managedUser);
  }),
  http.put('*/api/admin/auth/users/:id/roles/:role', ({ params }) => {
    if (params.id !== managedUser.id) return problem(409, 'Không thể tự đổi vai trò');
    const role = String(params.role);
    if (!adminRoles.some((r) => r.code === role)) return problem(404, 'Không tìm thấy vai trò');
    if (!managedUser.roles.includes(role)) managedUser.roles.push(role);
    managedUser.permissions = [...new Set(managedUser.roles.flatMap((r) => adminRoles.find((x) => x.code === r)?.permissions ?? []))];
    logAdmin(managedUser.id, 'USER_ROLE_GRANT', role);
    return HttpResponse.json(managedUser);
  }),
  http.delete('*/api/admin/auth/users/:id/roles/:role', ({ params }) => {
    const role = String(params.role);
    if (params.id !== managedUser.id || role === 'USER') return problem(409, 'Không thể gỡ vai trò');
    managedUser.roles = managedUser.roles.filter((r) => r !== role);
    managedUser.permissions = [...new Set(managedUser.roles.flatMap((r) => adminRoles.find((x) => x.code === r)?.permissions ?? []))];
    logAdmin(managedUser.id, 'USER_ROLE_REVOKE', role);
    return HttpResponse.json(managedUser);
  }),
  http.get('*/api/admin/auth/roles', () => HttpResponse.json(adminRoles)),
  http.post('*/api/admin/auth/roles', async ({ request }) => {
    const body = (await request.json()) as { code: string; name: string };
    if (adminRoles.some((r) => r.code === body.code)) return problem(409, 'Mã vai trò đã tồn tại');
    const role = { ...body, permissions: [] as string[], system: false }; adminRoles.push(role);
    logAdmin(body.code, 'ROLE_CREATE', body.name); return HttpResponse.json(role, { status: 201 });
  }),
  http.put('*/api/admin/auth/roles/:code', async ({ params, request }) => {
    const role = adminRoles.find((r) => r.code === params.code); if (!role) return problem(404, 'Không tìm thấy vai trò');
    role.name = ((await request.json()) as { name: string }).name; logAdmin(role.code, 'ROLE_UPDATE', role.name);
    return HttpResponse.json(role);
  }),
  http.put('*/api/admin/auth/roles/:code/permissions', async ({ params, request }) => {
    const role = adminRoles.find((r) => r.code === params.code); if (!role) return problem(404, 'Không tìm thấy vai trò');
    role.permissions = ((await request.json()) as { permissions: string[] }).permissions;
    logAdmin(role.code, 'ROLE_PERMISSIONS', role.permissions.join(',')); return HttpResponse.json(role);
  }),
  http.delete('*/api/admin/auth/roles/:code', ({ params }) => {
    const index = adminRoles.findIndex((r) => r.code === params.code && !r.system);
    if (index < 0) return problem(409, 'Không thể xóa vai trò');
    adminRoles.splice(index, 1); logAdmin(String(params.code), 'ROLE_DELETE'); return new HttpResponse(null, { status: 204 });
  }),
  http.get('*/api/admin/auth/permissions', () => HttpResponse.json(adminPermissions)),
  http.post('*/api/admin/auth/permissions', async ({ request }) => {
    const body = (await request.json()) as { code: string; description: string };
    if (adminPermissions.some((p) => p.code === body.code)) return problem(409, 'Mã quyền đã tồn tại');
    const permission = { ...body, system: false }; adminPermissions.push(permission);
    logAdmin(body.code, 'PERMISSION_CREATE', body.description); return HttpResponse.json(permission, { status: 201 });
  }),
  http.put('*/api/admin/auth/permissions/:code', async ({ params, request }) => {
    const permission = adminPermissions.find((p) => p.code === params.code);
    if (!permission) return problem(404, 'Không tìm thấy quyền');
    permission.description = ((await request.json()) as { description: string }).description;
    logAdmin(permission.code, 'PERMISSION_UPDATE', permission.description); return HttpResponse.json(permission);
  }),
  http.delete('*/api/admin/auth/permissions/:code', ({ params }) => {
    const index = adminPermissions.findIndex((p) => p.code === params.code && !p.system);
    if (index < 0) return problem(409, 'Không thể xóa quyền');
    adminPermissions.splice(index, 1); logAdmin(String(params.code), 'PERMISSION_DELETE'); return new HttpResponse(null, { status: 204 });
  }),
  http.get('*/api/admin/auth/audit', ({ request }) => {
    const query = new URL(request.url).searchParams;
    const outcome = query.get('outcome') ?? 'ALL';
    const search = (query.get('search') ?? '').toLowerCase();
    return HttpResponse.json(adminLog.filter((entry) => (outcome === 'ALL' || entry.outcome === outcome)
      && (!search || [entry.action, entry.targetId, entry.detail ?? ''].some((value) => value.toLowerCase().includes(search)))));
  }),
  http.get('*/api/admin/auth/users/:id/deletion', ({ params }) => {
    const job = deletionJobs.get(String(params.id)); return job ? HttpResponse.json(job) : problem(404, 'Chưa có yêu cầu xóa');
  }),
  http.post('*/api/admin/auth/users/:id/deletion', ({ params }) => {
    if (params.id !== managedUser.id) return problem(409, 'Không thể tự xóa');
    const at = new Date().toISOString();
    const job = { targetId: managedUser.id, actorId: activeUser.id, step: 'DONE', status: 'DONE', lastError: null, createdAt: at, updatedAt: at };
    deletionJobs.set(managedUser.id, job); managedDeleted = true;
    logAdmin(managedUser.id, 'USER_DELETE_COMPLETED'); return HttpResponse.json(job);
  }),
);
wardrobe.push(http.get('*/api/admin/wardrobe/users/:id/data', () => HttpResponse.json({ itemCount: closet.length })));
outfit.push(http.get('*/api/admin/outfits/users/:id/data', () => HttpResponse.json({ savedOutfitCount: 0 })));
billing.push(http.get('*/api/admin/billing/users/:id/data', () => HttpResponse.json({ plan: myPlan.plan, expiresAt: myPlan.expiresAt })));
voting.push(
  http.get('*/api/admin/polls/users/:id/data', () => HttpResponse.json({ pollCount: polls.length })),
  http.post('*/api/public/polls/:code/reports', async ({ params, request }) => {
    const poll = polls.find((p) => p.code === params.code); if (!poll) return problem(404, 'Không tìm thấy bình chọn');
    const reason = ((await request.json()) as { reason: string }).reason;
    demoReports.unshift({ id: crypto.randomUUID(), pollCode: poll.code, question: poll.question, reason, status: 'OPEN', createdAt: new Date().toISOString() });
    return new HttpResponse(null, { status: 201 });
  }),
  http.get('*/api/admin/polls/reports', ({ request }) => {
    const status = new URL(request.url).searchParams.get('status') ?? 'OPEN';
    return HttpResponse.json(demoReports.filter((r) => status === 'ALL' || r.status === status));
  }),
  http.put('*/api/admin/polls/reports/:id', async ({ params, request }) => {
    const report = demoReports.find((r) => r.id === params.id); if (!report) return problem(404, 'Không tìm thấy báo cáo');
    report.status = ((await request.json()) as { status: string }).status;
    if (report.status === 'HIDDEN') polls = polls.filter((p) => p.code !== report.pollCode);
    logAdmin(report.pollCode, `POLL_${report.status}`); return HttpResponse.json(report);
  }),
  http.get('*/api/admin/polls/audit', () => HttpResponse.json([])),
);

export const handlersByService: Record<string, HttpHandler[]> = { auth, wardrobe, outfit, voting, billing };
