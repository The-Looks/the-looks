import { useState } from 'react';
import { errorMessage } from '../../../services/shared/api/client';
import type { BillingPeriod, PlanInfo } from '../../../interface/dto/types';
import { Badge, Button, Card, Chip, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { useCheckout, useMyPlan, usePlans } from '../../../hooks/user/billing/api';
import { FEATURE_LABEL, PERIOD_LABEL, PLAN_TAGLINE, formatDate, vnd } from '../../../services/user/billing/labels';
import './plans.css';

export function PlansPage() {
  const [period, setPeriod] = useState<BillingPeriod>('MONTHLY');
  const plans = usePlans();
  const me = useMyPlan();
  const checkout = useCheckout();

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow="Gói thành viên"
        title="Chọn gói phù hợp"
        sub="Thanh toán qua VietQR bằng app ngân hàng hoặc MoMo. Đổi gói khi còn hạn, thời gian còn lại được quy đổi sang gói mới."
      />

      {me.data && me.data.plan !== 'FREE' && me.data.expiresAt && (
        <Notice>
          Bạn đang dùng gói <strong>{me.data.plan === 'PRO' ? 'Pro' : 'Plus'}</strong> đến hết ngày{' '}
          {formatDate(me.data.expiresAt)}.
        </Notice>
      )}

      <div className="row" role="radiogroup" aria-label="Kỳ thanh toán">
        <Chip active={period === 'MONTHLY'} onClick={() => setPeriod('MONTHLY')}>
          Theo tháng
        </Chip>
        <Chip active={period === 'YEARLY'} onClick={() => setPeriod('YEARLY')}>
          Theo năm · tiết kiệm 2 tháng
        </Chip>
      </div>

      {plans.isPending && <Spinner />}
      {plans.isError && <Notice tone="error">{errorMessage(plans.error)}</Notice>}
      {checkout.isError && <Notice tone="error">{errorMessage(checkout.error)}</Notice>}

      <div className="plans-grid">
        {plans.data?.map((p) => (
          <PlanCard
            key={p.plan}
            info={p}
            period={period}
            current={me.data?.plan === p.plan}
            busy={checkout.isPending && checkout.variables?.plan === p.plan}
            onBuy={() => p.plan !== 'FREE' && checkout.mutate({ plan: p.plan, period })}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  info,
  period,
  current,
  busy,
  onBuy,
}: {
  info: PlanInfo;
  period: BillingPeriod;
  current: boolean;
  busy: boolean;
  onBuy: () => void;
}) {
  const price = period === 'MONTHLY' ? info.monthlyPriceVnd : info.yearlyPriceVnd;
  const perMonth = period === 'YEARLY' && price > 0 ? Math.round(price / 12) : null;
  const items = info.limits.wardrobeItems;
  return (
    <Card className={`plan-card${info.plan === 'PRO' ? ' plan-card-pro' : ''}`}>
      <div className="spread">
        <h2>{info.name}</h2>
        {current ? (
          <Badge tone="green">Gói hiện tại</Badge>
        ) : info.plan === 'PRO' ? (
          <Badge tone="pink">Nhiều nhất</Badge>
        ) : null}
      </div>
      <p className="muted small">{PLAN_TAGLINE[info.plan]}</p>
      <p className="plan-price">
        <strong style={{ fontSize: 28 }}>{price === 0 ? '0đ' : vnd(price)}</strong>
        {price > 0 && <span className="muted"> / {PERIOD_LABEL[period]}</span>}
        {perMonth && <span className="small muted"> · khoảng {vnd(perMonth)}/tháng</span>}
      </p>
      <ul className="plan-features">
        <li>{items === null || items === undefined ? 'Tủ đồ không giới hạn' : `Tủ đồ tối đa ${items} món`}</li>
        <li>{info.limits.aiSuggestionsPerDay} lượt AI gợi ý mỗi ngày</li>
        {info.features.map((f) => (
          <li key={f}>{FEATURE_LABEL[f] ?? f}</li>
        ))}
      </ul>
      <div className="plan-footer">
        {info.plan !== 'FREE' ? (
          <Button block kind={info.plan === 'PRO' ? 'pink' : 'primary'} onClick={onBuy} disabled={busy}>
            {busy ? 'Đang tạo link thanh toán…' : current ? 'Gia hạn' : `Chọn ${info.name}`}
          </Button>
        ) : <span className="plan-free-note">Có sẵn cho mọi tài khoản</span>}
      </div>
    </Card>
  );
}
