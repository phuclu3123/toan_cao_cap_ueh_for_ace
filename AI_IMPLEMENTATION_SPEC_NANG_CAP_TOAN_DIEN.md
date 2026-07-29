# AI IMPLEMENTATION SPEC — Nâng cấp toàn diện nền tảng Toán Cao Cấp

> **Loại tài liệu:** Bản đặc tả thi công dành cho AI coding  
> **Trạng thái:** Authoritative / đang triển khai Phase 0  
> **Phiên bản:** 2.0  
> **Ngày audit:** 29/07/2026  
> **Repository:** `WEB_TCC`  
> **Frontend production:** `https://toancaocapueh.id.vn` trên Netlify  
> **Backend production:** `https://ueh-tcc-backend.onrender.com` trên Render  
> **Database production:** MongoDB Atlas  

## CURRENT EXECUTION STATE

```text
DOCUMENT_STATUS: IN_EXECUTION
CURRENT_PHASE: PHASE 0
CURRENT_WORK_PACKAGE: 0.4 — LaTeX
CURRENT_TASK_STATUS: IN_PROGRESS
LAST_AUDITED_COMMIT: d65b50ff18fd092c8c646cb1a312f10272136943
LAST_GREEN_SOURCE_BUILD: WORKTREE@d65b50ff18fd092c8c646cb1a312f10272136943
PRODUCTION_HEALTH: FRONTEND 200 / BACKEND 200 / MONGODB ONLINE
NEXT_ACTION: Xác minh trực quan Exam ap1-f1/matrix-cases rồi chuyển sang Phase 0.5 responsive
BLOCKERS: Chrome headless trên máy lỗi GPU/profile sandbox; cần visual smoke bằng browser khả dụng
```

Quy ước:

- Chỉ có một work package `IN_PROGRESS` trong một workstream.
- Chỉ đổi `CURRENT_PHASE/CURRENT_WORK_PACKAGE` sau khi đã cập nhật implementation log.
- `COMPLETED` luôn phải có command/test/screenshot evidence.
- Khi audit cũ không còn đúng, ghi deviation vào log; không âm thầm xóa lịch sử.

---

## 0. Cách AI bắt buộc phải sử dụng tài liệu này

Tài liệu này không phải bản thuyết trình sản phẩm. Đây là chỉ dẫn triển khai trực tiếp cho AI viết code trong các turn tiếp theo.

Mọi AI tham gia coding repository này phải:

1. Đọc toàn bộ tài liệu trước khi sửa file.
2. Xem `git status --short` và bảo toàn mọi thay đổi/untracked file của chủ dự án.
3. Chỉ thực hiện phase hoặc work package được người dùng yêu cầu.
4. Không tự ý làm phase sau khi phase hiện tại chưa đạt cổng nghiệm thu.
5. Không tự ý commit, push hoặc deploy nếu người dùng chưa yêu cầu.
6. Không cấu hình lại Netlify, Render, Firebase, Google Console hoặc PayOS từ đầu. Các hạ tầng và environment hiện đã hoạt động.
7. Chỉ đề nghị thay đổi environment khi code mới thật sự cần thêm biến và phải:
   - thêm schema validation;
   - thêm `.env.example` không chứa secret;
   - ghi migration note rõ ràng.
8. Không tin README cũ khi README mâu thuẫn với code hoặc production.
9. Không xóa, đổi tên hoặc đưa vào commit các file riêng tư/untracked hiện có, đặc biệt:
   - `backend/check.js`;
   - `backend/fix.js`;
   - `backend/fix2.js`;
   - `backend/list.js`;
   - `backend/data/legacy-users.private.json`.
10. Mọi thay đổi phải đi kèm kiểm thử tương xứng với rủi ro.
11. Sau mỗi work package:
   - chạy các lệnh kiểm tra được chỉ định;
   - cập nhật bảng tiến độ ở cuối tài liệu;
   - ghi file đã sửa, test đã chạy và rủi ro còn lại.
12. Không báo “hoàn thành” nếu chỉ sửa giao diện nhưng luồng nghiệp vụ hoặc test chưa đạt.

### 0.1. Thứ tự ưu tiên khi có xung đột

Khi hai yêu cầu trong repository mâu thuẫn, dùng thứ tự:

1. Yêu cầu mới nhất của người dùng.
2. Ràng buộc bảo mật và toàn vẹn thanh toán trong tài liệu này.
3. Acceptance criteria của phase đang làm.
4. Tài liệu này.
5. `MASTER_PLAN_NANG_CAP_WEBSITE.md` cũ.
6. README và comment legacy.

Tài liệu này thay thế thứ tự phase của `MASTER_PLAN_NANG_CAP_WEBSITE.md`, nhưng vẫn kế thừa art direction học thuật tốt từ tài liệu cũ.

### 0.2. Quy tắc làm việc theo phase

Trước mỗi phase, AI phải:

```text
1. Đọc lại scope phase.
2. Kiểm tra git status.
3. Chạy baseline liên quan.
4. Lập plan nhỏ theo work package.
5. Thực hiện từng work package.
6. Test sau từng package.
7. Chụp/kiểm tra UI nếu có thay đổi trực quan.
8. Chỉ đóng phase khi toàn bộ gate đạt.
```

Không gom toàn bộ dự án vào một commit hoặc một đợt chỉnh sửa lớn.

---

## 1. Bối cảnh cố định và các quyết định đã chốt

### 1.1. Stack hiện tại phải được bảo toàn trong giai đoạn đầu

- Frontend: React 19, Vite 8, React Router 7, CSS thuần.
- Backend: Node.js, Express, Mongoose.
- Database: MongoDB Atlas.
- Identity providers: tài khoản email/password hiện tại và Firebase social auth.
- Social login hiện có: Google và GitHub.
- Email: Resend/Gmail SMTP theo environment hiện hành.
- Payment provider chính thức: PayOS.
- Video khóa học: YouTube ở chế độ **Không công khai / Unlisted**.
- Math: KaTeX là renderer đích.
- Hosting: Netlify cho frontend, Render cho backend.

Không migrate sang Next.js, Tailwind, một UI framework hoặc backend framework mới trong Phase 0–3.

### 1.2. Các quyết định nghiệp vụ không được tự ý thay đổi

1. **Không xây refund module.**
2. Không có trạng thái `REFUND_PENDING`, `REFUNDED` hoặc nút hoàn tiền.
3. Checkout phải hiển thị rõ chính sách **không hoàn tiền** trước khi người dùng xác nhận thanh toán.
4. Không yêu cầu người mua ký điện tử, ký giấy hoặc cung cấp chữ ký.
5. Webhook PayOS vẫn bắt buộc xác thực `signature/checksum` HMAC bằng `PAYOS_CHECKSUM_KEY`.
   - Đây là xác thực kỹ thuật callback, không phải chữ ký của khách hàng.
   - Không được bỏ qua, mock hoặc luôn trả hợp lệ trong production.
6. PayOS là nguồn thanh toán tự động duy nhất trong scope hiện tại.
7. Không gọi QR thủ công là “MoMo” hoặc “VNPay” nếu chưa có tích hợp, webhook và đối soát riêng.
8. Một đơn đã `PAID` là trạng thái terminal, không được downgrade thành `CANCELLED` hoặc `EXPIRED`.
9. Không dùng localStorage, email hoặc payload client làm bằng chứng quyền học/Admin.
10. Không bán khóa học chứa video sample hoặc số liệu không đúng nội dung thật.
11. YouTube Unlisted là nền tảng video đích:
    - video không được để Public;
    - chỉ trả YouTube video ID/embed URL sau khi backend kiểm tra Enrollment;
    - không quảng cáo Unlisted là DRM hoặc cơ chế chống chia sẻ tuyệt đối;
    - AI phải chấp nhận giới hạn: người đã nhận link/video ID vẫn có thể chia sẻ lại.
12. Chỉ tài khoản có email chuẩn hóa `luphuc321@gmail.com` được mang role `ADMIN`.
13. `ADMIN` trên hệ thống hiện đồng thời là chủ nền tảng; không có role quản trị thứ hai.
14. Mọi tài khoản còn lại, hiện tại và tạo mới, đều là `STUDENT`.
15. Client không được chọn, gửi hoặc tự đổi role.

### 1.3. Định hướng thương hiệu đã chốt

Định vị sản phẩm:

> **Nền tảng học trực tuyến độc lập do chủ dự án xây dựng, tập trung dạy Toán Cao Cấp cho sinh viên UEH.**

Đây không phải website chính thức của trường và không được thiết kế như cổng thông tin/LMS hành chính của trường đại học. Vẫn sử dụng chữ `UEH` bình thường trong tên môn học, đối tượng người học, nội dung, SEO và nhận diện hiện có theo quyết định của chủ dự án.

Chuẩn trải nghiệm tham chiếu:

> **Tiện, trực tiếp và linh hoạt như Coursera/Udemy; không rườm rà như LMS đại học.**

Tham chiếu Coursera/Udemy là tham chiếu về luồng sử dụng, khả năng khám phá khóa học, checkout và tiếp tục học; không sao chép pixel, logo, asset hoặc nhận diện của họ.

Nguyên tắc nâng cấp:

- cải tiến có chọn lọc, không xóa sạch thiết kế hiện tại hoặc dựng lại toàn bộ theo template mới;
- bảo tồn những composition đã tạo bản sắc và đang hoạt động tốt;
- riêng cặp publication cover bắt chéo `K51 · Hai đợt` và `FINAL 2807` trên Home là visual signature phải giữ;
- với các phần được bảo tồn, chỉ tinh chỉnh khi có mục tiêu cụ thể về responsive, accessibility, hiệu năng hoặc tính nhất quán;
- visual regression phải bảo đảm các thành phần signature không bị biến thành card-grid chung chung.

Phải ưu tiên:

- người học tìm khóa nhanh;
- xem học thử nhanh;
- đăng ký/thanh toán ít bước;
- vào học ngay sau khi được cấp quyền;
- tiếp tục bài gần nhất ngay từ Account/My Learning;
- course navigation rõ, không có tầng khoa/phòng ban/học vụ;
- support gọn, có mã yêu cầu thật nhưng không biến thành quy trình hành chính phức tạp;
- admin console đơn giản vì chỉ có một chủ nền tảng;
- nền trung tính ấm, typography rõ và teal/emerald làm accent có kiểm soát;
- khả năng đọc công thức, video và nội dung dài;
- visual hiện đại của edtech thương mại, không giả phong cách trường đại học lớn.

Không xây:

- cổng khoa/phòng ban/chương trình đào tạo;
- workflow duyệt nhiều cấp;
- vai trò giảng vụ, trợ giảng, biên tập viên hoặc support staff trong scope hiện tại;
- dashboard hành chính nhiều bảng biểu không cần thiết;
- thuật ngữ học vụ rườm rà khi một CTA đơn giản có thể giải quyết.

Phải loại bỏ dần:

- Sparkles/Wand/Bot/Brain khi không có tính năng AI thật;
- emoji trộn lẫn với icon hệ thống;
- glassmorphism, radial glow và gradient dùng quá mức;
- copy tự ca ngợi như “enterprise”, “premium”, “state-of-the-art”, “60fps”;
- số liệu hard-code không có nguồn;
- loader/copy chung chung có cảm giác template AI;
- card-grid lặp lại thiếu phân cấp;
- tài liệu API/nội dung nội bộ khỏi primary navigation.

