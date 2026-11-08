import { AppstoreOutlined, CalendarOutlined, HeartOutlined, PlusOutlined, SkinOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MyPlanCard } from '../../../components/user/billing/MyPlanCard';
import { QuickPickCard } from '../../../components/user/outfit/QuickPickCard';
import { useSavedOutfits } from '../../../hooks/user/outfit/api';
import { useMyPolls } from '../../../hooks/user/voting/api';
import { WardrobeSummary } from '../../../components/user/wardrobe/WardrobeSummary';
import { useWardrobe } from '../../../hooks/user/wardrobe/api';
import { formatDate } from '../../../services/shared/format';
import { AssetPlaceholder, ButtonLink, Card, PageHeader, ProgressBar } from '../../../components/shared/ui/index';
import { HomeStoryDivider, HomeStoryReveal } from '../../../components/shared/home/HomeStory';
import { brand } from '../../../services/shared/brand';
import { authRequests } from '../../../services/guest/auth/requests';
import { readProfileDraft, type ProfileDraft } from '../../../services/user/profile/draft';
import { accountLook } from '../../../components/user/mascot/accountAvatar';
import { MascotAvatar } from '../../../components/user/mascot/MascotAvatar';
import { profileKey, profileRequests } from '../../../services/user/profile/requests';

const metric = (label: string, value: number | string, icon: React.ReactNode, detail: string) => (
  <div className="metric-card">
    <div className="metric-icon">{icon}</div>
    <div className="metric-copy"><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>
  </div>
);

export function HomePage() {
  const me = useQuery({ queryKey: ['me'], queryFn: authRequests.me });
  const profile = useQuery({ queryKey: profileKey, queryFn: profileRequests.get, enabled: Boolean(me.data) });
  const userId = me.data?.id;
  const mascot = userId ? accountLook(userId, profile.data) : undefined;
  const [profileDraft, setProfileDraft] = useState<ProfileDraft | null>(null);
  useEffect(() => {
    if (!userId) { setProfileDraft(null); return; }
    const refreshDraft = () => setProfileDraft(readProfileDraft(userId));
    refreshDraft();
    window.addEventListener('storage', refreshDraft);
    return () => window.removeEventListener('storage', refreshDraft);
  }, [userId]);
  const wardrobe = useWardrobe();
  const outfits = useSavedOutfits();
  const polls = useMyPolls();
  const openPolls = polls.data?.filter((poll) => Date.parse(poll.expiresAt) > Date.now()) ?? [];
  const featuredPoll = openPolls[0];

  return (
    <div className="stack-lg home-page">
      <PageHeader eyebrow={brand.tagline} title={<span className="home-greeting">
        {me.data?.username ? <>Chào <span className="editorial-title-accent">{me.data.username}!</span></> : 'Chào bạn!'}
        {mascot && <span className="home-greeting-mascot"><MascotAvatar look={mascot} portrait title="" /></span>}
      </span>}
        action={<ButtonLink to="/outfits/suggest" small><PlusOutlined /> <span className="home-create-label">Tạo outfit mới</span></ButtonLink>} />

      {profileDraft && <HomeStoryReveal><Card>
        <h2>Tiếp tục việc dở</h2>
        <p className="muted">Bạn có thông tin hồ sơ chưa lưu trên trình duyệt này.</p>
        <ButtonLink to="/profile" kind="outline" small>Tiếp tục chỉnh sửa hồ sơ</ButtonLink>
      </Card></HomeStoryReveal>}

      <div className="home-editorial-flow">
        <QuickPickCard />
        <HomeStoryDivider />
        <HomeStoryReveal>
          <Card className="home-poll-card">
            <div className="home-poll-copy">
              <div className="section-title"><h2>{brand.content.pollOpen}</h2><Link to="/polls">Xem tất cả →</Link></div>
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
            </div>
          </Card>
        </HomeStoryReveal>
      </div>

      <HomeStoryReveal><div className="metric-grid home-metrics" aria-label="Tổng quan hoạt động">
        {metric('Món đồ trong tủ', wardrobe.data?.length ?? '—', <SkinOutlined />, 'Sẵn sàng để phối')}
        {metric('Outfit đã lưu', outfits.data?.length ?? '—', <AppstoreOutlined />, 'Bộ đồ yêu thích')}
        {metric('Bình chọn đang mở', polls.data ? openPolls.length : '—', <HeartOutlined />, 'Bạn bè đang góp ý')}
        {metric('Đã kết thúc', polls.data ? polls.data.length - openPolls.length : '—', <CalendarOutlined />, 'Xem lại kết quả')}
      </div></HomeStoryReveal>

      <HomeStoryReveal><div className="home-content-grid">
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
            {outfits.data?.length === 0 && <Card><p className="muted">Bạn chưa lưu outfit nào.</p><ButtonLink to="/outfits/suggest" kind="ghost" small>Khám phá THE LOOKS AI</ButtonLink></Card>}
          </div>
        </section>
        <section className="home-wardrobe-section">
          <div className="section-title"><div><span className="eyebrow">CỦA RIÊNG BẠN</span><h2>Tủ đồ của bạn</h2></div><Link to="/wardrobe">Mở tủ đồ →</Link></div>
          <WardrobeSummary />
        </section>
      </div></HomeStoryReveal>
      <HomeStoryReveal><MyPlanCard /></HomeStoryReveal>
    </div>
  );
}
