import { useSearchParams } from 'react-router-dom';
import { errorMessage } from '../../../shared/api/client';
import { ButtonLink, Card, EmptyState, Notice, Spinner } from '../../../shared/ui';
import { useConfirmOrder, useMyPlan } from '../api';
import { formatDate, vnd } from '../labels';

/** Trang thanh toán ?orderCode=...: hiện mã VietQR, hỏi backend tới khi đơn nhận được tiền. */
export function BillingResultPage() {
  const [params] = useSearchParams();
  const raw = Number(params.get('orderCode'));
  const orderCode = Number.isSafeInteger(raw) && raw > 0 ? raw : null;
  const order = useConfirmOrder(orderCode);
  const me = useMyPlan();

  if (orderCode === null) {
    return (
      <EmptyState icon="🧾" title="Không có mã đơn">
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
  if (o.status === 'CANCELLED' || !o.checkoutUrl) {
    return (
      <div className="stack">
        <Notice tone="warn">Đơn #{o.orderCode} đã huỷ, bạn chưa bị trừ tiền.</Notice>
        <ButtonLink to="/plans" kind="ghost" small>
          Chọn gói khác
        </ButtonLink>
      </div>
    );
  }
  // Nội dung chuyển khoản nằm sẵn trong ảnh QR (tham số des)
  const transferNote = new URL(o.checkoutUrl).searchParams.get('des');
  return (
    <Card>
      <span className="eyebrow">Đơn #{o.orderCode}</span>
      <h1>Quét mã để thanh toán {vnd(o.amountVnd)}</h1>
      <p className="muted">Mở app ngân hàng hoặc ví, chọn quét QR. Trang này tự cập nhật khi nhận được tiền.</p>
      <img
        src={o.checkoutUrl}
        alt={`Mã VietQR thanh toán ${vnd(o.amountVnd)}`}
        width={280}
        height={280}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
      />
      {transferNote && (
        <Notice>
          Chuyển khoản tay thì ghi đúng nội dung <strong>{transferNote}</strong> và đúng số tiền, nếu không gói sẽ không
          tự kích hoạt.
        </Notice>
      )}
      <Spinner label="Đang chờ nhận tiền…" />
      <ButtonLink to="/plans" kind="ghost" small>
        Chọn gói khác
      </ButtonLink>
    </Card>
  );
}
