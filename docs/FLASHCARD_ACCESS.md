# Quản lý quyền Flashcard

## Phạm vi

Chỉ áp dụng không gian `/flashcards` (lý thuyết, thẻ, tự kiểm tra và các chế độ bên trong).
Không thay đổi quyền khóa học/video. Không tự cấp quyền cho tài khoản cũ.

Hai nguồn cấp cùng dùng một bản ghi quyền theo ID tài khoản:

- Admin cấp trực tiếp cho email đã đăng ký (đơn lẻ hoặc JSON).
- Tài khoản đăng nhập đổi key ngẫu nhiên một lần lấy quyền.

## Sử dụng

1. Đăng nhập tài khoản chủ sở hữu `luphuc321@gmail.com` bằng provider đã xác minh theo luồng đăng nhập hiện có.
2. Mở **Quản lý quyền Flashcard** trong menu tài khoản hoặc `/admin/flashcards`.
3. Tab **Người được cấp quyền**: nhập email, hạn quyền tùy chọn, ghi chú rồi cấp. Import JSON hỗ trợ `["email@example.com"]` hoặc `{"emails":["email@example.com"]}`; tối đa 100 email / lần. Mỗi email có kết quả riêng; không tạo tài khoản tự động.
4. Tab **Mã kích hoạt**: tạo 1–50 mã, tải tệp và giữ bí mật. Toàn bộ mã chỉ xuất hiện trong phản hồi tạo mã và bộ nhớ trang; backend chỉ lưu SHA-256. Không thể đọc lại mã từ danh sách quản trị.
5. Người nhận đăng nhập, vào `/flashcards`, nhập mã. Mã chưa gắn email, người đổi hợp lệ đầu tiên nhận quyền.
6. Thu hồi / cập nhật thời hạn / khôi phục trong danh sách quyền. Tài khoản bị thu hồi không thể dùng key khác để tự mở lại.

Nếu mất phản hồi khi tạo mã, kiểm tra danh sách mới tạo; có thể vô hiệu hóa các mã chưa dùng không còn bản gốc rồi tạo đợt khác. Tạo mã không cung cấp cơ chế khôi phục plaintext hoặc idempotency cho việc phát hành. UI giữ mã hiện tại và chặn tạo đợt kế tiếp cho tới khi admin xác nhận đã lưu.

## Cấu hình và triển khai

- Backend `ADMIN_EMAIL=luphuc321@gmail.com`. Production không có fallback owner; quyền admin luôn kiểm tra phía server.
- Dùng MongoDB Atlas hoặc replica set / sharded deployment hỗ trợ transaction. Mongo standalone không đáp ứng thao tác cấp/đổi key. Không chuyển sang JSON hoặc bộ nhớ khi DB lỗi.
- Bốn model phân quyền tắt `autoCreate` và `autoIndex`, phù hợp cấu hình toàn dự án `bufferCommands=false`. Sau khi Mongo kết nối, `initializeFlashcardAccess()` tạo rõ ràng các index khai báo trong schema bằng `collection.createIndex`, không dùng promise `Model.init()` từ lúc import module. Tài khoản Mongo cần quyền tạo collection/index. Không drop hoặc sync index.
- Nếu khởi tạo index phân quyền lỗi, backend ghi mã lỗi và tiếp tục phục vụ các API khác; riêng phân quyền Flashcard trả 503 đến khi khởi tạo thành công. Không cấp quyền hoặc đổi key khi thiếu các index bắt buộc.
- Backend và frontend phải cùng được phát hành; API học liệu bắt đầu từ chối người chưa được cấp quyền ngay khi backend mới hoạt động.
- Giữ HTTPS, cookie HttpOnly/Secure, origin/CSRF middleware và cấu hình CORS hiện có. Không thêm khóa bí mật hoặc key kích hoạt vào VITE env.
- Build frontend mới và bỏ asset/source map cũ chứa dữ liệu học liệu từ những bản phát hành công khai trước đây. Không đưa file backend/data/flashcard-topics.json hoặc các thư mục source vào public hosting.
- Thay đổi này không sửa .env thật, không gửi email, không deploy, không sửa database đang chạy từ công cụ phát triển. Collection/index được khởi tạo khi backend mới khởi động.

## Dữ liệu

| Mongoose model | Mục đích | Index quan trọng |
| --- | --- | --- |
| FlashcardAccess | Quyền hiện tại, thời hạn, nguồn cấp, revision | unique userId; status + updatedAt |
| FlashcardKey | Hash mã, phần đuôi nhận diện, trạng thái và người dùng mã | unique hash; createdAt |
| FlashcardAudit | Nhật ký chỉ ghi thêm qua service | createdAt |
| FlashcardRateLimit | Bộ đếm thao tác chia sẻ giữa các backend instance | unique _id; TTL expiresAt |

Quyền hết hạn được tính bằng so sánh expiresAt ở mỗi lần kiểm tra; không xóa quyền bằng TTL.
Hạn kích hoạt key và hạn quyền được cấp là hai giá trị riêng. Không đặt hạn => không giới hạn.

## API

Tất cả response phân quyền và học liệu dùng private/no-store, không chia sẻ cache giữa người dùng.

