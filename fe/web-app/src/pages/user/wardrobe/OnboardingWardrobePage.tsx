import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, ButtonLink, Card, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { OutfitCard } from '../../../components/user/outfit/OutfitCard';
import { SaveButton } from '../../../components/user/outfit/SaveButton';
import { useWardrobe } from '../../../hooks/user/wardrobe/api';
import { useQuickPick } from '../../../hooks/user/outfit/api';
import { errorMessage } from '../../../services/shared/api/client';
import { wardrobeReadiness } from '../../../services/user/wardrobe/onboarding';
import { AddItemPage } from './AddItemPage';
import './onboarding-wardrobe.css';

export function OnboardingWardrobePage() {
  const [params, setParams] = useSearchParams();
  const wardrobe = useWardrobe('CONFIRMED');
  const readiness = wardrobeReadiness(wardrobe.data ?? []);
  const [advanceAfterReview, setAdvanceAfterReview] = useState(false);
  const quick = useQuickPick();
  const { mutate } = quick;
  const requested = useRef('');
  const outfitStep = readiness.ready && params.get('step') === 'outfit';
  const signature = (wardrobe.data ?? []).map((item) => item.id).sort().join(',');
  useEffect(() => {
    if (advanceAfterReview && readiness.ready) {
      setAdvanceAfterReview(false);
      setParams({ step: 'outfit' }, { replace: true });
    }
  }, [advanceAfterReview, readiness.ready, setParams]);
  useEffect(() => {
    if (outfitStep && requested.current !== signature) {
      requested.current = signature;
      mutate();
    }
  }, [outfitStep, signature, mutate]);

  if (wardrobe.isPending) return <Spinner label="Đang xem các món bạn đã thêm…" />;
  if (wardrobe.isError) return <Notice tone="error">{errorMessage(wardrobe.error)} <Button onClick={() => void wardrobe.refetch()}>Thử lại</Button></Notice>;
  return <div className="stack-lg onboarding-wardrobe">
    <PageHeader eyebrow={outfitStep ? 'Bước 3/3' : 'Bước 2/3'} title={outfitStep ? 'Outfit đầu tiên của bạn' : 'Bắt đầu với 3 món quen thuộc'}
      sub={outfitStep ? 'Phối từ những món bạn vừa xác nhận trong tủ đồ.' : 'Chọn 3–5 món hay mặc: một áo, một quần và một đôi giày là khởi đầu dễ nhất. Bạn cũng có thể dùng váy thay áo và quần.'}
      back={{ to: outfitStep ? '/onboarding/wardrobe' : '/onboarding', label: outfitStep ? 'Thêm món khác' : 'Phong cách của bạn' }} />
    <ol className="onboarding-steps" aria-label="Tiến độ bắt đầu">
      <li>1. Phong cách <span>Đã lưu</span></li>
      <li aria-current={!outfitStep ? 'step' : undefined}>2. Tủ đồ <span>{readiness.count} món đã xác nhận</span></li>
      <li aria-current={outfitStep ? 'step' : undefined}>3. Outfit đầu tiên</li>
    </ol>
    {!outfitStep ? <>
      <Card>
        <div className="row"><strong>{Math.min(readiness.count, 3)}/3 món để bắt đầu</strong><span className="muted">Có thể thêm đến 5 món hoặc nhiều hơn sau đó</span></div>
        <progress className="onboarding-progress" max={3} value={Math.min(readiness.count, 3)} aria-label="Số món đã xác nhận" />
        <ul className="onboarding-checklist">
          <li>{readiness.hasTop ? 'Đã có áo' : 'Thêm một chiếc áo'}</li>
          <li>{readiness.hasBottom ? 'Đã có quần' : 'Thêm một chiếc quần'}</li>
          <li>{readiness.hasShoes ? 'Đã có giày' : 'Thêm một đôi giày (gợi ý)'}</li>
        </ul>
        {readiness.hasDress && <p className="small muted">Bạn đã có váy, có thể phối mà không cần áo và quần riêng.</p>}
        {readiness.count >= 3 && !readiness.canCompose && <Notice tone="warn">Bạn đã đủ số món. Thêm và xác nhận một áo cùng một quần, hoặc một chiếc váy để phối được outfit.</Notice>}
        {readiness.ready && <Button onClick={() => setParams({ step: 'outfit' })}>Xem outfit đầu tiên</Button>}
      </Card>
      <AddItemPage guided onConfirmed={() => setAdvanceAfterReview(true)} />
    </> : <section className="stack onboarding-outfit" aria-label="Outfit đầu tiên">
      {quick.isPending && <Spinner label="Đang phối outfit đầu tiên…" />}
      {quick.isError && <Notice tone="error">{errorMessage(quick.error)} <Button onClick={() => mutate()}>Thử phối lại</Button></Notice>}
      {quick.isSuccess && !quick.data && <Card><h2>Cần thêm một lựa chọn phù hợp</h2><p>Những món hiện có chưa phối được thành bộ cho thời tiết và phong cách lúc này. Thêm áo, quần hoặc váy dùng được nhiều mùa rồi thử lại.</p><Button onClick={() => { requested.current = ''; setParams({}); }}>Thêm món khác</Button></Card>}
      {quick.data && <>
        <OutfitCard suggestion={quick.data} actions={<SaveButton suggestion={quick.data} />} />
        <div className="row"><ButtonLink to="/">Vào trang chủ</ButtonLink><ButtonLink to="/outfits/suggest?occasion=SCHOOL" kind="outline">Xem thêm cách phối</ButtonLink></div>
      </>}
    </section>}
  </div>;
}
