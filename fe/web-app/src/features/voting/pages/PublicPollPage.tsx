import { Link, useParams } from 'react-router-dom';
import { errorMessage } from '../../../shared/api/client';
import { formatDateTime } from '../../../shared/lib/format';
import { Brand, Button, Card, Notice, ProgressBar, Spinner } from '../../../shared/ui';
import { useCastVote, usePoll } from '../api';

export function PublicPollPage() {
  const { code = '' } = useParams();
  const poll = usePoll(code);
  const vote = useCastVote(code);
  const result = vote.data ?? poll.data?.result;
  const expired = !!poll.data && Date.parse(poll.data.expiresAt) <= Date.now();

  return (
    <main className="auth-page">
      <div className="stack-lg" style={{ width: 'min(100%, 680px)' }}>
        <Brand />
        {poll.isPending && <Spinner />}
        {poll.isError && <Notice tone="error">{errorMessage(poll.error)}</Notice>}
        {poll.data && (
          <>
            <header className="stack">
              <span className="eyebrow">Ask Friends</span>
              <h1>{poll.data.question ?? 'Set nào đẹp hơn?'}</h1>
              <p className="muted">Chọn một outfit. Bạn không cần đăng nhập.</p>
              <p className="small muted">Bình chọn đến {formatDateTime(poll.data.expiresAt)}</p>
            </header>
            {expired && <Notice tone="warn">Bình chọn đã kết thúc.</Notice>}
            {vote.isError && <Notice tone="error">{errorMessage(vote.error)}</Notice>}
            <div className="grid-cards">
              {(['A', 'B'] as const).map((choice) => {
                const option = choice === 'A' ? poll.data.optionA : poll.data.optionB;
                return (
                  <Card key={choice}>
                    <div className="stack">
                      <h2>Outfit {choice}</h2>
                      {option?.imageUrls?.length ? (
                        <div className="grid-cards">
                          {option.imageUrls.map((url, index) => (
                            <img key={url} src={url} alt={`Outfit ${choice}, ảnh ${index + 1}`} style={{ width: '100%', borderRadius: 12 }} />
                          ))}
                        </div>
                      ) : <p className="muted">Chưa có ảnh outfit.</p>}
                      <Button disabled={expired || vote.isPending || vote.isSuccess} onClick={() => vote.mutate(choice)}>
                        {vote.isSuccess ? 'Đã bình chọn' : `Chọn outfit ${choice}`}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
            {result && (
              <Card>
                <h2>Kết quả</h2>
                {(['A', 'B'] as const).map((choice) => (
                  <div className="stack" key={choice}>
                    <div className="spread"><span>Outfit {choice}</span><strong>{choice === 'A' ? result.percentA : result.percentB}%</strong></div>
                    <ProgressBar percent={choice === 'A' ? result.percentA : result.percentB} />
                  </div>
                ))}
              </Card>
            )}
          </>
        )}
        <Link to="/">Khám phá The Looks</Link>
      </div>
    </main>
  );
}
