import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { errorMessage } from '../../../shared/api/client';
import type { Category } from '../../../shared/api/types';
import { CATEGORY_LABEL, categoryLabel } from '../../../shared/lib/labels';
import { Button, Card, Chip, ItemTile, Notice, PageHeader, Spinner } from '../../../shared/ui';
import { useConfirm, useDelete, useItem } from '../api';

export function ItemDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const item = useItem(id);
  const confirm = useConfirm(id);
  const remove = useDelete();
  const [category, setCategory] = useState<Category | undefined>();

  useEffect(() => {
    if (item.data?.category) setCategory(item.data.category);
  }, [item.data?.category]);

  return (
    <div className="stack-lg">
      <PageHeader title={categoryLabel(item.data?.category)} back={{ to: '/wardrobe', label: 'Tủ đồ' }} />
      {item.isPending && <Spinner />}
      {item.isError && <Notice tone="error">{errorMessage(item.error)}</Notice>}
      {item.data && (
        <Card>
          <div style={{ maxWidth: 260 }}>
            <ItemTile category={item.data.category} imageUrl={item.data.imageUrl} />
          </div>
          {item.data.status === 'PROCESSING' && <Spinner label="AI đang nhận diện món đồ…" />}
          {item.data.status !== 'PROCESSING' && (
            <>
              <h2>Loại đồ</h2>
              <div className="row">
                {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                  <Chip key={value} active={category === value} onClick={() => setCategory(value as Category)}>
                    {label}
                  </Chip>
                ))}
              </div>
              <p className="small muted">
                Màu: {item.data.colors?.join(', ') || '—'} · Phong cách: {item.data.styleTags?.join(', ') || '—'}
              </p>
            </>
          )}
          {(confirm.isError || remove.isError) && <Notice tone="error">{errorMessage(confirm.error ?? remove.error)}</Notice>}
          <div className="row">
            {item.data.status === 'PENDING_REVIEW' && (
              <Button
                onClick={() => confirm.mutate({ category, colors: item.data.colors, seasons: item.data.seasons, styleTags: item.data.styleTags })}
                disabled={confirm.isPending || !category}
              >
                Xác nhận
              </Button>
            )}
            <Button kind="outline" onClick={() => remove.mutate(id, { onSuccess: () => navigate('/wardrobe') })} disabled={remove.isPending}>
              Xoá món này
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
