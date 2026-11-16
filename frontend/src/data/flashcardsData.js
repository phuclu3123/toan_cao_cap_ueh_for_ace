/**
 * TOÁN CAO CẤP & TOÁN ỨNG DỤNG UEH - HỆ THỐNG BÀI HỌC & FLASHCARD CHUẨN MỰC
 * Biên soạn độc quyền cho sinh viên UEH cứu rớt môn và bứt phá điểm A/A+.
 * Dữ liệu bám sát tài liệu 10 buổi học chính thức và ngân hàng đề thi K46 - K51.
 * (Đã lược bỏ hoàn toàn Phương trình vi phân cấp 2 theo đúng quy chuẩn UEH hiện hành).
 */

export const flashcardTopics = [
  {
    "id": "chuyen-de-1",
    "order": 1,
    "title": "Chuyên đề 1: Ma Trận, Định Thức & Phép Toán Cơ Bản",
    "shortTitle": "Ma trận & Định thức",
    "category": "Đại số tuyến tính",
    "badge": "Nền tảng sống còn",
    "examStats": "Chiếm 2.0 - 2.5 điểm trong mọi đề thi K46 - K51",
    "quote": "Nắm vững quy tắc kích thước ma trận và công thức |kA| = k^n|A| để không bị mất điểm oan ngay 2 câu đầu!",
    "lesson": {
      "summary": "Ma trận là bảng số hình chữ nhật m dòng n cột. Phép nhân ma trận chỉ thực hiện được khi số cột ma trận trước bằng số dòng ma trận sau (và AB ≠ BA nói chung). Chỉ ma trận vuông mới có định thức. Tính chất định thức thường xuyên bị gài bẫy ở hệ số k: |kA| = k^n |A|.",
      "objectives": [
        "Xác định chính xác kích thước ma trận và điều kiện thực hiện phép nhân ma trận.",
        "Thành thạo tính định thức cấp 2, cấp 3 (Sarrus) và cấp n bằng khai triển Laplace.",
        "Nắm vững các tính chất định thức: |kA| = k^n |A|, |AB| = |A||B|, |A^T| = |A|.",
        "Biết cách biến đổi sơ cấp dòng để đưa về ma trận tam giác tính định thức nhanh."
      ],
      "sections": [
        {
          "title": "1. Khái niệm & Kích thước Ma trận",
          "content": "Ma trận $A = (a_{ij})_{m \\times n}$ gồm $m$ dòng và $n$ cột. Phần tử $a_{ij}$ nằm ở dòng thứ $i$, cột thứ $j$.\n\n- **Ma trận vuông cấp $n$**: Số dòng bằng số cột ($m = n$). Chỉ ma trận vuông mới có đường chéo chính và có định thức $\\det A$.\n- **Ma trận đơn vị $I_n$**: Ma trận vuông cấp $n$ có các phần tử trên đường chéo chính bằng $1$, các phần tử còn lại bằng $0$. Với mọi ma trận $A$ kích thước phù hợp: $A \\cdot I = I \\cdot A = A$.\n- **Ma trận chuyển vị $A^T$**: Đổi dòng thành cột ($a^T_{ij} = a_{ji}$). Tính chất quan trọng: $(A^T)^T = A$, $(A + B)^T = A^T + B^T$, và đặc biệt $(AB)^T = B^T A^T$ (đảo thứ tự tích!)."
        },
        {
          "title": "2. Phép nhân Ma trận & Cảnh báo không giao hoán",
          "content": "Điều kiện nhân: $A_{m \\times k} \\cdot B_{k \\times p} = C_{m \\times p}$. Số cột của $A$ phải bằng số dòng của $B$.\n\nPhần tử $c_{ij}$ được tính bằng tích vô hướng của dòng $i$ ma trận $A$ với cột $j$ ma trận $B$:\n$$c_{ij} = \\sum_{r=1}^{k} a_{ir} b_{rj} = a_{i1}b_{1j} + a_{i2}b_{2j} + \\dots + a_{ik}b_{kj}$$\n\n**Cảnh báo sống còn**:\n- Phép nhân ma trận **KHÔNG có tính chất giao hoán**: $AB \\ne BA$ nói chung!\n- $AB = 0$ **KHÔNG** suy ra được $A = 0$ hoặc $B = 0$!\n- Hằng đẳng thức: $(A + B)^2 = A^2 + AB + BA + B^2 \\ne A^2 + 2AB + B^2$ (chỉ đúng khi $AB = BA$)."
        },
        {
          "title": "3. Định thức (Determinant) & Khai triển Laplace",
          "content": "- Định thức cấp 2: $\\det \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$.\n- Định thức cấp 3 (Quy tắc Sarrus): Tổng 3 tích đường chéo chính trừ tổng 3 tích đường chéo phụ.\n- Khai triển Laplace theo dòng $i$ (chọn dòng có nhiều số 0 nhất):\n$$\\det A = \\sum_{j=1}^n a_{ij} C_{ij} = \\sum_{j=1}^n a_{ij} (-1)^{i+j} M_{ij}$$\ntrong đó $M_{ij}$ là định thức con cấp $n-1$ bỏ đi dòng $i$ và cột $j$, còn $C_{ij} = (-1)^{i+j} M_{ij}$ là phần bù đại số.\n- **Định thức ma trận tam giác**: Bằng tích các phần tử trên đường chéo chính:\n$$\\det A = a_{11} \\cdot a_{22} \\dots a_{nn}$$"
        },
        {
          "title": "4. Các định lý then chốt của Định thức (Trọng tâm đề thi UEH)",
          "content": "Cho $A, B$ là ma trận vuông cấp $n$ và số thực $k$:\n1. $\\det(kA) = k^n \\det A$ (Bẫy kinh điển: nhân số $k$ vào ma trận vuông cấp $n$ thì định thức nhân $k^n$!).\n2. $\\det(AB) = \\det A \\cdot \\det B$.\n3. $\\det(A^T) = \\det A$.\n4. $\\det(A^m) = (\\det A)^m$ với mọi số nguyên dương $m$.\n5. $\\det(A^{-1}) = \\frac{1}{\\det A}$ (nếu $A$ khả nghịch).\n6. **Ảnh hưởng của phép biến đổi sơ cấp dòng/cột**:\n   - Đổi chỗ 2 dòng (hoặc 2 cột): Định thức **đổi dấu**.\n   - Nhân một dòng (hoặc 1 cột) với số $c \\ne 0$: Định thức **nhân với $c$**.\n   - Cộng vào một dòng bội số của dòng khác: Định thức **KHÔNG đổi** (tuyệt chiêu khử số 0 tính định thức!)."
        }
      ],
      "traps": [
        {
          "title": "Bẫy 1: Quên số mũ n trong tính chất |kA|",
          "wrong": "Cho ma trận vuông A cấp 4 có det(A) = 2. Tính det(3A) = 3 * 2 = 6.",
          "right": "Áp dụng đúng công thức: det(3A) = 3^4 * det(A) = 81 * 2 = 162.",
          "explanation": "Nhân số k vào ma trận n x n tương đương nhân k vào TẤT CẢ n dòng, mỗi dòng đưa ra ngoài một thừa số k, do đó xuất hiện k^n."
        },
        {
          "title": "Bẫy 2: Ngộ nhận |A + B| = |A| + |B|",
          "wrong": "det(A + B) = det(A) + det(B).",
          "right": "det(A + B) KHÔNG BẰNG det(A) + det(B) trong trường hợp tổng quát!",
          "explanation": "Phép cộng ma trận không bảo toàn định thức. Chỉ có det(AB) = det(A) * det(B)."
        },
        {
          "title": "Bẫy 3: Đảo thứ tự chuyển vị của tích",
          "wrong": "(AB)^T = A^T B^T.",
          "right": "(AB)^T = B^T A^T (đảo ngược vị trí của B và A).",
          "explanation": "Nếu giữ nguyên thứ tự A^T B^T thì kích thước ma trận có thể không khớp để thực hiện phép nhân."
        }
      ],
      "workedExample": {
        "question": "Cho $A, B, C$ là các ma trận vuông cấp 3 thỏa mãn $\\det A = -2$, $\\det B = 3$, $\\det C = 4$. Đặt $M = -2 A^2 \\cdot B^T \\cdot C^{-1}$. Hãy tính $\\det M$.",
        "steps": [
          "Bước 1: Xác định cấp ma trận là $n = 3$. Hệ số vô hướng là $k = -2$.",
          "Bước 2: Tách hệ số theo công thức $\\det(k X) = k^n \\det X$: $\\det M = (-2)^3 \\cdot \\det(A^2 \\cdot B^T \\cdot C^{-1})$.",
          "Bước 3: Tách định thức của tích: $\\det(A^2 \\cdot B^T \\cdot C^{-1}) = \\det(A^2) \\cdot \\det(B^T) \\cdot \\det(C^{-1})$.",
          "Bước 4: Thay các tính chất: $\\det(A^2) = (\\det A)^2 = (-2)^2 = 4$, $\\det(B^T) = \\det B = 3$, $\\det(C^{-1}) = \\frac{1}{\\det C} = \\frac{1}{4}$.",
          "Bước 5: Nhân tất cả: $\\det M = (-8) \\cdot \\left( 4 \\cdot 3 \\cdot \\frac{1}{4} \\right) = (-8) \\cdot 3 = -24$."
        ],
        "casioTip": "Với định thức chứa số cụ thể, có thể nhập trực tiếp vào Matrix mode của Casio fx-580VNX (Menu 4) để kiểm tra kết quả."
      }
    },
    "flashcards": [
      {
        "id": "fc-1-1",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức tính định thức khi nhân một số thực k vào ma trận vuông A cấp n là gì?",
        "back": "$$\\det(kA) = k^n \\det A$$\n\nĐiều kiện: Ma trận $A$ vuông cấp $n$. Hãy luôn nhớ số mũ $n$ tương ứng với cấp của ma trận!",
        "keyTakeaway": "|kA| = k^n |A|, không bao giờ được quên mũ n!",
        "trapWarning": "Bẫy đề UEH cực hay cho k = -1, khi đó |-A| = (-1)^n |A| (âm nếu n lẻ, dương nếu n chẵn).",
        "source": "Buổi 1 & Đề K50"
      },
      {
        "id": "fc-1-2",
        "type": "trap",
        "category": "Bẫy đề thi",
        "front": "Khẳng định: \"det(A + B) = det(A) + det(B)\" là ĐÚNG hay SAI?",
        "back": "**SAI HOÀN TOÀN!**\n\nTrong đại số tuyến tính:\n$$\\det(A + B) \\ne \\det A + \\det B$$\n\nChỉ có tính chất nhân: $\\det(AB) = \\det A \\cdot \\det B$.",
        "keyTakeaway": "Định thức của tổng KHÔNG bằng tổng hai định thức!",
        "trapWarning": "Đề thi hay đưa khẳng định này vào câu hỏi 'Chọn phát biểu SAI'.",
        "source": "Đề K51 Mã 204"
      },
      {
        "id": "fc-1-3",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Quy tắc chuyển vị của một tích ma trận: $(AB)^T = ?$",
        "back": "$$(AB)^T = B^T A^T$$\n\nTổng quát với nhiều ma trận:\n$$(A_1 A_2 \\dots A_m)^T = A_m^T \\dots A_2^T A_1^T$$\n\nThứ tự các thừa số bị **đảo ngược hoàn toàn**!",
        "keyTakeaway": "Chuyển vị của tích phải lật ngược thứ tự: (AB)^T = B^T A^T.",
        "source": "Buổi 1"
      },
      {
        "id": "fc-1-4",
        "type": "concept",
        "category": "Định lý",
        "front": "Định thức của ma trận tam giác (trên hoặc dưới) và ma trận đường chéo được tính như thế nào?",
        "back": "Bằng **tích của tất cả các phần tử trên đường chéo chính**:\n$$\\det A = a_{11} \\cdot a_{22} \\dots a_{nn}$$\n\nĐặc biệt: $\\det I_n = 1 \\cdot 1 \\dots 1 = 1$.",
        "keyTakeaway": "Ma trận tam giác => det = tích đường chéo chính.",
        "source": "Buổi 1"
      },
      {
        "id": "fc-1-5",
        "type": "quick-calc",
        "category": "Tính nhanh",
        "front": "Cho ma trận vuông A cấp 3 có det(A) = 2. Hãy tính det(-2A).",
        "back": "Áp dụng $\\det(kA) = k^n \\det A$ với $k = -2, n = 3$:\n$$\\det(-2A) = (-2)^3 \\cdot \\det A = (-8) \\cdot 2 = -16$$\n\n(Không phải $-4$!).",
        "keyTakeaway": "Cấp 3 => (-2)^3 = -8 => -8 * 2 = -16.",
        "source": "Buổi 6 Sửa bài"
      },
      {
        "id": "fc-1-6",
        "type": "concept",
        "category": "Kỹ thuật giải",
        "front": "Khi thực hiện phép biến đổi sơ cấp: Lấy dòng 2 cộng thêm 3 lần dòng 1 ($d_2 \\to d_2 + 3d_1$), định thức thay đổi như thế nào?",
        "back": "Định thức **HOÀN TOÀN KHÔNG ĐỔI!**\n\nPhép cộng vào một dòng bội của dòng khác giữ nguyên định thức. Đây là phép biến đổi cốt lõi để tạo nhiều số 0 trước khi khai triển Laplace.",
        "keyTakeaway": "Cộng bội dòng khác => det giữ nguyên.",
        "source": "Buổi 1 & TUD_v2"
      },
      {
        "id": "fc-1-7",
        "type": "concept",
        "category": "Kỹ thuật giải",
        "front": "Khi đổi chỗ hai dòng của một ma trận vuông, định thức thay đổi như thế nào?",
        "back": "Định thức **ĐỔI DẤU**:\n$$\\det(A') = -\\det A$$\n(với $A'$ là ma trận thu được sau khi hoán vị 2 dòng).",
        "keyTakeaway": "Đổi chỗ 2 dòng => đổi dấu det.",
        "source": "Buổi 1"
      },
      {
        "id": "fc-1-8",
        "type": "trap",
        "category": "Bẫy đề thi",
        "front": "Nếu AB = 0 thì có suy ra được A = 0 hoặc B = 0 không?",
        "back": "**KHÔNG THỂ SUY RA ĐƯỢC!**\n\nTrong ma trận, tồn tại hai ma trận $A \\ne 0$ và $B \\ne 0$ nhưng tích $AB = 0$.\n\nVí dụ: $A = \\begin{pmatrix} 0 & 1 \\\\ 0 & 0 \\end{pmatrix}$, $B = \\begin{pmatrix} 1 & 0 \\\\ 0 & 0 \\end{pmatrix} \\implies AB = \\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}$.",
        "keyTakeaway": "AB = 0 KHÔNG kéo theo A = 0 hoặc B = 0!",
        "source": "Buổi 1 & TUD_v2"
      }
    ],
    "quiz": [
      {
        "id": "q-1-1",
        "question": "Cho ma trận vuông $A$ cấp 4 có $\\det(A) = 3$. Giá trị của $\\det(2A)$ bằng bao nhiêu?",
        "options": [
          "$\\det(2A) = 6$",
          "$\\det(2A) = 24$",
          "$\\det(2A) = 48$",
          "$\\det(2A) = 16$"
        ],
        "correctIndex": 2,
        "explanation": "Theo tính chất định thức: với ma trận vuông $A$ cấp $n$, ta có $\\det(kA) = k^n \\det(A)$. Ở đây $k = 2$ và cấp $n = 4$, do đó $\\det(2A) = 2^4 \\cdot \\det(A) = 16 \\cdot 3 = 48$.",
        "distractorAnalysis": "Phương án A là bẫy nhân thẳng 2 * 3 = 6 (quên mũ n). Phương án B là bẫy lấy 2^3 * 3 = 24 (nhầm cấp 3). Phương án D chỉ mới tính 2^4 = 16 mà quên nhân với det(A).",
        "difficulty": "Cơ bản",
        "source": "Đề thi K50 Đợt 1"
      },
      {
        "id": "q-1-2",
        "question": "Cho $A, B$ là hai ma trận vuông cùng cấp $n$. Khẳng định nào sau đây là SAI?",
        "options": [
          "$\\det(A^T) = \\det(A)$",
          "$\\det(AB) = \\det(A) \\cdot \\det(B)$",
          "$(AB)^T = B^T A^T$",
          "$\\det(A + B) = \\det(A) + \\det(B)$"
        ],
        "correctIndex": 3,
        "explanation": "Khẳng định $\\det(A + B) = \\det(A) + \\det(B)$ là hoàn toàn sai. Định thức không có tính chất phân phối qua phép cộng ma trận.",
        "distractorAnalysis": "Các phương án A, B, C đều là các định lý chuẩn xác của đại số tuyến tính.",
        "difficulty": "Cơ bản",
        "source": "Đề thi K51 Mã 204 Câu 1"
      },
      {
        "id": "q-1-3",
        "question": "Cho ma trận $A = \\begin{pmatrix} 1 & 2 & 0 \\\\ 0 & 3 & 4 \\\\ 0 & 0 & -2 \\end{pmatrix}$. Định thức $\\det(A)$ bằng:",
        "options": [
          "$-6$",
          "$6$",
          "$0$",
          "$-12$"
        ],
        "correctIndex": 0,
        "explanation": "$A$ là ma trận tam giác trên vì tất cả các phần tử phía dưới đường chéo chính đều bằng 0. Định thức của ma trận tam giác bằng tích các phần tử trên đường chéo chính: $\\det(A) = 1 \\cdot 3 \\cdot (-2) = -6$.",
        "distractorAnalysis": "Bẫy dấu trừ dẫn đến đáp án 6. Bẫy nhân nhầm phần tử dẫn đến -12.",
        "difficulty": "Cơ bản",
        "source": "Tài liệu TUD_v2 Trang 5"
      }
    ]
  },
  {
    "id": "chuyen-de-2",
    "order": 2,
    "title": "Chuyên đề 2: Ma Trận Nghịch Đảo, Ma Trận Phụ Hợp & Hạng",
    "shortTitle": "Nghịch đảo & Hạng",
    "category": "Đại số tuyến tính",
    "badge": "Điểm rơi đề thi",
    "examStats": "Chiếm 2.0 - 3.0 điểm, liên quan mật thiết đến hệ phương trình và Leontief",
    "quote": "Bí kíp UEH: Luôn nhớ det(P_A) = (det A)^(n-1) và thứ tự đảo khi nghịch đảo tích (AB)^(-1) = B^(-1) A^(-1).",
    "lesson": {
      "summary": "Ma trận vuông A khả nghịch khi và chỉ khi det(A) ≠ 0 (hoặc hạng r(A) = n). Khi đó ma trận nghịch đảo A^(-1) = (1/det A) adj(A). Ký hiệu P_A đại diện cho ma trận phụ hợp, có tính chất thần thánh A * P_A = (det A) * I_n và det(P_A) = (det A)^(n-1). Hạng ma trận là số dòng khác 0 sau khi đưa về dạng bậc thang.",
      "objectives": [
        "Nắm vững điều kiện cần và đủ để ma trận vuông khả nghịch: det(A) ≠ 0 <=> r(A) = n.",
        "Hiểu rõ cấu trúc ma trận phụ hợp adj(A) (hoặc P_A) và công thức định thức det(adj A) = (det A)^(n-1).",
        "Thành thạo công thức nghịch đảo của tích: (AB)^(-1) = B^(-1) A^(-1) và hằng số (kA)^(-1) = (1/k) A^(-1).",
        "Tìm hạng ma trận bằng phép biến đổi sơ cấp dòng về dạng bậc thang."
      ],
      "sections": [
        {
          "title": "1. Khái niệm Khả nghịch & Ma trận Nghịch đảo",
          "content": "Cho $A$ là ma trận vuông cấp $n$. Nếu tồn tại ma trận vuông $B$ cấp $n$ sao cho:\n$$A \\cdot B = B \\cdot A = I_n$$\nthì ta nói $A$ **khả nghịch** (hay không suy biến) và gọi $B$ là **ma trận nghịch đảo** của $A$, ký hiệu là $A^{-1}$.\n\n**Định lý tương đương vàng**:\n$$A \\text{ invertible} \\iff \\det A \\ne 0 \\iff r(A) = n$$\nNếu $\\det A = 0$ (hoặc $r(A) < n$), ma trận $A$ được gọi là **suy biến** (không khả nghịch)."
        },
        {
          "title": "2. Ma trận Phụ hợp (Adjugate Matrix) & Ký hiệu P_A",
          "content": "Trong đề thi UEH, ma trận phụ hợp thường được ký hiệu là $P_A$ hoặc $\\operatorname{adj}(A)$:\n$$\\operatorname{adj}(A) = P_A = \\begin{pmatrix} C_{11} & C_{21} & \\dots & C_{n1} \\\\ C_{12} & C_{22} & \\dots & C_{n2} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ C_{1n} & C_{2n} & \\dots & C_{nn} \\end{pmatrix} = (C_{ij})^T$$\n**Lưu ý**: $C_{ij} = (-1)^{i+j} M_{ij}$ là phần bù đại số của phần tử $a_{ij}$. Ma trận phụ hợp là **CHUYỂN VỊ** của ma trận các phần bù đại số.\n\n**Công thức nghịch đảo bằng phụ hợp**:\n$$A^{-1} = \\frac{1}{\\det A} P_A \\iff A \\cdot P_A = P_A \\cdot A = (\\det A) \\cdot I_n$$\n**Hệ thức định thức phụ hợp (Xuất hiện cực nhiều trong đề thi)**:\n$$\\det(P_A) = (\\det A)^{n-1}$$"
        },
        {
          "title": "3. Các tính chất đại số của Ma trận Nghịch đảo",
          "content": "Cho $A, B$ khả nghịch cấp $n$ và số thực $k \\ne 0$:\n1. $(A^{-1})^{-1} = A$.\n2. $(AB)^{-1} = B^{-1} A^{-1}$ (đảo thứ tự!).\n3. $(A_1 A_2 \\dots A_m)^{-1} = A_m^{-1} \\dots A_2^{-1} A_1^{-1}$.\n4. $(A^T)^{-1} = (A^{-1})^T$.\n5. $(kA)^{-1} = \\frac{1}{k} A^{-1}$ (chú ý: là $1/k$, không phải $1/k^n$!).\n6. $\\det(A^{-1}) = \\frac{1}{\\det A} = (\\det A)^{-1}$."
        },
        {
          "title": "4. Hạng của Ma trận (Rank)",
          "content": "Hạng của ma trận $A$ (kích thước $m \\times n$), ký hiệu là $r(A)$ hoặc $\\operatorname{rank}(A)$:\n- Định nghĩa: Cấp cao nhất của các định thức con khác 0 của $A$.\n- Thực hành: Dùng các phép biến đổi sơ cấp theo dòng đưa ma trận về **dạng bậc thang**, khi đó **hạng = số dòng khác 0**.\n- Các tính chất quan trọng:\n  * $0 \\le r(A) \\le \\min(m, n)$.\n  * $r(A^T) = r(A)$.\n  * $r(AB) \\le \\min(r(A), r(B))$.\n  * $r(A + B) \\le r(A) + r(B)$.\n  * Ma trận vuông cấp $n$ có $r(A) = n \\iff \\det A \\ne 0$."
        }
      ],
      "traps": [
        {
          "title": "Bẫy 1: Quên số mũ n-1 khi tính định thức ma trận phụ hợp",
          "wrong": "det(P_A) = det(A).",
          "right": "det(P_A) = (det A)^(n - 1) với n >= 2.",
          "explanation": "Từ A * P_A = (det A) * I_n, lấy định thức 2 vế: det(A) * det(P_A) = (det A)^n => det(P_A) = (det A)^(n-1)."
        },
        {
          "title": "Bẫy 2: Nhầm thứ tự (AB)^(-1)",
          "wrong": "(AB)^(-1) = A^(-1) B^(-1).",
          "right": "(AB)^(-1) = B^(-1) A^(-1).",
          "explanation": "Nhân kiểm tra: (AB)(B^(-1) A^(-1)) = A (B B^(-1)) A^(-1) = A I A^(-1) = I. Nếu để A^(-1) B^(-1) thì không rút gọn được."
        },
        {
          "title": "Bẫy 3: Quên chuyển vị khi lập ma trận phụ hợp",
          "wrong": "adj(A) = (C_ij) (đặt C_ij vào đúng dòng i, cột j).",
          "right": "adj(A) = (C_ij)^T (dòng của ma trận bù đại số biến thành cột của ma trận phụ hợp).",
          "explanation": "Rất nhiều sinh viên tính đúng hết C_ij nhưng quên chuyển vị khiến ma trận nghịch đảo sai toàn bộ."
        }
      ],
      "workedExample": {
        "question": "Cho $A$ là ma trận vuông cấp 4. Ký hiệu $P_A$ là ma trận phụ hợp của $A$. Biết rằng $\\det(P_A) = 8$. Hãy tính giá trị của $\\det(3A)$.",
        "steps": [
          "Bước 1: Ma trận $A$ có cấp $n = 4$.",
          "Bước 2: Áp dụng công thức định thức phụ hợp: $\\det(P_A) = (\\det A)^{n-1} = (\\det A)^{4-1} = (\\det A)^3$.",
          "Bước 3: Đề cho $\\det(P_A) = 8 \\implies (\\det A)^3 = 8 \\implies \\det A = 2$.",
          "Bước 4: Tính $\\det(3A)$ với cấp $n = 4$: $\\det(3A) = 3^n \\cdot \\det A = 3^4 \\cdot 2 = 81 \\cdot 2 = 162$."
        ],
        "casioTip": "Ghi nhớ ngay công thức liên hệ nhanh: det(kA) = k^n * [det(P_A)]^(1/(n-1)). Với bài này: 3^4 * 8^(1/3) = 81 * 2 = 162."
      }
    },
    "flashcards": [
      {
        "id": "fc-2-1",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức tính định thức của ma trận phụ hợp $P_A$ (hay $\\operatorname{adj}(A)$) theo $\\det A$ là gì?",
        "back": "$$\\det(P_A) = (\\det A)^{n-1}$$\n\nĐiều kiện: Ma trận vuông $A$ cấp $n \\ge 2$.",
        "keyTakeaway": "det(P_A) = (det A)^(n-1). Cấp n thì số mũ là n-1!",
        "trapWarning": "Đề UEH rất hay cho n = 3 (mũ 2) hoặc n = 4 (mũ 3).",
        "source": "Buổi 1 & Buổi 6"
      },
      {
        "id": "fc-2-2",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Hệ thức liên hệ cơ bản giữa ma trận A và ma trận phụ hợp $P_A$ là gì?",
        "back": "$$A \\cdot P_A = P_A \\cdot A = (\\det A) \\cdot I_n$$\n\nTừ đây suy ra: khi $\\det A \\ne 0$, ta có $A^{-1} = \\frac{1}{\\det A} P_A$.",
        "keyTakeaway": "A * P_A = (det A) * I_n.",
        "source": "Buổi 1"
      },
      {
        "id": "fc-2-3",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức nghịch đảo của tích: $(ABC)^{-1} = ?$",
        "back": "$$(ABC)^{-1} = C^{-1} \\cdot B^{-1} \\cdot A^{-1}$$\n\nThứ tự nghịch đảo **hoàn toàn lật ngược**: Phần tử sau cùng được đưa lên đầu tiên!",
        "keyTakeaway": "(ABC)^(-1) = C^(-1) B^(-1) A^(-1).",
        "source": "Buổi 6"
      },
      {
        "id": "fc-2-4",
        "type": "concept",
        "category": "Định lý",
        "front": "Điều kiện cần và đủ để ma trận vuông A cấp n khả nghịch là gì?",
        "back": "Các mệnh đề sau là **tương đương**:\n1. $A$ khả nghịch (khả đảo / không suy biến).\n2. $\\det A \\ne 0$.\n3. Hạng của ma trận $r(A) = n$.\n4. Hệ phương trình thuần nhất $AX = 0$ chỉ có nghiệm tầm thường $X = 0$.",
        "keyTakeaway": "Khả nghịch <=> det ≠ 0 <=> r(A) = n.",
        "source": "Buổi 2 & Buổi 5"
      },
      {
        "id": "fc-2-5",
        "type": "trap",
        "category": "Bẫy đề thi",
        "front": "Khẳng định: \"Nếu r(A) = 3 đối với ma trận vuông A cấp 4 thì A^2 - 2A là ma trận suy biến\" là ĐÚNG hay SAI?",
        "back": "**ĐÚNG!**\n\nGiải thích:\n- Vì $A$ vuông cấp 4 nhưng $r(A) = 3 < 4 \\implies \\det A = 0$.\n- Phân tích: $A^2 - 2A = A(A - 2I_4)$.\n- Lấy định thức: $\\det(A^2 - 2A) = \\det A \\cdot \\det(A - 2I_4) = 0 \\cdot \\det(A - 2I_4) = 0$.\n- Định thức bằng 0 chứng tỏ $A^2 - 2A$ suy biến!",
        "keyTakeaway": "det(A) = 0 => det(A(A - 2I)) = 0 => suy biến!",
        "source": "Đề K51 Mã 204 Câu 1"
      },
      {
        "id": "fc-2-6",
        "type": "quick-calc",
        "category": "Tính nhanh",
        "front": "Cho A là ma trận vuông cấp 3 thỏa $A^T \\cdot P_A = 4 I_3$. Hãy tính $\\det A$.",
        "back": "Lấy định thức 2 vế:\n$$\\det(A^T \\cdot P_A) = \\det(4 I_3)$$\n$$\\iff \\det(A^T) \\cdot \\det(P_A) = 4^3 \\cdot \\det I_3 = 64$$\nBiết rằng $\\det(A^T) = \\det A$ và với $n=3$ thì $\\det(P_A) = (\\det A)^2$. Do đó:\n$$(\\det A) \\cdot (\\det A)^2 = 64 \\iff (\\det A)^3 = 64 \\iff \\det A = 4$$",
        "keyTakeaway": "|A| * |A|^2 = 4^3 = 64 => |A| = 4.",
        "source": "Buổi 6 Sửa bài Câu 4"
      },
      {
        "id": "fc-2-7",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức nghịch đảo của một số vô hướng k nhân ma trận: $(kA)^{-1} = ?$",
        "back": "$$(kA)^{-1} = \\frac{1}{k} A^{-1}$$\n\nLưu ý: Hệ số là $\\frac{1}{k}$, KHÔNG PHẢI $\\frac{1}{k^n}$!\n(Chỉ khi lấy định thức mới có số mũ $n$: $\\det((kA)^{-1}) = \\frac{1}{k^n \\det A}$).",
        "keyTakeaway": "(kA)^(-1) = (1/k) * A^(-1).",
        "source": "Buổi 1"
      },
      {
        "id": "fc-2-8",
        "type": "concept",
        "category": "Định lý",
        "front": "Hạng của ma trận tích r(AB) có quan hệ như thế nào với r(A) và r(B)?",
        "back": "$$r(AB) \\le \\min\\{r(A), r(B)\\}$$\n\nHạng của tích ma trận không bao giờ vượt quá hạng của bất kỳ thừa số nào tham gia tích!",
        "keyTakeaway": "Hạng tích r(AB) <= min(r(A), r(B)).",
        "source": "Buổi 5"
      }
    ],
    "quiz": [
      {
        "id": "q-2-1",
        "question": "Cho ma trận vuông $A$ cấp 4 thỏa mãn $\\det(P_A) = 27$ và $\\det(2A) = 48$. Khẳng định nào sau đây là ĐÚNG?",
        "options": [
          "Đề bài có dữ liệu mâu thuẫn toán học",
          "$\\det(A) = 3$",
          "$\\det(A) = -3$",
          "$\\det(A) = 1.5$"
        ],
        "correctIndex": 1,
        "explanation": "Với ma trận cấp 4, ta có $\\det(2A) = 2^4 \\det A = 16 \\det A = 48 \\implies \\det A = 3$. Mặt khác, $\\det(P_A) = (\\det A)^{4-1} = (\\det A)^3 = 3^3 = 27$. Hai phương trình hoàn toàn khớp nhau tại $\\det A = 3$.",
        "distractorAnalysis": "Phương án B là chính xác. Bẫy quên mũ ở det(2A) sẽ tính ra det(A) = 24. Bẫy dấu âm ở C bị loại vì (-3)^3 = -27 ≠ 27.",
        "difficulty": "Vận dụng",
        "source": "Buổi 6 Sửa bài Câu 5"
      },
      {
        "id": "q-2-2",
        "question": "Cho ma trận $A$ vuông cấp 4 có $r(A) = 4$. Khi đó hệ phương trình tuyến tính $AX = B$ có bao nhiêu nghiệm?",
        "options": [
          "Hệ luôn có vô số nghiệm",
          "Hệ có nghiệm duy nhất với mọi vector $B$",
          "Hệ vô nghiệm nếu $B \\ne 0$",
          "Chưa thể kết luận khi chưa biết vector $B$"
        ],
        "correctIndex": 1,
        "explanation": "Vì $A$ vuông cấp 4 và $r(A) = 4 = n$, suy ra ma trận $A$ khả nghịch (det A ≠ 0). Theo định lý Cramer / Rouché-Capelli, hệ phương trình tuyến tính vuông có ma trận hệ số khả nghịch luôn có NGHIỆM DUY NHẤT $X = A^{-1} B$ với mọi vế phải $B$.",
        "distractorAnalysis": "Đây chính là câu 1 mã đề 204 K51, khẳng định 'Nếu r(A) = 4 thì hệ AX = B có vô số nghiệm' là khẳng định SAI điển hình.",
        "difficulty": "Cơ bản",
        "source": "Đề thi K51 Mã 204 Câu 1"
      }
    ]
  },
  {
    "id": "chuyen-de-3",
    "order": 3,
    "title": "Chuyên đề 3: Hệ Phương Trình Tuyến Tính & Biện Luận Tham Số",
    "shortTitle": "Hệ phương trình tuyến tính",
    "category": "Đại số tuyến tính",
    "badge": "Trọng tâm tự luận",
    "examStats": "Chiếm 2.0 - 2.5 điểm tự luận và 1-2 câu trắc nghiệm trong mọi đề thi UEH",
    "quote": "Bẫy tham số m: Khi det A(m) = 0, TUYỆT ĐỐI không kết luận ngay vô nghiệm hay vô số nghiệm, mà BẮT BUỘC phải thế m vào ma trận mở rộng để xét hạng!",
    "lesson": {
      "summary": "Hệ phương trình AX = B giải bằng Cramer khi ma trận vuông có det(A) ≠ 0. Tổng quát giải bằng khử Gauss trên ma trận mở rộng (A|B). Theo định lý Rouché-Capelli: r(A) < r(A|B) => vô nghiệm; r(A) = r(A|B) = n => nghiệm duy nhất; r(A) = r(A|B) < n => vô số nghiệm. Các câu hỏi biện luận tham số m thường gài bẫy lượng từ: 'với mọi m', 'tồn tại m', 'có nghiệm nhưng không duy nhất'.",
      "objectives": [
        "Nắm vững định lý Rouché-Capelli (Kronecker-Capelli) về điều kiện nghiệm của hệ phương trình.",
        "Sử dụng thành thạo phương pháp Cramer cho hệ vuông không suy biến: x_i = D_i / D.",
        "Vận dụng thuật toán Gauss-Jordan đưa ma trận mở rộng (A|B) về dạng bậc thang để tìm nghiệm tổng quát.",
        "Thành thạo quy trình biện luận tham số m chặt chẽ mọi trường hợp không sót nghiệm."
      ],
      "sections": [
        {
          "title": "1. Biểu diễn Hệ Phương Trình Tuyến Tính & Ma trận Mở rộng",
          "content": "Hệ $m$ phương trình tuyến tính $n$ ẩn có dạng:\n$$\\begin{cases} a_{11}x_1 + a_{12}x_2 + \\dots + a_{1n}x_n = b_1 \\\\ a_{21}x_1 + a_{22}x_2 + \\dots + a_{2n}x_n = b_2 \\\\ \\dots \\\\ a_{m1}x_1 + a_{m2}x_2 + \\dots + a_{mn}x_n = b_m \\end{cases}$$\nDạng ma trận: $A X = B$, trong đó $A \\in \\mathbb{R}^{m \\times n}$ là ma trận hệ số, $X \\in \\mathbb{R}^{n \\times 1}$ là vector ẩn, $B \\in \\mathbb{R}^{m \\times 1}$ là vector vế phải.\n\nMa trận mở rộng ký hiệu là $\\overline{A} = (A \\mid B)$ kích thước $m \\times (n+1)$."
        },
        {
          "title": "2. Định lý Rouché - Capelli (Bộ khung phán quyết số nghiệm)",
          "content": "So sánh hạng ma trận hệ số $r(A)$ và hạng ma trận mở rộng $r(\\overline{A})$ với số ẩn $n$:\n\n1. **$r(A) < r(\\overline{A})$**: Hệ **VÔ NGHIỆM** (xuất hiện dòng mâu thuẫn kiểu $[0 \\ 0 \\ \\dots \\ 0 \\mid c]$ với $c \\ne 0$).\n2. **$r(A) = r(\\overline{A}) = n$ (số ẩn)**: Hệ có **NGHIỆM DUY NHẤT**.\n3. **$r(A) = r(\\overline{A}) = r < n$**: Hệ có **VÔ SỐ NGHIỆM**, phụ thuộc vào $n - r$ ẩn tự do (tham số).\n\n**Chú ý**: $n$ là **SỐ ẨN**, không phải số phương trình $m$!"
        },
        {
          "title": "3. Phương pháp Cramer cho hệ vuông",
          "content": "Chỉ áp dụng khi số phương trình bằng số ẩn ($m = n$) và định thức chính $D = \\det A \\ne 0$.\n\nNghiệm duy nhất của hệ là:\n$$x_i = \\frac{D_i}{D} \\quad (i = 1, 2, \\dots, n)$$\ntrong đó $D_i$ là định thức ma trận thu được bằng cách **thay cột thứ $i$** của ma trận $A$ bằng cột vế phải $B$.\n\n**Cực kỳ quan trọng**: Nếu $D = \\det A = 0$, phương pháp Cramer **KHÔNG ÁP DỤNG ĐƯỢC**! Khi đó hệ chỉ có thể rơi vào 2 trường hợp: **Vô nghiệm** hoặc **Vô số nghiệm** (phải chuyển sang xét hạng)."
        },
        {
          "title": "4. Quy trình biện luận hệ chứa tham số m (Chuẩn thi tự luận UEH)",
          "content": "Cho hệ vuông cấp 3 chứa tham số $m$:\n- **Bước 1**: Tính định thức chính $D = \\det A(m)$. Phân tích nhân tử $D = (m - m_1)(m - m_2)\\dots$\n- **Bước 2**: Xét trường hợp $D \\ne 0 \\iff m \\ne m_1$ và $m \\ne m_2$: Hệ luôn có **nghiệm duy nhất** (tính theo Cramer nếu đề yêu cầu).\n- **Bước 3**: Xét riêng từng trường hợp đặc biệt làm $D = 0$:\n  * Thay $m = m_1$ trực tiếp vào ma trận mở rộng $(A \\mid B)$.\n  * Dùng phép biến đổi dòng đưa về dạng bậc thang.\n  * Kết luận chính xác tại $m_1$ hệ vô nghiệm hay vô số nghiệm.\n  * Làm tương tự với $m = m_2$.\n- **Bước 4**: Tổng kết trả lời đúng câu hỏi của đề (ví dụ: tìm $m$ để hệ có nghiệm, tìm $m$ để vô nghiệm, v.v.)."
        }
      ],
      "traps": [
        {
          "title": "Bẫy 1: Thấy D = 0 kết luận vội hệ vô số nghiệm",
          "wrong": "det(A) = 0 suy ra hệ có vô số nghiệm.",
          "right": "det(A) = 0 chỉ cho biết hệ KHÔNG CÓ NGHIỆM DUY NHẤT (có thể VÔ NGHIỆM hoặc VÔ SỐ NGHIỆM).",
          "explanation": "Bắt buộc phải thế giá trị m đó vào ma trận mở rộng để so sánh r(A) và r(A|B)."
        },
        {
          "title": "Bẫy 2: Nhầm số ẩn n với số phương trình m",
          "wrong": "Hệ có nghiệm duy nhất khi r(A) = r(A|B) = số phương trình.",
          "right": "Hệ có nghiệm duy nhất khi r(A) = r(A|B) = n (SỐ ẨN).",
          "explanation": "Nếu hệ có 3 phương trình 4 ẩn, hạng tối đa là 3 < 4 (số ẩn), nên nếu có nghiệm thì CHẮC CHẮN là vô số nghiệm, không bao giờ có nghiệm duy nhất!"
        }
      ],
      "workedExample": {
        "question": "Tìm tất cả các giá trị thực của tham số $m$ để hệ phương trình sau có nghiệm:\n$$\\begin{cases} x + y + z = 1 \\\\ 2x + 3y + z = 2 \\\\ 3x + 4y + m z = 3 \\end{cases}$$",
        "steps": [
          "Bước 1: Lập ma trận mở rộng: $\\overline{A} = \\begin{pmatrix} 1 & 1 & 1 & \\mid & 1 \\\\ 2 & 3 & 1 & \\mid & 2 \\\\ 3 & 4 & m & \\mid & 3 \\end{pmatrix}$.",
          "Bước 2: Khử Gauss dòng 2 và 3: $d_2 \\to d_2 - 2d_1$, $d_3 \\to d_3 - 3d_1$:\n$\\begin{pmatrix} 1 & 1 & 1 & \\mid & 1 \\\\ 0 & 1 & -1 & \\mid & 0 \\\\ 0 & 1 & m-3 & \\mid & 0 \\end{pmatrix}$.",
          "Bước 3: Khử tiếp dòng 3: $d_3 \\to d_3 - d_2$:\n$\\begin{pmatrix} 1 & 1 & 1 & \\mid & 1 \\\\ 0 & 1 & -1 & \\mid & 0 \\\\ 0 & 0 & m-2 & \\mid & 0 \\end{pmatrix}$.",
          "Bước 4: Nhận xét vế phải của dòng 3 bằng 0. Cột hệ số ở vị trí (3,3) là $m - 2$.",
          "Bước 5: Xét các trường hợp:\n- Nếu $m \\ne 2$: $r(A) = 3 = r(\\overline{A}) = n \\implies$ Hệ có nghiệm duy nhất.\n- Nếu $m = 2$: Dòng 3 toàn số 0 $\\implies r(A) = 2 = r(\\overline{A}) < 3 \\implies$ Hệ có vô số nghiệm.\nKết luận: Với MỌI $m \\in \\mathbb{R}$, hệ LUÔN CÓ NGHIỆM!"
        ],
        "casioTip": "Với hệ có tham số, bấm Mode 9 -> 1 -> 3 thử với 2 giá trị m khác nhau (ví dụ m = 2 và m = 5) để đối chiếu dạng nghiệm nhanh chóng."
      }
    },
    "flashcards": [
      {
        "id": "fc-3-1",
        "type": "concept",
        "category": "Định lý",
        "front": "Định lý Rouché - Capelli: Điều kiện để hệ phương trình tuyến tính AX = B có nghiệm duy nhất là gì?",
        "back": "$$r(A) = r(A \\mid B) = n$$\n\n(Hạng của ma trận hệ số bằng hạng ma trận mở rộng và bằng đúng **số ẩn $n$**).",
        "keyTakeaway": "Nghiệm duy nhất <=> r(A) = r(A|B) = n (số ẩn).",
        "source": "Buổi 2 & Buổi 5"
      },
      {
        "id": "fc-3-2",
        "type": "concept",
        "category": "Định lý",
        "front": "Hệ phương trình tuyến tính AX = B VÔ NGHIỆM khi nào?",
        "back": "$$r(A) < r(A \\mid B)$$\n\nKhi đưa về dạng bậc thang, xuất hiện ít nhất một dòng dạng $[0 \\ 0 \\dots 0 \\mid c]$ với $c \\ne 0$ (mâu thuẫn $0 = c$).",
        "keyTakeaway": "Vô nghiệm <=> r(A) < r(A|B) (dòng 0 = c).",
        "source": "Buổi 2"
      },
      {
        "id": "fc-3-3",
        "type": "concept",
        "category": "Định lý",
        "front": "Hệ phương trình tuyến tính AX = B có VÔ SỐ NGHIỆM khi nào?",
        "back": "$$r(A) = r(A \\mid B) = r < n$$\n\n(Hệ tương thích nhưng hạng nhỏ hơn số ẩn $n$). Số ẩn tự do của hệ bằng $n - r$.",
        "keyTakeaway": "Vô số nghiệm <=> r(A) = r(A|B) < n.",
        "source": "Buổi 2 & Buổi 5"
      },
      {
        "id": "fc-3-4",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức nghiệm Cramer cho hệ vuông $AX = B$ ($D = \\det A \\ne 0$): $x_i = ?$",
        "back": "$$x_i = \\frac{D_i}{D}$$\n\ntrong đó $D = \\det A$ và $D_i$ là định thức của ma trận thu được khi thay thế cột thứ $i$ của ma trận $A$ bằng cột vế phải $B$.",
        "keyTakeaway": "Cramer: x_i = D_i / D (chỉ áp dụng khi D ≠ 0).",
        "source": "Buổi 2"
      },
      {
        "id": "fc-3-5",
        "type": "trap",
        "category": "Bẫy đề thi",
        "front": "Một hệ gồm 3 phương trình 4 ẩn số có thể có nghiệm duy nhất không?",
        "back": "**KHÔNG BAO GIỜ!**\n\nMa trận hệ số có kích thước $3 \\times 4$, do đó hạng $r(A) \\le 3$. Vì số ẩn $n = 4$, ta luôn có $r(A) < n$. Do đó hệ phương trình chỉ có thể **Vô nghiệm** hoặc **Vô số nghiệm**, tuyệt đối không thể có nghiệm duy nhất!",
        "keyTakeaway": "Ít phương trình hơn số ẩn (m < n) => Không bao giờ có nghiệm duy nhất!",
        "source": "TUD_v2 & Đề thi"
      },
      {
        "id": "fc-3-6",
        "type": "concept",
        "category": "Định lý",
        "front": "Hệ phương trình tuyến tính thuần nhất $AX = 0$ có nghiệm không tầm thường ($X \\ne 0$) khi nào?",
        "back": "Hệ thuần nhất luôn có nghiệm tầm thường $X = 0$.\nHệ có thêm nghiệm không tầm thường $\\iff r(A) < n$.\n\nĐặc biệt với hệ vuông cấp $n$: Hệ có nghiệm không tầm thường $\\iff \\det A = 0$.",
        "keyTakeaway": "Thuần nhất có nghiệm khác 0 <=> det(A) = 0 <=> r(A) < n.",
        "source": "Buổi 2"
      },
      {
        "id": "fc-3-7",
        "type": "trap",
        "category": "Bẫy đề thi",
        "front": "Khi giải hệ có tham số m, nếu det(A) = 0 thì đã kết luận được hệ vô số nghiệm chưa?",
        "back": "**CHƯA! TUYỆT ĐỐI CHƯA!**\n\nKhi $\\det A = 0$, hệ có thể **Vô nghiệm** HOẶC **Vô số nghiệm**.\nBắt buộc phải thay giá trị $m$ đó vào ma trận mở rộng $(A \\mid B)$ và xét hạng mới kết luận được!",
        "keyTakeaway": "det = 0 mới chỉ loại nghiệm duy nhất, chưa biết vô nghiệm hay vô số nghiệm!",
        "source": "Buổi 3 & Buổi 4"
      }
    ],
    "quiz": [
      {
        "id": "q-3-1",
        "question": "Cho hệ phương trình tuyến tính $AX = B$ gồm 3 phương trình 3 ẩn. Biết $\\det(A) = m^2 - 4$. Khẳng định nào sau đây là CHÍNH XÁC?",
        "options": [
          "Với mọi $m \\ne \\pm 2$, hệ luôn có nghiệm duy nhất",
          "Với $m = 2$, hệ chắc chắn vô số nghiệm",
          "Với $m = -2$, hệ chắc chắn vô nghiệm",
          "Hệ luôn có nghiệm với mọi $m \\in \\mathbb{R}$"
        ],
        "correctIndex": 0,
        "explanation": "Theo định lý Cramer, khi định thức chính $D = \\det(A) \\ne 0 \\iff m^2 - 4 \\ne 0 \\iff m \\ne \\pm 2$, hệ phương trình vuông luôn có nghiệm duy nhất. Với $m = \\pm 2$, chưa biết vế phải $B$ nên chưa thể khẳng định vô nghiệm hay vô số nghiệm.",
        "distractorAnalysis": "Các đáp án B và C đều là kết luận võ đoán khi chưa biết cụ thể vector vế phải B.",
        "difficulty": "Cơ bản",
        "source": "Đề K49 Đợt 1"
      },
      {
        "id": "q-3-2",
        "question": "Xét hệ phương trình tuyến tính 3 phương trình và 4 ẩn số. Giả sử hệ có nghiệm, khi đó số nghiệm của hệ là:",
        "options": [
          "Duy nhất 1 nghiệm",
          "Vô số nghiệm",
          "Đúng 2 nghiệm",
          "Có thể duy nhất hoặc vô số nghiệm tùy thuộc vào vế phải"
        ],
        "correctIndex": 1,
        "explanation": "Vì số phương trình $m = 3$ và số ẩn $n = 4$, ta có $r(A) \\le 3 < n = 4$. Khi hệ có nghiệm (tức $r(A) = r(A \\mid B) = r$), vì $r \\le 3 < 4$, nên hệ bắt buộc phải có VÔ SỐ NGHIỆM phụ thuộc vào ít nhất $4 - 3 = 1$ tham số tự do.",
        "distractorAnalysis": "Bẫy ngộ nhận hệ có nghiệm thì có thể nghiệm duy nhất.",
        "difficulty": "Cơ bản",
        "source": "Đề K51 Mã 118"
      }
    ]
  },
  {
    "id": "chuyen-de-4",
    "order": 4,
    "title": "Chuyên đề 4: Mô Hình Input - Output Mở Leontief",
    "shortTitle": "Mô hình Leontief (I-O)",
    "category": "Đại số tuyến tính",
    "badge": "Đặc sản kinh tế UEH",
    "examStats": "Chiếm 2.5 - 3.0 điểm tự luận + 2 câu trắc nghiệm trong 100% đề thi!",
    "quote": "Quy tắc nằm lòng: Dòng cung cấp cho Cột (a_ij là ngành i cung cấp cho ngành j). Lượng nguyên liệu giao dịch x_ij = a_ij * X_j (nhân sản lượng ngành nhận!).",
    "lesson": {
      "summary": "Mô hình Leontief mô tả sự tương tác cung - cầu giữa các ngành kinh tế. Ma trận hệ số đầu vào A = (a_ij) với a_ij là chi phí nguyên liệu của ngành i để ngành j sản xuất 1 đơn vị sản lượng. Phương trình cân đối vĩ mô: X = AX + D <=> (I - A)X = D <=> X = (I - A)^(-1) D. Khi nhu cầu cuối thay đổi delta D, sản lượng thay đổi delta X = (I - A)^(-1) delta D.",
      "objectives": [
        "Hiểu chính xác ý nghĩa kinh tế của phần tử a_ij và quy ước dòng/cột trong bảng giao dịch liên ngành.",
        "Tính lượng sản phẩm trung gian trao đổi giữa các ngành: x_ij = a_ij * X_j.",
        "Thiết lập và giải phương trình cân đối Leontief (I - A)X = D để tìm vector sản lượng X hoặc nhu cầu cuối D.",
        "Giải quyết bài toán biến động: cú sốc nhu cầu cuối delta D và bài toán cải tiến công nghệ."
      ],
      "sections": [
        {
          "title": "1. Ma trận Hệ số Kỹ thuật & Bảng Giao dịch Liên ngành",
          "content": "Xét nền kinh tế gồm $n$ ngành sản xuất. Gọi $X_j$ là tổng giá trị sản lượng của ngành $j$.\n\n**Hệ số kỹ thuật $a_{ij}$ (Input Coefficient)**:\n$$a_{ij} = \\frac{x_{ij}}{X_j}$$\nÝ nghĩa: $a_{ij}$ là giá trị sản phẩm của **ngành $i$** cung cấp cho **ngành $j$** để ngành $j$ sản xuất ra **1 đơn vị giá trị sản lượng**.\n\n**Quy ước cốt lõi**:\n- **Dòng $i$**: Ngành CUNG CẤP (xuất khẩu nội bộ).\n- **Cột $j$**: Ngành TIẾP NHẬN (tiêu thụ nguyên liệu đầu vào).\n\n**Giá trị giao dịch trung gian $x_{ij}$**:\n$$x_{ij} = a_{ij} \\cdot X_j$$\n(Cảnh báo: Nhân với sản lượng của ngành nhận $X_j$, KHÔNG PHẢI $X_i$!)."
        },
        {
          "title": "2. Phương trình Cân đối Leontief",
          "content": "Tổng sản lượng của ngành $i$ được phân phối cho 2 mục đích:\n1. Tiêu dùng trung gian cho các ngành: $\\sum_{j=1}^n a_{ij} X_j$.\n2. Nhu cầu cuối cùng của xã hội (tiêu dùng cá nhân, chính phủ, đầu tư, xuất khẩu): $D_i$.\n\nTa có phương trình cân đối:\n$$X_i = \\sum_{j=1}^n a_{ij} X_j + D_i \\iff X = A X + D$$\nChuyển vế:\n$$(I - A) X = D$$\nNếu ma trận Leontief $(I - A)$ khả nghịch, vector tổng sản lượng được tính bởi:\n$$X = (I - A)^{-1} D$$\nMa trận $(I - A)^{-1}$ được gọi là **ma trận nghịch đảo Leontief**."
        },
        {
          "title": "3. Cú sốc Nhu cầu Cuối & Biến thiên Sản lượng",
          "content": "Nếu công nghệ không đổi (ma trận $A$ cố định), khi nhu cầu cuối cùng thay đổi một lượng $\\Delta D = (\\Delta D_1, \\Delta D_2, \\dots, \\Delta D_n)^T$, thì mức thay đổi tổng sản lượng là:\n$$\\Delta X = (I - A)^{-1} \\Delta D$$\nTổng sản lượng mới của nền kinh tế là: $X_{\\text{new}} = X_{\\text{old}} + \\Delta X$."
        },
        {
          "title": "4. Thay đổi Công nghệ (Cải tiến Kỹ thuật)",
          "content": "Nếu ngành $j$ cải tiến công nghệ, giảm tiêu thụ nguyên liệu từ ngành $i$ một tỷ lệ $p\\%$:\n$$a'_{ij} = (1 - p\\%) \\cdot a_{ij}$$\n(Nếu đề nói giảm $d$ đơn vị thì $a'_{ij} = a_{ij} - d$).\n\n**Lưu ý**: Khi ma trận công nghệ thay đổi thành $A'$, ta **BẮT BUỘC** phải tính ma trận mới $(I - A')$, tìm nghịch đảo mới $(I - A')^{-1}$ và giải lại phương trình $(I - A')X' = D'$! Tuyệt đối không được dùng ma trận nghịch đảo cũ."
        }
      ],
      "traps": [
        {
          "title": "Bẫy 1: Nhầm lẫn dòng và cột khi đọc a_ij",
          "wrong": "a_12 là lượng nguyên liệu ngành 2 cung cấp cho ngành 1.",
          "right": "a_12 là lượng nguyên liệu NGÀNH 1 cung cấp cho NGÀNH 2 (dòng 1 cung, cột 2 nhận).",
          "explanation": "Ký hiệu a_ij luôn tuân thủ: chỉ số đầu i là dòng (nguồn cung), chỉ số sau j là cột (nơi nhận)."
        },
        {
          "title": "Bẫy 2: Nhân nhầm X_i thay vì X_j",
          "wrong": "Tính lượng sản phẩm ngành 1 cung cấp cho ngành 3: x_13 = a_13 * X_1.",
          "right": "x_13 = a_13 * X_3 (phải nhân với sản lượng của ngành nhận X_3).",
          "explanation": "a_13 là lượng ngành 1 cấp để ngành 3 làm ra 1 đơn vị sản lượng, nên muốn biết tổng cần bao nhiêu phải nhân với tổng sản lượng ngành 3 làm ra là X_3."
        }
      ],
      "workedExample": {
        "question": "Trong mô hình Input - Output 3 ngành, cho ma trận hệ số đầu vào:\n$$A = \\begin{pmatrix} 0.2 & 0.3 & 0.2 \\\\ 0.4 & 0.1 & 0.2 \\\\ 0.1 & 0.3 & 0.2 \\end{pmatrix}$$\nBiết sản lượng của 3 ngành lần lượt là $X = (100, 200, 150)^T$. Hãy tính:\na) Lượng nguyên liệu ngành 1 cung cấp cho ngành 2.\nb) Tổng nhu cầu cuối cùng $D_1$ của ngành 1.",
        "steps": [
          "Câu a: Áp dụng công thức giao dịch $x_{12} = a_{12} \\cdot X_2$.",
          "Nhìn vào ma trận $A$: phần tử dòng 1 cột 2 là $a_{12} = 0.3$.",
          "Sản lượng ngành nhận (ngành 2) là $X_2 = 200$.",
          "Do đó: $x_{12} = 0.3 \\cdot 200 = 60$ (đơn vị giá trị).",
          "Câu b: Áp dụng phương trình cân đối dòng 1: $X_1 = a_{11}X_1 + a_{12}X_2 + a_{13}X_3 + D_1$.",
          "Thay số: $100 = 0.2(100) + 0.3(200) + 0.2(150) + D_1$.",
          "Tính tổng tiêu dùng trung gian: $20 + 60 + 30 = 110$.",
          "Suy ra: $D_1 = 100 - 110 = -10$. (Nhu cầu cuối âm thể hiện nền kinh tế phải nhập khẩu thêm 10 đơn vị sản phẩm ngành 1 để đáp ứng nhu cầu sản xuất)."
        ],
        "casioTip": "Có thể dùng tính năng nhân ma trận của Casio: nhập ma trận (I - A) và vector X, bấm (I - A) * X sẽ ra ngay vector D!"
      }
    },
    "flashcards": [
      {
        "id": "fc-4-1",
        "type": "concept",
        "category": "Khái niệm",
        "front": "Phần tử $a_{ij}$ trong ma trận hệ số đầu vào Leontief có ý nghĩa kinh tế là gì?",
        "back": "Là **giá trị sản phẩm của ngành $i$** cung cấp cho **ngành $j$** để ngành $j$ sản xuất ra **1 đơn vị giá trị sản lượng**.\n\nQuy tắc nhớ: **Dòng $i$ = Cung cấp, Cột $j$ = Tiêu thụ**.",
        "keyTakeaway": "a_ij: Ngành i cấp cho ngành j làm 1 đv sản phẩm.",
        "source": "Buổi 7 Input - Output"
      },
      {
        "id": "fc-4-2",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Lượng nguyên liệu mà ngành i cung ứng cho ngành j được tính bằng công thức nào?",
        "back": "$$x_{ij} = a_{ij} \\cdot X_j$$\n\n(Lưu ý sống còn: Phải nhân với sản lượng **$X_j$ của ngành nhận**, KHÔNG ĐƯỢC nhân với $X_i$!).",
        "keyTakeaway": "Giao dịch x_ij = a_ij * X_j (nhân với X của cột!).",
        "trapWarning": "Bẫy đề thi hay hỏi x_21 nhưng sinh viên lấy a_21 * X_2 thay vì X_1.",
        "source": "Buổi 7 & Đề K51"
      },
      {
        "id": "fc-4-3",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Phương trình cân đối Leontief dạng ma trận và công thức tìm tổng sản lượng X là gì?",
        "back": "$$X = AX + D \\iff (I - A)X = D$$\n\nKhi $(I - A)$ khả nghịch:\n$$X = (I - A)^{-1} D$$",
        "keyTakeaway": "(I - A)X = D => X = (I - A)^(-1) D.",
        "source": "Buổi 7"
      },
      {
        "id": "fc-4-4",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Khi nhu cầu cuối thay đổi một lượng $\\Delta D$, sản lượng toàn nền kinh tế thay đổi như thế nào?",
        "back": "$$\\Delta X = (I - A)^{-1} \\Delta D$$\n\nSản lượng mới: $X_{\\text{new}} = X_{\\text{old}} + \\Delta X$.\n(Áp dụng khi ma trận hệ số công nghệ $A$ không đổi).",
        "keyTakeaway": "delta X = (I - A)^(-1) * delta D.",
        "source": "Buổi 7"
      },
      {
        "id": "fc-4-5",
        "type": "trap",
        "category": "Bẫy đề thi",
        "front": "Nếu ngành 2 giảm tiêu thụ nguyên liệu từ ngành 1 là 20%, hệ số kỹ thuật mới $a'_{12}$ tính như thế nào?",
        "back": "$$a'_{12} = a_{12} \\cdot (1 - 0.2) = 0.8 \\cdot a_{12}$$\n\nCảnh báo: Chỉ có phần tử $a_{12}$ thay đổi, các phần tử khác của ma trận $A$ giữ nguyên. Phải giải lại hệ $(I - A')X' = D'$, không dùng nghịch đảo cũ!",
        "keyTakeaway": "Giảm p% => a'_12 = (1 - p%) * a_12.",
        "source": "Đề thi K51 Mã 235"
      },
      {
        "id": "fc-4-6",
        "type": "concept",
        "category": "Khái niệm",
        "front": "Tổng chi phí mua nguyên liệu đầu vào trung gian của ngành j được tính bằng biểu thức nào?",
        "back": "Bằng **tổng các phần tử theo cột $j$** nhân với $X_j$:\n$$\\sum_{i=1}^n a_{ij} X_j = (a_{1j} + a_{2j} + \\dots + a_{nj}) X_j$$",
        "keyTakeaway": "Tổng chi phí đầu vào của ngành j = Tổng cột j * X_j.",
        "source": "Buổi 7 & TUD_v2"
      }
    ],
    "quiz": [
      {
        "id": "q-4-1",
        "question": "Trong mô hình Leontief, hệ số $a_{23} = 0.25$ có nghĩa là:",
        "options": [
          "Ngành 2 cần 0.25 đơn vị sản phẩm ngành 3 để sản xuất 1 đơn vị sản lượng",
          "Ngành 3 cần 0.25 đơn vị sản phẩm ngành 2 để sản xuất 1 đơn vị sản lượng",
          "Ngành 2 bán cho ngành 3 tổng cộng 25% tổng sản lượng của mình",
          "Ngành 3 cung cấp 25% giá trị cho ngành 2"
        ],
        "correctIndex": 1,
        "explanation": "Chỉ số 2 là dòng (ngành 2 cung cấp), chỉ số 3 là cột (ngành 3 nhận). Do đó $a_{23} = 0.25$ có nghĩa ngành 3 cần 0.25 đơn vị giá trị đầu vào từ ngành 2 để sản xuất ra 1 đơn vị giá trị sản lượng của ngành 3.",
        "distractorAnalysis": "Phương án A bị đảo ngược vai trò cung - cầu (nhầm dòng với cột). Phương án C nhầm lẫn giữa tỷ lệ đầu vào kỹ thuật với tỷ trọng tiêu thụ tổng sản lượng.",
        "difficulty": "Cơ bản",
        "source": "Đề K47 Câu trắc nghiệm"
      },
      {
        "id": "q-4-2",
        "question": "Cho ma trận $A = \\begin{pmatrix} 0.1 & 0.2 \\\\ 0.3 & 0.4 \\end{pmatrix}$ và vector tổng sản lượng $X = \\begin{pmatrix} 200 \\\\ 300 \\end{pmatrix}$. Lượng sản phẩm do ngành 1 cung cấp cho ngành 2 bằng bao nhiêu?",
        "options": [
          "$20$",
          "$60$",
          "$90$",
          "$40$"
        ],
        "correctIndex": 1,
        "explanation": "Lượng sản phẩm ngành 1 cung cấp cho ngành 2 là $x_{12} = a_{12} \\cdot X_2$. Nhìn vào ma trận $A$, ta có $a_{12} = 0.2$. Sản lượng ngành 2 là $X_2 = 300$. Do đó $x_{12} = 0.2 \\cdot 300 = 60$.",
        "distractorAnalysis": "Bẫy nhân với X_1: lấy 0.2 * 200 = 40 (Phương án D). Bẫy nhầm a_21 = 0.3: lấy 0.3 * 200 = 60 (vô tình trùng số) hoặc 0.3 * 300 = 90 (Phương án C).",
        "difficulty": "Cơ bản",
        "source": "Đề thi K50 Đợt 2"
      }
    ]
  },
  {
    "id": "chuyen-de-5",
    "order": 5,
    "title": "Chuyên đề 5: Đạo Hàm, Vi Phân, Hàm Ẩn & Xấp Xỉ Tuyến Tính",
    "shortTitle": "Đạo hàm & Hàm ẩn",
    "category": "Giải tích & Kinh tế",
    "badge": "Cứu rớt môn",
    "examStats": "Chiếm 1.5 - 2.0 điểm trắc nghiệm và bước đệm cho bài toán tối ưu",
    "quote": "Bẫy đạo hàm hàm ẩn: y' = -F_x / F_y (Luôn nhớ dấu TRỪ đằng trước!). Đừng quên tính giá trị y_0 tại điểm xét x_0.",
    "lesson": {
      "summary": "Đạo hàm đo lường tốc độ thay đổi tức thời. Hàm ẩn F(x, y) = 0 có đạo hàm y' = -F_x / F_y (với F_y ≠ 0). Vi phân dy = f'(x) dx được dùng để xấp xỉ tuyến tính delta y ≈ f'(x_0) delta x và ước lượng tỷ lệ biến động phần trăm delta y / y_0.",
      "objectives": [
        "Thành thạo công thức đạo hàm hàm hợp, hàm mũ, logarit và đạo hàm lũy thừa biến số.",
        "Nắm vững công thức đạo hàm hàm ẩn y' = -F_x / F_y và đạo hàm cấp 2 hàm ẩn.",
        "Vận dụng vi phân để tính xấp xỉ tuyến tính f(x_0 + h) ≈ f(x_0) + f'(x_0)h.",
        "Ước lượng sai số tương đối và mức thay đổi phần trăm trong các mô hình kinh tế."
      ],
      "sections": [
        {
          "title": "1. Các Quy Tắc Đạo Hàm Nền Tảng Cần Nhớ",
          "content": "- Đạo hàm hàm hợp: $[f(u)]' = f'(u) \\cdot u'(x)$.\n- $(e^u)' = u' e^u$, $(\\ln |u|)' = \\frac{u'}{u}$ (với $u \\ne 0$).\n- $(a^u)' = u' a^u \\ln a$ (với $a > 0, a \\ne 1$).\n- **Đạo hàm hàm dạng $u(x)^{v(x)}$**: Lấy $\\ln$ hai vế trước khi lấy đạo hàm:\n$$y = u^v \\implies \\ln y = v \\ln u \\implies \\frac{y'}{y} = v' \\ln u + v \\frac{u'}{u} \\implies y' = u^v \\left( v' \\ln u + v \\frac{u'}{u} \\right)$$"
        },
        {
          "title": "2. Đạo Hàm Hàm Ẩn (Implicit Differentiation)",
          "content": "Cho phương trình $F(x, y) = 0$ xác định $y$ như một hàm theo biến $x$. Tại điểm $(x_0, y_0)$ thỏa mãn $F(x_0, y_0) = 0$ và đạo hàm riêng $F_y(x_0, y_0) \\ne 0$, ta có:\n$$y'(x) = -\\frac{F_x}{F_y} = -\\frac{\\frac{\\partial F}{\\partial x}}{\\frac{\\partial F}{\\partial y}}$$\n\n**Quy trình giải bài thi UEH**:\n- **Bước 1**: Nếu đề chỉ cho $x = x_0$, phải thế $x_0$ vào $F(x_0, y) = 0$ để giải tìm $y_0$.\n- **Bước 2**: Tính đạo hàm riêng $F_x$ (coi $y$ là hằng số) và $F_y$ (coi $x$ là hằng số).\n- **Bước 3**: Lắp vào công thức $y'(x_0) = -\\frac{F_x(x_0, y_0)}{F_y(x_0, y_0)}$ (nhớ dấu TRỪ!)."
        },
        {
          "title": "3. Vi Phân & Xấp Xỉ Tuyến Tính",
          "content": "- **Vi phân cấp 1**: $dy = f'(x_0) dx$.\n- **Xấp xỉ tuyến tính (Linear Approximation)**:\n$$f(x_0 + \\Delta x) \\approx f(x_0) + f'(x_0) \\Delta x$$\n$$\\Delta y \\approx f'(x_0) \\Delta x$$\n- **Ý nghĩa xấp xỉ phần trăm**:\n$$\\frac{\\Delta y}{y_0} \\approx \\frac{f'(x_0)}{y_0} \\Delta x = E_{y,x} \\cdot \\frac{\\Delta x}{x_0}$$\nĐộ chính xác của xấp xỉ tuyến tính là xấp xỉ bậc nhất, áp dụng tốt khi biến thiên $\\Delta x$ đủ nhỏ."
        }
      ],
      "traps": [
        {
          "title": "Bẫy 1: Quên dấu trừ trong công thức đạo hàm hàm ẩn",
          "wrong": "y' = F_x / F_y.",
          "right": "y' = -F_x / F_y (có dấu TRỪ!).",
          "explanation": "Từ F(x, y) = 0, lấy vi phân toàn phần: F_x dx + F_y dy = 0 => F_y dy = -F_x dx => dy/dx = -F_x / F_y."
        },
        {
          "title": "Bẫy 2: Quên tìm tung độ y_0",
          "wrong": "Đề cho tính y'(1) từ x^2 + y^3 - 9 = 0, chỉ tính F_x = 2x rồi chia bừa.",
          "right": "Thế x = 1 vào phương trình tìm ra y = 2, sau đó mới thế điểm (1, 2) vào -F_x / F_y.",
          "explanation": "F_y chứa biến y nên bắt buộc phải có giá trị y_0 tương ứng."
        }
      ],
      "workedExample": {
        "question": "Cho hàm ẩn $y = y(x)$ xác định bởi phương trình $x^3 + y^3 - 3xy - 3 = 0$. Hãy tính $y'(2)$ biết tại $x = 2$ thì $y = 1$.",
        "steps": [
          "Bước 1: Đặt $F(x, y) = x^3 + y^3 - 3xy - 3 = 0$. Điểm xét là $(x_0, y_0) = (2, 1)$.",
          "Bước 2: Tính đạo hàm riêng $F_x$ (coi $y$ là hằng số): $F_x = 3x^2 - 3y$.",
          "Thay điểm $(2, 1)$: $F_x(2, 1) = 3(2)^2 - 3(1) = 12 - 3 = 9$.",
          "Bước 3: Tính đạo hàm riêng $F_y$ (coi $x$ là hằng số): $F_y = 3y^2 - 3x$.",
          "Thay điểm $(2, 1)$: $F_y(2, 1) = 3(1)^2 - 3(2) = 3 - 6 = -3$.",
          "Bước 4: Áp dụng công thức đạo hàm hàm ẩn:\n$$y'(2) = -\\frac{F_x(2, 1)}{F_y(2, 1)} = -\\frac{9}{-3} = 3$$."
        ],
        "casioTip": "Có thể kiểm tra đạo hàm hàm hợp bằng cách bấm d/dx trên máy tính cầm tay nếu rút được y theo x."
      }
    },
    "flashcards": [
      {
        "id": "fc-5-1",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức đạo hàm hàm ẩn $y'(x)$ từ phương trình $F(x, y) = 0$ là gì?",
        "back": "$$y' = -\\frac{F_x}{F_y}$$\n\nĐiều kiện áp dụng: $F_y = \\frac{\\partial F}{\\partial y} \\ne 0$.",
        "keyTakeaway": "Hàm ẩn: y' = -F_x / F_y (nhớ dấu trừ!).",
        "trapWarning": "Bẫy lớn nhất là quên dấu trừ, dẫn đến kết quả bị ngược dấu.",
        "source": "Buổi 8 & Đề K46-K51"
      },
      {
        "id": "fc-5-2",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức xấp xỉ tuyến tính của hàm số $f(x)$ tại lân cận điểm $x_0$ là gì?",
        "back": "$$f(x_0 + \\Delta x) \\approx f(x_0) + f'(x_0) \\cdot \\Delta x$$\n\nĐộ thay đổi của hàm số:\n$$\\Delta y \\approx f'(x_0) \\cdot \\Delta x$$",
        "keyTakeaway": "Xấp xỉ: f(x0 + dx) ≈ f(x0) + f'(x0)*dx.",
        "source": "Buổi 8"
      },
      {
        "id": "fc-5-3",
        "type": "quick-calc",
        "category": "Tính nhanh",
        "front": "Cho phương trình hàm ẩn $x^2 + y^2 - 25 = 0$. Tính $y'(3)$ biết $y(3) = 4$.",
        "back": "$$F_x = 2x \\implies F_x(3, 4) = 6$$\n$$F_y = 2y \\implies F_y(3, 4) = 8$$\n$$y'(3) = -\\frac{F_x}{F_y} = -\\frac{6}{8} = -0.75$$",
        "keyTakeaway": "y' = -2x / 2y = -x / y = -3/4 = -0.75.",
        "source": "Buổi 8"
      },
      {
        "id": "fc-5-4",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Đạo hàm của hàm logarit tự nhiên: $(\\ln |u(x)|)' = ?$",
        "back": "$$(\\ln |u|)' = \\frac{u'}{u} \\quad (u \\ne 0)$$\n\nĐặc biệt: $(\\ln x)' = \\frac{1}{x}$ với $x > 0$.",
        "keyTakeaway": "(ln|u|)' = u' / u.",
        "source": "Buổi 8"
      }
    ],
    "quiz": [
      {
        "id": "q-5-1",
        "question": "Cho hàm ẩn $y(x)$ thỏa mãn phương trình $e^y - xy - 1 = 0$. Giá trị của $y'(0)$ tại điểm có $y(0) = 0$ bằng:",
        "options": [
          "$0$",
          "$1$",
          "$-1$",
          "Không tồn tại"
        ],
        "correctIndex": 0,
        "explanation": "Đặt $F(x, y) = e^y - xy - 1 = 0$. Ta có $F_x = -y$ và $F_y = e^y - x$. Tại điểm $(0, 0)$: $F_x(0, 0) = 0$ và $F_y(0, 0) = e^0 - 0 = 1 \\ne 0$. Do đó $y'(0) = -\\frac{F_x(0, 0)}{F_y(0, 0)} = -\\frac{0}{1} = 0$.",
        "distractorAnalysis": "Các phương án 1 và -1 là kết quả của việc tính nhầm đạo hàm riêng hoặc quên giá trị tại điểm.",
        "difficulty": "Cơ bản",
        "source": "Đề K47 Câu 5"
      }
    ]
  },
  {
    "id": "chuyen-de-6",
    "order": 6,
    "title": "Chuyên đề 6: Biên Tế, Hệ Số Co Giãn & Ứng Dụng Kinh Tế",
    "shortTitle": "Biên tế & Co giãn",
    "category": "Giải tích & Kinh tế",
    "badge": "Trọng tâm trắc nghiệm",
    "examStats": "Chiếm 2.0 - 2.5 điểm trắc nghiệm trong mọi kỳ thi TCC UEH",
    "quote": "Quy tắc kinh tế: Tối đa lợi nhuận khi MR = MC. Tối thiểu chi phí bình quân khi MC = AC. Hệ số co giãn E = y' * (x/y).",
    "lesson": {
      "summary": "Đại lượng biên tế là đạo hàm của hàm tổng (MR = R', MC = C'). Hệ số co giãn E_(y,x) = y' * (x/y) cho biết khi x tăng 1% thì y thay đổi xấp xỉ E%. Độ co giãn của cầu theo giá E_(Q,P) luôn mang dấu âm; khi |E| > 1 thì cầu co giãn nhiều, giảm giá làm tăng tổng doanh thu.",
      "objectives": [
        "Phân biệt rõ đại lượng tổng, đại lượng bình quân và đại lượng biên tế trong kinh tế học.",
        "Nắm vững điều kiện tối ưu: cực đại lợi nhuận (MR = MC) và cực tiểu chi phí bình quân (MC = AC).",
        "Thành thạo công thức tính hệ số co giãn: E_(y,x) = y'(x) * (x/y) và ý nghĩa phần trăm.",
        "Phân tích tác động của việc tăng/giảm giá lên tổng doanh thu dựa vào độ co giãn cầu |E_(Q,P)|."
      ],
      "sections": [
        {
          "title": "1. Các Hàm Kinh Tế & Đại Lượng Biên Tế (Marginal Concepts)",
          "content": "- **Tổng doanh thu**: $R(Q) = P(Q) \\cdot Q$ (hoặc $R(P) = P \\cdot Q(P)$).\n- **Doanh thu biên (Marginal Revenue)**: $MR = R'(Q) = \\frac{dR}{dQ}$.\n  Ý nghĩa: Doanh thu tăng thêm khi bán thêm 1 đơn vị sản phẩm.\n- **Tổng chi phí**: $C(Q)$.\n- **Chi phí biên (Marginal Cost)**: $MC = C'(Q) = \\frac{dC}{dQ}$.\n  Ý nghĩa: Chi phí phát sinh thêm khi sản xuất thêm 1 đơn vị sản phẩm.\n- **Tổng lợi nhuận**: $\\pi(Q) = R(Q) - C(Q)$.\n  Lợi nhuận biên: $\\pi'(Q) = MR - MC$.\n  **Điều kiện tối đa hóa lợi nhuận**: $\\pi'(Q) = 0 \\implies MR = MC$ (kèm $\\pi''(Q) < 0$)."
        },
        {
          "title": "2. Chi Phí Bình Quân & Điểm Cực Tiểu Chi Phí",
          "content": "- **Chi phí bình quân (Average Cost)**:\n$$AC(Q) = \\frac{C(Q)}{Q} \\quad (Q > 0)$$\n- Tìm cực tiểu của chi phí bình quân: Lấy đạo hàm $AC'(Q) = 0$:\n$$AC'(Q) = \\frac{C'(Q)Q - C(Q)}{Q^2} = 0 \\iff C'(Q) = \\frac{C(Q)}{Q} \\iff MC = AC$$\n**Định lý kinh điển**: Chi phí bình quân đạt cực tiểu tại mức sản lượng mà tại đó **Chi phí biên bằng Chi phí bình quân** ($MC = AC$)."
        },
        {
          "title": "3. Hệ Số Co Giãn (Elasticity)",
          "content": "Cho $y = f(x)$ là hàm khả vi. Hệ số co giãn của $y$ theo $x$ ký hiệu là $E_{y,x}$ hay $\\varepsilon_{y,x}$:\n$$E_{y,x} = \\frac{dy}{dx} \\cdot \\frac{x}{y} = y'(x) \\cdot \\frac{x}{y}$$\n\n**Ý nghĩa kinh tế**:\nKhi biến độc lập $x$ tăng $1\\%$, thì biến phụ thuộc $y$ sẽ thay đổi (tăng hoặc giảm) xấp xỉ **$E_{y,x} \\%$**.\n\n**Ước lượng biến thiên phần trăm**:\n$$\\frac{\\Delta y}{y} \\approx E_{y,x} \\cdot \\frac{\\Delta x}{x}$$"
        },
        {
          "title": "4. Độ Co Giãn của Cầu theo Giá (Price Elasticity of Demand)",
          "content": "Gọi $Q = Q(P)$ là hàm cầu theo giá ($Q'(P) < 0$ theo luật cầu):\n$$E_{Q,P} = Q'(P) \\cdot \\frac{P}{Q} < 0$$\n\n**Phân loại theo trị tuyệt đối $|E_{Q,P}|$**:\n- **$|E_{Q,P}| > 1$ (Cầu co giãn nhiều)**: Phần trăm lượng cầu thay đổi nhiều hơn phần trăm giá. Muốn **tăng doanh thu**, doanh nghiệp nên **GIẢM GIÁ**.\n- **$|E_{Q,P}| < 1$ (Cầu co giãn ít / kém co giãn)**: Phần trăm lượng cầu thay đổi ít hơn giá. Muốn **tăng doanh thu**, doanh nghiệp nên **TĂNG GIÁ**.\n- **$|E_{Q,P}| = 1$ (Co giãn đơn vị)**: Doanh thu đạt cực đại."
        }
      ],
      "traps": [
        {
          "title": "Bẫy 1: Nhầm lẫn hàm cầu Q(P) và hàm cầu ngược P(Q)",
          "wrong": "Đề cho P = 100 - 2Q, tính Q'(P) = -2.",
          "right": "P = 100 - 2Q là hàm cầu ngược P(Q). Phải rút ra Q = 50 - 0.5P => Q'(P) = -0.5 (hoặc dùng Q'(P) = 1 / P'(Q) = 1 / -2 = -0.5).",
          "explanation": "Đề thi UEH rất hay cho phương trình giá P theo Q, sinh viên không đảo vế sẽ tính sai hệ số co giãn gấp 4 lần."
        },
        {
          "title": "Bẫy 2: Dấu âm của hệ số co giãn cầu",
          "wrong": "Kết luận: 'Khi giá tăng 1%, lượng cầu tăng -1.5%'.",
          "right": "Diễn đạt chuẩn: 'Khi giá tăng 1%, lượng cầu GIẢM 1.5%'.",
          "explanation": "Dấu âm đã thể hiện xu hướng giảm; không được dùng cùng lúc hai từ phủ định 'tăng -1.5%'."
        }
      ],
      "workedExample": {
        "question": "Cho hàm cầu của một loại hàng hóa là $Q = 200 - 4P$. Tại mức giá $P = 20$:\na) Tính hệ số co giãn của cầu theo giá $E_{Q,P}$. Nêu ý nghĩa kinh tế.\nb) Để tăng tổng doanh thu, doanh nghiệp nên tăng hay giảm giá?",
        "steps": [
          "Câu a: Tại $P = 20$, lượng cầu tương ứng là $Q = 200 - 4(20) = 120$.",
          "Đạo hàm hàm cầu theo giá: $Q'(P) = -4$.",
          "Hệ số co giãn: $E_{Q,P} = Q'(P) \\cdot \\frac{P}{Q} = (-4) \\cdot \\frac{20}{120} = -\\frac{80}{120} = -\\frac{2}{3} \\approx -0.67$.",
          "Ý nghĩa kinh tế: Tại mức giá $P = 20$, nếu giá hàng hóa tăng thêm $1\\%$, thì lượng cầu hàng hóa sẽ giảm khoảng $0.67\\%$.",
          "Câu b: Vì $|E_{Q,P}| = |-0.67| = 0.67 < 1$ (cầu co giãn ít), mức giảm lượng cầu nhỏ hơn mức tăng giá.",
          "Do đó, để tăng tổng doanh thu, doanh nghiệp nên **TĂNG GIÁ**."
        ],
        "casioTip": "Công thức doanh thu: R(P) = P * Q = P(200 - 4P) = 200P - 4P^2. Cực đại tại P = -200 / (2 * -4) = 25. Vì hiện tại P = 20 < 25 nên tăng giá sẽ làm tăng doanh thu."
      }
    },
    "flashcards": [
      {
        "id": "fc-6-1",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức tổng quát tính hệ số co giãn của y theo x là gì?",
        "back": "$$E_{y,x} = \\frac{dy}{dx} \\cdot \\frac{x}{y} = y'(x) \\cdot \\frac{x}{y}$$\n\nÝ nghĩa: Khi $x$ tăng $1\\%$ thì $y$ thay đổi xấp xỉ $E_{y,x} \\%$.",
        "keyTakeaway": "E_(y,x) = y'(x) * (x/y).",
        "source": "Buổi 8 & TUD_v2"
      },
      {
        "id": "fc-6-2",
        "type": "concept",
        "category": "Định lý",
        "front": "Điều kiện cần để một doanh nghiệp tối đa hóa lợi nhuận nội là gì?",
        "back": "$$MR = MC$$\n\n(Doanh thu biên bằng Chi phí biên, xuất phát từ $\\pi'(Q) = R'(Q) - C'(Q) = 0$).",
        "keyTakeaway": "Tối đa lợi nhuận <=> MR = MC.",
        "source": "Buổi 8"
      },
      {
        "id": "fc-6-3",
        "type": "concept",
        "category": "Định lý",
        "front": "Tại mức sản lượng mà chi phí bình quân AC đạt cực tiểu, mối quan hệ giữa MC và AC là gì?",
        "back": "$$MC = AC$$\n\n(Đường chi phí biên $MC$ luôn cắt đường chi phí bình quân $AC$ tại điểm cực tiểu của $AC$).",
        "keyTakeaway": "AC cực tiểu <=> MC = AC.",
        "source": "Buổi 8"
      },
      {
        "id": "fc-6-4",
        "type": "concept",
        "category": "Ứng dụng kinh tế",
        "front": "Khi độ co giãn của cầu theo giá thỏa mãn $|E_{Q,P}| > 1$ (cầu co giãn nhiều), muốn tăng doanh thu doanh nghiệp nên làm gì?",
        "back": "Doanh nghiệp nên **GIẢM GIÁ**.\n\nVì khi cầu co giãn nhiều, việc giảm giá $1\\%$ sẽ kích thích lượng cầu tăng nhiều hơn $1\\%$, dẫn đến tổng doanh thu $R = P \\cdot Q$ tăng lên.",
        "keyTakeaway": "|E| > 1 (co giãn nhiều) => GIẢM GIÁ để tăng doanh thu.",
        "source": "Buổi 8 & Đề K51"
      },
      {
        "id": "fc-6-5",
        "type": "quick-calc",
        "category": "Tính nhanh",
        "front": "Cho hàm tổng chi phí $C(Q) = Q^3 - 4Q^2 + 10Q + 20$. Chi phí biên $MC$ tại $Q = 2$ bằng bao nhiêu?",
        "back": "$$MC = C'(Q) = 3Q^2 - 8Q + 10$$\nTại $Q = 2$:\n$$MC(2) = 3(2)^2 - 8(2) + 10 = 12 - 16 + 10 = 6$$",
        "keyTakeaway": "MC = C'(Q) => MC(2) = 6.",
        "source": "Buổi 8"
      }
    ],
    "quiz": [
      {
        "id": "q-6-1",
        "question": "Cho hàm cầu $Q = 500 - 5P$. Tại mức giá $P = 50$, hệ số co giãn của cầu theo giá $E_{Q,P}$ bằng:",
        "options": [
          "$-1$",
          "$-0.5$",
          "$-2$",
          "$1$"
        ],
        "correctIndex": 0,
        "explanation": "Tại $P = 50$, ta có $Q = 500 - 5(50) = 250$. Đạo hàm $Q'(P) = -5$. Áp dụng công thức: $E_{Q,P} = Q'(P) \\cdot \\frac{P}{Q} = (-5) \\cdot \\frac{50}{250} = -\\frac{250}{250} = -1$.",
        "distractorAnalysis": "Bẫy quên dấu âm dẫn đến đáp án 1. Bẫy quên chia cho Q dẫn đến các hệ số khác.",
        "difficulty": "Cơ bản",
        "source": "Đề thi K51 Mã 204"
      },
      {
        "id": "q-6-2",
        "question": "Biết hàm chi phí của doanh nghiệp là $C(Q) = 2Q^2 + 50$. Chi phí bình quân $AC(Q)$ đạt giá trị nhỏ nhất tại mức sản lượng $Q$ bằng:",
        "options": [
          "$Q = 5$",
          "$Q = 10$",
          "$Q = 25$",
          "$Q = 50$"
        ],
        "correctIndex": 0,
        "explanation": "Chi phí bình quân: $AC(Q) = \\frac{C(Q)}{Q} = 2Q + \\frac{50}{Q}$. Lấy đạo hàm: $AC'(Q) = 2 - \\frac{50}{Q^2} = 0 \\iff 2Q^2 = 50 \\iff Q^2 = 25 \\implies Q = 5$ (vì $Q > 0$). Hoặc giải $MC = AC \\iff 4Q = 2Q + \\frac{50}{Q} \\iff 2Q = \\frac{50}{Q} \\implies Q = 5$.",
        "distractorAnalysis": "Các đáp án khác do tính nhầm đạo hàm hoặc quên căn bậc hai.",
        "difficulty": "Vận dụng",
        "source": "Đề K50 Đợt 2"
      }
    ]
  },
  {
    "id": "chuyen-de-7",
    "order": 7,
    "title": "Chuyên đề 7: Hàm Nhiều Biến, Đạo Hàm Riêng & Hàm Cobb - Douglas",
    "shortTitle": "Đạo hàm riêng & Cobb-Douglas",
    "category": "Giải tích & Kinh tế",
    "badge": "Siêu trọng tâm UEH",
    "examStats": "Chiếm 2.0 - 2.5 điểm trong đề thi tự luận và trắc nghiệm K46 - K51",
    "quote": "Hàm sản xuất Cobb-Douglas Q = A * K^alpha * L^beta: Co giãn riêng theo K là alpha, theo L là beta. Hiệu quả theo quy mô r = alpha + beta (r > 1: tăng, r = 1: không đổi, r < 1: giảm).",
    "lesson": {
      "summary": "Đạo hàm riêng tính đạo hàm theo một biến và giữ cố định các biến còn lại. Vi phân toàn phần df = f_x dx + f_y dy dùng để xấp xỉ biến động của nhiều yếu tố đồng thời. Hàm Cobb-Douglas Q = A K^alpha L^beta có sản phẩm biên MP_K = alpha Q/K, MP_L = beta Q/L, và lợi suất theo quy mô r = alpha + beta tuân theo định lý Euler.",
      "objectives": [
        "Tính thành thạo đạo hàm riêng cấp 1 và cấp 2 của hàm nhiều biến.",
        "Nắm vững định lý Schwarz: f_xy = f_yx khi các đạo hàm cấp hai hỗn hợp liên tục.",
        "Thiết lập vi phân toàn phần df = f_x dx + f_y dy và giải bài toán bù đắp yếu tố sản xuất.",
        "Hiểu sâu hàm Cobb-Douglas: sản phẩm biên, hệ số co giãn riêng và đánh giá hiệu quả theo quy mô."
      ],
      "sections": [
        {
          "title": "1. Đạo Hàm Riêng (Partial Derivatives) & Định Lý Schwarz",
          "content": "Cho hàm số $z = f(x, y)$:\n- **Đạo hàm riêng theo $x$**: $f_x = \\frac{\\partial f}{\\partial x}$ (coi $y$ là hằng số, lấy đạo hàm theo $x$).\n- **Đạo hàm riêng theo $y$**: $f_y = \\frac{\\partial f}{\\partial y}$ (coi $x$ là hằng số, lấy đạo hàm theo $y$).\n- **Đạo hàm riêng cấp hai**: $f_{xx} = (f_x)_x$, $f_{yy} = (f_y)_y$, $f_{xy} = (f_x)_y$, $f_{yx} = (f_y)_x$.\n\n**Định lý Schwarz**: Nếu các đạo hàm hỗn hợp $f_{xy}$ và $f_{yx}$ liên tục trong miền chứa điểm xét thì:\n$$f_{xy} = f_{yx}$$\n(Thứ tự lấy đạo hàm riêng không làm thay đổi kết quả)."
        },
        {
          "title": "2. Vi Phân Toàn Phần & Xấp Xỉ Đa Biến",
          "content": "- **Vi phân toàn phần**:\n$$df = f_x dx + f_y dy$$\n- **Xấp xỉ tuyến tính 2 biến**:\n$$\\Delta f \\approx f_x(x_0, y_0) \\Delta x + f_y(x_0, y_0) \\Delta y$$\n$$f(x_0 + \\Delta x, y_0 + \\Delta y) \\approx f(x_0, y_0) + f_x(x_0, y_0) \\Delta x + f_y(x_0, y_0) \\Delta y$$\n\n**Ứng dụng kinh tế UEH**: Khi vốn tăng $\\Delta K$ và lao động giảm $\\Delta L$, sản lượng thay đổi xấp xỉ:\n$$\\Delta Q \\approx Q_K \\cdot \\Delta K + Q_L \\cdot \\Delta L$$"
        },
        {
          "title": "3. Hàm Sản Xuất Cobb - Douglas",
          "content": "Hàm sản xuất có dạng:\n$$Q(K, L) = A \\cdot K^\\alpha \\cdot L^\\beta \\quad (A > 0, \\alpha > 0, \\beta > 0)$$\ntrong đó $K$ là lượng vốn (Capital), $L$ là lượng lao động (Labor), $A$ là hệ số công nghệ.\n\n- **Sản phẩm biên của vốn (Marginal Product of Capital)**:\n$$MP_K = Q_K = \\frac{\\partial Q}{\\partial K} = A \\alpha K^{\\alpha - 1} L^\\beta = \\alpha \\frac{Q}{K}$$\n- **Sản phẩm biên của lao động (Marginal Product of Labor)**:\n$$MP_L = Q_L = \\frac{\\partial Q}{\\partial L} = A \\beta K^\\alpha L^{\\beta - 1} = \\beta \\frac{Q}{L}$$\n- **Hệ số co giãn riêng**:\n$$E_{Q,K} = Q_K \\cdot \\frac{K}{Q} = \\alpha, \\quad E_{Q,L} = Q_L \\cdot \\frac{L}{Q} = \\beta$$\nÝ nghĩa: Vốn tăng $1\\%$ thì sản lượng tăng $\\alpha \\%$; Lao động tăng $1\\%$ thì sản lượng tăng $\\beta \\%$."
        },
        {
          "title": "4. Lợi Suất Theo Quy Mô & Định Lý Euler",
          "content": "Hàm số đồng nhất bậc $r$: $f(tK, tL) = t^r f(K, L)$. Với hàm Cobb-Douglas, bậc đồng nhất là $r = \\alpha + \\beta$.\n\n**Đánh giá hiệu quả kinh tế theo quy mô (Returns to Scale)**:\n- **$\\alpha + \\beta > 1$**: Hiệu quả **tăng** theo quy mô (Tăng gấp đôi vốn và lao động thì sản lượng tăng hơn gấp đôi).\n- **$\\alpha + \\beta = 1$**: Hiệu quả **không đổi** theo quy mô (Constant returns to scale).\n- **$\\alpha + \\beta < 1$**: Hiệu quả **giảm** theo quy mô (Decreasing returns to scale).\n\n**Định lý Euler cho hàm thuần nhất bậc $r$**:\n$$K \\cdot Q_K + L \\cdot Q_L = r \\cdot Q = (\\alpha + \\beta) \\cdot Q$$"
        }
      ],
      "traps": [
        {
          "title": "Bẫy 1: Nhầm sản phẩm biên MP với hệ số co giãn riêng",
          "wrong": "Sản phẩm biên của vốn MP_K = alpha.",
          "right": "MP_K = Q_K = alpha * (Q / K). Hệ số co giãn riêng mới bằng alpha.",
          "explanation": "Sản phẩm biên có đơn vị đo sản phẩm / đơn vị vốn; còn hệ số co giãn là đại lượng không thứ nguyên đo tỷ lệ phần trăm."
        },
        {
          "title": "Bẫy 2: Nhầm định lý Schwarz",
          "wrong": "f_xy luôn luôn bằng f_yx với mọi hàm số.",
          "right": "f_xy = f_yx khi các đạo hàm cấp hai hỗn hợp LIÊN TỤC.",
          "explanation": "Đề thi lý thuyết thường kiểm tra điều kiện liên tục của các đạo hàm hỗn hợp."
        }
      ],
      "workedExample": {
        "question": "Cho hàm sản xuất $Q = 20 K^{0.4} L^{0.6}$.\na) Đánh giá hiệu quả sản xuất theo quy mô.\nb) Tại điểm $K = 100, L = 50$, nếu vốn tăng 2 đơn vị và lao động giảm 1 đơn vị, hãy dùng vi phân toàn phần ước lượng mức thay đổi sản lượng $\\Delta Q$.",
        "steps": [
          "Câu a: Ta có $\\alpha = 0.4$ và $\\beta = 0.6$. Tổng số mũ: $r = \\alpha + \\beta = 0.4 + 0.6 = 1$.",
          "Kết luận: Hàm sản xuất có hiệu quả **KHÔNG ĐỔI theo quy mô** (Constant Returns to Scale).",
          "Câu b: Tại $K = 100, L = 50$:\n$$Q_0 = 20 \\cdot (100)^{0.4} \\cdot (50)^{0.6} = 20 \\cdot 6.3096 \\cdot 10.4564 \\approx 1320$$ (hoặc tính trực tiếp đạo hàm biên).",
          "Tính $Q_K = 0.4 \\frac{Q_0}{K} = 0.4 \\frac{1320}{100} = 5.28$.",
          "Tính $Q_L = 0.6 \\frac{Q_0}{L} = 0.6 \\frac{1320}{50} = 15.84$.",
          "Biến thiên các yếu tố: $\\Delta K = +2$, $\\Delta L = -1$.",
          "Áp dụng vi phân toàn phần:\n$$\\Delta Q \\approx Q_K \\Delta K + Q_L \\Delta L = 5.28(2) + 15.84(-1) = 10.56 - 15.84 = -5.28$$.",
          "Kết luận: Sản lượng dự kiến giảm khoảng $5.28$ đơn vị."
        ],
        "casioTip": "Có thể dùng phím CALC để lưu giá trị Q_0, sau đó nhân hệ số 0.4/100 và 0.6/50 cực kỳ nhanh chóng."
      }
    },
    "flashcards": [
      {
        "id": "fc-7-1",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Hệ số co giãn riêng của sản lượng theo vốn và lao động trong hàm Cobb-Douglas $Q = A K^\\alpha L^\\beta$ bằng bao nhiêu?",
        "back": "$$E_{Q,K} = \\alpha \\quad \\text{và} \\quad E_{Q,L} = \\beta$$\n\nChính là **số mũ** của các biến tương ứng trong hàm Cobb-Douglas!",
        "keyTakeaway": "Cobb-Douglas: Co giãn theo K là alpha, theo L là beta.",
        "source": "Buổi 8 & TUD_v2"
      },
      {
        "id": "fc-7-2",
        "type": "concept",
        "category": "Định lý",
        "front": "Quy tắc đánh giá lợi suất theo quy mô của hàm Cobb-Douglas $Q = A K^\\alpha L^\\beta$ dựa vào tổng số mũ $r = \\alpha + \\beta$ là gì?",
        "back": "- $\\alpha + \\beta > 1$: Hiệu quả **tăng** theo quy mô.\n- $\\alpha + \\beta = 1$: Hiệu quả **không đổi** theo quy mô.\n- $\\alpha + \\beta < 1$: Hiệu quả **giảm** theo quy mô.",
        "keyTakeaway": "alpha + beta > 1 (tăng), = 1 (không đổi), < 1 (giảm).",
        "source": "Buổi 8"
      },
      {
        "id": "fc-7-3",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức vi phân toàn phần của hàm hai biến $z = f(x, y)$ là gì?",
        "back": "$$df = f_x dx + f_y dy = \\frac{\\partial f}{\\partial x} dx + \\frac{\\partial f}{\\partial y} dy$$\n\nXấp xỉ biến thiên: $\\Delta f \\approx f_x \\Delta x + f_y \\Delta y$.",
        "keyTakeaway": "df = f_x dx + f_y dy.",
        "source": "Buổi 8"
      },
      {
        "id": "fc-7-4",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Định lý Euler cho hàm sản xuất thuần nhất bậc $r$: $K Q_K + L Q_L = ?$",
        "back": "$$K \\cdot Q_K + L \\cdot Q_L = r \\cdot Q$$\n\nVới hàm Cobb-Douglas: $K Q_K + L Q_L = (\\alpha + \\beta) Q$.",
        "keyTakeaway": "Định lý Euler: K*Q_K + L*Q_L = r*Q.",
        "source": "Buổi 8"
      },
      {
        "id": "fc-7-5",
        "type": "concept",
        "category": "Định lý",
        "front": "Định lý Schwarz khẳng định điều gì về các đạo hàm riêng hỗn hợp cấp 2?",
        "back": "Nếu các đạo hàm riêng hỗn hợp $f_{xy}$ và $f_{yx}$ **liên tục** trên miền mở thì:\n$$f_{xy} = f_{yx}$$",
        "keyTakeaway": "Schwarz: Đạo hàm hỗn hợp liên tục => f_xy = f_yx.",
        "source": "Buổi 8"
      }
    ],
    "quiz": [
      {
        "id": "q-7-1",
        "question": "Cho hàm sản xuất $Q(K, L) = 5 K^{0.3} L^{0.8}$. Nhận định nào sau đây là ĐÚNG?",
        "options": [
          "Hàm có hiệu quả tăng theo quy mô và độ co giãn theo vốn là 0.3",
          "Hàm có hiệu quả giảm theo quy mô và độ co giãn theo vốn là 0.8",
          "Hàm có hiệu quả không đổi theo quy mô",
          "Sản lượng biên của lao động là hằng số 0.8"
        ],
        "correctIndex": 0,
        "explanation": "Ta có $\\alpha = 0.3, \\beta = 0.8$. Tổng số mũ $r = \\alpha + \\beta = 0.3 + 0.8 = 1.1 > 1$, do đó hàm có hiệu quả tăng theo quy mô. Hệ số co giãn riêng theo vốn $E_{Q,K} = \\alpha = 0.3$.",
        "distractorAnalysis": "Các đáp án khác tính sai tổng số mũ hoặc nhầm lẫn giữa hệ số co giãn và sản phẩm biên.",
        "difficulty": "Cơ bản",
        "source": "Đề thi K51 Mã 204"
      },
      {
        "id": "q-7-2",
        "question": "Cho hàm số $z = x^2 y^3 - 2xy$. Đạo hàm riêng hỗn hợp cấp hai $x_{xy}$ bằng:",
        "options": [
          "$6xy^2 - 2$",
          "$2y^3 - 2$",
          "$3x^2 y^2 - 2$",
          "$6x^2 y$"
        ],
        "correctIndex": 0,
        "explanation": "Lấy đạo hàm theo $x$: $x_x = 2x y^3 - 2y$. Lấy tiếp đạo hàm theo $y$: $x_{xy} = (x_x)_y = 2x(3y^2) - 2 = 6xy^2 - 2$. (Nếu tính $x_y = 3x^2 y^2 - 2x$ rồi lấy theo $x$ cũng ra $6xy^2 - 2$).",
        "distractorAnalysis": "Phương án B là x_x. Phương án C là x_y.",
        "difficulty": "Cơ bản",
        "source": "TUD_v2 Trang 29"
      }
    ]
  },
  {
    "id": "chuyen-de-8",
    "order": 8,
    "title": "Chuyên đề 8: Cực Trị Hàm Hai Biến Không Ràng Buộc (Hessian)",
    "shortTitle": "Cực trị tự do (Hessian)",
    "category": "Giải tích & Kinh tế",
    "badge": "Điểm 9-10",
    "examStats": "Chiếm 1.5 - 2.0 điểm tự luận hoặc trắc nghiệm kiểm tra điểm yên ngựa",
    "quote": "Công thức Hessian D = A*C - B^2: D > 0 và A > 0 => CỰC TIỂU. D > 0 và A < 0 => CỰC ĐẠI. D < 0 => ĐIỂM YÊN NGỰA. D = 0 => Không kết luận!",
    "lesson": {
      "summary": "Tìm cực trị tự do của hàm hai biến: Bước 1 giải hệ điểm dừng f_x = 0, f_y = 0. Bước 2 tính ma trận Hessian H = ((f_xx, f_xy), (f_yx, f_yy)) và biệt thức D = AC - B^2. Phân loại theo dấu của D và A = f_xx. Lưu ý điểm dừng chỉ là điều kiện cần; khi D = 0 định lý Hessian không áp dụng được.",
      "objectives": [
        "Tìm chính xác tất cả các điểm dừng của hàm số hai biến từ hệ đạo hàm riêng.",
        "Thành lập ma trận Hessian và tính biệt thức D = f_xx * f_yy - (f_xy)^2.",
        "Phân loại cực đại địa phương, cực tiểu địa phương và điểm yên ngựa (saddle point).",
        "Giải bài toán tối đa hóa lợi nhuận của doanh nghiệp sản xuất hai loại sản phẩm."
      ],
      "sections": [
        {
          "title": "1. Điều Kiện Cần: Tìm Điểm Dừng (Stationary Points)",
          "content": "Cho hàm số $z = f(x, y)$ có các đạo hàm riêng liên tục trên miền mở.\n\n**Điều kiện cần của cực trị**:\nNếu hàm số đạt cực trị tại điểm $M_0(x_0, y_0)$ thì điểm đó phải là **điểm dừng**, tức là thỏa mãn hệ phương trình:\n$$\\begin{cases} f_x(x, y) = 0 \\\\ f_y(x, y) = 0 \\end{cases}$$\n**Lưu ý**: Điểm dừng chỉ là ứng viên, KHÔNG CHẮC CHẮN là điểm cực trị."
        },
        {
          "title": "2. Điều Kiện Đủ: Ma Trận Hessian & Phân Loại Cực Trị",
          "content": "Tại mỗi điểm dừng $M_0(x_0, y_0)$, ta tính các đạo hàm riêng cấp hai:\n$$A = f_{xx}(M_0), \\quad B = f_{xy}(M_0), \\quad C = f_{yy}(M_0)$$\nMa trận Hessian:\n$$H = \\begin{pmatrix} f_{xx} & f_{xy} \\\\ f_{yx} & f_{yy} \\end{pmatrix} = \\begin{pmatrix} A & B \\\\ B & C \\end{pmatrix}$$\nBiệt thức Hessian: $D = \\det H = A \\cdot C - B^2$.\n\n**Quy tắc phán quyết 4 trường hợp**:\n1. **$D > 0$ và $A > 0$** (khi đó $C$ cũng $> 0$): $M_0$ là điểm **CỰC TIỂU ĐỊA PHƯƠNG**.\n2. **$D > 0$ và $A < 0$** (khi đó $C$ cũng $< 0$): $M_0$ là điểm **CỰC ĐẠI ĐỊA PHƯƠNG**.\n3. **$D < 0$**: $M_0$ là **ĐIỂM YÊN NGỰA** (Saddle Point - không phải cực trị!).\n4. **$D = 0$**: **CHƯA THỂ KẾT LUẬN** (phép thử Hessian bất lực, cần dùng định nghĩa hoặc phương pháp khác)."
        },
        {
          "title": "3. Ứng Dụng Kinh Tế: Tối Đa Hóa Lợi Nhuận Hai Sản Phẩm",
          "content": "Một doanh nghiệp sản xuất 2 loại sản phẩm với sản lượng $Q_1, Q_2$. Hàm tổng doanh thu $R(Q_1, Q_2)$ và tổng chi phí $C(Q_1, Q_2)$.\n\nHàm lợi nhuận: $\\pi(Q_1, Q_2) = R(Q_1, Q_2) - C(Q_1, Q_2)$.\n- Điều kiện cần: $\\frac{\\partial \\pi}{\\partial Q_1} = 0$ và $\\frac{\\partial \\pi}{\\partial Q_2} = 0$.\n- Điều kiện đủ để đạt cực đại lợi nhuận: Biệt thức Hessian của hàm lợi nhuận thỏa mãn $D > 0$ và $\\pi_{Q_1 Q_1} < 0$."
        }
      ],
      "traps": [
        {
          "title": "Bẫy 1: Thấy D < 0 nhưng A > 0 vội kết luận cực tiểu",
          "wrong": "D < 0 và f_xx > 0 kết luận hàm đạt cực tiểu.",
          "right": "Khi D < 0 thì ĐIỂM ĐÓ LÀ ĐIỂM YÊN NGỰA, bất kể f_xx mang dấu gì!",
          "explanation": "Điều kiện tiên quyết để có cực trị là D > 0. Nếu D < 0 thì theo một hướng nó lồi, theo hướng khác nó lõm (hình yên ngựa), không thể là cực trị."
        },
        {
          "title": "Bẫy 2: Thấy D = 0 kết luận không có cực trị",
          "wrong": "D = 0 kết luận hàm số không có cực trị.",
          "right": "D = 0 nghĩa là phép thử chưa cho kết luận (có thể có hoặc không có cực trị).",
          "explanation": "Ví dụ f(x, y) = x^4 + y^4 có D = 0 tại (0, 0) nhưng (0, 0) vẫn là điểm cực tiểu toàn cục."
        }
      ],
      "workedExample": {
        "question": "Tìm và phân loại cực trị của hàm số: $f(x, y) = x^3 + y^3 - 3xy$.",
        "steps": [
          "Bước 1: Tìm các đạo hàm riêng cấp 1:\n$f_x = 3x^2 - 3y$, $f_y = 3y^2 - 3x$.",
          "Bước 2: Giải hệ điểm dừng:\n$$\\begin{cases} 3x^2 - 3y = 0 \\\\ 3y^2 - 3x = 0 \\end{cases} \\iff \\begin{cases} y = x^2 \\\\ x^4 - x = 0 \\end{cases} \\iff x(x^3 - 1) = 0$$\nTa được 2 điểm dừng: $M_1(0, 0)$ và $M_2(1, 1)$.",
          "Bước 3: Tính các đạo hàm riêng cấp hai:\n$A = f_{xx} = 6x$, $B = f_{xy} = -3$, $C = f_{yy} = 6y$.\nBiệt thức: $D = AC - B^2 = (6x)(6y) - (-3)^2 = 36xy - 9$.",
          "Bước 4: Xét tại từng điểm dừng:\n- Tại $M_1(0, 0)$: $D = 36(0) - 9 = -9 < 0 \\implies M_1(0, 0)$ là **ĐIỂM YÊN NGỰA**.\n- Tại $M_2(1, 1)$: $D = 36(1)(1) - 9 = 27 > 0$. Và $A = 6(1) = 6 > 0$.\nSuy ra $M_2(1, 1)$ là điểm **CỰC TIỂU ĐỊA PHƯƠNG**.",
          "Giá trị cực tiểu: $f(1, 1) = 1^3 + 1^3 - 3(1)(1) = -1$."
        ],
        "casioTip": "Phương trình bậc 4: x^4 - x = 0 có thể bấm Mode 9 -> 2 -> 4 trên máy Casio để tìm đầy đủ các nghiệm thực."
      }
    },
    "flashcards": [
      {
        "id": "fc-8-1",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức tính biệt thức Hessian D cho hàm hai biến là gì?",
        "back": "$$D = f_{xx} \\cdot f_{yy} - (f_{xy})^2 = A \\cdot C - B^2$$\n\ntại điểm dừng $M_0$ thỏa $f_x = 0, f_y = 0$.",
        "keyTakeaway": "D = A*C - B^2.",
        "source": "Buổi 8 & TUD_v2"
      },
      {
        "id": "fc-8-2",
        "type": "concept",
        "category": "Định lý",
        "front": "Quy tắc phán quyết cực đại địa phương theo biệt thức Hessian là gì?",
        "back": "$$D > 0 \\quad \\text{và} \\quad A = f_{xx} < 0$$\n\n(Biệt thức dương và đạo hàm cấp hai theo x âm).",
        "keyTakeaway": "Cực đại <=> D > 0 và A < 0.",
        "source": "TUD_v2"
      },
      {
        "id": "fc-8-3",
        "type": "concept",
        "category": "Định lý",
        "front": "Quy tắc phán quyết cực tiểu địa phương theo biệt thức Hessian là gì?",
        "back": "$$D > 0 \\quad \\text{và} \\quad A = f_{xx} > 0$$\n\n(Biệt thức dương và đạo hàm cấp hai theo x dương).",
        "keyTakeaway": "Cực tiểu <=> D > 0 và A > 0.",
        "source": "TUD_v2"
      },
      {
        "id": "fc-8-4",
        "type": "concept",
        "category": "Định lý",
        "front": "Khi biệt thức Hessian $D < 0$ thì điểm dừng được gọi là gì?",
        "back": "Là **ĐIỂM YÊN NGỰA** (Saddle Point).\n\nHàm số **KHÔNG ĐẠT CỰC TRỊ** tại điểm này!",
        "keyTakeaway": "D < 0 => ĐIỂM YÊN NGỰA (không có cực trị).",
        "source": "TUD_v2 & Đề thi"
      },
      {
        "id": "fc-8-5",
        "type": "trap",
        "category": "Bẫy đề thi",
        "front": "Khi biệt thức Hessian D = 0 thì kết luận điều gì?",
        "back": "**CHƯA THỂ KẾT LUẬN ĐƯỢC!**\n\nPhép thử bằng đạo hàm cấp hai không có hiệu lực, hàm số có thể có cực đại, cực tiểu hoặc không có cực trị. Cần dùng phương pháp khác để xét.",
        "keyTakeaway": "D = 0 => Không kết luận được bằng Hessian.",
        "source": "TUD_v2"
      }
    ],
    "quiz": [
      {
        "id": "q-8-1",
        "question": "Cho hàm số $f(x, y)$ có điểm dừng $M_0(1, 2)$. Tại điểm này, các đạo hàm riêng cấp hai là $f_{xx} = -3$, $f_{xy} = 2$, $f_{yy} = -4$. Khẳng định nào sau đây là ĐÚNG?",
        "options": [
          "$M_0$ là điểm cực đại địa phương",
          "$M_0$ là điểm cực tiểu địa phương",
          "$M_0$ là điểm yên ngựa",
          "Chưa thể kết luận được cực trị"
        ],
        "correctIndex": 0,
        "explanation": "Tính biệt thức Hessian: $D = A C - B^2 = (-3)(-4) - (2)^2 = 12 - 4 = 8 > 0$. Vì $D > 0$ và $A = f_{xx} = -3 < 0$, nên $M_0$ là điểm CỰC ĐẠI ĐỊA PHƯƠNG.",
        "distractorAnalysis": "Nếu tính nhầm D = (-3)(-4) + 4 = 16 hoặc nhầm dấu A sẽ chọn sai cực tiểu.",
        "difficulty": "Cơ bản",
        "source": "Đề thi K50 Đợt 1"
      }
    ]
  },
  {
    "id": "chuyen-de-9",
    "order": 9,
    "title": "Chuyên đề 9: Cực Trị Có Ràng Buộc – Nhân Tử Lagrange & Hessian Biên",
    "shortTitle": "Nhân tử Lagrange & Hessian biên",
    "category": "Giải tích & Kinh tế",
    "badge": "Siêu kinh điển tự luận",
    "examStats": "Chiếm 3.0 điểm tự luận trong hầu hết các đề thi Toán Ứng Dụng K46 - K51",
    "quote": "Bí quyết giải Lagrange: Lập hàm L = f + lambda*(c - g). Giải hệ 3 phương trình đạo hàm bằng 0. Dùng định thức Hessian biên để kết luận: det(H_bar) > 0 => CỰC ĐẠI, det(H_bar) < 0 => CỰC TIỂU.",
    "lesson": {
      "summary": "Bài toán tối ưu hàm mục tiêu f(x, y) thỏa mãn ràng buộc đẳng thức g(x, y) = c. Lập hàm Lagrange L(x, y, lambda) = f(x, y) + lambda [c - g(x, y)]. Giải hệ điều kiện dừng L_x = 0, L_y = 0, L_lambda = 0. Phân loại cực trị bằng ma trận Hessian biên 3x3: định thức det(H_bar) > 0 tương ứng Cực đại, det(H_bar) < 0 tương ứng Cực tiểu. Ứng dụng: Cực tiểu hóa chi phí wL + rK đạt sản lượng Q_0.",
      "objectives": [
        "Thiết lập chính xác hàm Lagrange cho bài toán tối ưu có ràng buộc đẳng thức.",
        "Giải thành thạo hệ phương trình phi tuyến tìm điểm dừng (x_0, y_0, lambda_0).",
        "Lập ma trận Hessian biên 3x3 và tính định thức det(H_bar) để kết luận cực trị chuẩn xác.",
        "Giải quyết bài toán kinh tế kinh điển: phân bổ sản lượng 2 nhà máy, tối thiểu chi phí sản xuất và tối đa hóa hữu dụng."
      ],
      "sections": [
        {
          "title": "1. Bài Toán & Thiết Lập Hàm Lagrange",
          "content": "Bài toán: Tìm cực trị của hàm mục tiêu $f(x, y)$ thỏa mãn ràng buộc $g(x, y) = c$.\n\n**Hàm Lagrange**:\n$$\\mathcal{L}(x, y, \\lambda) = f(x, y) + \\lambda [c - g(x, y)]$$\n(Hoặc $\\mathcal{L} = f(x, y) - \\lambda [g(x, y) - c]$, chỉ khác dấu của nhân tử $\\lambda$, kết quả điểm tối ưu $(x, y)$ hoàn toàn không đổi).\n\n**Hệ điều kiện cần (Tìm điểm dừng)**:\n$$\\begin{cases} \\mathcal{L}_x = f_x - \\lambda g_x = 0 \\\\ \\mathcal{L}_y = f_y - \\lambda g_y = 0 \\\\ \\mathcal{L}_\\lambda = c - g(x, y) = 0 \\end{cases} \\iff \\begin{cases} f_x = \\lambda g_x \\\\ f_y = \\lambda g_y \\\\ g(x, y) = c \\end{cases}$$\nTừ hai phương trình đầu ta có tỉ số cân bằng: $\\frac{f_x}{g_x} = \\frac{f_y}{g_y} = \\lambda$."
        },
        {
          "title": "2. Ma Trận Hessian Biên (Bordered Hessian) & Điều Kiện Đủ",
          "content": "Để kiểm tra điểm dừng $M_0(x_0, y_0, \\lambda_0)$ là cực đại hay cực tiểu, ta lập ma trận Hessian biên ký hiệu là $\\overline{H}$:\n$$\\overline{H} = \\begin{pmatrix} 0 & g_x & g_y \\\\ g_x & \\mathcal{L}_{xx} & \\mathcal{L}_{xy} \\\\ g_y & \\mathcal{L}_{yx} & \\mathcal{L}_{yy} \\end{pmatrix}$$\n\n**Định lý phán quyết dấu định thức Hessian biên**:\n- Nếu $\\det \\overline{H} > 0$: Hàm số đạt **CỰC ĐẠI ĐỊA PHƯƠNG** tại $M_0$.\n- Nếu $\\det \\overline{H} < 0$: Hàm số đạt **CỰC TIỂU ĐỊA PHƯƠNG** tại $M_0$.\n\n**Công thức tính nhanh $\\det \\overline{H}$ cho ma trận $3 \\times 3$**:\n$$\\det \\overline{H} = 2 g_x g_y \\mathcal{L}_{xy} - (g_y)^2 \\mathcal{L}_{xx} - (g_x)^2 \\mathcal{L}_{yy}$$"
        },
        {
          "title": "3. Ứng Dụng Kinh Tế: Tối Thiểu Hóa Chi Phí Sản Xuất",
          "content": "Doanh nghiệp sản xuất sản phẩm với hàm sản xuất $Q = Q(K, L)$. Giá thuê vốn là $r$, giá thuê lao động là $w$. Cần sản xuất sản lượng mục tiêu $Q_0$ với chi phí nhỏ nhất:\n$$\\min C(K, L) = rK + wL \\quad \\text{s.t.} \\quad Q(K, L) = Q_0$$\nHàm Lagrange: $\\mathcal{L}(K, L, \\lambda) = rK + wL + \\lambda [Q_0 - Q(K, L)]$.\n\nĐiều kiện cần:\n$$\\begin{cases} r - \\lambda Q_K = 0 \\\\ w - \\lambda Q_L = 0 \\\\ Q(K, L) = Q_0 \\end{cases} \\implies \\frac{Q_K}{r} = \\frac{Q_L}{w} = \\frac{1}{\\lambda}$$\n**Ý nghĩa kinh tế**: Tại điểm tối ưu chi phí, **tỷ lệ sản phẩm biên trên giá của từng yếu tố sản xuất phải bằng nhau**!"
        }
      ],
      "traps": [
        {
          "title": "Bẫy 1: Ngược dấu Hessian biên",
          "wrong": "det(H_bar) > 0 là cực tiểu, det(H_bar) < 0 là cực đại.",
          "right": "Với ma trận Hessian biên chuẩn: det(H_bar) > 0 là CỰC ĐẠI, det(H_bar) < 0 là CỰC TIỂU.",
          "explanation": "Ma trận Hessian biên có hàng đầu là đạo hàm ràng buộc (ngược dấu với ma trận Hessian tự do thông thường). Hãy luôn khắc sâu: Dương là CỰC ĐẠI, Âm là CỰC TIỂU!"
        },
        {
          "title": "Bẫy 2: Quên kiểm tra điều kiện ràng buộc kinh tế",
          "wrong": "Lấy cả nghiệm âm K = -5, L = -10.",
          "right": "Trong kinh tế, lượng vốn K và lao động L bắt buộc phải dương: K > 0, L > 0.",
          "explanation": "Phải loại nghiệm âm ngay từ bước giải hệ phương trình."
        }
      ],
      "workedExample": {
        "question": "Dùng phương pháp nhân tử Lagrange, hãy tìm cực trị của hàm số $f(x, y) = 2x + 3y$ với ràng buộc $x^2 + y^2 = 13$.",
        "steps": [
          "Bước 1: Thiết lập hàm Lagrange:\n$$\\mathcal{L}(x, y, \\lambda) = 2x + 3y + \\lambda(13 - x^2 - y^2)$$",
          "Bước 2: Hệ phương trình điểm dừng:\n$$\\begin{cases} \\mathcal{L}_x = 2 - 2\\lambda x = 0 \\\\ \\mathcal{L}_y = 3 - 2\\lambda y = 0 \\\\ x^2 + y^2 = 13 \\end{cases} \\iff \\begin{cases} x = \\frac{1}{\\lambda} \\\\ y = \\frac{3}{2\\lambda} \\\\ \\left( \\frac{1}{\\lambda} \\right)^2 + \\left( \\frac{3}{2\\lambda} \\right)^2 = 13 \\end{cases}$$",
          "Bước 3: Giải tìm $\\lambda$:\n$$\\frac{1}{\\lambda^2} + \\frac{9}{4\\lambda^2} = \\frac{13}{4\\lambda^2} = 13 \\iff 4\\lambda^2 = 1 \\iff \\lambda = \\pm \\frac{1}{2}$$.\n- Với $\\lambda_1 = \\frac{1}{2} \\implies x_1 = 2, y_1 = 3$.\n- Với $\\lambda_2 = -\\frac{1}{2} \\implies x_2 = -2, y_2 = -3$.",
          "Bước 4: Kiểm tra điều kiện đủ bằng Hessian biên:\n$g(x, y) = x^2 + y^2 \\implies g_x = 2x, g_y = 2y$.\n$\\mathcal{L}_{xx} = -2\\lambda$, $\\mathcal{L}_{xy} = 0$, $\\mathcal{L}_{yy} = -2\\lambda$.\nMa trận Hessian biên:\n$$\\overline{H} = \\begin{pmatrix} 0 & 2x & 2y \\\\ 2x & -2\\lambda & 0 \\\\ 2y & 0 & -2\\lambda \\end{pmatrix}$$\nTính định thức: $\\det \\overline{H} = -(2y)^2(-2\\lambda) - (2x)^2(-2\\lambda) = 2\\lambda (4x^2 + 4y^2) = 8\\lambda(x^2 + y^2) = 8\\lambda(13) = 104\\lambda$.",
          "Bước 5: Kết luận:\n- Tại $(2, 3, 1/2)$: $\\det \\overline{H} = 104(1/2) = 52 > 0 \\implies$ Hàm đạt **CỰC ĐẠI** tại $(2, 3)$, giá trị cực đại $f(2, 3) = 2(2) + 3(3) = 13$.\n- Tại $(-2, -3, -1/2)$: $\\det \\overline{H} = 104(-1/2) = -52 < 0 \\implies$ Hàm đạt **CỰC TIỂU** tại $(-2, -3)$, giá trị cực tiểu $f(-2, -3) = -13$."
        ],
        "casioTip": "Với bài toán ràng buộc đường tròn x^2 + y^2 = R^2, có thể dùng bất đẳng thức Bunhiacopxki để nhẩm nhanh kết quả: (2x + 3y)^2 <= (2^2 + 3^2)(x^2 + y^2) = 13 * 13 = 169 => -13 <= 2x + 3y <= 13."
      }
    },
    "flashcards": [
      {
        "id": "fc-9-1",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Cấu trúc hàm Lagrange cho bài toán tối ưu f(x, y) với ràng buộc g(x, y) = c là gì?",
        "back": "$$\\mathcal{L}(x, y, \\lambda) = f(x, y) + \\lambda [c - g(x, y)]$$\n\nĐiều kiện cần:\n$$\\mathcal{L}_x = 0, \\quad \\mathcal{L}_y = 0, \\quad \\mathcal{L}_\\lambda = 0$$",
        "keyTakeaway": "Hàm Lagrange: L = f(x, y) + lambda*[c - g(x, y)].",
        "source": "FINAL 2807 & TUD_v2"
      },
      {
        "id": "fc-9-2",
        "type": "concept",
        "category": "Định lý",
        "front": "Quy tắc phán quyết cực trị từ định thức Hessian biên $\\det \\overline{H}$ là gì?",
        "back": "- $\\det \\overline{H} > 0 \\implies$ Điểm **CỰC ĐẠI ĐỊA PHƯƠNG**.\n- $\\det \\overline{H} < 0 \\implies$ Điểm **CỰC TIỂU ĐỊA PHƯƠNG**.\n\n(Lưu ý: DƯƠNG là cực đại, ÂM là cực tiểu!).",
        "keyTakeaway": "det(H_bar) > 0 => CỰC ĐẠI; det(H_bar) < 0 => CỰC TIỂU.",
        "trapWarning": "Rất nhiều sinh viên nhầm với Hessian tự do (nghĩ dương là cực tiểu). Hãy cẩn thận!",
        "source": "TUD_v2 & Đề K46-K51"
      },
      {
        "id": "fc-9-3",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức tính nhanh định thức Hessian biên cấp 3 là gì?",
        "back": "$$\\det \\overline{H} = 2 g_x g_y \\mathcal{L}_{xy} - (g_y)^2 \\mathcal{L}_{xx} - (g_x)^2 \\mathcal{L}_{yy}$$\n\n(Khi $\\mathcal{L}_{xy} = 0$, định thức chỉ còn: $-(g_y)^2 \\mathcal{L}_{xx} - (g_x)^2 \\mathcal{L}_{yy}$).",
        "keyTakeaway": "det(H_bar) = 2*gx*gy*L_xy - gy^2*L_xx - gx^2*L_yy.",
        "source": "FINAL 2807 Trang 1"
      },
      {
        "id": "fc-9-4",
        "type": "concept",
        "category": "Ứng dụng kinh tế",
        "front": "Điều kiện tối ưu chi phí khi thuê 2 yếu tố sản xuất vốn K (giá r) và lao động L (giá w) là gì?",
        "back": "$$\\frac{MP_K}{r} = \\frac{MP_L}{w}$$\n\n(Năng suất biên trên một đồng chi phí của vốn phải bằng năng suất biên trên một đồng chi phí của lao động).",
        "keyTakeaway": "Tối ưu chi phí: MP_K / r = MP_L / w.",
        "source": "Buổi 8 & TUD_v2"
      }
    ],
    "quiz": [
      {
        "id": "q-9-1",
        "question": "Trong bài toán tìm cực trị có ràng buộc bằng phương pháp Lagrange, tại điểm dừng $M_0$ ta tính được định thức Hessian biên $\\det \\overline{H} = 15 > 0$. Kết luận nào sau đây là ĐÚNG?",
        "options": [
          "Hàm số đạt cực đại địa phương có điều kiện tại $M_0$",
          "Hàm số đạt cực tiểu địa phương có điều kiện tại $M_0$",
          "$M_0$ là điểm yên ngựa",
          "Chưa thể kết luận được cực trị"
        ],
        "correctIndex": 0,
        "explanation": "Theo định lý về ma trận Hessian biên, với bài toán 2 biến 1 ràng buộc đẳng thức, nếu định thức Hessian biên $\\det \\overline{H} > 0$ thì điểm dừng là điểm CỰC ĐẠI ĐỊA PHƯƠNG có điều kiện.",
        "distractorAnalysis": "Phương án B là bẫy phổ biến do nhầm quy ước dấu với ma trận Hessian tự do.",
        "difficulty": "Cơ bản",
        "source": "Đề thi K51 Mã 204"
      }
    ]
  },
  {
    "id": "chuyen-de-10",
    "order": 10,
    "title": "Chuyên đề 10: Tích Phân & Phương Trình Vi Phân Cấp 1",
    "shortTitle": "Tích phân & PTVP cấp 1",
    "category": "Giải tích & Kinh tế",
    "badge": "Cải cách UEH mới nhất",
    "examStats": "Chiếm 2.0 - 2.5 điểm tự luận và trắc nghiệm. ĐÃ BỎ TOÀN BỘ PTVP CẤP 2!",
    "quote": "Lưu ý quan trọng: Phương trình vi phân cấp 2 đã được BỎ khỏi đề thi UEH. Trọng tâm tuyệt đối: PTVP tách biến, PTVP tuyến tính cấp 1 bằng nhân tử tích phân mu(x) = e^(int p(x)dx), và mô hình tăng trưởng mũ Solow / dân số.",
    "lesson": {
      "summary": "Tích phân là phép toán ngược của đạo hàm. Phương trình vi phân cấp 1 có 2 dạng chính trong đề thi: (1) Tách biến dy/g(y) = f(x)dx (đừng quên xét nghiệm hằng g(y) = 0); (2) Tuyến tính cấp 1 y' + p(x)y = q(x) giải bằng nhân tử tích phân mu(x) = e^(int p(x)dx). Ứng dụng mô hình tăng trưởng mũ N(t) = N_0 * e^(kt) và thời gian tăng gấp đôi T_2 = ln(2) / k.",
      "objectives": [
        "Nắm vững các công thức tích phân cơ bản và tích phân từng phần: int u dv = uv - int v du.",
        "Giải thành thạo phương trình vi phân tách biến dy / g(y) = f(x) dx.",
        "Áp dụng chuẩn xác phương pháp nhân tử tích phân giải PTVP tuyến tính cấp 1: y' + p(x)y = q(x).",
        "Giải quyết trọn vẹn bài toán mô hình tăng trưởng kinh tế: tích lũy vốn Solow, tăng trưởng dân số và doanh số."
      ],
      "sections": [
        {
          "title": "1. Các Công Thức Tích Phân Bắt Buộc Phải Thuộc",
          "content": "- $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$ (với $n \\ne -1$).\n- $\\int \\frac{1}{x} dx = \\ln |x| + C$ (với $x \\ne 0$).\n- $\\int e^{ax} dx = \\frac{1}{a} e^{ax} + C$ (với $a \\ne 0$).\n- $\\int a^x dx = \\frac{a^x}{\\ln a} + C$.\n- **Tích phân từng phần (Integration by Parts)**:\n$$\\int u \\, dv = uv - \\int v \\, du$$\nThứ tự ưu tiên đặt $u$: **\"Nhất lô (logarit), nhì đa (đa thức), tam lượng (lượng giác), tứ mũ (hàm mũ)\"**."
        },
        {
          "title": "2. Phương Trình Vi Phân Tách Biến (Separable ODE)",
          "content": "Dạng tổng quát: $y' = f(x) \\cdot g(y) \\iff \\frac{dy}{dx} = f(x) g(y)$.\n\n**Phương pháp giải**:\n- **Bước 1**: Xét $g(y) = 0 \\implies y = y_0$ (nghiệm hằng số, không được bỏ sót!).\n- **Bước 2**: Khi $g(y) \\ne 0$, chuyển tất cả biến $y$ về vế trái, biến $x$ về vế phải:\n$$\\frac{dy}{g(y)} = f(x) dx$$\n- **Bước 3**: Lấy tích phân 2 vế:\n$$\\int \\frac{dy}{g(y)} = \\int f(x) dx + C$$\n- **Bước 4**: Rút $y$ theo $x$ và tìm $C$ từ điều kiện đầu $y(x_0) = y_0$ nếu có."
        },
        {
          "title": "3. Phương Trình Vi Phân Tuyến Tính Cấp 1",
          "content": "Dạng chuẩn:\n$$y' + p(x)y = q(x)$$\n\n**Phương pháp Nhân tử tích phân (Integrating Factor)**:\n1. Tìm nhân tử tích phân:\n$$\\mu(x) = e^{\\int p(x) dx}$$\n(Chọn một nguyên hàm không cần cộng hằng số $C$).\n2. Nhân cả 2 vế của phương trình với $\\mu(x)$:\n$$\\mu(x) y' + \\mu(x) p(x) y = \\mu(x) q(x) \\iff [\\mu(x) \\cdot y]' = \\mu(x) q(x)$$\n3. Lấy tích phân 2 vế:\n$$\\mu(x) \\cdot y = \\int \\mu(x) q(x) dx + C$$\n4. Suy ra nghiệm tổng quát:\n$$y(x) = e^{-\\int p(x)dx} \\left( \\int e^{\\int p(x)dx} q(x) dx + C \\right)$$"
        },
        {
          "title": "4. Mô Hình Tăng Trưởng Mũ Kinh Tế & Thời Gian Gấp Đôi",
          "content": "Tốc độ thay đổi tỷ lệ thuận với quy mô hiện tại: $\\frac{dN}{dt} = k N(t)$.\nNghiệm tổng quát:\n$$N(t) = N_0 e^{kt} \\quad (N_0 = N(0))$$\n\n- **Xác định hằng số tăng trưởng $k$** từ 2 mốc thời gian $t_1, t_2$:\n$$k = \\frac{\\ln(N(t_2) / N(t_1))}{t_2 - t_1}$$\n- **Thời gian tăng gấp đôi (Doubling Time)** ($N(T_2) = 2N_0$):\n$$2 N_0 = N_0 e^{k T_2} \\iff e^{k T_2} = 2 \\iff k T_2 = \\ln 2 \\iff T_2 = \\frac{\\ln 2}{k} \\approx \\frac{0.693}{k}$$\n(Với quá trình suy giảm / bán rã $k < 0$: Thời gian bán hủy $T_{1/2} = \\frac{\\ln 2}{|k|}$)."
        }
      ],
      "traps": [
        {
          "title": "Bẫy 1: Quên nghiệm hằng khi chia trong PTVP tách biến",
          "wrong": "Giải y' = 2xy chia ngay cho y được dy/y = 2xdx mà bỏ qua y = 0.",
          "right": "Phải xét riêng y = 0 xem có là nghiệm của phương trình không, sau đó mới chia khi y ≠ 0.",
          "explanation": "y = 0 là một nghiệm thực sự của phương trình vi phân y' = 2xy, bỏ sót sẽ bị trừ điểm tự luận."
        },
        {
          "title": "Bẫy 2: Nhầm dấu trong nhân tử tích phân",
          "wrong": "Viết y = e^(int p dx) [ int e^(-int p dx) q dx + C ].",
          "right": "Công thức đúng: y = e^(-int p dx) [ int e^(int p dx) q dx + C ].",
          "explanation": "Nhân tử tích phân là e^(int p dx), khi chia sang vế phải thì số mũ đổi dấu thành e^(-int p dx)."
        }
      ],
      "workedExample": {
        "question": "Giải phương trình vi phân tuyến tính cấp 1: $y' - \\frac{2}{x} y = x^2$ với điều kiện đầu $y(1) = 2$ ($x > 0$).",
        "steps": [
          "Bước 1: Phương trình đã ở dạng chuẩn $y' + p(x)y = q(x)$ với $p(x) = -\\frac{2}{x}$ và $q(x) = x^2$.",
          "Bước 2: Tìm nhân tử tích phân:\n$$\\int p(x) dx = \\int -\\frac{2}{x} dx = -2 \\ln x = \\ln(x^{-2}) = \\ln\\left(\\frac{1}{x^2}\\right)$$\n$$\\mu(x) = e^{\\ln(1/x^2)} = \\frac{1}{x^2}$$.",
          "Bước 3: Nhân hai vế phương trình với $\\mu(x) = \\frac{1}{x^2}$:\n$$\\frac{1}{x^2} y' - \\frac{2}{x^3} y = 1 \\iff \\left( \\frac{1}{x^2} y \\right)' = 1$$.",
          "Bước 4: Lấy tích phân 2 vế:\n$$\\frac{1}{x^2} y = \\int 1 dx = x + C \\iff y = x^3 + C x^2$$.",
          "Bước 5: Tìm $C$ từ điều kiện đầu $y(1) = 2$:\n$$2 = 1^3 + C(1)^2 = 1 + C \\implies C = 1$$.",
          "Kết luận: Nghiệm riêng cần tìm là $y = x^3 + x^2$."
        ],
        "casioTip": "Kiểm tra nghiệm: Thay y = x^3 + x^2 => y' = 3x^2 + 2x. Vế trái: (3x^2 + 2x) - (2/x)(x^3 + x^2) = 3x^2 + 2x - 2x^2 - 2x = x^2 (khớp vế phải!). Điều kiện đầu: y(1) = 1 + 1 = 2 (chuẩn xác!)."
      }
    },
    "flashcards": [
      {
        "id": "fc-10-1",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Nhân tử tích phân $\\mu(x)$ trong phương trình vi phân tuyến tính cấp 1 $y' + p(x)y = q(x)$ là gì?",
        "back": "$$\\mu(x) = e^{\\int p(x) dx}$$\n\nNghiệm tổng quát:\n$$y(x) = \\frac{1}{\\mu(x)} \\left( \\int \\mu(x) q(x) dx + C \\right)$$",
        "keyTakeaway": "mu(x) = e^(int p(x)dx) => y = (1/mu) * [ int (mu * q) dx + C ].",
        "source": "Buổi 9 & Buổi 10"
      },
      {
        "id": "fc-10-2",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức thời gian tăng gấp đôi $T_2$ trong mô hình tăng trưởng mũ $N(t) = N_0 e^{kt}$ ($k > 0$) là gì?",
        "back": "$$T_2 = \\frac{\\ln 2}{k} \\approx \\frac{0.693}{k}$$\n\nXuất phát từ phương trình $N_0 e^{k T_2} = 2 N_0 \\iff e^{k T_2} = 2 \\iff k T_2 = \\ln 2$.",
        "keyTakeaway": "Thời gian gấp đôi: T_2 = ln(2) / k.",
        "source": "Buổi 10 & TUD_v2"
      },
      {
        "id": "fc-10-3",
        "type": "formula",
        "category": "Công thức vàng",
        "front": "Công thức tích phân từng phần: $\\int u \\, dv = ?$",
        "back": "$$\\int u \\, dv = u v - \\int v \\, du$$\n\nThứ tự ưu tiên đặt $u$: Logarit $\\to$ Đa thức $\\to$ Lượng giác $\\to$ Hàm mũ.",
        "keyTakeaway": "int u dv = uv - int v du.",
        "source": "Buổi 9"
      },
      {
        "id": "fc-10-4",
        "type": "trap",
        "category": "Bẫy đề thi",
        "front": "Phương trình vi phân cấp 2 còn xuất hiện trong cấu trúc đề thi UEH hiện hành không?",
        "back": "**KHÔNG! ĐÃ ĐƯỢC LƯỢC BỎ HOÀN TOÀN.**\n\nChương trình Toán Cao Cấp / Toán Ứng Dụng UEH hiện tại đã tinh giản toàn bộ phần PTVP cấp 2. Sinh viên chỉ cần tập trung 100% vào PTVP cấp 1 (tách biến, tuyến tính) và mô hình tăng trưởng mũ!",
        "keyTakeaway": "PTVP cấp 2 ĐÃ BỎ, tập trung tối đa PTVP cấp 1!",
        "source": "Thông báo cải cách đề thi UEH"
      },
      {
        "id": "fc-10-5",
        "type": "quick-calc",
        "category": "Tính nhanh",
        "front": "Dân số một thành phố tăng trưởng theo hàm mũ với $k = 0.035$ (3.5%/năm). Dân số sẽ tăng gấp đôi sau khoảng bao nhiêu năm?",
        "back": "$$T_2 = \\frac{\\ln 2}{k} = \\frac{\\ln 2}{0.035} \\approx \\frac{0.69315}{0.035} \\approx 19.8 \\text{ năm}$$\n\n(Khoảng gần 20 năm).",
        "keyTakeaway": "T_2 = 0.693 / 0.035 ≈ 19.8 năm.",
        "source": "Buổi 10 & TUD_v2"
      }
    ],
    "quiz": [
      {
        "id": "q-10-1",
        "question": "Nghiệm tổng quát của phương trình vi phân tách biến $y' = 2xy$ ($y > 0$) là:",
        "options": [
          "$y = C e^{x^2}$",
          "$y = x^2 + C$",
          "$y = C e^{2x}$",
          "$y = e^{x^2} + C$"
        ],
        "correctIndex": 0,
        "explanation": "Ta có $\\frac{dy}{dx} = 2xy \\iff \\frac{dy}{y} = 2x dx$. Lấy tích phân 2 vế: $\\int \\frac{dy}{y} = \\int 2x dx \\iff \\ln y = x^2 + C_1 \\iff y = e^{x^2 + C_1} = e^{C_1} e^{x^2} = C e^{x^2}$ (với $C > 0$).",
        "distractorAnalysis": "Bẫy quên lấy hàm mũ e^(...) dẫn đến y = x^2 + C (Phương án B). Bẫy e^(x^2) + C (Phương án D) là nhầm lẫn hằng số trong số mũ.",
        "difficulty": "Cơ bản",
        "source": "TUD_v2 Trang 33"
      },
      {
        "id": "q-10-2",
        "question": "Cho dân số thế giới năm 1930 là 2 tỷ người và năm 1960 là 3 tỷ người. Giả sử tốc độ tăng trưởng tuân theo hàm mũ $N(t) = N_0 e^{kt}$. Hệ số tăng trưởng $k$ bằng:",
        "options": [
          "$k = \\frac{\\ln(1.5)}{30} \\approx 0.0135$",
          "$k = \\frac{1}{30} \\approx 0.0333$",
          "$k = \\frac{\\ln(2)}{30} \\approx 0.0231$",
          "$k = \\ln(1.5) \\approx 0.4055$"
        ],
        "correctIndex": 0,
        "explanation": "Khoảng thời gian từ 1930 đến 1960 là $\\Delta t = 30$ năm. Tỷ số dân số: $\\frac{N(30)}{N(0)} = \\frac{3}{2} = 1.5$. Áp dụng công thức: $e^{30k} = 1.5 \\iff 30k = \\ln(1.5) \\iff k = \\frac{\\ln(1.5)}{30} \\approx 0.0135$.",
        "distractorAnalysis": "Các đáp án khác tính sai khoảng thời gian hoặc quên chia cho delta t = 30.",
        "difficulty": "Vận dụng",
        "source": "TUD_v2 Trang 34 Bài 8"
      }
    ]
  }
];

export const getTopicById = (id) => flashcardTopics.find(t => t.id === id) || flashcardTopics[0];
