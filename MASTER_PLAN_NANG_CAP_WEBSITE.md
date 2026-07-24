# MASTER PLAN — Nâng cấp toàn diện website UEH TCC

> **Loại tài liệu:** Implementation brief / design specification / QA contract  
> **Dự án:** `C:\Users\ADMIN\Downloads\WEB_TCC`  
> **Ngày audit:** 24/07/2026  
> **Ngôn ngữ triển khai:** Tiếng Việt; giao diện phải tiếp tục hỗ trợ VI / EN / JA / ZH  
> **Mục đích:** Gửi nguyên file này cho AI hoặc đội phát triển để thiết kế và code theo từng giai đoạn.

---

## 0. Chỉ dẫn bắt buộc cho AI nhận tài liệu

Bạn đang nâng cấp một website đã hoạt động, không xây một landing page mới từ đầu. Trước khi sửa mã:

1. Đọc toàn bộ tài liệu này.
2. Audit lại repository và xác minh mọi đường dẫn, route, API, localStorage key và hành vi hiện tại.
3. Chụp baseline trước khi thay đổi.
4. Triển khai theo từng phase nhỏ, build và kiểm thử sau mỗi phase.
5. Không xóa chức năng chỉ vì giao diện cũ khó tái cấu trúc.
6. Không tự ý đổi framework, router, backend, Firebase, API contract hoặc logic nghiệp vụ.
7. Không tự ý deploy production.
8. Không bịa dữ liệu, testimonial, số lượt xem, quan hệ thương hiệu, chứng nhận, giảng viên, học phí hoặc chính sách pháp lý.
9. Nếu một quyết định cần thông tin từ chủ dự án, phải đánh dấu **Decision required** và dùng giải pháp tạm thời an toàn; không tự suy diễn.
10. Không thực hiện “big-bang rewrite”. Migrate route-by-route và giữ website chạy được sau mỗi commit.

### Kết quả cuối cùng phải đạt

Website cần mang cảm giác của một **Enterprise Editorial Learning Platform**:

- hiện đại, chuyên nghiệp, có độ tin cậy;
- đọc nội dung học thuật dài thoải mái;
- mạnh về toán, thống kê, kinh tế và Quant Finance;
- giao diện thống nhất giữa Home, Courses, Resources, Exams, Blog và Document;
- motion tinh tế như sản phẩm lớn nhưng không làm chậm;
- responsive thực sự từ 320px;
- light/dark, keyboard và screen reader đều dùng được;
- không làm mất nội dung blog, công thức, dữ liệu thi hoặc các flow hiện hữu.

---

## 1. Phạm vi và các ràng buộc không được phá vỡ

### 1.1. Stack hiện tại

- React 19.
- Vite 8.
- React Router 7, đang dùng hash router.
- CSS thuần.
- Firebase cho các flow xác thực.
- KaTeX cho nội dung toán học.
- Backend hiện có các endpoint auth, blog engagement, contact, newsletter, resources và PayOS.

### 1.2. Những thứ phải được bảo toàn

- Các route và deep link đang dùng.
- Nội dung học thuật, công thức, bảng, diagram và trích dẫn.
- Dữ liệu khóa học, đề thi, tài liệu và bài blog.
- Bốn locale VI / EN / JA / ZH.
- Theme light/dark.
- Firebase và backend contract hiện hành, trừ khi có migration riêng được phê duyệt.
- Các localStorage/sessionStorage key đang chứa dữ liệu người dùng; nếu đổi phải có migration.
- Focus mode của trang làm bài.
- Campaign Gift Page.
- Tính năng upload/admin hiện có, nhưng phải sửa bảo mật trước khi mở rộng.

### 1.3. Không làm trong phase giao diện này

- Không migrate sang Next.js, Tailwind, CSS-in-JS hoặc framework UI mới.
- Không chuyển hash router sang browser router nếu chưa có kế hoạch hosting/deep-link riêng.
- Không thêm PINN/DGM hoặc nội dung không liên quan đến mục tiêu sản phẩm.
- Không thay đổi logic tính điểm, dữ liệu đề thi, công thức tài chính hay công thức Quant Finance chỉ để phù hợp layout.
- Không tạo Account Center giả nếu backend chưa hỗ trợ.
- Không dùng cookie banner nếu website không dùng tracking/cookie không thiết yếu.

---

## 2. Kết quả audit hiện trạng

## 2.1. Route hiện có

| Route | Vai trò hiện tại | Shell mong muốn |
|---|---|---|
| `/#/` | Trang chủ | MarketingShell |
| `/#/courses` | Danh sách khóa học + đăng ký | MarketingShell |
| `/#/resources` | Thư viện tài liệu | App/ContentShell |
| `/#/document/:id` | Chi tiết/viewer tài liệu | DocumentShell |
| `/#/exams` | Danh sách đề thi | App/ContentShell |
| `/#/exam/:id` | Làm bài và kết quả | ExamShell, không Navbar/Footer |
| `/#/blog` | Danh sách bài viết | EditorialShell |
| `/#/blog/:slug` | Bài viết chuyên sâu | EditorialShell |
| `/#/payos-api` | Tài liệu PayOS | DeveloperShell hoặc route nội bộ |
| `/#/20-10` | Gift campaign | CampaignShell |
| wildcard | Hiện đang quay về Home | Phải thành NotFound thật |

Backend còn trả HTML độc lập tại:

- `/payment/success`;
- `/payment/cancel`.

Hai màn hình này cũng là một phần của trải nghiệm thương hiệu và phải được thiết kế lại đồng bộ, không bỏ sót.

## 2.2. Điểm tốt nên giữ

- Blog Detail hiện là mặt bằng chất lượng cao nhất của website: tinh thần editorial rõ, layout đọc tốt, TOC, công thức và phân cấp nội dung tương đối chặt.
- Hệ màu nền giấy/ink/forest-teal của blog phù hợp định hướng học thuật.
- Website đã có light/dark, nhiều route chức năng, form, auth và content thật; không cần “trang trí lại” theo kiểu landing page rỗng.
- Focus mode của Exam Detail là hướng đúng.

Blog Detail phải được **đóng băng visual baseline** trước khi refactor. Chỉ tách CSS, sửa accessibility, mobile TOC, performance và bổ sung công cụ đọc; không làm mất chất editorial đang có.

## 2.3. Vấn đề kỹ thuật và thiết kế đã xác minh

### P0 — Responsive đang vỡ thật, không chỉ là nguy cơ

Audit bằng Chrome ở viewport 390×844 cho thấy:

- Home bị tràn ngang; đoạn mô tả, hàng lợi ích và media panel bị cắt bên phải.
- Resources bị vỡ grid nghiêm trọng; tiêu đề và section heading bị ép thành các cột chữ rất hẹp, nội dung nằm ngoài viewport.
- Mobile header chỉ còn logo trong ảnh audit, cần xác minh menu/hamburger, vùng click và stacking.

Yêu cầu: sửa horizontal overflow từ 320px trước khi làm polish. Không che lỗi bằng `overflow-x: hidden`; phải tìm selector gây width/min-width/grid overflow.

### P0 — CSS phân mảnh và rò rỉ

Kết quả kiểm kê:

