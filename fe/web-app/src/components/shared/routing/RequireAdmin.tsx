import { useQuery } from '@tanstack/react-query';
import { Button, Result } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { authApi, errorMessage, unwrap } from '../../../services/shared/api/client';
import { Notice, Spinner } from '../ui/index';

/** UI guard for navigation; /api/admin/** remains protected by the backend permission check. */
export function RequireAdmin() {
  const me = useQuery({ queryKey: ['me'], queryFn: () => unwrap(authApi.GET('/api/app/me')) });
  if (me.isPending) return <main className="admin-page"><Spinner label="Đang kiểm tra quyền quản trị…" /></main>;
  if (me.isError) return <main className="admin-page"><Notice tone="error">{errorMessage(me.error)}</Notice></main>;
  if (!me.data.permissions?.includes('ADMIN_ACCESS')) {
    return <Result status="403" title="Bạn không có quyền quản trị" subTitle="Tài khoản chưa có quyền truy cập quản trị." extra={<Link to="/"><Button type="primary">Về trang chủ</Button></Link>} />;
  }
  return <Outlet />;
}
