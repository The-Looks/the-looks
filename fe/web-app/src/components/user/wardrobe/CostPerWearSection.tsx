import { Link } from 'react-router-dom';
import { useMyPlan } from '../../../hooks/user/billing/api';
import { useCostPerWear } from '../../../hooks/user/wardrobe/api';
import { ApiError, errorMessage } from '../../../services/shared/api/client';
import { categoryLabel } from '../../../services/shared/labels';
import { formatVnd } from '../../../services/shared/format';
import { Button, ButtonLink, Notice, Spinner } from '../../shared/ui/index';
import './cost-per-wear.css';

export function CostPerWearSection({ itemId }: { itemId?: string }) {
  const plan = useMyPlan();
  const allowed = plan.data?.features.includes('COST_PER_WEAR') ?? false;
  const cost = useCostPerWear(itemId, allowed);
  const upgrade = <div className="stack"><p className="muted">Theo dõi giá mua trên mỗi lần mặc với gói Pro.</p><ButtonLink to="/plans" kind="outline" small>Xem gói Pro</ButtonLink></div>;
  let content;
  if (plan.isPending) content = <Spinner label="Đang kiểm tra quyền Pro…" />;
  else if (plan.isError) content = <Notice tone="error">{errorMessage(plan.error)} <Button small onClick={() => void plan.refetch()}>Thử lại</Button></Notice>;
  else if (!allowed) content = upgrade;
  else if (cost.isPending) content = <Spinner label="Đang tính chi phí mỗi lần mặc…" />;
  else if (cost.isError) content = cost.error instanceof ApiError && cost.error.status === 403 ? upgrade
    : <Notice tone="error">{errorMessage(cost.error)} <Button small onClick={() => void cost.refetch()}>Thử lại</Button></Notice>;
  else if (cost.data) content = <>
    <p className="small muted">Giá mua đã lưu ÷ số lần bấm “Mặc bộ này”. Chỉ tính khi đã có giá mua và ít nhất một lần mặc.</p>
    {!itemId && <p className="small muted">Hiện {cost.data.items.length}/{cost.data.totalItems} món; ưu tiên chi phí mỗi lần mặc cao nhất.</p>}
    {cost.data.items.length === 0 && <p>Chưa có món đã xác nhận để tính chi phí.</p>}
    <ul className="cost-per-wear-list">{cost.data.items.map((row) => <li key={row.item.id}>
      <div className="cost-per-wear-row">
        {itemId ? <strong>Chi phí hiện tại</strong> : <Link to={`/wardrobe/${row.item.id}`}>{categoryLabel(row.item.category)}{row.item.brand ? ` · ${row.item.brand}` : ''}</Link>}
        <strong className="cost-per-wear-value">{row.status === 'CALCULATED' && row.costPerWear !== null
          ? `${formatVnd(row.costPerWear)}/lần` : row.status === 'MISSING_PRICE' ? 'Chưa nhập giá mua' : 'Chưa từng mặc'}</strong>
        <span className="small muted">Giá mua: {row.item.purchasePrice == null ? 'Chưa nhập' : formatVnd(row.item.purchasePrice)} · {row.wearCount} lần mặc</span>
        {row.status === 'MISSING_PRICE' && !itemId && <Link className="small" to={`/wardrobe/${row.item.id}`}>Bổ sung giá mua</Link>}
      </div>
    </li>)}</ul>
  </>;
  return <section className="cost-per-wear-panel stack" aria-label="Chi phí mỗi lần mặc">
    <h2>Chi phí mỗi lần mặc <span className="small muted">Pro</span></h2>
    {content}
  </section>;
}
