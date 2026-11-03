import { createBrowserRouter } from 'react-router-dom';
import { GoogleCallbackPage } from '../pages/guest/auth/GoogleCallbackPage';
import { LoginPage } from '../pages/guest/auth/LoginPage';
import { RegisterPage } from '../pages/guest/auth/RegisterPage';
import { AdminDashboardPage } from '../pages/admin/dashboard/AdminDashboardPage';
import { BillingResultPage } from '../pages/user/billing/BillingResultPage';
import { PlansPage } from '../pages/user/billing/PlansPage';
import { OutfitDetailPage } from '../pages/user/outfit/OutfitDetailPage';
import { SavedOutfitsPage } from '../pages/user/outfit/SavedOutfitsPage';
import { StylePreferencesPage } from '../pages/user/outfit/StylePreferencesPage';
import { SuggestPage } from '../pages/user/outfit/SuggestPage';
import { ProfilePage } from '../pages/user/profile/ProfilePage';
import { NotificationsPage, PremiumPage } from '../pages/user/profile/ExtraPages';
import { CreatePollPage } from '../pages/user/voting/CreatePollPage';
import { MyPollsPage } from '../pages/user/voting/MyPollsPage';
import { PollDetailPage } from '../pages/user/voting/PollDetailPage';
import { PublicPollPage } from '../pages/guest/voting/PublicPollPage';
import { GuestLandingPage } from '../pages/guest/voting/GuestLandingPage';
import { AddItemPage } from '../pages/user/wardrobe/AddItemPage';
import { ItemDetailPage } from '../pages/user/wardrobe/ItemDetailPage';
import { WardrobePage } from '../pages/user/wardrobe/WardrobePage';
import { ButtonLink, EmptyState } from '../components/shared/ui/index';
import { AppShell } from '../components/shared/routing/AppShell';
import { HomePage } from '../pages/user/home/HomePage';
import { HomeEntry } from './HomeEntry';
import { PublicHomePage } from '../pages/guest/home/PublicHomePage';
import { RequireAuth } from '../components/shared/routing/RequireAuth';
import { RequireAdmin } from '../components/shared/routing/RequireAdmin';

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
