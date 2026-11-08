import { useState, type FormEvent } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Button } from '../../../components/shared/ui/index';
import { MASCOTS, mascotImage } from '../../../services/user/onboarding/mascots';
import { readOnboarding, updateOnboarding } from '../../../services/user/onboarding/progress';
import type { OnboardingContext } from './OnboardingLayout';

export function MascotPage() {
  const { accountId } = useOutletContext<OnboardingContext>();
  const [selected, setSelected] = useState(() => {
    const saved = readOnboarding(accountId).mascot;
    return MASCOTS.find(({ id }) => id === saved)?.id;
  });
  const navigate = useNavigate();

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    navigate('/onboarding');
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
                <input type="radio" name="mascot" value={id} checked={selected === id}
                  onChange={() => {
                    setSelected(id);
                    updateOnboarding(accountId, { mascot: id });
                  }} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="row"><Button type="submit" disabled={!selected}>Tiếp tục đến khảo sát</Button></div>
    </form>
  );
}
