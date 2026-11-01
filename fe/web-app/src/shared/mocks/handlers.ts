import { delay, http, HttpResponse, type HttpHandler } from 'msw';
import type { Category, OutfitSuggestion, Poll, SavedOutfit, WardrobeItem } from '../api/types';
import { DEMO_USER, sampleCloset } from './data';
import { makeMockJwt } from './devJwt';

// Giả lập API theo đúng contract trong be/packages/contracts. Dữ liệu chỉ nằm trong bộ nhớ trình duyệt.
const problem = (status: number, detail: string) =>
  HttpResponse.json(
    { status, title: 'Error', detail },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );

// ---------------- auth ----------------
let refreshActive = false;
const auth: HttpHandler[] = [
  http.post('*/api/public/auth/register', async ({ request }) => {
    const body = (await request.json()) as { email: string; username: string };
    return HttpResponse.json({ ...DEMO_USER, email: body.email, username: body.username }, { status: 201 });
  }),
  http.post('*/api/public/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    await delay(300);
    if (!body.email || !body.password) return problem(401, 'Sai email hoặc mật khẩu');
    refreshActive = true;
    const { token, expiresAt } = makeMockJwt(DEMO_USER.id, ['USER']);
    return HttpResponse.json({ accessToken: token, expiresAt });
  }),
  http.post('*/api/public/auth/refresh', async () => {
    if (!refreshActive) return problem(401, 'Chưa có phiên đăng nhập');
    const { token, expiresAt } = makeMockJwt(DEMO_USER.id, ['USER']);
    return HttpResponse.json({ accessToken: token, expiresAt });
  }),
  http.post('*/api/public/auth/logout', () => {
    refreshActive = false;
    return new HttpResponse(null, { status: 204 });
  }),
  http.get('*/api/public/auth/google/start', ({ request }) => {
    refreshActive = true;
    return HttpResponse.redirect(new URL('/auth/callback', request.url).toString(), 302);
  }),
  http.get('*/api/app/me', () => HttpResponse.json(DEMO_USER)),
];

// ---------------- wardrobe ----------------
let closet: WardrobeItem[] = structuredClone(sampleCloset);
const guessCategories: Category[] = ['TOP', 'BOTTOM', 'DRESS', 'SHOES'];

const wardrobe: HttpHandler[] = [
  http.get('*/api/app/wardrobe/items', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    return HttpResponse.json(
      closet.filter((i) => (!status || i.status === status) && (!category || i.category === category)),
    );
  }),
  http.post('*/api/app/wardrobe/items', async ({ request }) => {
    const form = await request.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return problem(400, 'Thiếu ảnh');
    const item: WardrobeItem = {
      id: crypto.randomUUID(),
      status: 'PROCESSING',
      imageUrl: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
    };
    closet = [item, ...closet];
    // Giả lập AI nhận diện chạy nền ~2 giây
    setTimeout(() => {
      closet = closet.map((i) =>
        i.id === item.id
          ? {
              ...i,
              status: 'PENDING_REVIEW',
              category: guessCategories[closet.length % 4],
              colors: ['white'],
              seasons: [],
              styleTags: ['casual'],
            }
          : i,
      );
    }, 2000);
    return HttpResponse.json(item, { status: 202 });
  }),
  http.get('*/api/app/wardrobe/items/:id', ({ params }) => {
    const item = closet.find((i) => i.id === params.id);
    return item ? HttpResponse.json(item) : problem(404, 'Không tìm thấy món đồ');
  }),
  http.post('*/api/app/wardrobe/items/:id/confirm', async ({ params, request }) => {
    const attrs = (await request.json()) as Partial<WardrobeItem>;
    closet = closet.map((i) => (i.id === params.id ? { ...i, ...attrs, status: 'CONFIRMED' } : i));
    return HttpResponse.json(closet.find((i) => i.id === params.id));
  }),
  http.put('*/api/app/wardrobe/items/:id', async ({ params, request }) => {
    const attrs = (await request.json()) as Partial<WardrobeItem>;
    closet = closet.map((i) => (i.id === params.id ? { ...i, ...attrs } : i));
    return HttpResponse.json(closet.find((i) => i.id === params.id));
  }),
  http.delete('*/api/app/wardrobe/items/:id', ({ params }) => {
    closet = closet.filter((i) => i.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];

// ---------------- outfit (chỉ khi không chạy outfit-service thật) ----------------
let savedOutfits: SavedOutfit[] = [];
const disliked = new Set<string>();
const comboKey = (ids: string[]) => [...ids].sort().join(',');
const confirmed = () => closet.filter((i) => i.status === 'CONFIRMED');
const toItem = (i: WardrobeItem) => ({ id: i.id, category: i.category ?? 'TOP', imageUrl: i.imageUrl });

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

const outfit: HttpHandler[] = [
  http.get('*/api/app/outfits/suggestions', ({ request }) =>
    HttpResponse.json(mockSuggestions(new URL(request.url).searchParams.get('occasion') ?? undefined)),
  ),
  http.get('*/api/app/outfits/quick-pick', () => {
    const s = mockSuggestions()[0];
    return s ? HttpResponse.json(s) : new HttpResponse(null, { status: 204 });
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
  http.post('*/api/app/outfits/:id/wear', () => new HttpResponse(null, { status: 204 })),
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
    monthlyPriceVnd: 39000,
    yearlyPriceVnd: 390000,
    limits: { wardrobeItems: 300, aiSuggestionsPerDay: 20 },
    features: [],
  },
  {
    plan: 'PRO',
    name: 'Pro',
    monthlyPriceVnd: 79000,
    yearlyPriceVnd: 790000,
    limits: { wardrobeItems: null, aiSuggestionsPerDay: 100 },
    features: ['WARDROBE_STATS', 'COST_PER_WEAR', 'WEAR_CALENDAR', 'TRY_ON_3D'],
  },
] as const;
let myPlan: { plan: 'FREE' | 'PLUS' | 'PRO'; expiresAt: string | null } = { plan: 'FREE', expiresAt: null };
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
      myPlan = { plan: order.plan, expiresAt: expires.toISOString() };
    }
    return HttpResponse.json({ orderCode: code, ...order });
  }),
];

export const handlersByService: Record<string, HttpHandler[]> = { auth, wardrobe, outfit, voting, billing };
