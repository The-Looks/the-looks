import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { Brand, Button, Notice, Spinner } from '../../../components/shared/ui/index';
import { SiteFooter } from '../../../components/shared/layout/SiteFooter';
import { usePreferences } from '../../../hooks/user/outfit/api';
import { useWardrobe } from '../../../hooks/user/wardrobe/api';
import { authRequests } from '../../../services/guest/auth/requests';
import { needsOnboarding, readOnboarding, updateOnboarding } from '../../../services/user/onboarding/progress';
import './onboarding.css';

const STEPS = ['Linh vật', 'Phong cách', 'Tủ đồ', 'Outfit'];

function useAccount() {
  return useQuery({ queryKey: ['me'], queryFn: authRequests.me });
}

function useDestination() {
  const { state } = useLocation();
  const from = (state as { from?: string } | null)?.from;
  return from?.startsWith('/') && !from.startsWith('//') && !from.includes('\\') &&
    !from.startsWith('/onboarding') ? from : '/';
}

function CheckNewAccount({ from }: { from: string }) {
  const preferences = usePreferences();
  const wardrobe = useWardrobe();

  if (preferences.isError || wardrobe.isError) return <Navigate to={from} replace />;
  if (preferences.isPending || wardrobe.isPending) return <Spinner label="Đang kiểm tra tủ đồ và phong cách…" />;
  return needsOnboarding(preferences.data, wardrobe.data)
    ? <Navigate to="/onboarding/welcome" state={{ from }} replace />
    : <Navigate to={from} replace />;
}

/** Leave established accounts and links to their original destination after sign-in. */
export function OnboardingEntry() {
  const account = useAccount();
  const from = useDestination();
  if (account.isPending) return <main className="onboarding-main"><Spinner label="Đang kiểm tra tài khoản…" /></main>;
  if (!account.data || account.data.roles.includes('ADMIN') || readOnboarding(account.data.id).dismissed) {
    return <Navigate to={from} replace />;
  }
  return <main className="onboarding-main"><CheckNewAccount from={from} /></main>;
}

export type OnboardingContext = { accountId: string; finish: () => void };

export function OnboardingLayout() {
  const account = useAccount();
  const { search } = useLocation();
  const welcome = useMatch('/onboarding/welcome');
  const wardrobe = useMatch('/onboarding/wardrobe');
  const navigate = useNavigate();
  const destination = useDestination();
  const [from] = useState(destination);
  const main = useRef<HTMLElement>(null);
  const stage = welcome ? 0 : !wardrobe ? 1
    : new URLSearchParams(search).get('step') === 'outfit' ? 3 : 2;
  useEffect(() => {
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [stage]);

  const finish = () => {
    if (account.data) updateOnboarding(account.data.id, { dismissed: true });
  };

  return (
    <div className="onboarding-shell">
      <header className="onboarding-top">
        <Brand />
        <Button kind="outline" onClick={() => { finish(); navigate(from, { replace: true }); }}>
          Bỏ qua hướng dẫn
        </Button>
      </header>
      <main className="onboarding-main stack-lg" ref={main} tabIndex={-1}>
        <ol className="onboarding-stages" aria-label="Tiến trình chào đón">
          {STEPS.map((label, index) => (
            <li key={label} aria-current={index === stage ? 'step' : undefined} data-reached={index <= stage}>
              {label}
            </li>
          ))}
        </ol>
        {account.isPending && <Spinner label="Đang tải tài khoản…" />}
        {account.isError && <Notice tone="error">Chưa tải được tài khoản. <Button onClick={() => void account.refetch()}>Thử lại</Button></Notice>}
        {account.data && <Outlet context={{ accountId: account.data.id, finish } satisfies OnboardingContext} />}
      </main>
      <SiteFooter variant="auth" />
    </div>
  );
}
