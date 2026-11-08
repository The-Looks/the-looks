import type { ReactNode } from 'react';
import type { Look } from '../../../services/user/onboarding/look';
import { readLook } from '../../../services/user/onboarding/progress';
import { uploadedAvatarUrl } from '../../../services/user/profile/avatar';
import type { UserProfile } from '../../../services/user/profile/requests';
import { MascotAvatar } from './MascotAvatar';

export function accountLook(accountId: string, profile?: UserProfile): Look | undefined {
  const local = readLook(accountId);
  const saved = profile?.mascotId;
  return saved ? local?.mascot === saved ? local : { mascot: saved } : local;
}

/** Ảnh đại diện cho antd Avatar: ảnh đã tải lên, không có thì linh vật kèm phụ kiện của chính tài khoản này. */
export function accountAvatar(accountId: string, profile?: UserProfile): ReactNode {
  const photo = uploadedAvatarUrl(profile);
  if (photo) return photo;
  const look = accountLook(accountId, profile);
  return look && <MascotAvatar look={look} portrait title="" />;
}