- khoảng 14 file CSS;
- khoảng 9.620 dòng CSS;
- `Home.css` khoảng 2.100 dòng và đang phục vụ nhiều route không liên quan;
- 244 lần dùng màu hex trực tiếp;
- 91 lần dùng `!important`;
- 24 bộ keyframe;
- 195 lần dùng `border-radius`;
- 79 shadow;
- breakpoint phân tán từ 480 đến 1220px.

`Home.css` được import bởi nhiều trang, kể cả Blog, gây collision. `.form-input` có style global rồi lại bị Navbar override bằng `!important`. Resources dùng một số class kiểu Tailwind dù dự án không có Tailwind.

### P0 — Theme flash khi F5

Theme light được thêm sau khi React mount, trong khi CSS mặc định có thể vẽ dark trước. Điều này gây FOUC/theme flash. Document còn có rule hard-code nền trắng nên dark mode không đồng nhất.

### P0 — Chưa có design system thực sự

Token hiện tại chủ yếu là màu. Chưa có:

- semantic surface;
- spacing scale;
- typography scale;
- container;
- focus ring;
- touch target;
- elevation;
- component state;
- motion duration/easing;
- loading/empty/error pattern.

### P0 — Luồng xác thực và phân quyền có rủi ro

- Navbar đang gánh quá nhiều auth/business logic.
- Có cơ chế mock social user nếu Firebase chưa được cấu hình; production không được giả lập đăng nhập thành công.
- Không được tin `role: Admin`, `uid` hoặc email lấy từ localStorage/client payload để phân quyền.
- Khi Firebase trả `null`, sync backend lỗi hoặc token hết hạn, UI cần xóa session cũ và yêu cầu đăng nhập lại.
- Password rule giữa signup và reset chưa thống nhất.
- Raw Firebase error không được hiển thị trực tiếp.

### P0 — Dead affordance và trust signal giả

- Hero video hiện là ảnh có nút Play nhưng chưa có hành động thật.
- Một số copy/copy-link không có feedback lỗi/thành công.
- Các số `600+`, `12+`, `30+`, `A/A+`, `1,200 lượt xem` đang hard-code. Chỉ giữ nếu có dữ liệu thật; nếu không, thay bằng bằng chứng định tính.
- Related document ngẫu nhiên và số view giả làm giảm độ tin cậy.

### P1 — Hiệu năng tải đầu nặng

- Hầu hết route đang eager-load; chỉ Exam Detail được lazy-load.
- Bundle build audit gần nhất khoảng 1,148 KB JS raw / 349 KB gzip và 156 KB CSS raw / 32 KB gzip.
- Ba bài blog dài được import vào bundle mặc dù Home/Blog Index chỉ cần metadata.
- Navbar eager-load Firebase và nhiều modal.
- `index.html` tải KaTeX CDN + MathJax, trong khi app cũng bundle KaTeX.
- `public` có khoảng 97 asset, tổng dung lượng khoảng 55,8 MB; có ảnh rất lớn.
- Nhiều ảnh chưa có width/height, lazy loading, decode policy hoặc responsive source.
- Reading progress cập nhật React state mỗi scroll trên bài dài.

### P1 — Chất lượng code và routing

- Lint toàn dự án ở lần audit gần nhất còn 43 errors và 2 warnings.
- Wildcard route trả Home thay vì 404.
- Search query chưa thống nhất: Navbar dùng `search`, Resources đọc `q`.
- Footer sử dụng `API_BASE_URL` nhưng chưa thấy import tương ứng.
- Chưa có route announcer, focus manager và scroll restoration thống nhất.
- `safeLazy` có nguy cơ reload loop khi chunk lỗi.
- `html lang` cố định là `vi` dù có bốn locale.

---

## 3. Tầm nhìn thiết kế

## 3.1. Art direction

Tên hướng: **Enterprise Editorial Learning Platform**.

Đặc điểm:

- nền light là porcelain/off-white, không dùng trắng tinh cho toàn trang;
- dark mode là ink/navy sâu, không phải đen tuyệt đối;
- forest-teal là màu thương hiệu chính;
- blue dành cho liên kết kỹ thuật, API và thông tin;
- amber dành cho warning/pending;
- red chỉ dành cho error, destructive hoặc cảnh báo quan trọng;
- gradient, glow và glass chỉ dùng rất tiết chế;
- typography, khoảng trắng, đường kẻ và dữ liệu là yếu tố tạo chất lượng;
- không đóng mọi section vào card;
- công thức, diagram, PDF cover và learning preview là visual chính;
- tránh phong cách “template SaaS” hoặc “landing page AI” với quá nhiều pill, gradient tím và card nổi.

## 3.2. Nguyên tắc trải nghiệm

1. **Nội dung trước trang trí.**
2. **Mỗi màn hình có một hành động chính.**
3. **Motion diễn tả trạng thái, không gây chờ.**
4. **Người dùng luôn biết dữ liệu là live, cached, stale hay lỗi.**
5. **Không có nút giả.**
6. **Không dùng màu làm tín hiệu duy nhất.**
7. **Trạng thái loading/empty/error/offline là một phần của thiết kế, không phải phần vá sau cùng.**
8. **Blog chuyên sâu là chuẩn đọc; các trang còn lại phải đạt cùng độ chặt chẽ.**
9. **Mọi con số tạo trust phải có nguồn.**
10. **Mọi chức năng thu thập dữ liệu cá nhân phải có privacy context.**

---

## 4. Kiến trúc thông tin và navigation

## 4.1. Primary navigation đề xuất

Giữ tối đa năm mục chính:

1. Trang chủ.
2. Khóa học.
3. Học liệu.
4. Luyện thi.
5. Blog.

Không để `Đọc API` và `Quà 20/10` cạnh tranh với product navigation chính.

## 4.2. Secondary navigation

- Giới thiệu.
- Phương pháp/Editorial Standards.
- Hỗ trợ/FAQ.
- Liên hệ.
- Developer/API, nếu được xác định là public.
- Account menu sau đăng nhập.

Gift Page là campaign đặc biệt; truy cập qua link/campaign entry, không phải primary navigation thường trực.

## 4.3. Footer IA

Chia tối đa bốn nhóm:

- Học tập: Khóa học, Học liệu, Luyện thi, Blog.
- Dự án: Giới thiệu, Đội ngũ/Tác giả, Phương pháp, Chính sách nguồn.
- Hỗ trợ: FAQ, Liên hệ, Báo lỗi nội dung/tài liệu.
- Pháp lý: Privacy, Terms, Copyright/Licensing, Academic Integrity, Accessibility.

Newsletter và donation là block phụ, không cạnh tranh với navigation.

## 4.4. Các trang doanh nghiệp cần thiết kế

Các page sau chưa nhất thiết có nội dung pháp lý hoàn chỉnh ngay, nhưng phải có route/surface và được chủ dự án duyệt:

- About / Giới thiệu.
- Team / Author.
- Contact & Support.
- FAQ.
- Editorial Standards.
- Source & Citation Policy.
- Corrections / Update Policy.
- Privacy Policy.
- Terms of Use.
- Copyright & Resource Licensing.
- Academic Integrity.
- Accessibility Statement.
- Refund/Payment Policy nếu có giao dịch thương mại.

**Decision required:** xác minh UEH TCC là dự án chính thức của UEH hay dự án độc lập của sinh viên/cộng đồng. Không được dùng logo, tên, structured data hoặc copy gây hiểu nhầm.

---

