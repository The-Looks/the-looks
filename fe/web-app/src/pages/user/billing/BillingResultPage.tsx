import { useSearchParams } from 'react-router-dom';
import { FileTextOutlined } from '@ant-design/icons';
import { errorMessage } from '../../../services/shared/api/client';
import { ButtonLink, Card, EmptyState, Notice, Spinner } from '../../../components/shared/ui/index';
import { useConfirmOrder, useMyPlan } from '../../../hooks/user/billing/api';
import { formatDate, vnd } from '../../../services/user/billing/labels';

/** PayOS đưa người dùng về đây (returnUrl) kèm ?orderCode=...; hỏi backend xem đơn đã thanh toán chưa. */
export function BillingResultPage() {
  const [params] = useSearchParams();
  const raw = Number(params.get('orderCode'));
  const orderCode = Number.isSafeInteger(raw) && raw > 0 ? raw : null;
  const order = useConfirmOrder(orderCode);
  const me = useMyPlan();

  if (orderCode === null) {
    return (
      <EmptyState icon={<FileTextOutlined />} title="Không có mã đơn">
        <ButtonLink to="/plans" small>
          Xem các gói
        </ButtonLink>
      </EmptyState>
    );
  }
  if (order.isPending) return <Spinner label="Đang kiểm tra thanh toán…" />;
  if (order.isError) return <Notice tone="error">{errorMessage(order.error)}</Notice>;

  const o = order.data;
  if (o.status === 'PAID') {
    return (
      <Card hero>
        <span className="eyebrow" style={{ color: 'inherit', opacity: 0.85 }}>
          Thanh toán thành công
        </span>
        <h1>Chào mừng bạn đến với gói {o.plan === 'PRO' ? 'Pro' : 'Plus'}</h1>
        <p>
          Đơn #{o.orderCode} · {vnd(o.amountVnd)}
          {me.data?.expiresAt && <> · dùng đến hết ngày {formatDate(me.data.expiresAt)}</>}
        </p>
        <div className="row">
          <ButtonLink to="/" kind="ghost">
            Về trang chủ
          </ButtonLink>
        </div>
      </Card>
    );
  }
  return (
    <div className="stack">
      <Notice tone="warn">
        {o.status === 'CANCELLED'
          ? `Đơn #${o.orderCode} đã huỷ, bạn chưa bị trừ tiền.`
          : `Đơn #${o.orderCode} chưa nhận được tiền. Nếu bạn vừa chuyển khoản, đợi vài giây, trang sẽ tự cập nhật.`}
      </Notice>
      <div className="row">
        {o.status === 'PENDING' && o.checkoutUrl && (
          <a className="btn btn-sm" href={o.checkoutUrl}>
            Mở lại trang thanh toán
          </a>
        )}
        <ButtonLink to="/plans" kind="ghost" small>
          Chọn gói khác
        </ButtonLink>
      </div>
    </div>
  );
}