### 1.4. Những gì không được phá vỡ

- Đăng ký, đăng nhập email/password.
- Quên mật khẩu sau khi được harden.
- Google/GitHub login sau khi được chuẩn hóa session.
- Thư viện tài liệu.
- Thi thử và dữ liệu đáp án.
- Blog và nội dung học thuật.
- Light/dark mode.
- VI/EN/JA/ZH ở mức hiện có; mọi thay đổi mới phải không làm vỡ layout.
- Netlify/Render/MongoDB/Firebase/PayOS production hiện hành.
- Các deep link sau khi được migrate sang clean URL phải có redirect/migration hợp lý.

---

## 2. Baseline audit đã xác minh

AI không cần audit lại từ đầu trừ khi code đã thay đổi đáng kể.

### 2.1. Production

- Frontend production trả HTTP 200.
- Canonical domain là `https://toancaocapueh.id.vn/`.
- Backend health trả:

```json
{
  "status": "ok",
  "database": "MongoDB Atlas (Online)"
}
```

- Response backend hiện có:
  - `access-control-allow-origin: *`;
  - `x-powered-by: Express`;
  - chưa có bộ security header đầy đủ.

### 2.2. Build và lint

Baseline ngày 29/07/2026:

```text
Frontend production build: FAIL
Nguyên nhân: vite.config.js dùng manualChunks dạng object
Vite/Rolldown báo: manualChunks is not a function

ESLint:
299 errors
9 warnings
Tổng: 308 vấn đề
```

Các component có nguy cơ hook-order/runtime cao:

- `frontend/src/components/modals/CourseEnrollmentModal.jsx`;
- `frontend/src/pages/CourseDetail.jsx`;
- `frontend/src/pages/ExamDetail.jsx`;
- `frontend/src/pages/BlogDetailPage.jsx`.

Không có test suite hoặc CI workflow trong repository.

### 2.3. Routing đang không nhất quán

- App dùng `createHashRouter`.
- Sitemap dùng clean URL.
- Blog route khai báo `blog/:id`, component đọc `slug`.
- App khai báo `doc/:id`, nhiều link dùng `/document/:id`.
- App khai báo `/payos-api-docs`, navigation dùng `/payos-api`.
- Profile và một số route dùng biến API khác tên.

Hậu quả:

- blog detail 404;
- một số document/API link 404;
- sitemap và canonical không đại diện đúng URL app;
- direct URL có thể về Home hoặc sai route.

### 2.4. LaTeX

Baseline dữ liệu:

- 12 đề;
- 130 câu;
- khoảng 1.607 đoạn toán trong đề thi;
- khoảng 1.086 đoạn toán trong các bài blog chuyên khảo.

Nguyên nhân lỗi ảnh đã xác định:

- đề `ap1-f1`;
- block nguồn khoảng `practiceExams.js:1703–1960`;
- command bị escape dư, ví dụ `\\\\frac`, `\\\\sin`, `\\\\mathbb`;
- runtime nhận `\\frac`, KaTeX hiểu `\\` là xuống dòng.

Không được replace toàn bộ `\\\\` trong file vì matrix/cases cần `\\` để xuống dòng.

Hiện tồn tại đồng thời:

- KaTeX npm;
- KaTeX CSS CDN khác version;
- MathJax CDN;
- MathJax typeset sau React/KaTeX.

### 2.5. Course, PayOS và entitlement

Phần đang hoạt động:

- backend tạo PayOS payment link thật;
- có HMAC checksum verification cho webhook;
- có polling trạng thái;
- MongoDB lưu Payment.

Phần chưa đạt production:

- browser gửi `amount`, `orderCode`, `description`;
- Payment chưa gắn `userId` và `courseId`;
- return URL có thể tự set `PAID`;
- payment status public;
- voucher nằm công khai trong bundle;
- entitlement chỉ ghi `ueh_tcc_enrolled_courses` vào localStorage;
- CourseDetail tin localStorage;
- profile hiển thị mọi course là đã thanh toán;
- video premium URL nằm trong bundle;
- nhiều video là sample Google/public YouTube;
- số bài catalog và số lesson thật không khớp;
- không có reconciliation hoặc fulfillment bền vững.

### 2.6. Auth và security

Các release blocker:

- Firebase sync chưa verify Firebase ID token.
- Backend chưa có auth middleware dùng chung.
- Update profile chưa xác thực owner.
- Upload/Admin còn tin uid/email từ client.
- Client coi email/localStorage là Admin.
- OTP chung `123456` còn được chấp nhận.
- OTP dùng random không phù hợp cho security.
- Không rate limit forgot/reset/login.
- Có GitHub client secret fallback trong source.
- CORS mở toàn bộ origin.
- Production có thể rơi xuống JSON fallback khi Mongo lỗi.
- Health vẫn xanh dù database fallback.
- Một số query tạo RegExp từ input chưa escape.

Không được ghi giá trị secret vào tài liệu, log hoặc phản hồi.

### 2.7. UI/UX

Điểm tốt:

- desktop Home/Blog/Exams có nền tảng thẩm mỹ tốt;
- art direction editorial học thuật phù hợp;
- typography và hệ màu có tiềm năng thành nhận diện sản phẩm nhất quán;
- exam focus shell là hướng đúng.

Vấn đề:

- 390px bị tràn ngang ở Home/Courses;
- mobile header/drawer chưa đủ tin cậy;
- CourseDetail dùng nền xanh bão hòa, lệch hệ public pages;
- khoảng 25 file CSS, hơn 13.000 dòng;
- khoảng 182 `!important`;
- hàng trăm màu hex và gradient;
- nhiều inline style, đặc biệt checkout/profile;
- modal thiếu focus trap/ARIA/Escape/return focus;
- contrast của nhiều teal/gray không đạt AA;
- boot overlay và route transition tạo độ trễ cảm nhận;
- ảnh chưa được lazy/responsive đầy đủ;
- anti-devtools không tạo security thực và có thể ảnh hưởng người dùng.

### 2.8. Blog, SEO và content workflow

- Có 7 bài blog thật.
- Nội dung nằm trong JavaScript compile-time.
- Backend chỉ lưu engagement/comment.
- Chưa có draft/review/revision/schedule.
- Metadata gần như dùng chung toàn site.
- Chưa có Article/Course/Breadcrumb structured data.
- Sitemap không sinh từ source-of-truth.
- Comment/reaction chưa có auth, moderation và rate limit đầy đủ.

### 2.9. Support và observability

- Form tư vấn có lưu backend.
- Báo lỗi video chỉ hiện thành công ở client, không tạo ticket.
- Chưa có ticket ID, assignee, status, SLA hoặc lịch sử trao đổi.
- Chưa có structured logging, request ID, error tracking, metrics và alert.
- Chưa có cảnh báo `PAID` nhưng chưa cấp Enrollment.

### 2.10. Baseline register

| ID | Severity | Finding | Target |
|---|---|---|---|
| BL-001 | P0 | Vite production build fail | Phase 0 |
| BL-002 | P0 | Rules of Hooks/runtime blockers | Phase 0 |
| BL-003 | P0 | Blog/document/API route mismatch | Phase 0 |
| BL-004 | P0 | LaTeX over-escape và hai math engine | Phase 0 |
| BL-005 | P0 | Mobile horizontal overflow | Phase 0 |
| BL-006 | P0 | Auth chưa verify identity/RBAC server-side | Phase 1 |
| BL-007 | P0 | OTP universal và secret fallback | Phase 1 |
| BL-008 | P0 | Return URL có thể mutate Payment | Phase 2 |
| BL-009 | P0 | Client quyết định amount/coupon | Phase 2 |
| BL-010 | P0 | Enrollment/localStorage không bền vững | Phase 2 |
| BL-011 | P0 | Paid course dùng sample/public video | Phase 3 |
| BL-012 | P1 | CSS/design system phân mảnh | Phase 4–5 |
| BL-013 | P1 | Blog content/SEO chưa có pipeline | Phase 6 |
| BL-014 | P1 | Support affordance chưa tạo ticket thật | Phase 7 |
| BL-015 | P1 | Không test/CI/observability | Phase 8 |

Khi đóng finding, implementation log phải dẫn test/evidence; không chỉ đổi trạng thái trong bảng.

---

## 3. Kiến trúc đích

### 3.1. Nguyên tắc source-of-truth

Toàn hệ thống chỉ có:

1. Một source-of-truth danh tính: backend session đã xác thực.
2. Một source-of-truth catalog/giá: database backend.
3. Một source-of-truth thanh toán: Order + PaymentAttempt + PayOS verified webhook/query.
4. Một source-of-truth quyền học: Enrollment trong database.
5. Một source-of-truth tiến độ: LessonProgress trong database.
6. Một math renderer: KaTeX.
7. Một hệ token UI.
8. Một hệ route clean URL.

### 3.2. Luồng auth đích

```text
Email/password
  -> backend verify scrypt
  -> tạo server session

Google/GitHub Firebase
  -> frontend lấy Firebase ID token
  -> backend Firebase Admin verifyIdToken
  -> upsert identity
  -> tạo cùng loại server session

Browser
  -> cookie HttpOnly/Secure/SameSite
  -> /api/auth/me trả public user DTO
```

Không lưu role, entitlement hoặc bằng chứng session trong localStorage.

Để cookie hoạt động same-origin:

- production browser gọi API qua `/api/*` trên canonical frontend origin;
- Netlify proxy `/api/*` tới Render;
- local development dùng Vite proxy tới `http://localhost:3001`;
- PayOS webhook vẫn gọi backend public endpoint trực tiếp.

### 3.3. Luồng commerce đích

```text
Authenticated user
  -> POST /api/orders {
       courseId,
       couponCode?,
       noRefundAcknowledged: true,
       policyVersion
     }
  -> server tra Course/Price/Coupon
  -> server tính expectedAmount
  -> tạo Order
  -> tạo PayOS payment link
  -> lưu PaymentAttempt
  -> browser mở checkout

PayOS
  -> POST webhook
  -> verify checksum HMAC
  -> tìm Order đã tồn tại
  -> đối chiếu orderCode/paymentLink/amount
  -> ghi WebhookEvent idempotent
  -> transaction:
       Order PAYMENT_PENDING -> PAID
       create Enrollment nếu chưa tồn tại
       create AuditLog/Outbox

Browser return URL
  -> GET trạng thái order
  -> chỉ hiển thị kết quả
  -> không mutate trạng thái
```

### 3.4. State machine bắt buộc

Order:

```text
CREATED
  -> PAYMENT_PENDING
  -> PAID

CREATED
  -> FAILED

CREATED | PAYMENT_PENDING
  -> CANCELLED

PAYMENT_PENDING
  -> EXPIRED

PAID là terminal và không downgrade.
```

Không có refund state.

Enrollment:

```text
accessStatus:
  ACTIVE
    -> SUSPENDED
    -> REVOKED

completion:
  completedAt?          // độc lập với accessStatus
```

