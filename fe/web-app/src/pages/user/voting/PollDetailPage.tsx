import { CopyOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import { formatDateTime } from '../../../services/shared/format';
import { Button, Card, Notice, PageHeader, ProgressBar, Spinner } from '../../../components/shared/ui/index';
import { usePoll } from '../../../hooks/guest/voting/api';

export function PollDetailPage() {
  const { code = '' } = useParams();
  const poll = usePoll(code);
  const r = poll.data?.result;
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);
  const shareUrl = `${window.location.origin}/v/${encodeURIComponent(code)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShareError(false);
    } catch {
      setCopied(false);
      setShareError(true);
    }
  };
  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: 'Bình chọn outfit cùng mình', url: shareUrl });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      await copy();
    }
  };

  return (
    <div className="stack-lg">
      <PageHeader title={poll.data?.question ?? 'Kết quả bình chọn'} back={{ to: '/polls', label: 'Bình chọn' }} />
      {poll.isPending && <Spinner />}
      {poll.isError && <Notice tone="error">{errorMessage(poll.error)}</Notice>}
      {poll.data && (
        <Card>
          <p className="small muted">Mở đến {formatDateTime(poll.data.expiresAt)}</p>
          <div className="row" style={{ marginBottom: 16 }}>
            <Button onClick={() => void share()}><ShareAltOutlined /> Chia sẻ</Button>
            <Button onClick={() => void copy()}><CopyOutlined /> {copied ? 'Đã sao chép' : 'Sao chép link'}</Button>
          </div>
          <input className="poll-share-link" readOnly value={shareUrl} aria-label="Link bình chọn" onFocus={(event) => event.target.select()} />
          {shareError && <Notice tone="warn">Không thể sao chép tự động. Hãy chọn link ở ô phía trên để sao chép.</Notice>}
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
