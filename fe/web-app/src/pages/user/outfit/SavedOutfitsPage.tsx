import { Link } from 'react-router-dom';
import { HeartOutlined } from '@ant-design/icons';
import { errorMessage } from '../../../services/shared/api/client';
import { formatDate } from '../../../services/shared/format';
import { Badge, ButtonLink, EmptyState, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { useSavedOutfits } from '../../../hooks/user/outfit/api';
import { useWardrobe } from '../../../hooks/user/wardrobe/api';
import { ScrollReveal } from '../../../components/shared/home/HomeStory';
import { occasionLabel } from '../../../services/user/outfit/occasions';

export function SavedOutfitsPage() {
  const outfits = useSavedOutfits();
  const wardrobe = useWardrobe();

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
        <EmptyState icon={<HeartOutlined />} title="Chưa có outfit nào">
          <p>Lưu gợi ý bạn thích để mặc lại hoặc rủ bạn bè bình chọn.</p>
          <ButtonLink to="/outfits/suggest" small>Khám phá LOOKSY AI</ButtonLink>
        </EmptyState>
      )}
      <ScrollReveal><div className="grid-cards saved-outfit-list reveal-list">
        {outfits.data?.map((o, index) => {
          const image = o.itemIds.map((id) => wardrobe.data?.find((item) => item.id === id)?.imageUrl).find(Boolean);
          return <Link key={o.id} to={`/outfits/${o.id}`} className="card saved-outfit-card">
            <div className="saved-outfit-cover">
              {image && <img src={image} alt="" loading="lazy" />}
              <span>LOOK {String(index + 1).padStart(2, '0')}</span>
            </div>
            <div className="saved-outfit-info">
            <div className="spread">
              {occasionLabel(o.occasion) ? (
                <Badge>{occasionLabel(o.occasion)}</Badge>
              ) : (
                <Badge tone="pink">Tự phối</Badge>
              )}
              <span className="small muted">{formatDate(o.createdAt)}</span>
            </div>
            <h3>{o.itemIds.length} món</h3>
            </div>
          </Link>;
        })}
      </div></ScrollReveal>
    </div>
  );
}
