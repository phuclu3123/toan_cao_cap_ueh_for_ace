const math = String.raw;

export const economicsDerivativePost = {
  slug: 'ung-dung-vi-mo-vi-mo-trong-toan-ung-dung-k51',
  title: 'Đạo hàm kinh tế: Đại lượng biên, co giãn và lời giải đề K46–K51',
  category: 'Chuyên khảo · Chương 5',
  date: '23/07/2026',
  updatedAt: 'Đã đối chiếu nguồn ngày 23/07/2026',
  author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
  readingTime: '38 phút đọc · có thể đọc theo hồ sơ',
  level: 'Nền tảng → nâng cao',
  keywords: [
    'Chương 5 PNTA',
    'Đại lượng biên',
    'MC & MR',
    'MRP',
    'Co giãn',
    'MPC & MPS',
    'Đề K46–K51'
  ],
  image: '/images/economics-derivative-cover.svg',
  excerpt:
    'Một chuyên khảo có kiểm chứng nguồn về cách đạo hàm biến các quan hệ kinh tế thành quyết định: chi phí, doanh thu, lợi nhuận, năng suất, tiêu dùng, tiết kiệm và độ co giãn. Phần cuối hệ thống lại đúng các dạng đề trong tài liệu K46–K51 và chỉ rõ những bẫy ký hiệu dễ làm sai.',
  scope: {
    label: 'Phạm vi đã khóa',
    title: 'Chỉ các ứng dụng kinh tế thuộc Chương 5',
    description:
      'Bài viết chủ động loại các nội dung của Chương 6 và 7 như cực trị hàm nhiều biến, Hessian, Lagrange, MRTS nhiều đầu vào và phương trình vi phân động.',
  },
  highlights: [
    { value: '07', label: 'cụm lý thuyết cốt lõi' },
    { value: '16', label: 'hồ sơ đề thi đã đối chiếu' },
    { value: '07', label: 'ví dụ đóng/mở có lời giải' },
  ],
  toc: [
    'Dẫn nhập: đạo hàm đang đo điều gì trong kinh tế?',
    '1. Từ sai phân đến đại lượng biên',
    '2. Bản đồ vi mô: MC, MR, Mπ, MPL, MU và MRP',
    '3. Tối đa hóa lợi nhuận: vì sao MR = MC chưa phải toàn bộ câu chuyện?',
    '4. Chi phí trung bình và quy tắc điểm đáy',
    '5. Co giãn cầu, doanh thu và bẫy hai loại đạo hàm',
    '6. Vĩ mô: MPC, MPS và hàm tiết kiệm ẩn',
    '7. Quy tắc chuỗi, đạo hàm ẩn và vi phân xấp xỉ',
    '8. Hồ sơ đề thi K46–K51: nhận dạng, lời giải và bẫy',
    '9. Checklist làm bài và phạm vi nguồn',
  ],
  sections: [
    {
      heading: 'Dẫn nhập: đạo hàm đang đo điều gì trong kinh tế?',
      eyebrow: 'Khung đọc',
      summary:
        'Đạo hàm không phải một thao tác ký hiệu tách rời thực tế; nó là ngôn ngữ của thay đổi cục bộ và quyết định “thêm một chút nữa”.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Trong kinh tế học, câu hỏi quan trọng thường không phải “tổng cộng có bao nhiêu?” mà là “nếu điều chỉnh rất nhỏ biến quyết định, kết quả sẽ đổi theo chiều nào và nhanh đến đâu?”. Doanh nghiệp tăng thêm sản lượng thì chi phí tăng bao nhiêu; giảm giá một tỷ lệ nhỏ thì lượng cầu và doanh thu đổi ra sao; thu nhập quốc dân tăng thì phần tăng thêm được phân bổ cho tiêu dùng và tiết kiệm thế nào. Đó đều là câu hỏi cận biên.',
        },
        {
          type: 'formula',
          label: 'Câu hỏi trung tâm của Chương 5',
          content: math`$$\text{Marginal effect}=\frac{\mathrm d(\text{outcome})}{\mathrm d(\text{decision variable})}$$`,
          note:
            'Dấu cho biết chiều tác động; độ lớn cho biết cường độ; đơn vị đo cho biết cách diễn giải kinh tế.',
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'Ba tầng đọc một đạo hàm',
          content:
            'Tầng toán học: hệ số góc tiếp tuyến. Tầng định lượng: tốc độ thay đổi tức thời. Tầng kinh tế: mức thay đổi xấp xỉ của kết quả khi đầu vào tăng một đơn vị nhỏ quanh trạng thái hiện tại.',
        },
        {
          type: 'paragraph',
          content:
            'Chuyên khảo này bám trực tiếp các mục ứng dụng kinh tế của slide Chương 5: đại lượng biên, độ co giãn, quy tắc chuỗi và đạo hàm ẩn, khảo sát một biến, cực trị một biến và vi phân. Vì vậy, những bài toán tối ưu hai biến, Hessian, nhân tử Lagrange, mô hình Leontief và phương trình vi phân được loại khỏi phạm vi dù chúng xuất hiện trong cùng bộ đề.',
        },
      ],
    },
    {
      heading: '1. Từ sai phân đến đại lượng biên',
      eyebrow: 'Nền tảng',
      summary:
        'Phân biệt mức thay đổi chính xác, tốc độ thay đổi trung bình và đạo hàm giúp tránh cách diễn giải “tăng đúng một đơn vị” quá máy móc.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Giả sử hai đại lượng kinh tế liên hệ bởi $y=f(x)$. Từ trạng thái $x_0$, khi $x$ đổi một lượng $\\Delta x$, mức thay đổi chính xác của kết quả là $\\Delta y=f(x_0+\\Delta x)-f(x_0)$. Tỷ số $\\Delta y/\\Delta x$ là tốc độ thay đổi trung bình trên cả khoảng điều chỉnh.',
        },
        {
          type: 'formula',
          label: 'Từ sai phân đến đạo hàm',
          content: math`$$f'(x_0)=\lim_{\Delta x\to 0}\frac{f(x_0+\Delta x)-f(x_0)}{\Delta x}$$`,
          note:
            'Đạo hàm là giới hạn cục bộ. Nó không mặc nhiên bằng đúng mức thay đổi khi x tăng trọn một đơn vị.',
        },
        {
          type: 'diagram',
          kind: 'tangent',
          title: 'Đạo hàm là hệ số góc của tiếp tuyến tại trạng thái đang xét',
          caption:
            'Đường cong biểu diễn quan hệ thật $y=f(x)$; đường thẳng tiếp tuyến tạo xấp xỉ $f(x_0+\\Delta x)\\approx f(x_0)+f\'(x_0)\\Delta x$ trong một lân cận nhỏ của $x_0$.',
        },
        {
          type: 'comparison',
          columns: ['Khái niệm', 'Công thức', 'Cách đọc đúng'],
          rows: [
            [
              'Mức thay đổi chính xác',
              '$\\Delta y=f(x_0+\\Delta x)-f(x_0)$',
              'Kết quả thật trên một khoảng hữu hạn',
            ],
            [
              'Tốc độ trung bình',
              '$\\Delta y/\\Delta x$',
              'Mức thay đổi bình quân trên khoảng',
            ],
            [
              'Biên tế / đạo hàm',
              "$My(x_0)=f'(x_0)$",
              'Tốc độ tức thời tại trạng thái đang xét',
            ],
            [
              'Vi phân xấp xỉ',
              "$\\Delta y\\approx f'(x_0)\\Delta x$",
              'Ước lượng tốt khi $|\\Delta x|$ đủ nhỏ',
            ],
          ],
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Sai lầm diễn giải thường gặp',
          content:
            'Nếu $MC(25)=70$, kết luận chuẩn là “quanh mức sản lượng 25, tăng một lượng nhỏ sản lượng làm chi phí tăng xấp xỉ 70 cho mỗi đơn vị sản lượng”. Không nên khẳng định chi phí tăng đúng 70 khi chuyển từ 25 lên 26; trong ví dụ của slide, mức tăng chính xác là 71.',
        },
        {
          type: 'example',
          meta: 'Ví dụ từ slide · Trang 10',
          title: 'Biên tế 70 nhưng mức tăng chính xác là 71',
          prompt:
            'Một xí nghiệp có $C(q)=q^2+20q+10$ và đang sản xuất $q_0=25$. Hãy tính chi phí biên, dùng nó để ước lượng chi phí khi tăng một đơn vị sản lượng, rồi so sánh với mức tăng chính xác.',
          method:
            'Đặt cạnh nhau hai đại lượng: vi phân $\\mathrm dC=C\'(25)\\,\\Delta q$ và sai phân $\\Delta C=C(26)-C(25)$.',
          steps: [
            {
              label: 'Tính chi phí biên',
              content: "$MC(q)=C'(q)=2q+20$, nên $MC(25)=70$.",
            },
            {
              label: 'Ước lượng bằng vi phân',
              content: '$\\Delta q=1$ cho $\\Delta C\\approx MC(25)\\Delta q=70$.',
            },
            {
              label: 'Tính thay đổi thật',
              content: '$C(26)-C(25)=71$. Sai số xấp xỉ ở bước nhảy này là $71-70=1$.',
            },
          ],
          result: '$\\boxed{\\Delta C\\approx70}\\quad\\text{trong khi}\\quad\\boxed{\\Delta C_{\\rm exact}=71}$',
          interpretation:
            'Đạo hàm là tốc độ cục bộ tại 25; độ cong của $C$ khiến tốc độ thay đổi tăng dần trên đoạn từ 25 đến 26.',
        },
        {
          type: 'steps',
          title: 'Bốn câu phải tự hỏi khi đọc một đạo hàm',
          items: [
            'Biến phụ thuộc và biến quyết định là gì?',
            'Đạo hàm được lấy theo biến nào?',
            'Dấu của đạo hàm nói gì về quan hệ đồng biến hoặc nghịch biến?',
            'Đơn vị đo là tiền/sản phẩm, sản phẩm/lao động hay một tỷ lệ không có đơn vị?',
          ],
        },
      ],
    },
    {
      heading: '2. Bản đồ vi mô: MC, MR, Mπ, MPL, MU và MRP',
      eyebrow: 'Kinh tế vi mô',
      summary:
        'Các tên gọi khác nhau đều tuân theo một quy tắc: lấy đạo hàm của đại lượng tổng theo đúng biến kinh tế đang được điều chỉnh.',
      blocks: [
        {
          type: 'comparison',
          columns: ['Đại lượng', 'Định nghĩa', 'Ý nghĩa cục bộ'],
          rows: [
            [
              'Chi phí biên · MC',
              "$MC(q)=C'(q)$",
              'Chi phí tăng thêm xấp xỉ khi sản lượng tăng',
            ],
            [
              'Doanh thu biên · MR',
              "$MR(q)=R'(q)$",
              'Doanh thu đổi xấp xỉ khi sản lượng tăng',
            ],
            [
              'Lợi nhuận biên · $M\\pi$',
              "$M\\pi(q)=\\pi'(q)=MR-MC$",
              'Lợi nhuận đổi xấp xỉ khi sản lượng tăng',
            ],
            [
              'Năng suất biên lao động · MPL',
              "$MPL(L)=Q'(L)$",
              'Sản lượng tăng xấp xỉ khi lao động tăng',
            ],
            [
              'Hữu dụng biên · MU',
              "$MU(x)=U'(x)$",
              'Lợi ích tăng thêm từ một lượng hàng tăng thêm',
            ],
            [
              'Năng suất doanh thu biên · MRP',
              "$MRP(L)=R'(L)=MR\\cdot MPL$",
              'Doanh thu tăng thêm do lao động tăng',
            ],
          ],
        },
        {
          type: 'paragraph',
          content:
            "Với hàm cầu ngược $p=p(q)$, doanh thu không phải chỉ là giá mà là tích $R(q)=p(q)q$. Bởi vậy, đạo hàm tích cho $MR=p(q)+qp'(q)$. Nếu đường cầu dốc xuống thì $p'(q)<0$, nên $MR<p$: để bán thêm, doanh nghiệp thường phải giảm giá không chỉ cho đơn vị cuối cùng mà cho lượng hàng đang bán.",
        },
        {
          type: 'diagram',
          kind: 'marginal-chain',
          title: 'Từ một lao động tăng thêm đến doanh thu tăng thêm',
          caption:
            'Mỗi mắt xích giữ đúng đơn vị đo: $MPL$ là sản phẩm/lao động, $MR$ là tiền/sản phẩm, nên $MRP$ là tiền/lao động.',
        },
        {
          type: 'formula',
          label: 'Chuỗi tạo doanh thu từ lao động',
          content: math`$$\begin{aligned}
          L&\longrightarrow Q(L)\longrightarrow R(Q(L)),\\[4pt]
          MRP=\frac{\mathrm dR}{\mathrm dL}
          &=\underbrace{\frac{\mathrm dR}{\mathrm dQ}}_{MR}
            \cdot
            \underbrace{\frac{\mathrm dQ}{\mathrm dL}}_{MPL}.
          \end{aligned}$$`,
          note:
            'Đây là quy tắc chuỗi được đọc bằng ngôn ngữ kinh tế: lao động tác động đến sản lượng, rồi sản lượng tác động đến doanh thu.',
        },
        {
          type: 'example',
          meta: 'Ví dụ từ slide · Trang 33–34',
          title: 'Tính năng suất doanh thu biên MRP',
          prompt:
            'Cho giá bán $p(q)=4020-0{,}5q$ và hàm sản xuất $q(L)=2\\sqrt L+10L$. Tính $MRP$ tại $L=100$ và diễn giải.',
          method:
            'Không khai triển $R(L)$ một cách dài dòng. Tính riêng $MR=\\mathrm dR/\\mathrm dQ$ và $MPL=\\mathrm dQ/\\mathrm dL$, sau đó nhân theo quy tắc chuỗi.',
          steps: [
            {
              label: 'Tạo doanh thu và MR',
              content: '$R(q)=p(q)q=4020q-0{,}5q^2$, nên $MR(q)=4020-q$.',
            },
            {
              label: 'Tính MPL',
              content: '$MPL(L)=q\'(L)=\\dfrac{1}{\\sqrt L}+10$.',
            },
            {
              label: 'Thế trạng thái lao động',
              content: '$q(100)=2\\sqrt{100}+10(100)=1020$, $MR(1020)=3000$ và $MPL(100)=10{,}1$.',
            },
            {
              label: 'Nối hai mắt xích',
              content: '$MRP(100)=MR(1020)\\,MPL(100)=3000(10{,}1)=30300$.',
            },
          ],
          result: '$\\boxed{MRP(100)=30300}$',
          interpretation:
            'Quanh mức 100 đơn vị lao động, tăng thêm một đơn vị lao động làm doanh thu tăng xấp xỉ 30.300 đơn vị tiền.',
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'Đơn vị đo là công cụ kiểm lỗi',
          content:
            'Nếu MR có đơn vị tiền/sản phẩm và MPL có đơn vị sản phẩm/lao động, tích MR·MPL có đơn vị tiền/lao động — đúng với ý nghĩa của MRP. Nếu đơn vị không khớp, rất có thể bạn đã lấy đạo hàm theo sai biến.',
        },
      ],
    },
    {
      heading: '3. Tối đa hóa lợi nhuận: vì sao MR = MC chưa phải toàn bộ câu chuyện?',
      eyebrow: 'Quyết định doanh nghiệp',
      summary:
        'MR = MC là điều kiện dừng bên trong miền; để kết luận tối đa còn phải kiểm tra độ cong, miền kinh tế và các điểm biên.',
      blocks: [
        {
          type: 'paragraph',
          content:
            "Với $\\pi(q)=R(q)-C(q)$, lợi nhuận biên là $\\pi'(q)=MR(q)-MC(q)$. Nếu $MR>MC$, đơn vị sản lượng tăng thêm đóng góp doanh thu lớn hơn chi phí nên tăng sản lượng còn có lợi. Nếu $MR<MC$, sản lượng tăng thêm làm lợi nhuận giảm. Điểm chuyển tiếp tự nhiên là $MR=MC$.",
        },
        {
          type: 'formula',
          label: 'Điều kiện cần và điều kiện đủ',
          content: math`$$\pi'(q^*)=0\iff MR(q^*)=MC(q^*),\qquad \pi''(q^*)=MR'(q^*)-MC'(q^*)<0$$`,
          note:
            'Điều kiện thứ hai tương đương MR đang giảm nhanh hơn, hoặc MC đang tăng nhanh hơn, tại giao điểm.',
        },
        {
          type: 'diagram',
          kind: 'profit-optimum',
          title: 'Giao điểm MR–MC và logic tăng/giảm sản lượng',
          caption:
            'Bên trái $q^*$, $MR>MC$ nên tăng sản lượng còn làm lợi nhuận tăng. Bên phải $q^*$, $MR<MC$ nên tăng thêm sản lượng làm lợi nhuận giảm.',
        },
        {
          type: 'steps',
          title: 'Quy trình tối ưu đầy đủ',
          items: [
            'Lập đúng hàm cầu ngược $p=p(q)$ nếu đề cho $q=q(p)$.',
            'Tạo doanh thu $R(q)=p(q)q$, rồi lợi nhuận $\\pi(q)=R(q)-C(q)$.',
            "Giải $\\pi'(q)=0$ hoặc $MR=MC$ để tìm ứng viên nội miền.",
            "Kiểm tra $\\pi''(q^*)<0$ hoặc dấu của $\\pi'$ hai phía.",
            'Đối chiếu miền $q\\ge 0$, các ràng buộc công suất và điểm biên nếu có.',
          ],
        },
        {
          type: 'example',
          meta: 'Ví dụ từ slide · Trang 58–59',
          title: 'Từ hàm cầu thị trường đến sản lượng độc quyền tối ưu',
          prompt:
            'Một doanh nghiệp độc quyền có hàm cầu $q_D=400-2p$ và tổng chi phí $C(q)=q^2+20q+30$. Tìm mức sản lượng làm lợi nhuận lớn nhất.',
          method:
            'Đảo hàm cầu để viết giá theo sản lượng, lập $R(q)$ và $\\pi(q)$, giải điều kiện dừng rồi kiểm tra đạo hàm cấp hai trên miền $q>0$.',
          steps: [
            {
              label: 'Đảo hàm cầu',
              content: '$q=400-2p\\Longleftrightarrow p(q)=200-\\dfrac q2$.',
            },
            {
              label: 'Lập doanh thu và lợi nhuận',
              content: '$R(q)=p(q)q=200q-\\dfrac12q^2$ và $\\pi(q)=R-C=-\\dfrac32q^2+180q-30$.',
            },
            {
              label: 'Tìm điểm dừng',
              content: "$\\pi'(q)=-3q+180=0\\Longrightarrow q^*=60$.",
            },
            {
              label: 'Kiểm tra cực đại',
              content: "$\\pi''(q)=-3<0$ với mọi $q>0$, nên điểm dừng là cực đại toàn cục trên miền kinh tế.",
            },
          ],
          result: '$\\boxed{q^*=60}\\qquad\\bigl(p^*=170,\\ \\pi_{\\max}=5370\\bigr)$',
          interpretation:
            'Điều kiện $MR=MC$ tìm đúng điểm dừng, còn dấu âm của $\\pi\'\'$ mới khóa kết luận “lớn nhất”.',
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'MR = MC không tự động bảo đảm cực đại',
          content:
            'Một nghiệm của MR = MC chỉ là điểm dừng. Nếu lợi nhuận lồi tại đó, điểm ấy có thể là cực tiểu; nếu tối ưu nằm ở biên miền, phương trình MR = MC thậm chí có thể không có nghiệm phù hợp.',
        },
        {
          type: 'paragraph',
          content:
            'Trong thị trường cạnh tranh hoàn hảo với giá không đổi theo sản lượng của một doanh nghiệp, $p\'(q)=0$ nên $MR=p$. Trong độc quyền với đường cầu dốc xuống, $MR=p+qp\'(q)<p$. Sự khác nhau này giải thích vì sao không thể thay tùy tiện $MR$ bằng $p$ trong mọi bài.',
        },
      ],
    },
    {
      heading: '4. Chi phí trung bình và quy tắc điểm đáy',
      eyebrow: 'Cấu trúc chi phí',
      summary:
        'MC cắt AC tại điểm cực tiểu không phải mẹo ghi nhớ; đó là hệ quả trực tiếp của đạo hàm thương và còn liên hệ đẹp với độ co giãn chi phí.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Chi phí trung bình là $AC(q)=C(q)/q$ với $q>0$. Đạo hàm cho biết AC đang bị “kéo xuống” hay “kéo lên” bởi chi phí của đơn vị tăng thêm.',
        },
        {
          type: 'formula',
          label: 'Đẳng thức trung tâm',
          content: math`$$AC'(q)=\frac{qC'(q)-C(q)}{q^2}=\frac{MC(q)-AC(q)}{q}$$`,
          note:
            'Vì q dương, dấu của AC′ hoàn toàn do chênh lệch MC − AC quyết định.',
        },
        {
          type: 'diagram',
          kind: 'average-cost',
          title: 'Vì sao MC cắt AC tại điểm đáy?',
          caption:
            'Khi $MC<AC$, đơn vị tăng thêm kéo trung bình xuống; khi $MC>AC$, nó kéo trung bình lên. Giao điểm chuyển dấu là ứng viên đáy của $AC$.',
        },
        {
          type: 'comparison',
          columns: ['Quan hệ', 'Dấu của $AC\'$', 'Hệ quả'],
          rows: [
            ['$MC<AC$', '$AC\'<0$', 'Đơn vị biên kéo mức trung bình xuống'],
            ['$MC=AC$', '$AC\'=0$', 'Ứng viên điểm cực tiểu của AC'],
            ['$MC>AC$', '$AC\'>0$', 'Đơn vị biên kéo mức trung bình lên'],
          ],
        },
        {
          type: 'formula',
          label: 'Cầu nối với độ co giãn chi phí',
          content: math`$$\varepsilon_C^q=C'(q)\frac{q}{C(q)}=\frac{MC(q)}{AC(q)}$$`,
          note:
            'Do đó εC = 1 ⇔ MC = AC. Nếu AC có dạng chữ U chuẩn, đây chính là điểm đáy của AC.',
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Điều kiện cần, không phải khẩu quyết vô điều kiện',
          content:
            'Từ AC′=0 suy ra MC=AC. Muốn khẳng định đó là cực tiểu phải có thêm đổi dấu từ âm sang dương hoặc điều kiện độ cong phù hợp. Câu “MC luôn cắt AC tại đáy” ngầm dùng cấu trúc chi phí thông thường.',
        },
        {
          type: 'example',
          meta: 'Ví dụ từ slide · Trang 35–36',
          title: 'Tìm đúng điểm đáy của chi phí trung bình',
          prompt:
            'Cho $C(q)=q^2+20q+625$ với $q>0$. Tìm sản lượng làm $AC$ nhỏ nhất và so sánh $AC$ với $MC$ tại đó.',
          method:
            'Viết $AC=C/q$ trước, khảo sát dấu của $AC\'$, sau đó dùng giá trị tìm được để kiểm chứng quy tắc $MC=AC$.',
          steps: [
            {
              label: 'Tạo hàm trung bình',
              content: '$AC(q)=q+20+\\dfrac{625}{q}$.',
            },
            {
              label: 'Khảo sát chiều biến thiên',
              content: "$AC'(q)=1-\\dfrac{625}{q^2}=\\dfrac{q^2-625}{q^2}$. Trên $q>0$, đạo hàm âm khi $q<25$ và dương khi $q>25$.",
            },
            {
              label: 'Tính mức chi phí tại đáy',
              content: '$AC(25)=25+20+25=70$.',
            },
            {
              label: 'Đối chiếu chi phí biên',
              content: '$MC(q)=C\'(q)=2q+20$, nên $MC(25)=70=AC(25)$.',
            },
          ],
          result: '$\\boxed{q_0=25},\\qquad\\boxed{AC_{\\min}=MC(25)=70}$',
          interpretation:
            'Đây là một chứng minh bằng dấu, không chỉ là thay $AC\'=0$ rồi kết luận ngay.',
        },
      ],
    },
    {
      heading: '5. Co giãn cầu, doanh thu và bẫy hai loại đạo hàm',
      eyebrow: 'Trọng tâm phân loại',
      summary:
        'Đây là nơi dễ mất điểm nhất: đạo hàm doanh thu theo giá và doanh thu biên theo lượng có dấu trái nhau khi đường cầu dốc xuống.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Biên tế phụ thuộc đơn vị đo; co giãn chuẩn hóa mức thay đổi theo phần trăm nên không có đơn vị. Với hàm cầu $Q=Q(p)$, hệ số co giãn theo giá là số âm trên đoạn cầu dốc xuống.',
        },
        {
          type: 'formula',
          label: 'Định nghĩa và xấp xỉ phần trăm',
          content: math`$$E_p=Q'(p)\frac{p}{Q},\qquad \frac{\Delta Q}{Q}\approx E_p\frac{\Delta p}{p}$$`,
          note:
            'Nếu đề cho hàm cầu ngược p=p(Q), dùng dQ/dp=1/(dp/dQ) tại điểm đạo hàm khác 0.',
        },
        {
          type: 'comparison',
          columns: ['Độ co giãn', 'Khi giá tăng nhẹ', '$\\mathrm dTR/\\mathrm dp$', '$MR=\\mathrm dTR/\\mathrm dQ$'],
          rows: [
            ['$|E_p|<1$', 'TR tăng', 'Dương', 'Âm'],
            ['$|E_p|=1$', 'TR dừng bậc nhất', 'Bằng 0', 'Bằng 0'],
            ['$|E_p|>1$', 'TR giảm', 'Âm', 'Dương'],
          ],
        },
        {
          type: 'formula',
          label: 'Hai công thức phải đặt cạnh nhau',
          content: math`$$\frac{\mathrm dTR}{\mathrm dp}=Q(1+E_p),\qquad MR=\frac{\mathrm dTR}{\mathrm dQ}=p\left(1+\frac{1}{E_p}\right)$$`,
          note:
            'Vì dQ/dp < 0, hai đạo hàm liên hệ bởi dTR/dp = MR·dQ/dp và thường mang dấu ngược nhau.',
        },
        {
          type: 'diagram',
          kind: 'elasticity-revenue',
          title: 'Bản đồ dấu: co giãn, doanh thu theo giá và MR',
          caption:
            'Cùng một vùng cầu nhưng hai câu hỏi đi theo hai chiều khác nhau: tăng $p$ hay tăng $Q$. Đây là lý do dấu của $\\mathrm dTR/\\mathrm dp$ và $MR$ trái nhau.',
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'Bẫy K51 đợt 2: $E_p=-0{,}5$',
          content:
            'Cầu ít co giãn nên tăng giá làm tổng doanh thu tăng: dTR/dp = 0,5Q > 0. Nhưng Amoroso–Robinson cho MR = p(1−2)=−p<0. Phương án ghép “MR dương” với “tăng giá làm TR tăng” chỉ đúng nửa sau, nên toàn mệnh đề sai.',
        },
        {
          type: 'paragraph',
          content:
            'Trực giác không mâu thuẫn: khi tăng giá, lượng cầu giảm. Trong vùng cầu ít co giãn, giá tăng đủ bù mức giảm lượng nên TR tăng. Đọc theo chiều sản lượng thì muốn bán thêm phải hạ giá, và ở vùng này việc bán thêm làm TR giảm; vì vậy MR âm.',
        },
        {
          type: 'example',
          meta: 'Bài trong hình bạn gửi · Co giãn cầu ngược',
          title: 'Giá giảm 2% thì lượng cầu tăng bao nhiêu?',
          prompt:
            'Cho hàm cầu ngược $P(Q)=250-0{,}5Q^2$. Tại mức giá $P_0=50$, nếu giá giảm $2\\%$ thì lượng cầu thay đổi xấp xỉ bao nhiêu phần trăm?',
          method:
            'Vì đề cho $P$ theo $Q$, dùng công thức ngược $E_P=\\dfrac{1}{P\'(Q)}\\dfrac{P}{Q}$; sau đó nhân với tỷ lệ thay đổi giá có dấu.',
          steps: [
            {
              label: 'Tìm lượng cầu gốc',
              content: '$50=250-0{,}5Q_0^2\\Longrightarrow Q_0^2=400\\Longrightarrow Q_0=20$ vì lượng cầu không âm.',
            },
            {
              label: 'Tính đạo hàm ngược',
              content: "$P'(Q)=-Q$, nên $P'(20)=-20$ và $\\dfrac{\\mathrm dQ}{\\mathrm dP}=\\dfrac1{-20}$.",
            },
            {
              label: 'Tính co giãn tại điểm',
              content: '$E_P=\\dfrac1{-20}\\cdot\\dfrac{50}{20}=-\\dfrac18=-0{,}125$.',
            },
            {
              label: 'Ước lượng phần trăm',
              content: '$\\dfrac{\\Delta Q}{Q}\\approx E_P\\dfrac{\\Delta P}{P}=(-0{,}125)(-2\\%)=0{,}25\\%$.',
            },
          ],
          result: 'Lượng cầu tăng xấp xỉ $\\boxed{0{,}25\\%}$.',
          interpretation:
            'Hai dấu âm triệt tiêu: đường cầu dốc xuống và giá đang giảm. Cầu tại điểm này ít co giãn vì $|E_P|=0{,}125<1$.',
        },
      ],
    },
    {
      heading: '6. Vĩ mô: MPC, MPS và hàm tiết kiệm ẩn',
      eyebrow: 'Kinh tế vĩ mô',
      summary:
        'MPC và MPS là đạo hàm cục bộ theo thu nhập; chúng khác với tỷ trọng tiêu dùng, tỷ trọng tiết kiệm và cũng không tự động là “số nhân”.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Trong mô hình giản lược của slide, thu nhập $I$ được phân bổ thành tiêu dùng $C(I)$ và tiết kiệm $S(I)$: $I=C(I)+S(I)$. Lấy đạo hàm theo $I$ biến đồng nhất thức kế toán thành quy tắc cho phần thu nhập tăng thêm.',
        },
        {
          type: 'formula',
          label: 'Khuynh hướng biên',
          content: math`$$MPC=C'(I),\qquad MPS=S'(I),\qquad MPC+MPS=1$$`,
          note:
            'Nếu thu nhập tăng một đơn vị, MPC và MPS xấp xỉ phần tăng thêm dành cho tiêu dùng và tiết kiệm.',
        },
        {
          type: 'diagram',
          kind: 'income-split',
          title: 'Một đồng thu nhập tăng thêm được phân bổ thế nào?',
          caption:
            'Đồng nhất thức $I=C(I)+S(I)$ chuyển thành $\\mathrm dI=\\mathrm dC+\\mathrm dS$. Chia cho $\\mathrm dI$ ta được $MPC+MPS=1$.',
        },
        {
          type: 'comparison',
          columns: ['Chỉ tiêu', 'Công thức', 'Không được nhầm với'],
          rows: [
            ['MPC', "$C'(I)$", 'Tỷ trọng tiêu dùng $C/I$'],
            ['MPS', "$S'(I)$", 'Tỷ trọng tiết kiệm $S/I$'],
            ['Co giãn tiết kiệm', "$E_I^S=S'(I)I/S$", 'MPS; hai số khác đơn vị và ý nghĩa'],
          ],
        },
        {
          type: 'paragraph',
          content:
            'Nếu tiết kiệm được cho bởi phương trình ẩn $F(I,S)=0$, ta phải tìm đúng nhánh kinh tế trước rồi mới tính đạo hàm. Điều kiện như “tiết kiệm không vượt quá 30% thu nhập” không phải dữ kiện trang trí; nó loại nghiệm toán học không phù hợp.',
        },
        {
          type: 'formula',
          label: 'Hàm ẩn và co giãn tiết kiệm',
          content: math`$$S'(I)=-\frac{F_I(I,S)}{F_S(I,S)},\qquad E_I^S=S'(I)\frac{I}{S}$$`,
          note:
            'Trình tự đúng: tìm S tại I đang xét → lọc bằng điều kiện kinh tế → tính S′ → chuẩn hóa thành co giãn.',
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Giới hạn phạm vi',
          content:
            'Slide Chương 5 xây dựng MPC, MPS và đẳng thức MPC+MPS=1. Bài viết không đưa “số nhân đầu tư” vào phần cốt lõi vì đó không phải nội dung được triển khai trong nguồn Chương 5 đã đối chiếu.',
        },
        {
          type: 'example',
          meta: 'Ví dụ từ slide · Trang 14',
          title: 'MPC và MPS từ một hàm tiết kiệm',
          prompt:
            'Cho $S(I)=\\dfrac{2I-1}{I+3}$. Tính $MPS$ và $MPC$ tại $I=2$, rồi diễn giải phần thu nhập tăng thêm.',
          method:
            'Lấy đạo hàm thương để tìm $MPS=S\'(I)$; không cần dựng lại hàm tiêu dùng vì $MPC=1-MPS$.',
          steps: [
            {
              label: 'Đạo hàm hàm tiết kiệm',
              content: "$MPS=S'(I)=\\dfrac{2(I+3)-(2I-1)}{(I+3)^2}=\\dfrac{7}{(I+3)^2}$.",
            },
            {
              label: 'Tính tại mức thu nhập gốc',
              content: '$MPS(2)=\\dfrac{7}{(2+3)^2}=\\dfrac{7}{25}$.',
            },
            {
              label: 'Dùng đồng nhất thức biên',
              content: '$MPC(2)=1-MPS(2)=\\dfrac{18}{25}$.',
            },
          ],
          result: '$\\boxed{MPS(2)=\\dfrac{7}{25}},\\qquad\\boxed{MPC(2)=\\dfrac{18}{25}}$',
          interpretation:
            'Quanh $I=2$, một đơn vị thu nhập tăng thêm được phân bổ xấp xỉ $7/25$ cho tiết kiệm và $18/25$ cho tiêu dùng; hai phần cộng đúng bằng 1.',
        },
      ],
    },
    {
      heading: '7. Quy tắc chuỗi, đạo hàm ẩn và vi phân xấp xỉ',
      eyebrow: 'Bộ công cụ',
      summary:
        'Ba kỹ thuật này giải phần lớn bài ứng dụng một biến: lần theo chuỗi phụ thuộc, xử lý quan hệ chưa giải tường minh và ước lượng thay đổi nhỏ.',
      blocks: [
        {
          type: 'comparison',
          columns: ['Dấu hiệu đề bài', 'Công cụ', 'Mẫu công thức'],
          rows: [
            ['Đại lượng đi qua biến trung gian', 'Quy tắc chuỗi', '$\\displaystyle\\frac{\\mathrm dC}{\\mathrm dp}=\\frac{\\mathrm dC}{\\mathrm dQ}\\frac{\\mathrm dQ}{\\mathrm dp}$'],
            ['Quan hệ viết dạng $F(x,y)=0$', 'Đạo hàm ẩn', '$\\displaystyle y\'=-\\frac{F_x}{F_y}$'],
            ['“Tăng/giảm nhỏ”, “xấp xỉ”', 'Vi phân', '$\\Delta y\\approx y\'(x_0)\\Delta x$'],
            ['Thay đổi theo phần trăm', 'Co giãn', '$\\%\\Delta y\\approx E\\,\\%\\Delta x$'],
          ],
        },
        {
          type: 'paragraph',
          content:
            'Quy tắc chuỗi phải được dựng theo sơ đồ phụ thuộc. Ví dụ $C=C(Q)$ và $PQ=500$ làm $Q=500/P$, nên $C$ phụ thuộc vào $P$ thông qua $Q$. Viết được chuỗi $P\\to Q(P)\\to C(Q(P))$ gần như đã giải xong bài.',
        },
        {
          type: 'formula',
          label: 'Quy tắc chuỗi — viết bằng phân số để nhìn thấy biến trung gian',
          content: math`$$\begin{aligned}
          P&\longrightarrow Q(P)\longrightarrow C(Q(P)),\\[3pt]
          \frac{\mathrm dC}{\mathrm dP}
          &=\frac{\mathrm dC}{\mathrm dQ}\cdot\frac{\mathrm dQ}{\mathrm dP},\\[7pt]
          \frac{\mathrm dR}{\mathrm dL}
          &=\frac{\mathrm dR}{\mathrm dQ}\cdot\frac{\mathrm dQ}{\mathrm dL}.
          \end{aligned}$$`,
          note:
            'Các vi phân ở giữa “triệt tiêu” chỉ là mẹo nhớ trực quan; bản chất vẫn là đạo hàm của hàm hợp và phải đúng thứ tự phụ thuộc.',
        },
        {
          type: 'example',
          meta: 'Bài trong hình bạn gửi · Đạo hàm ẩn Chương 5',
          title: 'Tìm $y\'(0)$ mà không cần giải tường minh $y(x)$',
          prompt:
            'Cho $y=y(x)$ khả vi thỏa $e^{xy}+(x-1)y^3+xy^2-2y+2=0$. Tính $y\'(0)$.',
          method:
            'Đặt $g(x,y)=0$, tìm $y(0)$ từ phương trình gốc, rồi dùng công thức phân số $y\'=-g_x/g_y$ tại đúng điểm.',
          steps: [
            {
              label: 'Xác định điểm trên đường cong',
              content: 'Cho $x=0$: $1-y^3-2y+2=0\\Longleftrightarrow y^3+2y-3=0$. Nghiệm thực phù hợp là $y(0)=1$.',
            },
            {
              label: 'Tính đạo hàm riêng theo x',
              content: '$g_x=ye^{xy}+y^3+y^2$.',
            },
            {
              label: 'Tính đạo hàm riêng theo y',
              content: '$g_y=xe^{xy}+3(x-1)y^2+2xy-2$.',
            },
            {
              label: 'Thế điểm $(0,1)$',
              content: "$y'(0)=-\\dfrac{g_x(0,1)}{g_y(0,1)}=-\\dfrac{1+1+1}{-3-2}=\\dfrac35$.",
            },
          ],
          result: '$\\boxed{y\'(0)=\\dfrac35}$',
          interpretation:
            'Đây là hồ sơ kỹ thuật hỗ trợ các bài chi phí hoặc tiết kiệm ẩn: không cần cô lập $y$ trước khi lấy đạo hàm.',
        },
        {
          type: 'formula',
          label: 'Xấp xỉ tuyến tính',
          content: math`$$f(x_0+\Delta x)\approx f(x_0)+f'(x_0)\Delta x$$`,
          note:
            'Sai số thường tăng khi |Δx| lớn hoặc khi độ cong |f″| lớn; đây là xấp xỉ cục bộ, không phải đẳng thức.',
        },
        {
          type: 'steps',
          title: 'Quy trình đọc đề thay đổi nhỏ',
          items: [
            'Vẽ chuỗi phụ thuộc giữa các biến trước khi đạo hàm.',
            'Xác định đề hỏi mức thay đổi tuyệt đối hay phần trăm.',
            'Tính đạo hàm tại đúng trạng thái gốc, không phải trạng thái sau thay đổi.',
            'Nhân với $\\Delta x$ hoặc tỷ lệ phần trăm có dấu.',
            'Kiểm tra chiều biến động bằng trực giác kinh tế và đơn vị đo.',
          ],
        },
      ],
    },
    {
      heading: '8. Hồ sơ đề thi K46–K51: nhận dạng, lời giải và bẫy',
      eyebrow: 'Đề thi đã đối chiếu',
      summary:
        'Mỗi hồ sơ được tách thành dữ kiện, đích cần tìm, chiến lược, lời giải từng bước, cách tự kiểm tra và bẫy — để người đọc hiểu được đường đi chứ không chỉ nhìn thấy đáp số.',
      blocks: [
        {
          type: 'source-note',
          title: 'Cách ghi nguồn',
          content:
            'Tệp PDF tổng hợp có đề K46, K47, K49 và K50; không thấy một đề K48 độc lập để gán nhãn. K51 được đối chiếu trực tiếp từ các tệp LaTeX mã 118, 204, 354, 442, bản English và bản đợt 2 sinh viên chép đề.',
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Hai hình được giữ ngoài phạm vi',
          content:
            'Câu xấp xỉ $f(10{,}1;4{,}8)$ dùng vi phân toàn phần hai biến và câu Cobb–Douglas $Q(K,L)$ dùng đạo hàm riêng. Chúng thuộc phần hàm nhiều biến của chương sau, không phải Chương 5 một biến. Để giữ đúng yêu cầu “chỉ vi mô/vĩ mô trong Chương 5”, bài không trộn hai câu này vào hồ sơ chính; các hình còn lại đã được đưa vào dưới dạng hồ sơ hoặc ví dụ chi tiết.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 01 · K46 · Câu 6',
          title: 'Chuỗi phụ thuộc giá → sản lượng → chi phí',
          skill: 'Quy tắc chuỗi',
          difficulty: 'Nền tảng',
          given: '$PQ=500$, $MC=\\dfrac{\\mathrm dC}{\\mathrm dQ}=10$ tại $Q=10$.',
          ask: '$\\dfrac{\\mathrm dC}{\\mathrm dP}$ tại trạng thái đó.',
          prompt:
            'Giá và lượng thỏa $PQ=500$. Tại $Q=10$, chi phí biên bằng 10. Hãy xác định tốc độ thay đổi của tổng chi phí theo giá.',
          method:
            'Vẽ chuỗi $P\\to Q(P)\\to C(Q(P))$, rồi dùng $\\dfrac{\\mathrm dC}{\\mathrm dP}=\\dfrac{\\mathrm dC}{\\mathrm dQ}\\dfrac{\\mathrm dQ}{\\mathrm dP}$.',
          steps: [
            {
              label: 'Tìm mức giá đi kèm',
              content: '$Q=\\dfrac{500}{P}$ và $Q=10$ nên $P=50$.',
            },
            {
              label: 'Đạo hàm lượng theo giá',
              content: '$\\dfrac{\\mathrm dQ}{\\mathrm dP}=-\\dfrac{500}{P^2}$; tại $P=50$ được $-\\dfrac15$.',
            },
            {
              label: 'Nối hai đạo hàm',
              content: '$\\dfrac{\\mathrm dC}{\\mathrm dP}=\\dfrac{\\mathrm dC}{\\mathrm dQ}\\dfrac{\\mathrm dQ}{\\mathrm dP}=10\\left(-\\dfrac15\\right)=-2$.',
            },
          ],
          result: '$\\boxed{\\dfrac{\\mathrm dC}{\\mathrm dP}=-2}$',
          interpretation:
            'Quanh trạng thái $P=50,Q=10$, giá tăng một đơn vị làm lượng cân bằng giảm; qua đó tổng chi phí giảm xấp xỉ 2 đơn vị.',
          check:
            'Đơn vị triệt tiêu đúng: tiền/sản phẩm × sản phẩm/đơn vị giá = chi phí/đơn vị giá. Dấu âm phù hợp với $Q=500/P$.',
          trap:
            'Đề cho MC nhưng không hỏi MC. Dừng ở số 10 là bỏ mất mắt xích $Q(P)$.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 02 · K47 · Câu 13',
          title: 'Đảo chiều chuỗi để truy ngược chi phí biên',
          skill: 'Quy tắc chuỗi',
          difficulty: 'Nền tảng',
          given: '$PQ=250$, $\\dfrac{\\mathrm dC}{\\mathrm dP}=-0{,}5$ tại $Q=25$.',
          ask: '$MC=\\dfrac{\\mathrm dC}{\\mathrm dQ}$.',
          prompt:
            'Biết chi phí đang thay đổi theo giá với tốc độ $-0{,}5$ và giá–lượng thỏa $PQ=250$. Tìm chi phí biên tại $Q=25$.',
          method:
            'Viết $P$ theo $Q$ để đi theo chiều $Q\\to P(Q)\\to C(P(Q))$: $\\dfrac{\\mathrm dC}{\\mathrm dQ}=\\dfrac{\\mathrm dC}{\\mathrm dP}\\dfrac{\\mathrm dP}{\\mathrm dQ}$.',
          steps: [
            {
              label: 'Đổi chiều quan hệ giá–lượng',
              content: '$P(Q)=\\dfrac{250}{Q}$.',
            },
            {
              label: 'Tính tốc độ giá theo lượng',
              content: '$\\dfrac{\\mathrm dP}{\\mathrm dQ}=-\\dfrac{250}{Q^2}$; tại $Q=25$ được $-\\dfrac25$.',
            },
            {
              label: 'Tạo chi phí biên',
              content: '$MC=\\dfrac{\\mathrm dC}{\\mathrm dQ}=(-0{,}5)\\left(-\\dfrac25\\right)=0{,}2$.',
            },
          ],
          result: '$\\boxed{MC=0{,}2}$',
          interpretation:
            'Hai quan hệ đều nghịch biến theo mắt xích nên chi phí cuối cùng đồng biến với sản lượng tại điểm xét.',
          check:
            'Hai dấu âm phải cho kết quả dương; nếu ra $-0{,}2$ thì lỗi nằm ở đạo hàm của $250/Q$.',
          trap:
            'Không viết $\\dfrac{\\mathrm dC}{\\mathrm dQ}=\\dfrac{\\mathrm dC}{\\mathrm dP}\\dfrac{\\mathrm dQ}{\\mathrm dP}$; hai vi phân giữa phải khớp chiều.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 03 · K49 mã 2 · Câu 7',
          title: 'Từ co giãn chi phí đến MC chỉ trong một dòng',
          skill: 'Co giãn chi phí',
          difficulty: 'Có lỗi nguồn',
          given: '$q=10$, $\\varepsilon_C^q=1$, $AC=\\dfrac Cq=40$.',
          ask: '$MC=C\'(q)$.',
          prompt:
            'Tại $q=10$, độ co giãn chi phí bằng 1 và $AC=C/q=40$. Tính MC.',
          method:
            'Biến định nghĩa co giãn thành tỷ số của đại lượng biên và trung bình: $\\varepsilon_C^q=MC/AC$.',
          steps: [
            {
              label: 'Rút gọn công thức',
              content: '$\\varepsilon_C^q=C\'(q)\\dfrac qC=MC\\dfrac1{C/q}=\\dfrac{MC}{AC}$.',
            },
            {
              label: 'Thế dữ kiện',
              content: '$1=\\dfrac{MC}{40}\\Longrightarrow MC=40$.',
            },
          ],
          result: '$\\boxed{MC=40}$',
          interpretation:
            'Co giãn chi phí bằng 1 nghĩa là chi phí biên bằng chi phí trung bình tại trạng thái đó.',
          check:
            'Thế ngược $MC/AC=40/40=1$, khớp dữ kiện.',
          trap:
            'Theo đúng dữ kiện, kết quả là 40. Bản PDF nguồn lại đánh dấu “đáp án A” trong khi lựa chọn A hiển thị 80; đây là một bất nhất của tài liệu, không nên sửa phép tính để ép khớp đáp án.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 04 · K50 đợt 1 · Câu 1',
          title: 'Đạo hàm trực tiếp hàm tổng chi phí',
          skill: 'Chi phí biên',
          difficulty: 'Nền tảng',
          given: '$C(q)=\\dfrac{5q^2}{\\sqrt{q^2+3}}+5000$, $q=10$.',
          ask: '$MC(10)$.',
          prompt:
            'Cho $C(q)=\\dfrac{5q^2}{\\sqrt{q^2+3}}+5000$. Tính MC tại $q=10$.',
          method:
            'Viết phần biến đổi thành $5q^2(q^2+3)^{-1/2}$ để dùng quy tắc tích và chuỗi; chi phí cố định có đạo hàm bằng 0.',
          steps: [
            {
              label: 'Đạo hàm phần chi phí biến đổi',
              content: "$C'(q)=10q(q^2+3)^{-1/2}-5q^3(q^2+3)^{-3/2}$.",
            },
            {
              label: 'Quy đồng và rút gọn',
              content: "$MC(q)=\\dfrac{5q(q^2+6)}{(q^2+3)^{3/2}}$.",
            },
            {
              label: 'Thế sản lượng',
              content: '$MC(10)=\\dfrac{50(106)}{103^{3/2}}\\approx5{,}07$.',
            },
          ],
          result: '$\\boxed{5{,}07}$',
          interpretation:
            'Quanh $q=10$, một đơn vị sản lượng tăng thêm làm tổng chi phí tăng xấp xỉ 5,07 đơn vị tiền.',
          check:
            'Số 5000 không xuất hiện trong MC vì đó là chi phí cố định.',
          trap:
            'Hằng số 5000 là chi phí cố định nên biến mất khi đạo hàm; nhưng nó vẫn ảnh hưởng AC.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 05 · K50 đợt 2 · Câu 1',
          title: 'Từ độ co giãn cầu đến mức doanh thu',
          skill: 'Co giãn · Doanh thu',
          difficulty: 'Trung bình',
          given: '$Q(P)=\\sqrt{500-4P}$ và $|E_P|=2$.',
          ask: '$R=PQ$.',
          prompt:
            'Hàm cầu là $Q(P)=\\sqrt{500-4P}$. Tại mức giá mà cầu có độ co giãn tuyệt đối bằng 2, hãy tính doanh thu.',
          method:
            'Tính $E_P=Q\'(P)P/Q(P)$, giải điều kiện $|E_P|=2$ trong miền $0\\le P\\le125$, rồi quay lại tìm $Q$ và $R$.',
          steps: [
            {
              label: 'Tính đạo hàm cầu',
              content: "$Q'(P)=-\\dfrac{2}{\\sqrt{500-4P}}=-\\dfrac2Q$.",
            },
            {
              label: 'Lập độ co giãn',
              content: '$E_P=Q\'(P)\\dfrac PQ=-\\dfrac{2P}{Q^2}=-\\dfrac{2P}{500-4P}$.',
            },
            {
              label: 'Giải điều kiện độ lớn bằng 2',
              content: '$\\dfrac{2P}{500-4P}=2\\Longrightarrow P=100$.',
            },
            {
              label: 'Tính lượng và doanh thu',
              content: '$Q=\\sqrt{500-400}=10$, nên $R=PQ=100(10)=1000$.',
            },
          ],
          result: '$\\boxed{R=1000}$',
          interpretation:
            'Phải tìm đúng trạng thái giá–lượng trước khi tính doanh thu; độ co giãn không phải doanh thu.',
          check:
            'Tại $P=100$, $E_P=-200/100=-2$, đúng độ lớn đề cho.',
          trap:
            'Không bỏ dấu âm trong $Q\'(P)$; chỉ dùng giá trị tuyệt đối ở đúng phương trình $|E_P|=2$.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 06 · K50 đợt 2 · Câu 2',
          title: 'Chi phí biên từ một quan hệ ẩn',
          skill: 'Đạo hàm ẩn',
          difficulty: 'Trung bình',
          given: '$C^2-2CQ+Q^2-2Q-4800=0$, $Q=50$, $C>0$.',
          ask: '$MC=C\'(50)$.',
          prompt:
            'Tổng chi phí $C=C(Q)$ không được cho tường minh mà thỏa phương trình trên. Tìm chi phí biên tại $Q=50$.',
          method:
            'Tìm $C(50)$ trước để biết điểm đang xét, lọc nhánh theo ý nghĩa kinh tế, sau đó đạo hàm ẩn toàn bộ phương trình theo $Q$.',
          steps: [
            {
              label: 'Tìm giá trị chi phí tại Q = 50',
              content: '$C^2-100C-2400=0\\Longrightarrow C=120$ hoặc $C=-20$. Vì chi phí dương, chọn $C(50)=120$.',
            },
            {
              label: 'Đạo hàm ẩn',
              content: '$2CC\'-2(C\'Q+C)+2Q-2=0$.',
            },
            {
              label: 'Cô lập đạo hàm',
              content: '$C\'(C-Q)=C+1-Q\\Longrightarrow C\'=\\dfrac{C+1-Q}{C-Q}$.',
            },
            {
              label: 'Thế đúng nhánh',
              content: '$C\'(50)=\\dfrac{120+1-50}{120-50}=\\dfrac{71}{70}$.',
            },
          ],
          result: '$\\boxed{MC(50)=\\dfrac{71}{70}}$',
          interpretation:
            'Quanh $Q=50$, tăng một đơn vị sản lượng làm chi phí tăng xấp xỉ $71/70$ đơn vị tiền.',
          check:
            'Mẫu $C-Q=70\\ne0$, nên công thức đạo hàm ẩn hợp lệ tại điểm này.',
          trap:
            'Đạo hàm $-2CQ$ phải dùng quy tắc tích. Bỏ số hạng $-2C$ sẽ làm sai tử số.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 07 · K51 mã 118 · Câu 3',
          title: 'Co giãn của hàm cầu hợp $q=f(2p)$',
          skill: 'Hàm hợp · Co giãn',
          difficulty: 'Trung bình',
          given: "$q=f(2p)$, $f'(10)=-\\dfrac{f(10)}{10}$, $p_0=5$.",
          ask: 'Phần trăm thay đổi của $q$ khi $p$ tăng $4\\%$.',
          prompt:
            'Cho hàm cầu $q=f(2p)$ và điều kiện đạo hàm tại 10. Tại $p=5$, nếu giá tăng 4% thì lượng cầu thay đổi xấp xỉ thế nào?',
          method:
            'Quy tắc chuỗi tạo $q\'(p)$, sau đó chuẩn hóa thành độ co giãn $E_p=q\'(p)p/q(p)$.',
          steps: [
            {
              label: 'Đạo hàm hàm hợp',
              content: "$q'(p)=f'(2p)\\cdot2$.",
            },
            {
              label: 'Tính tại p = 5',
              content: "$q'(5)=2f'(10)=-\\dfrac{f(10)}5$, còn $q(5)=f(10)$.",
            },
            {
              label: 'Chuẩn hóa thành co giãn',
              content: '$E_p=q\'(5)\\dfrac5{q(5)}=-\\dfrac{f(10)}5\\dfrac5{f(10)}=-1$.',
            },
            {
              label: 'Ước lượng phần trăm',
              content: '$\\%\\Delta q\\approx E_p\\,\\%\\Delta p=(-1)(4\\%)=-4\\%$.',
            },
          ],
          result: 'Lượng cầu giảm xấp xỉ $\\boxed{4\\%}$.',
          interpretation:
            'Đây là cầu co giãn đơn vị tại $p=5$: phần trăm lượng và giá thay đổi xấp xỉ bằng nhau nhưng ngược chiều.',
          check:
            'Hệ số 2 từ đạo hàm $f(2p)$ bị triệt tiêu đúng khi chuẩn hóa tại $p=5$.',
          trap:
            'Quên nhân đạo hàm của $2p$ sẽ cho $E_p=-1/2$ và chọn sai đáp án.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 08 · K51 mã 118 · Doanh thu biên',
          title: 'Doanh thu luôn tăng nhưng MR đang giảm',
          skill: 'MR · Chiều biến thiên',
          difficulty: 'Trung bình',
          given: '$P(Q)=\\dfrac{1000}{Q+10}$, $Q_0=40$.',
          ask: '$MR(40)$ và chiều biến thiên của $R$, $MR$.',
          prompt:
            'Từ hàm cầu ngược trên, xác định doanh thu biên tại $Q=40$ và kiểm tra các nhận định “doanh thu đạt cực đại”, “doanh thu tăng”, “MR tăng”.',
          method:
            'Tạo $R(Q)=P(Q)Q$, lấy đạo hàm một lần cho MR và thêm một lần để xét chiều biến thiên của MR.',
          steps: [
            {
              label: 'Lập hàm doanh thu',
              content: '$R(Q)=\\dfrac{1000Q}{Q+10}$.',
            },
            {
              label: 'Tính doanh thu biên',
              content: '$MR(Q)=R\'(Q)=\\dfrac{10000}{(Q+10)^2}>0$ với mọi $Q>0$.',
            },
            {
              label: 'Thế Q = 40',
              content: '$MR(40)=\\dfrac{10000}{50^2}=4$.',
            },
            {
              label: 'Xét MR tăng hay giảm',
              content: '$MR\'(Q)=-\\dfrac{20000}{(Q+10)^3}<0$, nên MR giảm dù R vẫn tăng.',
            },
          ],
          result: '$\\boxed{MR(40)=4}$; doanh thu $R$ tăng, còn $MR$ giảm.',
          interpretation:
            'Mỗi đơn vị sản lượng tăng thêm vẫn làm doanh thu tăng, nhưng phần tăng thêm ngày càng nhỏ.',
          check:
            '$MR>0$ xác nhận $R$ tăng; $MR\'<0$ xác nhận tốc độ tăng của $R$ đang chậm lại.',
          trap:
            '“MR giảm” không đồng nghĩa “doanh thu giảm”. Doanh thu chỉ giảm khi chính MR âm.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 09 · K51 mã 204 · Tiết kiệm ẩn',
          title: 'Điều kiện kinh tế dùng để chọn đúng nhánh',
          skill: 'Đạo hàm ẩn · Co giãn',
          difficulty: 'Nâng cao',
          given: '$S^2+\\dfrac{I^2}{4}=SI+I$, $S\\le30\\%I$, $I_0=16$.',
          ask: '$E_I^S$ và phần trăm tăng của $S$ nếu $I$ tăng $2\\%$.',
          prompt:
            'Lượng tiết kiệm và thu nhập thỏa quan hệ ẩn trên. Biết tiết kiệm không vượt quá 30% thu nhập. Tại $I=16$, hãy tìm độ co giãn tiết kiệm theo thu nhập.',
          method:
            'Giải $S(16)$ và dùng ràng buộc kinh tế để chọn nhánh trước; sau đó đạo hàm ẩn và chuẩn hóa.',
          steps: [
            {
              label: 'Tìm các nhánh toán học',
              content: '$S^2+64=16S+16\\Longrightarrow S^2-16S+48=0$, nên $S=4$ hoặc $S=12$.',
            },
            {
              label: 'Lọc bằng ràng buộc kinh tế',
              content: '$S\\le0{,}3(16)=4{,}8$, vì vậy chỉ nhận $S(16)=4$.',
            },
            {
              label: 'Đạo hàm ẩn',
              content: '$2SS\'+\\dfrac I2=S\'I+S+1$, nên $S\'=\\dfrac{S+1-I/2}{2S-I}$.',
            },
            {
              label: 'Tính đạo hàm tại nhánh đúng',
              content: '$S\'(16)=\\dfrac{4+1-8}{8-16}=\\dfrac38$.',
            },
            {
              label: 'Chuẩn hóa thành co giãn',
              content: '$E_I^S=S\'(16)\\dfrac{16}{4}=\\dfrac38\\cdot4=\\dfrac32$.',
            },
          ],
          result: '$\\boxed{E_I^S=\\dfrac32}$; nếu $I$ tăng $2\\%$ thì $S$ tăng xấp xỉ $\\boxed{3\\%}$.',
          interpretation:
            'Tiết kiệm phản ứng theo phần trăm mạnh hơn thu nhập tại trạng thái này.',
          check:
            'Nếu chọn nhánh $S=12$, tỷ trọng tiết kiệm là 75%, vi phạm trực tiếp giả thiết 30%.',
          trap:
            'Điều kiện 30% không phải dữ kiện thừa; nó quyết định nhánh hàm và toàn bộ đạo hàm phía sau.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 10 · K51 mã 354 · Câu 1',
          title: 'Từ tối đa lợi nhuận suy ngược chi phí biên',
          skill: 'Độc quyền · MR = MC',
          difficulty: 'Nền tảng',
          given: '$Q_D=1500-\\dfrac P2$, lợi nhuận cực đại tại $Q_0=400$.',
          ask: '$MC(Q_0)$.',
          prompt:
            'Một doanh nghiệp độc quyền đối mặt với hàm cầu trên và đạt lợi nhuận lớn nhất tại $Q=400$. Hãy xác định chi phí biên tại sản lượng tối ưu.',
          method:
            'Đảo cầu để tìm $P(Q)$, tạo doanh thu và MR; tại nghiệm tối ưu nội miền dùng điều kiện cần $MR=MC$.',
          steps: [
            {
              label: 'Đảo hàm cầu',
              content: '$Q=1500-\\dfrac P2\\Longleftrightarrow P=3000-2Q$.',
            },
            {
              label: 'Tạo doanh thu',
              content: '$R(Q)=P(Q)Q=3000Q-2Q^2$.',
            },
            {
              label: 'Tính doanh thu biên',
              content: '$MR(Q)=R\'(Q)=3000-4Q$, nên $MR(400)=1400$.',
            },
            {
              label: 'Dùng điều kiện tối ưu',
              content: '$\\pi\'(400)=MR(400)-MC(400)=0\\Longrightarrow MC(400)=1400$.',
            },
          ],
          result: '$\\boxed{MC(400)=1400}$',
          interpretation:
            'Ở sản lượng tối ưu, đơn vị sản phẩm biên đóng góp 1.400 đơn vị doanh thu và đồng thời tốn 1.400 đơn vị chi phí.',
          check:
            '$MR(400)>0$ và mức giá $P(400)=2200$ lớn hơn MR, phù hợp cấu trúc độc quyền có đường cầu dốc xuống.',
          trap:
            'Không dùng $MC=P=2200$. Trong độc quyền, $MR<P$.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 11 · K51 mã 442 · Câu 10',
          title: 'Giá trị cận biên tiến đến một hằng số',
          skill: 'MPL · Giới hạn',
          difficulty: 'Nền tảng',
          given: '$Q(L)=\\dfrac L2+\\dfrac12\\ln(2L+1)$, $L\\ge0$.',
          ask: 'Chọn phát biểu đúng về $MPL$ khi $L\\to+\\infty$.',
          prompt:
            'Bài trong hình hỏi hành vi của năng suất biên lao động khi quy mô lao động tăng rất lớn.',
          method:
            'Tính $MPL=Q\'(L)$, sau đó xét cả giá trị tại $L=1$, dấu đạo hàm của MPL và giới hạn.',
          steps: [
            {
              label: 'Tính năng suất biên',
              content: '$MPL(L)=Q\'(L)=\\dfrac12+\\dfrac1{2L+1}$.',
            },
            {
              label: 'Kiểm tra giá trị tại L = 1',
              content: '$MPL(1)=\\dfrac12+\\dfrac13=\\dfrac56$, không phải $7/12$.',
            },
            {
              label: 'Xét chiều biến thiên',
              content: "$MPL'(L)=-\\dfrac2{(2L+1)^2}<0$, nên MPL giảm dần.",
            },
            {
              label: 'Tính giới hạn',
              content: '$\\displaystyle\\lim_{L\\to+\\infty}MPL(L)=\\dfrac12$.',
            },
          ],
          result: 'Đáp án B: $\\boxed{MPL\\longrightarrow\\dfrac12}$ khi $L\\to+\\infty$.',
          interpretation:
            'Năng suất biên giảm dần nhưng không sụp về 0; phần tuyến tính $L/2$ giữ giới hạn biên ở mức $1/2$.',
          check:
            'Với mọi $L\\ge0$, số hạng $1/(2L+1)>0$, nên MPL luôn lớn hơn $1/2$ và tiến xuống từ phía trên.',
          trap:
            '“Giảm dần” không đồng nghĩa “tiến về 0”. Phải tính giới hạn.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 12 · K51 bản English · Marginal profit',
          title: 'Tối thiểu hóa một hàm biên cần thêm một đạo hàm',
          skill: 'Đạo hàm cấp cao',
          difficulty: 'Trung bình',
          given: '$M\\pi(Q)=\\pi\'(Q)=3Q^2-9Q+6$.',
          ask: 'Sản lượng làm lợi nhuận biên nhỏ nhất.',
          prompt:
            'Đề không hỏi cực đại lợi nhuận; đề hỏi giá trị nhỏ nhất của chính hàm lợi nhuận biên.',
          method:
            'Xem $M\\pi$ là một hàm mục tiêu mới. Điểm dừng của nó được tìm bằng $(M\\pi)\'=\\pi\'\'=0$.',
          steps: [
            {
              label: 'Lấy thêm một đạo hàm',
              content: '$(M\\pi)\'(Q)=6Q-9$.',
            },
            {
              label: 'Tìm điểm dừng của hàm biên',
              content: '$6Q-9=0\\Longrightarrow Q=\\dfrac32$.',
            },
            {
              label: 'Kiểm tra cực tiểu',
              content: '$(M\\pi)\'\'(Q)=6>0$, nên $M\\pi$ đạt cực tiểu tại điểm dừng.',
            },
          ],
          result: '$\\boxed{Q=\\dfrac32}$',
          interpretation:
            'Đạo hàm bậc hai của lợi nhuận đo tốc độ thay đổi của lợi nhuận biên; ở đây nó bằng 0 tại đáy của $M\\pi$.',
          check:
            '$M\\pi$ là parabol có hệ số $Q^2$ dương, nên kết quả phải là điểm cực tiểu.',
          trap:
            'Giải $M\\pi=0$ sẽ tìm nơi lợi nhuận dừng tăng/giảm, không phải nơi lợi nhuận biên nhỏ nhất.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 13 · K51 đợt 2 · Câu 4',
          title: 'Chi phí biên của hàm logarit hợp',
          skill: 'Đạo hàm hàm hợp',
          difficulty: 'Nền tảng',
          given: '$C(Q)=500\\ln(Q^2+1)+200$, $Q_0=3$.',
          ask: '$MC(3)$.',
          prompt:
            'Tính chi phí biên tại sản lượng 3 từ hàm tổng chi phí có logarit của một biểu thức bậc hai.',
          method:
            'Dùng $[\\ln u(Q)]\'=u\'(Q)/u(Q)$ và nhớ chi phí cố định 200 biến mất khi đạo hàm.',
          steps: [
            {
              label: 'Nhận diện hàm trong',
              content: '$u(Q)=Q^2+1$ nên $u\'(Q)=2Q$.',
            },
            {
              label: 'Lấy đạo hàm',
              content: '$MC(Q)=C\'(Q)=500\\dfrac{2Q}{Q^2+1}=\\dfrac{1000Q}{Q^2+1}$.',
            },
            {
              label: 'Thế Q = 3',
              content: '$MC(3)=\\dfrac{3000}{10}=300$.',
            },
          ],
          result: '$\\boxed{MC(3)=300}$',
          interpretation:
            'Quanh sản lượng 3, tăng một đơn vị sản lượng làm tổng chi phí tăng xấp xỉ 300 đơn vị tiền.',
          check:
            'Tại $Q=3$, cả tử và mẫu đều dương nên MC phải dương.',
          trap:
            'Không viết $(\\ln u)\'=1/u$ rồi quên nhân $u\'=2Q$.',
        },
        {
          type: 'exam',
          featured: true,
          meta: 'Hồ sơ 14 · K51 đợt 2 · Câu 6',
          title: 'Bẫy dấu giữa doanh thu theo giá và doanh thu biên',
          skill: 'Co giãn · Amoroso–Robinson',
          difficulty: 'Câu phân loại',
          given: '$E_p=-0{,}5$, đường cầu dốc xuống.',
          ask: 'Dấu của $\\dfrac{\\mathrm dTR}{\\mathrm dp}$, dấu của $MR$ và đáp án đúng.',
          prompt:
            'Tại mức giá hiện tại, độ co giãn cầu theo giá bằng $-0{,}5$. Xét các phát biểu ghép dấu của MR với chiều thay đổi doanh thu khi tăng giá.',
          method:
            'Tách thành hai câu hỏi và dùng hai công thức khác nhau: $\\dfrac{\\mathrm dTR}{\\mathrm dp}=Q(1+E_p)$, còn $MR=p(1+1/E_p)$.',
          steps: [
            {
              label: 'Xét doanh thu khi giá thay đổi',
              content: '$\\dfrac{\\mathrm dTR}{\\mathrm dp}=Q(1-0{,}5)=0{,}5Q>0$. Vì vậy tăng giá làm tổng doanh thu tăng.',
            },
            {
              label: 'Xét doanh thu biên theo lượng',
              content: '$MR=p\\left(1+\\dfrac1{-0{,}5}\\right)=p(1-2)=-p<0$.',
            },
            {
              label: 'Đối chiếu từng phương án',
              content: 'B sai vì ghép “MR dương” với phần sau đúng; D sai vì nói doanh thu giảm khi tăng giá; A cũng sai.',
            },
            {
              label: 'Chốt lựa chọn',
              content: 'Chọn C: các phát biểu còn lại đều sai.',
            },
          ],
          result: '$\\boxed{\\dfrac{\\mathrm dTR}{\\mathrm dp}>0},\\qquad\\boxed{MR<0}$; chọn $\\boxed{C}$.',
          interpretation:
            'Tăng giá và tăng lượng là hai chuyển động ngược chiều trên đường cầu, nên hai đạo hàm doanh thu có dấu trái nhau.',
          check:
            'Quan hệ chuỗi $\\dfrac{\\mathrm dTR}{\\mathrm dp}=MR\\dfrac{\\mathrm dQ}{\\mathrm dp}$: vế trái dương, $\\mathrm dQ/\\mathrm dp<0$, nên MR bắt buộc âm.',
          trap:
            'Đây là lỗi cũ nghiêm trọng nhất của bài: “tăng giá làm TR tăng” không suy ra MR dương.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 15 · Bài trong hình · Co giãn cầu ngược',
          title: 'Giảm giá 2% với $P=250-0{,}5Q^2$',
          skill: 'Đạo hàm ngược · Co giãn',
          difficulty: 'Trung bình',
          given: '$P(Q)=250-0{,}5Q^2$, $P_0=50$, $\\Delta P/P=-2\\%$.',
          ask: '$\\Delta Q/Q$ xấp xỉ.',
          prompt:
            'Tại mức giá 50, nếu giá giảm 2% thì lượng cầu tăng xấp xỉ bao nhiêu phần trăm?',
          method:
            'Tìm $Q_0$, dùng $\\dfrac{\\mathrm dQ}{\\mathrm dP}=1/P\'(Q_0)$ để tính độ co giãn, rồi áp dụng vi phân phần trăm.',
          steps: [
            {
              label: 'Xác định lượng gốc',
              content: '$50=250-0{,}5Q_0^2\\Longrightarrow Q_0=20$.',
            },
            {
              label: 'Tính đạo hàm ngược',
              content: "$P'(Q)=-Q$, nên tại $Q_0=20$: $\\dfrac{\\mathrm dQ}{\\mathrm dP}=-\\dfrac1{20}$.",
            },
            {
              label: 'Tính độ co giãn',
              content: '$E_P=\\dfrac{\\mathrm dQ}{\\mathrm dP}\\dfrac{P}{Q}=-\\dfrac1{20}\\dfrac{50}{20}=-\\dfrac18$.',
            },
            {
              label: 'Áp dụng thay đổi giá',
              content: '$\\dfrac{\\Delta Q}{Q}\\approx E_P\\dfrac{\\Delta P}{P}=\\left(-\\dfrac18\\right)(-2\\%)=0{,}25\\%$.',
            },
          ],
          result: 'Lượng cầu tăng xấp xỉ $\\boxed{0{,}25\\%}$; chọn $\\boxed{D}$.',
          interpretation:
            'Cầu ít co giãn tại điểm nên mức tăng lượng nhỏ hơn nhiều mức giảm giá.',
          check:
            'Giá giảm và đường cầu dốc xuống phải làm lượng tăng; kết quả dương là hợp lý.',
          trap:
            'Công thức ngược chứa $1/P\'(Q)$, không phải chỉ $P\'(Q)$.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 16 · Bổ trợ Chương 5 · Đạo hàm ẩn',
          title: 'Tính $y\'(0)$ từ phương trình không giải được tường minh',
          skill: 'Đạo hàm ẩn',
          difficulty: 'Nâng cao',
          given: '$g(x,y)=e^{xy}+(x-1)y^3+xy^2-2y+2=0$.',
          ask: '$y\'(0)$.',
          prompt:
            'Đây là câu trong hình bạn gửi. Nó không phải mô hình kinh tế trực tiếp nhưng là kỹ thuật Chương 5 dùng lại trong các bài chi phí và tiết kiệm ẩn.',
          method:
            'Tìm $y(0)$, tính hai đạo hàm riêng hình thức $g_x,g_y$, rồi dùng $y\'=-g_x/g_y$.',
          steps: [
            {
              label: 'Tìm tung độ tại x = 0',
              content: '$3-y^3-2y=0\\Longrightarrow y(0)=1$.',
            },
            {
              label: 'Tính hai thành phần',
              content: '$g_x=ye^{xy}+y^3+y^2$ và $g_y=xe^{xy}+3(x-1)y^2+2xy-2$.',
            },
            {
              label: 'Đánh giá tại điểm',
              content: '$g_x(0,1)=3$ và $g_y(0,1)=-5\\ne0$.',
            },
            {
              label: 'Dùng công thức phân số',
              content: "$y'(0)=-\\dfrac{g_x(0,1)}{g_y(0,1)}=-\\dfrac3{-5}=\\dfrac35$.",
            },
          ],
          result: '$\\boxed{y\'(0)=\\dfrac35}$',
          interpretation:
            'Điều kiện $g_y\\ne0$ bảo đảm có thể xem $y$ như một hàm khả vi của $x$ quanh điểm đang xét.',
          check:
            'Mẫu số bằng $-5$, nên công thức đạo hàm ẩn không bị suy biến.',
          trap:
            'Phải tìm $y(0)$ trước. Thế $x=0$ trực tiếp vào công thức còn chứa $y$ chưa cho ra một con số.',
        },
      ],
    },
    {
      heading: '9. Checklist làm bài và phạm vi nguồn',
      eyebrow: 'Tổng kết',
      summary:
        'Một bài làm chắc điểm bắt đầu từ biến số và ý nghĩa kinh tế, không bắt đầu từ việc bấm đạo hàm.',
      blocks: [
        {
          type: 'steps',
          title: 'Checklist 60 giây trước khi chốt đáp án',
          items: [
            'Khoanh biến đang được điều chỉnh và đại lượng kết quả.',
            'Ghi rõ đạo hàm theo biến nào: $dTR/dp$ hay $dTR/dQ$?',
            'Nếu có biến trung gian, vẽ chuỗi phụ thuộc rồi mới dùng quy tắc chuỗi.',
            'Nếu là phương trình ẩn, tìm và lọc nhánh kinh tế trước khi đạo hàm.',
            'Nếu đề cho phần trăm, chuyển sang co giãn; nếu cho đơn vị tuyệt đối, dùng biên tế/vi phân.',
            'Với tối ưu, kiểm tra điều kiện đủ, miền xác định và điểm biên.',
            'Kiểm tra dấu, đơn vị đo và trực giác kinh tế trước khi chọn đáp án.',
          ],
        },
        {
          type: 'comparison',
          columns: ['Nếu đề hỏi…', 'Bắt đầu từ…'],
          rows: [
            ['“Chi phí tăng thêm khi Q tăng”', '$MC=C\'(Q)$'],
            ['“Doanh thu tăng thêm khi Q tăng”', '$MR=R\'(Q)$'],
            ['“Q đổi bao nhiêu % khi p đổi 1%”', '$E_p=Q\'(p)p/Q$'],
            ['“Tăng giá thì TR tăng hay giảm”', '$dTR/dp=Q(1+E_p)$'],
            ['“MR mang dấu gì từ co giãn”', '$MR=p(1+1/E_p)$'],
            ['“Lợi nhuận lớn nhất”', '$MR=MC$ rồi kiểm tra điều kiện đủ'],
            ['“AC nhỏ nhất”', "$AC'=(MC-AC)/q$"],
          ],
        },
        {
          type: 'steps',
          title: 'Chín chú ý quan trọng thường bị bỏ sót',
          items: [
            'Biên tế là một tốc độ thay đổi tại chỗ. Viết $\\Delta C\\approx MC(Q_0)\\Delta Q$ là xấp xỉ quanh $Q_0$, không phải đẳng thức chính xác cho mọi mức tăng sản lượng.',
            'Độ co giãn chỉ có nghĩa khi các đại lượng dùng để chuẩn hóa khác 0. Công thức ngược $dQ/dP=1/P\'(Q)$ còn đòi hỏi $P\'(Q)\\ne0$ tại điểm xét.',
            'Với $F(x,y)=0$, công thức $dy/dx=-F_x/F_y$ chỉ dùng được khi $F_y\\ne0$ và đang xét đúng nhánh hàm kinh tế.',
            'Điều kiện $f\'(x)=0$ chỉ là điều kiện cần cho cực trị nội miền của hàm khả vi. Luôn so sánh thêm điểm biên, điểm không khả vi và các ràng buộc như $Q\\ge0$.',
            'Nếu sản lượng, lao động hoặc số máy chỉ nhận giá trị nguyên, nghiệm giải tích là mốc định hướng; phải kiểm tra các giá trị nguyên khả thi lân cận và điểm biên.',
            'Khi $f\'\'(x_0)=0$, phép thử đạo hàm bậc hai chưa kết luận được. Cần xét dấu $f\'$ quanh $x_0$ hoặc dùng tiêu chuẩn khác.',
            '$MR=MC$ chỉ xác định một ứng viên tối ưu nội miền. Phải kiểm tra $\\pi\'\'<0$, dấu đổi của $MR-MC$, miền xác định và khả năng nghiệm nằm ngoài miền kinh tế.',
            'Chi phí cố định làm thay đổi $AC$ và mức lợi nhuận nhưng biến mất khỏi $MC=C\'(Q)$. Vì vậy tăng chi phí cố định không tự động dịch chuyển đường MC.',
            '“Đại lượng biên giảm” nghĩa là đạo hàm của đại lượng biên âm, chẳng hạn $MR\'<0$; tổng doanh thu vẫn có thể tăng nếu bản thân $MR>0$.',
          ],
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'Nguyên tắc kiểm tra cuối: điều kiện – đơn vị – miền',
          content:
            'Trước khi khoanh đáp án, hãy hỏi ba câu: công thức vừa dùng cần điều kiện gì; kết quả đang mang đơn vị tuyệt đối hay phần trăm; và nghiệm có thuộc miền kinh tế hay không. Ba phép kiểm tra này bắt được phần lớn bẫy về đạo hàm ngược, hàm ẩn, co giãn và cực trị.',
        },
        {
          type: 'comparison',
          columns: ['Cụm nội dung Chương 5', 'Trạng thái trong bài', 'Nằm ở đâu'],
          rows: [
            ['Biên tế: MC, MR, $M\\pi$, MPL, MU', 'Đã triển khai + ví dụ', 'Mục 1–3'],
            ['MPC, MPS và đồng nhất thức biên', 'Đã triển khai + ví dụ', 'Mục 6'],
            ['Độ co giãn và doanh thu theo giá', 'Đã triển khai sâu', 'Mục 5, hồ sơ 03, 05, 07, 09, 14, 15'],
            ['Quy tắc chuỗi, hàm ẩn, MRP', 'Đã bổ sung công thức phân số + ví dụ', 'Mục 2, 7; hồ sơ 01, 02, 06, 16'],
            ['Đạo hàm cấp hai, chiều biến thiên', 'Đã gắn với ý nghĩa kinh tế', 'Mục 3–4; hồ sơ 08, 11, 12'],
            ['Cực trị một biến và điểm biên', 'Đã triển khai quy trình đầy đủ', 'Mục 3'],
            ['Vi phân và xấp xỉ tuyến tính một biến', 'Đã triển khai + minh họa', 'Mục 1, 7'],
            ['L’Hospital, Taylor, lượng giác thuần túy', 'Chủ động không đưa vào', 'Không phải vấn đề vi mô/vĩ mô'],
            ['Đạo hàm riêng, vi phân hai biến, Cobb–Douglas nhiều biến', 'Giữ ngoài phạm vi', 'Thuộc chương hàm nhiều biến'],
          ],
        },
        {
          type: 'source-note',
          title: 'Kết quả kiểm kê phạm vi',
          content:
            'Sau khi đọc lại đủ 65 trang, bài hiện đã phủ toàn bộ phần ứng dụng vi mô/vĩ mô của Chương 5: biên tế, co giãn, doanh thu, MRP, chiều biến thiên, AC–MC, cực trị một biến, MPC–MPS, hàm ẩn và vi phân xấp xỉ. Những mục còn lại của PDF là kỹ thuật giải tích thuần túy hoặc nội dung nhiều biến nên không được thêm chỉ để làm bài dài hơn.',
        },
        {
          type: 'source-list',
          title: 'Nguồn đã đối chiếu',
          items: [
            {
              title: 'Slide PNTA · Chương 5 — Đạo hàm và vi phân (cập nhật)',
              href: '/docs/SLIDE_PNTA/Chương 5 - Đạo hàm và vi phân (cập nhật).pdf',
              note: 'Nguồn khóa phạm vi và công thức lý thuyết.',
            },
            {
              title: 'Tuyển tập đề và lời giải K46–K50',
              href: '/docs/DE_THI_CHINH/FINAL 2807 (1).pdf',
              note: 'Đối chiếu các câu K46, K47, K49 và K50.',
            },
            {
              title: 'Mã nguồn LaTeX đề/lời giải K51',
              note:
                'Đối chiếu các mã 118, 204, 354, 442, bản English và bản đợt 2 trong thư mục DE_K51_UPDATE/sections.',
            },
          ],
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'Kết luận',
          content:
            'Giải tích kinh tế trở nên nhất quán khi luôn giữ ba thứ đi cùng nhau: đúng biến đạo hàm, đúng đơn vị và đúng câu hỏi kinh tế. Công thức chỉ là phần giữa của lập luận — trước nó là mô hình hóa, sau nó là diễn giải và kiểm tra.',
        },
      ],
    },
  ],
};
