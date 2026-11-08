import { Link } from 'react-router-dom';
import { CheckSquareOutlined } from '@ant-design/icons';
import { errorMessage } from '../../../services/shared/api/client';
import { formatDateTime } from '../../../services/shared/format';
import { Badge, ButtonLink, EmptyState, Notice, PageHeader, ProgressBar, Spinner } from '../../../components/shared/ui/index';
import { useMyPolls } from '../../../hooks/user/voting/api';
import { ScrollReveal } from '../../../components/shared/home/HomeStory';

export function MyPollsPage() {
  const polls = useMyPolls();

  return (
    <div className="stack-lg">
      <PageHeader
        title="Bình chọn của tôi"
        sub="Gửi 2 outfit cho bạn bè qua Zalo, họ chọn ẩn danh không cần cài app."
        action={<ButtonLink to="/polls/new" small>+ Tạo bình chọn</ButtonLink>}
      />
      {polls.isPending && <Spinner />}
      {polls.isError && <Notice tone="error">{errorMessage(polls.error)}</Notice>}
      {polls.data?.length === 0 && <EmptyState icon={<CheckSquareOutlined />} title="Chưa có bình chọn nào"><p>Chọn hai outfit và gửi link để bạn bè bình chọn.</p><ButtonLink to="/polls/new" small>Tạo bình chọn đầu tiên</ButtonLink></EmptyState>}
      <ScrollReveal><div className="grid-cards poll-list reveal-list">
        {polls.data?.map((p) => {
          const open = new Date(p.expiresAt) > new Date();
          return (
            <Link key={p.code} to={`/polls/${p.code}`} className="card poll-list-card">
              <div className="spread">
                <Badge tone={open ? 'green' : undefined}>{open ? 'Đang mở' : 'Đã đóng'}</Badge>
                <span className="small muted">Đến {formatDateTime(p.expiresAt)}</span>
              </div>
              <h3>{p.question ?? 'Set nào đẹp hơn?'}</h3>
              {p.result && (
                <>
                  <ProgressBar percent={p.result.percentA} />
                  <span className="small muted">
                    A {p.result.percentA}% · B {p.result.percentB}% · {p.result.votesA + p.result.votesB} lượt
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div></ScrollReveal>
    </div>
  );
}
