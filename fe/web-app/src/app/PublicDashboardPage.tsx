import { AppstoreOutlined, CalendarOutlined, HeartOutlined, PlusOutlined, SkinOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ButtonLink, Card, PageHeader, ProgressBar } from '../shared/ui';
import { AppShell } from './AppShell';

const previewMetrics = [
  { icon: <SkinOutlined />, value: '10', label: 'Món đồ trong tủ' },
  { icon: <AppstoreOutlined />, value: '0', label: 'Outfit đã lưu' },
  { icon: <HeartOutlined />, value: '1', label: 'Bình chọn đang mở' },
  { icon: <CalendarOutlined />, value: '0', label: 'Đã kết thúc' },
];

/** Public, read-only preview of the personal home. All personal actions still require sign-in. */
export function PublicDashboardPage() {
  return (
    <AppShell publicPreview>
      <div className="stack-lg home-page public-dashboard">
        <PageHeader eyebrow="WEAR MORE. BUY SMARTER." title="Chào bạn! 👋"
          sub="Hôm nay bạn muốn mặc gì? Cùng tìm bộ đồ phù hợp nhé."
          action={<ButtonLink to="/outfits/suggest" small><PlusOutlined /> <span className="home-create-label">Tạo outfit mới</span></ButtonLink>} />
        <p className="public-dashboard-note">Bản xem trước với dữ liệu minh họa · <Link to="/register">Tạo tài khoản</Link> để bắt đầu với tủ đồ của bạn.</p>

        <div className="home-editorial-grid">
          <div className="stack"><Card className="home-hero-card">
            <div className="home-hero-photo" aria-hidden="true" />
            <div className="home-hero-glass"><span className="eyebrow home-kicker">✦ Quick Pick</span><h2>Hôm nay<br />mặc gì?</h2><p>Một chạm, AI chọn bộ đồ ưu tiên những món bạn lâu chưa mặc.</p><ButtonLink to="/outfits/suggest" kind="ghost" small>Gợi ý cho tôi →</ButtonLink></div>
            <div className="home-hero-stamp" aria-hidden="true">YOUR STYLE<br />YOUR STORY<br />✦</div>
          </Card></div>
          <Card className="home-poll-card"><div className="section-title"><h2>Bình chọn đang mở</h2><Link to="/ask-friends">Xem cách tham gia →</Link></div><h3>Đi hẹn hò tối nay nên mặc bộ nào?</h3><p className="small muted">● Đang nhận bình chọn · 18 lượt bình chọn</p><ProgressBar percent={67} /><ButtonLink to="/ask-friends" kind="outline" small>Mở link bạn bè gửi ↗</ButtonLink></Card>
        </div>

        <div className="metric-grid home-metrics" aria-label="Số liệu minh họa">
          {previewMetrics.map((metric) => <div className="metric-card" key={metric.label}><div className="metric-icon">{metric.icon}</div><div className="metric-copy"><strong>{metric.value}</strong><span>{metric.label}</span></div></div>)}
        </div>

        <div className="home-content-grid">
          <section className="home-collection-section"><div className="section-title"><div><span className="eyebrow">BỘ SƯU TẬP</span><h2>Outfit gần đây</h2></div><Link to="/outfits">Xem tất cả →</Link></div><div className="grid-cards">
            <Link to="/outfits" className="card outfit-card public-outfit-card"><div className="public-outfit-image" /><div className="outfit-card-body"><strong>Đi làm thanh lịch</strong><small>Phong cách · Casual</small></div></Link>
            <Link to="/outfits" className="card outfit-card public-outfit-card"><div className="public-outfit-image" /><div className="outfit-card-body"><strong>Cuối tuần nhẹ nhàng</strong><small>Phong cách · Streetwear</small></div></Link>
          </div></section>
          <section className="home-wardrobe-section"><div className="section-title"><div><span className="eyebrow">CỦA RIÊNG BẠN</span><h2>Tủ đồ của bạn</h2></div><Link to="/wardrobe">Xem tất cả →</Link></div><div className="public-wardrobe-grid">
            {['Áo sơ mi', 'Giày yêu thích', 'Phối đồ mới'].map((name, index) => <Link to="/wardrobe" className="public-wardrobe-card" key={name}><div className={`public-wardrobe-image image-${index}`} /><strong>{name}</strong><span>{index === 1 ? 'Phụ kiện' : 'Trang phục'}</span></Link>)}
          </div></section>
        </div>
      </div>
    </AppShell>
  );
}
