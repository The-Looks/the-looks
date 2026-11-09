import type { ReactNode } from 'react';
import { errorMessage } from '../../../services/shared/api/client';
import { occasionLabel } from '../../../services/user/outfit/occasions';
import type { Occasion } from '../../../interface/dto/types';
import { Badge, Button, Card, Notice } from '../../shared/ui/index';
import { useOpenProduct, useShopping } from '../../../hooks/user/outfit/api';

const SOURCE_LABEL: Record<string, string> = { TIKTOK_SHOP: 'TikTok Shop', SHOPEE: 'Shopee' };
const vnd = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

type Offer = NonNullable<ReturnType<typeof useShopping>['data']>['products'][number];

/**
 * "Gợi ý mua thêm": bộ đồ hợp dịp (áo, quần, giày, phụ kiện) và món tủ đồ còn thiếu, sản phẩm qua link affiliate
 * (ghi rõ cho người dùng).
 */
export function ShoppingCard({ occasion }: { occasion: Occasion }) {
  const shopping = useShopping(occasion);
  const open = useOpenProduct();
  if (!shopping.data) return null;
  const { gap, products, look } = shopping.data;

  const card = (p: Offer, tag?: ReactNode) => (
    <Card key={p.id}>
      {tag}
      {p.imageUrl && (
        <img src={p.imageUrl} alt={p.title} loading="lazy"
          style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12 }} />
      )}
      <p className="small" style={{ margin: 0 }}>{p.title.length > 80 ? `${p.title.slice(0, 80)}…` : p.title}</p>
      <p style={{ margin: 0 }}>
        <strong>{p.minPriceVnd === p.maxPriceVnd ? vnd(p.minPriceVnd) : `${vnd(p.minPriceVnd)} – ${vnd(p.maxPriceVnd)}`}</strong>
      </p>
      <p className="small muted" style={{ margin: 0 }}>
        {p.shopName}{p.unitsSold > 0 && ` · đã bán ${p.unitsSold.toLocaleString('vi-VN')}`}
      </p>
      <Button small block kind="outline" disabled={open.isPending} onClick={() => open.mutate(p.id)}>
        {open.isPending && open.variables === p.id ? 'Đang mở…' : `Xem trên ${SOURCE_LABEL[p.source] ?? (p.shopName || 'sàn')}`}
      </Button>
    </Card>
  );

  return (
    <section className="stack" aria-label="Gợi ý mua thêm">
      <div className="spread">
        <h2>{look.length ? `Bộ gợi ý mua cho dịp ${occasionLabel(occasion)?.toLowerCase()}` : `Tủ đồ còn thiếu ${gap?.label}`}</h2>
        <Badge>Liên kết tiếp thị</Badge>
      </div>
      <p className="small muted">
        Gợi ý theo dịp, phong cách và màu bạn thích. The Looks có thể nhận hoa hồng khi bạn mua qua các liên kết
        này, giá của bạn không đổi.
      </p>
      {open.isError && <Notice tone="error">{errorMessage(open.error)}</Notice>}
      {look.length > 0 && (
        <div className="grid-cards" aria-label="Bộ đồ hợp dịp">
          {look.map((item) => card(item.product,
            <div className="spread small"><strong>{item.label}</strong>
              {item.owned ? <span className="muted">Tủ đã có</span> : <Badge tone="pink">Tủ còn thiếu</Badge>}</div>))}
        </div>
      )}
      {gap && products.length > 0 && <>
        <h3>Thêm lựa chọn cho {gap.label}</h3>
        <div className="grid-cards">{products.map((p) => card(p))}</div>
      </>}
    </section>
  );
}