## 5. Design system bắt buộc

## 5.1. Token architecture

Tạo các lớp token:

```text
src/styles/
  tokens.css
  reset.css
  theme.css
  typography.css
  layout.css
  motion.css
  utilities.css
```

Phân tầng:

1. **Primitive token:** raw color, spacing, radius, duration.
2. **Semantic token:** canvas, surface, text, border, action, status.
3. **Component token:** button height, input border, card padding.

Không dùng raw hex trong page/component mới trừ asset/data visualization có lý do rõ ràng.

## 5.2. Color system

Phải định nghĩa đủ light/dark:

- `--color-canvas`;
- `--color-canvas-subtle`;
- `--color-surface`;
- `--color-surface-raised`;
- `--color-surface-inverse`;
- `--color-text`;
- `--color-text-muted`;
- `--color-text-subtle`;
- `--color-border`;
- `--color-border-strong`;
- `--color-brand`;
- `--color-brand-hover`;
- `--color-brand-active`;
- `--color-focus`;
- `--color-info`;
- `--color-success`;
- `--color-warning`;
- `--color-danger`;
- các màu `*-surface` và `*-text` tương ứng.

Tất cả pairing quan trọng phải đạt WCAG AA.

## 5.3. Typography

- Heading/brand: Be Vietnam Pro, weight 600 / 700 / 800.
- Body/UI: Inter hoặc Be Vietnam Pro nhưng phải chọn một vai trò rõ; đề xuất Inter cho UI/body.
- Math: KaTeX.
- Code/data: `SFMono-Regular`, `Consolas`, `Liberation Mono`, monospace.
- Không dùng weight 750, 820, 850 nếu font không có file tương ứng.

Đề xuất scale:

| Token | Desktop | Mobile | Line-height |
|---|---:|---:|---:|
| Display XL | clamp(3.5rem, 7vw, 6rem) | tự clamp | 0.98–1.05 |
| Display | clamp(2.75rem, 5vw, 4.5rem) | tự clamp | 1.02–1.10 |
| H1 | clamp(2.25rem, 4vw, 3.5rem) | tự clamp | 1.08–1.15 |
| H2 | clamp(1.75rem, 3vw, 2.5rem) | tự clamp | 1.15–1.25 |
| H3 | 1.35–1.75rem | 1.25–1.5rem | 1.25–1.35 |
| Body reading | 17px | 16px | 1.75–1.9 |
| Body UI | 15–16px | 15–16px | 1.5–1.65 |
| Small/meta | 12–14px | 12–14px | 1.4–1.55 |

Độ dài dòng:

- reading column: 65–75 ký tự;
- form/help text: tối đa khoảng 60–70 ký tự;
- không dùng đoạn body full-width 1180px.

## 5.4. Spacing, container, radius, elevation

Spacing scale:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`.

Container:

- shell: 1280px;
- marketing: 1180px;
- content: 960px;
- reading: 720–760px;
- gutter desktop: 24–32px;
- gutter mobile: 16–20px.

Radius:

- 8px: control nhỏ;
- 12px: input/button/card nhỏ;
- 16px: card;
- 24px: modal/hero panel;
- full: avatar/badge.

Elevation:

- level 0: không shadow;
- level 1: border + shadow rất nhẹ;
- level 2: popover/header;
- level 3: modal/dialog;
- không tạo shadow riêng tùy hứng ở từng page.

## 5.5. Breakpoint và responsive contract

Chuẩn hóa:

- `sm`: 640px;
- `md`: 768px;
- `lg`: 1024px;
- `xl`: 1280px.

Yêu cầu:

- test tối thiểu ở 320, 360, 390, 768, 1024, 1280, 1440px;
- không horizontal scroll ở 320px, trừ table/code/math có container scroll chủ ý;
- container con luôn dùng `min-width: 0`;
- media dùng `max-width: 100%`;
- grid dùng `minmax(0, 1fr)`;
- không dùng width cố định lớn cho text/card trên mobile;
- action bar mobile tôn trọng `env(safe-area-inset-bottom)`;
- dùng `dvh` cho layout theo chiều cao viewport.

## 5.6. Icon và asset

- Dùng một icon system nhất quán, ưu tiên Lucide hiện có.
- Icon decorative phải `aria-hidden`.
- Icon-only button phải có accessible name và vùng chạm tối thiểu 44×44px.
- Không trộn emoji, SVG tự vẽ và icon library trong cùng một nhóm điều khiển nếu không có quy tắc.

Brand asset kit cần có:

- logo mark;
- horizontal wordmark;
- stacked wordmark;
- monochrome;
- dark-background variant;
- favicon 16/32;
- Apple Touch Icon;
- app icon;
- social/OG image 1200×630;
- cover template cho Blog, Course, Document, Exam;
- category color rule;
- image crop/focal point rule;
- placeholder/error image;
- avatar fallback;
- diagram light/dark rule;
- alt-text brief.

Hiện favicon và wordmark chưa đồng bộ; phải sửa theo brand decision đã được xác minh.

---

## 6. Component architecture và state matrix

## 6.1. Cấu trúc đích

```text
src/
  components/
    ui/
      Button/
      IconButton/
      Badge/
      Card/
      Input/
      SearchField/
      Select/
      Textarea/
      Tabs/
      Pagination/
      Modal/
      Drawer/
      Popover/
      Skeleton/
      EmptyState/
      InlineAlert/
      Toast/
    content/
      ArticleCard/
      CourseCard/
      DocumentCard/
      ExamCard/
      FormulaBlock/
      CodeBlock/
      DataTable/
    layout/
      AppShell/
      MarketingShell/
      EditorialShell/
      DocumentShell/
      ExamShell/
      CampaignShell/
      DeveloperShell/
      SiteHeader/
      SiteFooter/
      ContactLauncher/
      PageHero/
      SectionHeader/
      RouteEffects/
      RouteAnnouncer/
      ScrollManager/
    motion/
      AppBootLifecycle/
      PageTransition/
      Reveal/
  contexts/
    AuthContext/
    LanguageContext/
    ThemeContext/
  hooks/
    useReducedMotion.js
    useScrollRestoration.js
    usePreloadOnIntent.js
    useSafeStorage.js
