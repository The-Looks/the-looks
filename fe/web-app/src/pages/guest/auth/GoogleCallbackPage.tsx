import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { session, useSession } from '../../../services/shared/session';
import { BackLink, Card, Notice, Spinner } from '../../../components/shared/ui/index';
import { AuthHeader } from '../../../components/guest/auth/AuthHeader';
import { SiteFooter } from '../../../components/shared/layout/SiteFooter';

export function GoogleCallbackPage() {
  const { isAuthenticated } = useSession();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) void session.refresh().then((active) => { if (!active) setFailed(true); });
  }, [isAuthenticated]);

  if (isAuthenticated) return <Navigate to="/" replace />;
  return (
    <main className="auth-page">
      <Card className="auth-card">
        <AuthHeader to="/" label="Trang chủ" />
        {failed ? (
          <div className="stack">
            <Notice tone="error">Không hoàn tất đăng nhập Google. Vui lòng thử lại.</Notice>
            <BackLink to="/login">Quay lại đăng nhập</BackLink>
          </div>
        ) : <Spinner label="Đang hoàn tất đăng nhập Google…" />}
        <SiteFooter variant="auth" />
      </Card>
    </main>
  );
}
