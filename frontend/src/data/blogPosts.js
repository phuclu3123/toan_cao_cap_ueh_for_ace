export const blogPosts = [
  {
    slug: 'ung-dung-vi-mo-vi-mo-trong-toan-ung-dung-k51',
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