`SUSPENDED/REVOKED` là quản lý quyền học, không phải hoàn tiền. Một enrollment có thể hoàn thành nhưng vẫn `ACTIVE`; completion không phải state trung gian bắt buộc trước suspend/revoke.

### 3.5. Luồng học đích

```text
GET My Enrollments
  -> mở Course
  -> GET lesson metadata
  -> backend kiểm tra Enrollment
  -> preview lesson: API cho phép xem không cần Enrollment
  -> premium lesson: trả YouTube Unlisted video ID/embed config
  -> player gửi progress định kỳ
  -> backend upsert LessonProgress
  -> người dùng resume trên thiết bị khác
```

YouTube Unlisted chỉ là phương thức phân phối video, không phải source-of-truth quyền học. Backend vẫn phải kiểm tra Enrollment trước khi trả video ID. Sau khi ID đã đến browser, hệ thống không thể ngăn tuyệt đối người học chia sẻ lại; UI và marketing không được tuyên bố ngược lại.

### 3.6. Luồng hỗ trợ đích

```text
Contact / Video issue / Access issue / Payment pending
  -> tạo SupportTicket
  -> trả ticket code
  -> queue New
  -> ADMIN owner tiếp nhận
  -> In progress
  -> Waiting student hoặc Resolved
  -> audit trail
```

Không có category refund.
Không xây workflow nhiều nhân viên/đơn vị; tất cả ticket admin hiện do một tài khoản owner xử lý.

---

## 4. Target data model

AI phải tạo migration an toàn; không xóa trực tiếp collection production.

### 4.1. User

Tối thiểu:

```text
_id
emailNormalized (unique)
displayName
avatar
phoneNumber
school
bio
role                    // ADMIN | STUDENT, lấy server-side
status                  // ACTIVE | SUSPENDED
passwordHash?           // chỉ tài khoản local
authIdentities[]        // provider + providerUid
emailVerified
lastLoginAt
createdAt
updatedAt
```

Không trả `passwordHash`, OTP fields hoặc internal flags trong DTO.

Role invariant bắt buộc:

```text
User owner đã được bootstrap one-time
AND verified identity thuộc đúng User owner
AND normalize(email) === "luphuc321@gmail.com" -> ADMIN
mọi User/signup khác                            -> STUDENT
```

Triển khai invariant bằng migration + server-side guard:

- owner email là constant server-side cố định `luphuc321@gmail.com`, không phải giá trị role tùy chọn từ client hoặc environment;
- migration tìm đúng User hiện có của owner, xác minh/ghi audit và đặt `ADMIN`;
- nếu owner User chưa tồn tại, migration dừng với lỗi rõ và chỉ cho phép bootstrap bằng command quản trị one-time được chủ dự án yêu cầu; không dùng public signup để tạo Admin;
- hạ mọi tài khoản Admin legacy khác về `STUDENT`;
- signup luôn tạo `STUDENT`;
- signup không tự promote một tài khoản mới chỉ vì body chứa owner email;
- Firebase identity có email owner đã verify phải link vào đúng owner User hiện có, không tạo User/Admin thứ hai;
- social sync không nhận role từ client;
- không có endpoint chuyển role trong scope hiện tại;
- startup/readiness phải fail nếu `adminCount !== 1` hoặc Admin email không đúng constant;
- frontend chỉ dùng role do `/api/auth/me` trả về.

### 4.2. Session

```text
_id
sessionTokenHash (unique)
userId
csrfSecret hoặc CSRF state
userAgentHash
ipPrefixHash
expiresAt (TTL index)
lastSeenAt
revokedAt?
createdAt
```

Chỉ cookie chứa opaque token; database lưu hash.

### 4.3. PasswordResetChallenge

```text
_id
userId
otpHash
expiresAt
attemptCount
maxAttempts
consumedAt?
requestIpHash
createdAt
```

TTL index và single-use bắt buộc.

### 4.4. Course

```text
_id
slug (unique)
title
shortDescription
description
status                  // DRAFT | PUBLISHED | ARCHIVED
level
thumbnail
instructorIds[]
publishedLessonCount
durationMinutes
priceVnd
currency                // VND
isFree
version
createdAt
updatedAt
```

Không lưu số học viên marketing giả. Số enrollment nếu hiển thị phải aggregate thật.
`instructorIds` là metadata người dạy/nội dung, không tạo thêm auth role. Trong scope hiện tại chỉ có `ADMIN` và `STUDENT`.

### 4.5. Chapter và Lesson

Chapter:

```text
_id
courseId
title
position
status
```

Lesson:

```text
_id
courseId
chapterId
slug
title
position
lessonType              // VIDEO | ARTICLE | DOCUMENT | QUIZ
accessLevel             // PREVIEW | ENROLLED
durationSeconds
mediaAssetId?
contentRef?
status
createdAt
updatedAt
```

### 4.6. YouTubeMedia

```text
_id
youtubeVideoId
privacyExpected         // UNLISTED
privacyVerifiedAt?
privacyVerifiedByUserId? // phải là ADMIN owner
privacyVerificationMethod? // OWNER_MANUAL | YOUTUBE_API
durationSeconds
status
accessLevel             // PREVIEW | ENROLLED
metadata
createdAt
updatedAt
```

Quy tắc:

- chỉ lưu video ID, không cần lưu full watch URL;
- mọi video course, kể cả preview, phải được owner đặt YouTube ở chế độ Unlisted;
- catalog public không trả `youtubeVideoId` của lesson `ENROLLED`;
- lesson access API chỉ trả ID/embed config sau Enrollment check;
- dùng `youtube-nocookie.com/embed/...` khi phù hợp với consent/privacy;
- không cần signed URL, HLS private provider hoặc DRM trong scope hiện tại;
- không gọi Unlisted là “private tuyệt đối”;
- `PREVIEW` chỉ nghĩa là API cho phép xem không cần Enrollment, không có nghĩa video được để Public trên YouTube.

### 4.7. Coupon

```text
_id
codeNormalized (unique)
discountType            // FIXED | PERCENT
discountValue
maxDiscountVnd?
minimumOrderVnd?
courseIds[]
startsAt
endsAt
maxRedemptions?
perUserLimit
status
createdAt
updatedAt
```

Validation và tính tiền chỉ ở backend.

### 4.8. Order

```text
_id
orderCode (unique)
userId
courseId
subtotalVnd
discountVnd
totalVnd
currency
couponId?
status
idempotencyKey
currentPaymentAttemptId?
noRefundPolicyVersion
noRefundPolicyHash
noRefundAcknowledgedAt
paidAt?
cancelledAt?
expiresAt?
createdAt
updatedAt
```

Unique index phù hợp cho idempotency.

### 4.9. PaymentAttempt

```text
_id
orderId
provider                 // PAYOS
providerPaymentLinkId
checkoutUrl
providerReference?
expectedAmountVnd
status
paidAt?
lastVerifiedAt?
sanitizedProviderData
createdAt
updatedAt
```

`PaymentAttempt.status` là enum đóng:

```text
CREATED | PENDING | PAID | CANCELLED | EXPIRED | FAILED
```

Không map provider status lạ trực tiếp vào domain và không thêm refund status.

### 4.10. WebhookEvent

```text
_id
provider
eventFingerprint (unique)
orderCode
checksumVerified
payloadHash
processingStatus
processedAt?
errorCode?
createdAt
```

Không lưu secret/checksum key. Raw payload nếu lưu phải redact PII cần thiết.

### 4.11. Enrollment

```text
_id
userId
courseId
orderId?
accessStatus             // ACTIVE | SUSPENDED | REVOKED
enrolledAt
completedAt?
revokedAt?
createdAt
updatedAt
```

Unique compound index `{ userId, courseId }`.

### 4.12. LessonProgress

```text
_id
userId
courseId
lessonId
positionSeconds
percent
completed
lastWatchedAt
createdAt
updatedAt
```

Unique compound index `{ userId, lessonId }`.

### 4.13. SupportTicket

```text
_id
ticketCode (unique)
userId?
category                // GENERAL | PAYMENT_PENDING | ACCESS | VIDEO | CONTENT | ACCOUNT
priority                // LOW | NORMAL | HIGH | URGENT
courseId?
lessonId?
orderId?
subject
description
status                  // NEW | IN_PROGRESS | WAITING_STUDENT | RESOLVED | CLOSED
handledByOwnerAt?
messages[]
responseTargetAt?
resolvedAt?
createdAt
updatedAt
```

Không thêm `REFUND` category.

### 4.14. AuditLog và OutboxEvent

AuditLog dùng cho:

- login nhạy cảm;
- role/admin;
- order transition;
- entitlement grant/revoke;
- thay đổi trạng thái/trao đổi support của owner;
- content publish.

OutboxEvent dùng cho email/notification sau transaction, đặc biệt:

- `ORDER_PAID`;
- `ENROLLMENT_GRANTED`;
- `ACCESS_GRANT_FAILED`;
- `TICKET_CREATED`.

---

## 5. Target API contract

Tất cả response dùng envelope nhất quán:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "requestId": "..."
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "STABLE_MACHINE_CODE",
    "message": "Thông báo an toàn cho người dùng",
    "fieldErrors": {}
  },
  "requestId": "..."
}
```

### 5.1. Auth

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/session/firebase
GET  /api/auth/me
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
PATCH /api/me/profile
```

Yêu cầu:

- session cookie HttpOnly;
- CSRF protection cho mutation dùng cookie;
- error không làm lộ tài khoản tồn tại;
- response chỉ trả public user DTO.

### 5.2. Catalog

```text
GET /api/courses
GET /api/courses/:slug
GET /api/courses/:slug/preview
```

Public response không chứa premium media URL.

### 5.3. Orders và PayOS

```text
POST /api/orders
GET  /api/orders/:orderId
POST /api/payos/webhook
GET  /api/payment-result/:orderCode
```

`POST /api/orders` chỉ nhận:

```json
{
  "courseId": "...",
  "couponCode": "...",
  "noRefundAcknowledged": true,
  "policyVersion": "..."
}
```

Không nhận `amount` cuối từ client.
Endpoint chỉ tạo PayOS payment link sau khi:

- policy version còn hiệu lực;
- `noRefundAcknowledged === true`;
- server lưu policy version/hash/timestamp trên Order.

Acknowledgment này là ghi nhận người dùng đã đọc chính sách, không phải chữ ký điện tử.

`GET /api/payment-result/:orderCode`:

- yêu cầu session hoặc one-time safe status token;
- không mutate;
- không trả thông tin order của user khác.

### 5.4. Learning

```text
GET   /api/me/enrollments
GET   /api/me/enrollments/:courseId
GET   /api/courses/:courseId/lessons/:lessonId
POST  /api/courses/:courseId/lessons/:lessonId/access
PATCH /api/courses/:courseId/lessons/:lessonId/progress
```

### 5.5. Support

```text
POST /api/support/tickets
GET  /api/support/tickets/:ticketCode
POST /api/support/tickets/:ticketCode/messages
```

Admin endpoints tách route và bắt buộc RBAC.

### 5.6. Blog engagement

```text
GET  /api/blog/:slug/engagement
POST /api/blog/:slug/reactions
POST /api/blog/:slug/comments
POST /api/blog/:slug/comments/:commentId/like
```

Phải:

