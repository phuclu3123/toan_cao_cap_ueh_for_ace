# Thông báo và email α∫M4A

## 1. Các kênh đã triển khai

| Sự kiện | Trên web | Email |
| --- | --- | --- |
| Thanh toán khóa học đã xác minh và quyền học đã mở | Có | Một thư xác nhận kèm nút vào học |
| Nhận tiền nhưng mở quyền học chưa hoàn tất sau 2 phút | Có | Học viên và quản trị viên |
| Đơn hủy / hết hạn được PayOS xác nhận | Có | Có; lỗi mạng hoặc giới hạn API không được coi là thất bại thanh toán |
| Tham gia bằng key, admin cấp, khôi phục, thu hồi quyền | Có | Có |
| Tham gia khóa miễn phí | Có | Có |
| Ủng hộ thành công | Có nếu đã đăng nhập | Thư cảm ơn riêng, chỉ khi người dùng chọn nhận bằng email tài khoản |
| Khôi phục mật khẩu | Giữ luồng OTP hiện có | Giữ luồng OTP hiện có |
| Đổi mật khẩu / email đăng nhập thành công | Có | Email hiện tại; khi đổi email, thêm địa chỉ cũ hợp lệ |
| Yêu cầu tư vấn đã lưu | Quản trị viên nếu email quản trị có tài khoản | Người yêu cầu nếu cung cấp email, và địa chỉ quản trị |
| Trả lời, phản hồi bình luận, nhắc tên, chấp nhận lời giải | Có | Không |
| Bài viết mới được admin giới thiệu | Có, theo tùy chọn | Không |
| Nhắc học, nhìn lại tuần | Có, theo tùy chọn | Không |
| Giới thiệu khóa học / bài giảng / tài liệu mới | Có | Chỉ người đã bật nhận giới thiệu |
| Xác nhận hoàn tiền hoặc thay đổi quyền đã xử lý bên ngoài | Có | Có, sau thao tác xác nhận của admin |

Người dùng mở **chuông → Cài đặt nhận thông báo**, hoặc `/notifications/settings`.
Trao đổi cộng đồng và bài viết mặc định bật; nhắc học, tổng kết tuần và email giới thiệu mặc định tắt.
Email giao dịch / bảo mật không bị tắt bởi tùy chọn giới thiệu.
Danh sách newsletter cũ không được tự chuyển thành người nhận quảng bá.

## 2. Cấu hình Resend trên Render

1. Trong Resend, thêm tên miền gửi mà bạn sở hữu, ví dụ `toancaocapueh.id.vn` hoặc một subdomain riêng. Nếu đang dùng domain gửi đã xác minh cho OTP, có thể dùng tiếp.
2. Sao chép **đúng các DNS records mà dashboard Resend hiển thị** sang nơi quản lý DNS. Chờ domain báo **Verified**. Đừng ghi đè hoặc tạo thêm SPF trùng tại cùng hostname; nếu đã có SPF, cần hợp nhất đúng hướng dẫn nhà cung cấp. Thêm DMARC theo chính sách domain hiện có.
3. Tạo API key với quyền **Sending access**, giới hạn vào domain gửi. Resend chỉ cấp chức năng gửi; `NOTIFICATION_REPLY_TO` phải là hộp thư bạn thực sự nhận và trả lời được.
4. Trong **Render → backend service → Environment**, cấu hình:

```dotenv
RESEND_API_KEY=re_...                         # key thật, chỉ trên backend
RESEND_FROM_EMAIL=α∫M4A <notifications@toancaocapueh.id.vn>
NOTIFICATION_REPLY_TO=luphuc321@gmail.com
NOTIFICATION_ADMIN_EMAIL=luphuc321@gmail.com
NOTIFICATION_SITE_URL=https://toancaocapueh.id.vn
NOTIFICATION_API_URL=https://ueh-tcc-backend.onrender.com
NOTIFICATION_UNSUBSCRIBE_SECRET=CHUOI-NGAU-NHIEN-IT-NHAT-32-KY-TU
NOTIFICATION_EMAIL_ENABLED=false
```

