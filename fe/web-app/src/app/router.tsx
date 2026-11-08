import { lazy } from 'react';
import { CompassOutlined } from '@ant-design/icons';
import { createBrowserRouter } from 'react-router-dom';
import { ButtonLink, EmptyState } from '../components/shared/ui/index';
import { HomeEntry } from './HomeEntry';
import { RequireAuth } from '../components/shared/routing/RequireAuth';
import { RequireAdmin } from '../components/shared/routing/RequireAdmin';
import { AuthTransitionLayout } from '../components/guest/auth/AuthTransitionLayout';
import { RouteMotionLayout } from '../components/shared/routing/RouteMotionLayout';

const GoogleCallbackPage = lazy(() => import('../pages/guest/auth/GoogleCallbackPage').then((m) => ({ default: m.GoogleCallbackPage })));
const AppShell = lazy(() => import('../components/shared/routing/AppShell').then((m) => ({ default: m.AppShell })));
const legal = () => import('../pages/guest/legal/LegalPages');
const TermsPage = lazy(() => legal().then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => legal().then((m) => ({ default: m.PrivacyPage })));
const RefundPage = lazy(() => legal().then((m) => ({ default: m.RefundPage })));
const LoginPage = lazy(() => import('../pages/guest/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/guest/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const AdminDashboardPage = lazy(() => import('../pages/admin/dashboard/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const BillingResultPage = lazy(() => import('../pages/user/billing/BillingResultPage').then((m) => ({ default: m.BillingResultPage })));
const PlansPage = lazy(() => import('../pages/user/billing/PlansPage').then((m) => ({ default: m.PlansPage })));
const OutfitDetailPage = lazy(() => import('../pages/user/outfit/OutfitDetailPage').then((m) => ({ default: m.OutfitDetailPage })));
const WearCalendarPage = lazy(() => import('../pages/user/outfit/WearCalendarPage').then((m) => ({ default: m.WearCalendarPage })));
const SavedOutfitsPage = lazy(() => import('../pages/user/outfit/SavedOutfitsPage').then((m) => ({ default: m.SavedOutfitsPage })));
const StylePreferencesPage = lazy(() => import('../pages/user/outfit/StylePreferencesPage').then((m) => ({ default: m.StylePreferencesPage })));
const SuggestPage = lazy(() => import('../pages/user/outfit/SuggestPage').then((m) => ({ default: m.SuggestPage })));
const ProfilePage = lazy(() => import('../pages/user/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() => import('../pages/user/profile/ExtraPages').then((m) => ({ default: m.NotificationsPage })));
const PremiumPage = lazy(() => import('../pages/user/profile/ExtraPages').then((m) => ({ default: m.PremiumPage })));
const CreatePollPage = lazy(() => import('../pages/user/voting/CreatePollPage').then((m) => ({ default: m.CreatePollPage })));
const MyPollsPage = lazy(() => import('../pages/user/voting/MyPollsPage').then((m) => ({ default: m.MyPollsPage })));
const PollDetailPage = lazy(() => import('../pages/user/voting/PollDetailPage').then((m) => ({ default: m.PollDetailPage })));
const PublicPollPage = lazy(() => import('../pages/guest/voting/PublicPollPage').then((m) => ({ default: m.PublicPollPage })));
const GuestLandingPage = lazy(() => import('../pages/guest/voting/GuestLandingPage').then((m) => ({ default: m.GuestLandingPage })));
const WardrobeStatsPage = lazy(() => import('../pages/user/wardrobe/WardrobeStatsPage').then((m) => ({ default: m.WardrobeStatsPage })));
const AddItemPage = lazy(() => import('../pages/user/wardrobe/AddItemPage').then((m) => ({ default: m.AddItemPage })));
const ItemDetailPage = lazy(() => import('../pages/user/wardrobe/ItemDetailPage').then((m) => ({ default: m.ItemDetailPage })));
const OnboardingWardrobePage = lazy(() => import('../pages/user/wardrobe/OnboardingWardrobePage').then((m) => ({ default: m.OnboardingWardrobePage })));
const onboarding = () => import('../pages/user/onboarding/OnboardingLayout');
const OnboardingEntry = lazy(() => onboarding().then((m) => ({ default: m.OnboardingEntry })));
const OnboardingLayout = lazy(() => onboarding().then((m) => ({ default: m.OnboardingLayout })));
const MascotEditPage = lazy(() => import('../pages/user/profile/MascotEditPage').then((m) => ({ default: m.MascotEditPage })));
const MascotPage = lazy(() => import('../pages/user/onboarding/MascotPage').then((m) => ({ default: m.MascotPage })));
const WardrobePage = lazy(() => import('../pages/user/wardrobe/WardrobePage').then((m) => ({ default: m.WardrobePage })));
const HomePage = lazy(() => import('../pages/user/home/HomePage').then((m) => ({ default: m.HomePage })));
const PublicHomePage = lazy(() => import('../pages/guest/home/PublicHomePage').then((m) => ({ default: m.PublicHomePage })));

function NotFound() {
  return (
    <EmptyState icon={<CompassOutlined />} title="Không tìm thấy trang">
      <ButtonLink to="/" small>
        Về trang chủ
      </ButtonLink>
    </EmptyState>
  );
}

export const router = createBrowserRouter([{ element: <RouteMotionLayout />, children: [
  { path: '/', element: <HomeEntry />, children: [{ element: <AppShell />, children: [{ index: true, element: <HomePage /> }] }] },
  { element: <AuthTransitionLayout />, children: [
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
  ] },
  { path: '/about', element: <PublicHomePage /> },
  { path: '/terms', element: <TermsPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/refund', element: <RefundPage /> },
  { path: '/auth/callback', element: <GoogleCallbackPage /> },
  { path: '/ask-friends', element: <GuestLandingPage /> },
  { path: '/v/:code', element: <PublicPollPage /> },
  {
    element: <RequireAuth />,
    children: [
      { element: <RequireAdmin />, children: [{ path: 'admin', element: <AdminDashboardPage /> }] },
      { path: 'onboarding/check', element: <OnboardingEntry /> },
      { path: 'onboarding', element: <OnboardingLayout />, children: [
        { index: true, element: <StylePreferencesPage /> },
        { path: 'welcome', element: <MascotPage /> },
        { path: 'wardrobe', element: <OnboardingWardrobePage /> },
      ] },
      {
        element: <AppShell />,
        children: [
          { path: 'wardrobe', element: <WardrobePage /> },
          { path: 'wardrobe/stats', element: <WardrobeStatsPage /> },
          { path: 'wardrobe/add', element: <AddItemPage /> },
          { path: 'wardrobe/:id', element: <ItemDetailPage /> },
          { path: 'outfits/suggest', element: <SuggestPage /> },
          { path: 'outfits', element: <SavedOutfitsPage /> },
          { path: 'outfits/calendar', element: <WearCalendarPage /> },
          { path: 'outfits/:id', element: <OutfitDetailPage /> },
          { path: 'polls', element: <MyPollsPage /> },
          { path: 'polls/new', element: <CreatePollPage /> },
          { path: 'polls/:code', element: <PollDetailPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/style', element: <StylePreferencesPage /> },
          { path: 'profile/mascot', element: <MascotEditPage /> },
          { path: 'plans', element: <PlansPage /> },
          { path: 'billing/result', element: <BillingResultPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'premium', element: <PremiumPage /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]}]);
