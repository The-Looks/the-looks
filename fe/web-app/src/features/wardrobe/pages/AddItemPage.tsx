import { useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../../../shared/api/client';
import type { WardrobeItem } from '../../../shared/api/types';
import { Card, ItemTile, Notice, PageHeader } from '../../../shared/ui';
import { useUpload } from '../api';

/** Chụp hoặc chọn nhiều ảnh; trên điện thoại ô chọn ảnh mở thẳng camera sau. */
export function AddItemPage() {
  const upload = useUpload();
  const [uploaded, setUploaded] = useState<WardrobeItem[]>([]);
  const [failed, setFailed] = useState<string | null>(null);

  const onFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    setFailed(null);
    for (const file of files) {
      try {
        const item = await upload.mutateAsync(file);
        setUploaded((u) => [item, ...u]);
      } catch (err) {
        setFailed(errorMessage(err));
      }
    }
  };

  return (
    <div className="stack-lg">
      <PageHeader title="Thêm món đồ" back={{ to: '/wardrobe', label: 'Tủ đồ' }} sub="AI tự nhận diện loại đồ và màu sắc, bạn chỉ cần kiểm tra lại." />
      <Card>
        <label htmlFor="add-photos" className="btn btn-block" style={{ cursor: 'pointer' }}>
          {upload.isPending ? 'Đang tải ảnh…' : 'Chụp hoặc chọn ảnh'}
        </label>
        <input id="add-photos" type="file" accept="image/*" capture="environment" multiple hidden onChange={onFiles} />
        <p className="small muted">Mẹo: chụp từng món trên nền trơn, đủ sáng. Có thể chọn nhiều ảnh một lần.</p>
      </Card>
      {failed && <Notice tone="error">{failed}</Notice>}
      {uploaded.length > 0 && (
        <section className="stack">
          <h2>Vừa tải lên</h2>
          <div className="grid-tiles">
            {uploaded.map((item) => (
              <Link key={item.id} to={`/wardrobe/${item.id}`}>
                <ItemTile imageUrl={item.imageUrl} label="Xem và xác nhận" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
