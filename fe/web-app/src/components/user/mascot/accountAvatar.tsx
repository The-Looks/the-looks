import type { ReactNode } from 'react';
import { readLook } from '../../../services/user/onboarding/progress';
import { uploadedAvatarUrl } from '../../../services/user/profile/avatar';
import type { UserProfile } from '../../../services/user/profile/requests';
import { MascotAvatar } from './MascotAvatar';

/** Ảnh đại diện cho antd Avatar: ảnh đã tải lên, không có thì linh vật kèm phụ kiện của chính tài khoản này. */
export function accountAvatar(accountId: string, profile?: UserProfile): ReactNode {
  const photo = uploadedAvatarUrl(profile);
  if (photo) return photo;
  const look = readLook(accountId);
  return look && <MascotAvatar look={look} portrait title="" />;
}
