import { useParams } from 'react-router-dom';
import { errorMessage } from '../../../shared/api/client';
import { formatDateTime } from '../../../shared/lib/format';
import { Card, Notice, PageHeader, ProgressBar, Spinner } from '../../../shared/ui';
import { usePoll } from '../api';

export function PollDetailPage() {
  const { code = '' } = useParams();
  const poll = usePoll(code);
  const r = poll.data?.result;

  return (
    <div className="stack-lg">
      <PageHeader title={poll.data?.question ?? 'Kết quả bình chọn'} back={{ to: '/polls', label: 'Bình chọn' }} />
      {poll.isPending && <Spinner />}
      {poll.isError && <Notice tone="error">{errorMessage(poll.error)}</Notice>}
      {poll.data && (
        <Card>
          <p className="small muted">Mở đến {formatDateTime(poll.data.expiresAt)}</p>
          {r && (
            <div className="stack">
              {(['A', 'B'] as const).map((k) => (
                <div key={k} className="stack" style={{ gap: 4 }}>
                  <div className="spread">
                    <strong>Set {k}</strong>
                    <span>{k === 'A' ? r.percentA : r.percentB}%</span>
                  </div>
                  <ProgressBar percent={k === 'A' ? r.percentA : r.percentB} />
                </div>
              ))}
              <span className="small muted">{r.votesA + r.votesB} lượt bình chọn</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
