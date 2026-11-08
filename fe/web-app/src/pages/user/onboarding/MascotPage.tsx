import { useState, type FormEvent } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Button } from '../../../components/shared/ui/index';
import { MascotEditor } from '../../../components/user/mascot/MascotEditor';
import { randomLook, type Look } from '../../../services/user/onboarding/look';
import { readLook, saveLook } from '../../../services/user/onboarding/progress';
import type { OnboardingContext } from './OnboardingLayout';

export function MascotPage() {
  const { accountId } = useOutletContext<OnboardingContext>();
  // Như game: vào là có sẵn một nhân vật ngẫu nhiên để sửa, không bắt đầu từ trang trắng.
  const [look, setLook] = useState<Look>(() => readLook(accountId) ?? randomLook());
  const navigate = useNavigate();

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveLook(accountId, look);
    navigate('/onboarding');
  }

  return (
    <form className="stack-lg" onSubmit={next}>
      <header className="onboarding-intro">
        <h1>Tạo linh vật của bạn</h1>
        <p>Chọn một người bạn đồng hành rồi phối mũ, kính, phụ kiện cho thật hợp gu. Bạn đổi lại được bất cứ lúc nào trong Hồ sơ.</p>
      </header>
      <MascotEditor value={look} onChange={setLook} />
      <div className="row"><Button type="submit">Tiếp tục đến khảo sát</Button></div>
    </form>
  );
}
