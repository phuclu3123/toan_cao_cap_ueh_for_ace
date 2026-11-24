# Hỏi đáp Toán — UI và chức năng local

## Phạm vi

- Thiết kế lại màn hình danh sách, điều hướng, tìm kiếm, bộ lọc và các trạng thái thao tác.
- Kiểm tra câu hỏi, lời giải, bình luận, bình chọn, đánh dấu lời giải đúng, lưu bài, ẩn/hiện lại, báo cáo và hồ sơ.
- Thông báo web khi thả tim bình luận đã nối backend; email vẫn thuộc lượt triển khai tiếp theo.
- Không xóa hoặc gộp tài khoản. Theo yêu cầu xóa mock, đã sao lưu và làm sạch số liệu của đúng 12 bài seed, giữ nguyên nội dung đề, lời giải và bình luận.

## Nguồn dữ liệu và hành vi

- Bài viết, lời giải, điểm đóng góp, bài lưu và hồ sơ lấy từ API. Đã bỏ bộ bài/hồ sơ/điểm giả và fallback lưu bài phía trình duyệt.
- 12 bài seed được ghi nguồn `curated` (Bài biên soạn); lượt xem đặt sẵn được đưa về 0, loại danh tính bình chọn mẫu và xác nhận mẫu. Các bình chọn bằng ID tài khoản thật được giữ. Những bài ngoài danh sách seed không bị cập nhật. Bản sao lưu đầy đủ nằm trong `artifacts/community/private-backups` và bị loại khỏi Git.
- Bài và lời giải biên soạn không cộng điểm đóng góp cho tài khoản giả. Ba danh hiệu đang hỗ trợ được backend tính từ số câu hỏi, số lời giải và lời giải đầu tiên được chấp nhận; không tặng toàn bộ huy hiệu vì là admin.
- Avatar lấy từ hồ sơ MongoDB hiện tại theo ID/UID/email đã lưu, không lấy ảnh mẫu trong bản chụp tác giả cũ. Ảnh Google đã xác minh chỉ điền khi tài khoản chưa có ảnh, không ghi đè ảnh tự chọn. Không có ảnh thì hiện chữ cái tên, không dùng chân dung giả.
- URL hồ sơ mẫu cũ có ánh xạ đọc sang tài khoản chính thức, không dùng ánh xạ đó để đăng nhập hay cấp quyền. Nội dung biên soạn không liên kết tới một hồ sơ thành viên giả.
- Bài mới bắt đầu với 0 lượt xem. Mở trang chi tiết tăng lượt xem; tải dữ liệu để chỉnh sửa không tăng. Đây là số lượt mở, không phải số người xem duy nhất.
- Backend lấy danh tính từ session; client không gửi tác giả hoặc vai trò để tự cấp quyền. Cờ `canManage` do server tính.
- Trạng thái câu hỏi và sắp xếp cập nhật URL cùng một lần. Tìm kiếm chờ 350ms; chủ đề có API tìm kiếm và phân trang riêng: `GET /api/community/tags`.
- Thử thách tuần hứa thưởng cố định và nút thành viên mở nhầm bảng xếp hạng đã được bỏ.
- Ẩn bài chỉ ảnh hưởng thiết bị hiện tại, có nút hiện lại. Bài lưu nằm trên backend theo tài khoản.
- Bản nháp câu hỏi được tách theo tài khoản trong local storage. Văn bản lời giải được giữ theo bài/tài khoản trong session storage và xóa khi gửi thành công. Ảnh chưa gửi cần chọn lại nếu tải lại trang.
- Ảnh câu hỏi/lời giải dùng trường đính kèm riêng, một ảnh PNG/JPEG/GIF/WEBP tối đa 1MB hoặc URL HTTPS. Không nhúng ảnh base64 vào HTML lời giải.
- Khi MongoDB mất kết nối, backend không báo lưu thành công vào bộ nhớ tạm. Chế độ bộ nhớ chỉ được bật rõ ràng bởi `ALLOW_COMMUNITY_MEMORY_WRITES=true` trong test, không áp dụng production.
- Session hết hạn giữ thông báo tại vùng trang, tránh mất thông báo khi các card được tải lại. Không tự gửi lại lệnh ghi.
- Các GET danh sách, metadata, thẻ, hồ sơ và bài lưu chỉ thử lại tối đa hai lần khi lỗi mạng hoặc 502/503/504. Không áp dụng cho thao tác ghi, lỗi đăng nhập, hay GET chi tiết có tăng lượt xem.
- Hồ sơ không tự gán khóa học, trường hoặc vai trò cố vấn. Sao chép liên kết chỉ báo thành công sau khi clipboard hoàn tất.
- Thao tác xóa có xác nhận; lỗi mạng không đóng form hoặc xóa bản nháp như thể đã thành công.

