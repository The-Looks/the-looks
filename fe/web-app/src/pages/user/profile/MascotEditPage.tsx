import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { MascotEditor } from '../../../components/user/mascot/MascotEditor';
import { authRequests } from '../../../services/guest/auth/requests';
import { errorMessage } from '../../../services/shared/api/client';
import type { Look } from '../../../services/user/onboarding/look';
import { readLook, saveLook } from '../../../services/user/onboarding/progress';

function Editor({ accountId }: { accountId: string }) {
  const [look, setLook] = useState<Look>(() => readLook(accountId) ?? { mascot: 'cat' });
  const navigate = useNavigate();
  return <>
    <MascotEditor value={look} onChange={setLook} />
    <div className="row">
      <Button onClick={() => { saveLook(accountId, look); navigate('/profile'); }}>Lưu linh vật</Button>
      <Button kind="ghost" onClick={() => navigate('/profile')}>Huỷ</Button>
    </div>
  </>;
}

export function MascotEditPage() {
  const me = useQuery({ queryKey: ['me'], queryFn: authRequests.me });
  return <div className="stack-lg">
    <PageHeader title="Linh vật của bạn" sub="Linh vật hiện ở ảnh đại diện khi bạn chưa tải ảnh riêng."
      back={{ to: '/profile', label: 'Cá nhân' }} />
    {me.isPending && <Spinner />}
    {me.isError && <Notice tone="error">{errorMessage(me.error)}</Notice>}
    {me.data && <Editor accountId={me.data.id} />}
  </div>;
}
