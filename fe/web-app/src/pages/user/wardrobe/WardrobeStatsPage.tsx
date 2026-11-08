import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, ButtonLink, EmptyState, ItemTile, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { CostPerWearSection } from '../../../components/user/wardrobe/CostPerWearSection';
import { useMyPlan } from '../../../hooks/user/billing/api';
import { useChangeStatus, useWardrobeStats } from '../../../hooks/user/wardrobe/api';
import type { WardrobeStats } from '../../../interface/dto/types';
import { ApiError, errorMessage } from '../../../services/shared/api/client';
import { CATEGORY_LABEL, categoryLabel } from '../../../services/shared/labels';
import './wardrobe-stats.css';

function Distribution({ title, rows, total, category = false }: { title: string; rows: { key: string; count: number }[]; total: number; category?: boolean }) {
  const label = (key: string) => key === 'UNKNOWN' ? (category ? 'Chưa phân loại' : 'Chưa có màu')
    : category ? CATEGORY_LABEL[key as keyof typeof CATEGORY_LABEL] ?? key : key;
  return <section className="wardrobe-stats-panel" aria-label={title}>
    <h2>{title}</h2>
    <ul className="stats-bars">{rows.map((row) => <li key={row.key}>
      <div className="spread"><span>{label(row.key)}</span><strong>{row.count} món</strong></div>
      <meter min={0} max={Math.max(total, 1)} value={row.count} aria-label={`${label(row.key)}: ${row.count} món`} />
    </li>)}</ul>
    {!category && <p className="small muted">Món nhiều màu được tính vào từng màu, nên tổng các màu có thể lớn hơn số món.</p>}
  </section>;
}

/** Gợi ý dọn tủ: món lâu không mặc, cất đi hoặc đánh dấu đã bán ngay tại chỗ. */
function Declutter({ days, rows }: { days: number; rows: WardrobeStats['declutterItems'] }) {
  const move = useChangeStatus();
  const [done, setDone] = useState('');
  const act = (itemIds: string[], status: 'ARCHIVED' | 'SOLD') => move.mutate({ itemIds, status }, {
    onSuccess: () => setDone(`${status === 'ARCHIVED' ? 'Đã cất đi' : 'Đã đánh dấu đã bán'} ${itemIds.length} món.`),
  });
  return <section className="wardrobe-stats-panel" aria-label="Gợi ý dọn tủ">
    <h2>Gợi ý dọn tủ</h2>
    {done && <Notice>{done} Xem lại bằng bộ lọc trạng thái trong tủ đồ.</Notice>}
    {move.isError && <Notice tone="error">{errorMessage(move.error)}</Notice>}
    {rows.length === 0 ? <p>Tủ đồ gọn gàng: không có món nào {days} ngày chưa mặc.</p> : <>
      <p className="muted">{rows.length} món đã {days} ngày chưa mặc. Cất đi cho tủ gọn hơn (không còn được gợi ý khi phối đồ), hoặc đánh dấu đã bán nếu bạn đã pass lại.</p>
      <ul className="stats-unused-list">
        {rows.map(({ item, lastWornAt, daysSinceWear }) => <li key={item.id} className="stats-declutter-row">
          <Link to={`/wardrobe/${item.id}`} className="stats-unused-item">
            <ItemTile category={item.category} imageUrl={item.imageUrl} />
            <div><strong>{categoryLabel(item.category)}</strong><span>{item.colors?.join(', ') || 'Chưa có màu'}</span></div>
            <div className="stats-wear-date"><strong>{lastWornAt === null ? 'Chưa từng mặc' : `${daysSinceWear} ngày chưa mặc`}</strong></div>
          </Link>
          <div className="row">
            <Button kind="outline" small disabled={move.isPending} onClick={() => act([item.id], 'ARCHIVED')}>Cất đi</Button>
            <Button kind="ghost" small disabled={move.isPending} onClick={() => act([item.id], 'SOLD')}>Đã bán</Button>
          </div>
        </li>)}
      </ul>
      <div className="row"><Button disabled={move.isPending} onClick={() => act(rows.map((row) => row.item.id), 'ARCHIVED')}>Cất đi cả {rows.length} món</Button></div>
    </>}
  </section>;
}