`NOTIFICATION_API_URL` là **origin backend thật**, không thêm `/api`. Nếu dùng custom domain/proxy, dùng origin thực sự phục vụ `/api/notification-email/unsubscribe`. Link hủy nhận phải truy cập công khai bằng HTTPS.

Nếu không đặt `NOTIFICATION_ADMIN_EMAIL`, hệ thống dùng `ADMIN_EMAIL` hiện có để báo quản trị. Nếu Resend đã dùng cho OTP, có thể dùng chung API key/người gửi đã xác minh; không cần tạo key mới chỉ để thêm notification.

Tạo khóa hủy nhận ở máy cá nhân, rồi tự dán vào Render (không commit vào Git):

```powershell
node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
```

Giữ khóa ổn định qua các lần deploy để các link hủy nhận cũ vẫn có hiệu lực. Không dùng biến `VITE_` cho bất kỳ secret nào.

5. Deploy code backend và frontend. Backend cần **MongoDB hoạt động**, có quyền tạo collection và index. Đây là bổ sung schema/index; không import lại dữ liệu demo, không cần xóa DB.
6. Đăng nhập bằng tài khoản chủ sở hữu (`ADMIN_EMAIL` hiện có), mở `/notifications/admin`. Kiểm tra nhà cung cấp, người gửi, địa chỉ hỗ trợ và cấu hình hủy nhận.
7. Khi đã sẵn sàng gửi, đổi **`NOTIFICATION_EMAIL_ENABLED=true`**, lưu và restart/deploy backend. Các thư `PENDING` đã ghi nhận kể từ lúc tính năng bắt đầu hoạt động sẽ được xử lý; xem danh sách chờ trước khi bật.

OTP khôi phục mật khẩu vẫn dùng cấu hình email cũ và không phụ thuộc công tắc notification. Thay `RESEND_FROM_EMAIL` cũng ảnh hưởng địa chỉ gửi OTP, nên domain đó phải được xác minh.

