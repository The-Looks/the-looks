import { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../../../shared/api/client';
import type { Category } from '../../../shared/api/types';
import { CATEGORY_LABEL, categoryLabel } from '../../../shared/lib/labels';
import { Badge, ButtonLink, Chip, EmptyState, ItemTile, Notice, PageHeader, Spinner } from '../../../shared/ui';
import { useWardrobe } from '../api';

const STATUS_BADGE = {
  PROCESSING: { label: 'AI đang nhận diện', tone: 'amber' },
  PENDING_REVIEW: { label: 'Chờ xác nhận', tone: 'pink' },
  RECOGNITION_FAILED: { label: 'Nhận diện lỗi', tone: 'pink' },
} as const;

export function WardrobePage() {
  const [category, setCategory] = useState<Category | undefined>();
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const items = useWardrobe(undefined, category);
  const visible = items.data?.filter((item) => {
    const text = [categoryLabel(item.category), item.colors?.join(' '), item.styleTags?.join(' ')].join(' ').toLowerCase();
    return text.includes(search.trim().toLowerCase());
  });

  return (
    <div className="stack-lg">
      <PageHeader
        title="Tủ đồ của tôi"
        sub={items.data ? `${items.data.length} món` : undefined}
        action={<ButtonLink to="/wardrobe/add" small>+ Thêm món</ButtonLink>}
      />
      <div className="wardrobe-toolbar">
        <div className="row" role="group" aria-label="Lọc theo loại">
          <Chip active={!category} onClick={() => setCategory(undefined)}>Tất cả</Chip>
          {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
            <Chip key={value} active={category === value} onClick={() => setCategory(value as Category)}>{label}</Chip>
          ))}
        </div>
        <Input
          style={{ width: 220 }} prefix={<SearchOutlined />} placeholder="Tìm theo màu, phong cách..."
          aria-label="Tìm món đồ" allowClear value={search}
          onChange={(event) => setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })}
        />
      </div>
      {items.isPending && <Spinner />}
      {items.isError && <Notice tone="error">{errorMessage(items.error)}</Notice>}
      {visible?.length === 0 && (
        <EmptyState icon="👗" title={items.data?.length ? 'Không tìm thấy món đồ' : 'Tủ đồ đang trống'}>
          <p>{items.data?.length ? 'Thử từ khóa khác hoặc chọn lại danh mục.' : 'Chụp vài món bạn mặc nhiều nhất để AI bắt đầu gợi ý.'}</p>
        </EmptyState>
      )}
      <div className="wardrobe-grid">
        {visible?.map((item) => {
          const badge = item.status !== 'CONFIRMED' ? STATUS_BADGE[item.status] : null;
          return (
            <Link key={item.id} to={`/wardrobe/${item.id}`} className="wardrobe-item-card">
              <ItemTile category={item.category} imageUrl={item.imageUrl} />
              <div className="wardrobe-item-meta">
                <strong>{categoryLabel(item.category)}</strong>
                <small>{item.colors?.join(', ') || 'Chưa chọn màu'} · {item.styleTags?.join(', ') || 'Đang phân loại'}</small>
                {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
