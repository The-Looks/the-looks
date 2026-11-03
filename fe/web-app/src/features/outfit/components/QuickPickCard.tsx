import { ApiError, errorMessage } from '../../../shared/api/client';
import { Button, ButtonLink, Card, Notice } from '../../../shared/ui';
import { useQuickPick } from '../api';
import { OutfitCard } from './OutfitCard';
import { FeedbackButtons } from './FeedbackButtons';
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
          <h2>
            Hôm nay
            <br />
            mặc gì?
          </h2>
          <p>Một chạm, AI chọn bộ đồ ưu tiên những món bạn lâu chưa mặc.</p>
          <Button kind="ghost" onClick={() => pick.mutate()} disabled={pick.isPending}>
            {pick.isPending ? 'Đang chọn…' : pick.data ? 'Chọn bộ khác' : 'Gợi ý cho tôi'}{' '}
            <span aria-hidden="true">→</span>
          </Button>
        </div>
        <div className="home-hero-stamp" aria-hidden="true">
          YOUR STYLE
          <br />
          YOUR STORY
          <br />✦
        </div>
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
      {pick.data && (
        <OutfitCard
          suggestion={pick.data}
          actions={
            <>
              <SaveButton suggestion={pick.data} />
              <FeedbackButtons suggestion={pick.data} onDisliked={() => pick.mutate()} />
            </>
          }
        />
      )}
    </div>
  );
}
