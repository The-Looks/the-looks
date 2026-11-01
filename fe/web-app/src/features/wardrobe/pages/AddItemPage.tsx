import { useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../../../shared/api/client';
import { Card, ItemTile, Notice, PageHeader, Spinner } from '../../../shared/ui';
import { useScan, useStartScan } from '../api';

const MAX_IMAGES = 10;

/**
 * Chụp hoặc chọn tối đa 10 ảnh. Mỗi ảnh có thể có nhiều món: AI tách từng món, cắt ảnh riêng,
 * người dùng xác nhận từng món. Trên điện thoại ô chọn ảnh mở thẳng camera sau.
 */
export function AddItemPage() {
  const start = useStartScan();
  const [scanId, setScanId] = useState<string | null>(null);
  const [tooMany, setTooMany] = useState(false);
  const scan = useScan(scanId);

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setTooMany(files.length > MAX_IMAGES);
    start.mutate(files.slice(0, MAX_IMAGES), { onSuccess: (s) => setScanId(s.id) });
  };

  const processing = start.isPending || scan.data?.status === 'PROCESSING';
  const items = scan.data?.items ?? [];

  return (
    <div className="stack-lg">
      <PageHeader
        title="Thêm món đồ"
        back={{ to: '/wardrobe', label: 'Tủ đồ' }}
        sub="Chụp cả bộ đang mặc hoặc trải nhiều món ra chụp một lần: AI tự tách từng món, bạn chỉ cần kiểm tra lại."
      />
      <Card>
        <label htmlFor="add-photos" className="btn btn-block" style={{ cursor: processing ? 'wait' : 'pointer' }}>
          {processing ? 'AI đang tách từng món…' : 'Chụp hoặc chọn ảnh'}
        </label>
        <input
          id="add-photos"
          type="file"
          accept="image/jpeg,image/png"
          capture="environment"
          multiple
          hidden
          disabled={processing}
          onChange={onFiles}
        />
        <p className="small muted">
          Mẹo: đủ sáng, các món không chồng lên nhau. Tối đa {MAX_IMAGES} ảnh mỗi lần. Ảnh gốc không được lưu, chỉ giữ
          ảnh từng món.
        </p>
      </Card>

      {tooMany && <Notice tone="warn">Chỉ gửi {MAX_IMAGES} ảnh đầu tiên, các ảnh còn lại hãy gửi ở lần sau.</Notice>}
      {start.isError && <Notice tone="error">{errorMessage(start.error)}</Notice>}
      {scan.isError && <Notice tone="error">{errorMessage(scan.error)}</Notice>}
      {processing && scanId && <Spinner label="Đang tìm và cắt từng món trong ảnh…" />}

      {scan.data?.status === 'FAILED' && (
        <Notice tone="error">Không đọc được ảnh. Thử chụp lại rõ hơn hoặc chọn ảnh khác.</Notice>
      )}
      {scan.data?.status === 'DONE' && items.length === 0 && (
        <Notice tone="warn">Không tìm thấy món đồ nào trong ảnh. Thử chụp gần hơn, trên nền trơn.</Notice>
      )}
      {scan.data && scan.data.skippedForLimit > 0 && (
        <Notice tone="warn">
          Còn {scan.data.skippedForLimit} món chưa thêm vì tủ đồ đã đủ số món của gói hiện tại. Nâng cấp gói để thêm
          tiếp.
        </Notice>
      )}

      {items.length > 0 && (
        <section className="stack">
          <h2>Tìm thấy {items.length} món · bấm từng món để xác nhận</h2>
          <div className="grid-tiles">
            {items.map((item) => (
              <Link key={item.id} to={`/wardrobe/${item.id}`}>
                <ItemTile category={item.category} imageUrl={item.imageUrl} label="Xem và xác nhận" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
