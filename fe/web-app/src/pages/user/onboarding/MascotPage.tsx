import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Button, Notice } from '../../../components/shared/ui/index';
import { errorMessage } from '../../../services/shared/api/client';
import { MASCOTS, mascotImage } from '../../../services/user/onboarding/mascots';
import { readOnboarding, updateOnboarding } from '../../../services/user/onboarding/progress';
import { profileKey, profileRequests } from '../../../services/user/profile/requests';
import type { OnboardingContext } from './OnboardingLayout';

export function MascotPage() {
  const { accountId } = useOutletContext<OnboardingContext>();
  const [selected, setSelected] = useState(() => {
    const saved = readOnboarding(accountId).mascot;
    return MASCOTS.find(({ id }) => id === saved)?.id;
  });
  const [selectionTouched, setSelectionTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const profile = useQuery({ queryKey: profileKey, queryFn: profileRequests.get });
  const picked = selectionTouched ? selected : profile.data?.mascotId ?? selected;
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!picked) return;
    setSaving(true); setSaveError('');
    try {
      const updated = await profileRequests.selectMascot(picked);
      updateOnboarding(accountId, { mascot: picked });
      qc.setQueryData(profileKey, updated);
      navigate('/onboarding');
    } catch (error) { setSaveError(errorMessage(error)); }
    finally { setSaving(false); }
  }

  return (
    <form className="stack-lg" onSubmit={next}>
      <header className="onboarding-intro">
        <h1>Chọn linh vật của bạn</h1>
        <p>Chào mừng đến THE LOOKS! Ai sẽ đồng hành cùng bạn khám phá tủ đồ và phối outfit đầu tiên?</p>
      </header>
      <fieldset className="mascot-picker">
        <legend className="mascot-legend">Sáu cá tính thời trang</legend>
        <div className="mascot-grid">
          {MASCOTS.map(({ id, name, style }) => (
            <label className="mascot-choice" key={id}>
              <img src={mascotImage(id)} alt="" width="320" height="320" />
              <span className="mascot-caption">
                <span><strong>{name}</strong><span>{style}</span></span>
                <input type="radio" name="mascot" value={id} checked={picked === id}
                  onChange={() => {
                    setSelected(id);
                    setSelectionTouched(true);
                    updateOnboarding(accountId, { mascot: id });
                  }} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {saveError && <Notice tone="error">{saveError}</Notice>}
      <div className="row"><Button type="submit" disabled={!picked || saving}>{saving ? 'Đang lưu…' : 'Tiếp tục đến khảo sát'}</Button></div>
    </form>
  );
}
