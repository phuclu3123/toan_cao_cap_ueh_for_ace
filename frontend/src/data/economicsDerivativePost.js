const math = String.raw;

export const economicsDerivativePost = {
  slug: 'ung-dung-vi-mo-vi-mo-trong-toan-ung-dung-k51',
  title: 'Đạo hàm trong kinh tế vi mô và vĩ mô: từ đại lượng biên đến cách đọc đề K46–K51',
  category: 'Chuyên khảo · Chương 5',
  date: '23/07/2026',
  updatedAt: 'Đã đối chiếu nguồn ngày 23/07/2026',
  author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
  readingTime: '24 phút đọc',
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
  image: '/images/math_banner.svg',
  excerpt:
    'Một chuyên khảo có kiểm chứng nguồn về cách đạo hàm biến các quan hệ kinh tế thành quyết định: chi phí, doanh thu, lợi nhuận, năng suất, tiêu dùng, tiết kiệm và độ co giãn. Phần cuối hệ thống lại đúng các dạng đề trong tài liệu K46–K51 và chỉ rõ những bẫy ký hiệu dễ làm sai.',
  scope: {
    label: 'Phạm vi đã khóa',
    title: 'Chỉ các ứng dụng kinh tế thuộc Chương 5',
    description:
      'Bài viết chủ động loại các nội dung của Chương 6 và 7 như cực trị hàm nhiều biến, Hessian, Lagrange, MRTS nhiều đầu vào và phương trình vi phân động.',
  },
  highlights: [
    { value: '06', label: 'cụm lý thuyết cốt lõi' },
    { value: '08', label: 'hồ sơ đề thi đã đối chiếu' },
    { value: 'K46–K51', label: 'dải nguồn khảo sát' },
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
          content: math`$$\text{Tác động cục bộ}=\frac{\mathrm d(\text{kết quả})}{\mathrm d(\text{biến quyết định})}$$`,
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
          type: 'formula',
          label: 'Chuỗi tạo doanh thu từ lao động',
          content: math`$$L\longrightarrow Q(L)\longrightarrow R(Q(L)),\qquad MRP=\frac{\mathrm dR}{\mathrm dL}=\frac{\mathrm dR}{\mathrm dQ}\frac{\mathrm dQ}{\mathrm dL}=MR\cdot MPL$$`,
          note:
            'Đây là quy tắc chuỗi được đọc bằng ngôn ngữ kinh tế: lao động tác động đến sản lượng, rồi sản lượng tác động đến doanh thu.',
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
            ['Đại lượng đi qua biến trung gian', 'Quy tắc chuỗi', '$dC/dp=(dC/dQ)(dQ/dp)$'],
            ['Quan hệ viết dạng $F(x,y)=0$', 'Đạo hàm ẩn', '$y\'=-F_x/F_y$'],
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
        'Thay vì chép dàn trải, phần này nhóm câu hỏi theo kỹ năng thật sự được kiểm tra và giữ nguyên logic của nguồn đề/lời giải.',
      blocks: [
        {
          type: 'source-note',
          title: 'Cách ghi nguồn',
          content:
            'Tệp PDF tổng hợp có đề K46, K47, K49 và K50; không thấy một đề K48 độc lập để gán nhãn. K51 được đối chiếu trực tiếp từ các tệp LaTeX mã 118, 204, 354, 442, bản English và bản đợt 2 sinh viên chép đề.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 01 · K46 · Câu 6',
          title: 'Chuỗi phụ thuộc giá → sản lượng → chi phí',
          prompt:
            'Biết $PQ=500$, $MC=dC/dQ=10$ tại $Q=10$. Tính $dC/dP$.',
          steps: [
            '$Q=500/P$; tại $Q=10$ suy ra $P=50$.',
            '$dQ/dP=-500/P^2=-1/5$.',
            '$dC/dP=(dC/dQ)(dQ/dP)=10(-1/5)=-2$.',
          ],
          result: '$\\boxed{-2}$',
          trap:
            'Đề không hỏi MC. Nó hỏi tốc độ chi phí thay đổi theo giá nên phải nối thêm đạo hàm $dQ/dP$.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 02 · K47 · Câu 13',
          title: 'Đảo chiều chuỗi để truy ngược chi phí biên',
          prompt:
            'Biết $PQ=250$, $dC/dP=-0{,}5$ tại $Q=25$. Tính $MC=dC/dQ$.',
          steps: [
            '$P=250/Q$ nên $dP/dQ=-250/Q^2=-2/5$ tại $Q=25$.',
            '$dC/dQ=(dC/dP)(dP/dQ)=(-0{,}5)(-2/5)=0{,}2$.',
          ],
          result: '$\\boxed{MC=0{,}2}$',
          trap:
            'Giữ đúng chiều đạo hàm. Không lấy nghịch đảo từng đạo hàm một cách máy móc khi chưa vẽ chuỗi biến.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 03 · K49 mã 2 · Câu 7',
          title: 'Từ co giãn chi phí đến MC chỉ trong một dòng',
          prompt:
            'Tại $q=10$, độ co giãn chi phí bằng 1 và $AC=C/q=40$. Tính MC.',
          steps: [
            '$\\varepsilon_C=C\'(q)q/C=MC/AC$.',
            '$\\varepsilon_C=1$ nên $MC=AC=40$.',
          ],
          result: '$\\boxed{MC=40}$',
          trap:
            'Theo đúng dữ kiện, kết quả là 40. Bản PDF nguồn lại đánh dấu “đáp án A” trong khi lựa chọn A hiển thị 80; đây là một bất nhất của tài liệu, không nên sửa phép tính để ép khớp đáp án.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 04 · K50 đợt 1 · Câu 1',
          title: 'Đạo hàm trực tiếp hàm tổng chi phí',
          prompt:
            'Cho $C(q)=\\dfrac{5q^2}{\\sqrt{q^2+3}}+5000$. Tính MC tại $q=10$.',
          steps: [
            "$MC=C'(q)=\\dfrac{5q(q^2+6)}{(q^2+3)^{3/2}}$.",
            'Thế $q=10$ được $MC(10)\\approx5{,}07$.',
          ],
          result: '$\\boxed{5{,}07}$',
          trap:
            'Hằng số 5000 là chi phí cố định nên biến mất khi đạo hàm; nhưng nó vẫn ảnh hưởng AC.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 05 · K50 đợt 2 · Câu 1–2',
          title: 'Một đề kiểm cả co giãn lẫn chi phí ẩn',
          prompt:
            'Câu 1: $Q=\\sqrt{500-4P}$, tìm doanh thu khi $|E_P|=2$. Câu 2: $C^2-2CQ+Q^2-2Q-4800=0$, tìm MC tại $Q=50$.',
          steps: [
            '$E_P=-2P/(500-4P)$. Điều kiện miền chọn $P=100$, suy ra $Q=10$ và $R=PQ=1000$.',
            'Ở câu chi phí, thay $Q=50$ và chọn nhánh kinh tế $C=120$ thay vì $C=-20$.',
            'Đạo hàm ẩn cho $C\'=(C+1-Q)/(C-Q)$, nên $C\'(50)=71/70$.',
          ],
          result: '$\\boxed{R=1000},\\qquad \\boxed{MC=71/70}$',
          trap:
            'Phương trình ẩn có thể sinh nhiều nhánh toán học; chi phí âm bị loại bởi ý nghĩa kinh tế.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 06 · K51 mã 118 & 204',
          title: 'Hàm hợp của cầu và co giãn tiết kiệm',
          prompt:
            'Mã 118 cho $q=f(2p)$, $f\'(10)=-f(10)/10$ tại $p=5$. Mã 204 cho quan hệ tiết kiệm ẩn và điều kiện $S\\le30\\%I$.',
          steps: [
            'Mã 118: $q\'(5)=2f\'(10)=-f(10)/5$, nên $E_p=q\'(5)5/q(5)=-1$. Giá tăng 4% làm cầu giảm xấp xỉ 4%.',
            'Cũng ở mã 118: $P=1000/(Q+10)$ cho $R=1000Q/(Q+10)$, nên $MR(40)=10000/50^2=4$.',
            'Mã 204: tại $I=16$, phương trình cho $S=4$ hoặc 12; điều kiện tỷ trọng chỉ nhận $S=4$.',
            'Đạo hàm ẩn cho $S\'(16)=3/8$; do đó $E_I^S=(3/8)(16/4)=3/2$.',
          ],
          result: '$\\boxed{\\%\\Delta Q\\approx-4\\%},\\quad \\boxed{MR(40)=4},\\quad \\boxed{E_I^S=3/2}$',
          trap:
            'Ở bài tiết kiệm, bỏ qua điều kiện 30% sẽ chọn nhầm nhánh và kéo sai toàn bộ đạo hàm sau đó.',
        },
        {
          type: 'exam',
          meta: 'Hồ sơ 07 · K51 mã 354, 442 & English',
          title: 'Ba lớp câu hỏi: tối ưu, giới hạn biên và tối ưu một hàm biên',
          prompt:
            'Mã 354 hỏi MC của doanh nghiệp độc quyền; mã 442 hỏi giới hạn MPL; bản English hỏi mức sản lượng làm lợi nhuận biên nhỏ nhất.',
          steps: [
            'Mã 354: $Q=1500-P/2\\Rightarrow P=3000-2Q$, nên $MR=3000-4Q$. Tại tối đa lợi nhuận $Q=400$, $MC=MR=1400$.',
            'Mã 442: $Q(L)=L/2+\\tfrac12\\ln(2L+1)$ nên $MPL=1/2+1/(2L+1)$, giảm dần và tiến tới $1/2$.',
            'English: $M\\pi=\\pi\'=3Q^2-9Q+6$. Tối thiểu hóa chính hàm biên: $(M\\pi)\'=6Q-9=0$, được $Q=3/2$; độ cong bằng 6 dương.',
          ],
          result: '$\\boxed{MC=1400},\\quad \\boxed{MPL\\to1/2},\\quad \\boxed{Q=3/2}$',
          trap:
            '“Tìm lợi nhuận biên nhỏ nhất” là tối ưu hàm $\\pi\'$, nên phải lấy thêm một đạo hàm; không giải $\\pi\'=0$.',
        },
        {
          type: 'exam',
          featured: true,
          meta: 'Hồ sơ 08 · K51 đợt 2 · Câu 4 & 6',
          title: 'Câu bẫy quan trọng nhất của section 8',
          prompt:
            'Câu 4 cho $C(Q)=500\\ln(Q^2+1)+200$. Câu 6 cho $E_p=-0{,}5$ và hỏi phát biểu đúng về doanh thu khi tăng giá.',
          steps: [
            'Câu 4: $MC=1000Q/(Q^2+1)$ nên $MC(3)=300$.',
            'Câu 6: $dTR/dp=Q(1+E_p)=0{,}5Q>0$, vì vậy tăng giá làm TR tăng.',
            'Nhưng $MR=p(1+1/E_p)=p(1-2)=-p<0$.',
            'Phương án B sai vì ghi MR dương; phương án D sai vì ghi tăng giá làm TR giảm; A cũng sai. Chọn C: các phát biểu kia đều sai.',
          ],
          result: '$\\boxed{MC(3)=300},\\qquad \\boxed{\\text{Câu 6: đáp án C}}$',
          trap:
            'Không đồng nhất “doanh thu tăng theo giá” với “doanh thu biên dương”. Chúng là hai đạo hàm theo hai biến khác nhau.',
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
