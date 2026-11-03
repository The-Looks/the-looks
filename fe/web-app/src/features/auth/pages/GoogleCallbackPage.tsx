import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { session, useSession } from '../../../shared/lib/session';
import { Brand, Card, Notice, Spinner } from '../../../shared/ui';

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
        <Brand />
        {failed ? (
          <div className="stack">
            <Notice tone="error">Không hoàn tất đăng nhập Google. Vui lòng thử lại.</Notice>
            <Link to="/login">Quay lại đăng nhập</Link>
          </div>
        ) : <Spinner label="Đang hoàn tất đăng nhập Google…" />}
      </Card>
    </main>
  );
}