## Thiết kế

- Hướng: nền ô lưới và bố cục học thuật của bản gốc, tập trung màu emerald vào hành động và trạng thái; bỏ các thử nghiệm banner xanh/serif và thanh công thức sau phản hồi của người dùng.
- Câu hỏi chính của màn hình: tìm bài toán cần đọc hoặc cùng giải, rồi tham gia thảo luận.
- Dấu hiệu nhận diện: công thức toán trong luồng bài, trạng thái có lời giải, thương hiệu UEH TCC và sổ tay công thức.
- Bố cục: điều hướng yên tĩnh bên trái; nội dung hỏi đáp chiếm diện tích chính; hoạt động cộng đồng ở cột phụ. Tablet/mobile gộp thành một cột và giữ lối mở chủ đề/sổ tay/người đóng góp.
- Bộ lọc nâng cao chỉ mở khi cần; nhãn Việt nhất quán; thẻ trong mỗi bài rút gọn, xem đủ khi mở bài.
- Sau phản hồi mới nhất: bỏ khung đầu trang viền xanh, tăng khoảng cách nhóm điều hướng, bỏ các box quảng bá/đề nổi bật lặp lại; tiêu đề bài dùng màu chữ chính, số liệu và tác giả gom vào chân bài. Mobile đặt nút hỏi cạnh tiêu đề, chuyển sắp xếp vào bộ lọc để giảm chiều cao phần điều khiển.
- Vòng đối chiếu Peerlist/Framer/Figma/Product Hunt tiếp theo đưa tác giả/avatar/ngày lên đầu bài và giữ tương tác ở chân bài. Nền ô lưới giảm đậm, font Be Vietnam Pro thống nhất với thương hiệu; khối điều khiển thấp hơn, menu nền đặc và vùng chạm thoáng hơn. Số liệu, tên tác giả và ảnh vẫn lấy cùng dữ liệu API, không đổi nội dung hoặc tạo tương tác giả.
- Tham khảo bố cục Primer và post summary của Stacks, áp dụng cho dữ liệu/công thức thực tế của UEH TCC. Không sao chép nguyên giao diện của nguồn tham khảo.
- Kiểm tra ở 1440/768/390px, light và dark. KaTeX cần font/kích cỡ ký hiệu riêng; các footer/navbar dùng chung được giữ theo thiết kế hiện tại.
- Bộ inspector ban đầu chụp khi trang còn loading/cookie banner. Ảnh nghiệm thu thật dùng script chờ feed và font sẵn sàng, với dữ liệu API thật.
- Đã tái hiện server dev 5174 trả `CommunitySidebar` cũ thiếu default export trong khi 5173 tải bình thường. Vite dùng cache riêng theo cổng và không tự nhảy sang cổng khác khi cổng yêu cầu đã bận. Lỗi route hiện trạng thái lỗi có nút thử lại, không dùng animation đồng bộ. Chỉ lỗi vận chuyển chunk production mới được tự tải lại một lần cho cùng lỗi; import thành công khác không xóa chốt chống lặp.
- Inspector cuối đã thấy feed thật và không phát hiện tràn ngang. Các cảnh báo còn lại gồm nền ô lưới viết bằng CSS gradient, font/số mũ KaTeX, cùng navbar/footer/chat dùng chung; không xem đó là một báo cáo tự động đạt toàn bộ tiêu chí.

## Kiểm tra có thể chạy lại

Từ thư mục tương ứng:

```powershell
# backend
npm.cmd test
npm.cmd run build
npm.cmd run check:architecture

# frontend
npm.cmd run check
npx.cmd playwright test --config playwright.community.config.js
node scripts/community-visual-review.mjs
node scripts/check-route-loading.mjs
```

