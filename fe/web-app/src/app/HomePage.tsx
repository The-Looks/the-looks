import { QuickPickCard } from '../features/outfit';
import { WardrobeSummary } from '../features/wardrobe';
import { ButtonLink, Card } from '../shared/ui';

/** Trang chủ ghép từ nhiều feature (ADR 0002: việc ghép làm ở app/, feature không import nhau). */
export function HomePage() {
  return (
    <div className="stack-lg">
      <header className="page-header">
        <span className="eyebrow">Wear More. Buy Smarter.</span>
        <h1>Chào bạn 👋</h1>
      </header>
      <QuickPickCard />
      <div className="grid-cards">
        <WardrobeSummary />
        <Card>
          <h2>Phối đồ theo dịp</h2>
          <p className="muted">Đi học, đi làm, đi chơi hay hẹn hò, AI chọn từ đồ bạn đang có.</p>
          <div>
            <ButtonLink to="/outfits/suggest" kind="ghost" small>
              Chọn dịp
            </ButtonLink>
          </div>
        </Card>
        <Card>
          <h2>Hỏi bạn bè</h2>
          <p className="muted">Phân vân giữa 2 bộ? Gửi link Zalo để bạn bè bình chọn ẩn danh.</p>
          <div>
            <ButtonLink to="/polls/new" kind="ghost" small>
              Tạo bình chọn
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