- validate slug tồn tại;
- rate limit;
- sanitize;
- moderation state;
- không dùng GET để tạo/mutate record.

---

## 6. Cấu trúc code đích

Không di chuyển toàn bộ repository trong một lần. Tạo cấu trúc mới theo feature rồi migrate dần.

### 6.1. Backend

```text
backend/
  config/
  controllers/
  domain/
    auth/
    catalog/
    commerce/
    learning/
    support/
  middleware/
    authenticate.js
    authorize.js
    csrf.js
    errorHandler.js
    requestContext.js
    validate.js
  models/
  repositories/
  routes/
  services/
    firebaseAdminService.js
    payosService.js
    emailService.js
    youtubeMediaService.js
  validators/
  jobs/
    paymentReconciliationJob.js
    outboxProcessorJob.js
  utils/
  tests/
    unit/
    integration/
  server.js
```

Controller chỉ xử lý HTTP. Business rule nằm trong domain/service, database access qua repository khi logic phức tạp.

### 6.2. Frontend

```text
frontend/src/
  app/
    router.jsx
    providers.jsx
    error-boundaries/
  components/
    ui/
    layout/
  features/
    auth/
    catalog/
    checkout/
    learning/
    exams/
    library/
    blog/
    support/
  services/
    apiClient.js
    authClient.js
  content/
  hooks/
  utils/
  assets/
    styles/
      tokens.css
      base.css
      components/
      pages/
```

Không tiếp tục đặt auth/payment business logic trong Navbar hoặc modal đơn lẻ.

---

## 6.3. Command registry

Môi trường hiện tại là PowerShell. Dùng `npm.cmd` để tránh lỗi execution policy của `npm.ps1`.

Baseline có sẵn:

```powershell
git status --short
```

```powershell
node --version
```

```powershell
npm.cmd --version
```

```powershell
npm.cmd --prefix frontend ci
```

```powershell
npm.cmd --prefix backend ci
```

```powershell
npm.cmd --prefix frontend run lint
```

```powershell
npm.cmd --prefix frontend run build
```

```powershell
Get-ChildItem backend -Recurse -Filter *.js | Where-Object { $_.FullName -notmatch 'node_modules' } | ForEach-Object { node --check $_.FullName }
```

Các script sau chưa tồn tại ở baseline và phải được tạo đúng phase trước khi gọi:

```powershell
npm.cmd --prefix frontend run test
npm.cmd --prefix backend run test
npm.cmd --prefix frontend run test:e2e
npm.cmd --prefix frontend run validate:math
npm.cmd --prefix frontend run validate:content
npm.cmd --prefix frontend run check
```

Không ghi một command chưa tồn tại vào evidence như thể nó đã chạy thành công.

## 6.4. Dependency graph

```text
PHASE 0 — Release recovery
├── PHASE 1 — Auth/security
│   └── PHASE 2 — Order/PayOS/Enrollment
│       ├── PHASE 3 — Learning experience/YouTube/progress
│       └── PHASE 7 — Support/observability
└── PHASE 4 — Edtech UX/UI foundation
    ├── PHASE 5 — Journey UX
    └── PHASE 6 — Content/blog/SEO

PHASE 1–7
  └── PHASE 8 — CI/E2E/staged launch
```

Phase 4 có thể chạy song song sau Phase 0 nếu không sửa chồng file với workstream khác.

---

## 7. Kế hoạch thi công theo phase

# PHASE 0 — Release recovery và hotfix có kiểm soát

**Mức ưu tiên:** P0  
**Mục tiêu:** Repository build/deploy được; route, blog, LaTeX và mobile critical hoạt động; chưa thay domain model lớn.

## 0.0. Preflight

- [ ] Chạy `git status --short`.
- [ ] Ghi commit hiện tại.
- [ ] Không chạm các untracked/private files.
- [ ] Chụp production baseline desktop/mobile cho:
  - [ ] Home;
  - [ ] Courses;
  - [ ] Course Detail;
  - [ ] Resources;
  - [ ] Exams;
  - [ ] Exam `ap1-f1`;
  - [ ] Blog;
  - [ ] Blog Detail;
  - [ ] Auth modal;
  - [ ] Profile.
- [ ] Xuất baseline build/lint vào implementation log.

## 0.1. Khôi phục build

File chính:

- `frontend/vite.config.js`;
- `frontend/package.json`;
- `frontend/package-lock.json`.

Nhiệm vụ:

- [x] Sửa `manualChunks` theo API Vite/Rolldown hiện hành hoặc bỏ manual split nếu route lazy đã đủ.
- [x] Không tăng `chunkSizeWarningLimit` để che bundle lớn.
- [x] Pin Node engine phù hợp.
- [x] Thêm script `check` chạy lint + test + build.
- [x] Xác minh clean build bằng `npm ci`.

Gate:

- [x] `npm run build` pass từ clean install.
- [x] Không có build warning bị bỏ qua có thể làm deploy fail.

## 0.2. Sửa Rules of Hooks và runtime blockers

Ưu tiên file:

- `CourseEnrollmentModal.jsx`;
- `CourseDetail.jsx`;
- `ExamDetail.jsx`;
- `BlogDetailPage.jsx`;
- `Navbar.jsx`;
- `ProfilePage.jsx`.

Nhiệm vụ:

- [x] Không return trước khi gọi đủ hooks.
- [x] Tách wrapper/not-found/closed-state thành component riêng.
- [ ] Sửa dependency và stale closure thật, không disable rule hàng loạt.
- [x] Không thêm eslint-disable ở cấp file để che lỗi.
- [ ] Sửa `changeLanguage`/Context contract.

Gate:

- [x] Không còn `react-hooks/rules-of-hooks`.
- [ ] Mở/đóng enrollment modal nhiều lần không crash.
- [ ] Chuyển course/exam/blog hợp lệ và không hợp lệ không crash.

## 0.3. Sửa route contract

Quyết định route canonical:

```text
/
/courses
/course/:slug
/account
/resources
/document/:id
/exams
/exam/:id
/blog
/blog/:slug
/about
/support
/payment/result
```

Nhiệm vụ:

- [x] Chuyển sang `createBrowserRouter`.
- [x] Đồng nhất `Link`, navigate và share URL; sitemap hiện không chứa hash URL.
- [x] Redirect legacy hash URL hợp lý nếu có thể.
- [x] `/payos-api-docs` chuyển thành internal và bỏ khỏi primary nav.
- [x] Wildcard trả NotFound thật.
- [x] Direct refresh hoạt động qua Netlify SPA rewrite và local preview smoke.

Gate:

- [x] Mọi route canonical trả SPA shell khi nhập trực tiếp URL; source contract ánh xạ đúng màn hình.
- [x] 7/7 blog card dùng `/blog/:slug` và route detail canonical.
- [x] Document route dùng `/document/:id`, có redirect legacy `/doc/:id`.

## 0.4. Sửa LaTeX đúng nguyên nhân

File chính:

- `frontend/src/data/practiceExams.js`;
- `frontend/src/components/MathRenderer.jsx`;
- `frontend/src/pages/ExamDetail.jsx`;
- `frontend/index.html`;
- CSS math/exam liên quan.

Nhiệm vụ:

- [x] Sửa riêng over-escape trong đề `ap1-f1`.
- [x] Không replace toàn file.
- [x] Giữ KaTeX npm làm renderer duy nhất.
- [x] Bỏ KaTeX CDN trùng version.
- [x] Bỏ MathJax CDN và manual typeset.
- [x] Đặt `trust: false`.
- [x] Dev/test dùng `throwOnError: true` và `strict: 'error'`.
- [x] Production render error có fallback rõ, không im lặng thành công.
- [x] Tạo `scripts/validate-math.mjs`.
- [x] Validator quét prompt, option, explanation và blog math.
- [x] Công thức dài chỉ scroll trong math container.

Gate:

- [x] Tất cả 2.694 expression hiện có parse pass ở strict mode.
- [ ] Q1 `ap1-f1` hiển thị đúng `\frac`, `\sin`, `\mathbb{R}`.
- [ ] Matrix/cases vẫn xuống dòng đúng.
- [x] Không còn MathJax/CDN source hoặc manual typeset trong production bundle.

## 0.5. Hotfix responsive

Ưu tiên:

- Home;
- Courses;
- Resources;
- Navbar/mobile drawer;
- checkout modal.

Nhiệm vụ:

- [ ] Tìm selector gây overflow, không chỉ dùng `overflow-x:hidden/clip`.
- [ ] Giới hạn hero heading bằng `clamp()` hợp lý.
- [ ] Grid chuyển một cột ở 320–390px.
- [ ] Inline checkout grid được thay bằng class responsive.
- [ ] Drawer có `overflow-y:auto`.
- [ ] Touch target tối thiểu 44px.

Viewport bắt buộc:

```text
320x568
375x667
390x844
768x1024
1024x768
1440x900
```

Gate:

- [ ] `document.documentElement.scrollWidth <= window.innerWidth`.
- [ ] Không mất CTA/navigation ở màn hình thấp.

## 0.6. Phase 0 quality gate

- [x] Frontend build pass.
- [x] Frontend lint pass với 0 error / 0 warning.
- [x] Backend `node --check` pass trên 24 file JavaScript.
- [x] Route smoke tests pass ở source contract và 12 direct URL qua local preview.
- [x] Math validator pass 2.720/2.720 biểu thức ở strict mode.
- [ ] Mobile screenshots pass.
- [ ] Production deploy chỉ thực hiện khi người dùng yêu cầu.

Không sang Phase 1 nếu gate chưa đạt.

---

# PHASE 1 — Authentication, session và security foundation

**Mức ưu tiên:** P0  
**Mục tiêu:** Backend là source-of-truth danh tính và quyền.

## 1.1. Secret incident cleanup

- [ ] Rotate GitHub credential đã từng hardcode.
- [ ] Xóa fallback secret khỏi source.
- [ ] Quét working tree và Git history.
- [ ] Thêm secret scanning vào CI.
- [ ] Production thiếu secret bắt buộc phải fail startup.
- [ ] Không log token, OTP, password hoặc provider payload nhạy cảm.

## 1.2. Same-origin API

- [ ] Thêm Netlify `/api/*` proxy trước SPA fallback `/*`.
- [ ] Thêm Vite dev proxy tới port backend chuẩn `3001`.
- [ ] Chuẩn hóa frontend API client dùng relative `/api`.
- [ ] Loại bỏ fallback production về localhost.
- [ ] Chỉ allowlist canonical/staging origin ở backend cho direct calls cần thiết.
- [ ] Express đặt `app.set('trust proxy', 1)` trên Render.
- [ ] Test `Set-Cookie`, logout và CSRF qua Netlify proxy thật ở staging.

## 1.3. Server session

- [ ] Tạo Session model với TTL index.
- [ ] Dùng opaque session token, database chỉ lưu hash.
- [ ] Cookie: `HttpOnly`, `Secure` ở production, `SameSite` phù hợp, path rõ ràng.
- [ ] Rotate session sau login.
- [ ] Logout revoke session.
- [ ] Session hết hạn trả `401` ổn định.
- [ ] Thêm CSRF protection cho mutation.
- [ ] `GET /api/auth/me` trả public DTO.

## 1.4. Local password auth

