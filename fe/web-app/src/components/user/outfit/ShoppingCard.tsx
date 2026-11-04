import { errorMessage } from '../../../services/shared/api/client';
import type { Occasion } from '../../../interface/dto/types';
import { Badge, Button, Card, Notice } from '../../shared/ui/index';
import { useOpenProduct, useShopping } from '../../../hooks/user/outfit/api';

const SOURCE_LABEL: Record<string, string> = { TIKTOK_SHOP: 'TikTok Shop', SHOPEE: 'Shopee' };
const vnd = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

/** "Gợi ý mua thêm": món tủ đồ còn thiếu cho dịp này, sản phẩm qua link affiliate (ghi rõ cho người dùng). */
export function ShoppingCard({ occasion }: { occasion: Occasion }) {
  const shopping = useShopping(occasion);
  const open = useOpenProduct();
  if (!shopping.data) return null;
  const { gap, products } = shopping.data;

  return (
    <section className="stack" aria-label="Gợi ý mua thêm">
      <div className="spread">
        <h2>Tủ đồ còn thiếu {gap.label}</h2>
        <Badge>Liên kết tiếp thị</Badge>
      </div>
      <p className="small muted">
        Có thêm một món {gap.label} là phối được trọn bộ. The Looks có thể nhận hoa hồng khi bạn mua qua các liên kết
        này, giá của bạn không đổi.
      </p>
      {open.isError && <Notice tone="error">{errorMessage(open.error)}</Notice>}
      <div className="grid-cards">
        {products.map((p) => (
          <Card key={p.id}>
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.title}
                loading="lazy"
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12 }}
              />
            )}
            <p className="small" style={{ margin: 0 }}>
              {p.title.length > 80 ? `${p.title.slice(0, 80)}…` : p.title}
            </p>
            <p style={{ margin: 0 }}>
              <strong>
                {p.minPriceVnd === p.maxPriceVnd ? vnd(p.minPriceVnd) : `${vnd(p.minPriceVnd)} – ${vnd(p.maxPriceVnd)}`}
              </strong>
            </p>
            <p className="small muted" style={{ margin: 0 }}>
              {p.shopName} · đã bán {p.unitsSold.toLocaleString('vi-VN')}
            </p>
            <Button small block kind="outline" disabled={open.isPending} onClick={() => open.mutate(p.id)}>
              {open.isPending && open.variables === p.id ? 'Đang mở…' : `Xem trên ${SOURCE_LABEL[p.source] ?? 'sàn'}`}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
