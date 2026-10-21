import { useState } from 'react';
import { Card, PageHead, Switch } from '../../shared/ui/Ui.jsx';
import { useStore } from '../../shared/store.jsx';

// Mỗi dòng: toggle (bật/tắt) hoặc value (chỉ hiển thị giá trị).
const SECTIONS = [
  {
    title: 'Quyền truy cập',
    subtitle: 'Phân quyền theo vai trò Admin và lưu lịch sử thao tác.',
    rows: [
      { key: '2fa', label: 'Xác thực hai bước', hint: 'Bật cho tài khoản Admin', toggle: true, on: true },
      { key: 'session', label: 'Phiên đăng nhập', hint: 'Tự hết hạn sau 30 phút', value: '30 phút' },
      { key: 'audit', label: 'Nhật ký thao tác', hint: 'Lưu tất cả hành động quản trị', toggle: true, on: true },
    ],
  },
  {
    title: 'Quy tắc nội dung',
    subtitle: 'Thiết lập hàng đợi báo cáo từ cộng đồng.',
    rows: [
      { key: 'reported', label: 'Nội dung bị báo cáo', hint: 'Chuyển vào hàng đợi', toggle: true, on: true },
      { key: 'urgent', label: 'Ưu tiên khẩn cấp', hint: 'Đánh dấu khi có nhiều báo cáo', toggle: true, on: true },
      { key: 'notifyResult', label: 'Thông báo kết quả', hint: 'Gửi sau khi xử lý', toggle: true, on: false },
    ],
  },
  {
    title: 'Đồng bộ và sản phẩm',
    subtitle: 'Theo dõi chất lượng dữ liệu từ đối tác.',
    rows: [
      { key: 'shopee', label: 'Shopee', hint: 'Kết nối hoạt động', toggle: true, on: true },
      { key: 'tiktok', label: 'TikTok Shop', hint: 'Kết nối hoạt động', toggle: true, on: true },
      { key: 'price', label: 'Giá sản phẩm', hint: 'Yêu cầu kiểm tra trước hiển thị', toggle: true, on: true },
    ],
  },
  {
    title: 'Thông báo hệ thống',
    subtitle: 'Giới hạn tần suất gửi thông báo hàng loạt.',
    rows: [
      { key: 'review', label: 'Duyệt trước khi gửi', hint: 'Bắt buộc', toggle: true, on: true },
      { key: 'window', label: 'Khung giờ mặc định', hint: '08:00–21:00', value: '08:00–21:00' },
      { key: 'failAlert', label: 'Báo lỗi gửi', hint: 'Thông báo cho Admin', toggle: true, on: true },
    ],
  },
];

export default function Settings() {
  const { showToast } = useStore();
  const [state, setState] = useState(() =>
    Object.fromEntries(SECTIONS.flatMap((s) => s.rows.filter((r) => r.toggle).map((r) => [r.key, r.on]))),
  );

  const change = (row, next) => {
    setState((prev) => ({ ...prev, [row.key]: next }));
    showToast(`${row.label}: ${next ? 'bật' : 'tắt'}`);
  };

  return (
    <>
      <PageHead
        crumb="Quản trị / Cài đặt"
        title="Cài đặt quản trị"
        subtitle="Thiết lập quyền truy cập và nguyên tắc vận hành hệ thống."
      />
      <div className="grid c2">
        {SECTIONS.map((s) => (
          <Card key={s.title} title={s.title} subtitle={s.subtitle}>
            {s.rows.map((r) => (
              <div className="setting-row" key={r.key}>
                <div>
                  <b>{r.label}</b>
                  <small>{r.hint}</small>
                </div>
                {r.toggle ? (
                  <Switch on={state[r.key]} label={r.label} onChange={(v) => change(r, v)} />
                ) : (
                  <button type="button" className="link" onClick={() => showToast('Chỉnh sửa sẽ có khi nối API')}>
                    Chỉnh sửa ›
                  </button>
                )}
              </div>
            ))}
          </Card>
        ))}
      </div>
    </>
  );
}