- [ ] Giữ khả năng verify password scrypt hiện tại.
- [ ] Chính sách mật khẩu thống nhất signup/reset.
- [ ] Không tự migrate hash nguy hiểm.
- [ ] Login thành công tạo cùng loại server session như social login.
- [ ] Thêm rate limit và audit.

## 1.5. Firebase social auth

- [ ] Cấu hình Firebase Admin từ environment.
- [ ] Frontend gửi Firebase ID token.
- [ ] Backend dùng `verifyIdToken`.
- [ ] Upsert identity theo provider UID đã verify.
- [ ] Không tin email/name/uid từ body.
- [ ] Chỉ xét email owner sau khi provider token đã verify và email đã normalize.
- [ ] Link local/social identity vào cùng User theo email đã verify, không tạo duplicate owner/student.
- [ ] Google và GitHub cuối cùng đều tạo server session.
- [ ] Xóa custom GitHub secret flow nếu Firebase provider đã thay thế đầy đủ.

## 1.6. Forgot/reset password

- [ ] Xóa universal OTP.
- [ ] Sinh OTP bằng CSPRNG.
- [ ] Lưu OTP hash trong PasswordResetChallenge.
- [ ] TTL ngắn, single-use.
- [ ] Attempt limit và cooldown.
- [ ] Forgot response trung tính.
- [ ] Không gửi OTP trong API response hoặc log.
- [ ] Reset revoke các session cũ của user.

## 1.7. Authorization

- [ ] Tạo `authenticate`.
- [ ] Tạo `authorizeRole`.
- [ ] Role enum chỉ có `ADMIN` và `STUDENT`.
- [ ] Tạo server constant bất biến `OWNER_ADMIN_EMAIL = 'luphuc321@gmail.com'`; không cho environment override.
- [ ] Tạo migration có audit để map owner User hiện có -> `ADMIN`.
- [ ] Tạo migration: mọi Admin legacy khác -> `STUDENT`.
- [ ] Signup/sync mặc định `STUDENT`.
- [ ] Owner Firebase identity đã verify chỉ được link vào owner User đã bootstrap; không auto-promote User mới.
- [ ] Readiness fail nếu không có đúng một Admin hoặc Admin email sai.
- [ ] Không có endpoint public/admin để tạo Admin thứ hai hoặc chuyển role.
- [ ] Chỉ owner Admin được truy cập admin routes.
- [ ] Profile chỉ update chính user hiện tại.
- [ ] Upload/resource mutation chỉ Admin đã verify.
- [ ] Không cho client update `role`.
- [ ] Course admin/access không dựa vào email.
- [ ] Escape RegExp hoặc bỏ regex query không cần thiết.

## 1.8. Security middleware

- [ ] Helmet/security headers.
- [ ] CSP phù hợp Firebase/PayOS/media.
- [ ] Body size limit.
- [ ] Zod hoặc validator tương đương cho mọi mutation.
- [ ] Rate limit riêng login/forgot/reset/comment/payment.
- [ ] Error handler không leak stack production.
- [ ] Request ID và log redaction.
- [ ] Production không dùng JSON fallback cho auth/payment.

## 1.9. Phase 1 tests

Unit:

- [ ] password verify;
- [ ] OTP lifecycle;
- [ ] session token hashing;
- [ ] role authorization;
- [ ] DTO redaction.

Integration:

- [ ] signup/login/me/logout;
- [ ] Firebase token valid/invalid;
- [ ] profile owner/attacker;
- [ ] forgot/reset rate limit;
- [ ] Admin/non-Admin route.
- [ ] owner User đã bootstrap, đăng nhập bằng Firebase identity đúng email đã verify, vẫn nhận `ADMIN`;
- [ ] public signup bằng chuỗi email owner không tạo mới hoặc auto-promote `ADMIN`;
- [ ] email gần giống/case trick không vượt normalize rule;
- [ ] mọi email khác nhận `STUDENT`;
- [ ] database sau migration chỉ có đúng một Admin.

Security:

- [ ] localStorage role giả vô hiệu;
- [ ] uid/email body giả vô hiệu;
- [ ] client gửi `role: ADMIN` bị bỏ qua;
- [ ] student không thể tạo hoặc promote Admin;
- [ ] OTP `123456` thất bại;
- [ ] session fixation thất bại;
- [ ] CSRF request bị từ chối.

Gate:

- [ ] Không protected endpoint nào tin client identity.
- [ ] Chỉ `luphuc321@gmail.com` là Admin; mọi tài khoản khác là Student.
- [ ] Không active secret trong source/history phát hành.
- [ ] Toàn bộ auth test pass.

---

# PHASE 2 — Order, PayOS và Enrollment

**Mức ưu tiên:** P0  
**Mục tiêu:** Thanh toán đúng số tiền cấp đúng một quyền cho đúng user/course.

## 2.1. Domain và migration

- [ ] Tạo Course.
- [ ] Tạo Coupon.
- [ ] Tạo Order.
- [ ] Tạo PaymentAttempt.
- [ ] Tạo WebhookEvent.
- [ ] Tạo Enrollment.
- [ ] Tạo AuditLog/OutboxEvent tối thiểu.
- [ ] Tạo index/unique constraint.
- [ ] Seed/migrate catalog từ `coursesData.js` nhưng đánh dấu content sample.
- [ ] Không publish paid course chưa có content thật.

## 2.2. Server-side pricing

- [ ] Client chỉ gửi courseId/coupon và acknowledgment/version chính sách; tuyệt đối không gửi giá quyết định.
- [ ] Server đọc giá Course.
- [ ] Server validate Coupon.
- [ ] Không để discount làm total âm.
- [ ] Coupon free 100% vẫn phải tạo audit/enrollment server-side.
- [ ] Không giữ voucher cố định trong frontend bundle.
- [ ] Response trả breakdown subtotal/discount/total.

## 2.3. Order creation

- [ ] orderCode sinh server-side, collision-safe.
- [ ] idempotency key theo request/user/course.
- [ ] Một request retry không tạo nhiều order ngoài ý muốn.
- [ ] Lưu Order trước khi gọi PayOS.
- [ ] Validate policy version và lưu policy hash/version/acknowledgment timestamp trên Order trước khi gọi PayOS.
- [ ] Gắn PaymentAttempt và expected amount.
- [ ] Buyer email/phone lấy từ user/profile đã xác thực.

## 2.4. PayOS adapter

- [ ] Tách PayOS HTTP logic khỏi controller.
- [ ] Ưu tiên PayOS Node SDK chính thức cho create/get/cancel payment request và webhook verify; pin version tương thích, bọc SDK sau adapter để domain không phụ thuộc trực tiếp.
- [ ] Nếu phải ký create-payment thủ công, canonical string chỉ dùng năm field theo contract PayOS `amount`, `cancelUrl`, `description`, `orderCode`, `returnUrl` theo thứ tự alphabet; có positive fixture test.
- [ ] Timeout và error mapping rõ.
- [ ] Không log checksum key.
- [ ] Return/cancel URL lấy từ canonical frontend config.
- [ ] Không hardcode Netlify subdomain cũ.

## 2.5. Webhook

- [ ] Xác thực checksum HMAC bắt buộc bằng verifier của PayOS Node SDK chính thức nếu phiên bản đang dùng hỗ trợ; nếu không, triển khai đúng canonicalization của webhook `payment-requests` trong tài liệu PayOS chính thức.
- [ ] Chỉ ký/verify object `payload.data`; không đưa `code`, `desc`, `success` hoặc `signature` cấp ngoài vào chuỗi ký.
- [ ] Canonicalization fallback phải bám đúng reference JavaScript chính thức của phiên bản PayOS dùng khi code: sort key của `data` theo alphabet; ghép `key=value` bằng `&`; xử lý `null`/`undefined` và literal `"null"`/`"undefined"` đúng reference; với array, giữ nguyên thứ tự phần tử, sort key trong từng object rồi `JSON.stringify`. Không tự “cải tiến” serializer.
- [ ] Không dùng serializer của PayOS `payouts` cho webhook `payment-requests`; hai contract chữ ký khác nhau.
- [ ] Nguồn chuẩn tại thời điểm viết spec: `https://payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature/`; lúc code phải đối chiếu lại tài liệu/SDK PayOS chính thức đang cài.
- [ ] Timing-safe compare.
- [ ] Verify trên payload chưa bị mapper/coercion nghiệp vụ thay đổi; chỉ map domain sau khi checksum hợp lệ.
- [ ] Chỉ xử lý order đã tồn tại.
- [ ] Đối chiếu orderCode.
- [ ] Đối chiếu paymentLinkId.
- [ ] Đối chiếu expected amount.
- [ ] Lưu fingerprint/event idempotent.
- [ ] Duplicate event trả 200 nhưng không cấp quyền lần hai.
- [ ] Out-of-order event không downgrade PAID.
- [ ] Invalid event log an toàn và không mutate.

## 2.6. Fulfillment transaction

- [ ] Trong một transaction:
  - [ ] update Order thành PAID;
  - [ ] update PaymentAttempt;
  - [ ] create/upsert Enrollment;
  - [ ] create AuditLog;
  - [ ] create OutboxEvent.
- [ ] Unique Enrollment ngăn double grant.
- [ ] Nếu transaction fail, reconciliation xử lý lại.

## 2.7. Payment result

- [ ] Xóa mutation khỏi `/payment/success` và `/payment/cancel`.
- [ ] Tạo frontend `/payment/result`.
- [ ] Result page poll/read order status.
- [ ] Có UI `PENDING`, `PAID`, `ENTITLED`, `CANCELLED`, `EXPIRED`, `FAILED`.
- [ ] `ENTITLED` chỉ là view-state tổng hợp khi `Order.status === PAID && Enrollment.accessStatus === ACTIVE`; không lưu `ENTITLED` vào Order hoặc PaymentAttempt.
- [ ] Không có UI refund.
- [ ] Refresh/đổi tab vẫn khôi phục order.
- [ ] Không xem order của user khác.

## 2.8. Chính sách không hoàn tiền

- [ ] Checkout hiển thị chính sách không hoàn tiền trước CTA cuối.
- [ ] Người dùng phải xác nhận đã đọc trước khi tạo payment link.
- [ ] Lưu `noRefundAcknowledgedAt`, `noRefundPolicyVersion` và `noRefundPolicyHash` trên Order.
- [ ] Checkbox + timestamp chỉ là ghi nhận đã đọc chính sách, không phải chữ ký điện tử.
- [ ] Không tạo `buyerSignature`, `signatureImage`, `signedDocument` hoặc quy trình ký tài liệu.
- [ ] Từ `signature/checksum` chỉ được dùng trong ngữ cảnh kỹ thuật xác minh webhook PayOS, không phải chữ ký người mua.
- [ ] Không thêm API refund.
- [ ] Không thêm button refund.
- [ ] Support category không có refund.
- [ ] Cancel chỉ áp dụng trước khi PAID.

## 2.9. Reconciliation

- [ ] Job tìm order pending quá ngưỡng.
- [ ] Query PayOS server-to-server.
- [ ] PAID nhưng chưa có Enrollment phải retry/alert.
- [ ] Có admin report mismatch.
- [ ] Job idempotent.

