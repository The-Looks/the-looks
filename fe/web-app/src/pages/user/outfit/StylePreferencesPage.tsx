import { useEffect, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import type { StylePreferences } from '../../../interface/dto/types';
import { Button, Card, Chip, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { usePreferences, useSavePreferences } from '../../../hooks/user/outfit/api';
import { COLORS, STYLE_QUIZ, quizStyles, type Style } from '../../../services/user/outfit/styleQuiz';

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
 * Hồ sơ phong cách dùng cho bước khảo sát (/onboarding) và trang Cá nhân (/profile/style).
 */
export function StylePreferencesPage() {
  const onboarding = Boolean(useMatch('/onboarding'));
  const navigate = useNavigate();
  const current = usePreferences();
  const save = useSavePreferences();
  const [form, setForm] = useState<StylePreferences>({ gender: null, styles: [], budget: null, colors: [] });
  const [quizOpen, setQuizOpen] = useState(onboarding && !current.data?.styles?.length);
  const [answers, setAnswers] = useState<(Style | undefined)[]>([]);
  const [quizResult, setQuizResult] = useState<Style[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (current.data) setForm({ gender: null, styles: [], budget: null, colors: [], ...current.data });
  }, [current.data]);

  const styles = form.styles ?? [];
  const toggleStyle = (s: Style) =>
    setForm((f) => ({ ...f, styles: styles.includes(s) ? styles.filter((x) => x !== s) : [...styles, s] }));
  const colors = form.colors ?? [];
  const toggleColor = (c: string) =>
    setForm((f) => ({ ...f, colors: colors.includes(c) ? colors.filter((x) => x !== c) : [...colors, c] }));
  const answer = (question: number, style: Style) => setAnswers((current) => {
    const next = [...current];
    next[question] = style;
    return next;
  });
  const finishQuiz = () => {
    const result = quizStyles(answers);
    setQuizResult(result);
    setForm((f) => ({ ...f, styles: result }));
    setQuizOpen(false);
  };
  const styleLabel = (style: Style) => STYLES.find((item) => item.value === style)?.label ?? style;
  const submit = () =>
    save.mutate(form, { onSuccess: () => onboarding && navigate('/onboarding/wardrobe', { replace: true }) });

  if (current.isPending) return <Spinner />;

  return (
    <div className="stack-lg">
      <PageHeader
        title="Phong cách của bạn"
        sub="Chọn giới tính, phong cách và màu yêu thích để cá nhân hóa gợi ý. Bạn có thể sửa lại trong hồ sơ bất cứ lúc nào."
        back={onboarding ? { to: '/onboarding/welcome', label: 'Chọn linh vật' } : { to: '/profile', label: 'Cá nhân' }}
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
        <p className="small muted">Bạn có thể chọn Khác nếu không muốn dùng gợi ý theo Nam hoặc Nữ.</p>
      </Card>

      <Card>
        <h2>Chưa chắc phong cách của mình?</h2>
        {!quizOpen && <>
          <p className="muted">Trả lời 5 câu hỏi nhanh về tính cách và sở thích, THE LOOKS chọn phong cách hợp với bạn.</p>
          {quizResult.length > 0 && <Notice>Bạn hợp phong cách: <strong>{quizResult.map(styleLabel).join(', ')}</strong>. Đã chọn sẵn bên dưới, bạn có thể sửa.</Notice>}
          <div className="row"><Button kind="outline" onClick={() => setQuizOpen(true)}>{quizResult.length ? 'Làm lại trắc nghiệm' : 'Làm trắc nghiệm 5 câu'}</Button></div>
        </>}
        {quizOpen && <div className="stack">
          {STYLE_QUIZ.map((q, index) => (
            <div key={q.question} className="field">
              <label id={`quiz-${index}`}>{index + 1}. {q.question}</label>
              <div className="row" role="radiogroup" aria-labelledby={`quiz-${index}`}>
                {q.answers.map((a) => <Chip key={a.label} active={answers[index] === a.style} onClick={() => answer(index, a.style)}>{a.label}</Chip>)}
              </div>
            </div>
          ))}
          <div className="row">
            <Button onClick={finishQuiz} disabled={STYLE_QUIZ.some((_, index) => !answers[index])}>Xem phong cách của tôi</Button>
            <Button kind="ghost" onClick={() => setQuizOpen(false)}>Để sau</Button>
          </div>
        </div>}
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
        <h2>Màu bạn thích mặc</h2>
        <div className="row">
          {COLORS.map((c) => (
            <Chip key={c.value} active={colors.includes(c.value)} onClick={() => toggleColor(c.value)}>
              <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: c.swatch, border: '1px solid rgb(0 0 0 / 0.25)' }} aria-hidden="true" /> {c.label}
            </Chip>
          ))}
        </div>
        <p className="small muted">Gợi ý sẽ ưu tiên outfit có màu bạn chọn. Tối đa 8 màu.</p>
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
      {onboarding && <Card><h2>Xác nhận hồ sơ phong cách</h2><p className="muted">Giới tính: {GENDERS.find((item) => item.value === form.gender)?.label ?? 'Chưa chọn'} · Phong cách: {styles.map((style) => STYLES.find((item) => item.value === style)?.label).join(', ') || 'Chưa chọn'} · Màu: {colors.map((c) => COLORS.find((item) => item.value === c)?.label ?? c).join(', ') || 'Chưa chọn'} · Ngân sách: {BUDGETS.find((item) => item.value === form.budget)?.label ?? 'Chưa chọn'}</p><label className="row"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> Tôi xác nhận thông tin phong cách này.</label></Card>}
      <div className="row">
        <Button onClick={submit} disabled={save.isPending || colors.length > 8 || (onboarding && (!form.gender || styles.length === 0 || !confirmed))}>
          {save.isPending ? 'Đang lưu…' : onboarding ? 'Lưu và thêm món đầu tiên' : 'Lưu'}
        </Button>
      </div>
    </div>
  );
}
