import { SkinOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import { CATEGORY_LABEL, categoryLabel } from '../../../services/shared/labels';
import { Badge, Button, ButtonLink, EmptyState, Field, ItemTile, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { useChangeStatus, useDeleteMany, useWardrobeSearch } from '../../../hooks/user/wardrobe/api';
import { changeWardrobeFilter, readWardrobeFilters, type WardrobeFilters } from '../../../services/user/wardrobe/filters';
import './wardrobe-search.css';

const STATUS_BADGE = {
  PROCESSING: { label: 'AI đang nhận diện', tone: 'amber' },
  PENDING_REVIEW: { label: 'Chờ xác nhận', tone: 'pink' },
  RECOGNITION_FAILED: { label: 'Nhận diện lỗi', tone: 'pink' },
  ARCHIVED: { label: 'Đã cất đi', tone: 'amber' },
  SOLD: { label: 'Đã bán', tone: 'green' },
} as const;

type Move = 'CONFIRMED' | 'ARCHIVED' | 'SOLD';
const MOVE_DONE: Record<Move, string> = { CONFIRMED: 'Đã đưa lại vào tủ', ARCHIVED: 'Đã cất đi', SOLD: 'Đã đánh dấu đã bán' };

export function WardrobePage() {
  const [params, setParams] = useSearchParams();
  const filters = readWardrobeFilters(params);
  const result = useWardrobeSearch(filters);
  const changeStatus = useChangeStatus();
  const deleteMany = useDeleteMany();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [done, setDone] = useState('');
  const toggle = (id: string) => setSelected((current) => {
    const next = new Set(current);
    if (!next.delete(id)) next.add(id);
    return next;
  });
  const stopSelecting = () => { setSelecting(false); setSelected(new Set()); };
  const startSelecting = () => { setSelecting(true); setDone(''); };
  const finished = (message: string) => () => { setDone(`${message} ${selected.size} món.`); setSelected(new Set()); };
  const move = (status: Move) => changeStatus.mutate({ itemIds: [...selected], status }, { onSuccess: finished(MOVE_DONE[status]) });
  const removeSelected = () => {
    if (window.confirm(`Xoá vĩnh viễn ${selected.size} món và ảnh của chúng?`)) deleteMany.mutate([...selected], { onSuccess: finished('Đã xoá') });
  };
  const busy = changeStatus.isPending || deleteMany.isPending;
  const bulkError = changeStatus.error ?? deleteMany.error;
  const change = (key: keyof WardrobeFilters, value: string) => setParams(changeWardrobeFilter(params, key, value), { replace: key === 'q' || key === 'color' || key === 'style' });
  const select = (key: keyof WardrobeFilters, label: string, options: Record<string, string>) => <div className="field">
    <label htmlFor={`filter-${key}`}>{label}</label>
    <select id={`filter-${key}`} value={filters[key] ?? ''} onChange={(event) => change(key, event.target.value)}>
      <option value="">Tất cả</option>{Object.entries(options).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
    </select>
  </div>;
  const data = result.data;
  const active = Boolean(filters.q || filters.category || filters.status || filters.color || filters.season || filters.style);
  const pages = data ? Math.ceil(data.total / filters.size) : 0;
  return <div className="stack-lg">
    <PageHeader title="Tủ đồ của tôi" sub={data ? `${data.total} món${active ? ' phù hợp' : ''}` : undefined}
      action={<div className="row"><Button kind="outline" small aria-pressed={selecting} onClick={selecting ? stopSelecting : startSelecting}>{selecting ? 'Xong' : 'Chọn nhiều'}</Button><ButtonLink to="/wardrobe/stats" kind="outline" small>Thống kê Pro</ButtonLink><ButtonLink to="/wardrobe/add" small>+ Thêm món</ButtonLink></div>} />
    <section className="wardrobe-filters" aria-label="Tìm và lọc tủ đồ">
      <Field id="filter-q" label="Tìm món đồ" type="search" maxLength={100} value={filters.q ?? ''} onChange={(event) => change('q', event.target.value)} placeholder="Loại đồ, màu, chất liệu, phong cách…" />
      {select('category', 'Loại đồ', CATEGORY_LABEL)}
      <Field id="filter-color" label="Màu" value={filters.color ?? ''} maxLength={30} onChange={(event) => change('color', event.target.value)} placeholder="Ví dụ: white" />
      {select('season', 'Mùa', { SPRING: 'Xuân', SUMMER: 'Hè', AUTUMN: 'Thu', WINTER: 'Đông' })}
      <Field id="filter-style" label="Phong cách" value={filters.style ?? ''} maxLength={30} onChange={(event) => change('style', event.target.value)} placeholder="Ví dụ: casual" />
      {select('status', 'Trạng thái', { CONFIRMED: 'Đã xác nhận', PENDING_REVIEW: 'Chờ xác nhận', PROCESSING: 'Đang xử lý', RECOGNITION_FAILED: 'Nhận diện lỗi', ARCHIVED: 'Đã cất đi', SOLD: 'Đã bán' })}
      <div className="field"><label htmlFor="filter-sort">Sắp xếp</label><select id="filter-sort" value={filters.sort} onChange={(event) => change('sort', event.target.value)}>
        <option value="NEWEST">Mới nhất</option><option value="LEAST_RECENTLY_WORN">Lâu chưa mặc</option>
      </select></div>
      <Button kind="outline" disabled={!active && filters.sort === 'NEWEST'} onClick={() => setParams({})}>Xoá bộ lọc</Button>
    </section>
    {filters.sort === 'LEAST_RECENTLY_WORN' && <p className="small muted">Món chưa mặc được xếp trước, tiếp theo là món có lần mặc gần nhất cách đây lâu nhất.</p>}
    {result.isPending && <Spinner />}
    {result.isError && <Notice tone="error">{errorMessage(result.error)} <Button kind="outline" small onClick={() => void result.refetch()}>Thử lại</Button></Notice>}
    {data && data.items.length === 0 && <EmptyState icon={<SkinOutlined />} title={active || filters.page > 0 ? 'Không tìm thấy món đồ' : 'Tủ đồ đang trống'}>
      <p>{active || filters.page > 0 ? 'Thử thay đổi bộ lọc hoặc quay về trang đầu.' : 'Chụp vài món bạn mặc nhiều nhất để bắt đầu.'}</p>
      {filters.page > 0 ? <Button onClick={() => change('page', '0')}>Về trang đầu</Button> : active ? <Button onClick={() => setParams({})}>Xoá bộ lọc</Button> : <ButtonLink to="/wardrobe/add" small>Thêm món đầu tiên</ButtonLink>}
    </EmptyState>}
    {done && <Notice>{done}</Notice>}
    {bulkError && <Notice tone="error">{errorMessage(bulkError)}</Notice>}
    {selecting && <div className="wardrobe-bulk-bar" role="toolbar" aria-label="Thao tác với các món đã chọn">
      <span aria-live="polite">Đã chọn {selected.size} món</span>
      <Button kind="ghost" small disabled={!data?.items.length} onClick={() => setSelected(new Set(data?.items.map((item) => item.id)))}>Chọn cả trang</Button>
      <Button small disabled={!selected.size || busy} onClick={() => move('ARCHIVED')}>Cất đi</Button>
      <Button kind="outline" small disabled={!selected.size || busy} onClick={() => move('SOLD')}>Đã bán</Button>
      <Button kind="outline" small disabled={!selected.size || busy} onClick={() => move('CONFIRMED')}>Đưa lại vào tủ</Button>
      <Button kind="outline" small disabled={!selected.size || busy} onClick={removeSelected}>Xoá</Button>
    </div>}
    <div className="wardrobe-grid" aria-busy={result.isFetching}>
      {data?.items.map((item) => {
        const badge = item.status !== 'CONFIRMED' ? STATUS_BADGE[item.status] : null;
        const body = <>
          <ItemTile category={item.category} imageUrl={item.imageUrl} />
          <div className="wardrobe-item-meta"><strong>{categoryLabel(item.category)}</strong>
            <small>{item.colors?.join(', ') || 'Chưa chọn màu'} · {item.styleTags?.join(', ') || 'Chưa chọn phong cách'}</small>
            {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
          </div>
        </>;
        return selecting
          ? <button key={item.id} type="button" className="wardrobe-item-card wardrobe-item-selectable" aria-pressed={selected.has(item.id)}
            onClick={() => toggle(item.id)}>{body}</button>
          : <Link key={item.id} to={`/wardrobe/${item.id}`} className="wardrobe-item-card">{body}</Link>;
      })}
    </div>
    {data && data.total > 0 && <nav className="wardrobe-pagination" aria-label="Phân trang tủ đồ">
      <span aria-live="polite">{data.items.length ? filters.page * filters.size + 1 : 0}–{data.items.length ? filters.page * filters.size + data.items.length : 0} / {data.total} món</span>
      <Button kind="outline" disabled={filters.page === 0 || result.isFetching} onClick={() => change('page', String(filters.page - 1))}>Trang trước</Button>
      <span>Trang {filters.page + 1}/{Math.max(pages, 1)}</span>
      <Button kind="outline" disabled={filters.page + 1 >= pages || result.isFetching} onClick={() => change('page', String(filters.page + 1))}>Trang sau</Button>
      <label>Số món mỗi trang <select aria-label="Số món mỗi trang" value={filters.size} onChange={(event) => change('size', event.target.value)}>{[12, 24, 48, 100].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
    </nav>}
  </div>;
}