```

Không cần tạo abstraction chỉ để “đẹp cấu trúc”; component chung chỉ được tạo khi có ít nhất hai nơi dùng hoặc khi nó quản lý accessibility/state phức tạp.

## 6.2. Primitive bắt buộc

- Button, LinkButton, IconButton.
- Badge, Tag, StatusPill.
- Input, SearchField, Select, Textarea, Checkbox, RadioGroup.
- Card/Surface.
- Tabs.
- Pagination.
- FilterBar.
- Modal.
- Drawer.
- Popover/Menu.
- Skeleton.
- EmptyState.
- InlineAlert.
- Toast.
- Tooltip.
- Spinner chỉ cho action ngắn; không dùng spinner full-screen thay skeleton.

## 6.3. State matrix chung

Mỗi interactive component phải có:

- default;
- hover;
- active/pressed;
- focus-visible;
- disabled;
- loading;
- success khi phù hợp;
- warning;
- error;
- high-contrast/forced-colors;
- reduced-motion;
- light/dark.

Mỗi data surface phải có:

- initial;
- loading;
- success;
- empty;
- filtered-empty;
- stale-cache;
- offline;
- partial;
- permission denied;
- not found;
- server error;
- retrying.

## 6.4. Modal/Drawer contract

Tất cả modal/drawer:

- dùng semantic dialog;
- có title được liên kết;
- focus trap;
- focus ban đầu hợp lý;
- Escape để đóng, trừ destructive confirmation đang xử lý;
- trả focus về trigger;
- khóa body scroll;
- click outside theo rule nhất quán;
- không mất dữ liệu form khi click nhầm;
- cảnh báo unsaved changes;
- mobile dùng full-height drawer/bottom sheet khi hợp lý;
- tôn trọng safe-area và keyboard ảo.

---

## 7. Hiệu ứng mở trang/F5 và route transition

## 7.1. Mục tiêu

Tạo cảm giác mở trang chỉn chu như sản phẩm lớn, nhưng không biến thành fake loading screen.

Phân biệt:

- **Hard load/F5:** brand reveal một lần.
- **SPA navigation:** route transition ngắn.
- **BFCache/back-forward:** không chạy lại boot overlay.
- **Data loading:** dùng skeleton tại khu vực dữ liệu, không giữ overlay.

## 7.2. Theme pre-paint

Trong `<head>`, trước CSS/React paint:

1. đọc theme từ safe localStorage;
2. fallback theo `prefers-color-scheme`;
3. gán `data-theme` hoặc class vào `document.documentElement`;
4. cập nhật `color-scheme` và `theme-color`;
5. nếu storage bị chặn, không crash.

Mục tiêu: không flash dark-to-light hoặc light-to-dark khi F5.

## 7.3. Boot reveal specification

Boot overlay là HTML tối thiểu nằm ngoài React root để xuất hiện ngay.

Timeline danh nghĩa:

- 0–100ms: paint nền đúng theme.
- 100–350ms: wordmark/mark fade in, tracking rất nhẹ.
- 250–550ms: hairline progress hoặc line reveal.
- 500–750ms: wordmark dịch 6–8px và fade.
- 550–850ms: curtain mở bằng opacity/transform/clip-path.

Giới hạn:

- thời lượng mục tiêu 550–700ms;
- hard maximum 1.2–1.5s bằng watchdog;
- không chờ API, Firebase, font hoặc ảnh;
- root thật render phía sau, không trì hoãn LCP;
- overlay `aria-hidden`, không nhận focus;
- sau animation phải remove khỏi DOM;
- chỉ animate opacity, transform và clip-path;
- reduced-motion: bỏ chuyển động hoặc crossfade dưới khoảng 100ms;
- không phát lại khi điều hướng nội bộ;
- không phát lại khi page khôi phục từ BFCache.

Kết thúc overlay sau khi app commit và qua hai `requestAnimationFrame`, đồng thời có watchdog.

## 7.4. Route transition

- Chỉ animate vùng `<main>`, header/footer đứng yên.
- Exit: 120–160ms.
- Enter: 180–240ms.
- Translate tối đa 6–10px.
- Không chạy transition khi chỉ đổi query/filter/anchor.
- Exam/Gift có shell riêng; Exam nên dùng transition rất nhẹ hoặc không dùng.
- Feature-detect View Transitions API; có CSS fallback.
- `prefers-reduced-motion` tắt translate/stagger.

## 7.5. Route effects

Sau navigation:

- PUSH: scroll top, trừ anchor.
- POP/back-forward: phục hồi vị trí.
- Anchor: scroll đúng section với offset header.
- Focus tới `<main>` hoặc H1 bằng focus programmatic không gây outline vô lý.
- Route announcer thông báo title mới qua live region.
- Preload route trên `pointerenter`, `focus` và `touchstart` có kiểm soát.

---

## 8. Thiết kế chi tiết theo route

## 8.1. App shell / Header

Desktop:

- chiều cao 68–72px;
- sticky;
- background solid hoặc translucency nhẹ, không blur quá mạnh;
- primary nav rõ hierarchy;
- active state bằng underline/indicator, có `aria-current="page"`;
- active state phải nhận route con, ví dụ `/blog/:slug`.

Tablet:

- không ép bảy link vào một hàng;
- dùng hierarchy hoặc menu “Thêm” trước khi chuyển hoàn toàn sang drawer.

Mobile:

- logo + menu + một action quan trọng;
- drawer có focus trap, body lock, Escape, focus return;
- tất cả target ≥44px;
- không bị mất hamburger như ảnh audit;
- không che nội dung bởi fixed header.

Tách Navbar hiện tại thành:

- SiteHeader;
- PrimaryNavigation;
- SearchTrigger;
- ThemeToggle;
- LanguageMenu;
- AccountMenu;
- AuthController đặt trong context/service;
- modal lazy-loaded.

## 8.2. Trang chủ

### Hero

- Một value proposition rõ.
- Một primary CTA và một secondary CTA.
- Chỉ dùng trust proof có nguồn thật.
- Hero title dùng `clamp`, không cố định 6.2rem.
- Text và CTA không tràn ở 320–390px.
- Media panel:
  - hoặc product/learning preview tĩnh;
  - hoặc video thật có modal, caption và transcript.
- Nếu không có video thật, bỏ icon Play.

### Cấu trúc nội dung

1. Hero.
2. Trust/value strip nhẹ.
3. Ba lối vào chính: Học, Luyện, Nghiên cứu.
4. Learning path dạng timeline.
5. Featured resources.
6. Featured exams.
7. Editorial/Blog preview.
8. CTA cuối trang.

Không đóng tất cả block vào card. Dùng section rhythm, typography và đường kẻ.

### Floating action

Ba nút Zalo/chat/Telegram và tab đăng ký tư vấn hiện tạo nhiều màu cạnh tranh. Gom thành một `ContactLauncher`:

- trigger duy nhất;
- mở panel các kênh;
- không che CTA;
- safe-area mobile;
- có label và keyboard support.

## 8.3. Courses Index

- Hero ngắn, tập trung mục tiêu học.
- Catalog có filter/sort theo level, chủ đề, trạng thái.
- Card có cover ratio, level, outcomes ngắn, số bài, thời lượng, trạng thái truy cập.
- CTA card truyền đúng `courseId` vào form; không chỉ nhảy chung tới `#enroll`.
- CTA màu brand; không dùng red nếu không phải danger.
- Enrollment summary sticky desktop; drawer/bottom sheet mobile.
- Form giữ dữ liệu sau lỗi.

### Course Detail — route đề xuất

Hiện chưa có route riêng. Thiết kế trước:

- overview;
- learning outcomes;
- đối tượng phù hợp;
- prerequisites;
- syllabus accordion;
- sample lesson;
- instructor/author có nguồn;
- lịch học/hình thức;
- giá/quyền truy cập nếu có;
- FAQ;
- testimonial chỉ khi có nguồn;
- sticky enrollment CTA.

**Decision required:** chỉ tạo route và dữ liệu thực khi chủ dự án xác nhận model khóa học.

## 8.4. Lead/Consultation Form

- Label thật, không dựa vào placeholder/mad-libs.
- Ít nhất một trong phone/email; thêm preferred contact method.
- Inline error + error summary.
- Focus vào lỗi đầu tiên.
- Privacy consent/link.
- Loading/disable chống double submit.
- Duplicate/rate-limit/offline/server-validation.
- Retry không mất dữ liệu.
- Success có next step và thời gian phản hồi dự kiến.
- Anti-spam phù hợp.

