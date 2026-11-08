/**
 * 34 tỉnh, thành phố từ 01/07/2025 (Nghị quyết 202/2025/QH15): 6 thành phố trực thuộc trung ương + 28 tỉnh.
 * outfit-service có bảng toạ độ cùng tên (VietnamCities) để lấy thời tiết không cần tra địa danh.
 */
export const VN_CITIES = [
  'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Huế',
  'An Giang', 'Bắc Ninh', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai',
  'Hà Tĩnh', 'Hưng Yên', 'Khánh Hòa', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Nghệ An', 'Ninh Bình',
  'Phú Thọ', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sơn La', 'Tây Ninh', 'Thái Nguyên', 'Thanh Hóa',
  'Tuyên Quang', 'Vĩnh Long',
] as const;

/** So khớp không dấu, không phân biệt hoa thường: "da lat" tìm được "Đà Lạt". */
export const plain = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
