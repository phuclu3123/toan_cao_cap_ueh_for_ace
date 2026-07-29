# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive-smoke.spec.js >> priority routes render cleanly across production viewports
- Location: e2e\responsive-smoke.spec.js:22:1

# Error details

```
Error: / emitted unexpected console errors

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "Failed to load resource: net::ERR_NETWORK_ACCESS_DENIED",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - navigation "Điều hướng chính" [ref=e5]:
      - generic [ref=e6]:
        - link "UEH TCC — Trang chủ" [ref=e7] [cursor=pointer]:
          - /url: /
          - generic [ref=e9]: UEH
          - generic [ref=e10]: TCC
        - button "Mở menu" [ref=e11] [cursor=pointer]
  - main [ref=e13]:
    - generic [ref=e16]:
      - region [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]: UEH TCC Learning Hub
            - heading "UEH TCC Học chắc nền tảng. Luyện đúng dạng đề." [level=1] [ref=e21]:
              - generic [ref=e22]: UEH TCC
              - generic [ref=e23]: Học chắc nền tảng. Luyện đúng dạng đề.
            - paragraph [ref=e24]: Học Toán Cao Cấp theo lộ trình rõ, có khóa học đăng ký, thư viện PDF, đề luyện và blog hướng dẫn. Mỗi phần được tách thành trang riêng để bạn vào đúng thứ mình cần.
            - generic [ref=e25]:
              - link "Đăng ký học thử" [ref=e26] [cursor=pointer]:
                - /url: /courses#enroll
              - link "Tìm học liệu" [ref=e30] [cursor=pointer]:
                - /url: /resources?category=all
            - list "Điểm nổi bật của nền tảng" [ref=e34]:
              - listitem [ref=e35]: Học theo chương
              - listitem [ref=e39]: Tài liệu PDF
              - listitem [ref=e43]: Thi thử tương tác
          - complementary "UEH TCC Publishing" [ref=e47]:
            - generic [ref=e48]: Mới phát hành
            - generic [ref=e51]:
              - link "Mở bộ đề Toán ứng dụng khóa K51" [ref=e52] [cursor=pointer]:
                - /url: /document/k51-2-dot
                - img "Bìa Toán ứng dụng khóa K51" [ref=e53]
                - strong [ref=e55]: K51 · Hai đợt
              - link "Mở tuyển tập đề thi và lời giải FINAL 2807" [ref=e56] [cursor=pointer]:
                - /url: /document/ap1
                - img "Bìa đề thi và lời giải Toán Cao Cấp 2025" [ref=e57]
                - strong [ref=e59]: FINAL 2807
            - generic [ref=e60]:
              - generic [ref=e61]:
                - generic [ref=e62]: UEH TCC Publishing
                - strong [ref=e63]: Đề thật · Lời giải rõ · Phòng luyện thi
              - link "Khám phá thư viện" [ref=e64] [cursor=pointer]:
                - /url: /resources?category=all
      - region [ref=e67]:
        - generic [ref=e68]:
          - generic [ref=e69]:
            - generic [ref=e70]:
              - term [ref=e71]: Câu hỏi luyện tập
              - definition [ref=e72]: 600+
            - generic [ref=e73]:
              - term [ref=e74]: Bộ đề thi thử
              - definition [ref=e75]: 12+
            - generic [ref=e76]:
              - term [ref=e77]: Tài liệu PDF
              - definition [ref=e78]: 30+
            - generic [ref=e79]:
              - term [ref=e80]: Mục tiêu điểm số
              - definition [ref=e81]: A/A+
          - generic [ref=e82]:
            - generic [ref=e83]:
              - generic [ref=e84]: Bắt đầu nhanh
              - heading "Chọn đúng khu vực cần dùng." [level=2] [ref=e85]
            - paragraph [ref=e86]: Trang chủ chỉ giữ các lối vào chính. Nội dung chi tiết nằm ở từng trang riêng để trải nghiệm gọn hơn.
          - generic [ref=e87]:
            - link [ref=e88] [cursor=pointer]:
              - /url: /courses
              - generic [ref=e89]: "01"
              - heading "Khóa học video" [level=3] [ref=e94]
              - paragraph [ref=e95]: Đăng ký học thử trước, nhận lộ trình phù hợp rồi mới mở các video theo chương.
              - generic [ref=e96]: Xem lộ trình
            - link [ref=e99] [cursor=pointer]:
              - /url: /exams
              - generic [ref=e100]: "02"
              - heading "Phòng luyện thi" [level=3] [ref=e108]
              - paragraph [ref=e109]: Làm đề có thời gian, chọn đáp án, nộp bài và xem lại phần cần ôn sau khi hoàn thành.
              - generic [ref=e110]: Luyện thi
            - link [ref=e113] [cursor=pointer]:
              - /url: /resources?category=all
              - generic [ref=e114]: "03"
              - heading "Thư viện PDF" [level=3] [ref=e118]
              - paragraph [ref=e119]: Giáo trình, bài tập chương, tài liệu giữa kỳ và các ấn phẩm ôn tập được lọc theo nhu cầu.
              - generic [ref=e120]: Mở thư viện
      - region [ref=e123]:
        - generic [ref=e124]:
          - generic [ref=e125]:
            - generic [ref=e126]: Lộ trình học
            - heading "Đi từ nền tảng đến luyện thi." [level=2] [ref=e127]
            - paragraph [ref=e128]: "Luồng học được sắp theo hành trình thực tế của sinh viên: hiểu kiến thức, luyện dạng bài, rồi thi thử để kiểm tra."
          - list [ref=e129]:
            - listitem [ref=e130]:
              - strong [ref=e131]: "01"
              - generic [ref=e132]:
                - heading "Nắm nền tảng" [level=3] [ref=e133]
                - paragraph [ref=e134]: Ma trận, hệ phương trình, không gian vector và các công thức cốt lõi.
            - listitem [ref=e135]:
              - strong [ref=e136]: "02"
              - generic [ref=e137]:
                - heading "Ôn theo dạng bài" [level=3] [ref=e138]
                - paragraph [ref=e139]: Giới hạn, đạo hàm, hàm nhiều biến và các bài toán kinh tế thường gặp.
            - listitem [ref=e140]:
              - strong [ref=e141]: "03"
              - generic [ref=e142]:
                - heading "Luyện trước kỳ thi" [level=3] [ref=e143]
                - paragraph [ref=e144]: Chuyển sang phòng thi thử, làm theo thời gian và xem lỗi sai.
      - region [ref=e145]:
        - generic [ref=e146]:
          - generic [ref=e147]:
            - generic [ref=e148]:
              - generic [ref=e149]: Blog học tập
              - heading "Bài viết mới" [level=2] [ref=e150]
            - link "Xem tất cả bài viết" [ref=e151] [cursor=pointer]:
              - /url: /blog
          - generic [ref=e154]:
            - article [ref=e155]:
              - 'img "Deep BSDE, FBSDE và Mean Field: nền tảng xây dựng mô hình Quant Finance số chiều cao" [ref=e156]'
              - generic [ref=e157]:
                - generic [ref=e158]: Chuyên khảo · Stochastic Control
                - 'heading "Deep BSDE, FBSDE và Mean Field: nền tảng xây dựng mô hình Quant Finance số chiều cao" [level=3] [ref=e159]'
                - paragraph [ref=e160]: Một chuyên khảo có hệ thống về cách Brownian motion, công thức Itô, stochastic maximum principle, FBSDE, LQ/Riccati, Almgren–Chriss, MFG/MFC và mạng neural kết nối thành phương pháp Deep BSDE cho các bài toán điều khiển tài chính số chiều cao.
                - link "Đọc bài viết" [ref=e161] [cursor=pointer]:
                  - /url: /blog/deep-bsde-fbsde-mfg-mfc-quant-finance
            - generic [ref=e164]:
              - 'link "Chuyên khảo · Quant Finance · 23/07/2026 Từ thống kê mẫu đến Quant Finance: đo lợi suất và rủi ro trên VN30" [ref=e165] [cursor=pointer]':
                - /url: /blog/thong-ke-den-quant-finance-vn30
                - generic [ref=e166]:
                  - generic [ref=e167]: Chuyên khảo · Quant Finance · 23/07/2026
                  - 'heading "Từ thống kê mẫu đến Quant Finance: đo lợi suất và rủi ro trên VN30" [level=3] [ref=e168]'
              - 'link "Chuyên khảo · Chương 5 · 23/07/2026 Đạo hàm kinh tế: Đại lượng biên, co giãn và lời giải đề K46–K51" [ref=e169] [cursor=pointer]':
                - /url: /blog/ung-dung-vi-mo-vi-mo-trong-toan-ung-dung-k51
                - generic [ref=e170]:
                  - generic [ref=e171]: Chuyên khảo · Chương 5 · 23/07/2026
                  - 'heading "Đạo hàm kinh tế: Đại lượng biên, co giãn và lời giải đề K46–K51" [level=3] [ref=e172]'
              - link "Kinh nghiệm học · 25/05/2026 Lộ trình ôn Toán Cao Cấp cho sinh viên UEH mới bắt đầu" [ref=e173] [cursor=pointer]:
                - /url: /blog/lo-trinh-on-toan-cao-cap
                - generic [ref=e174]:
                  - generic [ref=e175]: Kinh nghiệm học · 25/05/2026
                  - heading "Lộ trình ôn Toán Cao Cấp cho sinh viên UEH mới bắt đầu" [level=3] [ref=e176]
      - region "Đăng kí tư vấn miễn phí" [ref=e177]:
        - generic [ref=e179]:
          - heading "Đăng kí tư vấn miễn phí" [level=2] [ref=e180]
          - paragraph [ref=e181]: Xây dựng lộ trình học TOÀN DIỆN, bằng cách đăng ký qua form hoặc liên hệ với chúng tôi qua email hoặc số điện thoại bên dưới
          - generic [ref=e182]:
            - generic [ref=e183]:
              - generic [ref=e184]: Xin chào! Mình là
              - textbox "Họ và tên" [ref=e186]
              - generic [ref=e187]: ","
              - generic [ref=e188]: quan tâm đến khoá học
              - combobox [ref=e190] [cursor=pointer]:
                - option "Nền tảng Toán Cao Cấp" [selected]
                - option "Giới hạn, đạo hàm & hàm nhiều biến"
                - option "Mô hình toán trong kinh tế"
              - generic [ref=e191]: "!"
              - generic [ref=e192]: Liên hệ với mình qua
              - textbox "Số điện thoại" [ref=e194]
              - generic [ref=e195]: ", Hoặc"
              - textbox "Email" [ref=e197]
              - generic [ref=e198]: <3.
            - button "Đăng ký tư vấn" [ref=e200] [cursor=pointer]
  - button "Hỗ trợ & Liên hệ" [ref=e205] [cursor=pointer]
  - contentinfo [ref=e208]:
    - generic [ref=e210]:
      - generic [ref=e211]:
        - generic [ref=e212]: Nền tảng học tập độc lập
        - link "UEH TCC" [ref=e213] [cursor=pointer]:
          - /url: /
          - generic [ref=e214]: UEH
          - generic [ref=e215]: TCC
        - paragraph [ref=e216]: Trang web phi lợi nhuận hỗ trợ học tập môn Toán Cao Cấp cho sinh viên UEH. Cung cấp bài giải đề thi chi tiết, câu hỏi ôn tập chất lượng.
        - generic [ref=e217]:
          - link "0833830322" [ref=e218] [cursor=pointer]:
            - /url: tel:0833830322
          - link "luphuc321@gmail.com" [ref=e222] [cursor=pointer]:
            - /url: mailto:luphuc321@gmail.com
        - generic [ref=e227]:
          - link "Facebook" [ref=e228] [cursor=pointer]:
            - /url: https://www.facebook.com/Luphuc08092006/
          - link "Zalo" [ref=e232] [cursor=pointer]:
            - /url: https://zalo.me/0833830322
            - generic [ref=e233]: Z
      - navigation "Điều hướng cuối trang" [ref=e235]:
        - heading "Điều hướng" [level=4] [ref=e236]
        - list [ref=e237]:
          - listitem [ref=e238]:
            - link "Trang Chủ" [ref=e239] [cursor=pointer]:
              - /url: /
          - listitem [ref=e240]:
            - link "Khóa học" [ref=e241] [cursor=pointer]:
              - /url: /courses
          - listitem [ref=e242]:
            - link "Thư Viện" [ref=e243] [cursor=pointer]:
              - /url: /resources?category=all
          - listitem [ref=e244]:
            - link "Đề Thi TCC" [ref=e245] [cursor=pointer]:
              - /url: /exams
          - listitem [ref=e246]:
            - link "Blog" [ref=e247] [cursor=pointer]:
              - /url: /blog
      - generic [ref=e248]:
        - heading "Ủng Hộ & Từ Thiện" [level=4] [ref=e249]
        - paragraph [ref=e250]: "Ủng hộ duy trì trang web và đóng góp vào các quỹ hoạt động từ thiện của cộng đồng sinh viên:"
        - list [ref=e251]:
          - listitem [ref=e252]:
            - generic [ref=e253]: "MB-BANK:"
            - generic [ref=e254]: "08092006192939"
          - listitem [ref=e255]:
            - generic [ref=e256]: "Sacombank:"
            - generic [ref=e257]: "070128368343"
          - listitem [ref=e258]: Lữ Phúc
      - generic [ref=e259]:
        - heading "Nhận Bài Viết Mới" [level=4] [ref=e260]
        - paragraph [ref=e261]: "Điền email của bạn để tự động nhận lời giải chi tiết và bài viết hướng dẫn mới nhất:"
        - generic [ref=e263]:
          - generic [ref=e264]: Địa chỉ email của bạn...
          - textbox "Địa chỉ email của bạn..." [ref=e265]
          - button "Đăng ký nhận bài viết" [ref=e266] [cursor=pointer]
    - generic [ref=e271]:
      - paragraph [ref=e272]:
        - text: © 2026
        - strong [ref=e273]: UEH TCC
        - text: . Hỗ Trợ Học Tập Toán Cao Cấp.
      - generic [ref=e274]:
        - text: Phát triển bởi
        - link "Lữ Phúc" [ref=e275] [cursor=pointer]:
          - /url: https://www.facebook.com/Luphuc08092006/
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | 
  3   | const routes = [
  4   |   ['home', '/'],
  5   |   ['courses', '/courses'],
  6   |   ['course', '/course/tu-hoc-toan-cao-cap'],
  7   |   ['resources', '/resources'],
  8   |   ['exams', '/exams'],
  9   |   ['blog', '/blog']
  10  | ];
  11  | 
  12  | const viewports = [
  13  |   { name: 'mobile-360', width: 360, height: 800 },
  14  |   { name: 'mobile-390', width: 390, height: 844 },
  15  |   { name: 'tablet-768', width: 768, height: 1024 },
  16  |   { name: 'laptop-1024', width: 1024, height: 768 },
  17  |   { name: 'desktop-1440', width: 1440, height: 900 }
  18  | ];
  19  | 
  20  | const safeArtifactName = (value) => value.replace(/[^a-z0-9-]/gi, '-');
  21  | 
  22  | test('priority routes render cleanly across production viewports', async ({ page }) => {
  23  |   const pageErrors = [];
  24  |   const consoleErrors = [];
  25  | 
  26  |   page.on('pageerror', (error) => pageErrors.push(error.message));
  27  |   page.on('console', (message) => {
  28  |     if (message.type() === 'error') consoleErrors.push(message.text());
  29  |   });
  30  | 
  31  |   for (const viewport of viewports) {
  32  |     await page.setViewportSize({ width: viewport.width, height: viewport.height });
  33  | 
  34  |     for (const [routeName, path] of routes) {
  35  |       pageErrors.length = 0;
  36  |       consoleErrors.length = 0;
  37  | 
  38  |       const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  39  |       expect(response?.status(), `${path} should return an HTML document`).toBeLessThan(400);
  40  |       await expect(page.locator('#main-content')).toBeVisible();
  41  |       await expect(page.locator('body')).not.toContainText('ERR_NETWORK_ACCESS_DENIED');
  42  |       await page.waitForTimeout(250);
  43  | 
  44  |       const overflow = await page.evaluate(() => ({
  45  |         viewport: document.documentElement.clientWidth,
  46  |         document: document.documentElement.scrollWidth,
  47  |         body: document.body.scrollWidth
  48  |       }));
  49  |       expect(
  50  |         Math.max(overflow.document, overflow.body),
  51  |         `${path} overflows horizontally at ${viewport.width}px`
  52  |       ).toBeLessThanOrEqual(overflow.viewport + 1);
  53  | 
  54  |       expect(pageErrors, `${path} emitted page errors`).toEqual([]);
  55  |       expect(
  56  |         consoleErrors.filter((message) => (
  57  |           !message.includes('/api/')
  58  |           && !message.includes('Firebase')
  59  |           && !message.includes('ERR_CONNECTION_REFUSED')
  60  |         )),
  61  |         `${path} emitted unexpected console errors`
> 62  |       ).toEqual([]);
      |         ^ Error: / emitted unexpected console errors
  63  | 
  64  |       if (['mobile-360', 'tablet-768', 'desktop-1440'].includes(viewport.name)) {
  65  |         await page.screenshot({
  66  |           path: `../artifacts/playwright/screens/${safeArtifactName(routeName)}-${viewport.name}.png`,
  67  |           fullPage: routeName === 'home'
  68  |         });
  69  |       }
  70  |     }
  71  |   }
  72  | });
  73  | 
  74  | test('home has no dead zone before the footer', async ({ page }) => {
  75  |   await page.setViewportSize({ width: 1440, height: 900 });
  76  |   await page.goto('/', { waitUntil: 'domcontentloaded' });
  77  | 
  78  |   const gap = await page.evaluate(() => {
  79  |     const cta = document.querySelector('.enterprise-cta');
  80  |     const footer = document.querySelector('#footer');
  81  |     if (!cta || !footer) return null;
  82  |     const ctaBottom = cta.getBoundingClientRect().bottom + window.scrollY;
  83  |     const footerTop = footer.getBoundingClientRect().top + window.scrollY;
  84  |     return footerTop - ctaBottom;
  85  |   });
  86  | 
  87  |   expect(gap, 'Home CTA and footer must both exist').not.toBeNull();
  88  |   expect(gap, 'Unexpected blank space exists before the footer').toBeLessThan(240);
  89  | });
  90  | 
  91  | test('login dialog is accessible and fits the desktop viewport', async ({ page }) => {
  92  |   await page.setViewportSize({ width: 1440, height: 900 });
  93  |   await page.goto('/', { waitUntil: 'domcontentloaded' });
  94  |   const loginButton = page.locator('.btn-login-nav').first();
  95  |   await loginButton.click();
  96  | 
  97  |   const dialog = page.getByRole('dialog');
  98  |   await expect(dialog).toBeVisible();
  99  |   await expect(dialog).toHaveAttribute('aria-modal', 'true');
  100 |   await expect(dialog.locator('.auth-provider-button')).toHaveCount(2);
  101 |   await expect(dialog).not.toContainText('Facebook');
  102 | 
  103 |   const box = await dialog.boundingBox();
  104 |   expect(box).not.toBeNull();
  105 |   expect(box.height).toBeLessThanOrEqual(620);
  106 |   expect(box.y).toBeGreaterThanOrEqual(12);
  107 | 
  108 |   await page.screenshot({
  109 |     path: '../artifacts/playwright/screens/auth-dialog-desktop-1440.png'
  110 |   });
  111 | 
  112 |   await page.keyboard.press('Escape');
  113 |   await expect(dialog).toBeHidden();
  114 |   await expect(loginButton).toBeFocused();
  115 | });
  116 | 
```