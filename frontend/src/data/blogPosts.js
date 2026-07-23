export const blogPosts = [
  {
    slug: 'ung-dung-vi-mo-vi-mo-trong-toan-ung-dung-k51',
    title: 'Ứng Dụng Toán Trong Kinh Tế Vi Mô & Vĩ Mô: Lý Thuyết & Giải Bộ Đề UEH',
    category: 'Chuyên đề nâng cao',
    date: '23/07/2026',
    author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
    keywords: ['Chương 5 PNTA', 'Marginal Cost', 'Marginal Product', 'MRPL', 'Amoroso-Robinson', 'MPC', 'MPS', 'Toán UEH'],
    image: '/images/math_banner.svg',
    excerpt: 'Hệ thống hóa 100% toàn bộ lý thuyết gốc Kinh tế Vi mô & Vĩ mô trong Slide Chương 5 của Thầy Phan Ngô Tuấn Anh (MPL, MPK, MRPL, C, FC, VC, MC, AC, AVC, AR, MR, π, Y, C, S, MPC, MPS, Ep, Amoroso-Robinson) và giải chi tiết các câu hỏi ứng dụng xuyên suốt bộ đề K46 đến K51.',
    toc: [
      '1. Khái niệm & Bản chất Toán học của Đại lượng Biên tế',
      '2. Hàm Sản Xuất, Năng Suất Biên (MPL, MPK) & Năng Suất Doanh Thu Biên (MRPL)',
      '3. Cấu trúc Hàm Chi Phí (C, FC, VC, MC, AC, AFC, AVC) & Quy Tắc Điểm Đáy',
      '4. Hàm Doanh Thu, Hàm Lợi Nhuận & Tối Đa Hóa Lợi Nhuận (R, AR, MR, π)',
      '5. Kinh Tế Vĩ Mô: Thu Nhập Quốc Dân (Y), Tiêu Dùng (C), Tiết Kiệm (S), MPC & MPS',
      '6. Lý Thuyết Hệ Số Co Giãn (Elasticity) & Công Thức Amoroso-Robinson',
      '7. Vi Phân Ẩn & Mô Hình Động Trong Kinh Tế',
      '8. Phân Tích & Giải Chi Tiết Bộ Đề Thi K46 - K51 UEH',
      '9. Tài Liệu Tham Khảo Chính Thống'
    ],
    sections: [
      {
        heading: '1. Khái niệm & Bản chất Toán học của Đại lượng Biên tế',
        body: 'Trong tài liệu Chương 5: Đạo hàm và vi phân (cập nhật) của Thầy Phan Ngô Tuấn Anh (PNTA), các đại lượng biên tế (Marginal Concepts) phản ánh tốc độ thay đổi của một chỉ tiêu kinh tế khi biến số đầu vào thay đổi 1 đơn vị.\n\n' +
          'Về mặt toán học, giá trị biên tế chính là đạo hàm bậc nhất của hàm số tương ứng:\n' +
          '$$M_y(x) = y\'(x) = \\frac{\\mathrm{d}y}{\\mathrm{d}x}$$\n\n' +
          'Ý nghĩa kinh tế cơ bản: Cho biết khi biến $x$ tăng thêm 1 đơn vị từ mức $x_0$, thì biến $y$ sẽ biến đổi một lượng xấp xỉ bằng $y\'(x_0)$ đơn vị.\n\n' +
          'Ý nghĩa hình học: Giá trị biên tế $y\'(x_0)$ chính là hệ số góc (slope) của đường tiếp tuyến với đồ thị hàm số $y = f(x)$ tại điểm $x = x_0$. Chi phí hay năng suất biên càng lớn thì đường tiếp tuyến càng dốc đứng.'
      },
      {
        heading: '2. Hàm Sản Xuất, Năng Suất Biên (MPL, MPK) & Năng Suất Doanh Thu Biên (MRPL)',
        body: 'Sản lượng đầu ra $Q$ của doanh nghiệp phụ thuộc vào các yếu tố đầu vào như Lao động ($L$) và Vốn ($K$).\n\n' +
          '1. Năng suất biên theo Lao động (Marginal Product of Labor - $MP_L$):\n' +
          '$$MP_L = Q\'_L = \\frac{\\partial Q}{\\partial L}$$\n' +
          'Ý nghĩa: Khi tăng sử dụng 1 đơn vị lao động (giữ nguyên lượng vốn $K$), tổng sản lượng $Q$ sẽ tăng thêm xấp xỉ $MP_L$ đơn vị sản phẩm.\n\n' +
          '2. Năng suất biên theo Vốn (Marginal Product of Capital - $MP_K$):\n' +
          '$$MP_K = Q\'_K = \\frac{\\partial Q}{\\partial K}$$\n' +
          'Ý nghĩa: Khi tăng thêm 1 đơn vị vốn (giữ nguyên lượng lao động $L$), tổng sản lượng $Q$ sẽ tăng thêm xấp xỉ $MP_K$ đơn vị sản phẩm.\n\n' +
          '3. Năng suất trung bình (Average Product - AP):\n' +
          '$$AP_L = \\frac{Q}{L}, \\quad AP_K = \\frac{Q}{K}$$\n' +
          'Mối quan hệ giữa $MP_L$ và $AP_L$: Khi $MP_L > AP_L \\implies AP_L$ đang tăng; khi $MP_L < AP_L \\implies AP_L$ đang giảm; $MP_L = AP_L$ tại điểm cực đại của $AP_L$.\n\n' +
          '4. Năng suất doanh thu biên (Marginal Revenue Product - $MRP$):\n' +
          'Năng suất doanh thu biên tế theo lao động $MRP_L$ đo lường lượng doanh thu tăng thêm khi doanh nghiệp thuê thêm 1 đơn vị lao động:\n' +
          '$$MRP_L = \\frac{\\mathrm{d}TR}{\\mathrm{d}L} = \\frac{\\mathrm{d}TR}{\\mathrm{d}Q} \\cdot \\frac{\\mathrm{d}Q}{\\mathrm{d}L} = MR \\cdot MP_L$$\n' +
          '$$MRP_K = \\frac{\\mathrm{d}TR}{\\mathrm{d}K} = \\frac{\\mathrm{d}TR}{\\mathrm{d}Q} \\cdot \\frac{\\mathrm{d}Q}{\\mathrm{d}K} = MR \\cdot MP_K$$\n' +
          'Điều kiện tối đa hóa lợi nhuận khi thuê lao động: Thuê lao động cho đến khi $MRP_L = w$ (với $w$ là mức tiền lương trên thị trường).'
      },
      {
        heading: '3. Cấu trúc Hàm Chi Phí (C, FC, VC, MC, AC, AFC, AVC) & Quy Tắc Điểm Đáy',
        body: '1. Phân loại hàm chi phí:\n' +
          'Tổng chi phí sản xuất $C(q)$ bao gồm Chi phí biến đổi $VC(q)$ và Chi phí cố định $FC$:\n' +
          '$$C(q) = VC(q) + FC$$\n\n' +
          '2. Chi phí biên (Marginal Cost - MC):\n' +
          '$$MC = C\'(q) = VC\'(q) = \\frac{\\mathrm{d}C}{\\mathrm{d}q}$$\n' +
          'Ý nghĩa: Cho biết khi tăng sản lượng thêm 1 đơn vị thì tổng chi phí tăng thêm xấp xỉ $MC$ đơn vị tiền.\n\n' +
          '3. Chi phí trung bình (Average Cost - AC / ATC):\n' +
          '$$AC(q) = \\frac{C(q)}{q} = \\frac{VC(q)}{q} + \\frac{FC}{q} = AVC(q) + AFC(q)$$\n\n' +
          '4. Quy tắc điểm đáy (Bottom Point Rule - $MC = AC$):\n' +
          'Đạo hàm của chi phí trung bình theo sản lượng:\n' +
          '$$AC\'(q) = \\frac{\\mathrm{d}}{\\mathrm{d}q}\\left(\\frac{C(q)}{q}\\right) = \\frac{C\'(q) \\cdot q - C(q)}{q^2} = \\frac{MC - AC}{q}$$\n' +
          '- Nếu $MC < AC \\implies AC\'(q) < 0$: Chi phí trung bình đang giảm (Hiệu quả quy mô).\n' +
          '- Nếu $MC > AC \\implies AC\'(q) > 0$: Chi phí trung bình đang tăng.\n' +
          '- Nếu $MC = AC \\implies AC\'(q) = 0$: Đường $MC$ cắt đường $AC$ tại điểm cực tiểu của $AC$ ($AC_{\\min}$).'
      },
      {
        heading: '4. Hàm Doanh Thu, Hàm Lợi Nhuận & Tối Đa Hóa Lợi Nhuận (R, AR, MR, π)',
        body: '1. Hàm Doanh thu & Doanh thu biên:\n' +
          'Tổng doanh thu $R(q) = p \\cdot q$. Doanh thu trung bình $AR(q) = \\frac{R(q)}{q} = p$. Doanh thu biên:\n' +
          '$$MR = R\'(q) = \\frac{\\mathrm{d}R}{\\mathrm{d}q}$$\n\n' +
          '2. Tối đa hóa lợi nhuận $\\pi(q)$:\n' +
          '$$\\pi(q) = R(q) - C(q) \\implies \\pi\'(q) = MR - MC$$\n' +
          'Điều kiện cần: $\\pi\'(q^*) = 0 \\iff MR = MC$ (Doanh thu biên bằng Chi phí biên).\n\n' +
          '3. Phân biệt theo cấu trúc thị trường:\n' +
          '- Cạnh tranh hoàn hảo: Doanh nghiệp chấp nhận giá $p = const \\implies MR = AR = p$. Lợi nhuận cực đại tại $p = MC$.\n' +
          '- Thị trường Độc quyền: Doanh nghiệp quyết định giá $p = p(q)$ giảm theo $q \\implies MR = p + q \\cdot p\'(q) < p$.'
      },
      {
        heading: '5. Kinh Tế Vĩ Mô: Thu Nhập Quốc Dân (Y), Tiêu Dùng (C), Tiết Kiệm (S), MPC & MPS',
        body: '1. Đẳng thức phân bổ Thu nhập quốc dân:\n' +
          'Trong mô hình vĩ mô đơn giản, tổng thu nhập quốc dân $Y$ được phân bổ hoàn toàn vào Tiêu dùng $C$ và Tiết kiệm $S$:\n' +
          '$$Y = C(Y) + S(Y)$$\n\n' +
          '2. Hàm Tiêu dùng & Khuynh hướng tiêu dùng biên ($MPC$):\n' +
          '$$MPC = C\'(Y) = \\frac{\\mathrm{d}C}{\\mathrm{d}Y}$$\n' +
          'Ý nghĩa: Khi thu nhập quốc dân $Y$ tăng thêm 1 đơn vị tiền, tiêu dùng của toàn xã hội sẽ tăng thêm xấp xỉ $MPC$ đơn vị tiền ($0 < MPC < 1$).\n\n' +
          '3. Hàm Tiết kiệm & Khuynh hướng tiết kiệm biên ($MPS$):\n' +
          '$$S(Y) = Y - C(Y) \\implies MPS = S\'(Y) = \\frac{\\mathrm{d}S}{\\mathrm{d}Y} = 1 - C\'(Y) = 1 - MPC$$\n' +
          'Mối quan hệ luôn đúng: $MPC + MPS = 1$.'
      },
      {
        heading: '6. Lý Thuyết Hệ Số Co Giãn (Elasticity) & Công Thức Amoroso-Robinson',
        body: '1. Định nghĩa Hệ số co giãn tổng quát:\n' +
          '$$\\varepsilon_{yx} = E_x = f\'(x) \\cdot \\frac{x}{y} = \\frac{\\mathrm{d}y / y}{\\mathrm{d}x / x}$$\n\n' +
          '2. Hệ số co giãn của Cầu theo Giá ($E_p$):\n' +
          '$$E_p = \\frac{\\mathrm{d}Q}{\\mathrm{d}p} \\cdot \\frac{p}{Q}$$\n' +
          '- $|E_p| > 1$: Cầu co giãn nhiều $\\implies$ Tăng giá làm giảm tổng doanh thu ($MR < 0$).\n' +
          '- $|E_p| < 1$: Cầu ít co giãn $\\implies$ Tăng giá làm tăng tổng doanh thu ($MR > 0$).\n' +
          '- $|E_p| = 1$: Co giãn đơn vị $\\implies$ Tổng doanh thu đạt cực đại ($MR = 0$).\n\n' +
          '3. Công thức Amoroso-Robinson:\n' +
          '$$MR = p \\left(1 + \\frac{1}{E_p}\\right)$$\n\n' +
          '4. Hệ số co giãn của Chi phí (Cost Elasticity - $\\varepsilon_{Cq}$):\n' +
          '$$\\varepsilon_{Cq} = C\'(q) \\cdot \\frac{q}{C} = \\frac{MC}{AC}$$'
      },
      {
        heading: '7. Vi Phân Ẩn & Mô Hình Động Trong Kinh Tế',
        body: '1. Đạo hàm và Vi phân hàm ẩn $F(x, y) = 0$:\n' +
          '$$\\frac{\\mathrm{d}y}{\\mathrm{d}x} = -\\frac{F\'_x}{F\'_y}$$\n\n' +
          '2. Công thức Xấp xỉ tuyến tính một biến & hai biến:\n' +
          '$$\\Delta y \\approx f\'(x_0) \\cdot \\Delta x \\implies f(x_0 + \\Delta x) \\approx f(x_0) + f\'(x_0) \\cdot \\Delta x$$\n' +
          '$$f(x_0 + \\Delta x, y_0 + \\Delta y) \\approx f(x_0, y_0) + f\'_x(x_0, y_0) \\Delta x + f\'_y(x_0, y_0) \\Delta y$$\n\n' +
          '3. Mô hình giá thị trường động qua Phương trình vi phân:\n' +
          '$$P\'(t) + a P(t) = b \\implies P(t) = \\frac{b}{a} + C e^{-at} \\xrightarrow{t \\to +\\infty} P^* = \\frac{b}{a}$$'
      },
      {
        heading: '8. Phân Tích & Giải Chi Tiết Bộ Đề Thi K46 - K51 UEH',
        body: 'Tổng hợp và giải chi tiết các câu hỏi ứng dụng thực tế từ các kỳ thi K46, K47, K48, K49, K50, K51:\n\n' +
          'Dạng 1: Chi phí biên của công ty công nghệ (K51 Đợt 2 - Câu 4)\n' +
          'Đề bài: Cho $C(Q) = 500 \\cdot \\ln(Q^2 + 1) + 200$. Tính chi phí biên tại $Q = 3$.\n' +
          'Lời giải: $MC = C\'(Q) = 500 \\cdot \\frac{2Q}{Q^2 + 1}$. Tại $Q = 3 \\implies MC(3) = 500 \\cdot \\frac{6}{10} = 300$.\n\n' +
          'Dạng 2: Phân tích Doanh thu theo $E_p$ (K51 Đợt 2 - Câu 6)\n' +
          'Đề bài: Hệ số co giãn cầu $E_p = -0.5$. Doanh nghiệp tăng giá bán một lượng nhỏ thì doanh thu thay đổi thế nào?\n' +
          'Lời giải: Vì $|E_p| = 0.5 < 1$ (cầu ít co giãn), khi tăng giá thì lượng cầu giảm ít hơn tỷ lệ tăng giá, do đó tổng doanh thu tăng ($MR > 0$). Chọn B.\n\n' +
          'Dạng 3: Tỷ lệ thay thế kỹ thuật biên MRTS (K51 Đợt 2 - Câu 2)\n' +
          'Đề bài: $Q = 2K^2 + 3L^2 + KL$. Tại $K=10, L=5$, tăng 1 đơn vị lao động ($dL=1$) giữ nguyên sản lượng ($dQ=0$) thì $K$ giảm bao nhiêu?\n' +
          'Lời giải: $dQ = Q\'_K dK + Q\'_L dL = 0 \\implies dK = -\\frac{Q\'_L}{Q\'_K} dL = -\\frac{6L+K}{4K+L} = -\\frac{40}{45} = -\\frac{8}{9}$. Vốn giảm $8/9$ đơn vị.\n\n' +
          'Dạng 4: Tiết kiệm và Thu nhập trong bài toán đạo hàm ẩn (K49 & K51 - Câu 4)\n' +
          'Đề bài: $S^2 + \\frac{1}{4}I^2 = SI + I$. Tại mức thu nhập $I = 16$, tiết kiệm tăng thêm bao nhiêu % khi thu nhập tăng 1%?\n' +
          'Lời giải: Tính $S$ tại $I=16$: $S^2 + 64 = 16S + 16 \\implies S^2 - 16S + 48 = 0 \\implies S = 4$ (vì $S \\le 30\\% I = 4.8$).\n' +
          'Lấy đạo hàm hai vế theo $I$: $2S S\' + \\frac{1}{2}I = S\' I + S + 1$. Thế $I=16, S=4 \\implies 8 S\' + 8 = 16 S\' + 5 \\implies 8 S\' = 3 \\implies S\' = \\frac{3}{8}$.\n' +
          'Hệ số co giãn $E_I = S\' \\cdot \\frac{I}{S} = \\frac{3}{8} \\cdot \\frac{16}{4} = \\frac{3}{2} = 1.5\\%$. Khi thu nhập tăng 1%, tiết kiệm tăng $\\frac{3}{2}\\%$.\n\n' +
          'Dạng 5: Mức chi phí trung bình cực tiểu $AC_{\\min}$ (K46 & K47)\n' +
          'Đề bài: Cho hàm chi phí $C(q) = q^3 - 6q^2 + 15q + 100$. Tìm mức sản lượng $q$ để chi phí trung bình $AC$ đạt tối thiểu.\n' +
          'Lời giải: $AC(q) = q^2 - 6q + 15 + \\frac{100}{q}$. Cho $MC = AC \\iff 3q^2 - 12q + 15 = q^2 - 6q + 15 + \\frac{100}{q} \\iff 2q^2 - 6q = \\frac{100}{q} \\iff q^3 - 3q^2 - 50 = 0 \\implies q = 5$.\n\n' +
          'Dạng 6: Sản lượng biên theo vốn (K51 Mã 204 - Câu 9)\n' +
          'Đề bài: Cho $Q(L, K) = 6 L^{1/2} K^{1/4}$. Tính sản lượng biên theo vốn tại $L=100, K=10000$.\n' +
          'Lời giải: $Q\'_K = \\frac{3}{2} L^{1/2} K^{-3/4} = \\frac{3}{2} (10) (10^{-3}) = \\frac{3}{200}$.\n\n' +
          'Dạng 7: Xấp xỉ tuyến tính hàm hai biến (K51 Mã 204 - Câu 10)\n' +
          'Đề bài: $f(10, 5) = 1000, f\'_x = 2, f\'_y = -3$. Tính gần đúng $f(10.1, 4.8)$.\n' +
          'Lời giải: $f(10.1, 4.8) \\approx 1000 + 2(0.1) + (-3)(-0.2) = 1000.8$.\n\n' +
          'Dạng 8: Cân bằng giá thị trường động (K51 Đợt 2 - Câu 7)\n' +
          'Đề bài: Cho $P\'(t) + 3P(t) = 12$, $P(0) = 5$. Tìm giá ổn định dài hạn khi $t \\to +\\infty$.\n' +
          'Lời giải: $P(t) = 4 + C e^{-3t} \\xrightarrow{t \\to +\\infty} P^* = 4$.'
      },
      {
        heading: '9. Tài Liệu Tham Khảo Chính Thống',
        body: '1. Bài tập Toán Cao Cấp (dành cho khối ngành Kinh tế và Quản trị), Nhóm tác giả, Đại học Kinh tế TP. Hồ Chí Minh (UEH), 2023.\n' +
          '2. Nhập môn Giải tích Toán học (dành cho Thương mại, Kinh tế, Khoa học Đời sống và Khoa học Xã hội), Nhóm dịch giả, NXB Kinh tế TP. Hồ Chí Minh, 2017.\n' +
          '3. Slide Giảng dạy Chương 5: Đạo hàm và Vi phân (Cập nhật) - TS. Phan Ngô Tuấn Anh, Đại học Kinh tế TP. Hồ Chí Minh.'
      }
    ]
  },
  {
    slug: 'lo-trinh-on-toan-cao-cap',
    title: 'Bách Khoa Toàn Thư Lý Thuyết Kinh Tế Vi/Vĩ Mô (Slide Chương 5 PNTA) & Giải Bộ Đề Thi K46-K51 UEH',
    category: 'Chuyên đề nâng cao',
    date: '23/07/2026',
    author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
    keywords: ['Chương 5 PNTA', 'Marginal Cost', 'Marginal Product', 'MRPL', 'Amoroso-Robinson', 'MPC', 'MPS', 'Toán UEH'],
    image: '/images/bg.jpg',
    excerpt: 'Hệ thống hóa 100% toàn bộ lý thuyết gốc Kinh tế Vi mô & Vĩ mô trong Slide Chương 5 của Thầy Phan Ngô Tuấn Anh (MPL, MPK, MRPL, C, FC, VC, MC, AC, AVC, AR, MR, π, Y, C, S, MPC, MPS, Ep, Amoroso-Robinson) và giải bài tập xuyên suốt các kỳ thi K46 đến K51.',
    toc: [
      '1. Khái niệm & Bản chất Toán học của Đại lượng Biên tế',
      '2. Hàm Sản Xuất, Năng Suất Biên (MPL, MPK) & Năng Suất Doanh Thu Biên (MRPL)',
      '3. Cấu trúc Hàm Chi Phí (C, FC, VC, MC, AC, AFC, AVC) & Quy Tắc Điểm Đáy',
      '4. Hàm Doanh Thu, Hàm Lợi Nhuận & Tối Đa Hóa Lợi Nhuận (R, AR, MR, π)',
      '5. Kinh Tế Vĩ Mô: Thu Nhập Quốc Dân (Y), Tiêu Dùng (C), Tiết Kiệm (S), MPC & MPS',
      '6. Lý Thuyết Hệ Số Co Giãn (Elasticity) & Công Thức Amoroso-Robinson',
      '7. Vi Phân Ẩn & Mô Hình Động Trong Kinh Tế',
      '8. Phân Tích & Giải Chi Tiết Bộ Đề Thi K46 - K51 UEH',
      '9. Tài Liệu Tham Khảo Chính Thống'
    ],
    sections: [
      {
        heading: '1. Khái niệm & Bản chất Toán học của Đại lượng Biên tế',
        body: 'Trong tài liệu *Chương 5: Đạo hàm và vi phân (cập nhật)* của Thầy Phan Ngô Tuấn Anh (PNTA), các đại lượng biên tế (Marginal Concepts) phản ánh tốc độ thay đổi của một chỉ tiêu kinh tế khi biến số đầu vào thay đổi $1$ đơn vị.\n\n' +
          'Về mặt toán học, giá trị biên tế chính là đạo hàm bậc nhất của hàm số tương ứng:\n' +
          '$$M_y(x) = y\'(x) = \\frac{\\mathrm{d}y}{\\mathrm{d}x}$$\n\n' +
          '📌 **Ý nghĩa kinh tế cơ bản**:\n' +
          'Cho biết khi biến $x$ tăng thêm $1$ đơn vị từ mức $x_0$, thì biến $y$ sẽ biến đổi một lượng xấp xỉ bằng $y\'(x_0)$ đơn vị.\n\n' +
          '📌 **Ý nghĩa hình học**:\n' +
          'Giá trị biên tế $y\'(x_0)$ chính là hệ số góc (slope) của đường tiếp tuyến với đồ thị hàm số $y = f(x)$ tại điểm $x = x_0$. Chi phí hay năng suất biên càng lớn thì đường tiếp tuyến càng dốc đứng.'
      },
      {
        heading: '2. Hàm Sản Xuất, Năng Suất Biên (MPL, MPK) & Năng Suất Doanh Thu Biên (MRPL)',
        body: 'Sản lượng đầu ra $Q$ của doanh nghiệp phụ thuộc vào các yếu tố đầu vào như Lao động ($L$) và Vốn ($K$).\n\n' +
          '🌾 **1. Năng suất biên theo Lao động (Marginal Product of Labor - $MP_L$)**:\n' +
          '$$MP_L = Q\'_L = \\frac{\\partial Q}{\\partial L}$$\n' +
          '*Ý nghĩa*: Khi tăng sử dụng $1$ đơn vị lao động (giữ nguyên lượng vốn $K$), tổng sản lượng $Q$ sẽ tăng thêm xấp xỉ $MP_L$ đơn vị sản phẩm.\n\n' +
          '🏭 **2. Năng suất biên theo Vốn (Marginal Product of Capital - $MP_K$)**:\n' +
          '$$MP_K = Q\'_K = \\frac{\\partial Q}{\\partial K}$$\n' +
          '*Ý nghĩa*: Khi tăng thêm $1$ đơn vị vốn (giữ nguyên lượng lao động $L$), tổng sản lượng $Q$ sẽ tăng thêm xấp xỉ $MP_K$ đơn vị sản phẩm.\n\n' +
          '👥 **3. Năng suất trung bình (Average Product - AP)**:\n' +
          '$$AP_L = \\frac{Q}{L}, \\quad AP_K = \\frac{Q}{K}$$\n' +
          '*Mối quan hệ giữa $MP_L$ và $AP_L$*: Khi $MP_L > AP_L \\implies AP_L$ đang tăng; khi $MP_L < AP_L \\implies AP_L$ đang giảm; $MP_L = AP_L$ tại điểm cực đại của $AP_L$.\n\n' +
          '💵 **4. Năng suất doanh thu biên (Marginal Revenue Product - $MRP$)**:\n' +
          'Năng suất doanh thu biên tế theo lao động $MRP_L$ đo lường lượng doanh thu tăng thêm khi doanh nghiệp thuê thêm $1$ đơn vị lao động:\n' +
          '$$MRP_L = \\frac{\\mathrm{d}TR}{\\mathrm{d}L} = \\frac{\\mathrm{d}TR}{\\mathrm{d}Q} \\cdot \\frac{\\mathrm{d}Q}{\\mathrm{d}L} = MR \\cdot MP_L$$\n' +
          '$$MRP_K = \\frac{\\mathrm{d}TR}{\\mathrm{d}K} = \\frac{\\mathrm{d}TR}{\\mathrm{d}Q} \\cdot \\frac{\\mathrm{d}Q}{\\mathrm{d}K} = MR \\cdot MP_K$$\n' +
          '*Điều kiện tối đa hóa lợi nhuận khi thuê lao động*: Thuê lao động cho đến khi $MRP_L = w$ (với $w$ là mức tiền lương trên thị trường).'
      },
      {
        heading: '3. Cấu trúc Hàm Chi Phí (C, FC, VC, MC, AC, AFC, AVC) & Quy Tắc Điểm Đáy',
        body: '📊 **1. Phân loại hàm chi phí**:\n' +
          'Tổng chi phí sản xuất $C(q)$ bao gồm Chi phí biến đổi $VC(q)$ và Chi phí cố định $FC$:\n' +
          '$$C(q) = VC(q) + FC$$\n\n' +
          '📈 **2. Chi phí biên (Marginal Cost - MC)**:\n' +
          '$$MC = C\'(q) = VC\'(q) = \\frac{\\mathrm{d}C}{\\mathrm{d}q}$$\n' +
          '*Ý nghĩa*: Cho biết khi tăng sản lượng thêm $1$ đơn vị thì tổng chi phí tăng thêm xấp xỉ $MC$ đơn vị tiền.\n\n' +
          '📉 **3. Chi phí trung bình (Average Cost - AC / ATC)**:\n' +
          '$$AC(q) = \\frac{C(q)}{q} = \\frac{VC(q)}{q} + \\frac{FC}{q} = AVC(q) + AFC(q)$$\n\n' +
          '⚖️ **4. Quy tắc điểm đáy (Bottom Point Rule - $MC = AC$)**:\n' +
          'Đạo hàm của chi phí trung bình theo sản lượng:\n' +
          '$$AC\'(q) = \\frac{\\mathrm{d}}{\\mathrm{d}q}\\left(\\frac{C(q)}{q}\\right) = \\frac{C\'(q) \\cdot q - C(q)}{q^2} = \\frac{MC - AC}{q}$$\n' +
          '- Nếu $MC < AC \\implies AC\'(q) < 0$: Chi phí trung bình đang giảm (Hiệu quả quy mô).\n' +
          '- Nếu $MC > AC \\implies AC\'(q) > 0$: Chi phí trung bình đang tăng.\n' +
          '- Nếu $MC = AC \\implies AC\'(q) = 0$: Đường $MC$ cắt đường $AC$ tại điểm cực tiểu của $AC$ ($AC_{\\min}$).'
      },
      {
        heading: '4. Hàm Doanh Thu, Hàm Lợi Nhuận & Tối Đa Hóa Lợi Nhuận (R, AR, MR, π)',
        body: '💸 **1. Hàm Doanh thu & Doanh thu biên**:\n' +
          'Tổng doanh thu $R(q) = p \\cdot q$. Doanh thu trung bình $AR(q) = \\frac{R(q)}{q} = p$. Doanh thu biên:\n' +
          '$$MR = R\'(q) = \\frac{\\mathrm{d}R}{\\mathrm{d}q}$$\n\n' +
          '🏆 **2. Tối đa hóa lợi nhuận $\\pi(q)$**:\n' +
          '$$\\pi(q) = R(q) - C(q) \\implies \\pi\'(q) = MR - MC$$\n' +
          '*Điều kiện cần*: $\\pi\'(q^*) = 0 \\iff MR = MC$ (Doanh thu biên bằng Chi phí biên).\n\n' +
          '🏢 **3. Phân biệt theo cấu trúc thị trường**:\n' +
          '- **Cạnh tranh hoàn hảo**: Doanh nghiệp chấp nhận giá $p = const \\implies MR = AR = p$. Lợi nhuận cực đại tại $p = MC$.\n' +
          '- **Thị trường Độc quyền**: Doanh nghiệp quyết định giá $p = p(q)$ giảm theo $q \\implies MR = p + q \\cdot p\'(q) < p$.'
      },
      {
        heading: '5. Kinh Tế Vĩ Mô: Thu Nhập Quốc Dân (Y), Tiêu Dùng (C), Tiết Kiệm (S), MPC & MPS',
        body: '🌐 **1. Đẳng thức phân bổ Thu nhập quốc dân**:\n' +
          'Trong mô hình vĩ mô đơn giản, tổng thu nhập quốc dân $Y$ được phân bổ hoàn toàn vào Tiêu dùng $C$ và Tiết kiệm $S$:\n' +
          '$$Y = C(Y) + S(Y)$$\n\n' +
          '🛒 **2. Hàm Tiêu dùng & Khuynh hướng tiêu dùng biên ($MPC$)**:\n' +
          '$$MPC = C\'(Y) = \\frac{\\mathrm{d}C}{\\mathrm{d}Y}$$\n' +
          '*Ý nghĩa*: Khi thu nhập quốc dân $Y$ tăng thêm $1$ đơn vị tiền, tiêu dùng của toàn xã hội sẽ tăng thêm xấp xỉ $MPC$ đơn vị tiền ($0 < MPC < 1$).\n\n' +
          '🏦 **3. Hàm Tiết kiệm & Khuynh hướng tiết kiệm biên ($MPS$)**:\n' +
          '$$S(Y) = Y - C(Y) \\implies MPS = S\'(Y) = \\frac{\\mathrm{d}S}{\\mathrm{d}Y} = 1 - C\'(Y) = 1 - MPC$$\n' +
          '*Mối quan hệ luôn đúng*: $MPC + MPS = 1$.'
      },
      {
        heading: '6. Lý Thuyết Hệ Số Co Giãn (Elasticity) & Công Thức Amoroso-Robinson',
        body: '📐 **1. Định nghĩa Hệ số co giãn tổng quát**:\n' +
          '$$\\varepsilon_{yx} = E_x = f\'(x) \\cdot \\frac{x}{y} = \\frac{\\mathrm{d}y / y}{\\mathrm{d}x / x}$$\n\n' +
          '📉 **2. Hệ số co giãn của Cầu theo Giá ($E_p$)**:\n' +
          '$$E_p = \\frac{\\mathrm{d}Q}{\\mathrm{d}p} \\cdot \\frac{p}{Q}$$\n' +
          '- $|E_p| > 1$: Cầu co giãn nhiều $\\implies$ Tăng giá làm giảm tổng doanh thu ($MR < 0$).\n' +
          '- $|E_p| < 1$: Cầu ít co giãn $\\implies$ Tăng giá làm tăng tổng doanh thu ($MR > 0$).\n' +
          '- $|E_p| = 1$: Co giãn đơn vị $\\implies$ Tổng doanh thu đạt cực đại ($MR = 0$).\n\n' +
          '🤝 **3. Công thức Amoroso-Robinson**:\n' +
          '$$MR = p \\left(1 + \\frac{1}{E_p}\\right)$$\n\n' +
          '📊 **4. Hệ số co giãn của Chi phí (Cost Elasticity - $\\varepsilon_{Cq}$)**:\n' +
          '$$\\varepsilon_{Cq} = C\'(q) \\cdot \\frac{q}{C} = \\frac{MC}{AC}$$'
      },
      {
        heading: '7. Vi Phân Ẩn & Mô Hình Động Trong Kinh Tế',
        body: '🔍 **1. Đạo hàm và Vi phân hàm ẩn $F(x, y) = 0$**:\n' +
          '$$\\frac{\\mathrm{d}y}{\\mathrm{d}x} = -\\frac{F\'_x}{F\'_y}$$\n\n' +
          '🧮 **2. Công thức Xấp xỉ tuyến tính một biến & hai biến**:\n' +
          '$$\\Delta y \\approx f\'(x_0) \\cdot \\Delta x \\implies f(x_0 + \\Delta x) \\approx f(x_0) + f\'(x_0) \\cdot \\Delta x$$\n' +
          '$$f(x_0 + \\Delta x, y_0 + \\Delta y) \\approx f(x_0, y_0) + f\'_x(x_0, y_0) \\Delta x + f\'_y(x_0, y_0) \\Delta y$$\n\n' +
          '📈 **3. Mô hình giá thị trường động qua Phương trình vi phân**:\n' +
          '$$P\'(t) + a P(t) = b \\implies P(t) = \\frac{b}{a} + C e^{-at} \\xrightarrow{t \\to +\\infty} P^* = \\frac{b}{a}$$'
      },
      {
        heading: '8. Phân Tích & Giải Chi Tiết Bộ Đề Thi K46 - K51 UEH',
        body: 'Tổng hợp và giải chi tiết các câu hỏi ứng dụng thực tế từ các kỳ thi K46, K47, K48, K49, K50, K51:\n\n' +
          '📝 **Dạng 1: Chi phí biên của công ty công nghệ (K51 Đợt 2 - Câu 4)**\n' +
          '*Đề bài*: Cho $C(Q) = 500 \\cdot \\ln(Q^2 + 1) + 200$. Tính chi phí biên tại $Q = 3$.\n' +
          '*Lời giải*: $MC = C\'(Q) = 500 \\cdot \\frac{2Q}{Q^2 + 1}$. Tại $Q = 3 \\implies MC(3) = 500 \\cdot \\frac{6}{10} = 300$.\n\n' +
          '📝 **Dạng 2: Phân tích Doanh thu theo $E_p$ (K51 Đợt 2 - Câu 6)**\n' +
          '*Đề bài*: Hệ số co giãn cầu $E_p = -0.5$. Doanh nghiệp tăng giá bán một lượng nhỏ thì doanh thu thay đổi thế nào?\n' +
          '*Lời giải*: Vì $|E_p| = 0.5 < 1$ (cầu ít co giãn), khi tăng giá thì lượng cầu giảm ít hơn tỷ lệ tăng giá, do đó tổng doanh thu tăng ($MR > 0$). Chọn B.\n\n' +
          '📝 **Dạng 3: Tỷ lệ thay thế kỹ thuật biên MRTS (K51 Đợt 2 - Câu 2)**\n' +
          '*Đề bài*: $Q = 2K^2 + 3L^2 + KL$. Tại $K=10, L=5$, tăng $1$ đơn vị lao động ($dL=1$) giữ nguyên sản lượng ($dQ=0$) thì $K$ giảm bao nhiêu?\n' +
          '*Lời giải*: $dQ = Q\'_K dK + Q\'_L dL = 0 \\implies dK = -\\frac{Q\'_L}{Q\'_K} dL = -\\frac{6L+K}{4K+L} = -\\frac{40}{45} = -\\frac{8}{9}$. Vốn giảm $8/9$ đơn vị.\n\n' +
          '📝 **Dạng 4: Tiết kiệm và Thu nhập trong bài toán đạo hàm ẩn (K49 & K51 - Câu 4)**\n' +
          '*Đề bài*: $S^2 + \\frac{1}{4}I^2 = SI + I$. Tại mức thu nhập $I = 16$, tiết kiệm tăng thêm bao nhiêu $\%$ khi thu nhập tăng $1\\%$?\n' +
          '*Lời giải*: Tính $S$ tại $I=16$: $S^2 + 64 = 16S + 16 \\implies S^2 - 16S + 48 = 0 \\implies S = 4$ (vì $S \\le 30\\% I = 4.8$).\n' +
          'Lấy đạo hàm hai vế theo $I$: $2S S\' + \\frac{1}{2}I = S\' I + S + 1$. Thế $I=16, S=4 \\implies 8 S\' + 8 = 16 S\' + 5 \\implies 8 S\' = 3 \\implies S\' = \\frac{3}{8}$.\n' +
          'Hệ số co giãn $E_I = S\' \\cdot \\frac{I}{S} = \\frac{3}{8} \\cdot \\frac{16}{4} = \\frac{3}{2} = 1.5\\%$. Khi thu nhập tăng $1\\%$, tiết kiệm tăng $\\frac{3}{2}\\%$.\n\n' +
          '📝 **Dạng 5: Mức chi phí trung bình cực tiểu $AC_{\\min}$ (K46 & K47)**\n' +
          '*Đề bài*: Cho hàm chi phí $C(q) = q^3 - 6q^2 + 15q + 100$. Tìm mức sản lượng $q$ để chi phí trung bình $AC$ đạt tối thiểu.\n' +
          '*Lời giải*: $AC(q) = q^2 - 6q + 15 + \\frac{100}{q}$. Cho $MC = AC \\iff 3q^2 - 12q + 15 = q^2 - 6q + 15 + \\frac{100}{q} \\iff 2q^2 - 6q = \\frac{100}{q} \\iff q^3 - 3q^2 - 50 = 0 \\implies q = 5$.\n\n' +
          '📝 **Dạng 6: Sản lượng biên theo vốn (K51 Mã 204 - Câu 9)**\n' +
          '*Đề bài*: Cho $Q(L, K) = 6 L^{1/2} K^{1/4}$. Tính sản lượng biên theo vốn tại $L=100, K=10000$.\n' +
          '*Lời giải*: $Q\'_K = \\frac{3}{2} L^{1/2} K^{-3/4} = \\frac{3}{2} (10) (10^{-3}) = \\frac{3}{200}$.\n\n' +
          '📝 **Dạng 7: Xấp xỉ tuyến tính hàm hai biến (K51 Mã 204 - Câu 10)**\n' +
          '*Đề bài*: $f(10, 5) = 1000, f\'_x = 2, f\'_y = -3$. Tính gần đúng $f(10.1, 4.8)$.\n' +
          '*Lời giải*: $f(10.1, 4.8) \\approx 1000 + 2(0.1) + (-3)(-0.2) = 1000.8$.\n\n' +
          '📝 **Dạng 8: Cân bằng giá thị trường động (K51 Đợt 2 - Câu 7)**\n' +
          '*Đề bài*: Cho $P\'(t) + 3P(t) = 12$, $P(0) = 5$. Tìm giá ổn định dài hạn khi $t \\to +\\infty$.\n' +
          '*Lời giải*: $P(t) = 4 + C e^{-3t} \\xrightarrow{t \\to +\\infty} P^* = 4$.'
      },
      {
        heading: '9. Tài Liệu Tham Khảo Chính Thống',
        body: '1. *Bài tập Toán Cao Cấp* (dành cho khối ngành Kinh tế và Quản trị), Nhóm tác giả, Đại học Kinh tế TP. Hồ Chí Minh (UEH), 2023.\n' +
          '2. *Nhập môn Giải tích Toán học* (dành cho Thương mại, Kinh tế, Khoa học Đời sống và Khoa học Xã hội), Nhóm dịch giả, NXB Kinh tế TP. Hồ Chí Minh, 2017.\n' +
          '3. Slide Giảng dạy *Chương 5: Đạo hàm và Vi phân (Cập nhật)* - TS. Phan Ngô Tuấn Anh, Đại học Kinh tế TP. Hồ Chí Minh.'
      }
    ]
  },
  {
    slug: 'lo-trinh-on-toan-cao-cap',
    title: 'Bách Khoa Toàn Thư Lý Thuyết Kinh Tế Vi/Vĩ Mô (Slide Chương 5 PNTA) & Bộ Đề Thi K46-K51 UEH',
    category: 'Chuyên đề nâng cao',
    date: '23/07/2026',
    author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
    keywords: ['Chương 5 PNTA', 'Marginal Cost', 'Marginal Product', 'MRPL', 'Amoroso-Robinson', 'MPC', 'MPS', 'Toán UEH'],
    image: '/images/bg.jpg',
    excerpt: 'Hệ thống hóa 100% toàn bộ lý thuyết gốc Kinh tế Vi mô & Vĩ mô trong Slide Chương 5 của Thầy Phan Ngô Tuấn Anh (MPL, MPK, MRPL, C, FC, VC, MC, AC, AVC, AR, MR, π, Y, C, S, MPC, MPS, Ep, Amoroso-Robinson) và giải bài tập xuyên suốt các kỳ thi K46 đến K51.',
    toc: [
      '1. Khái niệm & Bản chất Toán học của Đại lượng Biên tế (Marginal Analysis)',
      '2. Hàm Sản Xuất, Năng Suất Biên (MPL, MPK) & Năng Suất Doanh Thu Biên (MRPL)',
      '3. Cấu trúc Hàm Chi Phí (C, FC, VC, MC, AC, AFC, AVC) & Quy Tắc Điểm Đáy',
      '4. Hàm Doanh Thu, Hàm Lợi Nhuận & Tối Đa Hóa Lợi Nhuận (R, AR, MR, π)',
      '5. Kinh Tế Vĩ Mô: Thu Nhập Quốc Dân (Y), Tiêu Dùng (C), Tiết Kiệm (S), MPC & MPS',
      '6. Lý Thuyết Hệ Số Co Giãn (Elasticity) & Công Thức Amoroso-Robinson',
      '7. Vi Phân Ẩn & Xấp Xỉ Tuyến Tính Trong Kinh Tế',
      '8. Phân Tích & Giải Chi Tiết Các Dạng Bài Thi Thực Tế Xuyên Suốt K46 - K51',
      '9. Tổng Kết & Lộ Trình Ôn Tập Đạt Điểm Tuyệt Đối'
    ],
    sections: [
      {
        heading: '1. Khái niệm & Bản chất Toán học của Đại lượng Biên tế (Marginal Analysis)',
        body: 'Trong tài liệu *Chương 5: Đạo hàm và vi phân (cập nhật)* của Thầy Phan Ngô Tuấn Anh (PNTA), các đại lượng biên tế (Marginal Concepts) phản ánh tốc độ thay đổi của một chỉ tiêu kinh tế khi một biến số đầu vào thay đổi $1$ đơn vị.\n\n' +
          'Về mặt toán học, **giá trị biên tế chính là đạo hàm bậc nhất** của hàm số tương ứng:\n' +
          '$$M_y(x) = y\'(x) = \\frac{\\mathrm{d}y}{\\mathrm{d}x}$$\n\n' +
          '📌 **Ý nghĩa kinh tế cơ bản**:\n' +
          'Cho biết khi biến $x$ tăng thêm $1$ đơn vị từ mức $x_0$, thì biến $y$ sẽ biến đổi một lượng xấp xỉ bằng $y\'(x_0)$ đơn vị.\n\n' +
          '📌 **Ý nghĩa hình học**:\n' +
          'Giá trị biên tế $y\'(x_0)$ chính là **hệ số góc (slope)** của đường tiếp tuyến với đồ thị hàm số $y = f(x)$ tại điểm $x = x_0$. Chi phí hay năng suất biên càng lớn thì đường tiếp tuyến càng dốc đứng.'
      },
      {
        heading: '2. Hàm Sản Xuất, Năng Suất Biên (MPL, MPK) & Năng Suất Doanh Thu Biên (MRPL)',
        body: 'Sản lượng đầu ra $Q$ của một doanh nghiệp phụ thuộc vào các yếu tố đầu vào như Lao động ($L$) và Vốn ($K$).\n\n' +
          '🌾 **1. Năng suất biên theo Lao động (Marginal Product of Labor - $MP_L$)**:\n' +
          '$$MP_L = Q\'_L = \\frac{\\partial Q}{\\partial L}$$\n' +
          '*Ý nghĩa*: Khi tăng sử dụng $1$ đơn vị lao động (giữ nguyên vốn $K$), tổng sản lượng $Q$ sẽ tăng thêm xấp xỉ $MP_L$ đơn vị sản phẩm.\n\n' +
          '🏭 **2. Năng suất biên theo Vốn (Marginal Product of Capital - $MP_K$)**:\n' +
          '$$MP_K = Q\'_K = \\frac{\\partial Q}{\\partial K}$$\n' +
          '*Ý nghĩa*: Khi tăng thêm $1$ đơn vị vốn (giữ nguyên lao động $L$), tổng sản lượng $Q$ sẽ tăng thêm xấp xỉ $MP_K$ đơn vị sản phẩm.\n\n' +
          '👥 **3. Năng suất trung bình (Average Product - AP)**:\n' +
          '$$AP_L = \\frac{Q}{L}, \\quad AP_K = \\frac{Q}{K}$$\n' +
          '*Mối quan hệ giữa $MP_L$ và $AP_L$*: Khi $MP_L > AP_L \\implies AP_L$ đang tăng; khi $MP_L < AP_L \\implies AP_L$ đang giảm; $MP_L = AP_L$ tại **điểm cực đại của $AP_L$**.\n\n' +
          '💵 **4. Năng suất doanh thu biên (Marginal Revenue Product - $MRP$)**:\n' +
          'Năng suất doanh thu biên tế theo lao động $MRP_L$ đo lường lượng doanh thu tăng thêm khi doanh nghiệp thuê thêm $1$ đơn vị lao động:\n' +
          '$$MRP_L = \\frac{\\mathrm{d}TR}{\\mathrm{d}L} = \\frac{\\mathrm{d}TR}{\\mathrm{d}Q} \\cdot \\frac{\\mathrm{d}Q}{\\mathrm{d}L} = MR \\cdot MP_L$$\n' +
          '$$MRP_K = \\frac{\\mathrm{d}TR}{\\mathrm{d}K} = \\frac{\\mathrm{d}TR}{\\mathrm{d}Q} \\cdot \\frac{\\mathrm{d}Q}{\\mathrm{d}K} = MR \\cdot MP_K$$\n' +
          '*Điều kiện tối đa hóa lợi nhuận khi thuê lao động*: Thuê lao động cho đến khi $MRP_L = w$ (với $w$ là mức tiền lương trên thị trường).'
      },
      {
        heading: '3. Cấu trúc Hàm Chi Phí (C, FC, VC, MC, AC, AFC, AVC) & Quy Tắc Điểm Đáy',
        body: '📊 **1. Phân loại hàm chi phí**:\n' +
          'Tổng chi phí sản xuất $C(q)$ bao gồm Chi phí biến đổi $VC(q)$ và Chi phí cố định $FC$:\n' +
          '$$C(q) = VC(q) + FC$$\n\n' +
          '📈 **2. Chi phí biên (Marginal Cost - MC)**:\n' +
          '$$MC = C\'(q) = VC\'(q) = \\frac{\\mathrm{d}C}{\\mathrm{d}q}$$\n' +
          '*Ý nghĩa*: Cho biết khi tăng sản lượng thêm $1$ đơn vị thì tổng chi phí tăng thêm xấp xỉ $MC$ đơn vị tiền.\n\n' +
          '📉 **3. Chi phí trung bình (Average Cost - AC / ATC)**:\n' +
          '$$AC(q) = \\frac{C(q)}{q} = \\frac{VC(q)}{q} + \\frac{FC}{q} = AVC(q) + AFC(q)$$\n\n' +
          '⚖️ **4. Quy tắc điểm đáy (Bottom Point Rule - $MC = AC$)**:\n' +
          'Đạo hàm của chi phí trung bình theo sản lượng:\n' +
          '$$AC\'(q) = \\frac{\\mathrm{d}}{\\mathrm{d}q}\\left(\\frac{C(q)}{q}\\right) = \\frac{C\'(q) \\cdot q - C(q)}{q^2} = \\frac{MC - AC}{q}$$\n' +
          '- Nếu $MC < AC \\implies AC\'(q) < 0$: Chi phí trung bình **đang giảm** (Hiệu quả quy mô).\n' +
          '- Nếu $MC > AC \\implies AC\'(q) > 0$: Chi phí trung bình **đang tăng**.\n' +
          '- Nếu $MC = AC \\implies AC\'(q) = 0$: Đường $MC$ **cắt đường $AC$ tại điểm cực tiểu của $AC$** ($AC_{\\min}$).'
      },
      {
        heading: '4. Hàm Doanh Thu, Hàm Lợi Nhuận & Tối Đa Hóa Lợi Nhuận (R, AR, MR, π)',
        body: '💸 **1. Hàm Doanh thu & Doanh thu biên**:\n' +
          'Tổng doanh thu $R(q) = p \\cdot q$. Doanh thu trung bình $AR(q) = \\frac{R(q)}{q} = p$. Doanh thu biên:\n' +
          '$$MR = R\'(q) = \\frac{\\mathrm{d}R}{\\mathrm{d}q}$$\n\n' +
          '🏆 **2. Tối đa hóa lợi nhuận $\\pi(q)$**:\n' +
          '$$\\pi(q) = R(q) - C(q) \\implies \\pi\'(q) = MR - MC$$\n' +
          '*Điều kiện cần*: $\\pi\'(q^*) = 0 \\iff MR = MC$ (Doanh thu biên bằng Chi phí biên).\n\n' +
          '🏢 **3. Phân biệt theo cấu trúc thị trường**:\n' +
          '- **Cạnh tranh hoàn hảo**: Doanh nghiệp chấp nhận giá $p = const \\implies MR = AR = p$. Lợi nhuận cực đại tại $p = MC$.\n' +
          '- **Thị trường Độc quyền**: Doanh nghiệp quyết định giá $p = p(q)$ giảm theo $q \\implies MR = p + q \\cdot p\'(q) < p$.'
      },
      {
        heading: '5. Kinh Tế Vĩ Mô: Thu Nhập Quốc Dân (Y), Tiêu Dùng (C), Tiết Kiệm (S), MPC & MPS',
        body: '🌐 **1. Đẳng thức phân bổ Thu nhập quốc dân**:\n' +
          'Trong mô hình vĩ mô đơn giản, tổng thu nhập quốc dân $Y$ được phân bổ hoàn toàn vào Tiêu dùng $C$ và Tiết kiệm $S$:\n' +
          '$$Y = C(Y) + S(Y)$$\n\n' +
          '🛒 **2. Hàm Tiêu dùng & Khuynh hướng tiêu dùng biên ($MPC$)**:\n' +
          '$$MPC = C\'(Y) = \\frac{\\mathrm{d}C}{\\mathrm{d}Y}$$\n' +
          '*Ý nghĩa*: Khi thu nhập quốc dân $Y$ tăng thêm $1$ đơn vị tiền, tiêu dùng của toàn xã hội sẽ tăng thêm xấp xỉ $MPC$ đơn vị tiền ($0 < MPC < 1$).\n\n' +
          '🏦 **3. Hàm Tiết kiệm & Khuynh hướng tiết kiệm biên ($MPS$)**:\n' +
          '$$S(Y) = Y - C(Y) \\implies MPS = S\'(Y) = \\frac{\\mathrm{d}S}{\\mathrm{d}Y} = 1 - C\'(Y) = 1 - MPC$$\n' +
          '*Mối quan hệ luôn đúng*: $MPC + MPS = 1$.'
      },
      {
        heading: '6. Lý Thuyết Hệ Số Co Giãn (Elasticity) & Công Thức Amoroso-Robinson',
        body: '📐 **1. Định nghĩa Hệ số co giãn tổng quát**:\n' +
          '$$\\varepsilon_{yx} = E_x = f\'(x) \\cdot \\frac{x}{y} = \\frac{\\mathrm{d}y / y}{\\mathrm{d}x / x}$$\n\n' +
          '📉 **2. Hệ số co giãn của Cầu theo Giá ($E_p$)**:\n' +
          '$$E_p = \\frac{\\mathrm{d}Q}{\\mathrm{d}p} \\cdot \\frac{p}{Q}$$\n' +
          '- $|E_p| > 1$: Cầu co giãn nhiều $\\implies$ Tăng giá làm **giảm tổng doanh thu** ($MR < 0$).\n' +
          '- $|E_p| < 1$: Cầu ít co giãn $\\implies$ Tăng giá làm **tăng tổng doanh thu** ($MR > 0$).\n' +
          '- $|E_p| = 1$: Co giãn đơn vị $\\implies$ Tổng doanh thu đạt **cực đại** ($MR = 0$).\n\n' +
          '🤝 **3. Công thức Amoroso-Robinson**:\n' +
          '$$MR = p \\left(1 + \\frac{1}{E_p}\\right)$$\n\n' +
          '📊 **4. Hệ số co giãn của Chi phí (Cost Elasticity - $\\varepsilon_{Cq}$)**:\n' +
          '$$\\varepsilon_{Cq} = C\'(q) \\cdot \\frac{q}{C} = \\frac{MC}{AC}$$'
      },
      {
        heading: '7. Vi Phân Ẩn & Xấp Xỉ Tuyến Tính Trong Kinh Tế',
        body: '🔍 **1. Đạo hàm và Vi phân hàm ẩn $F(x, y) = 0$**:\n' +
          '$$\\frac{\\mathrm{d}y}{\\mathrm{d}x} = -\\frac{F\'_x}{F\'_y}$$\n\n' +
          '🧮 **2. Công thức Xấp xỉ tuyến tính một biến & hai biến**:\n' +
          '$$\\Delta y \\approx f\'(x_0) \\cdot \\Delta x \\implies f(x_0 + \\Delta x) \\approx f(x_0) + f\'(x_0) \\cdot \\Delta x$$\n' +
          '$$f(x_0 + \\Delta x, y_0 + \\Delta y) \\approx f(x_0, y_0) + f\'_x(x_0, y_0) \\Delta x + f\'_y(x_0, y_0) \\Delta y$$'
      },
      {
        heading: '8. Phân Tích & Giải Chi Tiết Các Dạng Bài Thi Thực Tế Xuyên Suốt K46 - K51',
        body: 'Tổng hợp và giải chi tiết các câu hỏi ứng dụng thực tế từ các kỳ thi K46, K47, K48, K49, K50, K51:\n\n' +
          '📝 **Dạng 1: Chi phí biên của công ty công nghệ (K51 Đợt 2 - Câu 4)**\n' +
          '*Đề bài*: Cho $C(Q) = 500 \\cdot \\ln(Q^2 + 1) + 200$. Tính chi phí biên tại $Q = 3$.\n' +
          '*Lời giải*: $MC = C\'(Q) = 500 \\cdot \\frac{2Q}{Q^2 + 1}$. Tại $Q = 3 \\implies MC(3) = 500 \\cdot \\frac{6}{10} = 300$.\n\n' +
          '📝 **Dạng 2: Phân tích Doanh thu theo $E_p$ (K51 Đợt 2 - Câu 6)**\n' +
          '*Đề bài*: Hệ số co giãn cầu $E_p = -0.5$. Doanh nghiệp tăng giá bán một lượng nhỏ thì doanh thu thay đổi thế nào?\n' +
          '*Lời giải*: Vì $|E_p| = 0.5 < 1$ (cầu ít co giãn), khi tăng giá thì lượng cầu giảm ít hơn tỷ lệ tăng giá, do đó tổng doanh thu tăng ($MR > 0$). Chọn B.\n\n' +
          '📝 **Dạng 3: Tỷ lệ thay thế kỹ thuật biên MRTS (K51 Đợt 2 - Câu 2)**\n' +
          '*Đề bài*: $Q = 2K^2 + 3L^2 + KL$. Tại $K=10, L=5$, tăng $1$ đơn vị lao động ($dL=1$) giữ nguyên sản lượng ($dQ=0$) thì $K$ giảm bao nhiêu?\n' +
          '*Lời giải*: $dQ = Q\'_K dK + Q\'_L dL = 0 \\implies dK = -\\frac{Q\'_L}{Q\'_K} dL = -\\frac{6L+K}{4K+L} = -\\frac{40}{45} = -\\frac{8}{9}$. Vốn giảm $8/9$ đơn vị.\n\n' +
          '📝 **Dạng 4: Tiết kiệm và Thu nhập trong bài toán đạo hàm ẩn (K49 & K51 - Câu 4)**\n' +
          '*Đề bài*: $S^2 + \\frac{1}{4}I^2 = SI + I$. Tại mức thu nhập $I = 16$, tiết kiệm tăng thêm bao nhiêu $\%$ khi thu nhập tăng $1\\%$?\n' +
          '*Lời giải*: Tính $S$ tại $I=16$: $S^2 + 64 = 16S + 16 \\implies S^2 - 16S + 48 = 0 \\implies S = 4$ (vì $S \\le 30\\% I = 4.8$).\n' +
          'Lấy đạo hàm hai vế theo $I$: $2S S\' + \\frac{1}{2}I = S\' I + S + 1$. Thế $I=16, S=4 \\implies 8 S\' + 8 = 16 S\' + 5 \\implies 8 S\' = 3 \\implies S\' = \\frac{3}{8}$.\n' +
          'Hệ số co giãn $E_I = S\' \\cdot \\frac{I}{S} = \\frac{3}{8} \\cdot \\frac{16}{4} = \\frac{3}{2} = 1.5\\%$. Khi thu nhập tăng $1\\%$, tiết kiệm tăng $\\frac{3}{2}\\%$.\n\n' +
          '📝 **Dạng 5: Mức chi phí trung bình cực tiểu $AC_{\\min}$ (K46 & K47)**\n' +
          '*Đề bài*: Cho hàm chi phí $C(q) = q^3 - 6q^2 + 15q + 100$. Tìm mức sản lượng $q$ để chi phí trung bình $AC$ đạt tối thiểu.\n' +
          '*Lời giải*: $AC(q) = q^2 - 6q + 15 + \\frac{100}{q}$. Cho $MC = AC \\iff 3q^2 - 12q + 15 = q^2 - 6q + 15 + \\frac{100}{q} \\iff 2q^2 - 6q = \\frac{100}{q} \\iff q^3 - 3q^2 - 50 = 0 \\implies q = 5$.\n\n' +
          '📝 **Dạng 6: Sản lượng biên theo vốn (K51 Mã 204 - Câu 9)**\n' +
          '*Đề bài*: Cho $Q(L, K) = 6 L^{1/2} K^{1/4}$. Tính sản lượng biên theo vốn tại $L=100, K=10000$.\n' +
          '*Lời giải*: $Q\'_K = \\frac{3}{2} L^{1/2} K^{-3/4} = \\frac{3}{2} (10) (10^{-3}) = \\frac{3}{200}$.\n\n' +
          '📝 **Dạng 7: Xấp xỉ tuyến tính hàm hai biến (K51 Mã 204 - Câu 10)**\n' +
          '*Đề bài*: $f(10, 5) = 1000, f\'_x = 2, f\'_y = -3$. Tính gần đúng $f(10.1, 4.8)$.\n' +
          '*Lời giải*: $f(10.1, 4.8) \\approx 1000 + 2(0.1) + (-3)(-0.2) = 1000.8$.\n\n' +
          '📝 **Dạng 8: Cân bằng giá thị trường động (K51 Đợt 2 - Câu 7)**\n' +
          '*Đề bài*: Cho $P\'(t) + 3P(t) = 12$, $P(0) = 5$. Tìm giá ổn định dài hạn khi $t \\to +\\infty$.\n' +
          '*Lời giải*: $P(t) = 4 + C e^{-3t} \\xrightarrow{t \\to +\\infty} P^* = 4$.'
      },
      {
        heading: '9. Tổng Kết & Lộ Trình Ôn Tập Đạt Điểm Tuyệt Đối',
        body: 'Tóm lại, để đạt điểm tuyệt đối 9-10 trong các bài thi Toán Ứng Dụng UEH qua các khóa K46-K51, sinh viên cần làm chủ 2 bước:\n\n' +
          '1. **Nắm chắc định nghĩa & ý nghĩa kinh tế gốc** của các hàm số ($C, R, \\pi, Q, S, I$) và các đại lượng biên tế ($MC, AC, MR, MP_L, MP_K, MRP_L, MPC, MPS, E_p$).\n' +
          '2. **Thực hành phản xạ tính toán** trên hệ thống phòng thi trắc nghiệm tương tác 30 phút của UEH TCC.'
      }
    ]
  },
  {
    slug: 'lo-trinh-on-toan-cao-cap',
    title: 'Bách Khoa Toàn Thư Lý Thuyết Kinh Tế Vi/Vĩ Mô (Slide Chương 5 PNTA) & Bộ Đề Thi K46-K51 UEH',
    category: 'Chuyên đề nâng cao',
    date: '23/07/2026',
    author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
    keywords: ['Chương 5 PNTA', 'Marginal Cost', 'Marginal Product', 'MRPL', 'Amoroso-Robinson', 'MPC', 'MPS', 'Toán UEH'],
    image: '/images/bg.jpg',
    excerpt: 'Hệ thống hóa 100% toàn bộ lý thuyết gốc Kinh tế Vi mô & Vĩ mô trong Slide Chương 5 của Thầy Phan Ngô Tuấn Anh (MPL, MPK, MRPL, C, FC, VC, MC, AC, AVC, AR, MR, π, Y, C, S, MPC, MPS, Ep, Amoroso-Robinson) kèm sơ đồ trực quan và giải bài tập xuyên suốt các kỳ thi K46 đến K51.',
    toc: [
      '1. Khái niệm & Bản chất Toán học của Đại lượng Biên tế (Marginal Analysis)',
      '2. Hàm Sản Xuất, Năng Suất Biên (MPL, MPK) & Năng Suất Doanh Thu Biên (MRPL)',
      '3. Cấu trúc Hàm Chi Phí (C, FC, VC, MC, AC, AFC, AVC) & Quy Tắc Điểm Đáy',
      '4. Hàm Doanh Thu, Hàm Lợi Nhuận & Tối Đa Hóa Lợi Nhuận (R, AR, MR, π)',
      '5. Kinh Tế Vĩ Mô: Thu Nhập Quốc Dân (Y), Tiêu Dùng (C), Tiết Kiệm (S), MPC & MPS',
      '6. Lý Thuyết Hệ Số Co Giãn (Elasticity) & Công Thức Amoroso-Robinson',
      '7. Vi Phân Ẩn & Xấp Xỉ Tuyến Tính Trong Kinh Tế',
      '8. Phân Tích & Giải Chi Tiết Các Dạng Bài Thi Thực Tế Xuyên Suốt K46 - K51',
      '9. Tổng Kết & Lộ Trình Ôn Tập Đạt Điểm Tuyệt Đối'
    ],
    sections: [
      {
        heading: '1. Khái niệm & Bản chất Toán học của Đại lượng Biên tế (Marginal Analysis)',
        body: 'Trong tài liệu *Chương 5: Đạo hàm và vi phân (cập nhật)* của Thầy Phan Ngô Tuấn Anh (PNTA), các đại lượng biên tế (Marginal Concepts) phản ánh tốc độ thay đổi của một chỉ tiêu kinh tế khi một biến số đầu vào thay đổi $1$ đơn vị.\n\n' +
          'Về mặt toán học, **giá trị biên tế chính là đạo hàm bậc nhất** của hàm số tương ứng:\n' +
          '$$M_y(x) = y\'(x) = \\frac{\\mathrm{d}y}{\\mathrm{d}x}$$\n\n' +
          '📌 **Ý nghĩa kinh tế cơ bản**:\n' +
          'Cho biết khi biến $x$ tăng thêm $1$ đơn vị từ mức $x_0$, thì biến $y$ sẽ biến đổi một lượng xấp xỉ bằng $y\'(x_0)$ đơn vị.\n\n' +
          '📌 **Ý nghĩa hình học**:\n' +
          'Giá trị biên tế $y\'(x_0)$ chính là **hệ số góc (slope)** của đường tiếp tuyến với đồ thị hàm số $y = f(x)$ tại điểm $x = x_0$. Chi phí hay năng suất biên càng lớn thì đường tiếp tuyến càng dốc đứng.'
      },
      {
        heading: '2. Hàm Sản Xuất, Năng Suất Biên (MPL, MPK) & Năng Suất Doanh Thu Biên (MRPL)',
        body: 'Sản lượng đầu ra $Q$ của một doanh nghiệp phụ thuộc vào các yếu tố đầu vào như Lao động ($L$) và Vốn ($K$).\n\n' +
          '🌾 **1. Năng suất biên theo Lao động (Marginal Product of Labor - $MP_L$)**:\n' +
          '$$MP_L = Q\'_L = \\frac{\\partial Q}{\\partial L}$$\n' +
          '*Ý nghĩa*: Khi tăng sử dụng $1$ đơn vị lao động (giữ nguyên vốn $K$), tổng sản lượng $Q$ sẽ tăng thêm xấp xỉ $MP_L$ đơn vị sản phẩm.\n\n' +
          '🏭 **2. Năng suất biên theo Vốn (Marginal Product of Capital - $MP_K$)**:\n' +
          '$$MP_K = Q\'_K = \\frac{\\partial Q}{\\partial K}$$\n' +
          '*Ý nghĩa*: Khi tăng thêm $1$ đơn vị vốn (giữ nguyên lao động $L$), tổng sản lượng $Q$ sẽ tăng thêm xấp xỉ $MP_K$ đơn vị sản phẩm.\n\n' +
          '👥 **3. Năng suất trung bình (Average Product - AP)**:\n' +
          '$$AP_L = \\frac{Q}{L}, \\quad AP_K = \\frac{Q}{K}$$\n' +
          '*Mối quan hệ giữa $MP_L$ và $AP_L$*: Khi $MP_L > AP_L \\implies AP_L$ đang tăng; khi $MP_L < AP_L \\implies AP_L$ đang giảm; $MP_L = AP_L$ tại **điểm cực đại của $AP_L$**.\n\n' +
          '![Sơ đồ Năng suất biên MPL và Năng suất trung bình APL](/images/mpl_apl_diagram.png)\n\n' +
          '💵 **4. Năng suất doanh thu biên (Marginal Revenue Product - $MRP$)**:\n' +
          'Năng suất doanh thu biên tế theo lao động $MRP_L$ đo lường lượng doanh thu tăng thêm khi doanh nghiệp thuê thêm $1$ đơn vị lao động:\n' +
          '$$MRP_L = \\frac{\\mathrm{d}TR}{\\mathrm{d}L} = \\frac{\\mathrm{d}TR}{\\mathrm{d}Q} \\cdot \\frac{\\mathrm{d}Q}{\\mathrm{d}L} = MR \\cdot MP_L$$\n' +
          '$$MRP_K = \\frac{\\mathrm{d}TR}{\\mathrm{d}K} = \\frac{\\mathrm{d}TR}{\\mathrm{d}Q} \\cdot \\frac{\\mathrm{d}Q}{\\mathrm{d}K} = MR \\cdot MP_K$$\n' +
          '*Điều kiện tối đa hóa lợi nhuận khi thuê lao động*: Thuê lao động cho đến khi $MRP_L = w$ (với $w$ là mức tiền lương trên thị trường).'
      },
      {
        heading: '3. Cấu trúc Hàm Chi Phí (C, FC, VC, MC, AC, AFC, AVC) & Quy Tắc Điểm Đáy',
        body: '📊 **1. Phân loại hàm chi phí**:\n' +
          'Tổng chi phí sản xuất $C(q)$ bao gồm Chi phí biến đổi $VC(q)$ và Chi phí cố định $FC$:\n' +
          '$$C(q) = VC(q) + FC$$\n\n' +
          '📈 **2. Chi phí biên (Marginal Cost - MC)**:\n' +
          '$$MC = C\'(q) = VC\'(q) = \\frac{\\mathrm{d}C}{\\mathrm{d}q}$$\n' +
          '*Ý nghĩa*: Cho biết khi tăng sản lượng thêm $1$ đơn vị thì tổng chi phí tăng thêm xấp xỉ $MC$ đơn vị tiền.\n\n' +
          '📉 **3. Chi phí trung bình (Average Cost - AC / ATC)**:\n' +
          '$$AC(q) = \\frac{C(q)}{q} = \\frac{VC(q)}{q} + \\frac{FC}{q} = AVC(q) + AFC(q)$$\n\n' +
          '⚖️ **4. Quy tắc điểm đáy (Bottom Point Rule - $MC = AC$)**:\n' +
          'Đạo hàm của chi phí trung bình theo sản lượng:\n' +
          '$$AC\'(q) = \\frac{\\mathrm{d}}{\\mathrm{d}q}\\left(\\frac{C(q)}{q}\\right) = \\frac{C\'(q) \\cdot q - C(q)}{q^2} = \\frac{MC - AC}{q}$$\n' +
          '- Nếu $MC < AC \\implies AC\'(q) < 0$: Chi phí trung bình **đang giảm** (Hiệu quả quy mô).\n' +
          '- Nếu $MC > AC \\implies AC\'(q) > 0$: Chi phí trung bình **đang tăng**.\n' +
          '- Nếu $MC = AC \\implies AC\'(q) = 0$: Đường $MC$ **cắt đường $AC$ tại điểm cực tiểu của $AC$** ($AC_{\\min}$).\n\n' +
          '![Sơ đồ Chi phí biên MC cắt Chi phí trung bình AC tại điểm cực tiểu](/images/mc_ac_diagram.png)'
      },
      {
        heading: '4. Hàm Doanh Thu, Hàm Lợi Nhuận & Tối Đa Hóa Lợi Nhuận (R, AR, MR, π)',
        body: '💸 **1. Hàm Doanh thu & Doanh thu biên**:\n' +
          'Tổng doanh thu $R(q) = p \\cdot q$. Doanh thu trung bình $AR(q) = \\frac{R(q)}{q} = p$. Doanh thu biên:\n' +
          '$$MR = R\'(q) = \\frac{\\mathrm{d}R}{\\mathrm{d}q}$$\n\n' +
          '🏆 **2. Tối đa hóa lợi nhuận $\\pi(q)$**:\n' +
          '$$\\pi(q) = R(q) - C(q) \\implies \\pi\'(q) = MR - MC$$\n' +
          '*Điều kiện cần*: $\\pi\'(q^*) = 0 \\iff MR = MC$ (Doanh thu biên bằng Chi phí biên).\n\n' +
          '🏢 **3. Phân biệt theo cấu trúc thị trường**:\n' +
          '- **Cạnh tranh hoàn hảo**: Doanh nghiệp chấp nhận giá $p = const \\implies MR = AR = p$. Lợi nhuận cực đại tại $p = MC$.\n' +
          '- **Thị trường Độc quyền**: Doanh nghiệp quyết định giá $p = p(q)$ giảm theo $q \\implies MR = p + q \\cdot p\'(q) < p$.'
      },
      {
        heading: '5. Kinh Tế Vĩ Mô: Thu Nhập Quốc Dân (Y), Tiêu Dùng (C), Tiết Kiệm (S), MPC & MPS',
        body: '🌐 **1. Đẳng thức phân bổ Thu nhập quốc dân**:\n' +
          'Trong mô hình vĩ mô đơn giản, tổng thu nhập quốc dân $Y$ được phân bổ hoàn toàn vào Tiêu dùng $C$ và Tiết kiệm $S$:\n' +
          '$$Y = C(Y) + S(Y)$$\n\n' +
          '🛒 **2. Hàm Tiêu dùng & Khuynh hướng tiêu dùng biên ($MPC$)**:\n' +
          '$$MPC = C\'(Y) = \\frac{\\mathrm{d}C}{\\mathrm{d}Y}$$\n' +
          '*Ý nghĩa*: Khi thu nhập quốc dân $Y$ tăng thêm $1$ đơn vị tiền, tiêu dùng của toàn xã hội sẽ tăng thêm xấp xỉ $MPC$ đơn vị tiền ($0 < MPC < 1$).\n\n' +
          '🏦 **3. Hàm Tiết kiệm & Khuynh hướng tiết kiệm biên ($MPS$)**:\n' +
          '$$S(Y) = Y - C(Y) \\implies MPS = S\'(Y) = \\frac{\\mathrm{d}S}{\\mathrm{d}Y} = 1 - C\'(Y) = 1 - MPC$$\n' +
          '*Mối quan hệ luôn đúng*: $MPC + MPS = 1$.\n\n' +
          '![Sơ đồ Luồng Thu nhập Y phân bổ vào Tiêu dùng C và Tiết kiệm S](/images/income_saving_diagram.png)'
      },
      {
        heading: '6. Lý Thuyết Hệ Số Co Giãn (Elasticity) & Công Thức Amoroso-Robinson',
        body: '📐 **1. Định nghĩa Hệ số co giãn tổng quát**:\n' +
          '$$\\varepsilon_{yx} = E_x = f\'(x) \\cdot \\frac{x}{y} = \\frac{\\mathrm{d}y / y}{\\mathrm{d}x / x}$$\n\n' +
          '📉 **2. Hệ số co giãn của Cầu theo Giá ($E_p$)**:\n' +
          '$$E_p = \\frac{\\mathrm{d}Q}{\\mathrm{d}p} \\cdot \\frac{p}{Q}$$\n' +
          '- $|E_p| > 1$: Cầu co giãn nhiều $\\implies$ Tăng giá làm **giảm tổng doanh thu** ($MR < 0$).\n' +
          '- $|E_p| < 1$: Cầu ít co giãn $\\implies$ Tăng giá làm **tăng tổng doanh thu** ($MR > 0$).\n' +
          '- $|E_p| = 1$: Co giãn đơn vị $\\implies$ Tổng doanh thu đạt **cực đại** ($MR = 0$).\n\n' +
          '![Sơ đồ Đường Cầu D, Doanh thu biên MR và Miền Co giãn Ep](/images/elasticity_mr_diagram.png)\n\n' +
          '🤝 **3. Công thức Amoroso-Robinson**:\n' +
          '$$MR = p \\left(1 + \\frac{1}{E_p}\\right)$$\n\n' +
          '📊 **4. Hệ số co giãn của Chi phí (Cost Elasticity - $\\varepsilon_{Cq}$)**:\n' +
          '$$\\varepsilon_{Cq} = C\'(q) \\cdot \\frac{q}{C} = \\frac{MC}{AC}$$'
      },
      {
        heading: '7. Vi Phân Ẩn & Xấp Xỉ Tuyến Tính Trong Kinh Tế',
        body: '🔍 **1. Đạo hàm và Vi phân hàm ẩn $F(x, y) = 0$**:\n' +
          '$$\\frac{\\mathrm{d}y}{\\mathrm{d}x} = -\\frac{F\'_x}{F\'_y}$$\n\n' +
          '🧮 **2. Công thức Xấp xỉ tuyến tính một biến & hai biến**:\n' +
          '$$\\Delta y \\approx f\'(x_0) \\cdot \\Delta x \\implies f(x_0 + \\Delta x) \\approx f(x_0) + f\'(x_0) \\cdot \\Delta x$$\n' +
          '$$f(x_0 + \\Delta x, y_0 + \\Delta y) \\approx f(x_0, y_0) + f\'_x(x_0, y_0) \\Delta x + f\'_y(x_0, y_0) \\Delta y$$'
      },
      {
        heading: '8. Phân Tích & Giải Chi Tiết Các Dạng Bài Thi Thực Tế Xuyên Suốt K46 - K51',
        body: 'Tổng hợp và giải chi tiết các câu hỏi ứng dụng thực tế từ các kỳ thi K46, K47, K48, K49, K50, K51:\n\n' +
          '📝 **Dạng 1: Chi phí biên của công ty công nghệ (K51 Đợt 2 - Câu 4)**\n' +
          '*Đề bài*: Cho $C(Q) = 500 \\cdot \\ln(Q^2 + 1) + 200$. Tính chi phí biên tại $Q = 3$.\n' +
          '*Lời giải*: $MC = C\'(Q) = 500 \\cdot \\frac{2Q}{Q^2 + 1}$. Tại $Q = 3 \\implies MC(3) = 500 \\cdot \\frac{6}{10} = 300$.\n\n' +
          '📝 **Dạng 2: Phân tích Doanh thu theo $E_p$ (K51 Đợt 2 - Câu 6)**\n' +
          '*Đề bài*: Hệ số co giãn cầu $E_p = -0.5$. Doanh nghiệp tăng giá bán một lượng nhỏ thì doanh thu thay đổi thế nào?\n' +
          '*Lời giải*: Vì $|E_p| = 0.5 < 1$ (cầu ít co giãn), khi tăng giá thì lượng cầu giảm ít hơn tỷ lệ tăng giá, do đó tổng doanh thu tăng ($MR > 0$). Chọn B.\n\n' +
          '📝 **Dạng 3: Tỷ lệ thay thế kỹ thuật biên MRTS (K51 Đợt 2 - Câu 2)**\n' +
          '*Đề bài*: $Q = 2K^2 + 3L^2 + KL$. Tại $K=10, L=5$, tăng $1$ đơn vị lao động ($dL=1$) giữ nguyên sản lượng ($dQ=0$) thì $K$ giảm bao nhiêu?\n' +
          '*Lời giải*: $dQ = Q\'_K dK + Q\'_L dL = 0 \\implies dK = -\\frac{Q\'_L}{Q\'_K} dL = -\\frac{6L+K}{4K+L} = -\\frac{40}{45} = -\\frac{8}{9}$. Vốn giảm $8/9$ đơn vị.\n\n' +
          '📝 **Dạng 4: Tiết kiệm và Thu nhập trong bài toán đạo hàm ẩn (K49 & K51 - Câu 4)**\n' +
          '*Đề bài*: $S^2 + \\frac{1}{4}I^2 = SI + I$. Tại mức thu nhập $I = 16$, tiết kiệm tăng thêm bao nhiêu $\%$ khi thu nhập tăng $1\\%$?\n' +
          '*Lời giải*: Tính $S$ tại $I=16$: $S^2 + 64 = 16S + 16 \\implies S^2 - 16S + 48 = 0 \\implies S = 4$ (vì $S \\le 30\\% I = 4.8$).\n' +
          'Lấy đạo hàm hai vế theo $I$: $2S S\' + \\frac{1}{2}I = S\' I + S + 1$. Thế $I=16, S=4 \\implies 8 S\' + 8 = 16 S\' + 5 \\implies 8 S\' = 3 \\implies S\' = \\frac{3}{8}$.\n' +
          'Hệ số co giãn $E_I = S\' \\cdot \\frac{I}{S} = \\frac{3}{8} \\cdot \\frac{16}{4} = \\frac{3}{2} = 1.5\\%$. Khi thu nhập tăng $1\\%$, tiết kiệm tăng $\\frac{3}{2}\\%$.\n\n' +
          '📝 **Dạng 5: Mức chi phí trung bình cực tiểu $AC_{\\min}$ (K46 & K47)**\n' +
          '*Đề bài*: Cho hàm chi phí $C(q) = q^3 - 6q^2 + 15q + 100$. Tìm mức sản lượng $q$ để chi phí trung bình $AC$ đạt tối thiểu.\n' +
          '*Lời giải*: $AC(q) = q^2 - 6q + 15 + \\frac{100}{q}$. Cho $MC = AC \\iff 3q^2 - 12q + 15 = q^2 - 6q + 15 + \\frac{100}{q} \\iff 2q^2 - 6q = \\frac{100}{q} \\iff q^3 - 3q^2 - 50 = 0 \\implies q = 5$.\n\n' +
          '📝 **Dạng 6: Sản lượng biên theo vốn (K51 Mã 204 - Câu 9)**\n' +
          '*Đề bài*: Cho $Q(L, K) = 6 L^{1/2} K^{1/4}$. Tính sản lượng biên theo vốn tại $L=100, K=10000$.\n' +
          '*Lời giải*: $Q\'_K = \\frac{3}{2} L^{1/2} K^{-3/4} = \\frac{3}{2} (10) (10^{-3}) = \\frac{3}{200}$.\n\n' +
          '📝 **Dạng 7: Xấp xỉ tuyến tính hàm hai biến (K51 Mã 204 - Câu 10)**\n' +
          '*Đề bài*: $f(10, 5) = 1000, f\'_x = 2, f\'_y = -3$. Tính gần đúng $f(10.1, 4.8)$.\n' +
          '*Lời giải*: $f(10.1, 4.8) \\approx 1000 + 2(0.1) + (-3)(-0.2) = 1000.8$.\n\n' +
          '📝 **Dạng 8: Cân bằng giá thị trường động (K51 Đợt 2 - Câu 7)**\n' +
          '*Đề bài*: Cho $P\'(t) + 3P(t) = 12$, $P(0) = 5$. Tìm giá ổn định dài hạn khi $t \\to +\\infty$.\n' +
          '*Lời giải*: $P(t) = 4 + C e^{-3t} \\xrightarrow{t \\to +\\infty} P^* = 4$.'
      },
      {
        heading: '9. Tổng Kết & Lộ Trình Ôn Tập Đạt Điểm Tuyệt Đối',
        body: 'Tóm lại, để đạt điểm tuyệt đối 9-10 trong các bài thi Toán Ứng Dụng UEH qua các khóa K46-K51, sinh viên cần làm chủ 2 bước:\n\n' +
          '1. **Nắm chắc định nghĩa & ý nghĩa kinh tế gốc** của các hàm số ($C, R, \\pi, Q, S, I$) và các đại lượng biên tế ($MC, AC, MR, MP_L, MP_K, MRP_L, MPC, MPS, E_p$).\n' +
          '2. **Thực hành phản xạ tính toán** trên hệ thống phòng thi trắc nghiệm tương tác 30 phút của UEH TCC.'
      }
    ]
  },
  {
    slug: 'lo-trinh-on-toan-cao-cap',
    title: 'Cẩm Nang Toàn Diện Lý Thuyết Kinh Tế Vi/Vĩ Mô (Chương 5 Slide PNTA) & Phân Tích Bộ Đề K51 UEH',
    category: 'Chuyên đề nâng cao',
    date: '23/07/2026',
    author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
    keywords: ['Chương 5 PNTA', 'Marginal Cost', 'Marginal Product', 'Hệ số co giãn', 'Amoroso-Robinson', 'Toán K51 UEH'],
    image: '/images/bg.jpg',
    excerpt: 'Hệ thống hóa 100% lý thuyết gốc Kinh tế Vi mô & Vĩ mô trong Slide Chương 5 của Thầy Phan Ngô Tuấn Anh (Hàm sản xuất, Năng suất biên, Chi phí biên, Doanh thu biên, Hệ số co giãn, Vi phân ẩn, Xấp xỉ tuyến tính) và phân tích giải toán xuyên suốt bộ đề K51 (cả 2 đợt).',
    toc: [
      '1. Khái niệm & Hệ thống các Đại lượng Biên tế (Marginal Analysis)',
      '2. Hệ thống Hàm Sản Xuất & Năng Suất Biên (MPL, MPK)',
      '3. Lý thuyết Chi Phí, Doanh Thu, Lợi Nhuận & Tối Đa Hóa Lợi Nhuận',
      '4. Lý thuyết Hệ Số Co Giãn (Elasticity) & Công Thức Amoroso-Robinson',
      '5. Vi Phân Ẩn & Xấp Xỉ Tuyến Tính Trong Kinh Tế',
      '6. Phân Tích & Giải Chi Tiết Các Dạng Bài Thi Thực Tế Trong Đề K51',
      '7. Tổng Kết & Lộ Trình Ôn Tập Đạt Điểm Tuyệt Đối'
    ],
    sections: [
      {
        heading: '1. Khái niệm & Hệ thống các Đại lượng Biên tế (Marginal Analysis)',
        body: 'Trong tài liệu *Chương 5: Đạo hàm và vi phân (cập nhật)* của Thầy Phan Ngô Tuấn Anh (PNTA), đại lượng biên tế (Marginal Concepts) phản ánh tốc độ thay đổi của một chỉ tiêu kinh tế khi một biến số đầu vào thay đổi $1$ đơn vị.\n\n' +
          'Về mặt toán học, **giá trị biên tế chính là đạo hàm bậc nhất** của hàm số tương ứng:\n' +
          '$$M_y(x) = y\'(x) = \\frac{\\mathrm{d}y}{\\mathrm{d}x}$$\n\n' +
          '📌 **Ý nghĩa kinh tế cơ bản**:\n' +
          'Nếu biến $x$ tăng thêm $1$ đơn vị từ mức $x_0$, thì biến $y$ sẽ biến đổi một lượng xấp xỉ bằng $y\'(x_0)$ đơn vị.\n\n' +
          '📌 **Ý nghĩa hình học**:\n' +
          'Giá trị biên tế $y\'(x_0)$ chính là **hệ số góc (slope)** của đường tiếp tuyến với đồ thị hàm số $y = f(x)$ tại điểm $x = x_0$. Chi phí hay năng suất biên càng lớn thì đường tiếp tuyến càng dốc.'
      },
      {
        heading: '2. Hệ thống Hàm Sản Xuất & Năng Suất Biên (MPL, MPK)',
        body: 'Sản lượng đầu ra $Q$ của một doanh nghiệp phụ thuộc vào các yếu tố đầu vào như Lao động ($L$) và Vốn ($K$).\n\n' +
          '🌾 **1. Năng suất biên theo Lao động (Marginal Product of Labor - $MP_L$)**:\n' +
          'Là đạo hàm riêng của hàm sản lượng $Q(L, K)$ theo biến lao động $L$:\n' +
          '$$MP_L = Q\'_L = \\frac{\\partial Q}{\\partial L}$$\n' +
          '*Ý nghĩa*: Khi doanh nghiệp tăng sử dụng $1$ đơn vị lao động (giữ nguyên lượng vốn $K$), tổng sản lượng $Q$ sẽ tăng thêm xấp xỉ $MP_L$ đơn vị sản phẩm.\n\n' +
          '🏭 **2. Năng suất biên theo Vốn (Marginal Product of Capital - $MP_K$)**:\n' +
          'Là đạo hàm riêng của hàm sản lượng $Q(L, K)$ theo biến vốn $K$:\n' +
          '$$MP_K = Q\'_K = \\frac{\\partial Q}{\\partial K}$$\n' +
          '*Ý nghĩa*: Khi doanh nghiệp tăng thêm $1$ đơn vị vốn tiền tệ/máy móc (giữ nguyên lượng lao động $L$), tổng sản lượng $Q$ sẽ tăng thêm xấp xỉ $MP_K$ đơn vị sản phẩm.\n\n' +
          '👥 **3. Năng suất trung bình (Average Product - AP)**:\n' +
          '$$AP_L = \\frac{Q}{L}, \\quad AP_K = \\frac{Q}{K}$$'
      },
      {
        heading: '3. Lý thuyết Chi Phí, Doanh Thu, Lợi Nhuận & Tối Đa Hóa Lợi Nhuận',
        body: '📊 **1. Hàm Chi phí $C(q)$ & Chi phí biên (Marginal Cost - MC)**:\n' +
          'Gọi $q$ là sản lượng và $C(q)$ là tổng chi phí sản xuất ($C(q) = VC(q) + FC$):\n' +
          '$$MC = C\'(q) = \\frac{\\mathrm{d}C}{\\mathrm{d}q}$$\n' +
          '*Chi phí trung bình*: $AC(q) = \\frac{C(q)}{q}$. Chi phí biến đổi trung bình: $AVC(q) = \\frac{VC(q)}{q}$.\n\n' +
          '📈 **2. Hàm Doanh thu $R(q)$ & Doanh thu biên (Marginal Revenue - MR)**:\n' +
          'Tổng doanh thu $R(q) = p \\cdot q$. Doanh thu biên là đạo hàm của tổng doanh thu:\n' +
          '$$MR = R\'(q) = \\frac{\\mathrm{d}R}{\\mathrm{d}q}$$\n' +
          '*Doanh thu trung bình*: $AR(q) = \\frac{R(q)}{q} = p$.\n\n' +
          '💰 **3. Hàm Lợi nhuận $\\pi(q)$ & Nguyên tắc tối đa hóa lợi nhuận**:\n' +
          '$$\\pi(q) = R(q) - C(q) \\implies \\pi\'(q) = R\'(q) - C\'(q) = MR - MC$$\n' +
          '*Điều kiện cần tối đa hóa lợi nhuận*: $\\pi\'(q^*) = 0 \\iff MR = MC$.\n' +
          '*Điều kiện đủ*: $\\pi\'\'(q^*) < 0 \\iff R\'\'(q^*) < C\'\'(q^*)$.\n\n' +
          '⚖️ **4. Khuynh hướng tiêu dùng biên ($MPC$) & Khuynh hướng tiết kiệm biên ($MPS$)**:\n' +
          'Cho hàm tiêu dùng $C = C(Y)$ và hàm tiết kiệm $S = S(Y) = Y - C(Y)$ theo thu nhập quốc dân $Y$:\n' +
          '$$MPC = C\'(Y) = \\frac{\\mathrm{d}C}{\\mathrm{d}Y}, \\quad MPS = S\'(Y) = \\frac{\\mathrm{d}S}{\\mathrm{d}Y} = 1 - MPC$$'
      },
      {
        heading: '4. Lý thuyết Hệ Số Co Giãn (Elasticity) & Công Thức Amoroso-Robinson',
        body: '📐 **1. Định nghĩa Hệ số co giãn của hàm số**:\n' +
          'Hệ số co giãn của $y = f(x)$ tại $x$ biểu thị tỷ lệ phần trăm thay đổi của $y$ khi $x$ tăng $1\\%$:\n' +
          '$$\\varepsilon_{yx} = E_x = f\'(x) \\cdot \\frac{x}{y} = \\frac{\\mathrm{d}y / y}{\\mathrm{d}x / x}$$\n\n' +
          '📉 **2. Hệ số co giãn của Cầu theo Giá ($E_p$)**:\n' +
          '$$E_p = \\frac{\\mathrm{d}Q}{\\mathrm{d}p} \\cdot \\frac{p}{Q}$$\n' +
          '- $|E_p| > 1$ (Cầu co giãn nhiều): Tăng giá bán làm **giảm tổng doanh thu** ($MR < 0$).\n' +
          '- $|E_p| < 1$ (Cầu ít co giãn): Tăng giá bán làm **tăng tổng doanh thu** ($MR > 0$).\n' +
          '- $|E_p| = 1$ (Co giãn đơn vị): Tổng doanh thu đạt **cực đại** ($MR = 0$).\n\n' +
          '🤝 **3. Thiết lập Công thức Amoroso-Robinson**:\n' +
          '$$MR = \\frac{\\mathrm{d}(p \\cdot Q)}{\\mathrm{d}Q} = p + Q \\cdot \\frac{\\mathrm{d}p}{\\mathrm{d}Q} = p \\left(1 + \\frac{1}{E_p}\\right)$$\n\n' +
          '📊 **4. Hệ số co giãn của Chi phí (Cost Elasticity - $\\varepsilon_{Cq}$)**:\n' +
          '$$\\varepsilon_{Cq} = C\'(q) \\cdot \\frac{q}{C} = \\frac{MC}{AC}$$\n' +
          '- Nếu $\\varepsilon_{Cq} < 1 \\iff MC < AC$: Hiệu quả theo quy mô tăng (Economies of scale).\n' +
          '- Nếu $\\varepsilon_{Cq} > 1 \\iff MC > AC$: Hiệu quả theo quy mô giảm (Diseconomies of scale).'
      },
      {
        heading: '5. Vi Phân Ẩn & Xấp Xỉ Tuyến Tính Trong Kinh Tế',
        body: '🔍 **1. Đạo hàm và Vi phân hàm ẩn $F(x, y) = 0$**:\n' +
          '$$\\frac{\\mathrm{d}y}{\\mathrm{d}x} = -\\frac{F\'_x}{F\'_y}$$\n' +
          'Áp dụng tính hệ số co giãn ẩn của tiết kiệm $S$ theo thu nhập $I$ trong mối quan hệ $S^2 + \\frac{1}{4}I^2 = SI + I$.\n\n' +
          '🧮 **2. Công thức Xấp xỉ tuyến tính một biến & hai biến**:\n' +
          '$$\\Delta y \\approx f\'(x_0) \\cdot \\Delta x \\implies f(x_0 + \\Delta x) \\approx f(x_0) + f\'(x_0) \\cdot \\Delta x$$\n' +
          '$$f(x_0 + \\Delta x, y_0 + \\Delta y) \\approx f(x_0, y_0) + f\'_x(x_0, y_0) \\Delta x + f\'_y(x_0, y_0) \\Delta y$$'
      },
      {
        heading: '6. Phân Tích & Giải Chi Tiết Các Dạng Bài Thi Thực Tế Trong Đề K51',
        body: 'Dưới đây là lời giải chi tiết cho tất cả các câu hỏi ứng dụng Vi/Vĩ mô trong bộ đề K51 (cả 2 đợt thi mới nhất):\n\n' +
          '📝 **Câu 1 (Đề K51 Đợt 2 - Câu 4): Chi phí biên của công ty công nghệ**\n' +
          '*Đề bài*: Cho $C(Q) = 500 \\cdot \\ln(Q^2 + 1) + 200$. Tính chi phí biên tại $Q = 3$.\n' +
          '*Lời giải*: $MC = C\'(Q) = 500 \\cdot \\frac{2Q}{Q^2 + 1}$. Tại $Q = 3 \\implies MC(3) = 500 \\cdot \\frac{6}{10} = 300$.\n\n' +
          '📝 **Câu 2 (Đề K51 Đợt 2 - Câu 6): Phân tích Doanh thu theo $E_p$**\n' +
          '*Đề bài*: Hệ số co giãn cầu $E_p = -0.5$. Doanh nghiệp tăng giá bán một lượng nhỏ thì doanh thu thay đổi thế nào?\n' +
          '*Lời giải*: Vì $|E_p| = 0.5 < 1$ (cầu ít co giãn), khi tăng giá thì lượng cầu giảm ít hơn tỷ lệ tăng giá, do đó tổng doanh thu tăng ($MR > 0$). Chọn B.\n\n' +
          '📝 **Câu 3 (Đề K51 Đợt 2 - Câu 2): Tỷ lệ thay thế kỹ thuật biên MRTS**\n' +
          '*Đề bài*: $Q = 2K^2 + 3L^2 + KL$. Tại $K=10, L=5$, tăng $1$ đơn vị lao động ($dL=1$) giữ nguyên sản lượng ($dQ=0$) thì $K$ giảm bao nhiêu?\n' +
          '*Lời giải*: $dQ = Q\'_K dK + Q\'_L dL = 0 \\implies dK = -\\frac{Q\'_L}{Q\'_K} dL = -\\frac{6L+K}{4K+L} = -\\frac{40}{45} = -\\frac{8}{9}$. Vốn giảm $8/9$ đơn vị.\n\n' +
          '📝 **Câu 4 (Đề K51 Mã 204 - Câu 9): Sản lượng biên theo vốn**\n' +
          '*Đề bài*: Cho $Q(L, K) = 6 L^{1/2} K^{1/4}$. Tính sản lượng biên theo vốn tại $L=100, K=10000$.\n' +
          '*Lời giải*: $Q\'_K = 6 L^{1/2} \\cdot \\frac{1}{4} K^{-3/4} = \\frac{3}{2} L^{1/2} K^{-3/4}$. Thế $L=100, K=10000 \\implies Q\'_K = \\frac{3}{2} (10) (10^{-3}) = \\frac{3}{200}$.\n\n' +
          '📝 **Câu 5 (Đề K51 Mã 204 - Câu 10): Xấp xỉ tuyến tính hàm hai biến**\n' +
          '*Đề bài*: $f(10, 5) = 1000, f\'_x(10, 5) = 2, f\'_y(10, 5) = -3$. Tính gần đúng $f(10.1, 4.8)$.\n' +
          '*Lời giải*: $f(10.1, 4.8) \\approx f(10, 5) + f\'_x \\Delta x + f\'_y \\Delta y = 1000 + 2(0.1) + (-3)(-0.2) = 1000 + 0.2 + 0.6 = 1000.8$.\n\n' +
          '📝 **Câu 6 (Đề K51 Đợt 2 - Câu 7): Mức giá cân bằng dài hạn thị trường động**\n' +
          '*Đề bài*: Cho $P\'(t) + 3P(t) = 12$, $P(0) = 5$. Tìm giá ổn định dài hạn khi $t \\to +\\infty$.\n' +
          '*Lời giải*: $P(t) = 4 + C e^{-3t}$. Với $P(0)=5 \\implies C=1$. Khi $t \\to +\\infty$, $e^{-3t} \\to 0 \\implies P(t) \\to 4$. Mức giá ổn định là $P^* = 4$.'
      },
      {
        heading: '7. Tổng Kết & Lộ Trình Ôn Tập Đạt Điểm Tuyệt Đối',
        body: 'Tóm lại, để đạt điểm tuyệt đối 9-10 trong các bài thi Toán Ứng Dụng UEH, sinh viên cần làm chủ 2 bước:\n\n' +
          '1. **Nắm chắc định nghĩa & ý nghĩa kinh tế gốc** của các hàm số ($C, R, \\pi, Q, S$) và các đại lượng biên tế ($MC, MR, MP_L, MP_K, MPC, MPS, E_p$).\n' +
          '2. **Thực hành phản xạ tính toán** trên hệ thống phòng thi trắc nghiệm tương tác 30 phút của UEH TCC.'
      }
    ]
  },
  {
    slug: 'lo-trinh-on-toan-cao-cap',
    title: 'Hệ Thống Lý Thuyết Vi/Vĩ Mô (Slide Chương 5 PNTA) & Phân Tích Bộ Đề Thi K51 UEH',
    category: 'Chuyên đề nâng cao',
    date: '23/07/2026',
    author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
    keywords: ['Chương 5 PNTA', 'Hàm chi phí', 'Doanh thu biên', 'Hệ số co giãn', 'Amoroso-Robinson', 'Toán K51 UEH'],
    image: '/images/bg.jpg',
    excerpt: 'Hệ thống toàn bộ lý thuyết gốc Kinh tế Vi mô & Vĩ mô trong Slide Chương 5 (Đạo hàm và Vi phân) của Thầy Phan Ngô Tuấn Anh, kèm phân tích giải chi tiết tất cả các câu hỏi ứng dụng thực tế trong bộ đề K51 (cả 2 đợt).',
    toc: [
      '1. Cơ sở lý thuyết gốc Kinh tế Vi mô (Slide Chương 5 PNTA)',
      '2. Lý thuyết Hệ số co giãn & Công thức Amoroso-Robinson',
      '3. Ứng dụng vi phân xấp xỉ tuyến tính trong Kinh tế',
      '4. Phân tích & Giải chi tiết các câu ứng dụng Vi/Vĩ mô trong Đề thi K51',
      '5. Các dạng bài mở rộng tiềm năng cho kỳ thi sắp tới'
    ],
    sections: [
      {
        heading: '1. Cơ sở lý thuyết gốc Kinh tế Vi mô (Slide Chương 5 PNTA)',
        body: 'Trong tài liệu *Chương 5: Đạo hàm và vi phân (cập nhật)* của Thầy Phan Ngô Tuấn Anh (PNTA), các đại lượng biên tế trong Kinh tế Vi mô được định nghĩa chặt chẽ bằng toán học thông qua phép tính đạo hàm:\n\n' +
          '📊 **1. Hàm Chi phí $C(q)$ & Chi phí biên (Marginal Cost - MC)**:\n' +
          'Gọi $q$ (quantity) là sản lượng và $C(q)$ là tổng chi phí sản xuất. Đạo hàm của tổng chi phí theo sản lượng được gọi là **Chi phí biên**:\n' +
          '$$MC = C\'(q) = \\frac{\\mathrm{d}C}{\\mathrm{d}q}$$\n' +
          '*Ý nghĩa kinh tế*: Cho biết khi tăng sản lượng thêm $1$ đơn vị sản phẩm thì tổng chi phí sản xuất sẽ tăng thêm xấp xỉ $MC$ đơn vị tiền.\n' +
          '*Ý nghĩa hình học*: $MC = C\'(a)$ chính là **hệ số góc (slope)** của tiếp tuyến với đường cong chi phí $C = C(q)$ tại điểm $q = a$. Chi phí biên càng lớn thì đường tiếp tuyến càng dốc đứng.\n' +
          '*Chi phí trung bình*: $AC(q) = \\frac{C(q)}{q}$ (Average Cost).\n\n' +
          '📈 **2. Hàm Doanh thu $R(q)$ & Doanh thu biên (Marginal Revenue - MR)**:\n' +
          'Gọi $R(q) = p \\cdot q$ là tổng doanh thu bán sản lượng $q$ với giá $p$. Đạo hàm của tổng doanh thu theo sản lượng là **Doanh thu biên**:\n' +
          '$$MR = R\'(q) = \\frac{\\mathrm{d}R}{\\mathrm{d}q}$$\n' +
          '*Ý nghĩa kinh tế*: Khi doanh nghiệp bán thêm $1$ đơn vị sản phẩm ra thị trường thì tổng doanh thu sẽ tăng thêm xấp xỉ $MR$ đơn vị tiền.\n' +
          '*Doanh thu trung bình*: $AR(q) = \\frac{R(q)}{q} = p$.\n\n' +
          '💰 **3. Hàm Lợi nhuận $\\pi(q)$ & Nguyên tắc tối đa hóa lợi nhuận**:\n' +
          'Tổng lợi nhuận của doanh nghiệp bằng hiệu số giữa tổng doanh thu và tổng chi phí:\n' +
          '$$\\pi(q) = R(q) - C(q)$$\n' +
          'Lợi nhuận biên $MP = \\pi\'(q) = R\'(q) - C\'(q) = MR - MC$.\n' +
          '*Điều kiện cần tối đa hóa lợi nhuận*: Lợi nhuận đạt cực đại tại mức sản lượng $q^*$ thỏa mãn $\\pi\'(q^*) = 0 \\iff MR = MC$ (Doanh thu biên bằng Chi phí biên).'
      },
      {
        heading: '2. Lý thuyết Hệ số co giãn & Công thức Amoroso-Robinson',
        body: '📌 **1. Định nghĩa Hệ số co giãn của hàm số (Elasticity)**:\n' +
          'Hệ số co giãn của hàm số $y = f(x)$ tại điểm $x$ (ký hiệu $\\varepsilon_{yx}$ hoặc $E_x$) biểu thị tỷ lệ phần trăm thay đổi của $y$ khi $x$ thay đổi $1\\%$:\n' +
          '$$\\varepsilon_{yx} = E_x = f\'(x) \\cdot \\frac{x}{y} = \\frac{\\mathrm{d}y / y}{\\mathrm{d}x / x}$$\n\n' +
          '📉 **2. Hệ số co giãn của cầu theo giá ($E_p$)**:\n' +
          'Đối với hàm cầu $Q = D(p)$, hệ số co giãn của lượng cầu theo giá $p$ là:\n' +
          '$$E_p = \\frac{\\mathrm{d}Q}{\\mathrm{d}p} \\cdot \\frac{p}{Q}$$\n' +
          '- Nếu $|E_p| > 1$: Cầu co giãn nhiều $\\implies$ Doanh nghiệp **tăng giá sẽ làm tổng doanh thu giảm**.\n' +
          '- Nếu $|E_p| < 1$: Cầu ít co giãn $\\implies$ Doanh nghiệp **tăng giá sẽ làm tổng doanh thu tăng**.\n' +
          '- Nếu $|E_p| = 1$: Cầu co giãn đơn vị $\\implies$ Tổng doanh thu đạt cực đại.\n\n' +
          '🤝 **3. Công thức Amoroso-Robinson (Mối liên hệ giữa MR và $E_p$)**:\n' +
          'Ta có $R = p \\cdot Q(p)$. Đạo hàm doanh thu theo lượng bán $Q$:\n' +
          '$$MR = \\frac{\\mathrm{d}R}{\\mathrm{d}Q} = \\frac{\\mathrm{d}(p \\cdot Q)}{\\mathrm{d}Q} = p + Q \\cdot \\frac{\\mathrm{d}p}{\\mathrm{d}Q} = p \\left(1 + \\frac{1}{E_p}\\right)$$'
      },
      {
        heading: '3. Ứng dụng vi phân xấp xỉ tuyến tính trong Kinh tế',
        body: 'Khái niệm vi phân $dy = f\'(x) dx$ cho phép xấp xỉ lượng thay đổi tuyệt đối $\\Delta y$ khi $x$ biến động một lượng nhỏ $\\Delta x$:\n' +
          '$$\\Delta y \\approx dy = f\'(x_0) \\cdot \\Delta x$$\n' +
          '$$f(x_0 + \\Delta x) \\approx f(x_0) + f\'(x_0) \\cdot \\Delta x$$\n\n' +
          'Đối với hàm hai biến $z = f(x, y)$, vi phân toàn phần được xác định bởi:\n' +
          '$$dz = f\'_x(x_0, y_0) dx + f\'_y(x_0, y_0) dy$$\n' +
          '$$f(x_0 + \\Delta x, y_0 + \\Delta y) \\approx f(x_0, y_0) + f\'_x(x_0, y_0) \\Delta x + f\'_y(x_0, y_0) \\Delta y$$'
      },
      {
        heading: '4. Phân tích & Giải chi tiết các câu ứng dụng Vi/Vĩ mô trong Đề thi K51',
        body: 'Áp dụng toàn bộ hệ thống lý thuyết trên vào bộ đề thi K51 (cả 2 đợt thi mới nhất):\n\n' +
          '📝 **Dạng 1: Tính Chi phí biên (Đề K51 Đợt 2 - Câu 4)**\n' +
          'Cho $C(Q) = 500 \\cdot \\ln(Q^2 + 1) + 200$. Tính chi phí biên tại $Q = 3$.\n' +
          '*Lời giải*: $MC = C\'(Q) = 500 \\cdot \\frac{2Q}{Q^2 + 1}$. Tại $Q = 3$, $MC(3) = 500 \\cdot \\frac{6}{10} = 300$.\n\n' +
          '📝 **Dạng 2: Phân tích Doanh thu theo Hệ số co giãn (Đề K51 Đợt 2 - Câu 6)**\n' +
          'Tại mức giá $p_0$, hệ số co giãn cầu $E_p = -0.5$. Doanh nghiệp tăng giá nhẹ thì doanh thu thay đổi thế nào?\n' +
          '*Lời giải*: Vì $|E_p| = 0.5 < 1$ (cầu ít co giãn), khi giá $p$ tăng thì tỷ lệ giảm của $Q$ nhỏ hơn tỷ lệ tăng của $p$, do đó tổng doanh thu $TR = p \\cdot Q$ sẽ **tăng** ($MR > 0$). Chọn phát biểu B.\n\n' +
          '📝 **Dạng 3: Tỷ lệ thay thế kỹ thuật biên MRTS (Đề K51 Đợt 2 - Câu 2)**\n' +
          'Cho $Q = 2K^2 + 3L^2 + KL$. Tại $K=10, L=5$, nếu tăng $1$ đơn vị lao động ($dL=1$) mà giữ nguyên sản lượng ($dQ=0$) thì $K$ giảm bao nhiêu?\n' +
          '*Lời giải*: $dQ = Q\'_K dK + Q\'_L dL = 0 \\implies dK = -\\frac{Q\'_L}{Q\'_K} dL = -\\frac{6L+K}{4K+L} dL = -\\frac{40}{45} \\cdot 1 = -\\frac{8}{9}$. Lượng vốn giảm $8/9$ đơn vị.\n\n' +
          '📝 **Dạng 4: Sản lượng biên theo vốn (Đề K51 Mã đề 204 - Câu 9)**\n' +
          'Cho $Q(L, K) = 6 L^{1/2} K^{1/4}$. Tính sản lượng biên theo vốn tại $L=100, K=10000$.\n' +
          '*Lời giải*: $Q\'_K = 6 L^{1/2} \\cdot \\frac{1}{4} K^{-3/4} = \\frac{3}{2} L^{1/2} K^{-3/4}$. Thế $L=100, K=10000 \\implies Q\'_K = \\frac{3}{2} (10) (10^{-3}) = \\frac{3}{200}$.\n\n' +
          '📝 **Dạng 5: Xấp xỉ tuyến tính hàm hai biến (Đề K51 Mã đề 204 - Câu 10)**\n' +
          'Cho $f(10, 5) = 1000, f\'_x(10, 5) = 2, f\'_y(10, 5) = -3$. Tính gần đúng $f(10.1, 4.8)$.\n' +
          '*Lời giải*: $f(10.1, 4.8) \\approx f(10, 5) + f\'_x \\Delta x + f\'_y \\Delta y = 1000 + 2(0.1) + (-3)(-0.2) = 1000 + 0.2 + 0.6 = 1000.8$.\n\n' +
          '📝 **Dạng 6: Cân bằng giá thị trường động (Đề K51 Đợt 2 - Câu 7)**\n' +
          'Cho $P\'(t) + 3P(t) = 12$, $P(0) = 5$. Tìm mức giá cân bằng dài hạn khi $t \\to +\\infty$.\n' +
          '*Lời giải*: Nghiệm tổng quát $P(t) = 4 + C e^{-3t}$. Với $P(0)=5 \\implies C=1$. Khi $t \\to +\\infty$, $e^{-3t} \\to 0 \\implies P(t) \\to 4$. Mức giá ổn định là $P^* = 4$.'
      },
      {
        heading: '5. Các dạng bài mở rộng tiềm năng cho kỳ thi sắp tới',
        body: '1️⃣ **Thặng dư tiêu dùng (CS) & Thặng dư sản xuất (PS)**: Tính diện tích giới hạn bởi đường cầu/cung và mức giá cân bằng $P^*$.\n' +
          '2️⃣ **Mô hình thu nhập quốc dân IS-LM**: Giải hệ phương trình đại số xác định $Y^*$ và $r^*$ cân bằng vĩ mô.\n' +
          '3️⃣ **Cực trị hàm lợi nhuận độc quyền 2 thị trường**: Tìm $(Q_1, Q_2)$ để $\\pi(Q_1, Q_2) = TR_1(Q_1) + TR_2(Q_2) - C(Q_1 + Q_2)$ đạt cực đại.'
      }
    ]
  },
  {
    slug: 'lo-trinh-on-toan-cao-cap',
    title: 'Góc Nhìn Vi Mô & Vĩ Mô Trong Đề Thi Toán Ứng Dụng K51 & Các Dạng Bài Mở Rộng',
    category: 'Phân tích chuyên sâu',
    date: '23/07/2026',
    author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
    keywords: ['Vi mô', 'Vĩ mô', 'Toán Ứng Dụng K51', 'Amoroso-Robinson', 'Mô hình thị trường động', 'Leontief'],
    image: '/images/bg.jpg',
    excerpt: 'Phân tích toàn diện các ứng dụng Kinh tế Vi mô (Đạo hàm, Hệ số co giãn, Amoroso-Robinson, Cực trị Lagrange) và Kinh tế Vĩ mô (Phương trình vi phân thị trường động, Input-Output Leontief) từ bộ đề thi K51 đợt 2 mới nhất.',
    toc: [
      '1. Tổng quan góc nhìn Toán trong Kinh tế',
      '2. Phân tích nhóm bài Kinh tế Vi mô trong đề K51',
      '3. Phân tích nhóm bài Kinh tế Vĩ mô & Mô hình động',
      '4. Các dạng bài mở rộng tiềm năng có thể xuất hiện trong đề thi',
      '5. Lời khuyên ôn tập & Tổng kết'
    ],
    sections: [
      {
        heading: '1. Tổng quan góc nhìn Toán trong Kinh tế',
        body: 'Trong chương trình Toán Ứng Dụng / Toán Cao Cấp tại UEH (đặc biệt đối với tân sinh viên khóa K51), các công cụ toán học không đứng riêng lẻ mà được tích hợp chặt chẽ với bản chất Kinh tế Vi mô (Microeconomics) và Kinh tế Vĩ mô (Macroeconomics).\n\nViệc hiểu rõ ý nghĩa kinh tế đằng sau các ký hiệu toán học như đạo hàm riêng $Q\'_K, Q\'_L$, vi phân toàn phần $dQ$, hay hệ số co giãn $E_p$ sẽ giúp bạn không chỉ giải đúng đáp án mà còn xử lý cực kỳ linh hoạt các câu hỏi nâng cao dạng bẫy chữ.'
      },
      {
        heading: '2. Phân tích nhóm bài Kinh tế Vi mô trong đề K51',
        body: 'Dựa trên tài liệu *Chương 5: Đạo Hàm Và Vi Phân (Cập nhật)* và đề thi K51 đợt 2 vừa qua, nhóm bài Vi mô tập trung vào 3 trụ cột lớn:\n\n' +
          '📌 **a) Tỷ lệ thay thế kỹ thuật biên (MRTS)**:\n' +
          'Khi mức sản lượng $Q(K, L) = 2K^2 + 3L^2 + KL$ được giữ không đổi ($dQ = 0$), tỷ lệ thay thế giữa vốn $K$ và lao động $L$ được xác định bởi:\n' +
          '$$\\text{MRTS} = \\frac{\\mathrm{d}K}{\\mathrm{d}L} = -\\frac{Q\'_L(K, L)}{Q\'_K(K, L)}$$\n' +
          'Tại $(K, L) = (10, 5)$, ta có $Q\'_K = 45$ và $Q\'_L = 40 \\implies \\text{MRTS} = -\\frac{40}{45} = -\\frac{8}{9}$. Ý nghĩa: Để tăng thêm 1 đơn vị lao động mà sản lượng giữ nguyên, doanh nghiệp bắt buộc phải cắt giảm $8/9$ đơn vị vốn.\n\n' +
          '📌 **b) Mối liên hệ Doanh thu biên tế & Hệ số co giãn (Công thức Amoroso-Robinson)**:\n' +
          'Doanh thu biên $MR = \\frac{\\mathrm{d}TR}{\\mathrm{d}Q} = p \\left(1 + \\frac{1}{E_p}\\right)$, trong đó $E_p = \\frac{\\mathrm{d}Q}{\\mathrm{d}p} \\cdot \\frac{p}{Q}$ là hệ số co giãn của cầu theo giá.\n' +
          'Khi $|E_p| = 0.5 < 1$ (cầu ít co giãn theo giá), người tiêu dùng ít phản ứng với sự thay đổi giá. Việc doanh nghiệp tăng nhẹ giá bán sẽ làm lượng cầu giảm không đáng kể, dẫn tới tổng doanh thu tăng ($MR > 0$).\n\n' +
          '📌 **c) Tối ưu hóa chi phí sản xuất có ràng buộc (Nhân tử Lagrange)**:\n' +
          'Cho hàm chi phí $C(q_1, q_2) = q_1^2 + 20q_1 + 40q_2 + 1200$ với ràng buộc tổng sản lượng $q_1 + q_2 = 300$. Hàm Lagrange $L(q_1, q_2, \\lambda) = C(q_1, q_2) + \\lambda (300 - q_1 - q_2)$ cho phép xác định chính xác điểm phân bổ sản lượng tối ưu giữa 2 nhà máy.'
      },
      {
        heading: '3. Phân tích nhóm bài Kinh tế Vĩ mô & Mô hình động',
        body: 'Bên cạnh vi mô, đề K51 đợt 2 khai thác sâu các mô hình vĩ mô và mô hình trạng thái động:\n\n' +
          '📌 **a) Cân bằng giá thị trường theo thời gian (Phương trình vi phân)**:\n' +
          'Phương trình vi phân $P\'(t) + 3P(t) = 12$ biểu diễn tốc độ điều chỉnh giá $P\'(t)$ tỷ lệ với lượng dư cầu. Nghiệm tổng quát có dạng:\n' +
          '$$P(t) = 4 + C \\cdot e^{-3t}$$\n' +
          'Với $P(0) = 5 \\implies C = 1$. Khi thời gian tiến ra vô hạn ($t \\to +\\infty$), thành phần $e^{-3t} \\to 0$, giá bán của hàng hóa sẽ hội tụ về mức giá cân bằng dài hạn $P^* = 4$.\n\n' +
          '📌 **b) Mô hình Input-Output Leontief (Đại số vĩ mô)**:\n' +
          'Mối quan hệ liên ngành trong nền kinh tế được mô tả qua hệ phương trình $X = A X + D \\iff (I - A) X = D$. Khi nhu cầu cuối $D$ biến động, tổng ma trận sản lượng đầu ra $X$ được tính bằng $X = (I - A)^{-1} D$.'
      },
      {
        heading: '4. Các dạng bài mở rộng tiềm năng có thể xuất hiện trong đề thi',
        body: 'Để chuẩn bị tốt nhất cho các kỳ thi sắp tới, sinh viên nên lưu ý các dạng bài mở rộng có khả năng cao xuất hiện trong đề:\n\n' +
          '1️⃣ **Thặng dư tiêu dùng (CS) và Thặng dư sản xuất (PS)**: Sử dụng tích phân xác định $CS = \\int_{0}^{Q^*} [P_d(Q) - P^*] dQ$ và $PS = \\int_{0}^{Q^*} [P^* - P_s(Q)] dQ$.\n' +
          '2️⃣ **Mô hình thu nhập quốc dân IS-LM**: Hệ phương trình tuyến tính xác định mức thu nhập cân bằng $Y^*$ và lãi suất cân bằng $r^*$ trong kinh tế vĩ mô.\n' +
          '3️⃣ **Tối đa hóa lợi nhuận doanh nghiệp độc quyền đa thị trường**: Tìm cực trị tự do của hàm hai biến $\\pi(Q_1, Q_2) = TR_1(Q_1) + TR_2(Q_2) - C(Q_1 + Q_2)$.\n' +
          '4️⃣ **Mô hình tăng trưởng Solow**: Sử dụng phương trình vi phân Bernoulli để tìm vốn trên mỗi lao động ở trạng thái dừng $k^*$.'
      },
      {
        heading: '5. Lời khuyên ôn tập & Tổng kết',
        body: 'Học môn Toán Ứng Dụng UEH không nằm ở việc học thuộc lòng đáp án, mà nằm ở **tư duy kết nối giữa toán học và bản chất kinh tế**.\n\nHãy tận dụng hệ thống **Bộ Phòng Luyện Thi Tương Tác 30 Phút** trên website UEH TCC để rèn luyện phản xạ làm bài trắc nghiệm dưới áp lực thời gian thật. Chúc các bạn K51 ôn tập hiệu quả và đạt điểm số cao nhất!'
      }
    ]
  },
  {
    slug: 'lo-trinh-on-toan-cao-cap',
    title: 'Lộ trình ôn Toán Cao Cấp cho sinh viên UEH mới bắt đầu',
    category: 'Kinh nghiệm học',
    date: '25/05/2026',
    author: 'UEH TCC',
    keywords: ['lộ trình học', 'Toán Cao Cấp', 'UEH', 'ôn thi'],
    image: '/images/tccvang.jpg',
    excerpt: 'Cách học theo thứ tự: nắm nền tảng, ôn dạng bài, rồi chuyển sang luyện đề thử có thời gian.',
    toc: ['Mở đầu', 'Nắm nền tảng', 'Ôn theo dạng bài', 'Luyện đề thử', 'Tài liệu nên dùng'],
    sections: [
      {
        heading: 'Mở đầu',
        body: 'Vấn đề lớn nhất khi học Toán Cao Cấp thường không phải thiếu tài liệu, mà là không biết bắt đầu từ đâu. Một lộ trình rõ sẽ giúp bạn tránh học lan man và biết khi nào nên chuyển sang luyện đề.'
      },
      {
        heading: 'Nắm nền tảng',
        body: 'Hãy bắt đầu với ma trận, định thức, hệ phương trình tuyến tính và không gian vector. Đây là nhóm kiến thức thường xuất hiện trong nhiều dạng bài và giúp bạn đọc đề nhanh hơn.'
      },
      {
        heading: 'Ôn theo dạng bài',
        body: 'Sau khi có nền tảng, hãy học theo dạng: giới hạn, đạo hàm, hàm nhiều biến, cực trị và mô hình kinh tế. Mỗi dạng nên có ví dụ mẫu, bài tập tự luyện và ghi chú lỗi sai.'
      },
      {
        heading: 'Luyện đề thử',
        body: 'Khi đã nắm dạng bài, hãy làm đề trong thời gian giới hạn. Sau mỗi đề, ghi lại câu sai, lý do sai và chương cần ôn lại.'
      },
      {
        heading: 'Tài liệu nên dùng',
        body: 'Ưu tiên giáo trình, bài tập chương và đề có lời giải. Không nên tải quá nhiều file cùng lúc nếu bạn chưa có kế hoạch học cụ thể.'
      }
    ]
  },
  {
    slug: '7-ngay-cuoi-truoc-ky-thi',
    title: '7 ngày cuối trước kỳ thi Toán Cao Cấp nên ôn gì?',
    category: 'Luyện thi',
    date: '24/05/2026',
    author: 'UEH TCC',
    keywords: ['luyện thi', '7 ngày cuối', 'đề thi'],
    image: '/images/bg.jpg',
    excerpt: 'Gợi ý cách chia thời gian trong tuần cuối để vừa ôn công thức, vừa luyện đề và sửa lỗi.',
    toc: ['Mở đầu', 'Ngày 1-2', 'Ngày 3-5', 'Ngày 6-7'],
    sections: [
      { heading: 'Mở đầu', body: 'Tuần cuối không nên học tràn lan. Mục tiêu là rà lại phần trọng tâm, làm đề và sửa đúng lỗi sai.' },
      { heading: 'Ngày 1-2', body: 'Rà công thức, ví dụ mẫu và các dạng bài cơ bản. Ghi lại phần chưa chắc để xử lý trước khi làm đề.' },
      { heading: 'Ngày 3-5', body: 'Làm bài theo chương và luyện những dạng thường sai. Mỗi buổi nên có một danh sách lỗi sai ngắn.' },
      { heading: 'Ngày 6-7', body: 'Làm đề thử theo thời gian, kiểm tra lại câu sai và ngủ đủ trước ngày thi.' }
    ]
  },
  {
    slug: 'nhan-dien-gioi-han-ham-nhieu-bien',
    title: 'Cách nhận diện nhanh bài giới hạn hàm nhiều biến',
    category: 'Phương pháp',
    date: '23/05/2026',
    author: 'UEH TCC',
    keywords: ['giới hạn', 'hàm nhiều biến', 'phương pháp'],
    image: '/images/c4678.jpg',
    excerpt: 'Một số tín hiệu trong đề giúp bạn chọn hướng biến đổi, xét đường đi hoặc đổi biến phù hợp.',
    toc: ['Mở đầu', 'Dấu hiệu nhận diện', 'Cách kiểm tra', 'Lỗi thường gặp'],
    sections: [
      { heading: 'Mở đầu', body: 'Bài giới hạn hàm nhiều biến dễ gây rối vì có nhiều hướng tiếp cận. Điều quan trọng là đọc dạng biểu thức trước khi biến đổi.' },
      { heading: 'Dấu hiệu nhận diện', body: 'Nếu biểu thức có căn, nhân liên hợp có thể hữu ích. Nếu có tổng bình phương, hãy nghĩ đến đánh giá hoặc đổi sang tọa độ cực.' },
      { heading: 'Cách kiểm tra', body: 'Khi nghi ngờ giới hạn không tồn tại, hãy thử nhiều đường đi khác nhau. Nếu kết quả khác nhau, giới hạn không tồn tại.' },
      { heading: 'Lỗi thường gặp', body: 'Lỗi phổ biến là áp dụng công thức một biến cho bài nhiều biến hoặc bỏ qua điều kiện đường đi.' }
    ]
  },
  {
    slug: 'thu-tu-dung-tai-lieu-tcc',
    title: 'Thứ tự dùng giáo trình, bài tập chương và đề thi',
    category: 'Tài liệu',
    date: '22/05/2026',
    author: 'UEH TCC',
    keywords: ['tài liệu', 'giáo trình', 'PDF'],
    image: '/images/c123.jpg',
    excerpt: 'Không phải tài liệu nào cũng nên đọc trước. Bài viết này gợi ý thứ tự dùng tài liệu hiệu quả hơn.',
    toc: ['Mở đầu', 'Giáo trình', 'Bài tập chương', 'Đề thi'],
    sections: [
      { heading: 'Mở đầu', body: 'Nếu có quá nhiều PDF, bạn dễ mất thời gian chọn file thay vì học. Hãy dùng tài liệu theo từng giai đoạn.' },
      { heading: 'Giáo trình', body: 'Dùng giáo trình để hiểu định nghĩa, công thức và ví dụ chuẩn. Không cần đọc quá dài nếu mục tiêu là ôn thi.' },
      { heading: 'Bài tập chương', body: 'Sau mỗi chương, chọn các bài đại diện để luyện kỹ năng nhận dạng dạng bài.' },
      { heading: 'Đề thi', body: 'Đề thi nên dùng sau khi đã học qua dạng bài. Làm đề quá sớm dễ tạo cảm giác nản vì thiếu nền tảng.' }
    ]
  }
];

export const getBlogPostBySlug = (slug) => blogPosts.find((post) => post.slug === slug);