Form hiện dùng `mailto:` phải chuyển sang pipeline thật hoặc giải thích rõ giới hạn; không giả success.

## 8.5. Resources

Đây là route P0 về responsive vì ảnh audit 390px đang vỡ nặng.

### Layout

- Search là hành động chính.
- Filter bar sticky sau hero.
- Tabs semantic, scroll ngang chủ ý trên mobile.
- Grid/list dùng cùng data model.
- Result heading có count.
- Sort, clear all và pagination chung.
- Fix utility class không tồn tại.

### URL state

Thống nhất query key, đề xuất:

```text
?q=&category=&sort=&view=&page=
```

- validate và clamp query;
- back/forward hoạt động;
- share URL giữ đúng filter;
- sau filter/page: focus result heading, announce count;
- view toggle dùng `aria-pressed` hoặc radiogroup.

### Data state

Phân biệt rõ:

- đang tải;
- thư viện chưa có dữ liệu;
- không có kết quả filter;
- mất kết nối;
- server lỗi;
- đang dùng local fallback/stale data.

Nếu dùng fallback local, hiển thị banner “Dữ liệu cục bộ, có thể đã cũ”, timestamp và Retry.

## 8.6. Document Detail / Viewer

- DocumentShell tập trung đọc.
- Sidebar metadata có thể collapse.
- Toolbar: Download, Open external, Fullscreen, Report issue.
- Mobile: preview + action rõ, không cố nhét viewer desktop.
- Viewer height dùng `dvh`.
- Loading skeleton.
- PDF missing/404, corrupt, iframe blocked, unsupported browser, timeout và retry.
- Luôn có external/download fallback.
- Abort request cũ khi đổi `id`.
- Related documents phải theo logic thật; có empty state.
- Không dùng related random.
- Không dùng view count hard-code.

Metadata nên có:

- title;
- author/source;
- subject/category;
- page count;
- file type;
- file size;
- license;
- version;
- published/updated date thật;
- freshness/stale label;
- report issue;
- version history nếu có.

## 8.7. Exams Index

- Card thể hiện tên đề, môn/chủ đề, nguồn, số câu, thời gian, độ khó, trạng thái.
- Filter/search/sort rõ.
- Resume badge nếu có session.
- Empty/loading/error/offline state.
- Không mở nhầm một đề mặc định khi ID không hợp lệ.

## 8.8. Exam Lobby

Timer không được chạy ngay khi component mount.

Lobby phải có:

- tên và nguồn đề;
- số câu;
- thời gian;
- quy định;
- autosave policy;
- yêu cầu thiết bị;
- trạng thái session cũ;
- Start / Resume / Restart / Discard.

## 8.9. Exam Session

- Giữ focus mode, không Navbar/Footer.
- Timer dựa trên deadline timestamp, không chỉ decrement state mỗi giây.
- Re-sync khi tab visibility thay đổi hoặc máy sleep.
- Không announce timer mỗi giây; chỉ announce mốc 10 phút, 5 phút, 1 phút và hết giờ.
- Autosave indicator: Đang lưu / Đã lưu / Không thể lưu.
- Session schema version + exam version.
- Xử lý storage blocked/quota/private mode.
- Xử lý đề thay đổi, nhiều tab, session submitted.
- Answer dùng fieldset/legend + radio/radiogroup.
- Question palette có accessible name và `aria-current`.
- Trạng thái answered/current/flagged/correct/wrong có icon/text, không chỉ màu.
- Review row là button/link, không phải div click-only.
- Retake/reset có confirm.
- Auto-submit có submitting/submitted/failed state.
- Mobile có palette drawer và action bar safe-area.

## 8.10. Exam Result

- Điểm số và thời gian hoàn thành.
- Tách correct / incorrect / skipped.
- Performance theo chủ đề nếu data có.
- Filter đúng/sai/bỏ qua.
- Xem câu sai.
- Quay lại danh sách.
- Làm lại có confirm.
- Print/download result.
- Nếu sync backend: pending/success/failure.

## 8.11. Blog Index

- Hero editorial, không quá cao.
- Featured article mạnh.
- Category/series filter.
- Search.
- Estimated reading time.
- Card image ratio cố định.
- Title clamp.
- Pagination chung.
- Query/filter/page nằm trong URL.
- Empty state có Clear search.
- Nếu bài chưa dịch, hiển thị “Nội dung hiện chỉ có tiếng Việt”.

Khoảng trắng desktop cần cân bằng; ảnh audit cho thấy vùng trống lớn giữa search và featured article.

## 8.12. Blog Detail

Giữ visual hiện tại làm chuẩn, sau đó:

- tách khỏi `Home.css`;
- tách article token riêng;
- mobile TOC thành drawer/collapsible;
- toolbar Share, Bookmark, Print, Copy citation;
- author/reviewer box;
- published/updated date;
- editorial status/disclosure;
- change log;
- reading progress tối ưu bằng CSS/DOM/rAF, không re-render toàn article mỗi scroll;
- scroll listener passive/rAF;
- clipboard có success/failure/fallback;
- slug sai trả NotFound thật và `noindex`.

### Article content component

- Table có caption, header scope, overflow cue.
- Code block có copy success/error và wrap/scroll.
- Formula rộng có scroll container rõ.
- Citation external báo mở tab mới.
- Diagram có alt/description.
- Print CSS tốt.
- Tất cả UI string/ARIA/tooltip đưa vào translation catalog.

## 8.13. Blog Engagement / Community

Thiết kế:

- reaction;
- like;
- comments;
- reply;
- edit/delete comment của chính mình;
- report abuse;
- community guideline;
- pending moderation;
- rejected/removed;
- rate-limited;
- pagination/load more;
- zero comments;
- auth required;
- offline.

Optimistic update phải:

- chống double-click/race;
- rollback khi server lỗi;
- thông báo rõ.

Nếu tuyên bố “sẽ đồng bộ khi online”, phải có outbox thật:

`queued → sending → sent / failed → retry / delete`.

Nếu không triển khai outbox, bỏ lời hứa và rollback optimistic item.

## 8.14. Search toàn site

Không chỉ là một input + suggestion tĩnh.

Thiết kế command/search experience:

- Courses;
- Documents;
- Exams;
- Blog;
- recent searches;
- popular queries nếu có dữ liệu;
- keyboard navigation;
- loading;
- empty;
- offline;
- error;
- “xem tất cả”;
- clear history;
- Escape/outside click/focus return.

Thống nhất search query giữa Navbar và Resources.

## 8.15. Auth

Tạo Auth state machine:

```text
initializing
anonymous
authenticated
syncing
offline-stale
expired
forbidden
```

Trong lúc initializing không flash Login rồi đổi sang profile.

Các mode:

- login;
- signup;
- forgot password;
- reset password;
- social OAuth;
- phone/email OTP nếu thật sự hỗ trợ;
- session expired;
- recovery complete.

Yêu cầu:

- loading/disable chống double-submit cho mọi provider;
- password show/hide, strength/help, Caps Lock;
- autocomplete đúng;
- terms/privacy checkbox khi cần;
- OTP sáu ô, countdown, resend cooldown, attempts, expired, rate limit;
- đổi email/phone;
- OAuth: popup blocked, closed, network error, provider disabled, account conflict, backend sync error;
- map Firebase error code sang copy an toàn và đủ bốn locale;
- không hiển thị raw error;
- không mock login success;
- không dùng copy “bảo mật tuyệt đối”;
- xóa session cũ khi auth null/token expired/disabled;
- Admin lấy từ verified claims/session/backend.

