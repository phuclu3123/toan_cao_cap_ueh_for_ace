# Vận hành thương mại khóa học

## Vào quản trị

- Local: `http://localhost:5173/admin/courses`.
- Đăng nhập tài khoản owner `luphuc321@gmail.com`. Backend kiểm tra cả role Admin và định danh owner từ cấu hình; việc sửa giao diện hoặc localStorage không cấp được quyền API.
- Giá/mở bán, ưu đãi, đơn hàng, cấp quyền qua email/key, lịch sử và trạng thái máy chủ ở cùng workspace.
- Máy chủ ở đây là tình trạng dịch vụ và đối soát. Cấu hình secrets, log, restart, backup, dung lượng và số instance vẫn quản lý trên Render/Atlas. Không có endpoint chạy lệnh shell hoặc sửa env từ trình duyệt.

## Dữ liệu và tương thích

- Cấu hình giá trong `CourseOffer` ghi đè catalog ban đầu. Khi chưa cấu hình: khóa 1 là 349.000đ, giá tham chiếu 799.000đ; khóa 2–4 là 0đ và đóng bán.
- 0đ luôn đóng thanh toán. Đóng bán không thu hồi quyền đã cấp; email/key vẫn là phương thức cấp quyền riêng do owner quyết định.
- `Payment` bổ sung trường tùy chọn: `pricingSnapshot`, `purchaseConsent`, `expiresAt`, `requiresReview`. Đơn cũ không bị yêu cầu có những trường này và không bị điền đồng ý thay cho người mua.
- Không sửa schema tài khoản, không hợp nhất, xóa hoặc ghi lại user cũ. Không có lệnh import lại database.
- Startup chỉ tạo thêm index cần thiết; không `dropIndex`, `syncIndexes`, `deleteMany` hay seed lại đơn/enrollment. Module thương mại thất bại khởi tạo thì giao dịch mới bị chặn; đăng nhập và các module khác vẫn khởi động theo cơ chế hiện hữu.
- Trước rollout production: dùng backup Atlas theo quy trình vận hành hiện có. Các index/cấu hình thương mại là bổ sung, không cần nhập lại dữ liệu.

## Giá và ưu đãi

- Admin nhập giá bán, giá tham chiếu (0 để ẩn), trạng thái mở/đóng. Giá tham chiếu khác 0 không nhỏ hơn giá bán. Chỉ ghi giá tham chiếu có căn cứ thực tế.
- Mỗi lần ghi tăng `version`. Hai phiên admin sửa cùng bản cấu hình: phiên sau nhận 409 và cần làm mới. Đơn đã tạo giữ nguyên giá và điều khoản; không hồi tố.
- Ưu đãi theo phần trăm (1–99%) hoặc số tiền; có mức giảm tối đa, lịch bắt đầu/kết thúc, tổng lượt và lượt mỗi tài khoản.
- CODE yêu cầu người mua nhập mã. AUTO chọn mức giảm hợp lệ cao nhất khi không nhập mã. Không cộng dồn mã và AUTO. Ưu đãi không làm đơn về 0đ; tặng quyền học dùng email/key.
- Thời gian trên form là giờ thiết bị, lưu UTC. Mã lưu chữ hoa, duy nhất toàn hệ thống; mã đã dùng không bị xóa để tái sử dụng.
- Sau khi tạo chỉ bật/tắt ưu đãi; đổi mức giảm bằng cách tắt ưu đãi cũ và tạo mới, giữ lịch sử và hạn mức đã sử dụng.

## Luồng mua và điều khoản

1. Đăng nhập và kiểm tra quyền học. Chưa có đơn thì hiển thị báo giá hiện tại và ô mã giảm giá. Đơn hiện đại đã lưu lựa chọn/hạn thanh toán được mở lại đúng bước QR, giữ nguyên thời hạn. Đơn cũ thiếu thời hạn yêu cầu chọn tiếp tục hoặc hủy qua PayOS trước khi xác nhận giá/mã mới. Đơn đã tạo giữ nguyên số tiền; chỉ giao dịch đã xác minh mới mở quyền học.
2. Backend báo giá hiện hành. Thay đổi coupon phải lấy báo giá mới và xác nhận lại.
3. Checkbox không tích sẵn; nhập `XÁC NHẬN MUA`. Backend kiểm tra phiên bản điều khoản, tổng tiền và cụm từ xác nhận; không tin cờ UI.
4. Tạo đơn và giữ lượt ưu đãi trong cùng MongoDB transaction. Global quota, quota từng user, reservation và Payment được ghi cùng nhau; điều kiện cập nhật ngăn vượt lượt do yêu cầu đồng thời.
5. Gửi PayOS số tiền trên đơn, chữ ký HMAC và hạn 30 phút. Retry cùng Idempotency-Key trả đơn cũ, không sửa giá hoặc điều khoản. Sau lỗi mạng UI giữ nguyên request để retry.
6. Chỉ webhook đã xác minh chữ ký hoặc đối soát server-to-server mới xác nhận PAID. Thanh toán, tiêu thụ ưu đãi và cấp enrollment nằm trong transaction.
7. Enrollment ACTIVE giữ nguyên; enrollment REVOKED không tự khôi phục bởi webhook/status. Chỉ owner khôi phục qua quản trị.

Điều khoản công khai tại `/purchase-terms`, phiên bản `2026-11-18.1`. Bên vận hành: **Lữ Võ Hoàng Phúc, quản trị Toán Cao Cấp**, email **luphuc321@gmail.com**. Chủ website đồng ý công khai thông tin đã gửi; chưa cung cấp chuỗi địa chỉ liên hệ cụ thể nên không tự suy đoán địa chỉ. Cần bổ sung địa chỉ phù hợp khi hoàn thiện thông tin bên bán.

