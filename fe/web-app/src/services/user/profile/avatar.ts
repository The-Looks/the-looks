import { MASCOTS } from '../onboarding/mascots';
import { readOnboarding } from '../onboarding/progress';
import type { UserProfile } from './requests';

export function accountAvatarSource(accountId: string, profile?: UserProfile) {
  if (profile?.hasAvatar) {
    return `/api/app/me/avatar?v=${encodeURIComponent(profile.avatarUpdatedAt ?? '')}`;
  }

  const selected = readOnboarding(accountId).mascot;
  const mascot = MASCOTS.find(({ id }) => id === selected);
  return mascot && `/illustrations/portraits/${mascot.id}.svg`;
}