Phone OTP đang có UI nhưng không có trigger rõ: hoặc nối flow thật, hoặc xóa dead UI sau khi chủ dự án xác nhận.

## 8.16. Account Center — thiết kế dự phòng

Sau đăng nhập, hiện mới có lời chào và logout. Thiết kế IA tương lai:

- profile;
- saved resources;
- course interest/enrollment;
- exam history/result;
- language/theme;
- security;
- sign out.

**Decision required:** không code dữ liệu/account feature chưa có backend. Có thể chỉ tách AccountMenu sạch và chuẩn bị route contract.

## 8.17. Admin Upload / Content Management

Trước hết quyết định:

1. **Metadata-only:** đổi tên đúng chức năng, nhập URL/file name, preview và validate.
2. **Upload thật:** file picker, drag/drop, progress, cancel, size/type limit, validation.

Workflow cần có:

- permission verifying;
- 401/403;
- metadata;
- cover/PDF preview;
- draft/publish;
- duplicate 409;
- file too large 413;
- invalid URL/file;
- upload progress;
- partial failure;
- offline/retry;
- unsaved changes;
- success action;
- version replacement.

Không `window.location.reload()` sau success. Update cache/list và toast.

Không gửi `adminRole`, `uid`, `email` từ client như bằng chứng phân quyền. API phải tự xác minh.

## 8.18. PayOS / Developer route

**Decision required:** `/payos-api` là tài liệu public hay công cụ nội bộ.

Nếu nội bộ:

- route guard;
- verify-session skeleton;
- 401;
- 403;
- session expired;
- CTA login/back;
- `noindex`.

Nếu public:

- security review trước khi công khai confirm-webhook hoặc operational token;
- version;
- environment badge Local/Staging/Production;
- auth requirement;
- request/response/error schema;
- redacted example;
- idempotency;
- webhook signature/retry;
- rate limit;
- changelog;
- API status.

DeveloperShell:

- sidebar endpoint;
- code tabs;
- copy success/failure qua live region;
- select-text fallback khi clipboard bị từ chối;
- responsive code table;
- locale rule rõ ràng.

## 8.19. Payment states

Thiết kế đồng bộ các trạng thái:

- creating payment;
- redirecting;
- pending;
- success;
- cancel;
- failed;
- expired;
- duplicate/idempotent;
- status unknown;
- retry/check status.

Hai HTML backend `/payment/success` và `/payment/cancel` hiện có visual riêng. Chuyển thành:

- template dùng brand token chung; hoặc
- frontend route được backend redirect an toàn.

Không đổi payment/webhook logic nếu chưa được test. Không hiển thị dữ liệu nhạy cảm.

Success page:

- icon + heading;
- transaction summary đã redacted;
- next step;
- về Home/Khóa học;
- contact support;
- receipt/reference nếu có thật.

Cancel/failed:

- giải thích không quy kết lỗi người dùng;
- thử lại;
- kiểm tra trạng thái;
- support;
- không tạo charge lặp.

## 8.20. Gift Page

Giữ art direction campaign riêng nhưng dùng reset/accessibility/motion token chung.

- Rose và letter trigger phải là button.
- Popup là dialog thật.
- Keyboard/touch đầy đủ.
- Full text tĩnh cho screen reader.
- Nút Skip/Hiện toàn bộ.
- Reduced motion: hiện nội dung ngay, thay/ẩn GIF động.
- Cleanup đầy đủ timer khi close/unmount.
- Decorative heart/SVG/GIF `aria-hidden` hoặc alt rỗng.
- Scroll được ở màn hình thấp/landscape.
- Safe-area.
- Campaign locale rule rõ ràng.

---

## 9. Global states và system feedback

## 9.1. Page/system surfaces bắt buộc

- 404 Not Found.
- 403 Permission Denied.
- 401 / Session Expired.
- Generic Error.
- Route/chunk error.
- Offline.
- Reconnected.
- Maintenance nếu có nhu cầu vận hành.
- Empty.
- Filtered Empty.
- Loading/Skeleton.
- Partial/Stale.

Router cần `errorElement` riêng ngoài React ErrorBoundary:

- Retry;
- Home;
- copy mã lỗi an toàn;
- không blank screen;
- không reload loop.

## 9.2. Toast và inline feedback

Chuẩn hóa:

- copied;
- clipboard denied;
- saved;
- downloaded;
- submitted;
- failed;
- offline;
- reconnected;
- session expired;
- permission denied.

Rule:

- `role=status` cho thông tin;
- `role=alert` cho lỗi cần chú ý;
- không chỉ đổi màu;
- không tự biến mất quá nhanh với thông báo dài;
- action “Retry/Undo” phải keyboard-accessible.

## 9.3. Offline/freshness

- Global Offline/Reconnected banner.
- Route dùng local cache phải hiển thị freshness.
- Route cần server phải có Retry.
- Không hứa sync offline nếu chưa có queue.
- Storage access luôn qua safe wrapper; quota/block không làm app crash.

---

## 10. Accessibility

Mức mục tiêu: WCAG 2.2 AA cho các flow chính.

Checklist:

- skip link;
- landmark header/nav/main/footer;
- một H1 hợp lý mỗi route;
- heading hierarchy;
- focus-visible rõ;
- keyboard-only;
- touch target ≥44px;
- contrast AA;
- không dùng màu là tín hiệu duy nhất;
- modal/drawer focus trap;
- menu keyboard pattern;
- tabs semantic;
- form label/help/error liên kết bằng `aria-describedby`;
- error summary;
- live region có kiểm soát;
- ảnh có alt đúng vai trò;
- decorative image alt rỗng;
- table caption/header scope;
- math có text/fallback phù hợp;
- code/table/formula scroll có cue;
- 200% zoom không mất nội dung;
- Windows High Contrast/forced-colors;
- screen reader smoke test;
- reduced motion toàn cục;
- print styles.

Không announce timer mỗi giây, typing animation từng ký tự hoặc reading progress liên tục.

---

## 11. Đa ngôn ngữ

Website phải tiếp tục hỗ trợ VI / EN / JA / ZH, không chỉ đổi label Navbar.

Đưa vào translation catalog:

- Auth;
- Upload;
- Search;
- PayOS;
- Blog Engagement;
- ArticleBlock;
- modal;
- toast;
- error/loading/empty/offline;
- ARIA label;
- tooltip/title;
- alt;
- diagram label.

Yêu cầu:

- cập nhật `html lang`;
- dùng `Intl.DateTimeFormat`;
- dùng `Intl.NumberFormat`;
- plural rules theo locale;
- không hard-code `vi-VN` cho mọi ngôn ngữ;
- đổi locale không reset form/exam/modal state;
- fallback khi thiếu key;
- pseudo-locale/chuỗi dài;
- test typography CJK;
- nếu content chưa dịch, hiển thị badge ngôn ngữ rõ;
- không tạo trải nghiệm “chrome tiếng Anh, bài viết tiếng Việt” mà không giải thích.

---

## 12. SEO, metadata và độ tin cậy