Nguồn chính thức: [domain gửi của Resend](https://resend.com/docs/dashboard/domains/introduction), [API key và quyền gửi](https://resend.com/docs/api-reference/api-keys/create-api-key), [idempotency trong 24 giờ](https://resend.com/docs/dashboard/emails/idempotency-keys), [one-click unsubscribe](https://www.rfc-editor.org/rfc/rfc8058).

## 3. Vận hành

### Giao dịch

- Worker đọc các bản ghi nghiệp vụ đã commit, tạo inbox và hàng đợi bền vững trong MongoDB. Không gọi nhà cung cấp email bên trong transaction thanh toán/quyền học.
- Khi PayOS đã được xác minh đúng số tiền, bằng chứng `verifiedPaidAt` nằm trên đơn trước transaction mở quyền học. Nếu transaction lỗi, bằng chứng còn lại để thông báo xử lý sau 2 phút. Không tự khôi phục quyền đã bị admin thu hồi.
- Email thành công chỉ xếp hàng khi đơn `PAID` và quyền học `ACTIVE`. Cả webhook lặp và lần sửa quyền sau đó dùng cùng khóa sự kiện.
- Khi email xử lý quyền hoặc đơn đóng vẫn nằm trong hàng đợi nhưng trạng thái đã đổi, worker ngừng gửi thư lỗi thời đó.
- Không suy ra email người donate từ nội dung chuyển khoản. Người chưa đăng nhập vẫn ủng hộ được và xem xác nhận ngay trong cửa sổ PayOS; muốn nhận thư thì đăng nhập và chọn checkbox trước khi tạo phiên.

### Lịch sử email

`/notifications/admin` chỉ cho chủ sở hữu vận hành:

- `PENDING`: đang chờ / chờ thử lại.
- `SENDING`: một worker đã giữ quyền gửi tạm thời.
- `SENT`: nhà cung cấp **đã chấp nhận**, chưa phải xác nhận vào Inbox. Theo dõi delivered/bounced trong dashboard Resend/SMTP; chưa có webhook bounce/delivery về ứng dụng.
- `FAILED`: lỗi xác định hoặc hết số lần tự thử. Có nút gửi lại trong cửa sổ chống trùng.
- `REVIEW`: chưa xác định chắc kết quả gửi (SMTP mất kết nối, worker gián đoạn, xung đột idempotency hoặc quá 23 giờ từ lần thử đầu). Không có nút tự gửi lại để tránh gửi trùng. Đối chiếu người nhận, mã đơn và lịch sử nhà cung cấp trước khi xử lý thủ công.
- `SUPPRESSED`: đã hủy nhận, email tài khoản đổi, hoặc trạng thái nghiệp vụ đã thay thế nội dung thư.

Resend được ưu tiên khi có API key. Không chuyển sang SMTP sau lỗi Resend để tránh gửi trùng. Mỗi sự kiện có khóa duy nhất; nội dung gửi được lưu trước lần thử đầu. Resend giữ idempotency 24 giờ; ứng dụng dừng tự thử sau 23 giờ, tối đa 6 lần. SMTP không đảm bảo chống trùng nên kết quả gửi không chắc chắn được giữ để đối soát.

Worker chạy khoảng 15 giây khi backend đang hoạt động. Nếu gói hosting cho service ngủ hoặc process dừng, thông báo chờ tới lúc service chạy lại; không bảo đảm email đến tức thì. Với vận hành liên tục, dùng instance backend/worker không ngủ.

Không tự gửi lại toàn bộ lịch sử trước lần khởi tạo `delivery-v1`. Không xóa `NotificationRuntime`, inbox hoặc outbox để “thử lại”: sẽ mất mốc chống trùng/đối soát. Nên có chính sách lưu trữ/ẩn danh dữ liệu email khi vận hành lâu dài.

### Giới thiệu nội dung

- Admin tạo đợt giới thiệu tại `/notifications/admin`, nhập tiêu đề, nội dung và đường dẫn **trong web**.
- Bài viết mới: chỉ kênh web. Kho bài viết hiện là dữ liệu tĩnh, vì vậy admin cần tạo đợt giới thiệu sau khi bài viết đã được xuất bản.
- Khóa học có bài giảng/tài liệu mới: chọn web hoặc web + email tự chọn. Hệ thống kiểm tra lại tùy chọn nhận trước mỗi lần gửi. Có link hủy nhận trong thư và header one-click.
- Để trống mã khóa học: chọn các tài khoản tồn tại lúc tạo đợt gửi. Nhập mã khóa học: chỉ học viên đang có quyền học khóa đó. Đợt gửi được xử lý theo từng trang, dùng khóa chống tạo/gửi trùng.
- Nhắc học chỉ dành cho tài khoản đã bật và có khóa học đang mở, tối đa một lần/ngày. Tổng kết tối đa một lần/tuần: số bài đăng, số cuộc trao đổi có trả lời trong 7 ngày, và số khóa học có quyền. Chưa tổng hợp thời gian xem video vì tiến độ video hiện lưu trên trình duyệt.
- Nhắc tên nhận diện `@Tên hiển thị` không trùng tên trong các thành viên đã tham gia bài, hoặc `@{id tài khoản}` của thành viên đó. Chưa có danh bạ gợi ý/nhắc mọi tài khoản ngoài cuộc trao đổi.

### Hoàn tiền

Hệ thống chưa tích hợp API chuyển tiền hoàn. Admin phải hoàn tiền và đối soát bên ngoài trước; sau đó dùng **Xác nhận xử lý riêng**, nhập email, khóa học, mã đơn đã thanh toán, mã đối soát, số tiền và lý do, rồi đánh dấu xác nhận. Endpoint kiểm tra đơn thuộc đúng tài khoản/khóa học, số tiền dương và không vượt số tiền đơn. Đây là thư xác nhận thao tác thực tế, **không chuyển tiền và không thay đổi quyền học**. Quyền học được thu hồi/khôi phục ở quản trị khóa học và có thông báo riêng.

## 4. Trạng thái bàn giao

- Công tắc gửi email mặc định tắt; không có thư thật được gửi trong quá trình triển khai.
- Chạy build và kiểm tra tĩnh không thay thế xác minh email thật hoặc PayOS thật. Sau khi cấu hình/deploy, dùng tài khoản và giao dịch do bạn kiểm soát để kiểm tra nhận thư, spam, link vào học và link hủy nhận; không cần gửi cho học viên khác để thử.
