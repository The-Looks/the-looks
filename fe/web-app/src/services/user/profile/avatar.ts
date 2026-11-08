import type { UserProfile } from './requests';

/** Ảnh người dùng tự tải lên; không có thì giao diện dùng linh vật (components/user/mascot/accountAvatar). */
export function uploadedAvatarUrl(profile?: UserProfile) {
  return profile?.hasAvatar ? `/api/app/me/avatar?v=${encodeURIComponent(profile.avatarUpdatedAt ?? '')}` : undefined;
}
