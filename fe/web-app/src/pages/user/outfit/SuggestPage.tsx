import { useSearchParams } from 'react-router-dom';
import { AppstoreOutlined, BookOutlined, CoffeeOutlined, HeartOutlined, LaptopOutlined } from '@ant-design/icons';
import { ApiError, errorMessage } from '../../../services/shared/api/client';
import type { Occasion } from '../../../interface/dto/types';
import { ButtonLink, EmptyState, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { useSuggestions } from '../../../hooks/user/outfit/api';
import { FeedbackButtons } from '../../../components/user/outfit/FeedbackButtons';
import { OutfitCard } from '../../../components/user/outfit/OutfitCard';
import { SaveButton } from '../../../components/user/outfit/SaveButton';
import { ShoppingCard } from '../../../components/user/outfit/ShoppingCard';
import { OCCASIONS, occasionLabel } from '../../../services/user/outfit/occasions';
import { WeatherChip } from '../../../components/user/outfit/WeatherChip';
import { ScrollReveal } from '../../../components/shared/home/HomeStory';

const occasionIcons = {
  SCHOOL: <BookOutlined />,
  WORK: <LaptopOutlined />,
  HANGOUT: <CoffeeOutlined />,
  DATE: <HeartOutlined />,
} as const;

export function SuggestPage() {
  // Dịp nằm trên URL (/outfits/suggest?occasion=WORK) để link từ trang chủ mở thẳng đúng dịp
  const [params, setParams] = useSearchParams();
  const occasion: Occasion | null = OCCASIONS.find((o) => o.value === params.get('occasion'))?.value ?? null;
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
      <WeatherChip />

      <ScrollReveal><div className="grid-cards occasion-grid reveal-list" role="radiogroup" aria-label="Chọn dịp">
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
            <span className="occasion-icon" aria-hidden="true">{occasionIcons[o.value]}</span>
            <h3>{o.label}</h3>
            <span className="small muted">{o.hint}</span>
          </button>
        ))}
      </div></ScrollReveal>

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
            <EmptyState icon={<AppstoreOutlined />} title="Chưa đủ đồ để phối cho dịp này">
              <p>Thêm vài món áo, quần hoặc váy đã xác nhận vào tủ đồ.</p>
              <ButtonLink to="/wardrobe/add" small>
                Thêm món đồ
              </ButtonLink>
            </EmptyState>
          )}
          <ScrollReveal><div className="grid-cards suggestion-results reveal-list">
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
          </div></ScrollReveal>
        </section>
      )}

      {occasion && <ShoppingCard occasion={occasion} />}
    </div>
  );
}
