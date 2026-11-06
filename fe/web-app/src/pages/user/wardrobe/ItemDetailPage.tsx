import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import type { ClothingAttributes } from '../../../interface/dto/types';
import { CATEGORY_LABEL, categoryLabel } from '../../../services/shared/labels';
import { Button, Card, Chip, Field, ItemTile, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { useConfirm, useDelete, useItem, useUpdateItem } from '../../../hooks/user/wardrobe/api';

type Season = NonNullable<ClothingAttributes['seasons']>[number];
const SEASONS: { value: Season; label: string }[] = [
  { value: 'SPRING', label: 'Xuân' }, { value: 'SUMMER', label: 'Hè' },
  { value: 'AUTUMN', label: 'Thu' }, { value: 'WINTER', label: 'Đông' },
];
const list = (value: string) => [...new Set(value.split(',').map((part) => part.trim()).filter(Boolean))];

export function ItemDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const item = useItem(id);
  const confirm = useConfirm(id);
  const update = useUpdateItem(id);
  const remove = useDelete();
  const [form, setForm] = useState<ClothingAttributes>({});
  const [colors, setColors] = useState('');
  const [styles, setStyles] = useState('');
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    if (!item.data) return;
    setForm({ category: item.data.category, material: item.data.material ?? '', seasons: item.data.seasons ?? [],
      purchasePrice: item.data.purchasePrice, purchaseDate: item.data.purchaseDate, brand: item.data.brand });
    setColors((item.data.colors ?? []).join(', '));
    setStyles((item.data.styleTags ?? []).join(', '));
    setReviewed(false);
  }, [item.data]);

  const attributes = { ...form, colors: list(colors), styleTags: list(styles) };
  const invalidPrice = form.purchasePrice != null && (!Number.isFinite(form.purchasePrice) || form.purchasePrice < 0
    || form.purchasePrice > 999999999999.99 || Number(form.purchasePrice.toFixed(2)) !== form.purchasePrice);
  const save = () => {
    if (invalidPrice) return;
    if (item.data?.status === 'PENDING_REVIEW' || item.data?.status === 'RECOGNITION_FAILED') confirm.mutate(attributes);
    else update.mutate(attributes);
  };
  const toggleSeason = (value: Season) => setForm((current) => ({
    ...current,
    seasons: current.seasons?.includes(value)
      ? current.seasons.filter((season) => season !== value)
      : [...(current.seasons ?? []), value],
  }));

  return <div className="stack-lg">
    <PageHeader title={categoryLabel(item.data?.category)} back={{ to: '/wardrobe', label: 'Tủ đồ' }} />
    {item.isPending && <Spinner />}
    {item.isError && <Notice tone="error">{errorMessage(item.error)}</Notice>}
    {item.data && <Card>
      <div style={{ maxWidth: 260 }}><ItemTile category={item.data.category} imageUrl={item.data.imageUrl} /></div>
      {item.data.status === 'PROCESSING' ? <Spinner label="AI đang nhận diện món đồ…" /> : <div className="stack">
        <h2>Kiểm tra món đồ AI đã tách</h2>
        <p className="muted">Xem ảnh và sửa các thông tin bên dưới trước khi đưa món đồ vào tủ.</p>
        <div className="field"><label>Loại đồ</label><div className="row">
          {Object.entries(CATEGORY_LABEL).map(([value, label]) => <Chip key={value} active={form.category === value} onClick={() => setForm((current) => ({ ...current, category: value as ClothingAttributes['category'] }))}>{label}</Chip>)}
        </div></div>
        <Field id="item-colors" label="Màu sắc (cách nhau bằng dấu phẩy)" value={colors} onChange={(event) => setColors(event.target.value)} placeholder="Tím, trắng" />
        <Field id="item-material" label="Chất liệu" value={form.material ?? ''} onChange={(event) => setForm((current) => ({ ...current, material: event.target.value }))} placeholder="Cotton, denim…" />
        <div className="field"><label>Mùa phù hợp</label><div className="row">
          {SEASONS.map((season) => <Chip key={season.value} active={form.seasons?.includes(season.value)} onClick={() => toggleSeason(season.value)}>{season.label}</Chip>)}
        </div><p className="small muted">Để trống nếu có thể mặc mọi mùa.</p></div>
        <Field id="item-styles" label="Phong cách (cách nhau bằng dấu phẩy)" value={styles} onChange={(event) => setStyles(event.target.value)} placeholder="Casual, công sở" />
        <h2>Thông tin mua hàng</h2>
        <p className="small muted">Không bắt buộc. Để trống nếu bạn chưa nhớ; nhập 0 nếu món đồ được tặng.</p>
        <Field id="item-price" label="Giá mua (VND)" type="number" min="0" max="999999999999.99" step="0.01" value={form.purchasePrice ?? ''} aria-invalid={invalidPrice}
          onChange={(event) => setForm((current) => ({ ...current, purchasePrice: event.target.value === '' ? null : Number(event.target.value) }))} />
        {invalidPrice && <Notice tone="error">Giá mua phải không âm, tối đa 12 chữ số và 2 số thập phân.</Notice>}
        <Field id="item-purchase-date" label="Ngày mua" type="date" value={form.purchaseDate ?? ''}
          onChange={(event) => setForm((current) => ({ ...current, purchaseDate: event.target.value || null }))} />
        <Field id="item-brand" label="Thương hiệu" maxLength={100} value={form.brand ?? ''} placeholder="Ví dụ: Uniqlo"
          onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value || null }))} />
        {(item.data.status === 'PENDING_REVIEW' || item.data.status === 'RECOGNITION_FAILED') && <label className="row"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} /> Tôi đã kiểm tra ảnh và toàn bộ thông tin của món đồ.</label>}
      </div>}
      {(confirm.isSuccess || update.isSuccess) && <Notice>Đã lưu thông tin món đồ.</Notice>}
      {(confirm.isError || update.isError || remove.isError) && <Notice tone="error">{errorMessage(confirm.error ?? update.error ?? remove.error)}</Notice>}
      <div className="row">
        {(item.data.status === 'PENDING_REVIEW' || item.data.status === 'RECOGNITION_FAILED' || item.data.status === 'CONFIRMED') && <Button onClick={save} disabled={invalidPrice || confirm.isPending || update.isPending || !form.category || (item.data.status !== 'CONFIRMED' && !reviewed)}>
          {confirm.isPending || update.isPending ? 'Đang lưu…' : item.data.status === 'CONFIRMED' ? 'Lưu thay đổi' : 'Xác nhận món đồ'}
        </Button>}
        <Button kind="outline" onClick={() => remove.mutate(id, { onSuccess: () => navigate('/wardrobe') })} disabled={remove.isPending}>Xoá món này</Button>
      </div>
    </Card>}
  </div>;
}
