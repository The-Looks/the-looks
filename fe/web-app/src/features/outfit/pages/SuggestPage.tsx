import { useSearchParams } from 'react-router-dom';
import { ApiError, errorMessage } from '../../../shared/api/client';
import type { Occasion } from '../../../shared/api/types';
import { ButtonLink, EmptyState, Icon, Notice, PageHeader, Spinner } from '../../../shared/ui';
import { useSuggestions } from '../api';
import { FeedbackButtons } from '../components/FeedbackButtons';
import { OutfitCard } from '../components/OutfitCard';
import { SaveButton } from '../components/SaveButton';
import { OCCASIONS, occasionLabel } from '../occasions';

export function SuggestPage() {
  const [params, setParams] = useSearchParams();
  const selected = params.get('occasion');
  const occasion: Occasion | null = OCCASIONS.find(o => o.value === selected)?.value ?? null;
  const setOccasion = (value: Occasion) => setParams({ occasion: value });
  const suggestions = useSuggestions(occasion);

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow="AI phối đồ"
        title="Hôm nay bạn đi đâu?"
        sub="Chọn dịp, AI gợi ý outfit từ chính tủ đồ của bạn."
        action={
          <ButtonLink to="/outfits" kind="ghost" small>
            Outfit đã lưu
          </ButtonLink>
        }
      />

      <div className="grid-cards" role="radiogroup" aria-label="Chọn dịp">
        {OCCASIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={occasion === o.value}
            className="card"
            onClick={() => setOccasion(o.value)}
            style={{
              cursor: 'pointer',
              textAlign: 'left',
              font: 'inherit',
              borderColor: occasion === o.value ? 'var(--purple)' : undefined,
              background: occasion === o.value ? 'var(--lav-soft)' : undefined,
            }}
          >
            <span style={{ fontSize: 24 }} aria-hidden="true">
              <Icon name="spark" />
            </span>
            <h3>{o.label}</h3>
            <span className="small muted">{o.hint}</span>
          </button>
        ))}
      </div>

      {occasion && (
        <section className="stack" aria-live="polite">
          <h2>Gợi ý cho {occasionLabel(occasion)?.toLowerCase()}</h2>
          {suggestions.isPending && <Spinner label="AI đang phối đồ…" />}
          {suggestions.isError && (
            <Notice tone={suggestions.error instanceof ApiError && suggestions.error.status === 503 ? 'warn' : 'error'}>
              {errorMessage(suggestions.error)}
            </Notice>
          )}
          {suggestions.data?.length === 0 && (
            <EmptyState icon="🧺" title="Chưa đủ đồ để phối cho dịp này">
              <p>Thêm vài món áo, quần hoặc váy đã xác nhận vào tủ đồ.</p>
              <ButtonLink to="/wardrobe/add" small>
                Thêm món đồ
              </ButtonLink>
            </EmptyState>
          )}
          <div className="grid-cards">
            {suggestions.data?.map((s) => (
              <OutfitCard
                key={s.items.map((i) => i.id).join('-')}
                suggestion={s}
                actions={
                  <>
                    <SaveButton suggestion={s} />
                    <FeedbackButtons suggestion={s} />
                  </>
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
