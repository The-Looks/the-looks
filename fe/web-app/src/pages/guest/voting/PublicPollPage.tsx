import { CheckCircleFilled, ClockCircleOutlined, HeartOutlined, LockOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import { formatDateTime } from '../../../services/shared/format';
import { AssetPlaceholder, Button, Notice, ProgressBar, Spinner } from '../../../components/shared/ui/index';
import { PublicHeader } from '../../../components/shared/layout/PublicHeader';
import { SiteFooter } from '../../../components/shared/layout/SiteFooter';
import { useCastVote, usePoll } from '../../../hooks/guest/voting/api';

export function PublicPollPage() {
  const { code = '' } = useParams();
  const poll = usePoll(code);
  const vote = useCastVote(code);
  const [choice, setChoice] = useState<'A' | 'B' | null>(null);
  const expired = !!poll.data && Date.parse(poll.data.expiresAt) <= Date.now();
  const showResult = expired || vote.isSuccess;
  const result = vote.data ?? poll.data?.result;
  const hoursLeft = poll.data ? Math.max(0, Math.ceil((Date.parse(poll.data.expiresAt) - Date.now()) / 3_600_000)) : 0;

  return (
    <div className="guest-page">
      <PublicHeader page="vote" />
      <main className="guest-layout">
        <Link className="back guest-vote-back" to="/ask-friends">‹ Quay lại</Link>
        <aside className="guest-side">
          <section className="guest-invite">
            <span className="guest-heart"><HeartOutlined /></span>
            <h2>Bạn bè mời bạn <span>chọn outfit</span></h2>
            <strong>Bình chọn ẩn danh</strong>
            <p>{poll.data ? `Còn ${hoursLeft} giờ để chọn · mở đến ${formatDateTime(poll.data.expiresAt)}` : 'Mở link để xem bình chọn'}</p>
            <span className="guest-no-login">Không cần cài app</span>
          </section>
          <section className="guest-info">
            <h3><ShareAltOutlined /> Bình chọn từ link Zalo</h3>
            <ol><li>Xem hai outfit được mời chọn.</li><li>Chạm vào set hợp nhất.</li><li>Gửi phiếu và xem kết quả.</li></ol>
            <hr /><p className="small muted"><LockOutlined /> Chỉ người có link mới xem được.</p>
          </section>
        </aside>

        <section className="guest-panel" aria-live="polite">
          {poll.isPending && <Spinner label="Đang tải bình chọn…" />}
          {poll.isError && <Notice tone="error">{errorMessage(poll.error)}</Notice>}
          {poll.data && (
            <>
              {!showResult ? (
                <>
                  <h1>{poll.data.question ?? 'Set nào hợp với mình hơn?'}</h1>
                  <p className="muted">Chạm vào một set để chọn rồi gửi bình chọn của bạn.</p>
                  <div className="guest-options" role="radiogroup" aria-label="Chọn outfit">
                    {(['A', 'B'] as const).map((value) => {
                      const option = value === 'A' ? poll.data.optionA : poll.data.optionB;
                      const image = option?.imageUrls?.[0];
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={choice === value}
                          className={`guest-option${choice === value ? ' selected' : ''}`}
                          disabled={vote.isPending}
                          onClick={() => setChoice(value)}
                        >
                          {image ? <img src={image} alt={`Outfit ${value}`} /> : <AssetPlaceholder label={`Ảnh outfit ${value}`} assetPath={`assets/polls/${code}-${value.toLowerCase()}.jpg`} />}
                          <span className="guest-option-label"><span className="guest-radio">{choice === value && <CheckCircleFilled />}</span><span><strong>Set {value}</strong><small>Chạm để chọn Set {value}</small></span></span>
                        </button>
                      );
                    })}
                  </div>
                  {vote.isError && <Notice tone="error">{errorMessage(vote.error)}</Notice>}
                  <div className="guest-actions">
                    <Button disabled={!choice || vote.isPending} onClick={() => choice && vote.mutate(choice)}>
                      {vote.isPending ? 'Đang gửi…' : 'Gửi bình chọn'} <span aria-hidden="true">→</span>
                    </Button>
                    <span><strong>Không cần tài khoản hoặc cài ứng dụng</strong><small>Kết quả hiện sau khi bạn gửi phiếu.</small></span>
                  </div>
                </>
              ) : (
                <div className="guest-result">
                  <CheckCircleFilled />
                  <h2>{expired && !vote.isSuccess ? 'Bình chọn đã kết thúc' : 'Cảm ơn bạn đã bình chọn!'}</h2>
                  <p className="muted">{expired && !vote.isSuccess ? 'Bạn có thể xem kết quả bên dưới.' : 'Phiếu của bạn đã được ghi nhận. Cùng xem bạn bè đã chọn set nào.'}</p>
                  {result ? (['A', 'B'] as const).map((value) => (
                    <div className="guest-result-row" key={value}>
                      <div><strong>Set {value}</strong><strong>{value === 'A' ? result.percentA : result.percentB}%</strong></div>
                      <ProgressBar percent={value === 'A' ? result.percentA : result.percentB} />
                    </div>
                  )) : <p className="muted">Kết quả sẽ hiển thị khi có bình chọn.</p>}
                  <div className="row" style={{ justifyContent: 'center', marginTop: 28 }}>
                    <Link to="/ask-friends" className="btn btn-outline">Khám phá THE LOOKS</Link>
                  </div>
                </div>
              )}
              <div className="guest-footer"><ClockCircleOutlined /> Liên kết riêng tư · Không cần tài khoản để bình chọn</div>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
