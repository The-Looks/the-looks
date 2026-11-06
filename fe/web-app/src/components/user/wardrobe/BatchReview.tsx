import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ClothingAttributes, WardrobeItem } from '../../../interface/dto/types';
import { useConfirmAll } from '../../../hooks/user/wardrobe/api';
import { errorMessage } from '../../../services/shared/api/client';
import { CATEGORY_LABEL, categoryLabel } from '../../../services/shared/labels';
import { Button, Field, ItemTile, Notice } from '../../shared/ui/index';
import './batch-review.css';

const pending = (item: WardrobeItem) => item.status === 'PENDING_REVIEW' || item.status === 'RECOGNITION_FAILED';

export function BatchReview({ items }: { items: WardrobeItem[] }) {
  const confirm = useConfirmAll();
  const [selected, setSelected] = useState(() => new Set(items.filter(pending).map((item) => item.id)));
  const [edits, setEdits] = useState<Record<string, Partial<ClothingAttributes>>>({});
  const [confirmed, setConfirmed] = useState<Set<string>>(() => new Set());
  const [savedCount, setSavedCount] = useState(0);
  const reviewable = items.filter((item) => pending(item) && !confirmed.has(item.id));
  const chosen = reviewable.filter((item) => selected.has(item.id));
  const attributes = (item: WardrobeItem): ClothingAttributes => ({
    category: item.category, colors: item.colors, material: item.material,
    seasons: item.seasons, styleTags: item.styleTags, ...edits[item.id],
  });
  const toggle = (id: string) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const edit = (id: string, patch: Partial<ClothingAttributes>) => {
    confirm.reset();
    setEdits((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  };
  const submit = () => confirm.mutate(chosen.map((item) => ({ itemId: item.id, attributes: attributes(item) })), {
    onSuccess: (saved) => {
      setConfirmed((current) => new Set([...current, ...saved.map((item) => item.id)]));
      setSelected((current) => new Set([...current].filter((id) => !saved.some((item) => item.id === id))));
      setSavedCount(saved.length);
    },
  });

  return <section className="stack" aria-label="Kiểm tra kết quả quét">
    <h2>Tìm thấy {items.length} món</h2>
    <p className="muted">Kiểm tra ảnh, sửa loại và màu ngay bên dưới. Bỏ chọn những món bạn muốn xem lại sau.</p>
    {savedCount > 0 && <Notice>Đã thêm {savedCount} món vào tủ đồ.</Notice>}
    {confirm.isError && <Notice tone="error">{errorMessage(confirm.error)}</Notice>}
    {reviewable.length > 0 && <div className="row">
      <Button kind="outline" small disabled={confirm.isPending} onClick={() => setSelected(new Set(reviewable.map((item) => item.id)))}>Chọn tất cả</Button>
      <Button kind="outline" small disabled={confirm.isPending} onClick={() => setSelected(new Set())}>Bỏ chọn tất cả</Button>
      <span aria-live="polite">Đã chọn {chosen.length}/{reviewable.length} món</span>
    </div>}
    <div className="batch-review-grid">
      {items.map((item, index) => {
        const done = confirmed.has(item.id) || item.status === 'CONFIRMED';
        const editable = pending(item) && !done;
        const attrs = attributes(item);
        return <article className="batch-review-item" key={item.id} data-selected={editable && selected.has(item.id)}>
          <ItemTile category={attrs.category} imageUrl={item.imageUrl} />
          {editable ? <>
            <label className="row"><input type="checkbox" checked={selected.has(item.id)} disabled={confirm.isPending} onChange={() => toggle(item.id)} />Chọn món {index + 1}</label>
            <div className="field"><label htmlFor={`category-${item.id}`}>Loại món {index + 1}</label>
              <select id={`category-${item.id}`} value={attrs.category ?? ''} disabled={confirm.isPending} onChange={(event) => edit(item.id, { category: event.target.value as ClothingAttributes['category'] })}>
                <option value="" disabled>Chọn loại đồ</option>
                {Object.entries(CATEGORY_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <Field id={`colors-${item.id}`} label={`Màu món ${index + 1} (cách nhau bằng dấu phẩy)`} value={attrs.colors?.join(', ') ?? ''} disabled={confirm.isPending}
              onChange={(event) => edit(item.id, { colors: event.target.value.split(',').map((color) => color.trim()) })} />
            {edits[item.id] && <small className="muted">Đã chỉnh sửa so với AI</small>}
            <Link to={`/wardrobe/${item.id}`}>Xem chi tiết</Link>
          </> : <><strong>{categoryLabel(attrs.category)}</strong><span>{done ? 'Đã xác nhận' : 'Chưa thể xác nhận'}</span></>}
        </article>;
      })}
    </div>
    {reviewable.length > 0 && <Button onClick={submit} disabled={confirm.isPending || chosen.length === 0 || chosen.length > 100 || chosen.some((item) => !attributes(item).category)}>
      {confirm.isPending ? 'Đang xác nhận…' : `Xác nhận ${chosen.length} món đã chọn`}
    </Button>}
    {chosen.length > 100 && <Notice tone="warn">Chọn tối đa 100 món mỗi lần xác nhận.</Notice>}
    <Link to="/wardrobe">Về tủ đồ</Link>
  </section>;
}
