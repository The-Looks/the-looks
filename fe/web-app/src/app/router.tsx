import { createBrowserRouter } from 'react-router-dom';
import { GoogleCallbackPage, LoginPage, RegisterPage } from '../features/auth';
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage';
import { BillingResultPage, PlansPage } from '../features/billing';
import { OutfitDetailPage, SavedOutfitsPage, StylePreferencesPage, SuggestPage } from '../features/outfit';
import { ProfilePage } from '../features/profile';
import { NotificationsPage, PremiumPage } from '../features/profile/pages/ExtraPages';
import { CreatePollPage, MyPollsPage, PollDetailPage, PublicPollPage } from '../features/voting';
import { GuestLandingPage } from '../features/voting/pages/GuestLandingPage';
import { AddItemPage, ItemDetailPage, WardrobePage } from '../features/wardrobe';
import { ButtonLink, EmptyState } from '../shared/ui';
import { AppShell } from './AppShell';
import { HomePage } from './HomePage';
import { HomeEntry } from './HomeEntry';
import { PublicHomePage } from './PublicHomePage';
import { RequireAuth } from './RequireAuth';
import { RequireAdmin } from './RequireAdmin';

function NotFound() {
  return (
    <EmptyState icon="🧭" title="Không tìm thấy trang">
      <ButtonLink to="/" small>
        Về trang chủ
      </ButtonLink>
    </EmptyState>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <HomeEntry />, children: [{ element: <AppShell />, children: [{ index: true, element: <HomePage /> }] }] },
  { path: '/login', element: <LoginPage /> },
  { path: '/about', element: <PublicHomePage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/auth/callback', element: <GoogleCallbackPage /> },
  { path: '/ask-friends', element: <GuestLandingPage /> },
  { path: '/v/:code', element: <PublicPollPage /> },
  {
    element: <RequireAuth />,
    children: [
      { element: <RequireAdmin />, children: [{ path: 'admin', element: <AdminDashboardPage /> }] },
      {
        element: <AppShell />,
        children: [
          { path: 'onboarding', element: <StylePreferencesPage /> },
          { path: 'wardrobe', element: <WardrobePage /> },
          { path: 'wardrobe/add', element: <AddItemPage /> },
          { path: 'wardrobe/:id', element: <ItemDetailPage /> },
          { path: 'outfits/suggest', element: <SuggestPage /> },
          { path: 'outfits', element: <SavedOutfitsPage /> },
          { path: 'outfits/:id', element: <OutfitDetailPage /> },
          { path: 'polls', element: <MyPollsPage /> },
          { path: 'polls/new', element: <CreatePollPage /> },
          { path: 'polls/:code', element: <PollDetailPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/style', element: <StylePreferencesPage /> },
          { path: 'plans', element: <PlansPage /> },
          { path: 'billing/result', element: <BillingResultPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'premium', element: <PremiumPage /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);