## 12.1. Page metadata

Mỗi route cần:

- title;
- description;
- canonical;
- robots;
- Open Graph;
- Twitter Card;
- share image.

Thêm:

- `robots.txt`;
- sitemap;
- web manifest;
- theme-color light/dark;
- favicon/app icon;
- hreflang chỉ khi content thực sự có bản dịch.

## 12.2. Structured data

Có thể dùng khi dữ liệu đúng:

- `WebSite`;
- `BreadcrumbList`;
- `Article`;
- `Course`;
- `FAQPage`.

Chỉ dùng `EducationalOrganization` nếu quan hệ thương hiệu được xác minh.

## 12.3. Editorial trust

Thiết kế:

- author;
- reviewer;
- source;
- citation;
- published/updated;
- editorial status;
- correction policy;
- change log;
- report issue.

Không dùng badge “Đã kiểm chứng nguồn” nếu không có quy trình và người chịu trách nhiệm cụ thể.

## 12.4. Indexing decisions

Quyết định `noindex` cho:

- Gift Page;
- PayOS/internal docs;
- auth states;
- admin;
- payment result;
- error route;
- duplicate/filter pages nếu cần.

---

## 13. Performance plan

## 13.1. Budget

Mục tiêu trên cấu hình test thống nhất:

- LCP ≤2.5s, target nội bộ khoảng 2.0s.
- INP ≤200ms.
- CLS ≤0.1.
- Boot reveal danh nghĩa ≤700ms và không block nội dung quá 1s.
- Initial JS gzip mục tiêu 180–220 KB nếu khả thi sau splitting.
- Không có long task đáng kể do route bootstrap.

## 13.2. Route and code splitting

- Lazy-load toàn bộ route phụ.
- Lazy-load auth/search/upload/contact modal.
- Không import Firebase vào initial Navbar path nếu chưa cần.
- Preload trên intent.
- Error boundary riêng cho lazy chunk.
- `safeLazy` chỉ auto-reload tối đa một lần qua session flag; sau đó hiện recovery UI.

## 13.3. Content splitting

- Tách blog metadata khỏi full article body.
- Home/Blog Index chỉ import title, slug, excerpt, cover, category, date, read time.
- Full article chỉ load khi vào slug.
- Nếu cần, mỗi article thành module lazy riêng.

## 13.4. Math

- Chọn một engine chính.
- Đề xuất bundle KaTeX đang dùng.
- Bỏ CDN KaTeX/MathJax trùng nếu không có use case bắt buộc.
- Load math CSS/font có chiến lược tránh CLS.
- Test công thức dài ở mobile và print.

## 13.5. Image/media

- Audit 55,8 MB asset.
- Resize ảnh nguồn quá lớn.
- Dùng AVIF/WebP khi phù hợp.
- `srcset`/`sizes` cho responsive.
- width/height hoặc aspect-ratio để tránh CLS.
- Hero LCP dùng `fetchpriority=high` khi đúng.
- Below-fold dùng `loading=lazy`.
- `decoding=async`.
- Không lazy-load ảnh LCP.
- Thumbnail/cover theo template.
- Error fallback.
- Không tải GIF động trong reduced-motion nếu có bản tĩnh.

## 13.6. Scroll/render

- Scroll listener passive.
- Dùng rAF hoặc CSS scroll-driven progress khi hỗ trợ.
- Không set React state mỗi pixel scroll trên article dài.
- Virtualize chỉ khi danh sách thật sự lớn; không thêm complexity sớm.

## 13.7. Fonts

- Chỉ tải family/weight thực sự dùng.
- Preconnect/preload có chọn lọc.
- Xem xét self-host nếu phù hợp.
- `font-display` hợp lý.
- Không dùng fake font weight.

---

## 14. Kế hoạch refactor CSS an toàn

Không xóa `Home.css` một lần.

Trình tự:

1. Tạo token mới.
2. Map alias token cũ → token mới.
3. Tạo reset/layout/typography/motion.
4. Tạo primitive.
5. Migrate một route.
6. Visual regression.
7. Xóa selector legacy chỉ khi không còn consumer.
8. Lặp lại.

Mục tiêu:

- `Home.css` chỉ còn Home hoặc được tách hoàn toàn;
- Blog Detail không import Home.css;
- selector component được scope;
- không còn utility giả;
- giảm mạnh `!important`;
- raw color chỉ còn ngoại lệ;
- breakpoint về bộ chuẩn;
- keyframe trùng được gộp;
- global transition `!important` bị loại bỏ.

---

## 15. Lộ trình triển khai

## Phase 0 — Baseline và safety

- [ ] Tạo feature branch.
- [ ] Ghi git status, không đụng thay đổi ngoài scope.
- [ ] Build/lint/test baseline.
- [ ] Chụp mọi route ở 320/390/768/1024/1440.
- [ ] Chụp light/dark.
- [ ] Ghi console/network.
- [ ] Lập route/flow inventory.
- [ ] Đóng băng Blog Detail visual baseline.
- [ ] Xác minh API/localStorage/Firebase contract.
- [ ] Thêm checklist quyết định sản phẩm.

## Phase 1 — Stability và security foundation

- [ ] Sửa query search mismatch.
- [ ] Sửa Footer `API_BASE_URL`.
- [ ] Tạo NotFound.
- [ ] Tạo router error element + ErrorBoundary.
- [ ] Sửa safeLazy reload loop.
- [ ] Safe storage wrapper.
- [ ] Auth state machine.
- [ ] Xóa mock production login.
- [ ] Server-verified admin authorization.
- [ ] Sửa session null/expired flow.
- [ ] Thống nhất password rule và error mapping.
- [ ] Fix P0 overflow Home/Resources.

## Phase 2 — Theme, tokens và primitives

- [ ] Theme pre-paint.
- [ ] Token light/dark.
- [ ] Typography/layout/motion.
- [ ] Breakpoint chuẩn.
- [ ] Focus/touch/reduced-motion.
- [ ] Button/Input/Badge/Card.
- [ ] Modal/Drawer/Popover.
- [ ] Tabs/Pagination/Filter.
- [ ] Skeleton/Empty/Alert/Toast.
- [ ] Story/demo route hoặc isolated showcase cho component state.

## Phase 3 — App shell và lifecycle

- [ ] SiteHeader mới.
- [ ] Navigation hierarchy.
- [ ] SiteFooter mới.
- [ ] ContactLauncher.
- [ ] Context tách khỏi Navbar.
- [ ] Boot reveal.
- [ ] Route transition.
- [ ] Scroll restoration.
- [ ] Focus manager.
- [ ] Route announcer.
- [ ] Lazy route/modal.

## Phase 4 — Core public routes

Thứ tự:

1. Home.
2. Blog Index.
3. Courses.
4. Resources.
5. Exams Index.

Sau mỗi route:

- build;
- lint phạm vi;
- desktop/mobile screenshot;
- light/dark;
- keyboard;
- console;
- no overflow.

## Phase 5 — Deep content/product routes

1. Blog Detail.
2. Document Detail.
3. Exam Lobby.
4. Exam Session.
5. Exam Result.
6. Search.

## Phase 6 — Auth, admin và transactional

1. Auth modal/state.
2. Account menu.
3. Upload/content management.
4. Consultation/newsletter.
5. PayOS/DeveloperShell.
6. Payment success/cancel/failure.

