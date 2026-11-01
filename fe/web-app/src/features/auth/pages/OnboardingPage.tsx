import { useState } from 'react';
import { ButtonLink, Card, Chip, PageHeader } from '../../../shared/ui';

const STYLES = ['Nữ tính', 'Năng động', 'Tối giản', 'Streetwear', 'Vintage', 'Công sở'];

// TODO(Phát): lưu sở thích khi identity-service có API hồ sơ (gợi ý outfit sẽ dùng).
export function OnboardingPage() {
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (s: string) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  return (
    <div className="stack-lg">
      <PageHeader eyebrow="Bước 1/2" title="Phong cách của bạn" sub="Chọn vài phong cách bạn hay mặc để AI gợi ý sát hơn." />
      <Card>
        <div className="row">
          {STYLES.map((s) => (
            <Chip key={s} active={picked.includes(s)} onClick={() => toggle(s)}>
              {s}
            </Chip>
          ))}
        </div>
      </Card>
      <Card>
        <h2>Bắt đầu với vài món</h2>
        <p className="muted">Chụp 3–5 món bạn mặc nhiều nhất là đủ để có outfit đầu tiên.</p>
        <div className="row">
          <ButtonLink to="/wardrobe/add">Thêm món đầu tiên</ButtonLink>
          <ButtonLink to="/" kind="ghost">
            Để sau
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
