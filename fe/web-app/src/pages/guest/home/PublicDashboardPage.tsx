import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ButtonLink, Card, PageHeader } from '../../../components/shared/ui/index';
import { AppShell } from '../../../components/shared/routing/AppShell';
import { HomeStoryDivider, HomeStoryReveal } from '../../../components/shared/home/HomeStory';
import { brand } from '../../../services/shared/brand';

/** Public, read-only preview of the personal home. All personal actions still require sign-in. */
export function PublicDashboardPage() {
  return (
    <AppShell publicPreview>
      <div className="stack-lg home-page public-dashboard">
        <PageHeader title="Phong cách của bạn"
          action={<ButtonLink to="/outfits/suggest" small><PlusOutlined /> <span className="home-create-label">Tạo outfit mới</span></ButtonLink>} />
        <p className="public-dashboard-note"><Link to="/register">Tạo tài khoản</Link> để bắt đầu với tủ đồ và bình chọn của bạn.</p>

        <div className="home-editorial-flow">
          <div className="stack"><Card className="home-hero-card">
            <div className="home-hero-photo" aria-hidden="true" />
            <div className="home-hero-glass"><span className="home-kicker">Quick Pick</span><h2>{brand.content.quickPickTitle}</h2><p>{brand.content.quickPickDescription}</p><ButtonLink to="/outfits/suggest" kind="ghost" small>Gợi ý cho tôi →</ButtonLink></div>
          </Card></div>
          <HomeStoryDivider />
          <HomeStoryReveal><Card className="home-poll-card"><div className="home-poll-copy"><div className="section-title"><h2>{brand.content.pollOpen}</h2><Link to="/ask-friends">Xem cách tham gia →</Link></div><h3>Bạn bè giúp bạn chọn outfit</h3><p className="small muted">Tạo link bình chọn riêng rồi gửi cho bạn bè. Người nhận có thể bình chọn mà không cần tài khoản.</p><ButtonLink to="/ask-friends" kind="outline" small>Tìm hiểu cách bình chọn ↗</ButtonLink></div></Card></HomeStoryReveal>
        </div>
        <HomeStoryReveal><Card><div className="section-title"><h2>Không gian của riêng bạn</h2></div><p className="muted">Đăng nhập để xem tủ đồ, outfit đã lưu và kết quả bình chọn từ dữ liệu thật của bạn.</p><ButtonLink to="/login" small>Đăng nhập</ButtonLink></Card></HomeStoryReveal>
      </div>
    </AppShell>
  );
}
