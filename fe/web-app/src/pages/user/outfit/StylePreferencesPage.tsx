import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import type { StylePreferences } from '../../../interface/dto/types';
import { Button, ButtonLink, Card, Chip, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { usePreferences, useSavePreferences } from '../../../hooks/user/outfit/api';

type Style = NonNullable<StylePreferences['styles']>[number];

const GENDERS: { value: NonNullable<StylePreferences['gender']>; label: string }[] = [
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'MALE', label: 'Nam' },
  { value: 'OTHER', label: 'Khác' },
];
const STYLES: { value: Style; label: string }[] = [
  { value: 'feminine', label: 'Nữ tính' },
  { value: 'sporty', label: 'Năng động' },
  { value: 'minimal', label: 'Tối giản' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'office', label: 'Công sở' },
];
const BUDGETS: { value: NonNullable<StylePreferences['budget']>; label: string }[] = [
  { value: 'LOW', label: 'Dưới 200k' },
  { value: 'MID', label: '200k – 500k' },
  { value: 'HIGH', label: 'Trên 500k' },
];

/**
 * Hồ sơ phong cách: dùng cho bước đầu sau khi đăng ký (/onboarding) và trang Cá nhân (/profile/style).
 * Mọi mục đều không bắt buộc; AI vẫn tự học thêm từ lượt thích và đồ hay mặc.
 */
export function StylePreferencesPage() {
  const onboarding = useLocation().pathname === '/onboarding';
  const navigate = useNavigate();
  const current = usePreferences();
  const save = useSavePreferences();
  const [form, setForm] = useState<StylePreferences>({ gender: null, styles: [], budget: null });

  useEffect(() => {
    if (current.data) setForm({ gender: null, styles: [], budget: null, ...current.data });
  }, [current.data]);

  const styles = form.styles ?? [];
  const toggleStyle = (s: Style) =>
    setForm((f) => ({ ...f, styles: styles.includes(s) ? styles.filter((x) => x !== s) : [...styles, s] }));
  const submit = () =>
    save.mutate(form, { onSuccess: () => onboarding && navigate('/wardrobe/add', { replace: true }) });

  if (current.isPending) return <Spinner />;

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow={onboarding ? 'Bước 1/2' : undefined}
        title="Phong cách của bạn"
        sub="Giúp AI gợi ý outfit và món nên mua hợp với bạn hơn. Không bắt buộc, sửa lại lúc nào cũng được."
        back={onboarding ? undefined : { to: '/profile', label: 'Cá nhân' }}
      />
      {current.isError && <Notice tone="error">{errorMessage(current.error)}</Notice>}

      <Card>
        <h2>Bạn muốn xem đồ</h2>
        <div className="row" role="radiogroup" aria-label="Giới tính">
          {GENDERS.map((g) => (
            <Chip
              key={g.value}
              active={form.gender === g.value}
              onClick={() => setForm((f) => ({ ...f, gender: f.gender === g.value ? null : g.value }))}
            >
              {g.label}
            </Chip>
          ))}
        </div>
        <p className="small muted">Bấm lại để bỏ chọn nếu bạn không muốn nói.</p>
      </Card>

      <Card>
        <h2>Phong cách bạn hay mặc</h2>
        <div className="row">
          {STYLES.map((s) => (
            <Chip key={s.value} active={styles.includes(s.value)} onClick={() => toggleStyle(s.value)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <h2>Ngân sách cho một món</h2>
        <div className="row" role="radiogroup" aria-label="Ngân sách">
          {BUDGETS.map((b) => (
            <Chip
              key={b.value}
              active={form.budget === b.value}
              onClick={() => setForm((f) => ({ ...f, budget: f.budget === b.value ? null : b.value }))}
            >
              {b.label}
            </Chip>
          ))}
        </div>
      </Card>

      {save.isError && <Notice tone="error">{errorMessage(save.error)}</Notice>}
      {save.isSuccess && !onboarding && <Notice>Đã lưu. Gợi ý sẽ dùng phong cách mới của bạn.</Notice>}
      <div className="row">
        <Button onClick={submit} disabled={save.isPending}>
          {save.isPending ? 'Đang lưu…' : onboarding ? 'Lưu và thêm món đầu tiên' : 'Lưu'}
        </Button>
        {onboarding && (
          <ButtonLink to="/" kind="ghost">
            Để sau
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