| Method | Path (sau /api) | Quyền |
| --- | --- | --- |
| GET | /flashcard-access/me | Đăng nhập |
| POST | /flashcard-access/redeem | Đăng nhập; body {key} |
| GET | /flashcard-access/admin/members?page=1&search=... | Chủ sở hữu |
| GET | /flashcard-access/admin/keys?page=1 | Chủ sở hữu |
| GET | /flashcard-access/admin/audit?page=1 | Chủ sở hữu |
| POST | /flashcard-access/admin/grants | Chủ sở hữu; {emails, expiresAt, reason, restore?} |
| POST | /flashcard-access/admin/members/:userId/revoke | Chủ sở hữu; {reason} |
| POST | /flashcard-access/admin/keys | Chủ sở hữu; {count, activateBefore, accessDays} |
| POST | /flashcard-access/admin/keys/:id/disable | Chủ sở hữu |
| GET | /flashcards/topics và /flashcards/topics/:id | Đăng nhập + quyền còn hiệu lực hoặc owner |
| PUT | /flashcards/topics/:id | Chủ sở hữu, như trước |

Danh sách 25 dòng/trang, tìm phần đầu email bằng index email lowercase. Các danh sách có index createdAt + _id để phân trang có thứ tự ổn định. Rate limit ở Mongo: đổi key 10 lần/phút/tài khoản và 40 lần/phút/IP; phát mã 10 lần/phút/admin; cấp batch 30 lần/phút/admin; các mutation quản trị khác 60 lần/phút/admin. Fixed window cho phép burst tại ranh giới phút; proxy IP phải được cấu hình đúng.

## Tính nhất quán

- Đổi mã: claim UNUSED -> USED, cập nhật quyền và ghi audit trong cùng transaction.
- Unique hash và unique userId chặn trùng ở DB; retry xung đột transaction qua driver và unique-upsert race qua service.
- Gửi lại cùng mã bởi cùng người sau khi mất response: trả thành công nếu quyền vẫn ACTIVE; không cấp thêm hoặc gia hạn lại.
- Mã đã dùng + quyền bị thu hồi/hết hạn: không cấp lại khi gửi lại request cũ.
- Tài khoản đã có quyền không tiêu thụ thêm mã UNUSED.
- Cấp lại thông thường không vượt qua REVOKED; chỉ thao tác admin restore rõ ràng được làm điều đó.
- Thu hồi không hủy session đăng nhập, không xóa tiến độ/thẻ cá nhân.
- Không có cache quyền ở API nội dung. Mỗi request mới đọc trạng thái hiện tại; DB lỗi trả lỗi và không trả nội dung.

## Đồng bộ giao diện

Trang đang mở kiểm tra quyền mỗi 5 giây khi tab visible và kiểm tra lại khi focus/visibility thay đổi. Kích hoạt key cập nhật tab hiện tại ngay; các tab khác tự cập nhật ở lượt kiểm tra kế tiếp. Quyền hết hạn tự đóng giao diện theo đồng hồ trình duyệt; quyết định an ninh vẫn dùng đồng hồ server.

Đây là polling có độ trễ, không cam kết push tức thì. API chặn request mới sau khi thu hồi độc lập với nhịp polling. Dữ liệu đã tải về hoặc đã được người dùng xuất không thể thu hồi khỏi thiết bị. Khi không xác nhận được quyền, giao diện ngừng hiển thị workspace và cho thử lại.

## Giới hạn và bước vận hành

- Email đăng ký hiện chưa có trường emailVerified trong model. Cấp theo email giả định admin đã xác nhận đúng tài khoản; registered email không tự chứng minh sở hữu hộp thư. Nên dùng đăng nhập Google/GitHub đã xác minh hoặc bổ sung xác minh email trước khi mở đăng ký đại trà cần bảo đảm danh tính email.
- Admin tìm người bằng email, quyền lưu userId. Snapshot email trong lịch sử phục vụ truy vết. Khi thêm chức năng đổi email sau này cần đồng bộ snapshot hiển thị và thao tác quản trị theo userId.
- Các file curriculum cũ trong source vẫn dùng cho biên soạn/export; route hiện tại chỉ import studyManifest (metadata), không import curriculum. Mã minh họa toán học phía client là mã công khai, không dùng để chứa nội dung cần giữ bí mật.
- 100–1.000 tài khoản đăng ký không phải cam kết 1.000 người đồng thời. Polling 5s của 1.000 tab visible tương đương khoảng 200 request/s chỉ riêng kiểm tra quyền. Cần đo hosting/Atlas trước khi cam kết mức tải đó; khi tăng concurrency có thể thay vận chuyển trạng thái bằng push/batching mà giữ nguyên quyền và giao dịch đổi key.
- Đã chạy 2 kiểm tra hồi quy trong `backend/tests/flashcard-startup.test.js` cho khởi tạo model trước kết nối và từ chối truy cập khi DB chưa sẵn sàng. Chưa thử đổi key hoặc cấp quyền thật cho người dùng.
- Frontend đã biên dịch được; cú pháp backend và ESLint cho các file giao diện mới đã được rà. Công cụ trình duyệt không kết nối được nên chưa có xác nhận giao diện bằng screenshot.

## Tài liệu tham khảo

- Steam key lifecycle: https://partner.steamgames.com/doc/features/keys
- Auth0 direct membership: https://auth0.com/docs/manage-users/organizations/configure-organizations/assign-members
- OWASP authorization: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- Mongo atomicity: https://www.mongodb.com/docs/manual/core/write-operations-atomicity/