export function WardrobeStatsPage() {
  const qc = useQueryClient();
  const plan = useMyPlan();
  const allowed = plan.data?.features.includes('WARDROBE_STATS') ?? false;
  const stats = useWardrobeStats(allowed);
  const upgrade = <EmptyState title="Hiểu tủ đồ của bạn với Pro">
    <p>Xem loại đồ, màu sắc, tỉ lệ món đã mặc và những món có thể bạn đang bỏ quên.</p>
    <ButtonLink to="/plans">Khám phá gói Pro</ButtonLink>
  </EmptyState>;
  let content;
  if (plan.isPending) content = <Spinner label="Đang kiểm tra gói của bạn…" />;
  else if (plan.isError) content = <Notice tone="error">{errorMessage(plan.error)} <Button onClick={() => void plan.refetch()}>Thử lại</Button></Notice>;
  else if (!allowed) content = upgrade;
  else if (stats.isPending) content = <Spinner label="Đang tổng hợp tủ đồ và lịch sử mặc…" />;
  else if (stats.isError) content = stats.error instanceof ApiError && stats.error.status === 403 ? upgrade
    : <Notice tone="error">{errorMessage(stats.error)} <Button onClick={() => void stats.refetch()}>Thử lại</Button></Notice>;
  else if (stats.data) {
    const s = stats.data;
    content = <>
      <dl className="stats-summary">
        <div><dt>Món đã xác nhận</dt><dd>{s.totalItems}</dd></div>
        <div><dt>Món từng được mặc</dt><dd>{s.wornItems}<small> / {s.totalItems}</small></dd></div>
        <div><dt>Tỉ lệ đã mặc</dt><dd>{s.wearRatePercent.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%</dd></div>
        <div><dt>Chưa từng mặc</dt><dd>{s.neverWornItems}</dd></div>
      </dl>
      <p className="small muted">Chỉ tính món đã xác nhận. Lượt mặc lấy từ thao tác “Mặc bộ này”; ngày cập nhật {new Date(s.asOf).toLocaleDateString('vi-VN')}.</p>
      {s.totalItems === 0 ? <EmptyState title="Tủ đồ chưa có món đã xác nhận">
        <p>Thêm và xác nhận vài món đầu tiên để xem số liệu của bạn.</p><ButtonLink to="/wardrobe/add">Thêm món đồ</ButtonLink>
      </EmptyState> : <>
        <div className="stats-distributions">
          <Distribution title="Theo loại đồ" rows={s.byCategory} total={s.totalItems} category />
          <Distribution title="Theo màu sắc" rows={s.byColor} total={s.totalItems} />
        </div>
        <CostPerWearSection />
        <section className="wardrobe-stats-panel" aria-label="Món ít dùng">
          <h2>Chưa mặc hoặc lâu chưa mặc</h2>
          <p className="muted">{s.inactiveCount} món chưa từng mặc hoặc ít nhất {s.inactiveAfterDays} ngày chưa mặc. Hiện {s.unusedItems.length} món đầu tiên.</p>
          {s.unusedItems.length === 0 ? <p>Bạn đã mặc mọi món trong {s.inactiveAfterDays} ngày qua.</p> : <ul className="stats-unused-list">
            {s.unusedItems.map(({ item, lastWornAt, daysSinceWear }) => <li key={item.id}>
              <Link to={`/wardrobe/${item.id}`} className="stats-unused-item">
                <ItemTile category={item.category} imageUrl={item.imageUrl} />
                <div><strong>{categoryLabel(item.category)}</strong><span>{item.colors?.join(', ') || 'Chưa có màu'}</span></div>
                <div className="stats-wear-date"><strong>{lastWornAt === null ? 'Chưa từng mặc' : `${daysSinceWear} ngày chưa mặc`}</strong>
                  {lastWornAt && <span>Lần cuối {new Date(lastWornAt).toLocaleDateString('vi-VN')}</span>}
                </div>
              </Link>
            </li>)}
          </ul>}
          <Link to="/wardrobe?status=CONFIRMED&sort=LEAST_RECENTLY_WORN">Xem tủ đồ theo lần mặc</Link>
        </section>
        <Declutter days={s.declutterAfterDays} rows={s.declutterItems} />
      </>}
    </>;
  }
  return <div className="stack-lg wardrobe-stats">
    <PageHeader title="Thống kê tủ đồ" sub="Mặc nhiều hơn từ những món bạn đã có." back={{ to: '/wardrobe' }}
      action={allowed ? <Button kind="outline" disabled={stats.isFetching || plan.isFetching} onClick={() => { void plan.refetch(); void stats.refetch(); void qc.invalidateQueries({ queryKey: ['wardrobe', 'cost-per-wear'] }); }}>Làm mới</Button> : undefined} />
    {content}
  </div>;
}
