import { BellOutlined, CrownOutlined, ExperimentOutlined, PieChartOutlined, SkinOutlined } from '@ant-design/icons';
import { AssetPlaceholder, ButtonLink, Card, PageHeader } from '../../../components/shared/ui/index';

export function NotificationsPage() {
  return <div className="stack-lg">
    <PageHeader eyebrow="CẬP NHẬT" title="Thông báo" sub="Theo dõi bình chọn và gợi ý mới dành cho bạn." />
    <Card className="feature-empty-card">
      <BellOutlined className="feature-empty-icon" />
      <h2>Chưa có thông báo mới</h2>
      <p className="muted">Khi bạn bè bình chọn hoặc có gợi ý mới, thông báo sẽ xuất hiện ở đây.</p>
      <ButtonLink to="/polls" kind="ghost" small>Xem bình chọn</ButtonLink>
    </Card>
  </div>;
}

export function PremiumPage() {
  return <div className="stack-lg">
    <PageHeader eyebrow="THE LOOKS PREMIUM" title="Nâng tầm phong cách mỗi ngày" sub="Khám phá thêm các khả năng dành cho tủ đồ của bạn." back={{ to: '/profile' }} />
    <Card hero className="premium-hero"><CrownOutlined /><h2>Phong cách của bạn, nhiều lựa chọn hơn.</h2><p className="muted">Tính năng và giá gói Premium sẽ được công bố sau.</p></Card>
    <div className="grid-cards">
      <Card><ExperimentOutlined className="premium-feature-icon" /><h2>THE LOOKS AI</h2><p className="muted">Ý tưởng phối đồ theo dịp và gu cá nhân.</p></Card>
      <Card><SkinOutlined className="premium-feature-icon" /><h2>Tủ đồ thông minh</h2><p className="muted">Tìm lại và kết hợp những món bạn đang có.</p></Card>
      <Card><PieChartOutlined className="premium-feature-icon" /><h2>Thống kê phong cách</h2><p className="muted">Hiểu cách bạn sử dụng tủ đồ.</p></Card>
    </div>
    <div className="premium-preview"><AssetPlaceholder label="Ảnh giới thiệu Premium" assetPath="assets/premium/hero.jpg" /><p className="small muted">Logo và ảnh sẽ được bổ sung vào assets sau.</p></div>
  </div>;
}
