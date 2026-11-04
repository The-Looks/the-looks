import { Badge, ButtonLink, Card } from '../../shared/ui/index';
import { useMyPlan } from '../../../hooks/user/billing/api';
import { formatDate } from '../../../services/user/billing/labels';

/** Thẻ gói hiện tại trên trang chủ, dẫn tới trang chọn gói. */
export function MyPlanCard() {
  const me = useMyPlan();
  if (!me.data) return null;
  const { plan, expiresAt, limits } = me.data;
  const items = limits.wardrobeItems;
  return (
    <Card>
      <div className="spread">
        <h2>Gói {plan === 'FREE' ? 'Free' : plan === 'PLUS' ? 'Plus' : 'Pro'}</h2>
        {plan !== 'FREE' && <Badge tone="green">Đang dùng</Badge>}
      </div>
      <p className="muted">
        {items === null || items === undefined ? 'Tủ đồ không giới hạn' : `Tủ đồ tối đa ${items} món`} ·{' '}
        {limits.aiSuggestionsPerDay} lượt AI/ngày
        {expiresAt && <> · đến hết {formatDate(expiresAt)}</>}
      </p>
      <div>
        <ButtonLink to="/plans" kind={plan === 'PRO' ? 'ghost' : 'primary'} small>
          {plan === 'FREE' ? 'Nâng cấp' : plan === 'PLUS' ? 'Lên Pro' : 'Gia hạn'}
        </ButtonLink>
      </div>
    </Card>
  );
}
