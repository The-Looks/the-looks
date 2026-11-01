import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../../../shared/api/client';
import type { Category } from '../../../shared/api/types';
import { CATEGORY_LABEL } from '../../../shared/lib/labels';
import { Badge, ButtonLink, Chip, EmptyState, ItemTile, Notice, PageHeader, Spinner } from '../../../shared/ui';
import { useWardrobe } from '../api';

const STATUS_BADGE = {
  PROCESSING: { label: 'AI đang nhận diện', tone: 'amber' },
  PENDING_REVIEW: { label: 'Chờ xác nhận', tone: 'pink' },
  RECOGNITION_FAILED: { label: 'Nhận diện lỗi', tone: 'pink' },
} as const;

export function WardrobePage() {
  const [category, setCategory] = useState<Category | undefined>();
  const items = useWardrobe(undefined, category);

  return (
    <div className="stack-lg">
      <PageHeader
        title="Tủ đồ của tôi"
        sub={items.data ? `${items.data.length} món` : undefined}
        action={<ButtonLink to="/wardrobe/add" small>+ Thêm món</ButtonLink>}
      />
      <div className="row" role="group" aria-label="Lọc theo loại">
        <Chip active={!category} onClick={() => setCategory(undefined)}>
          Tất cả
        </Chip>
        {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
          <Chip key={value} active={category === value} onClick={() => setCategory(value as Category)}>
            {label}
          </Chip>
        ))}
      </div>
      {items.isPending && <Spinner />}
      {items.isError && <Notice tone="error">{errorMessage(items.error)}</Notice>}
      {items.data?.length === 0 && (
        <EmptyState icon="👗" title="Tủ đồ đang trống">
          <p>Chụp vài món bạn mặc nhiều nhất để AI bắt đầu gợi ý.</p>
        </EmptyState>
      )}
      <div className="grid-tiles">
        {items.data?.map((item) => {
          const badge = item.status !== 'CONFIRMED' ? STATUS_BADGE[item.status] : null;
          return (
            <Link key={item.id} to={`/wardrobe/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }} className="stack">
              <ItemTile category={item.category} imageUrl={item.imageUrl} />
              {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
