# Thử AI nhận diện quần áo (việc 1.10)

`sample.csv` có 250 ảnh quần áo thật chọn từ [clothing-dataset](https://github.com/alexeygrigorev/clothing-dataset)
(giấy phép CC0, dùng tự do): 70 áo, 50 quần/váy ngắn, 35 đầm, 35 áo khoác, 40 giày, 20 mũ.
Mỗi ảnh chụp một món, nhãn do người gán. Ảnh tự tải vào `images/` khi chạy (không commit).

## Chạy (khoảng 20 phút, tốn vài nghìn đồng tiền AI)

Trong PowerShell, đứng ở thư mục `be`. Key chỉ đặt trong cửa sổ PowerShell này, không ghi vào file:

```powershell
$env:AI_EVAL_DIR = (Resolve-Path ..\docs\ai-eval).Path
$env:GEMINI_API_KEY = "<key Gemini>"        # hoặc bỏ dòng này để thử Claude:
# $env:ANTHROPIC_API_KEY = "<key Claude>"
./mvnw -pl services/wardrobe-service -am test -Dtest=GarmentDetectionEvalTest -Dsurefire.failIfNoSpecifiedTests=false
```

Kết quả ghi vào `docs/ai-nhan-dien.md`: tỉ lệ đúng loại đồ, theo từng loại, loại hay bị nhầm, thời gian trả lời
và danh sách ảnh sai (bấm vào để xem ảnh).

- Chạy thử ít ảnh trước: thêm `$env:AI_EVAL_LIMIT = "10"`.
- Bị giới hạn tốc độ (lỗi 429): tăng `$env:AI_EVAL_DELAY_MS = "8000"` (mặc định 4 giây giữa 2 ảnh).
- Muốn so 2 AI: chạy lần lượt với từng key, đổi tên file kết quả sau mỗi lần.

Lưu ý khi đọc kết quả: áo hoodie có thể được AI xếp vào áo (TOP) hoặc áo khoác (OUTERWEAR), cả hai đều hợp lý.
