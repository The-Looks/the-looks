import { ApiError, errorMessage } from '../../../services/shared/api/client';
import { Button, ButtonLink, Notice } from '../../shared/ui/index';
import { HomeBanner } from '../../shared/home/HomeBanner';
import { useQuickPick } from '../../../hooks/user/outfit/api';
import { OutfitCard } from './OutfitCard';
import { WeatherChip } from './WeatherChip';
import { FeedbackButtons } from './FeedbackButtons';
import { SaveButton } from './SaveButton';

/**
 * Quick Pick: một chạm, ưu tiên món lâu chưa mặc. Trang chủ dùng banner lớn; trang AI phối đồ dùng bản gọn
 * (compact) cho người chưa biết chọn dịp nào.
 */
export function QuickPickCard({ compact = false }: { compact?: boolean } = {}) {
  const pick = useQuickPick();
  const button = (
    <Button kind={compact ? 'outline' : undefined} onClick={() => pick.mutate()} disabled={pick.isPending}>
      {pick.isPending ? 'Đang chọn…' : pick.data ? 'Chọn bộ khác' : compact ? 'Chọn nhanh cho hôm nay' : 'Gợi ý cho tôi'}{' '}
      <span aria-hidden="true">→</span>
    </Button>
  );

  return (
    <div className="stack">
      {compact
        ? <div className="spread"><p className="muted" style={{ margin: 0 }}>Chưa biết chọn dịp nào? Để THE LOOKS AI chọn một bộ hợp thời tiết hôm nay.</p>{button}</div>
        : <><HomeBanner>{button}</HomeBanner><WeatherChip /></>}

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