- Backend tests dùng bộ nhớ hoặc model stub trong tiến trình test, không kết nối vào database thật.
- Browser tests dùng các phản hồi API kiểm thử tách biệt để kiểm tra hành vi UI; không tạo/xóa bài của người dùng.
- Script visual review chỉ mở feed công khai và đọc API local. Ảnh và báo cáo nằm tại `artifacts/community/live`.
- Kiểm tra route loading mở lại cả 5173 và 5174 hai lần, rồi mô phỏng thiếu export ở một context riêng. Báo cáo tại `artifacts/community/loading-fix/report.json`; lỗi giả lập không ghi dữ liệu vào backend.
- `node scripts/check-community-mongo.mjs` kiểm tra ghi/đọc trên database QA có tên ngẫu nhiên, rồi xóa đúng database QA. Không ghi tài khoản hoặc bài thử vào database chính. Báo cáo: `artifacts/community/mongo-integration.json`.
- Báo cáo browser tests: `artifacts/community/report/index.html`.
- Địa chỉ nghiệm thu hiện tại: `http://localhost:5174/community` (backend `http://localhost:5000`).

## Bình luận, tim và hộp thông báo (24/11)

- Bình luận hiển thị avatar tài khoản, phản hồi theo nhánh, tim/count thật và menu sửa/xóa dành cho chủ bình luận hoặc admin. Phản hồi còn lại không bị xóa khi bình luận cha được xóa.
- `PUT /api/community/posts/:id/answers/:answerId/comments/:commentId/like` nhận trạng thái mong muốn và accountId để từ chối thao tác từ UI của phiên tài khoản cũ. Không tự cộng số phía frontend.
- Tim và thông báo được ghi cùng một MongoDB transaction. Ghi thông báo lỗi thì tim cũng rollback. Không gửi cho chính mình; mỗi người/comment tạo một thông báo, bỏ rồi thả lại không spam và không khôi phục thông báo đã đọc/ẩn.
- Hộp thông báo lấy từ API, lọc recipient bằng session hiện tại. Đánh dấu đọc/xóa chỉ áp dụng hộp của chính tài khoản; client không quyết định người nhận. Avatar người tương tác được đọc lại từ tài khoản hiện tại.
- Frontend làm mới khi mở chuông, focus tab, và khoảng 15 giây khi trang đang hiển thị. Đây là polling, chưa phải push/WebSocket. Không gửi email.
- Navbar capsule hiện chuông cả trên điện thoại. Composer chỉ hiện công cụ cơ bản; công thức và định dạng đầy đủ mở khi cần. Nền ô lưới liền mạch tới phía sau navbar.
- Hình tương tác phủ theo toàn bộ chiều cao trang: lặp danh mục 22 kiểu hình ở hai lề, gồm hình học, UFO, đĩa nhạc, cassette, hoa, tên lửa và con trỏ. Hiện từ 1500px ở danh sách, 1740px ở bài chi tiết; số lượng tự điều chỉnh theo chiều cao thực. Quỹ đạo trôi và xoay, dừng khi chạm/rê chuột, kéo thả có vệt mờ, va chạm đẩy nhau và tách/ráp nét. Giới hạn trong lề để không che bài; hỗ trợ phím mũi tên, Home và reduced-motion. Dừng xử lý khi ngoài màn hình hoặc tab bị ẩn.

### Kiểm tra riêng cho lượt này

```powershell
# backend: database QA ngẫu nhiên, kiểm tra xong xóa đúng database QA
node scripts/check-comment-notifications.mjs
# frontend: dữ liệu công khai local, thao tác hình và editor không gửi bài
node scripts/community-universe-review.mjs
```

`artifacts/community/comment-acceptance/report.json` ghi kết quả xác thực HTTP, transaction rollback, chống tim trùng, quyền riêng tư, sửa/xóa, hai phiên browser và inbox mobile. `artifacts/community/universe/report.json` ghi chuyển động/kéo thả/va chạm, reduced-motion, editor và tràn ngang. Lint/build frontend và build/architecture backend được chạy riêng. Không coi số lượng test của các lượt trước là kết quả chạy mới.

Đây là kiểm tra local. Không thay thế nghiệm thu đăng nhập Google và hành vi production sau deploy.
