import { Link } from 'react-router-dom';
import { QuickPickCard } from '../features/outfit';
import { WardrobeSummary } from '../features/wardrobe';
import { ButtonLink, Card, Icon } from '../shared/ui';
export function HomePage() {
  return <div className="stack-lg home-page">
    <header className="page-header home-heading"><div><h1>Một ngày, một diện mạo.</h1><p className="muted">Khám phá cách mặc mới từ những món đồ quen thuộc.</p></div><ButtonLink to="/wardrobe/add" small>+ Thêm món đồ</ButtonLink></header>
    <QuickPickCard />
    <div className="home-grid"><WardrobeSummary /><div className="home-side">
      <Card className="occasion-card"><h2>Hôm nay bạn đi đâu?</h2><p className="muted">Tìm một bộ đồ hợp với kế hoạch của bạn.</p><div className="occasion-links">{[['Đi học', 'SCHOOL'], ['Đi làm', 'WORK'], ['Đi chơi', 'HANGOUT'], ['Hẹn hò', 'DATE']].map(([label, value]) => <Link key={value} to={`/outfits/suggest?occasion=${value}`}>{label}<Icon name="arrow" /></Link>)}</div></Card>
      <Card className="friends-card"><h2>Hai bộ đồ. Một lựa chọn.</h2><p className="muted">Để hội bạn thân giúp bạn chọn diện mạo yêu thích.</p><Link className="text-action" to="/polls/new">Hỏi ý kiến bạn bè <Icon name="arrow" /></Link></Card>
    </div></div>
    <Link className="saved-link" to="/outfits"><Icon name="heart" /><span>Những bộ đồ bạn muốn mặc lại</span><Icon name="arrow" /></Link>
  </div>;
}
