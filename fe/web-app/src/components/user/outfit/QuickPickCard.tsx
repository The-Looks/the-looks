import { ApiError, errorMessage } from '../../../services/shared/api/client';
import { brand } from '../../../services/shared/brand';
import { Button, ButtonLink, Card, Notice } from '../../shared/ui/index';
import { useQuickPick } from '../../../hooks/user/outfit/api';
import { OutfitCard } from './OutfitCard';
import { SaveButton } from './SaveButton';

/** Thẻ Quick Pick trên trang chủ: một chạm, ưu tiên món lâu chưa mặc. */
export function QuickPickCard() {
  const pick = useQuickPick();

  return (
    <div className="stack">
      <Card className="home-hero-card">
        <div className="home-hero-photo" aria-hidden="true" />
        <div className="home-hero-glass">
          <span className="eyebrow home-kicker">✦ Quick Pick</span>
          <h2>{brand.content.quickPickTitle}</h2>
          <p>{brand.content.quickPickDescription}</p>
          <Button kind="ghost" onClick={() => pick.mutate()} disabled={pick.isPending}>
            {pick.isPending ? 'Đang chọn…' : pick.data ? 'Chọn bộ khác' : 'Gợi ý cho tôi'} <span aria-hidden="true">→</span>
          </Button>
        </div>
        <div className="home-hero-stamp" aria-hidden="true">YOUR STYLE<br />YOUR STORY<br />✦</div>
      </Card>

      {pick.isError && (
        <Notice tone={pick.error instanceof ApiError && pick.error.status === 503 ? 'warn' : 'error'}>
          {errorMessage(pick.error)}
        </Notice>
      )}
      {pick.isSuccess && pick.data === null && (
        <Notice>
          Tủ đồ chưa đủ món để phối. Thêm ít nhất 1 áo và 1 quần (hoặc 1 váy) rồi thử lại.{' '}
          <ButtonLink to="/wardrobe/add" kind="outline" small>
            Thêm món đồ
          </ButtonLink>
        </Notice>
      )}
      {pick.data && <OutfitCard suggestion={pick.data} actions={<SaveButton suggestion={pick.data} />} />}
    </div>
  );
}