Chính sách không hoàn do đổi ý sau khi cung cấp đúng quyền học; không loại trừ thanh toán trùng, thu sai tiền, không thực hiện cam kết hoặc quyền bắt buộc theo pháp luật. Nội dung cần được chủ website rà lại theo tình hình kinh doanh thực tế, không phải chứng nhận tuân thủ pháp lý.

Lưu toàn bộ nội dung, hash SHA-256, phiên bản, thời điểm server, user và giá đã chấp nhận trên đơn. Có thể tải xác nhận JSON từ checkout, trang kết quả hoặc admin. Đây là bản xác nhận giao dịch/điều khoản, **không phải hóa đơn thuế**. Đơn cũ không có bản xác nhận được hiển thị rõ là dữ liệu cũ, không tạo chứng cứ đồng ý hồi tố.

## Đối soát và sự cố

- Worker trong tiến trình chạy mỗi 60 giây, tối đa 10 đơn chờ mỗi lượt, có lease giới hạn tần suất đối soát theo đơn. Đồng thời sửa việc giải phóng quota còn treo sau khi trạng thái cuối đã ghi nhận.
- Quá thời gian local không tự suy đoán chưa thanh toán: gọi nhà cung cấp xác minh và yêu cầu hủy. Chỉ trạng thái hủy/thất bại được xác nhận mới giải phóng lượt giữ.
- Đối soát và hủy đơn chờ thủ công từ admin đều kiểm tra PayOS. Không có nút đánh dấu PAID hay mở quyền dựa vào ảnh chuyển khoản.
- PAID không bị ghi đè bởi kết quả tạo đơn hoặc sự kiện hủy đến muộn. Thanh toán đến sau khi quota đã được giải phóng vẫn được ghi nhận và đánh dấu `requiresReview`; không giả vờ giao dịch chưa xảy ra.
- Kết quả mạng không rõ ràng: giữ đơn/quota, không giải phóng bằng timer thuần. Nếu nhà cung cấp không tìm thấy đơn hoặc cấu hình lỗi kéo dài, owner đối chiếu trên PayOS và log hosting để xử lý; không tự sửa PAID/REVOKED trong DB để bỏ qua đối soát.
- Hủy ở admin là hủy link chưa thanh toán, **không hoàn tiền**. Các ca hoàn trả cần xử lý riêng qua ngân hàng/PayOS và quy trình hỗ trợ; module refund không triển khai trong lượt này.
- Thu tiền ghi nhận trên dashboard là tổng `Payment.status=PAID`, không phải lợi nhuận, không trừ phí hay hoàn trả bên ngoài.
- Khi scale nhiều instance: trạng thái, idempotency, quota và quyền ở MongoDB; rate limit hiện tại vẫn theo process. Cần đưa worker sang hàng đợi/scheduler chuyên biệt và rate limit dùng chung khi vận hành nhiều replica. Chưa coi thiết kế hiện tại là hạ tầng phân tán hoàn chỉnh.
- Giữ index theo truy vấn course/status/createdAt và user/course/status/createdAt; danh sách admin phân trang 20 bản ghi.

## API

Public: `GET /api/course-commerce/terms`, `GET /api/course-commerce/catalog`.

Đăng nhập: `POST /api/course-commerce/quote`, `GET /api/course-commerce/pending/:courseId`, `POST /api/course-commerce/orders/:orderCode/cancel` (chỉ tài khoản tạo đơn), `GET /api/orders/:orderCode/receipt` (chính chủ hoặc owner).

Owner: dưới `/api/course-commerce/admin`: `GET /overview`, `GET /:courseId/list?kind=orders|promotions|audit`, `POST /:courseId/price`, `POST /:courseId/promotions`, `POST /:courseId/promotions/:id`, `GET /orders/:orderCode`, `POST /orders/:orderCode/reconcile`, `POST /orders/:orderCode/cancel`.

Các API quản trị có auth/owner, no-store và rate limit. Ghi cookie được bảo vệ origin bằng middleware hiện hữu. Không trả secrets trong trạng thái máy chủ.

## Phạm vi nghiệm thu

- Đợt 2026-11-23 đã bổ sung kiểm tra tự động cho phiên đăng nhập, báo giá, checkout, webhook, chống trùng và bảo toàn tài khoản/quyền cũ. Chi tiết và giới hạn kiểm tra tại [COURSE_SESSION_ACCEPTANCE.md](COURSE_SESSION_ACCEPTANCE.md).
- Giao dịch ngân hàng thật, webhook production và chu kỳ đăng nhập Google thật cần nghiệm thu riêng; giả lập không thay thế các bước này.
- Thông báo web mở rộng và email giao dịch là đợt tiếp theo. Không deploy/push trong đợt kiểm tra local này.

## Nguồn đối chiếu

- [payOS Merchant API](https://payos.vn/docs/api/): tạo link, `expiredAt`, ký request, tra cứu và hủy link.
- [Luật Bảo vệ quyền lợi người tiêu dùng, hợp nhất 47/VBHN-VPQH 17-03-2026](https://congbaocdn.chinhphu.vn/180507251028987904/2026/4/1/cong-bao-so-175-ngay-01-04-47091_1775005910_signed.pdf): Điều 25, 37, 38; không loại trừ quyền bắt buộc, cung cấp điều khoản trước khi chấp thuận và khả năng xem/lưu bản xác nhận.
