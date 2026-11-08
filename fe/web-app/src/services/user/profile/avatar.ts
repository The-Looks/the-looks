import { MASCOTS } from '../onboarding/mascots';
import { readOnboarding } from '../onboarding/progress';
import type { UserProfile } from './requests';

export function accountMascot(accountId: string, profile?: UserProfile) {
  const selected = profile?.mascotId ?? readOnboarding(accountId).mascot;
  return MASCOTS.find(({ id }) => id === selected);
}

export function accountAvatarSource(accountId: string, profile?: UserProfile) {
  if (profile?.hasAvatar) {
    return `/api/app/me/avatar?v=${encodeURIComponent(profile.avatarUpdatedAt ?? '')}`;
  }

  const mascot = accountMascot(accountId, profile);
  return mascot && `/illustrations/portraits/${mascot.id}.svg`;
}
