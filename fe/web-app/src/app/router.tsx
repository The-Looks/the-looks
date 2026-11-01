import { createBrowserRouter } from 'react-router-dom';
import { GoogleCallbackPage, LoginPage, OnboardingPage, RegisterPage } from '../features/auth';
import { OutfitDetailPage, SavedOutfitsPage, SuggestPage } from '../features/outfit';
import { ProfilePage } from '../features/profile';
import { CreatePollPage, MyPollsPage, PollDetailPage, PublicPollPage } from '../features/voting';
import { AddItemPage, ItemDetailPage, WardrobePage } from '../features/wardrobe';
import { ButtonLink, EmptyState } from '../shared/ui';
import { AppShell } from './AppShell';
import { HomePage } from './HomePage';
import { RequireAuth } from './RequireAuth';

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
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/auth/callback', element: <GoogleCallbackPage /> },
  { path: '/v/:code', element: <PublicPollPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'onboarding', element: <OnboardingPage /> },
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
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);
