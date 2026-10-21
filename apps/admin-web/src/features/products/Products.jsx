import { useMemo, useState } from 'react';
import Icon from '../../shared/ui/Icon.jsx';
import { Badge, Card, Modal, PageHead, StatCard, formatVnd } from '../../shared/ui/Ui.jsx';
import { useStore } from '../../shared/store.jsx';

const EMPTY = { name: '', source: 'Shopee', price: '', category: '' };

export default function Products() {
  const { products, addProduct, setProductStatus, showToast } = useStore();
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('Tất cả');
  const [status, setStatus] = useState('Tất cả');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (source === 'Tất cả' || p.source === source) &&
        (status === 'Tất cả' || p.status === status) &&
        (!q || p.name.toLowerCase().includes(q) || p.source.toLowerCase().includes(q)),
    );
  }, [products, query, source, status]);

  const submit = (e) => {
    e.preventDefault();
    const price = Number(String(form.price).replace(/\D/g, ''));
    if (!form.name.trim() || !price) return;
    addProduct({ ...form, name: form.name.trim(), price, category: form.category.trim() || 'Khác' });
    setOpen(false);
    setForm(EMPTY);
    showToast('Đã thêm sản phẩm, đang chờ duyệt');
  };

  return (
    <>
      <PageHead
        crumb="Quản trị / Sản phẩm"
        title="Quản lý sản phẩm"
        subtitle="Kiểm soát sản phẩm hiển thị trong Trợ lý mua sắm."
      />
      <div className="grid c3">
        <StatCard icon="bag" value="1.246" label="Đang hiển thị" note="Sản phẩm hợp lệ" noteTone="green" />
        <StatCard icon="clock" value="82" label="Chờ kiểm tra" note="Nguồn mới cập nhật" noteTone="amber" />
        <StatCard icon="alert" value="13" label="Cần sửa thông tin" note="Giá hoặc ảnh lỗi" noteTone="pink" />
      </div>

      <Card
        className="mt"
        title="Danh mục sản phẩm gợi ý"
        subtitle="Dữ liệu mẫu từ các nguồn đã kết nối; Admin duyệt trạng thái hiển thị."
        action={
          <button type="button" className="btn primary sm" onClick={() => setOpen(true)}>
            <Icon name="plus" size={14} /> Thêm sản phẩm
          </button>
        }
      >
        <div className="toolbar">
          <input className="input" placeholder="Tìm sản phẩm hoặc nguồn bán..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="select" value={source} onChange={(e) => setSource(e.target.value)} aria-label="Nguồn bán">
            {['Tất cả', 'Shopee', 'TikTok Shop'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Trạng thái">
            {['Tất cả', 'Hiển thị', 'Chờ duyệt', 'Cần sửa'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Nguồn</th>
              <th>Giá tham khảo</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="strong">{p.name}</td>
                <td>{p.source}</td>
                <td>{formatVnd(p.price)}</td>
                <td>{p.category}</td>
                <td><Badge>{p.status}</Badge></td>
                <td>
                  {p.status === 'Chờ duyệt' && (
                    <button type="button" className="btn sm" onClick={() => setProductStatus(p.id, 'Hiển thị')}>Duyệt</button>
                  )}
                  {p.status === 'Hiển thị' && (
                    <button type="button" className="btn sm" onClick={() => setProductStatus(p.id, 'Cần sửa')}>Báo lỗi</button>
                  )}
                  {p.status === 'Cần sửa' && (
                    <button type="button" className="btn sm" onClick={() => setProductStatus(p.id, 'Chờ duyệt')}>Đã sửa</button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="6">Không có sản phẩm phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="footnote">Giá và trạng thái trong bản này là dữ liệu minh họa.</p>
      </Card>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <h3>Thêm sản phẩm</h3>
          <p className="sub">Sản phẩm mới sẽ ở trạng thái chờ duyệt.</p>
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="pname">Tên sản phẩm</label>
              <input id="pname" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="psource">Nguồn bán</label>
              <select id="psource" className="select" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                <option>Shopee</option>
                <option>TikTok Shop</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="pprice">Giá tham khảo (đ)</label>
              <input id="pprice" className="input" inputMode="numeric" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="pcat">Danh mục</label>
              <input id="pcat" className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Hủy</button>
              <button type="submit" className="btn primary">Thêm</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
