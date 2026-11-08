import { ApiError, errorMessage } from '../../../services/shared/api/client';
import { Button, ButtonLink, Notice } from '../../shared/ui/index';
import { HomeBanner } from '../../shared/home/HomeBanner';
import { useQuickPick } from '../../../hooks/user/outfit/api';
import { OutfitCard } from './OutfitCard';
import { WeatherChip } from './WeatherChip';
import { FeedbackButtons } from './FeedbackButtons';
import { SaveButton } from './SaveButton';

/** Thẻ Quick Pick trên trang chủ: một chạm, ưu tiên món lâu chưa mặc. */
export function QuickPickCard() {
  const pick = useQuickPick();

  return (
    <div className="stack">
      <HomeBanner>
        <Button onClick={() => pick.mutate()} disabled={pick.isPending}>
          {pick.isPending ? 'Đang chọn…' : pick.data ? 'Chọn bộ khác' : 'Gợi ý cho tôi'}{' '}
          <span aria-hidden="true">→</span>
        </Button>
      </HomeBanner>
      <WeatherChip />

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
