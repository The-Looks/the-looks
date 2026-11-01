import { useQuery } from '@tanstack/react-query';
import { authApi, errorMessage, unwrap } from '../../../shared/api/client';
import { formatDate } from '../../../shared/lib/format';
import { session } from '../../../shared/lib/session';
import { Button, Card, Notice, PageHeader, Spinner } from '../../../shared/ui';

export function ProfilePage() {
  const me = useQuery({ queryKey: ['me'], queryFn: () => unwrap(authApi.GET('/api/app/me')) });

  return (
    <div className="stack-lg">
      <PageHeader title="Cá nhân" />
      {me.isPending && <Spinner />}
      {me.isError && <Notice tone="error">{errorMessage(me.error)}</Notice>}
      {me.data && (
        <Card>
          <h2>{me.data.username}</h2>
          <p className="muted">{me.data.email}</p>
          <p className="small muted">Tham gia từ {formatDate(me.data.createdAt)}</p>
        </Card>
      )}
      <Card>
        <h2>Dữ liệu của bạn</h2>
        <p className="small muted">
          The Looks chỉ lưu ảnh từng món đồ bạn tải lên. Bạn có thể xoá từng món trong tủ đồ bất cứ lúc nào.
        </p>
        <div>
          <Button kind="outline" onClick={() => void session.logout()}>
            Đăng xuất
          </Button>
        </div>
      </Card>
    </div>
  );
}