## 2.10. Phase 2 test matrix

- [ ] giá client giả;
- [ ] coupon giả/hết hạn/quá lượt;
- [ ] fixture webhook PayOS hợp lệ đã sanitize, dùng test checksum key cố định và signature precomputed, phải verify thành công;
- [ ] chính fixture hợp lệ nhưng đổi thứ tự key vẫn verify thành công sau canonicalization;
- [ ] webhook checksum sai;
- [ ] mutate từng field quan trọng của fixture hợp lệ làm verify thất bại;
- [ ] null/undefined/array fixture tuân đúng normalization PayOS;
- [ ] amount sai;
- [ ] paymentLinkId sai;
- [ ] order không tồn tại;
- [ ] webhook duplicate;
- [ ] webhook out-of-order;
- [ ] return URL trực tiếp;
- [ ] user A đọc order user B;
- [ ] paid tạo đúng một Enrollment;
- [ ] transaction fail rồi reconciliation;
- [ ] cancel trước paid;
- [ ] cancel sau paid không downgrade;
- [ ] policy version được lưu.

Gate:

- [ ] DevTools/localStorage không thể cấp quyền.
- [ ] Một PayOS payment hợp lệ cấp đúng một Enrollment.
- [ ] Cross-device login thấy đúng course.
- [ ] Không có refund code/state/UI.

---

# PHASE 3 — Learning experience, YouTube và progress

**Mức ưu tiên:** P0/P1  
**Mục tiêu:** Biến course UI thành trải nghiệm học khóa trực tuyến hoàn chỉnh, tiện và linh hoạt theo Coursera/Udemy; không dùng sample content và không thiết kế theo LMS hành chính của đại học.

## 3.1. Catalog migration

- [ ] Migrate course/chapter/lesson vào database.
- [ ] `coursesData.js` chỉ còn fixture tạm hoặc bị loại sau migration.
- [ ] Số bài tính từ lesson published.
- [ ] Số học viên tính từ enrollment nếu quyết định hiển thị.
- [ ] Giá lấy từ backend.
- [ ] Paid course sample bị `DRAFT`, không được mở bán.

## 3.2. Media abstraction

- [ ] Tạo YouTubeMedia repository/service.
- [ ] Lưu `youtubeVideoId`, không lưu full watch URL nếu không cần.
- [ ] Mọi video course, gồm cả lesson paid và preview, phải được owner đặt `Unlisted`.
- [ ] `PREVIEW` chỉ bỏ yêu cầu Enrollment tại access API; không đồng nghĩa với YouTube Public.
- [ ] Admin console có hành động xác nhận thủ công “Đã kiểm tra video ở Unlisted”, chỉ owner session được dùng.
- [ ] Mỗi lần xác nhận ghi `privacyVerifiedAt`, `privacyVerifiedByUserId`, phương thức `OWNER_MANUAL` và AuditLog; không chỉ tin trường `privacyExpected`.
- [ ] Course publish bị chặn nếu bất kỳ lesson video nào chưa có xác nhận Unlisted của owner.
- [ ] Nếu sau này dùng YouTube Data API, lưu phương thức `YOUTUBE_API` nhưng không phát sinh tích hợp/env mới trong scope hiện tại.
- [ ] Catalog public không serialize ID của lesson `ENROLLED`.
- [ ] Lesson access API kiểm tra session + Enrollment rồi mới trả ID/embed config.
- [ ] Player dùng YouTube embed/IFrame API, ưu tiên `youtube-nocookie.com`.
- [ ] Không thêm signed URL, private HLS/CDN hoặc DRM.
- [ ] Không dùng sample Google video làm bài học thật.
- [ ] Không ghi copy “video bảo mật tuyệt đối”, “không thể chia sẻ” hoặc tương tự.
- [ ] Ghi rõ trong technical docs rằng Unlisted URL có thể bị người đã xem chia sẻ lại.

## 3.3. Learning access

- [ ] CourseDetail fetch catalog từ API.
- [ ] Lesson access gọi backend.
- [ ] Enrollment gate xử lý server-side.
- [ ] Preview lesson rõ ràng.
- [ ] Unauthorized trả CTA login/enroll và không trả YouTube ID.

## 3.4. Progress

- [ ] Lưu position theo interval hợp lý, không mỗi frame.
- [ ] Debounce/throttle.
- [ ] Final beacon khi unload nếu khả thi.
- [ ] Complete theo threshold đã định, không phải click.
- [ ] Resume cross-device.
- [ ] Progress không thể update course chưa enrolled.

## 3.5. My Learning

- [ ] Profile không render toàn catalog.
- [ ] Fetch `/api/me/enrollments`.
- [ ] Hiển thị progress thật.
- [ ] CTA “Tiếp tục học”.
- [ ] Lịch sử order/payment chỉ của user.
- [ ] Empty/error/loading/offline đầy đủ.

## 3.6. Player UX

- [ ] Native controls hoặc custom controls keyboard-accessible.
- [ ] Caption/transcript khi asset có.
- [ ] Playback speed.
- [ ] Fullscreen.
- [ ] Resume.
- [ ] Error state và retry.
- [ ] Report issue tạo SupportTicket thật.
- [ ] Watermark chỉ là lớp nhận diện, không quảng cáo là DRM.
- [ ] Xóa anti-devtools làm security giả.

## 3.7. Phase 3 gate

- [ ] Một course thật có nội dung thật end-to-end.
- [ ] Không sample video trong paid published course.
- [ ] YouTube ID của lesson enrolled không nằm trong bundle/catalog public.
- [ ] Access API từ chối user chưa enroll.
- [ ] Mọi video của course pilot, kể cả preview, được owner kiểm tra thực tế là Unlisted.
- [ ] Mỗi video published có `privacyVerifiedAt`, `privacyVerifiedByUserId` đúng owner và AuditLog tương ứng.
- [ ] Publish API từ chối course có video chưa được owner xác nhận Unlisted.
- [ ] Đổi thiết bị vẫn resume.
- [ ] Profile/course count khớp database.
- [ ] Video issue trả ticket code.

---

# PHASE 4 — Edtech UX system và UI foundation

**Mức ưu tiên:** P1  
**Có thể song song:** phần thiết kế có thể chạy trong khi backend Phase 1–3 được làm.

## 4.1. Product positioning và content truth

- [ ] Ghi cố định trong content model: đây là nền tảng độc lập do chủ dự án tạo, dạy Toán Cao Cấp cho sinh viên UEH.
- [ ] Giữ chữ `UEH` trong tên/nội dung/SEO hiện có; không redesign thành cổng trường đại học.
- [ ] Giữ composition hai publication cover bắt chéo `K51 · Hai đợt` và `FINAL 2807` trên Home; không thay bằng card-grid thông thường.
- [ ] Không sử dụng copy khiến người dùng tưởng đang thao tác với phòng ban/học vụ của trường.
- [ ] Kiểm kê claim/số liệu.
- [ ] Xóa hoặc nối analytics thật.
- [ ] Kiểm kê asset có bản quyền/nguồn.
- [ ] Chốt tone tiếng Việt: rõ, thân thiện, nhanh, giống edtech course marketplace; không hành chính và không tự ca ngợi.

## 4.2. Token source duy nhất

- [ ] Hợp nhất `tokens.css`, `theme.css`, `index.css`.
- [ ] Semantic color token cho light/dark.
- [ ] Type scale.
- [ ] Spacing scale.
- [ ] Container/grid.
- [ ] Radius/elevation.
- [ ] Focus ring.
- [ ] Motion duration/easing.
- [ ] Breakpoint contract.

Không hardcode màu mới ngoài token trừ dữ liệu/content đặc thù có lý do.

## 4.3. Icon policy

- [ ] Chỉ một bộ Lucide.
- [ ] Bỏ Sparkles khỏi hero/reaction/payment nếu không có nghĩa.
- [ ] Bỏ emoji UI.
- [ ] Icon-only button có accessible name.
- [ ] Stroke/size thống nhất.
- [ ] Không dùng icon AI để trang trí.

## 4.4. Primitive

- [ ] Button.
- [ ] IconButton.
- [ ] Input/Textarea/Select.
- [ ] Checkbox/Radio.
- [ ] Card.
- [ ] Badge.
- [ ] Tabs.
- [ ] Accordion.
- [ ] Modal/Drawer.
- [ ] Toast/InlineAlert.
- [ ] Skeleton.
- [ ] Empty/Error/Offline.
- [ ] Progress.
- [ ] Table/List.

Mỗi primitive phải có:

- default;
- hover;
- active;
- focus-visible;
- disabled;
- loading;
- error nếu phù hợp;
- dark;
- reduced motion;
- keyboard test.

## 4.5. Modal contract

Mọi modal:

- [ ] `role="dialog"`;
- [ ] `aria-modal="true"`;
- [ ] accessible title;
- [ ] focus trap;
- [ ] Escape;
- [ ] backdrop close theo policy;
- [ ] return focus;
- [ ] body scroll lock;
- [ ] mobile drawer behavior;
- [ ] không return trước hooks.

## 4.6. CSS migration

- [ ] Không rewrite 13.000+ dòng trong một lần.
- [ ] Migrate route theo route.
- [ ] Giảm inline style.
- [ ] Giảm `!important`.
- [ ] Không thêm override vào cuối `experience.css`.
- [ ] Xóa legacy selector chỉ sau visual regression.
- [ ] Ghi CSS debt delta sau mỗi route.

## 4.7. Design approval gate

Trước rollout toàn site, hoàn thiện staging cho:

- [ ] Home;
- [ ] Course Detail;
- [ ] Checkout;
- [ ] Learning Player.

Chỉ rollout sau khi chủ dự án duyệt direction.

---

# PHASE 5 — UX theo hành trình và route

**Mức ưu tiên:** P1  
**Thứ tự bắt buộc:** journey trước, page polish sau.

## 5.1. Information architecture

Primary nav đề xuất:

```text
Trang chủ
Khóa học
Thư viện
Thi thử
Blog
```

Utility:

```text
Search
Theme
Language
Support
Account
```

- [ ] PayOS API docs không ở public primary nav.
- [ ] WinForms/ngrok/internal copy không xuất hiện public.
- [ ] Mobile navigation có đầy đủ mục và auth state.
- [ ] Không có menu khoa, phòng ban, học vụ, lịch đào tạo hoặc cấu trúc cổng trường.
- [ ] Từ mọi public page, người dùng đến course catalog trong tối đa một thao tác.
- [ ] User đã enroll đến “Tiếp tục học” trong tối đa hai thao tác.
- [ ] Header ưu tiên học, tìm kiếm và account; không nhồi chức năng quản trị.

## 5.2. Home

- [ ] Value proposition cụ thể.
- [ ] CTA course/library/exam phân cấp.
- [ ] Không fake stats.
- [ ] Dùng proof/content thật.
- [ ] Không Sparkles hoặc AI badge trang trí.
- [ ] Hero không overflow.
- [ ] Ảnh publication responsive/lazy.

## 5.3. Catalog

- [ ] Search/filter/sort.
- [ ] Free/paid status.
- [ ] Level/duration/published lessons.
- [ ] Giá backend.
- [ ] Không số enrollment giả.
- [ ] Empty/loading/error.