## Phase 7 — Campaign và enterprise surfaces

1. Gift accessibility/motion.
2. About/Team/Editorial.
3. Support/FAQ.
4. Legal placeholders + owner review.
5. Brand asset kit.
6. SEO/social/structured data.

## Phase 8 — Performance và cleanup

- [ ] Route/content splitting.
- [ ] Firebase/modal lazy.
- [ ] KaTeX cleanup.
- [ ] Image pipeline.
- [ ] Font cleanup.
- [ ] Scroll performance.
- [ ] CSS legacy removal.
- [ ] Dead code/dead affordance cleanup.
- [ ] Bundle analysis.

## Phase 9 — Final QA và handoff

- [ ] Full route/state matrix.
- [ ] Visual regression.
- [ ] Accessibility.
- [ ] i18n.
- [ ] Performance.
- [ ] Security smoke review.
- [ ] Payment/auth/admin regression.
- [ ] Content integrity.
- [ ] Documentation.
- [ ] Changelog.
- [ ] Owner approval trước deploy.

---

## 16. QA matrix

## 16.1. Viewport

Test:

- 320×568;
- 360×800;
- 390×844;
- 768×1024;
- 1024×768;
- 1280×800;
- 1440×900;
- mobile landscape.

## 16.2. Appearance

- light;
- dark;
- system theme;
- theme đổi khi app đang mở;
- hard refresh;
- reduced motion;
- forced colors/high contrast;
- 200% zoom;
- print.

## 16.3. Input

- mouse;
- keyboard only;
- touch only;
- screen reader smoke test;
- clipboard allowed/denied;
- popup allowed/blocked.

## 16.4. Network/data

- fast;
- slow;
- offline;
- timeout;
- stale cache;
- empty;
- partial;
- 401;
- 403;
- 404;
- 409;
- 413;
- 429;
- 500;
- malformed response;
- chunk load error;
- PDF corrupt/missing;
- image error.

## 16.5. Content extremes

- title rất dài;
- CJK;
- chuỗi không có khoảng trắng;
- 0 / 1 / 100+ result;
- comment dài;
- table nhiều cột;
- code line dài;
- formula rất rộng;
- PDF tên dài;
- file size/date thiếu;
- avatar/cover thiếu;
- locale key thiếu.

## 16.6. Critical flows

- đăng ký/đăng nhập/đăng xuất;
- forgot/reset;
- OAuth errors;
- OTP nếu giữ;
- admin permission;
- upload duplicate/large/offline;
- course lead;
- newsletter duplicate;
- resource search/filter/back;
- document open/download/failure;
- exam start/resume/autosave/timeout/submit/result/retake;
- blog reaction/comment offline/error;
- payment pending/success/cancel/failed;
- theme/language persistence;
- F5 boot;
- back/forward scroll restore.

---

## 17. Definition of Done

Một phase/route chỉ hoàn thành khi:

- [ ] Chức năng hiện tại không bị mất.
- [ ] Không console error.
- [ ] Build pass.
- [ ] Lint phần thay đổi pass; lỗi legacy được ghi riêng.
- [ ] Không horizontal overflow từ 320px.
- [ ] Light/dark parity.
- [ ] Keyboard sử dụng được.
- [ ] Focus rõ và hợp lý.
- [ ] Touch target đạt 44px.
- [ ] Loading/empty/error/offline đã có.
- [ ] VI/EN/JA/ZH không vỡ layout.
- [ ] Reduced motion hoạt động.
- [ ] Không có dead button.
- [ ] Không bịa dữ liệu/trust signal.
- [ ] Screenshot regression đã so sánh.
- [ ] Performance không tệ hơn baseline ngoài budget đã phê duyệt.
- [ ] Có commit nhỏ, message rõ.

Toàn dự án chỉ hoàn thành khi:

- [ ] F5 không theme flash.
- [ ] Boot reveal không gây chờ giả.
- [ ] Route transition ổn định.
- [ ] 404/error/offline đầy đủ.
- [ ] Auth/admin không tin client role.
- [ ] Exam không mất session.
- [ ] Payment state đồng bộ thương hiệu.
- [ ] Blog học thuật giữ nguyên chất lượng nội dung.
- [ ] CSS legacy giảm đáng kể, `!important` chỉ là ngoại lệ.
- [ ] Core Web Vitals đạt budget mục tiêu.
- [ ] Accessibility smoke test hoàn tất.
- [ ] Chủ dự án duyệt brand/legal/PayOS decision.

---

## 18. Các quyết định phải hỏi chủ dự án

Không được tự quyết các mục sau:

1. UEH TCC là dự án chính thức của UEH hay dự án độc lập?
2. Số liệu Home và view count có nguồn analytics thật không?
3. Hero có video thật không?
4. Khóa học có Course Detail, học phí, enrollment và account progress thật không?
5. `/payos-api` public hay internal?
6. Upload là metadata-only hay upload file thật?
7. Blog/content có bản dịch đầy đủ hay chỉ UI có bốn ngôn ngữ?
8. Có cần Account Center trong phase này không?
9. Có tracking/cookie không thiết yếu không?
10. Ai duyệt Privacy/Terms/Refund/Copyright/Editorial copy?
11. Payment result nên giữ backend HTML hay redirect frontend?
12. Gift Page còn là campaign public hay archival/noindex?

Trong khi chờ quyết định:

- giữ chức năng hiện tại;
- không công khai thêm dữ liệu nhạy cảm;
- không tạo copy khẳng định;
- đánh dấu TODO rõ;
- dùng component/layout có thể mở rộng sau.

---

## 19. Handoff artifacts phải bàn giao

AI/đội phát triển sau khi hoàn tất cần bàn giao:

- design token documentation;
- component inventory + state matrix;
- route/shell map;
- before/after screenshots;
- accessibility checklist;
- i18n coverage report;
- performance/bundle report;
- content/asset manifest;
- API/auth/payment regression notes;
- list quyết định owner còn mở;
- migration notes;
- changelog theo phase;
- hướng dẫn rollback;
- hướng dẫn chạy/build/test;
- danh sách file legacy còn lại.

---

## 20. Tóm tắt thứ tự ưu tiên

### P0 — Làm trước

1. Fix overflow mobile Home/Resources.
2. Theme pre-paint, error/404 và safe routing.
3. Auth/session/admin security.
4. Design token + primitive.
5. Header/navigation/modal accessibility.
6. Exam lobby/session persistence.
7. Form pipeline và system feedback.
8. Payment/admin hidden states.

### P1 — Nâng tầm

1. Boot reveal và route transition.
2. Redesign Home/Courses/Resources/Exams.
3. Blog/Document tooling.
4. Performance splitting/image/math.
5. i18n toàn diện.
6. SEO/social/editorial trust.

### P2 — Mở rộng có điều kiện

1. Course Detail.
2. Account Center.
3. Full CMS/upload.
4. Enterprise/legal content hoàn chỉnh.
5. Analytics-driven trust metrics.

---

**Nguyên tắc chốt:** giao diện mới phải nhìn chuyên nghiệp hơn rõ rệt, nhưng chất lượng được đo bằng tính nhất quán, khả năng đọc, trạng thái đầy đủ, accessibility, tốc độ và độ tin cậy — không đo bằng số lượng hiệu ứng, gradient hoặc card.
