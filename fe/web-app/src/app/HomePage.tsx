import { AppstoreOutlined, CalendarOutlined, HeartOutlined, PlusOutlined, SkinOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { MyPlanCard } from '../features/billing';
import { QuickPickCard, useSavedOutfits } from '../features/outfit';
import { useMyPolls } from '../features/voting';
import { WardrobeSummary, useWardrobe } from '../features/wardrobe';
import { formatDate } from '../shared/lib/format';
import { AssetPlaceholder, ButtonLink, Card, PageHeader, ProgressBar } from '../shared/ui';

const metric = (label: string, value: number | string, icon: React.ReactNode, detail: string) => (
  <div className="metric-card">
    <div className="metric-icon">{icon}</div>
    <div className="metric-copy"><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>
  </div>
);

export function HomePage() {
  const wardrobe = useWardrobe();
  const outfits = useSavedOutfits();
  const polls = useMyPolls();
  const openPolls = polls.data?.filter((poll) => Date.parse(poll.expiresAt) > Date.now()) ?? [];
  const featuredPoll = openPolls[0];

  return (
    <div className="stack-lg home-page">
      <PageHeader eyebrow="WEAR MORE. BUY SMARTER." title="Chào bạn! 👋"
        sub="Hôm nay bạn muốn mặc gì? Cùng tìm bộ đồ phù hợp nhé."
        action={<ButtonLink to="/outfits/suggest" small><PlusOutlined /> <span className="home-create-label">Tạo outfit mới</span></ButtonLink>} />

      <div className="home-editorial-grid">
        <QuickPickCard />
        <Card className="home-poll-card">
          <div className="section-title"><h2>Bình chọn đang mở</h2><Link to="/polls">Xem tất cả →</Link></div>
          {featuredPoll ? (
            <>
              <h3>{featuredPoll.question ?? 'Set nào đẹp hơn?'}</h3>
              <p className="small muted">● Đang nhận bình chọn · {featuredPoll.result ? featuredPoll.result.votesA + featuredPoll.result.votesB : 0} lượt bình chọn · kết thúc {formatDate(featuredPoll.expiresAt)}</p>
              {featuredPoll.result && <ProgressBar percent={featuredPoll.result.percentA} />}
              <ButtonLink to={`/polls/${featuredPoll.code}`} kind="outline" small>Xem chi tiết ↗</ButtonLink>
            </>
          ) : (
            <>
              <p className="muted">Chưa có bình chọn nào đang mở. Tạo link để bạn bè giúp bạn chọn outfit.</p>
              <ButtonLink to="/polls/new" kind="outline" small>Tạo bình chọn</ButtonLink>
            </>
          )}
        </Card>
      </div>

      <div className="metric-grid home-metrics" aria-label="Tổng quan hoạt động">
        {metric('Món đồ trong tủ', wardrobe.data?.length ?? '—', <SkinOutlined />, 'Sẵn sàng để phối')}
        {metric('Outfit đã lưu', outfits.data?.length ?? '—', <AppstoreOutlined />, 'Bộ đồ yêu thích')}
        {metric('Bình chọn đang mở', polls.data ? openPolls.length : '—', <HeartOutlined />, 'Bạn bè đang góp ý')}
        {metric('Đã kết thúc', polls.data ? polls.data.length - openPolls.length : '—', <CalendarOutlined />, 'Xem lại kết quả')}
      </div>

      <div className="home-content-grid">
        <section className="home-collection-section">
          <div className="section-title"><div><span className="eyebrow">BỘ SƯU TẬP</span><h2>Outfit gần đây</h2></div><Link to="/outfits">Xem tất cả →</Link></div>
          <div className="grid-cards">
            {outfits.data?.slice(0, 3).map((outfit, index) => {
              const preview = outfit.itemIds.map((id) => wardrobe.data?.find((item) => item.id === id)?.imageUrl).find(Boolean);
              return (
                <Link className="card outfit-card" key={outfit.id} to={`/outfits/${outfit.id}`}>
                  {preview ? <img className="outfit-cover" src={preview} alt={`Outfit ${index + 1}`} loading="lazy" /> : <AssetPlaceholder label={`Outfit ${index + 1}`} assetPath={`assets/outfits/${outfit.id}.jpg`} />}
                  <div className="outfit-card-body"><strong>Outfit {index + 1}</strong><small>{outfit.itemIds.length} món · lưu {formatDate(outfit.createdAt)}</small></div>
                </Link>
              );
            })}
            {outfits.data?.length === 0 && <Card><p className="muted">Bạn chưa lưu outfit nào.</p><ButtonLink to="/outfits/suggest" kind="ghost" small>Khám phá LOOKSY AI</ButtonLink></Card>}
          </div>
        </section>
        <section className="home-wardrobe-section">
          <div className="section-title"><div><span className="eyebrow">CỦA RIÊNG BẠN</span><h2>Tủ đồ của bạn</h2></div><Link to="/wardrobe">Mở tủ đồ →</Link></div>
          <WardrobeSummary />
        </section>
      </div>
      <MyPlanCard />
    </div>
  );
}
