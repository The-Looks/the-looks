import { useQuery } from '@tanstack/react-query';
import { Button, Result } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { authApi, errorMessage, unwrap } from '../shared/api/client';
import { Notice, Spinner } from '../shared/ui';

/** UI guard for navigation; /api/admin/** remains protected by the backend permission check. */
export function RequireAdmin() {
  const me = useQuery({ queryKey: ['me'], queryFn: () => unwrap(authApi.GET('/api/app/me')) });
  if (me.isPending) return <main className="admin-page"><Spinner label="Đang kiểm tra quyền quản trị…" /></main>;
  if (me.isError) return <main className="admin-page"><Notice tone="error">{errorMessage(me.error)}</Notice></main>;
  if (!me.data.roles?.includes('ADMIN')) {
    return <Result status="403" title="Bạn không có quyền quản trị" subTitle="Dashboard chỉ dành cho tài khoản có role ADMIN." extra={<Link to="/"><Button type="primary">Về trang chủ</Button></Link>} />;
  }
  return <Outlet />;
}
