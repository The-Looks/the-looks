import { errorMessage } from '../../../services/shared/api/client';
import type { Entitlements } from '../../../interface/dto/types';
import { Badge, Button, ButtonLink, Card, Notice } from '../../shared/ui/index';
import { useCheckout, useMyPlan, useSetAutoRenew } from '../../../hooks/user/billing/api';
import { formatDate } from '../../../services/user/billing/labels';

/** Thẻ gói hiện tại trên trang chủ: nhắc gia hạn, bật / tắt tự gia hạn, dẫn tới trang chọn gói. */
export function MyPlanCard() {
  const me = useMyPlan();
  const checkout = useCheckout();
  const autoRenew = useSetAutoRenew();
  if (!me.data) return null;
  const { plan, expiresAt, period, status, limits } = me.data;
  const items = limits.wardrobeItems;
  const renew = () => plan !== 'FREE' && checkout.mutate({ plan, period: period ?? 'MONTHLY' });
  return (
    <Card>
      <div className="spread">
        <h2>Gói {plan === 'FREE' ? 'Free' : plan === 'PLUS' ? 'Plus' : 'Pro'}</h2>
        {plan !== 'FREE' && (
          <Badge tone={status === 'ACTIVE' ? 'green' : 'amber'}>{status === 'GRACE' ? 'Quá hạn' : 'Đang dùng'}</Badge>
        )}
      </div>
      <p className="muted">
        {items === null || items === undefined ? 'Tủ đồ không giới hạn' : `Tủ đồ tối đa ${items} món`} ·{' '}
        {limits.aiSuggestionsPerDay} lượt AI/ngày
      </p>

      {plan !== 'FREE' && expiresAt && <RenewalNotice me={me.data} expiresAt={expiresAt} />}
      {checkout.isError && <Notice tone="error">{errorMessage(checkout.error)}</Notice>}
      {autoRenew.isError && <Notice tone="error">{errorMessage(autoRenew.error)}</Notice>}

      <div className="row">
        {status === 'RENEWAL_DUE' || status === 'GRACE' ? (
          <Button small onClick={renew} disabled={checkout.isPending}>
            {checkout.isPending ? 'Đang tạo link thanh toán…' : 'Thanh toán gia hạn'}
          </Button>
        ) : (
          <ButtonLink to="/plans" kind={plan === 'PRO' ? 'ghost' : 'primary'} small>
            {plan === 'FREE' ? 'Nâng cấp' : plan === 'PLUS' ? 'Lên Pro' : 'Xem các gói'}
          </ButtonLink>
        )}
      </div>
      {plan !== 'FREE' && (
        <label className="row small">
          <input
            type="checkbox"
            checked={me.data.autoRenew}
            disabled={autoRenew.isPending}
            onChange={(e) => autoRenew.mutate(e.target.checked)}
          />
          Tự gia hạn (nhắc trước 3 ngày)
        </label>
      )}
    </Card>
  );
}

/** Không trừ tiền tự động: "tự gia hạn" là nhắc trước 3 ngày, giữ gói thêm 3 ngày để người dùng thanh toán. */
function RenewalNotice({ me, expiresAt }: { me: Entitlements; expiresAt: string }) {
  const date = formatDate(expiresAt);
  if (me.status === 'GRACE') {
    return (
      <Notice tone="warn">
        Gói đã hết hạn ngày {date}. Bạn vẫn dùng được thêm vài ngày, thanh toán để không bị chuyển về gói Free.
      </Notice>
    );
  }
  if (me.status === 'RENEWAL_DUE') {
    return (
      <Notice tone="warn">
        {me.autoRenew
          ? `Gói đến kỳ gia hạn ngày ${date}. Thanh toán để gia hạn; quá hạn bạn vẫn được giữ gói thêm 3 ngày.`
          : `Gói hết hạn ngày ${date} và sẽ chuyển về Free.`}
      </Notice>
    );
  }
  return <p className="small muted">{me.autoRenew ? `Kỳ gia hạn tiếp theo: ${date}` : `Dùng đến hết ngày ${date}`}</p>;
}
