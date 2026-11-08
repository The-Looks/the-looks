import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import { Card, ItemTile, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { BatchReview } from '../../../components/user/wardrobe/BatchReview';
import { useScan, useStartScan } from '../../../hooks/user/wardrobe/api';

const MAX_IMAGES = 10;

/**
 * Chụp hoặc chọn tối đa 10 ảnh. Mỗi ảnh có thể có nhiều món: AI tách từng món, cắt ảnh riêng,
 * người dùng chọn và xác nhận nhiều món cùng lúc. Trên điện thoại ô chọn ảnh mở thẳng camera sau.
 */
export function AddItemPage({ guided = false, onConfirmed }: { guided?: boolean; onConfirmed?: () => void } = {}) {
  const start = useStartScan();
  const [params, setParams] = useSearchParams();
  // Mã lần quét nằm trên địa chỉ trang (?scan=…): tải lại trang vẫn tiếp tục chờ và hiện các món đang tách
  const [scanId, setScanId] = useState<string | null>(() => params.get('scan'));
  const [tooMany, setTooMany] = useState(false);
  const scan = useScan(scanId);

  const [pasteError, setPasteError] = useState('');

  const upload = (files: File[]) => {
    if (files.length === 0) return;
    setPasteError('');
    setTooMany(files.length > MAX_IMAGES);
    start.mutate(files.slice(0, MAX_IMAGES), { onSuccess: (s) => {
      setScanId(s.id);
      setParams((current) => { const next = new URLSearchParams(current); next.set('scan', s.id); return next; }, { replace: true });
    } });
  };

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    upload(files);
  };

  const processing = start.isPending || scan.data?.status === 'PROCESSING';

  // Ctrl+V / Cmd+V ở bất kỳ đâu trên trang: dán ảnh vừa copy (ảnh chụp màn hình, ảnh copy từ web / Zalo / Messenger)
  const uploadRef = useRef(upload);
  uploadRef.current = upload;
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (processing) return;
      const images = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith('image/'));
      if (images.length === 0) return; // dán chữ vào ô nhập vẫn bình thường
      e.preventDefault();
      uploadRef.current(images);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [processing]);

  /** Nút "Dán ảnh" cho điện thoại (không có Ctrl+V): đọc ảnh trong bộ nhớ tạm, trình duyệt sẽ hỏi quyền. */
  const pasteFromButton = async () => {
    setPasteError('');
    try {
      const images: File[] = [];
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((t) => t.startsWith('image/'));
        if (type) images.push(new File([await item.getType(type)], `dan-anh-${images.length + 1}.${type.split('/')[1]}`, { type }));
      }
      if (images.length === 0) setPasteError('Bộ nhớ tạm chưa có ảnh. Hãy copy một ảnh trước (giữ vào ảnh → Sao chép).');
      else upload(images);
    } catch {
      setPasteError('Trình duyệt chưa cho đọc bộ nhớ tạm. Trên máy tính hãy nhấn Ctrl+V; trên điện thoại hãy dùng "Chọn ảnh từ máy".');
    }
  };

  const items = scan.data?.items ?? [];

  return (
    <div className="stack-lg">
      {!guided && <PageHeader
        title="Thêm món đồ"
        back={{ to: '/wardrobe' }}
        sub="Chụp cả bộ đang mặc hoặc trải nhiều món ra chụp một lần: AI tự tách từng món, bạn chỉ cần kiểm tra lại."
      />}
      <Card>
        <div className="row">
          <label htmlFor="add-photos" className="btn" style={{ cursor: processing ? 'wait' : 'pointer' }}>
            {processing ? 'AI đang tách từng món…' : 'Chọn ảnh từ máy'}
          </label>
          <label htmlFor="camera-photo" className="btn btn-outline" style={{ cursor: processing ? 'wait' : 'pointer' }}>
            Chụp ảnh
          </label>
          {typeof navigator !== 'undefined' && 'clipboard' in navigator && 'read' in navigator.clipboard && (
            <button type="button" className="btn btn-outline" disabled={processing} onClick={() => void pasteFromButton()}>
              Dán ảnh
            </button>
          )}
        </div>
        <input
          id="add-photos"
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          hidden
          disabled={processing}
          onChange={onFiles}
        />
        <input id="camera-photo" type="file" accept="image/*" capture="environment" hidden disabled={processing} onChange={onFiles} />
        <p className="small muted">Mẹo: copy ảnh ở bất kỳ đâu rồi nhấn <kbd>Ctrl</kbd>+<kbd>V</kbd> trên trang này để thêm nhanh.</p>
        <p className="small muted">
          JPEG, PNG, WebP, AVIF, GIF và định dạng ảnh thiết bị đọc được. Mẹo: đủ sáng, các món không chồng lên nhau. Tối đa {MAX_IMAGES} ảnh mỗi lần. Ảnh gốc không được lưu, chỉ giữ
          ảnh từng món.
        </p>
      </Card>

      {pasteError && <Notice tone="warn">{pasteError}</Notice>}
      {tooMany && <Notice tone="warn">Chỉ gửi {MAX_IMAGES} ảnh đầu tiên, các ảnh còn lại hãy gửi ở lần sau.</Notice>}
      {start.isError && <Notice tone="error">{errorMessage(start.error)}</Notice>}
      {scan.isError && <Notice tone="error">{errorMessage(scan.error)}</Notice>}
      {processing && scanId && <Spinner label={items.length
        ? `Đã tách được ${items.length} món, đang tách tiếp…`
        : 'Đang tìm và cắt từng món trong ảnh… Bạn có thể tải lại trang, kết quả vẫn còn.'} />}
      {processing && items.length > 0 && <div className="wardrobe-grid" aria-label="Món vừa tách">
        {items.map((item) => <ItemTile key={item.id} category={item.category} imageUrl={item.imageUrl} />)}
      </div>}

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

      {scan.data?.status === 'DONE' && items.length > 0 && <BatchReview key={scanId} items={items} onConfirmed={onConfirmed} guided={guided} />}
    </div>
  );
}
