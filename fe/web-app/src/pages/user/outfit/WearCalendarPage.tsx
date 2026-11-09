import { CalendarOutlined } from '@ant-design/icons';
import { Badge, Button, ButtonLink, EmptyState, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { useMyPlan } from '../../../hooks/user/billing/api';
import { usePlanDay, useSavedOutfits, useUnplanDay, useWearCalendar, useWearOutfit } from '../../../hooks/user/outfit/api';
import { useWardrobe } from '../../../hooks/user/wardrobe/api';
import { ApiError, errorMessage } from '../../../services/shared/api/client';
import { occasionLabel } from '../../../services/user/outfit/occasions';

/** Ngày hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD (giống cách backend tính ngày đã mặc). */
export function todayInVietnam(now = new Date()) {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const PAST_DAYS = 7;
const NEXT_DAYS = 14;

function dayLabel(date: string, today: string) {
  if (date === today) return 'Hôm nay';
  if (date === addDays(today, 1)) return 'Ngày mai';
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', timeZone: 'UTC' });
}

/** Lịch mặc (Pro): 7 ngày trước để xem đã mặc gì, 14 ngày tới để lên lịch outfit đã lưu. */
export function WearCalendarPage() {
  const plan = useMyPlan();
  const allowed = plan.data?.features.includes('WEAR_CALENDAR') ?? false;
  const today = todayInVietnam();
  const from = addDays(today, -PAST_DAYS);
  const to = addDays(today, NEXT_DAYS - 1);
  const calendar = useWearCalendar(from, to, allowed);
  const outfits = useSavedOutfits();
  const wardrobe = useWardrobe();
  const planDay = usePlanDay();
  const unplanDay = useUnplanDay();
  const wear = useWearOutfit();

  const upgrade = <EmptyState icon={<CalendarOutlined />} title="Lên lịch outfit cả tuần với Pro">
    <p>Chọn trước outfit cho từng ngày, sáng ra chỉ việc mặc. Xem lại ngày nào đã mặc gì để không bị lặp đồ.</p>
    <ButtonLink to="/plans">Khám phá gói Pro</ButtonLink>
  </EmptyState>;

  const cover = (outfitId: string) => {
    const outfit = outfits.data?.find((o) => o.id === outfitId);
    return outfit?.itemIds.map((id) => wardrobe.data?.find((item) => item.id === id)?.imageUrl).find(Boolean);
  };
  const outfitName = (outfitId: string) => {
    const index = outfits.data?.findIndex((o) => o.id === outfitId) ?? -1;
    const o = outfits.data?.[index];
    if (!o) return 'Outfit đã xoá';
    return `LOOK ${String(index + 1).padStart(2, '0')} · ${occasionLabel(o.occasion) ?? 'Tự phối'}`;
  };

  let content;
  if (plan.isPending) content = <Spinner label="Đang kiểm tra gói của bạn…" />;
  else if (plan.isError) content = <Notice tone="error">{errorMessage(plan.error)}</Notice>;
  else if (!allowed) content = upgrade;
  else if (calendar.isPending || outfits.isPending) content = <Spinner label="Đang tải lịch mặc…" />;
  else if (calendar.isError) content = calendar.error instanceof ApiError && calendar.error.status === 403 ? upgrade
    : <Notice tone="error">{errorMessage(calendar.error)} <Button onClick={() => void calendar.refetch()}>Thử lại</Button></Notice>;
  else if (outfits.data?.length === 0) content = <EmptyState icon={<CalendarOutlined />} title="Chưa có outfit đã lưu">
    <p>Lưu vài outfit bạn thích trước, rồi quay lại để xếp lịch.</p>
    <ButtonLink to="/outfits/suggest" small>Nhờ THE LOOKS AI gợi ý</ButtonLink>
  </EmptyState>;
  else {
    const byDate = new Map((calendar.data ?? []).map((d) => [d.date, d]));
    const dates = Array.from({ length: PAST_DAYS + NEXT_DAYS }, (_, i) => addDays(from, i));
    content = <ol className="stack wear-calendar">
      {dates.map((date) => {
        const day = byDate.get(date);
        const planned = day?.plannedOutfitId ?? null;
        const worn = day?.wornOutfitIds ?? [];
        const past = date < today;
        if (past && !planned && worn.length === 0) return null;
        const image = planned ? cover(planned) : undefined;
        return <li key={date} className="card wear-calendar-day" aria-label={dayLabel(date, today)}>
          <div className="spread">
            <strong>{dayLabel(date, today)}</strong>
            {worn.length > 0 && <Badge tone="green">Đã mặc{worn.length > 1 ? ` ${worn.length} bộ` : ''}</Badge>}
          </div>
          {planned && <div className="row">
            {image && <img src={image} alt="" loading="lazy" width={56} height={56} style={{ objectFit: 'cover', borderRadius: 8 }} />}
            <span>{outfitName(planned)}</span>
          </div>}
          {!past && <div className="row">
            <select aria-label={`Chọn outfit cho ${dayLabel(date, today)}`} value={planned ?? ''} disabled={planDay.isPending}
              onChange={(e) => e.target.value
                ? planDay.mutate({ date, outfitId: e.target.value })
                : unplanDay.mutate(date)}>
              <option value="">— Chưa lên lịch —</option>
              {outfits.data?.map((o) => <option key={o.id} value={o.id}>{outfitName(o.id)}</option>)}
            </select>
            {date === today && planned && !worn.includes(planned) &&
              <Button small disabled={wear.isPending} onClick={() => wear.mutate(planned)}>Mặc bộ này</Button>}
          </div>}
        </li>;
      })}
    </ol>;
  }

  return (
    <div className="stack-lg">
      <PageHeader title="Lịch mặc" back={{ to: '/outfits' }}
        sub="Xếp outfit đã lưu cho 2 tuần tới; ngày đã mặc được đánh dấu tự động khi bạn bấm “Mặc bộ này”." />
      {(planDay.isError || unplanDay.isError || wear.isError) &&
        <Notice tone="error">{errorMessage(planDay.error ?? unplanDay.error ?? wear.error)}</Notice>}
      {content}
    </div>
  );
}
