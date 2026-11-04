import type { OutfitSuggestion } from '../../../interface/dto/types';
import { errorMessage } from '../../../services/shared/api/client';
import { Button } from '../../shared/ui/index';
import { useRateSuggestion, type Vote } from '../../../hooks/user/outfit/api';

/** 👍 / 👎 trên một gợi ý. onDisliked: ví dụ Quick Pick tự chọn bộ khác. */
export function FeedbackButtons({ suggestion, onDisliked }: { suggestion: OutfitSuggestion; onDisliked?: () => void }) {
  const rate = useRateSuggestion();
  const voted = rate.isSuccess ? rate.variables.vote : null;

  const send = (vote: Vote) =>
    rate.mutate({ suggestion, vote }, { onSuccess: () => vote === 'DISLIKE' && onDisliked?.() });

  if (voted === 'LIKE') {
    return <span className="small muted">Đã ghi nhận, sẽ gợi ý bộ này nhiều hơn</span>;
  }
  return (
    <>
      <Button kind="ghost" small aria-label="Thích bộ này" onClick={() => send('LIKE')} disabled={rate.isPending}>
        👍
      </Button>
      <Button
        kind="ghost"
        small
        aria-label="Không thích bộ này"
        onClick={() => send('DISLIKE')}
        disabled={rate.isPending}
      >
        👎
      </Button>
      {rate.isError && (
        <span className="small" role="alert">
          {errorMessage(rate.error)}
        </span>
      )}
    </>
  );
}
