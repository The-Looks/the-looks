import { SkinOutlined } from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import { CATEGORY_LABEL, categoryLabel } from '../../../services/shared/labels';
import { Badge, Button, ButtonLink, EmptyState, Field, ItemTile, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { useWardrobeSearch } from '../../../hooks/user/wardrobe/api';
import { changeWardrobeFilter, readWardrobeFilters, type WardrobeFilters } from '../../../services/user/wardrobe/filters';
import './wardrobe-search.css';

const STATUS_BADGE = {
  PROCESSING: { label: 'AI đang nhận diện', tone: 'amber' },
  PENDING_REVIEW: { label: 'Chờ xác nhận', tone: 'pink' },
  RECOGNITION_FAILED: { label: 'Nhận diện lỗi', tone: 'pink' },
} as const;

export function WardrobePage() {
  const [params, setParams] = useSearchParams();
  const filters = readWardrobeFilters(params);
  const result = useWardrobeSearch(filters);
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
      action={<div className="row"><ButtonLink to="/wardrobe/stats" kind="outline" small>Thống kê Pro</ButtonLink><ButtonLink to="/wardrobe/add" small>+ Thêm món</ButtonLink></div>} />
    <section className="wardrobe-filters" aria-label="Tìm và lọc tủ đồ">
      <Field id="filter-q" label="Tìm món đồ" type="search" maxLength={100} value={filters.q ?? ''} onChange={(event) => change('q', event.target.value)} placeholder="Loại đồ, màu, chất liệu, phong cách…" />
      {select('category', 'Loại đồ', CATEGORY_LABEL)}
      <Field id="filter-color" label="Màu" value={filters.color ?? ''} maxLength={30} onChange={(event) => change('color', event.target.value)} placeholder="Ví dụ: white" />
      {select('season', 'Mùa', { SPRING: 'Xuân', SUMMER: 'Hè', AUTUMN: 'Thu', WINTER: 'Đông' })}
      <Field id="filter-style" label="Phong cách" value={filters.style ?? ''} maxLength={30} onChange={(event) => change('style', event.target.value)} placeholder="Ví dụ: casual" />
      {select('status', 'Trạng thái', { CONFIRMED: 'Đã xác nhận', PENDING_REVIEW: 'Chờ xác nhận', PROCESSING: 'Đang xử lý', RECOGNITION_FAILED: 'Nhận diện lỗi' })}
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
    <div className="wardrobe-grid" aria-busy={result.isFetching}>
      {data?.items.map((item) => {
        const badge = item.status !== 'CONFIRMED' ? STATUS_BADGE[item.status] : null;
        return <Link key={item.id} to={`/wardrobe/${item.id}`} className="wardrobe-item-card">
          <ItemTile category={item.category} imageUrl={item.imageUrl} />
          <div className="wardrobe-item-meta"><strong>{categoryLabel(item.category)}</strong>
            <small>{item.colors?.join(', ') || 'Chưa chọn màu'} · {item.styleTags?.join(', ') || 'Chưa chọn phong cách'}</small>
            {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
          </div>
        </Link>;
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
