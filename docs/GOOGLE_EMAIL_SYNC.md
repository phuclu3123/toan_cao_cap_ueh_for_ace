# Đồng bộ email Google cho tài khoản cũ

## Nguyên nhân và cách xử lý

Luồng Google qua `accounts:createAuthUri` trước đây chỉ nhận scope `openid`, chưa yêu cầu `email profile`. Khi Firebase ID token không có email, backend đã tạo tài khoản theo Firebase UID với username dạng `firebase-<hash>@users.invalid`. Đây là tài khoản đã lưu, không phải mất dữ liệu MongoDB.

Frontend bổ sung `oauthScope: 'email profile'`; Firebase tự thêm `openid`. Vẫn dùng `prompt: 'select_account'`, không ép `consent`. Phiên website còn hiệu lực tiếp tục dùng cookie hiện tại, không mở Google lại cho mỗi request. Google vẫn có thể yêu cầu người dùng chấp thuận scope mới theo chính sách của họ.

Sau khi backend xác minh chữ ký, issuer, audience và hạn Firebase ID token:

1. Tìm tài khoản bằng Firebase UID hiện tại hoặc legacy `uid`.
2. Đối chiếu email đã được nhà cung cấp xác minh và kiểm tra xung đột danh tính.
3. Nếu cùng UID đang có username tạm, cập nhật username thành email đã xác minh trên chính tài khoản đó; giữ nguyên ID, hồ sơ và các dữ liệu tham chiếu ID.
4. Nếu email và UID chỉ tới hai tài khoản khác nhau, trả `ACCOUNT_LINK_CONFLICT`; không tự gộp.
5. Với Google mới hoặc tài khoản tạm chưa nhận email xác minh, trả `GOOGLE_EMAIL_REQUIRED`, không tạo thêm username tạm. Tài khoản đã có email hợp lệ và đúng UID có thể dùng lại email lưu sẵn khi token hiện tại không chứa email.

Backend nhận biết Google bằng claim đã ký `firebase.sign_in_provider`, không tin provider/email do client tự khai. Luồng Firebase điện thoại và GitHub giữ cách hoạt động hiện có.

Session được tra bằng ID ổn định trước, có đối chiếu ID khi dùng username dự phòng cho dữ liệu legacy. Vì vậy session đã tạo trước khi đổi username vẫn tìm đúng người; session của tài khoản đã xóa không chuyển sang tài khoản khác dùng lại email.

## UX và triển khai

- Deploy cả frontend và backend của bản sửa.
- Tài khoản đang có email đầy đủ không bị yêu cầu đồng bộ thêm. Không tự đăng xuất hàng loạt.
- Hồ sơ tài khoản còn email tạm có thông báo “Hoàn tất liên kết email” và nút “Đồng bộ email Google”. Nút mở luồng đăng nhập có sẵn; người dùng cần chọn **đúng tài khoản Google trước đây**.
- Sau xác thực thành công, tab ban đầu tải lại hồ sơ; thông báo biến mất khi email đã đầy đủ. Dropdown và hồ sơ không hiển thị địa chỉ kỹ thuật cho người dùng.
- Nếu thất bại, thông báo chỉ rõ email chưa được cung cấp hoặc xung đột tài khoản; phiên đang dùng không bị xóa bởi luồng đồng bộ thất bại.
- Sau khi người dùng đồng bộ, admin có thể cấp Flashcard qua email thật như bình thường. Quyền hiện có vẫn tham chiếu userId cũ.
- Không cần sửa MongoDB thủ công hoặc import lại users. Bản sửa không thể khôi phục email của tài khoản tạm chưa đăng nhập lại và chưa có bằng chứng danh tính từ Google. Không đổi email dựa trên lời khai hoặc tên hiển thị.

## Kiểm tra hồi quy

Các bài kiểm tra dùng dữ liệu và persistence mô phỏng, không sửa tài khoản thật:

```powershell
# Chạy tại backend
node --test tests/google-email-sync.test.js tests/auth-session.test.js tests/external-identity.test.js tests/flashcard-startup.test.js

# Chạy tại frontend
node --test tests/google-tab.test.js
npx.cmd playwright test e2e/google-tab.spec.js --reporter=line --output=../artifacts/google-email-sync/results
npm.cmd run build
```

Browser test bao gồm đăng nhập mới, đồng bộ tài khoản cũ trên desktop/mobile, và lỗi email vẫn giữ phiên. Google/Firebase API và backend được mô phỏng trong browser test. Kiểm tra trực tiếp `createAuthUri` với cấu hình mới trả HTTP 200 và scope `openid email profile`; điều này chưa thay thế việc đăng nhập Google thật sau deploy.
