# Đồng bộ email Google và giữ tài khoản cũ

## Tương thích Firebase multiple accounts per email

Firebase đang dùng **Create multiple accounts for each identity provider**. Email chính của Firebase user/token có thể trống dù Google provider có email. Bổ sung scope `email profile` cho luồng mở tab không tự giải quyết điều này.

Giữ nguyên User account linking. Không import lại users, không xóa hoặc tạo lại tài khoản Firebase/MongoDB.

Backend cần `GOOGLE_CLIENT_ID` bằng Client ID web công khai đang dùng ở frontend `VITE_GOOGLE_CLIENT_ID`. Nếu hai luồng dùng hai Client ID khác nhau, khai báo thêm `GOOGLE_CLIENT_IDS` phân cách bằng dấu phẩy. Không dùng Client Secret, không lấy audience tin cậy từ request của trình duyệt. `GET /api/auth/providers` trả `providers.google.emailSyncEnabled: true` khi bản mới đã khai báo audience; đây không thay thế kiểm tra đăng nhập thật.

### Hai token được xác minh và đối chiếu trước khi lưu

1. One Tap gửi Google ID token từ callback cùng Firebase ID token. Nút Google mở tab gửi `oauthIdToken` từ Firebase `signInWithIdp` cùng `idToken`. Không gửi email/profile tự khai làm bằng chứng.
2. Backend xác minh Firebase token như trước, lấy Firebase UID và Google subjects trong claim đã ký `firebase.identities['google.com']`.
3. Token có email đã xác minh hoặc UID đã có tài khoản MongoDB với email thật tiếp tục đường xử lý hiện có; không cần một lần xác minh Google bổ sung để đăng nhập trở lại.
4. Nếu tài khoản Google mới hoặc còn email tạm và Firebase token thiếu email, dùng **google-auth-library** chính thức xác minh Google token: chữ ký, issuer, audience được cấu hình, thời hạn, `email_verified`. Google `sub` phải nằm trong Google subjects của Firebase token đã xác minh. Google `sub` và Firebase UID là hai định danh khác nhau.
5. Chỉ sau các bước trên mới tìm/cập nhật/tạo tài khoản. Email và UID chỉ tới hai người khác nhau => `ACCOUNT_LINK_CONFLICT`, không tự gộp. Email tạm được cập nhật trên chính record cũ, giữ `id`, Mongo `_id`, legacy `uid`, hồ sơ và các tham chiếu ID như quyền/tiến độ/thẻ đã lưu. Tài khoản có email thật không bị đổi sang email khác từ provider.

Không dùng `providerData.email` hoặc JSON decode token ở frontend làm dữ liệu đã xác minh. Không ghi Google token vào local/session storage hoặc log; proof chỉ nằm trong bộ nhớ của lần đăng nhập, không truyền qua thông điệp giữa các tab. Không có thao tác xóa user/quyền hoặc migration hàng loạt trong bản sửa.

### Callback và chống đồng bộ trùng

- One Tap hoàn tất trong callback tương tác; Firebase token listener không tranh hoàn tất với callback. Lần có proof không dùng chung request nền cũ đang thiếu proof.
- Đồng bộ backend có timeout 30 giây với thông báo thử lại.
- `AppBootLifecycle` chạy ở cấp App, bao gồm `/auth/google`; lỗi callback không còn bị lớp loading che mãi.
- Xác minh thất bại không cấp phiên mới hoặc xóa phiên backend đang dùng. Điện thoại và GitHub giữ luồng riêng hiện có.

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
node --test tests/google-tab.test.js tests/auth-service.test.js tests/oauth-service.test.js
npx.cmd playwright test e2e/google-tab.spec.js e2e/external-google.spec.js --reporter=line --output=../artifacts/google-auth-compatible/results
npm.cmd run build
```

Browser test bao gồm cả One Tap và mở tab, với tài khoản mới, tài khoản legacy còn email tạm, tài khoản đã có email và lỗi callback thoát loading. `external-google.spec.js` dùng Firebase JS SDK thật và backend controller/verifier thật với hai JWT ký thử bằng hai cặp khóa. Google/Firebase endpoints và persistence được giả lập; không kết nối hoặc sửa MongoDB thật. Có ca chứng minh Firebase `user.email === null` trong khi provider có email, nhưng backend chỉ cập nhật sau khi xác minh và đối chiếu hai token. Kiểm tra bảo toàn ID/hồ sơ/dữ liệu tham chiếu, sai subject/audience/issuer/chữ ký, hết hạn, thiếu config và xung đột email.

Deploy cả frontend và backend, backend cài dependency theo lockfile để có google-auth-library. Sau deploy kiểm tra health, `emailSyncEnabled`, fingerprint frontend và thử Google thật cho tài khoản mới cùng tài khoản cũ còn email tạm. Hoàn tất email diễn ra ở lần đăng nhập hợp lệ tiếp theo, không phải migration hàng loạt.

## Tài liệu

- https://firebase.google.com/docs/reference/android/com/google/firebase/auth/FirebaseUser#getEmail()
- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
- https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/accounts/signInWithIdp
