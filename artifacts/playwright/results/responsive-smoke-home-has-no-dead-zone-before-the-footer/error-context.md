# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive-smoke.spec.js >> home has no dead zone before the footer
- Location: e2e\responsive-smoke.spec.js:74:1

# Error details

```
Error: Home CTA and footer must both exist

expect(received).not.toBeNull()

Received: null
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
        - generic [ref=e11]:
          - link "Trang Chủ" [ref=e12] [cursor=pointer]:
            - /url: /
          - link "Khóa học" [ref=e13] [cursor=pointer]:
            - /url: /courses
          - link "Thư Viện" [ref=e14] [cursor=pointer]:
            - /url: /resources?category=all
          - link "Đề Thi TCC" [ref=e15] [cursor=pointer]:
            - /url: /exams
          - link "Blog" [ref=e16] [cursor=pointer]:
            - /url: /blog
        - generic [ref=e17]:
          - button "Mở tìm kiếm" [ref=e18] [cursor=pointer]
          - button "Chuyển sang giao diện tối" [ref=e22] [cursor=pointer]
          - button "Chọn ngôn ngữ" [ref=e26] [cursor=pointer]:
            - generic [ref=e30]: VI
        - button "Đăng Nhập" [ref=e32] [cursor=pointer]
  - main [ref=e37]:
    - generic [ref=e40]:
      - region [ref=e41]:
        - generic [ref=e42]:
          - generic [ref=e43]:
            - generic [ref=e44]: UEH TCC Learning Hub
            - heading "UEH TCC Học chắc nền tảng. Luyện đúng dạng đề." [level=1] [ref=e45]:
              - generic [ref=e46]: UEH TCC
              - generic [ref=e47]: Học chắc nền tảng. Luyện đúng dạng đề.
            - paragraph [ref=e48]: Học Toán Cao Cấp theo lộ trình rõ, có khóa học đăng ký, thư viện PDF, đề luyện và blog hướng dẫn. Mỗi phần được tách thành trang riêng để bạn vào đúng thứ mình cần.
            - generic [ref=e49]:
              - link "Đăng ký học thử" [ref=e50] [cursor=pointer]:
                - /url: /courses#enroll
              - link "Tìm học liệu" [ref=e54] [cursor=pointer]:
                - /url: /resources?category=all
            - list "Điểm nổi bật của nền tảng" [ref=e58]:
              - listitem [ref=e59]: Học theo chương
              - listitem [ref=e63]: Tài liệu PDF
              - listitem [ref=e67]: Thi thử tương tác
          - complementary "UEH TCC Publishing" [ref=e71]:
            - generic [ref=e72]:
              - generic [ref=e73]: Mới phát hành
              - generic [ref=e75]: Ấn bản 07.26
            - generic [ref=e76]:
              - link "Mở bộ đề Toán ứng dụng khóa K51" [ref=e77] [cursor=pointer]:
                - /url: /document/k51-2-dot
                - img "Bìa Toán ứng dụng khóa K51" [ref=e78]
                - generic [ref=e79]:
                  - generic [ref=e80]: Mới phát hành
                  - strong [ref=e81]: K51 · Hai đợt
              - link "Mở tuyển tập đề thi và lời giải FINAL 2807" [ref=e82] [cursor=pointer]:
                - /url: /document/ap1
                - img "Bìa đề thi và lời giải Toán Cao Cấp 2025" [ref=e83]
                - generic [ref=e84]:
                  - generic [ref=e85]: Collection
                  - strong [ref=e86]: FINAL 2807
            - generic [ref=e87]:
              - generic [ref=e88]:
                - generic [ref=e89]: UEH TCC Publishing
                - strong [ref=e90]: Đề thật · Lời giải rõ · Phòng luyện thi
              - link "Khám phá thư viện" [ref=e91] [cursor=pointer]:
                - /url: /resources?category=all
      - region [ref=e94]:
        - generic [ref=e95]:
          - generic [ref=e96]:
            - generic [ref=e97]:
              - term [ref=e98]: Câu hỏi luyện tập
              - definition [ref=e99]: 600+
            - generic [ref=e100]:
              - term [ref=e101]: Bộ đề thi thử
              - definition [ref=e102]: 12+
            - generic [ref=e103]:
              - term [ref=e104]: Tài liệu PDF
              - definition [ref=e105]: 30+
            - generic [ref=e106]:
              - term [ref=e107]: Mục tiêu điểm số
              - definition [ref=e108]: A/A+
          - generic [ref=e109]:
            - generic [ref=e110]:
              - generic [ref=e111]: Bắt đầu nhanh
              - heading "Chọn đúng khu vực cần dùng." [level=2] [ref=e112]
            - paragraph [ref=e113]: Trang chủ chỉ giữ các lối vào chính. Nội dung chi tiết nằm ở từng trang riêng để trải nghiệm gọn hơn.
          - generic [ref=e114]:
            - link [ref=e115] [cursor=pointer]:
              - /url: /courses
              - generic [ref=e116]: "01"
              - heading "Khóa học video" [level=3] [ref=e121]
              - paragraph [ref=e122]: Đăng ký học thử trước, nhận lộ trình phù hợp rồi mới mở các video theo chương.
              - generic [ref=e123]: Xem lộ trình
            - link [ref=e126] [cursor=pointer]:
              - /url: /exams
              - generic [ref=e127]: "02"
              - heading "Phòng luyện thi" [level=3] [ref=e135]
              - paragraph [ref=e136]: Làm đề có thời gian, chọn đáp án, nộp bài và xem lại phần cần ôn sau khi hoàn thành.
              - generic [ref=e137]: Luyện thi
            - link [ref=e140] [cursor=pointer]:
              - /url: /resources?category=all
              - generic [ref=e141]: "03"
              - heading "Thư viện PDF" [level=3] [ref=e145]
              - paragraph [ref=e146]: Giáo trình, bài tập chương, tài liệu giữa kỳ và các ấn phẩm ôn tập được lọc theo nhu cầu.
              - generic [ref=e147]: Mở thư viện
      - region [ref=e150]:
        - generic [ref=e151]:
          - generic [ref=e152]:
            - generic [ref=e153]: Lộ trình học
            - heading "Đi từ nền tảng đến luyện thi." [level=2] [ref=e154]
            - paragraph [ref=e155]: "Luồng học được sắp theo hành trình thực tế của sinh viên: hiểu kiến thức, luyện dạng bài, rồi thi thử để kiểm tra."
          - list [ref=e156]:
            - listitem [ref=e157]:
              - strong [ref=e158]: "01"
              - generic [ref=e159]:
                - heading "Nắm nền tảng" [level=3] [ref=e160]
                - paragraph [ref=e161]: Ma trận, hệ phương trình, không gian vector và các công thức cốt lõi.
            - listitem [ref=e162]:
              - strong [ref=e163]: "02"
              - generic [ref=e164]:
                - heading "Ôn theo dạng bài" [level=3] [ref=e165]
                - paragraph [ref=e166]: Giới hạn, đạo hàm, hàm nhiều biến và các bài toán kinh tế thường gặp.
            - listitem [ref=e167]:
              - strong [ref=e168]: "03"
              - generic [ref=e169]:
                - heading "Luyện trước kỳ thi" [level=3] [ref=e170]
                - paragraph [ref=e171]: Chuyển sang phòng thi thử, làm theo thời gian và xem lỗi sai.
      - region [ref=e172]:
        - generic [ref=e173]:
          - generic [ref=e174]:
            - generic [ref=e175]:
              - generic [ref=e176]: Blog học tập
              - heading "Bài viết mới" [level=2] [ref=e177]
            - link "Xem tất cả bài viết" [ref=e178] [cursor=pointer]:
              - /url: /blog
          - generic [ref=e181]:
            - article [ref=e182]:
              - 'img "Deep BSDE, FBSDE và Mean Field: nền tảng xây dựng mô hình Quant Finance số chiều cao" [ref=e183]'
              - generic [ref=e184]:
                - generic [ref=e185]: Chuyên khảo · Stochastic Control
                - 'heading "Deep BSDE, FBSDE và Mean Field: nền tảng xây dựng mô hình Quant Finance số chiều cao" [level=3] [ref=e186]'
                - paragraph [ref=e187]: Một chuyên khảo có hệ thống về cách Brownian motion, công thức Itô, stochastic maximum principle, FBSDE, LQ/Riccati, Almgren–Chriss, MFG/MFC và mạng neural kết nối thành phương pháp Deep BSDE cho các bài toán điều khiển tài chính số chiều cao.
                - link "Đọc bài viết" [ref=e188] [cursor=pointer]:
                  - /url: /blog/deep-bsde-fbsde-mfg-mfc-quant-finance
            - generic [ref=e191]:
              - 'link "Chuyên khảo · Quant Finance · 23/07/2026 Từ thống kê mẫu đến Quant Finance: đo lợi suất và rủi ro trên VN30" [ref=e192] [cursor=pointer]':
                - /url: /blog/thong-ke-den-quant-finance-vn30
                - generic [ref=e193]:
                  - generic [ref=e194]: Chuyên khảo · Quant Finance · 23/07/2026
                  - 'heading "Từ thống kê mẫu đến Quant Finance: đo lợi suất và rủi ro trên VN30" [level=3] [ref=e195]'
              - 'link "Chuyên khảo · Chương 5 · 23/07/2026 Đạo hàm kinh tế: Đại lượng biên, co giãn và lời giải đề K46–K51" [ref=e196] [cursor=pointer]':
                - /url: /blog/ung-dung-vi-mo-vi-mo-trong-toan-ung-dung-k51
                - generic [ref=e197]:
                  - generic [ref=e198]: Chuyên khảo · Chương 5 · 23/07/2026
                  - 'heading "Đạo hàm kinh tế: Đại lượng biên, co giãn và lời giải đề K46–K51" [level=3] [ref=e199]'
              - link "Kinh nghiệm học · 25/05/2026 Lộ trình ôn Toán Cao Cấp cho sinh viên UEH mới bắt đầu" [ref=e200] [cursor=pointer]:
                - /url: /blog/lo-trinh-on-toan-cao-cap
                - generic [ref=e201]:
                  - generic [ref=e202]: Kinh nghiệm học · 25/05/2026
                  - heading "Lộ trình ôn Toán Cao Cấp cho sinh viên UEH mới bắt đầu" [level=3] [ref=e203]
      - region "Đăng kí tư vấn miễn phí" [ref=e204]:
        - generic [ref=e206]:
          - heading "Đăng kí tư vấn miễn phí" [level=2] [ref=e207]
          - paragraph [ref=e208]: Xây dựng lộ trình học TOÀN DIỆN, bằng cách đăng ký qua form hoặc liên hệ với chúng tôi qua email hoặc số điện thoại bên dưới
          - generic [ref=e209]:
            - generic [ref=e210]:
              - generic [ref=e211]: Xin chào! Mình là
              - textbox "Họ và tên" [ref=e213]
              - generic [ref=e214]: ","
              - generic [ref=e215]: quan tâm đến khoá học
              - combobox [ref=e217] [cursor=pointer]:
                - option "Nền tảng Toán Cao Cấp" [selected]
                - option "Giới hạn, đạo hàm & hàm nhiều biến"
                - option "Mô hình toán trong kinh tế"
              - generic [ref=e218]: "!"
              - generic [ref=e219]: Liên hệ với mình qua
              - textbox "Số điện thoại" [ref=e221]
              - generic [ref=e222]: ", Hoặc"
              - textbox "Email" [ref=e224]
              - generic [ref=e225]: <3.
            - button "Đăng ký tư vấn" [ref=e227] [cursor=pointer]
  - button "Hỗ trợ & Liên hệ" [ref=e232] [cursor=pointer]
  - contentinfo [ref=e235]:
    - generic [ref=e237]:
      - generic [ref=e238]:
        - generic [ref=e239]: Nền tảng học tập độc lập
        - link "UEH TCC" [ref=e240] [cursor=pointer]:
          - /url: /
          - generic [ref=e241]: UEH
          - generic [ref=e242]: TCC
        - paragraph [ref=e243]: Trang web phi lợi nhuận hỗ trợ học tập môn Toán Cao Cấp cho sinh viên UEH. Cung cấp bài giải đề thi chi tiết, câu hỏi ôn tập chất lượng.
        - generic [ref=e244]:
          - link "0833830322" [ref=e245] [cursor=pointer]:
            - /url: tel:0833830322
          - link "luphuc321@gmail.com" [ref=e249] [cursor=pointer]:
            - /url: mailto:luphuc321@gmail.com
        - generic [ref=e254]:
          - link "Facebook" [ref=e255] [cursor=pointer]:
            - /url: https://www.facebook.com/Luphuc08092006/
          - link "Zalo" [ref=e259] [cursor=pointer]:
            - /url: https://zalo.me/0833830322
            - generic [ref=e260]: Z
      - navigation "Điều hướng cuối trang" [ref=e262]:
        - heading "Điều hướng" [level=4] [ref=e263]
        - list [ref=e264]:
          - listitem [ref=e265]:
            - link "Trang Chủ" [ref=e266] [cursor=pointer]:
              - /url: /
          - listitem [ref=e267]:
            - link "Khóa học" [ref=e268] [cursor=pointer]:
              - /url: /courses
          - listitem [ref=e269]:
            - link "Thư Viện" [ref=e270] [cursor=pointer]:
              - /url: /resources?category=all
          - listitem [ref=e271]:
            - link "Đề Thi TCC" [ref=e272] [cursor=pointer]:
              - /url: /exams
          - listitem [ref=e273]:
            - link "Blog" [ref=e274] [cursor=pointer]:
              - /url: /blog
      - generic [ref=e275]:
        - heading "Ủng Hộ & Từ Thiện" [level=4] [ref=e276]
        - paragraph [ref=e277]: "Ủng hộ duy trì trang web và đóng góp vào các quỹ hoạt động từ thiện của cộng đồng sinh viên:"
        - list [ref=e278]:
          - listitem [ref=e279]:
            - generic [ref=e280]: "MB-BANK:"
            - generic [ref=e281]: "08092006192939"
          - listitem [ref=e282]:
            - generic [ref=e283]: "Sacombank:"
            - generic [ref=e284]: "070128368343"
          - listitem [ref=e285]: Lữ Phúc
      - generic [ref=e286]:
        - heading "Nhận Bài Viết Mới" [level=4] [ref=e287]
        - paragraph [ref=e288]: "Điền email của bạn để tự động nhận lời giải chi tiết và bài viết hướng dẫn mới nhất:"
        - generic [ref=e290]:
          - generic [ref=e291]: Địa chỉ email của bạn...
          - textbox "Địa chỉ email của bạn..." [ref=e292]
          - button "Đăng ký nhận bài viết" [ref=e293] [cursor=pointer]
    - generic [ref=e298]:
      - paragraph [ref=e299]:
        - text: © 2026
        - strong [ref=e300]: UEH TCC
        - text: . Hỗ Trợ Học Tập Toán Cao Cấp.
      - generic [ref=e301]:
        - text: Phát triển bởi
        - link "Lữ Phúc" [ref=e302] [cursor=pointer]:
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
  62  |       ).toEqual([]);
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
> 87  |   expect(gap, 'Home CTA and footer must both exist').not.toBeNull();
      |                                                          ^ Error: Home CTA and footer must both exist
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