import { useParams } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import { formatDate } from '../../../services/shared/format';
import { Badge, Button, ButtonLink, Card, ItemTile, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { useOutfit, useWearOutfit } from '../../../hooks/user/outfit/api';
import { occasionLabel } from '../../../services/user/outfit/occasions';

export function OutfitDetailPage() {
  const { id = '' } = useParams();
  const outfit = useOutfit(id);
  const wear = useWearOutfit();

  return (
    <div className="stack-lg">
      <PageHeader title="Chi tiết outfit" back={{ to: '/outfits' }} />
      {outfit.isPending && <Spinner />}
      {outfit.isError && <Notice tone="error">{errorMessage(outfit.error)}</Notice>}
      {outfit.data && (
        <Card>
          <div className="spread">
            {occasionLabel(outfit.data.occasion) ? <Badge>{occasionLabel(outfit.data.occasion)}</Badge> : <span />}
            <span className="small muted">Lưu ngày {formatDate(outfit.data.createdAt)}</span>
          </div>
          <div className="grid-tiles">
            {outfit.data.itemImageUrls.length > 0
              ? outfit.data.itemImageUrls.map((url) => <ItemTile key={url} imageUrl={url} label="Món đồ" />)
              : outfit.data.itemIds.map((itemId) => <ItemTile key={itemId} label="Món đồ" />)}
          </div>
          <div className="row">
            <Button onClick={() => wear.mutate(id)} disabled={wear.isPending || wear.isSuccess}>
              {wear.isSuccess ? 'Đã ghi lại hôm nay ✓' : wear.isPending ? 'Đang lưu…' : 'Mặc bộ này'}
            </Button>
            <ButtonLink to={`/polls/new?outfit=${id}`} kind="outline">
              Hỏi bạn bè
            </ButtonLink>
          </div>
          {wear.isError && <Notice tone="error">{errorMessage(wear.error)}</Notice>}
          <p className="small muted">Bấm “Mặc bộ này” mỗi lần mặc để Quick Pick ưu tiên những món lâu chưa dùng.</p>
        </Card>
      )}
    </div>
  );
}
