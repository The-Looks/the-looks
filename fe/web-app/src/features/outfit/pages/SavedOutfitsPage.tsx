import { Link } from 'react-router-dom';
import { errorMessage } from '../../../shared/api/client';
import { formatDate } from '../../../shared/lib/format';
import { Badge, ButtonLink, EmptyState, Notice, PageHeader, Spinner } from '../../../shared/ui';
import { useSavedOutfits } from '../api';
import { occasionLabel } from '../occasions';

export function SavedOutfitsPage() {
  const outfits = useSavedOutfits();

  return (
    <div className="stack-lg">
      <PageHeader
        title="Outfit đã lưu"
        back={{ to: '/outfits/suggest', label: 'Phối đồ' }}
        action={
          <ButtonLink to="/outfits/suggest" small>
            Gợi ý mới
          </ButtonLink>
        }
      />
      {outfits.isPending && <Spinner />}
      {outfits.isError && <Notice tone="error">{errorMessage(outfits.error)}</Notice>}
      {outfits.data?.length === 0 && (
        <EmptyState icon="✨" title="Chưa có outfit nào">
          <p>Lưu gợi ý bạn thích để mặc lại hoặc rủ bạn bè bình chọn.</p>
        </EmptyState>
      )}
      <div className="grid-cards">
        {outfits.data?.map((o) => (
          <Link key={o.id} to={`/outfits/${o.id}`} className="card">
            <div className="spread">
              {occasionLabel(o.occasion) ? <Badge>{occasionLabel(o.occasion)}</Badge> : <Badge tone="pink">Tự phối</Badge>}
              <span className="small muted">{formatDate(o.createdAt)}</span>
            </div>
            <h3>{o.itemIds.length} món</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
