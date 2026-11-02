import { useState } from 'react';
import { errorMessage } from '../../../shared/api/client';
import type { BillingPeriod, PlanInfo } from '../../../shared/api/types';
import { Badge, Button, Card, Chip, Notice, PageHeader, Spinner } from '../../../shared/ui';
import { useCheckout, useMyPlan, usePlans } from '../api';
import { FEATURE_LABEL, PERIOD_LABEL, PLAN_TAGLINE, formatDate, vnd } from '../labels';

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
        sub="Quét VietQR bằng app ngân hàng. Gói tự gia hạn, nhắc trước 3 ngày, tắt lúc nào cũng được. Đổi gói khi còn hạn, thời gian còn lại được quy đổi sang gói mới."
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

      <div className="grid-cards">
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
    <Card hero={info.plan === 'PRO'}>
      <div className="spread">
        <h2>{info.name}</h2>
        {current ? (
          <Badge tone="green">Gói hiện tại</Badge>
        ) : info.plan === 'PRO' ? (
          <Badge tone="pink">Nhiều nhất</Badge>
        ) : null}
      </div>
      <p className="muted small">{PLAN_TAGLINE[info.plan]}</p>
      <p>
        <strong style={{ fontSize: 28 }}>{price === 0 ? '0đ' : vnd(price)}</strong>
        {price > 0 && <span className="muted"> / {PERIOD_LABEL[period]}</span>}
        {perMonth && <span className="small muted"> · khoảng {vnd(perMonth)}/tháng</span>}
      </p>
      <ul className="stack" style={{ paddingLeft: 18, margin: 0 }}>
        <li>{items === null || items === undefined ? 'Tủ đồ không giới hạn' : `Tủ đồ tối đa ${items} món`}</li>
        <li>{info.limits.aiSuggestionsPerDay} lượt AI gợi ý mỗi ngày</li>
        {info.features.map((f) => (
          <li key={f}>{FEATURE_LABEL[f] ?? f}</li>
        ))}
      </ul>
      {info.plan !== 'FREE' && (
        <Button block kind={info.plan === 'PRO' ? 'pink' : 'primary'} onClick={onBuy} disabled={busy}>
          {busy ? 'Đang tạo mã QR…' : current ? 'Gia hạn' : `Chọn ${info.name}`}
        </Button>
      )}
    </Card>
  );
}
