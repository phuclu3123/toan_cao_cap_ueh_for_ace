# Flashcard: học liệu và MongoDB

## Phạm vi 14/11/2026

- Bổ sung các mục đã chốt của chương 5–10 theo báo cáo `FLASHCARD_CONTENT_AUDIT_2026-11-14.md`.
- Chương 6 tách tab **Ứng dụng kinh tế** (5 mục). Thẻ và bài tự kiểm tra vẫn bao gồm cả lý thuyết và ứng dụng.
- Giữ quy ước `c > 0`, ràng buộc `c − g(x,y) = 0`; giải thích phép chuẩn hóa bằng cách cộng hằng số vào hàm ràng buộc.
- Chỉ phương trình vi phân cấp một. Có đạo hàm/vi phân cấp hai của hàm một hoặc nhiều biến.
- Lưu học liệu chung của 10 chương vào MongoDB. Cấp quyền học, nhập danh sách email, key mở khóa và video để giai đoạn sau.

## Dữ liệu

Collection `flashcard_topics`: mỗi chương một document; index unique `id`. Hiện có **91 mục, 287 thẻ, 65 câu tự kiểm tra**.

Document gồm `id`, `version`, `content`, `updatedBy`, `revisions`, timestamps. Khi lưu, backend kiểm tra cấu trúc và dựng lại thẻ từ mục bài học; bỏ qua thẻ suy diễn do client gửi. Một lần cập nhật nguyên tử tăng version và giữ tối đa 5 bản trước đó trong cùng document. Bản cũ được giữ để phục hồi bằng công cụ quản trị; chưa có giao diện lịch sử/khôi phục.

API:

| Phương thức | Đường dẫn | Nội dung |
| --- | --- | --- |
| GET | `/api/flashcards/topics` | Danh sách chương, số mục và số thẻ |
| GET | `/api/flashcards/topics/:id` | `{ success, topic, version, updatedAt }` |
| PUT | `/api/flashcards/topics/:id` | Body `{ topic, version }`; yêu cầu phiên đăng nhập chủ quản trị hiện có |

PUT kiểm tra `hasOwnerRole` ở backend, sử dụng `ADMIN_EMAIL`/`ADMIN_USERNAME` hiện có. Trên hosting cần cấu hình email chủ phù hợp (`luphuc321@gmail.com`). Không tin role hoặc email do body gửi. Người đọc chưa bị giới hạn quyền truy cập.

Mã lỗi: 401 chưa đăng nhập, 403 không phải chủ quản trị, 404 không có chương, 409 version cũ, 422 nội dung sai, 503 chưa kết nối MongoDB. GET không trả lịch sử hoặc danh tính người biên tập.

## Luồng biên tập

Đăng nhập chủ quản trị → `/flashcards` → chọn chương → **Biên tập học liệu**. Có thể sửa từng mục, điều kiện, nội dung Markdown/LaTeX, nguồn, thẻ gợi nhớ, ví dụ, lỗi thường gặp và câu tự kiểm tra. Xem trước công thức rồi lưu. Nếu lưu lỗi, cửa sổ vẫn giữ bản nháp. Khi version bị xung đột, cần giữ lại phần sửa và mở lại bản mới trước khi lưu tiếp.

Trang học đọc nội dung qua API. Metadata tĩnh chỉ phục vụ mã chương và giao diện khởi tạo; không có nội dung chương tĩnh làm phương án dự phòng khi DB mất kết nối. Loading dùng `BrandLoader` chung với website.

**Thẻ tự tạo và tiến độ cá nhân vẫn lưu trên thiết bị/phiên theo lựa chọn cookie hiện có**, chưa đồng bộ tài khoản lên MongoDB trong phạm vi lần này.

## Khởi tạo và cập nhật

Backend dùng MongoDB env hiện có. Sau khi kết nối, startup thêm những chương còn thiếu bằng `$setOnInsert`, không ghi đè chương đã biên tập và không can thiệp collection khác.

Có thể chạy thủ công trong thư mục backend:

```powershell
npm.cmd run seed:flashcards
```

Các module `frontend/src/data/*` là bản biên soạn nguồn. Muốn xuất bộ khởi tạo, chạy trong frontend:

```powershell
npm.cmd run export:flashcards
```

Lệnh này tạo `backend/data/flashcard-topics.json` và metadata `studyManifest.js`. **Export và seed không phát hành đè các chương đang có trong DB.** Sau khởi tạo, dùng trình biên tập/API để cập nhật học liệu đang phục vụ. Triển khai backend cần giữ thư mục `shared/` ở cấp repo vì backend dùng chung hàm dựng thẻ trong `shared/studyCards.mjs`.

## Bằng chứng xác nhận

- Đã kết nối MongoDB cấu hình sẵn và đọc lại 10 chương, so sánh JSON với bản khởi tạo: cả 10 khớp chính xác tại thời điểm triển khai local.
- Kiểm tra cấu trúc/tham chiếu và KaTeX nghiêm ngặt toàn học liệu; kiểm tra PPP/logistic bằng SymPy.
- Kiểm tra API bằng dữ liệu giả lập: validate, tự sinh thẻ, lưu theo version, seed chỉ thêm, public GET, 401/403/404/503.
- Kiểm tra giao diện bằng API giả lập: tab ứng dụng, chỉnh thẻ và version, tải lại sau lỗi, loader desktop/mobile.
- Chưa triển khai/kiểm chứng trên hosting. Chưa thực hiện một lần sửa nội dung thật qua phiên Google của chủ tài khoản.

## Chỉnh giao diện và LaTeX tiếp theo

- Loading chung của website và Flashcard dùng các thẻ trượt lần lượt từ trái/phải về giữa, kết hợp lật câu hỏi sang đáp án; hỗ trợ tạm dừng và `prefers-reduced-motion`.
- Thẻ học có cột đọc tối đa 740px, mặt đáp án trắng, điều kiện có thể mở riêng; vẫn giữ phím tắt, đánh dấu và lịch ôn.
- `shared/studyMath.mjs` sửa khối `$` xuống dòng bị lỗi, chuẩn hóa `\dfrac` và giới hạn display. Dùng chung ở nguồn biên soạn, lúc hiển thị và lúc lưu API.
- Đã chạy `backend/scripts/repair-study-math.js` trên MongoDB cấu hình sẵn; mỗi chương sửa bằng version hiện tại, giữ bản trước trong `revisions`. Script chạy lại không thay đổi những chương đã chuẩn hóa.
