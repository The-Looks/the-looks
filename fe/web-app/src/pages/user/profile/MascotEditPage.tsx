import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { MascotEditor } from '../../../components/user/mascot/MascotEditor';
import { accountLook } from '../../../components/user/mascot/accountAvatar';
import { authRequests } from '../../../services/guest/auth/requests';
import { errorMessage } from '../../../services/shared/api/client';
import type { Look } from '../../../services/user/onboarding/look';
import { saveLook } from '../../../services/user/onboarding/progress';
import { profileKey, profileRequests, type UserProfile } from '../../../services/user/profile/requests';

function Editor({ accountId, profile }: { accountId: string; profile?: UserProfile }) {
  const [look, setLook] = useState<Look>(() => accountLook(accountId, profile) ?? { mascot: 'cat' });
  const [edited, setEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const qc = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = profile?.mascotId;
    if (saved && !edited) setLook((current) => current.mascot === saved ? current : { mascot: saved });
  }, [profile?.mascotId, edited]);

  const save = async () => {
    setSaving(true); setSaveError('');
    try {
      const updated = await profileRequests.selectMascot(look.mascot);
      saveLook(accountId, look);
      qc.setQueryData(profileKey, updated);
      navigate('/profile');
    } catch (error) { setSaveError(errorMessage(error)); }
    finally { setSaving(false); }
  };

  return <>
    <MascotEditor value={look} onChange={(nextLook) => { setLook(nextLook); setEdited(true); }} />
    {saveError && <Notice tone="error">{saveError}</Notice>}
    <div className="row">
      <Button disabled={saving} onClick={() => void save()}>{saving ? 'Đang lưu…' : 'Lưu linh vật'}</Button>
      <Button kind="ghost" onClick={() => navigate('/profile')}>Huỷ</Button>
    </div>
  </>;
}

export function MascotEditPage() {
  const me = useQuery({ queryKey: ['me'], queryFn: authRequests.me });
  const profile = useQuery({ queryKey: profileKey, queryFn: profileRequests.get, enabled: Boolean(me.data) });
  return <div className="stack-lg">
    <PageHeader title="Linh vật của bạn" sub="Linh vật hiện ở ảnh đại diện khi bạn chưa tải ảnh riêng."
      back={{ to: '/profile' }} />
    {me.isPending && <Spinner />}
    {me.isError && <Notice tone="error">{errorMessage(me.error)}</Notice>}
    {me.data && <Editor accountId={me.data.id} profile={profile.data} />}
  </div>;
}
