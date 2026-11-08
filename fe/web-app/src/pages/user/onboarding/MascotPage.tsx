import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Button, Notice } from '../../../components/shared/ui/index';
import { MascotEditor } from '../../../components/user/mascot/MascotEditor';
import { errorMessage } from '../../../services/shared/api/client';
import { randomLook, type Look } from '../../../services/user/onboarding/look';
import { readLook, saveLook } from '../../../services/user/onboarding/progress';
import { profileKey, profileRequests } from '../../../services/user/profile/requests';
import type { OnboardingContext } from './OnboardingLayout';

export function MascotPage() {
  const { accountId } = useOutletContext<OnboardingContext>();
  const [look, setLook] = useState<Look>(() => readLook(accountId) ?? randomLook());
  const [edited, setEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const profile = useQuery({ queryKey: profileKey, queryFn: profileRequests.get });
  const qc = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = profile.data?.mascotId;
    if (saved && !edited) setLook((current) => current.mascot === saved ? current : { mascot: saved });
  }, [profile.data?.mascotId, edited]);

  async function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setSaveError('');
    try {
      const updated = await profileRequests.selectMascot(look.mascot);
      saveLook(accountId, look);
      qc.setQueryData(profileKey, updated);
      navigate('/onboarding');
    } catch (error) { setSaveError(errorMessage(error)); }
    finally { setSaving(false); }
  }

  return (
    <form className="stack-lg" onSubmit={next}>
      <header className="onboarding-intro">
        <h1>Tạo linh vật của bạn</h1>
        <p>Chọn một người bạn đồng hành rồi phối mũ, kính, phụ kiện cho thật hợp gu. Bạn đổi lại được bất cứ lúc nào trong Hồ sơ.</p>
      </header>
      <MascotEditor value={look} onChange={(nextLook) => { setLook(nextLook); setEdited(true); }} />
      {saveError && <Notice tone="error">{saveError}</Notice>}
      <div className="row"><Button type="submit" disabled={saving}>{saving ? 'Đang lưu…' : 'Tiếp tục đến khảo sát'}</Button></div>
    </form>
  );
}