## 5.4. Course Detail

- [ ] Learning outcomes.
- [ ] Instructor/source.
- [ ] Prerequisite.
- [ ] Curriculum thật.
- [ ] Preview lesson.
- [ ] Documents.
- [ ] Price/policy.
- [ ] Enrollment state.
- [ ] Thống nhất visual với public site, bỏ nền xanh bão hòa toàn trang.

## 5.5. Checkout

- [ ] Order summary từ server.
- [ ] Coupon server validation.
- [ ] Buyer info từ profile.
- [ ] Chính sách không hoàn tiền rõ ràng.
- [ ] Checkbox xác nhận policy version.
- [ ] PayOS/VietQR gọi đúng tên.
- [ ] Không gắn nhãn MoMo/VNPay giả.
- [ ] Pending/expired/cancelled/failed/paid/entitled.
- [ ] Error có hướng xử lý.
- [ ] Không mất order khi refresh.

## 5.6. Learning

- [ ] My Courses thật.
- [ ] Resume.
- [ ] Chapter/lesson navigation.
- [ ] Progress.
- [ ] Mobile player.
- [ ] Support/report.
- [ ] Empty/offline/error.

## 5.7. Exams

- [ ] Exam lobby.
- [ ] Start confirmation.
- [ ] Timer bền vững.
- [ ] Autosave.
- [ ] Flag/navigation.
- [ ] Submit confirmation.
- [ ] Auto-submit.
- [ ] Result summary.
- [ ] Review explanation.
- [ ] LaTeX responsive.
- [ ] Không conditional hooks.

## 5.8. Library

- [ ] Search/filter.
- [ ] Metadata và source.
- [ ] Document route canonical.
- [ ] Viewer mobile.
- [ ] Related content dựa trên category, không random giả.
- [ ] View count thật hoặc bỏ.

## 5.9. Blog

- [ ] Blog index.
- [ ] Category/search.
- [ ] Article detail.
- [ ] TOC.
- [ ] Author/date/update.
- [ ] Citation/reference.
- [ ] Math.
- [ ] Related article có logic.
- [ ] Engagement state.

## 5.10. Owner Admin Console

Route `/admin` chỉ dành cho `luphuc321@gmail.com`.

Navigation admin tối giản:

```text
Tổng quan
Khóa học
Đơn hàng
Học viên
Blog
Hỗ trợ
```

- [ ] Không có màn hình role management.
- [ ] Không có quản lý phòng ban/giảng vụ.
- [ ] Không có nhiều workspace/tenant.
- [ ] Tổng quan chỉ hiển thị số liệu thật và các việc cần xử lý.
- [ ] Orders tập trung vào pending/mismatch/paid-no-enrollment.
- [ ] Courses cho owner quản lý metadata, chapter, lesson và YouTube ID.
- [ ] Courses hiển thị trạng thái xác nhận Unlisted từng video và chỉ owner được ghi nhận kiểm tra trước publish.
- [ ] Students chỉ cho xem hồ sơ/enrollment/progress cần thiết.
- [ ] Blog có draft/publish đơn giản do owner tự vận hành.
- [ ] Support là một inbox đơn giản.
- [ ] Mọi mutation Admin đều có audit log.

## 5.11. Accessibility/responsive gate

- [ ] WCAG 2.2 AA cho core flows.
- [ ] Contrast đạt AA.
- [ ] Keyboard-only hoàn thành login, checkout, learning, exam.
- [ ] Screen reader smoke test.
- [ ] `aria-live` cho error/payment/timer/toast.
- [ ] Route focus/announcement.
- [ ] Reduced motion.
- [ ] Không overflow từ 320px.

---

# PHASE 6 — Content pipeline, Blog và SEO

## 6.1. Content source

Giai đoạn đầu ưu tiên content repository có schema/version qua Git thay vì dựng CMS lớn ngay.

- [ ] Tách blog metadata/content khỏi bundle index.
- [ ] Chuyển 7 bài sang content file có frontmatter/schema.
- [ ] Draft/published state.
- [ ] Author.
- [ ] Published/updated date.
- [ ] Slug unique.
- [ ] OG image.
- [ ] Description.
- [ ] Tags/category.
- [ ] CI validate.

CMS UI đầy đủ là work package P2 riêng, không chặn sửa blog hiện tại.

## 6.2. Math content schema

- [ ] Phân biệt inline/display.
- [ ] Không suy đoán block bằng regex khi schema mới đã áp dụng.
- [ ] Validator strict.
- [ ] Math fallback.
- [ ] Visual fixture.
- [ ] KaTeX accessibility output.

## 6.3. Clean URL và renderability

- [ ] Browser router.
- [ ] Netlify rewrite.
- [ ] Prerender public routes hoặc giải pháp render HTML tương đương.
- [ ] HTML route public có title/description/canonical/H1 không phụ thuộc crawler chạy JS.
- [ ] Không migrate framework nếu behavior đạt được bằng Vite hiện tại.

## 6.4. Metadata và structured data

- [ ] Home metadata.
- [ ] Course metadata.
- [ ] Article metadata.
- [ ] Document metadata nếu indexable.
- [ ] Article JSON-LD.
- [ ] Course JSON-LD.
- [ ] Breadcrumb JSON-LD.
- [ ] Organization/Website JSON-LD sau khi legal identity được chốt.

## 6.5. Sitemap

- [ ] Sinh từ source-of-truth.
- [ ] Bao gồm 7 article.
- [ ] Bao gồm published courses.
- [ ] Có `lastmod`.
- [ ] Không include internal/payOS docs/gift/private/account.
- [ ] Canonical trùng route.

## 6.6. Engagement hardening

- [ ] GET không mutate.
- [ ] Slug phải tồn tại.
- [ ] Rate limit.
- [ ] Moderation status.
- [ ] Sanitize content.
- [ ] Không tin clientId cho security.
- [ ] Admin moderation audit.

Gate:

- [ ] 7/7 article mở direct URL.
- [ ] Metadata riêng.
- [ ] Sitemap đúng.
- [ ] Lighthouse SEO mục tiêu ≥95.
- [ ] Math validator pass.

---

# PHASE 7 — Support, observability và production hardening

## 7.1. Ticketing

- [ ] Tạo SupportTicket model/API.
- [ ] Form tư vấn tạo ticket.
- [ ] Video report tạo ticket.
- [ ] Access issue gắn user/course/order.
- [ ] Payment pending issue gắn order.
- [ ] Trả ticket code.
- [ ] User xem status.
- [ ] Owner Admin xem và update ticket trong một inbox đơn giản.
- [ ] Không xây team assignment, department routing hoặc nhiều tầng phê duyệt.
- [ ] Có target response time gọn, không dựng hệ SLA doanh nghiệp phức tạp.
- [ ] Audit trail.
- [ ] Không refund category.

## 7.2. Transactional communication

- [ ] Welcome.
- [ ] Password reset.
- [ ] Order created/pending nếu cần.
- [ ] Payment confirmed.
- [ ] Enrollment granted.
- [ ] Access grant delayed.
- [ ] Ticket created/updated.
- [ ] Email idempotent qua outbox.

## 7.3. Legal/trust surfaces

- [ ] About/Người xây dựng nền tảng.
- [ ] Contact.
- [ ] Help Center/FAQ.
- [ ] Terms.
- [ ] Privacy.
- [ ] Payment policy.
- [ ] Chính sách không hoàn tiền.
- [ ] Copyright.
- [ ] Editorial policy.
- [ ] Thông tin chủ nền tảng và kênh liên hệ rõ ràng.
- [ ] Nội dung không được mô tả sản phẩm như LMS/cổng chính thức của trường.
- [ ] Vẫn giữ cách gọi UEH trong môn học và đối tượng người học theo định vị đã chốt.
- [ ] Merchant/contact identity rõ.

Không tự viết khẳng định pháp lý cuối cùng thay chủ dự án. Tạo draft rõ phần cần owner review.

## 7.4. Logging

- [ ] Pino hoặc structured logger tương đương.
- [ ] requestId.
- [ ] userId/orderId/ticketCode correlation an toàn.
- [ ] redact token/OTP/password/PII.
- [ ] log level theo environment.
- [ ] không chỉ dùng console rời rạc.

## 7.5. Health

- [ ] `/health/live`.
- [ ] `/health/ready`.
- [ ] Readiness đỏ nếu dependency bắt buộc hỏng.
- [ ] Production không báo healthy khi đang JSON fallback.

## 7.6. Metrics và alert

- [ ] API error rate/latency.
- [ ] auth failure spike.
- [ ] webhook invalid/failure/lag.
- [ ] pending order age.
- [ ] PAID không Enrollment.
- [ ] email outbox failure.
- [ ] frontend runtime errors.
- [ ] readiness failure.

## 7.7. Backup và migration

- [ ] Migration script versioned.
- [ ] Backup trước migration.
- [ ] Không auto-import Admin seed vào production.
- [ ] Restore drill.
- [ ] Rollback note.

---

# PHASE 8 — Testing, CI/CD và staged launch

## 8.1. Test stack

Frontend:

- Vitest;
- React Testing Library;
- Playwright;
- axe hoặc accessibility tool tương đương.

Backend:

- Node test/Vitest hoặc Jest nhất quán;
- Supertest;
- database integration test tách production.

Không cài hai framework cùng mục đích nếu không cần.

## 8.2. CI required checks

- [ ] install clean;
- [ ] lint;
- [ ] unit;
- [ ] integration;
- [ ] math/content validation;
- [ ] frontend build;
- [ ] backend syntax/start smoke;
- [ ] E2E core;
- [ ] secret scan;
- [ ] dependency audit;
- [ ] artifact/bundle report.

Merge/deploy không được tiếp tục nếu required check fail.

## 8.3. E2E core journeys

Auth:

- [ ] signup;
- [ ] email login;
- [ ] Google/GitHub session exchange mock/test environment;
- [ ] forgot/reset;
- [ ] logout;
- [ ] expired session.

Course:

- [ ] catalog;
- [ ] preview;
- [ ] login gate;
- [ ] checkout;
- [ ] payment pending;
- [ ] verified webhook;
- [ ] entitlement;
- [ ] cross-device/session restore;
- [ ] progress.

Exam:

- [ ] start;
- [ ] answer;
- [ ] autosave;
- [ ] timer;
- [ ] submit;
- [ ] result;
- [ ] LaTeX.

Blog/library/support:

- [ ] 7 blog routes;
- [ ] document route;
- [ ] support ticket.

## 8.4. Failure E2E

- [ ] DB unavailable;
- [ ] PayOS timeout;
- [ ] checksum invalid;
- [ ] duplicate webhook;
- [ ] webhook delayed;
- [ ] wrong amount;
- [ ] order ownership attack;
- [ ] session expired during checkout;
- [ ] paid but grant delayed;
- [ ] video access denied;
- [ ] offline frontend;
- [ ] chunk failure.

## 8.5. Visual regression

Routes:

- Home;
- Courses;
- Course Detail;
- Checkout states;
- Learning;
- Resources;
- Exams;
- Exam question/result;
- Blog index/detail;
- Auth;
- Profile;
- Support;
- 404/error/offline.

Modes:

- light/dark;
- VI/EN/JA/ZH sample;
- mobile/tablet/desktop;
- reduced motion.

## 8.6. Staged launch

1. Deploy staging.
2. Migrate test catalog.
3. Chạy PayOS sandbox/test flow.
4. Publish một course có nội dung thật.
5. Allowlist nhóm nội bộ.
6. Thực hiện một giao dịch thật giá nhỏ khi chủ dự án yêu cầu.
7. Kiểm tra Order/Payment/Enrollment/email/progress.
8. Quan sát 48–72 giờ.
9. Mở dần traffic.
10. Có rollback plan.

Không mở toàn catalog paid trước khi một course pilot đạt gate.

---

## 8. Quality budgets bắt buộc

### 8.1. Functional

- Build tái lập từ clean repository.
- Không lint error.
- Core test pass 100%.
- Không dead button.
- Không fake success.
- Không localStorage authorization.

### 8.2. Security

- Zero active secret trong source.
- Protected API có auth/ownership/RBAC.
- Chỉ owner User đã bootstrap, gắn verified identity đúng `luphuc321@gmail.com`, là `ADMIN`; mọi user/signup khác là `STUDENT`.
- OTP single-use/rate-limited.
- Checksum webhook bắt buộc.
- Client amount bị bỏ qua.
- Không PII/secret trong log.

### 8.3. Payment

- Một payment -> một Enrollment.
- Duplicate webhook không duplicate.
- Return URL không mutate.
- PAID không downgrade.
- Không refund module/state/UI.
- Chính sách không hoàn tiền được xác nhận và versioned.

### 8.4. Content

- 100% math expression parse.
- 7/7 blog article route hoạt động.
- Course count/price/content khớp database.
- Không sample video trong paid published course.
- Mọi video course, kể cả preview, dùng YouTube Unlisted.
- Published course có owner verification timestamp/AuditLog cho từng video.
- Catalog public/bundle không chứa YouTube ID của lesson enrolled.
- Không tuyên bố Unlisted là private tuyệt đối hoặc DRM.

### 8.5. Accessibility

- WCAG 2.2 AA core journeys.
- Keyboard-only.
- Focus visible.
- Modal contract đạt.
- Touch target ≥44px.
- Reduced motion.

### 8.6. Responsive

- Không horizontal overflow từ 320px.
- Không CTA/navigation bị mất.
- Math/video/table có containment phù hợp.

### 8.7. Performance

Mục tiêu p75 production:

```text
LCP <= 2.5s
INP <= 200ms
CLS <= 0.1
```

Ngoài ra:

- không forced loader delay;
- không duplicate math engine;
- ảnh responsive/lazy;
- route lazy hợp lý;
- bundle regression phải được giải thích.

### 8.8. SEO

- clean URL;
- canonical đúng;
- sitemap tự sinh;
- metadata route-specific;
- public content renderable;
- Lighthouse SEO mục tiêu ≥95.

---

## 9. Quy tắc commit/work package khi bắt đầu code

Nếu người dùng yêu cầu AI tự commit, dùng commit nhỏ theo dạng:

```text
fix(build): restore Vite production build
fix(router): align canonical routes and blog slugs
fix(math): normalize exam latex and remove duplicate renderer
fix(auth): verify Firebase token and create server session
feat(commerce): add server-priced orders and PayOS attempts
feat(learning): persist enrollments and lesson progress
refactor(ui): introduce semantic tokens and primitives
feat(support): create ticket workflow
test(e2e): cover payment entitlement journey
```

Không trộn security/domain migration với redesign lớn trong cùng commit.

---

## 10. Mẫu implementation log bắt buộc

AI cập nhật bảng này sau mỗi work package đã được test.

| Phase | Work package | Status | Files chính | Tests đã chạy | Ghi chú/rủi ro |
|---|---|---|---|---|---|
| 0 | Preflight | Blocked | `artifacts/phase0-baseline/home-desktop.png` | Baseline build/lint; production Home capture | Đã ghi HEAD và bảo toàn private files; Chrome headless lỗi GPU/profile nên bộ screenshot còn thiếu. |
| 0 | Build recovery | Completed | `vite.config.js`, `package*.json`, `tests/vite-config.test.js` | `npm ci`; `npm run build`; `npm run test` | Vite 8/Rolldown code splitting hợp lệ; build sạch, không nâng warning limit. |
| 0 | Hooks/runtime | Blocked | Enrollment/Course/Exam/Blog wrappers, `Navbar.jsx`, `ProfilePage.jsx`, `GiftPage.jsx` | `npm run lint`: 0 error/0 warning; React hook/compiler rule = 0 | Giảm từ baseline 299 xuống 0 mà không disable rule; còn browser smoke mở/đóng modal và valid/invalid detail. |
| 0 | Router/blog | Completed | `App.jsx`, `Navbar.jsx`, `ProfilePage.jsx`, `BlogDetailPage.jsx` | 5 Node tests; 12 direct-URL local preview smoke = HTTP 200 | BrowserRouter + canonical/legacy redirects; PayOS docs bỏ khỏi primary nav. |
| 0 | LaTeX | In progress | exam/blog data, `MathRenderer.jsx`, `ExamDetail.jsx`, CSS, `index.html`, validator/test | 2.720/2.720 strict KaTeX pass; 5 Node tests; build pass | Sửa cả 6 đoạn blog bị mất backslash; còn visual smoke Q1 và matrix/cases do Chrome headless lỗi GPU. |
| 0 | Mobile overflow | Pending | — | — | — |
| 1 | Secret/session/auth | Pending | `backend/utils/roles.js`, auth/resource controller, user seed | 2 backend role tests; 24/24 `node --check` | Subtask role contract đã khóa đúng owner: chỉ `luphuc321@gmail.com` là Admin; full session/auth package chưa bắt đầu. |
| 1 | OTP/RBAC/security | Pending | — | — | — |
| 2 | Domain migration | Pending | — | — | — |
| 2 | PayOS/Enrollment | Pending | — | — | — |
| 3 | Learning experience/YouTube/progress | Pending | — | — | — |
| 4 | Edtech UX/tokens/primitives | Pending | — | — | — |
| 5 | Journey redesign | Pending | — | — | — |
| 6 | Content/blog/SEO | Pending | — | — | — |
| 7 | Support/observability | Pending | — | — | — |
| 8 | CI/E2E/launch | Pending | — | — | — |

Status chỉ dùng:

```text
Pending
In progress
Blocked
Completed
```

Không đặt `Completed` nếu gate hoặc test còn fail.

---

## 10.1. Decision log đã chốt

| ID | Quyết định | Trạng thái | Ngày |
|---|---|---|---|
| DEC-001 | Không xây refund module/state/API/UI | Chốt bởi chủ dự án | 29/07/2026 |
| DEC-002 | Không có chữ ký người mua; webhook vẫn xác thực checksum HMAC | Chốt bởi chủ dự án | 29/07/2026 |
| DEC-003 | Video khóa học dùng YouTube Unlisted làm nền tảng phân phối | Chốt bởi chủ dự án | 29/07/2026 |
| DEC-004 | Nền tảng độc lập do chủ dự án tạo, dạy Toán Cao Cấp cho sinh viên UEH; giữ chữ UEH bình thường | Chốt bởi chủ dự án | 29/07/2026 |
| DEC-005 | Chỉ `luphuc321@gmail.com` là `ADMIN`/owner; mọi tài khoản khác là `STUDENT` | Chốt bởi chủ dự án | 29/07/2026 |
| DEC-006 | UX tham chiếu sự tiện dụng của Coursera/Udemy, không xây kiểu LMS đại học hành chính | Chốt bởi chủ dự án | 29/07/2026 |
| DEC-007 | Nâng cấp có chọn lọc; giữ visual signature hai bìa `K51 · Hai đợt` và `FINAL 2807` bắt chéo trên Home | Chốt bởi chủ dự án | 29/07/2026 |

AI không hỏi lại hoặc tự đảo các quyết định trên trừ khi chủ dự án đưa yêu cầu mới hơn.

---

## 11. Definition of Done toàn dự án

Dự án chỉ hoàn thành khi:

- [ ] Frontend clean build pass.
- [ ] Backend clean start pass.
- [ ] Zero lint error.
- [ ] Test suite và CI pass.
- [ ] Production/staging dùng cùng code contract.
- [ ] Auth không tin client identity/role.
- [ ] Chỉ `luphuc321@gmail.com` có role `ADMIN`.
- [ ] Mọi tài khoản khác có role `STUDENT`.
- [ ] Không tồn tại role management hoặc Admin thứ hai trong scope.
- [ ] OTP `123456` thất bại.
- [ ] Không secret hardcode.
- [ ] PayOS checksum verification bắt buộc.
- [ ] Client không quyết định giá.
- [ ] Return URL không mutate.
- [ ] Order gắn user/course.
- [ ] Payment hợp lệ tạo đúng một Enrollment.
- [ ] Cross-device entitlement/progress hoạt động.
- [ ] Không localStorage unlock.
- [ ] Không refund module/state/UI.
- [ ] Chính sách không hoàn tiền rõ và versioned.
- [ ] Xác nhận chính sách chỉ lưu acknowledgment/version/hash/timestamp, không có dữ liệu hay luồng chữ ký người mua.
- [ ] Paid published course không chứa sample video.
- [ ] Mọi video course, kể cả preview, dùng YouTube Unlisted.
- [ ] Course publish bị chặn nếu thiếu `privacyVerifiedAt`, owner verifier hoặc AuditLog xác nhận Unlisted.
- [ ] YouTube ID của lesson enrolled không nằm trong bundle/catalog public.
- [ ] User chưa enroll không lấy được YouTube ID qua API.
- [ ] UI không tuyên bố YouTube Unlisted là DRM/chống chia sẻ tuyệt đối.
- [ ] Profile chỉ hiển thị enrollment thật.
- [ ] 100% LaTeX parse pass.
- [ ] 7/7 blog article hoạt động.
- [ ] Clean URL/canonical/sitemap nhất quán.
- [ ] Không overflow từ 320px.
- [ ] Core journeys đạt WCAG 2.2 AA.
- [ ] Không icon/copy mang dấu vết AI trang trí.
- [ ] Không số liệu/claim giả.
- [ ] UX tiện và trực tiếp theo mô hình course marketplace; không có tầng hành chính kiểu LMS đại học.
- [ ] Support tạo ticket thật.
- [ ] Có logs, metrics và alert payment/access.
- [ ] Có migration, backup và rollback note.
- [ ] Một course pilot đã qua staged launch.
- [ ] Chủ dự án duyệt visual direction, content, policy và production result.

---

## 12. Lệnh mở đầu cho turn coding tiếp theo

Khi người dùng nói “bắt đầu code”, AI phải bắt đầu bằng:

```text
PHASE 0 / Work package 0.0 và 0.1
```

Thứ tự đầu tiên:

1. Kiểm tra git status.
2. Chạy lại build/lint baseline.
3. Sửa production build.
4. Test clean build.
5. Báo kết quả và tiếp tục hooks/runtime trong cùng Phase 0 nếu không có blocker.

Không bắt đầu redesign, PayOS domain migration hoặc learning experience trước khi repository lấy lại khả năng build/deploy ổn định.
