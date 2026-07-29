const practiceExamsData = [
  {
    "id": "k51-tonghop",
    "title": "Toán Cao Cấp K51 Đợt 2 (Chép Đề)",
    "sourceLabel": "DE THI CHINH",
    "sourcePdf": "K51_2_dot.pdf",
    "durationMinutes": 30,
    "description": "Bộ 10 câu trắc nghiệm Toán Cao Cấp K51 đợt 2 mới nhất tổng hợp từ sinh viên chép đề kèm đáp án chi tiết.",
    "questions": [
      {
        "id": "k51-th-q1",
        "section": "Trắc nghiệm",
        "prompt": "Một cơ sở sản xuất có hàm chi phí là $C(x, y) = x^2 + 2y^2 - 4\\ln(x) - 8\\ln(y)$, trong đó $x > 0, y > 0$. Cơ sở này đạt chi phí thấp nhất khi:",
        "options": [
          { "id": "A", "text": "$x = 1, y = 2$" },
          { "id": "B", "text": "$x = \\sqrt{2}, y = \\sqrt{2}$" },
          { "id": "C", "text": "$x = 2, y = 2$" },
          { "id": "D", "text": "$x = \\sqrt{2}, y = 2$" }
        ],
        "correct": "B",
        "explanation": "Đạo hàm riêng $C'_x = 2x - 4/x = 0 \\implies x = \\sqrt{2}$, $C'_y = 4y - 8/y = 0 \\implies y = \\sqrt{2}$. Ma trận Hessian $|H| = 32 > 0$ và $C''_{xx} = 4 > 0$ nên đạt chi phí cực tiểu tại $x = \\sqrt{2}, y = \\sqrt{2}$."
      },
      {
        "id": "k51-th-q2",
        "section": "Trắc nghiệm",
        "prompt": "Mức sản lượng $Q = 2K^2 + 3L^2 + KL$. Tại mức đầu vào $K = 10, L = 5$, nếu tăng thêm 1 đơn vị lao động nhưng giữ nguyên sản lượng thì lượng vốn đầu vào giảm bao nhiêu đơn vị?",
        "options": [
          { "id": "A", "text": "$-8/9$" },
          { "id": "B", "text": "$8/9$" },
          { "id": "C", "text": "$-4/9$" },
          { "id": "D", "text": "$4/9$" }
        ],
        "correct": "B",
        "explanation": "Tỷ lệ MRTS $= -Q'_L / Q'_K = -40 / 45 = -8/9$. Do đó lượng vốn giảm $8/9$ đơn vị."
      },
      {
        "id": "k51-th-q3",
        "section": "Trắc nghiệm",
        "prompt": "Cho $A, B$ là các ma trận vuông cấp 3 với $\\text{rank}(A) = 3, \\text{rank}(B) < 3$. Phát biểu nào sau đây ĐÚNG?",
        "options": [
          { "id": "A", "text": "$\\det(A^T B^2) \\neq 0$" },
          { "id": "B", "text": "Hệ phương trình $AX = B$ có vô số nghiệm" },
          { "id": "C", "text": "Ma trận $C = B^3 + 3B$ khả nghịch" },
          { "id": "D", "text": "Hạng của ma trận $D = A^2B + AB^2$ nhỏ hơn 3" }
        ],
        "correct": "D",
        "explanation": "Vì $\\text{rank}(B) < 3$ nên $\\det(B) = 0 \\implies \\det(D) = \\det(AB(A+B)) = \\det(A)\\det(B)\\det(A+B) = 0 \\implies \\text{rank}(D) < 3$."
      },
      {
        "id": "k51-th-q4",
        "section": "Trắc nghiệm",
        "prompt": "Hàm tổng chi phí $C(Q) = 500 \\cdot \\ln(Q^2 + 1) + 200$. Chi phí biên tại $Q = 3$ gần nhất với giá trị nào?",
        "options": [
          { "id": "A", "text": "$150$" },
          { "id": "B", "text": "$200$" },
          { "id": "C", "text": "$100$" },
          { "id": "D", "text": "$300$" }
        ],
        "correct": "D",
        "explanation": "Chi phí biên $MC = C'(Q) = 500 \\cdot \\frac{2Q}{Q^2+1}$. Tại $Q = 3$, $MC(3) = 500 \\cdot \\frac{6}{10} = 300$."
      },
      {
        "id": "k51-th-q5",
        "section": "Trắc nghiệm",
        "prompt": "Cho ma trận $A = \\begin{bmatrix} 1 & 1 & -2 \\\\ 2 & 1 & m \\\\ 3 & 4 & 1 \\end{bmatrix}$. Tìm $m$ để ma trận $A^2 + A$ suy biến.",
        "options": [
          { "id": "A", "text": "$m = 0$ hoặc $m = -11$" },
          { "id": "B", "text": "$m = 0$" },
          { "id": "C", "text": "$m = -11$" },
          { "id": "D", "text": "$m$ có giá trị tùy ý" }
        ],
        "correct": "A",
        "explanation": "Ma trận $A^2 + A = A(A + I_3)$ suy biến khi $\\det(A^2 + A) = \\det(A) \\cdot \\det(A + I_3) = 0$. Ta có $\\det(A) = 5m + 55 = 0 \\implies m = -11$, và $\\det(A + I_3) = 0 \\implies m = 0$."
      },
      {
        "id": "k51-th-q6",
        "section": "Trắc nghiệm",
        "prompt": "Hệ số co giãn cầu theo giá $E_p = -0.5$. Doanh nghiệp quyết định tăng giá bán một lượng nhỏ. Phát biểu nào ĐÚNG về doanh thu?",
        "options": [
          { "id": "A", "text": "Doanh thu không đổi vì lượng cầu giảm tương ứng" },
          { "id": "B", "text": "Doanh thu biên dương ($MR > 0$), việc tăng giá làm tăng tổng doanh thu" },
          { "id": "C", "text": "Các phát biểu kia đều sai" },
          { "id": "D", "text": "Doanh thu biên âm ($MR < 0$), việc tăng giá làm giảm tổng doanh thu" }
        ],
        "correct": "B",
        "explanation": "Vì $|E_p| = 0.5 < 1$ (cầu không co giãn), khi tăng giá lượng cầu giảm ít hơn tỷ lệ tăng giá, dẫn đến tổng doanh thu tăng ($MR > 0$)."
      },
      {
        "id": "k51-th-q7",
        "section": "Trắc nghiệm",
        "prompt": "Trong mô hình thị trường động, giá bán thỏa mãn $P'(t) + 3P(t) = 12$, $P(0) = 5$. Khi $t \\to +\\infty$, giá ổn định về mức giá cân bằng dài hạn là bao nhiêu?",
        "options": [
          { "id": "A", "text": "$12$" },
          { "id": "B", "text": "$4$" },
          { "id": "C", "text": "$3$" },
          { "id": "D", "text": "$5$" }
        ],
        "correct": "B",
        "explanation": "Nghiệm tổng quát $P(t) = 4 + C e^{-3t}$. Khi $t \\to +\\infty$, $e^{-3t} \\to 0$ nên $P(t) \\to 4$."
      },
      {
        "id": "k51-th-q8",
        "section": "Trắc nghiệm",
        "prompt": "Cho ma trận cấp 3 $A$ có $\\det(A) = 5$. Ma trận $B$ thu được từ $A$ bằng cách giữ cột $C_1, C_3$ và thay $C_2$ bằng $2C_2 + 3C_1$. Tính $\\det(2B)$.",
        "options": [
          { "id": "A", "text": "$80$" },
          { "id": "B", "text": "$40$" },
          { "id": "C", "text": "$20$" },
          { "id": "D", "text": "$10$" }
        ],
        "correct": "A",
        "explanation": "Theo tính chất định thức: $\\det(B) = 2 \\det(A) = 10$. Vì $B$ là ma trận cấp 3 nên $\\det(2B) = 2^3 \\det(B) = 8 \\cdot 10 = 80$."
      },
      {
        "id": "k51-th-q9",
        "section": "Trắc nghiệm",
        "prompt": "Cho ma trận vuông $A$ cấp 3 thỏa $3A^{2025} + I_3 = A^{2026}$. Nếu $\\det(A) = -1$ thì $\\det(3A - 9I_3)$ có giá trị bao nhiêu?",
        "options": [
          { "id": "A", "text": "$27$" },
          { "id": "B", "text": "$3$" },
          { "id": "C", "text": "$-27$" },
          { "id": "D", "text": "$-3$" }
        ],
        "correct": "C",
        "explanation": "Biến đổi $3A^{2025} - A^{2026} = -I_3 \\implies A^{2025}(3I_3 - A) = -I_3$. Lấy định thức 2 vế ta được $\\det(3I_3 - A) = 1 \\implies \\det(A - 3I_3) = -1$. Do đó $\\det(3A - 9I_3) = 3^3 \\det(A - 3I_3) = 27 \\cdot (-1) = -27$."
      },
      {
        "id": "k51-th-q10",
        "section": "Trắc nghiệm",
        "prompt": "Cho $AX = B$ với $A$ vuông cấp 3 có $\\det(A) = m^2 - 4m$. Hệ chắc chắn vô nghiệm hoặc có vô số nghiệm khi:",
        "options": [
          { "id": "A", "text": "$m = 0$ hoặc $m = 4$" },
          { "id": "B", "text": "$m > 4$" },
          { "id": "C", "text": "$m = 2$" },
          { "id": "D", "text": "$m \\neq 0$ và $m \\neq 4$" }
        ],
        "correct": "A",
        "explanation": "Hệ $AX = B$ không thể có nghiệm duy nhất khi $\\det(A) = 0 \\iff m^2 - 4m = 0 \\iff m = 0$ hoặc $m = 4$."
      }
    ]
  },
  {
    "id": "k51-204",
    "title": "Toán Cao Cấp K51 Mã Đề 204",
    "sourceLabel": "MAIN K51",
    "sourcePdf": "main.pdf",
    "durationMinutes": 30,
    "description": "Đề K51 mới nhất mã 204, chuyển thành bài kiểm tra 30 phút với chấm điểm tự động.",
    "questions": [
      {
        "id": "k51-204-q1",
        "section": "Trắc nghiệm",
        "prompt": "Cho ma trận $A$ vuông cấp 4. Hãy chọn phát biểu SAI:",
        "options": [
          {
            "id": "A",
            "text": "Nếu $\\text{r}(A) = 3$ thì $|A^T \\cdot A^4| = 0$."
          },
          {
            "id": "B",
            "text": "Nếu $\\text{r}(A) = 4$ thì hệ phương trình tuyến tính $AX = B$ có vô số nghiệm."
          },
          {
            "id": "C",
            "text": "Nếu $\\text{r}(A) = 1$ thì ma trận $A^2 - 2A$ suy biến."
          },
          {
            "id": "D",
            "text": "Nếu $\\text{r}(A) = 2$ thì ma trận $A^3 + 3A$ không khả nghịch."
          }
        ],
        "correct": "B",
        "explanation": "Đáp án theo phần lời giải trong MAIN K51: B."
      },
      {
        "id": "k51-204-q2",
        "section": "Trắc nghiệm",
        "prompt": "Cho ma trận $A$ khả nghịch có $A^{-1} = \\begin{bmatrix} 1 & 0 & m \\\\ 0 & -1 & 1 \\\\ 0 & 0 & 2 \\end{bmatrix}$ và $B = (2A^T)^{-1}$. Khi đó phần tử nằm trên hàng 3 cột 1 của $B$ là:",
        "options": [
          {
            "id": "A",
            "text": "$0$"
          },
          {
            "id": "B",
            "text": "$-\\frac{m}{2}$"
          },
          {
            "id": "C",
            "text": "$\\frac{m}{2}$"
          },
          {
            "id": "D",
            "text": "$m$"
          }
        ],
        "correct": "C",
        "explanation": "Đáp án theo phần lời giải trong MAIN K51: C."
      },
      {
        "id": "k51-204-q3",
        "section": "Trắc nghiệm",
        "prompt": "Xét hệ phương trình $\\begin{cases} x + 2y + 3z = 2 \\\\ mx + y + 2z = 1 \\\\ 2x + 3y + 5z = 3 \\end{cases}$ với tham số $m \\in \\mathbb{R}$. Khẳng định nào sau đây SAI:",
        "options": [
          {
            "id": "A",
            "text": "Tồn tại $m$ sao cho hệ vô nghiệm."
          },
          {
            "id": "B",
            "text": "Tồn tại $m$ sao cho hệ có vô số nghiệm."
          },
          {
            "id": "C",
            "text": "Tồn tại $m$ sao cho hệ có duy nhất nghiệm."
          },
          {
            "id": "D",
            "text": "Với mọi $m$ hệ luôn có nghiệm."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong MAIN K51: A."
      },
      {
        "id": "k51-204-q4",
        "section": "Trắc nghiệm",
        "prompt": "Tiết kiệm $S$ của một thành phố phụ thuộc vào thu nhập $I$ của thành phố đó theo phương trình $S^2 + \\frac{1}{4}I^2 = SI + I$ và phần tiết kiệm không vượt quá $30\\%$ thu nhập. Tại mức thu nhập $I = 16$, tiết kiệm tăng thêm bao nhiêu khi thu nhập tăng $1\\%$?",
        "options": [
          {
            "id": "A",
            "text": "$\\frac{32}{5}\\%$"
          },
          {
            "id": "B",
            "text": "$\\frac{32}{3}\\%$"
          },
          {
            "id": "C",
            "text": "$\\frac{3}{2}\\%$"
          },
          {
            "id": "D",
            "text": "$\\frac{5}{2}\\%$"
          }
        ],
        "correct": "C",
        "explanation": "Đáp án theo phần lời giải trong MAIN K51: C."
      },
      {
        "id": "k51-204-q5",
        "section": "Trắc nghiệm",
        "prompt": "Cho $A, B$ là các ma trận vuông cấp $3$ không suy biến thỏa mãn $|P_A| = 2$, trong đó $P_A$ là ma trận phụ hợp của $A$. Khi đó, giá trị của $|2AB^T A^T B^{-1}|$ là:",
        "options": [
          {
            "id": "A",
            "text": "$32$"
          },
          {
            "id": "B",
            "text": "$8$"
          },
          {
            "id": "C",
            "text": "$16$"
          },
          {
            "id": "D",
            "text": "$4$"
          }
        ],
        "correct": "C",
        "explanation": "Đáp án theo phần lời giải trong MAIN K51: C."
      },
      {
        "id": "k51-204-q6",
        "section": "Trắc nghiệm",
        "prompt": "Cho $A$ là ma trận vuông cấp $3$ khả nghịch và $B = -A$. Ký hiệu $P_A, P_B$ lần lượt là ma trận phụ hợp của $A, B$. Chọn kết luận ĐÚNG:",
        "options": [
          {
            "id": "A",
            "text": "$P_B = -P_A$"
          },
          {
            "id": "B",
            "text": "$|A| = |B|$"
          },
          {
            "id": "C",
            "text": "$P_A = P_B$"
          },
          {
            "id": "D",
            "text": "Các câu kia đều sai."
          }
        ],
        "correct": "C",
        "explanation": "Đáp án theo phần lời giải trong MAIN K51: C."
      },
      {
        "id": "k51-204-q7",
        "section": "Trắc nghiệm",
        "prompt": "Giải phương trình vi phân $y' + 2y = 2x$ với điều kiện đầu $y(0) = \\frac{3}{2}$.",
        "options": [
          {
            "id": "A",
            "text": "$y = 2e^{2x} + x + \\frac{1}{2}$"
          },
          {
            "id": "B",
            "text": "$y = 2e^{-2x} + x - \\frac{1}{2}$"
          },
          {
            "id": "C",
            "text": "$y = 2e^{2x} + x - \\frac{1}{2}$"
          },
          {
            "id": "D",
            "text": "$y = 2e^{-2x} + x + \\frac{1}{2}$"
          }
        ],
        "correct": "B",
        "explanation": "Đáp án theo phần lời giải trong MAIN K51: B."
      },
      {
        "id": "k51-204-q8",
        "section": "Trắc nghiệm",
        "prompt": "Hàm số $f(x, y) = \\frac{x^3}{3} + \\frac{y^3}{3} - x - 4y$ đạt cực tiểu địa phương tại:",
        "options": [
          {
            "id": "A",
            "text": "$(-1, 2)$"
          },
          {
            "id": "B",
            "text": "$(1, 2)$"
          },
          {
            "id": "C",
            "text": "$(-1, -2)$"
          },
          {
            "id": "D",
            "text": "$(1, -2)$"
          }
        ],
        "correct": "B",
        "explanation": "Đáp án theo phần lời giải trong MAIN K51: B."
      },
      {
        "id": "k51-204-q9",
        "section": "Trắc nghiệm",
        "prompt": "Cho hàm sản lượng $Q(L, K) = 6 \\cdot L^{1/2} K^{1/4}$ với $L$ là lượng lao động, $K$ là lượng tiền vốn. Khi đó, sản lượng biên (biên tế riêng của sản lượng) theo vốn tại $L = 100, K = 10000$ là:",
        "options": [
          {
            "id": "A",
            "text": "$\\frac{1}{150}$"
          },
          {
            "id": "B",
            "text": "$6{,}8$"
          },
          {
            "id": "C",
            "text": "$0{,}25$"
          },
          {
            "id": "D",
            "text": "$\\frac{3}{200}$"
          }
        ],
        "correct": "D",
        "explanation": "Ta tính sản lượng biên theo vốn $Q'_K = \\frac{\\partial Q}{\\partial K} = \\frac{3}{2} L^{1/2} K^{-3/4}$. Tại $L = 100, K = 10000$, ta có: $Q'_K = \\frac{3}{2} \\cdot (100)^{1/2} \\cdot (10000)^{-3/4} = \\frac{3}{2} \\cdot 10 \\cdot 10^{-3} = \\frac{3}{200}$."
      },
      {
        "id": "k51-204-q10",
        "section": "Trắc nghiệm",
        "prompt": "Cho hàm số $f(x, y)$ khả vi trên $\\mathbb{R}^2$. Biết $f(10, 5) = 1000$, $f'_x(10, 5) = 2$ và $f'_y(10, 5) = -3$. Sử dụng công thức xấp xỉ tuyến tính, tính gần đúng giá trị $f(10.1, 4.8)$.",
        "options": [
          {
            "id": "A",
            "text": "$1000{,}6$"
          },
          {
            "id": "B",
            "text": "$1000{,}1$"
          },
          {
            "id": "C",
            "text": "$1000{,}4$"
          },
          {
            "id": "D",
            "text": "$1000{,}8$"
          }
        ],
        "correct": "D",
        "explanation": "Ta chọn điểm gốc là $(x_0, y_0) = (10, 5)$ tương ứng với các giả thiết đề bài đã cho. Điểm cần tính xấp xỉ là $(x, y) = (10.1, 4.8)$. Từ đó, ta tính được số gia của các biến: $\\Delta x = x - x_0 = 10.1 - 10 = 0.1$ và $\\Delta y = y - y_0 = 4.8 - 5 = -0.2$. Áp dụng công thức xấp xỉ tuyến tính: $f(x, y) \\approx f(x_0, y_0) + f'_x(x_0, y_0)\\Delta x + f'_y(x_0, y_0)\\Delta y \\approx 1000 + 2 \\cdot (0.1) + (-3) \\cdot (-0.2) = 1000 + 0.2 + 0.6 = 1000.8$."
      }
    ]
  },
  {
    "id": "k51-118",
    "title": "Toán Cao Cấp K51 Mã Đề 118",
    "sourceLabel": "MAIN K51",
    "sourcePdf": "main.pdf",
    "durationMinutes": 30,
    "description": "Đề K51 mới nhất mã 118, luyện theo cấu trúc phòng thi và xem đáp án sau khi nộp.",
    "questions": [
      {
        "id": "k51-118-q1",
        "section": "Trắc nghiệm",
        "prompt": "Câu 1. Cho phương trình vi phân: $y' + y = \\alpha x + \\beta$, trong đó $\\alpha \\neq 0$ và $\\beta$ là các hằng số với $\\alpha + \\beta \\neq 0$. Chọn phát biểu ĐÚNG:",
        "options": [
          {
            "id": "A",
            "text": "$\\lim_{x \\to +\\infty} [y(x) - (\\alpha x + \\beta)] = \\beta$"
          },
          {
            "id": "B",
            "text": "$\\lim_{x \\to +\\infty} [y(x) - (\\alpha x + \\beta)] = \\alpha$"
          },
          {
            "id": "C",
            "text": "Nghiệm tổng quát là $y(x) = Ce^{-x} + \\alpha x + (\\beta - \\alpha)$"
          },
          {
            "id": "D",
            "text": "Nghiệm tổng quát là $y(x) = Ce^{-x} + \\alpha x + \\beta$"
          }
        ],
        "correct": "C",
        "explanation": "Đáp án đúng là C. Giải phương trình vi phân tuyến tính cấp một $y' + y = \\alpha x + \\beta$:\n- Thừa số tích phân: $u(x) = e^x$.\n- Nhân hai vế cho $e^x$ ta được: $(y e^x)' = (\\alpha x + \\beta)e^x$.\n- Tích phân hai vế: $y e^x = \\int (\\alpha x + \\beta) e^x dx + C$.\n- Sử dụng tích phân từng phần: $y e^x = (\\alpha x + \\beta) e^x - \\alpha e^x + C = (\\alpha x + \\beta - \\alpha) e^x + C$.\n- Suy ra nghiệm tổng quát: $y(x) = C e^{-x} + \\alpha x + (\\beta - \\alpha)$."
      },
      {
        "id": "k51-118-q2",
        "section": "Trắc nghiệm",
        "prompt": "Câu 2. Cho hàm số $y = y(x)$ thỏa mãn $e^{xy} + (x - 1)y^3 + xy^2 - 2y + 2 = 0$. Khi đó ta có $y'(0)$ là:",
        "options": [
          {
            "id": "A",
            "text": "$-\\frac{5}{3}$"
          },
          {
            "id": "B",
            "text": "$\\frac{5}{3}$"
          },
          {
            "id": "C",
            "text": "$-\\frac{3}{5}$"
          },
          {
            "id": "D",
            "text": "$\\frac{3}{5}$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án đúng là D.\n- Tại $x = 0$, ta có: $e^0 + (0 - 1)y^3 + 0 - 2y + 2 = 0 \\implies y^3 + 2y - 3 = 0 \\implies y(0) = 1$.\n- Đạo hàm hai vế theo $x$:\n  $$e^{xy}(y + x y') + y^3 + 3(x-1)y^2 y' + y^2 + 2x y y' - 2y' = 0$$\n- Thay $x = 0$ và $y = 1$ vào:\n  $$1 \\cdot (1 + 0) + 1^3 - 3 y'(0) + 1^2 + 0 - 2y'(0) = 0 \\implies 3 - 5y'(0) = 0 \\implies y'(0) = \\frac{3}{5}$$."
      },
      {
        "id": "k51-118-q3",
        "section": "Trắc nghiệm",
        "prompt": "Câu 3. Xét hàm khả vi $f: \\mathbb{R} \\to \\mathbb{R}$ có $f'(10) = -\\frac{f(10)}{10}$. Giả sử hàm cầu của một sản phẩm được cho bởi $q = f(2p)$, với $p$ là giá bán và $q$ là lượng cầu của sản phẩm. Nếu tăng giá $4\\%$ từ mức giá $p = 5$ thì phát biểu nào sau đây là ĐÚNG?",
        "options": [
          {
            "id": "A",
            "text": "Lượng cầu giảm xấp xỉ $5\\%$"
          },
          {
            "id": "B",
            "text": "Lượng cầu giảm xấp xỉ $2\\%$"
          },
          {
            "id": "C",
            "text": "Lượng cầu giảm xấp xỉ $4\\%$"
          },
          {
            "id": "D",
            "text": "Lượng cầu tăng xấp xỉ $4\\%$"
          }
        ],
        "correct": "C",
        "explanation": "Đáp án đúng là C.\n- Ta có hàm cầu $q = f(2p)$.\n- Đạo hàm của lượng cầu theo giá bán $p$: $\\frac{dq}{dp} = 2 f'(2p)$.\n- Hệ số co giãn của cầu theo giá tại $p = 5$:\n  $$\\epsilon_p = \\frac{dq}{dp} \\cdot \\frac{p}{q} = 2 f'(10) \\cdot \\frac{5}{f(10)} = 10 \\cdot \\frac{f'(10)}{f(10)}$$\n- Thay $f'(10) = -\\frac{f(10)}{10}$ vào ta được:\n  $$\\epsilon_p = 10 \\cdot \\frac{-f(10)/10}{f(10)} = -1$$\n- Ý nghĩa: Khi giá bán tăng $4\\%$, lượng cầu giảm xấp xỉ $4\\%$."
      },
      {
        "id": "k51-118-q4",
        "section": "Trắc nghiệm",
        "prompt": "Câu 4. Cho $A$ là ma trận vuông cấp 3. Ma trận $B$ thu được từ ma trận $A$ qua phép biến đổi thay dòng 2 của $A$ bằng 5 lần dòng 2 trừ dòng 1 ($d_2 \\to 5d_2 - d_1$). Tìm phát biểu ĐÚNG:",
        "options": [
          {
            "id": "A",
            "text": "$\\det(B) = 5^3 \\det(A)$"
          },
          {
            "id": "B",
            "text": "$\\det(A) = \\det(B)$"
          },
          {
            "id": "C",
            "text": "$\\det(A) = 5 \\det(B)$"
          },
          {
            "id": "D",
            "text": "$\\det(B) = 5 \\det(A)$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án đúng là D.\n- Phép biến đổi dòng $d_2 \\to 5d_2 - d_1$ bao gồm nhân dòng 2 với hằng số $5$ và cộng thêm bội của dòng 1.\n- Khi nhân một dòng của ma trận vuông cấp 3 với $5$, định thức của ma trận sẽ nhân với $5$.\n- Phép cộng dòng không làm thay đổi định thức.\n- Do đó, $\\det(B) = 5 \\det(A)$."
      },
      {
        "id": "k51-118-q5",
        "section": "Trắc nghiệm",
        "prompt": "Câu 5. Hàm cầu của một sản phẩm được cho bởi $P = \\frac{1000}{Q + 10}$, trong đó $P$ là giá bán và $Q$ là số lượng sản phẩm bán ra. Hãy tìm doanh thu biên (biên tế của doanh thu) khi $Q = 40$.",
        "options": [
          {
            "id": "A",
            "text": "$250$"
          },
          {
            "id": "B",
            "text": "$20$"
          },
          {
            "id": "C",
            "text": "$4$"
          },
          {
            "id": "D",
            "text": "$25$"
          }
        ],
        "correct": "C",
        "explanation": "Đáp án đúng là C.\n- Hàm doanh thu: $R(Q) = P \\cdot Q = \\frac{1000 Q}{Q + 10}$.\n- Hàm doanh thu biên: $MR(Q) = R'(Q) = \\frac{10000}{(Q + 10)^2}$.\n- Tại $Q = 40$: $MR(40) = \\frac{10000}{(40 + 10)^2} = \\frac{10000}{2500} = 4$."
      },
      {
        "id": "k51-118-q6",
        "section": "Trắc nghiệm",
        "prompt": "Câu 6. Cho $A$ là ma trận vuông cấp 3 thỏa mãn $A^T A^2 = 3I_3$. Tính $\\det \\left( \\frac{1}{3} A \\right)^{-1}$.",
        "options": [
          {
            "id": "A",
            "text": "$\\frac{1}{9}$"
          },
          {
            "id": "B",
            "text": "$\\frac{1}{3}$"
          },
          {
            "id": "C",
            "text": "$3$"
          },
          {
            "id": "D",
            "text": "$9$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án đúng là D.\n- Lấy định thức hai vế của $A^T A^2 = 3I_3$:\n  $$\\det(A^T A^2) = \\det(3I_3) \\implies \\det(A)^3 = 3^3 = 27 \\implies \\det(A) = 3$$\n- Tính định thức:\n  $$\\det \\left( \\frac{1}{3} A \\right)^{-1} = \\frac{1}{\\det\\left(\\frac{1}{3}A\\right)} = \\frac{1}{\\left(\\frac{1}{3}\\right)^3 \\det(A)} = \\frac{27}{\\det(A)} = \\frac{27}{3} = 9$$."
      },
      {
        "id": "k51-118-q7",
        "section": "Trắc nghiệm",
        "prompt": "Câu 7. Cho hệ phương trình $\\begin{cases} x - y + z = 2m \\\\ mx - 2y - 3z = -3 \\\\ 2x - 3y - 2z = -m \\end{cases}$ với $m \\in \\mathbb{R}$ là tham số. Hệ có nghiệm duy nhất nếu và chỉ nếu:",
        "options": [
          {
            "id": "A",
            "text": "$m \\neq 1$"
          },
          {
            "id": "B",
            "text": "$m = 2$"
          },
          {
            "id": "C",
            "text": "$m \\neq -4$"
          },
          {
            "id": "D",
            "text": "$m \\neq 2$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án đúng là A.\n- Ma trận hệ số của hệ phương trình:\n  $$A = \\begin{bmatrix} 1 & -1 & 1 \\\\ m & -2 & -3 \\\\ 2 & -3 & -2 \\end{bmatrix}$$\n- Hệ có nghiệm duy nhất khi và chỉ khi $\\det(A) \\neq 0$.\n- Ta tính định thức:\n  $$\\det(A) = 1(4 - 9) + 1(-2m + 6) + 1(-3m + 4) = 5 - 5m$$\n- Điều kiện nghiệm duy nhất: $5 - 5m \\neq 0 \\implies m \\neq 1$."
      },
      {
        "id": "k51-118-q8",
        "section": "Trắc nghiệm",
        "prompt": "Câu 8. Cho ma trận $A = \\begin{bmatrix} m+2 & 1 & 4 \\\\ 3 & -4 & 5 \\\\ -2 & -1 & 2 \\end{bmatrix}$ với $m \\in \\mathbb{R}$ và đặt $B = (2I_3 + A)^4$. Tìm $m$ để hạng của ma trận $B$ nhỏ hơn 3.",
        "options": [
          {
            "id": "A",
            "text": "$m = 4$"
          },
          {
            "id": "B",
            "text": "$m = \\frac{23}{3}$"
          },
          {
            "id": "C",
            "text": "$m = -\\frac{50}{3}$"
          },
          {
            "id": "D",
            "text": "$m = -\\frac{62}{3}$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án đúng là D.\n- Hạng của ma trận $B$ cỡ $3 \\times 3$ nhỏ hơn 3 khi và chỉ khi $\\det(B) = 0$.\n- Do $B = (2I_3 + A)^4$, ta có $\\det(B) = \\left[\\det(2I_3 + A)\\right]^4 = 0 \\implies \\det(2I_3 + A) = 0$.\n- Tính ma trận $2I_3 + A = \\begin{bmatrix} m+4 & 1 & 4 \\\\ 3 & -2 & 5 \\\\ -2 & -1 & 4 \\end{bmatrix}$.\n- Định thức:\n  $$\\det(2I_3 + A) = (m+4)(-3) - 1(12 + 10) + 4(-3 - 4) = -3m - 62$$\n- Điều kiện: $-3m - 62 = 0 \\implies m = -\\frac{62}{3}$."
      },
      {
        "id": "k51-118-q9",
        "section": "Trắc nghiệm",
        "prompt": "Câu 9. Cho hàm lợi nhuận $\\Pi(L, K) = 3 L^{1/3} K^{1/3} - L - 0{,}01K$, trong đó $L$ là lượng lao động và $K$ là lượng vốn. Để lợi nhuận lớn nhất thì:",
        "options": [
          {
            "id": "A",
            "text": "$\\begin{cases} L = 200 \\\\ K = 10000 \\end{cases}$"
          },
          {
            "id": "B",
            "text": "$\\begin{cases} L = 100 \\\\ K = 10000 \\end{cases}$"
          },
          {
            "id": "C",
            "text": "$\\begin{cases} L = 100 \\\\ K = 1000 \\end{cases}$"
          },
          {
            "id": "D",
            "text": "$\\begin{cases} L = 10 \\\\ K = 100 \\end{cases}$"
          }
        ],
        "correct": "B",
        "explanation": "Đáp án đúng là B.\n- Hàm lợi nhuận: $\\Pi(L, K) = 3 L^{1/3} K^{1/3} - L - 0{,}01K$.\n- Điều kiện cần của cực trị (đạo hàm riêng cấp 1 bằng 0):\n  $$\\begin{cases} \\frac{\\partial \\Pi}{\\partial L} = L^{-2/3} K^{1/3} - 1 = 0 \\\\ \\frac{\\partial \\Pi}{\\partial K} = L^{1/3} K^{-2/3} - 0{,}01 = 0 \\end{cases}$$\n- Từ phương trình thứ nhất suy ra $K = L^2$.\n- Thay vào phương trình thứ hai: $L^{1/3} (L^2)^{-2/3} = 0{,}01 \\implies L^{-1} = 0{,}01 \\implies L = 100$.\n- Từ đó tính được $K = 100^2 = 10000$."
      },
      {
        "id": "k51-118-q10",
        "section": "Trắc nghiệm",
        "prompt": "Câu 10. Cho ma trận $B = \\begin{bmatrix} 1 & 2 & 4 \\\\ 2 & 3 & 5 \\\\ 3 & m & 7 \\end{bmatrix}$. Ma trận $B^2$ không khả nghịch khi:",
        "options": [
          {
            "id": "A",
            "text": "$m = \\frac{13}{6}$"
          },
          {
            "id": "B",
            "text": "$m = \\frac{13}{3}$"
          },
          {
            "id": "C",
            "text": "$m = \\frac{13}{2}$"
          },
          {
            "id": "D",
            "text": "$m = \\frac{13}{5}$"
          }
        ],
        "correct": "B",
        "explanation": "Đáp án đúng là B.\n- Ma trận $B^2$ không khả nghịch khi và chỉ khi $\\det(B) = 0$.\n- Tính định thức ma trận $B$:\n  $$\\det(B) = 1(21 - 5m) - 2(14 - 15) + 4(2m - 9) = 3m - 13$$\n- Điều kiện không khả nghịch: $3m - 13 = 0 \\implies m = \\frac{13}{3}$."
      }
    ]
  },
  {
    "id": "k51-354",
    "title": "Toán Cao Cấp K51 Mã Đề 354",
    "sourceLabel": "MAIN K51",
    "sourcePdf": "main.pdf",
    "durationMinutes": 30,
    "description": "Đề K51 mới nhất mã 354, phù hợp luyện tốc độ xử lý câu trắc nghiệm Toán Cao Cấp.",
    "questions": [
      {
        "id": "k51-354-q1",
        "section": "Trắc nghiệm",
        "prompt": "Câu 1. Một xí nghiệp sản xuất độc quyền một loại sản phẩm với hàm cầu của loại sản phẩm này là: $Q_D = 1500 - \\frac{1}{2}P$ và hàm chi phí là $C = C(Q)$. Biết xí nghiệp đạt lợi nhuận cao nhất khi $Q = Q_0 = 400$. Ta có chi phí biên tại $Q_0$ là:",
        "options": [
          {
            "id": "A",
            "text": "$1400$"
          },
          {
            "id": "B",
            "text": "$2000$"
          },
          {
            "id": "C",
            "text": "$3000$"
          },
          {
            "id": "D",
            "text": "$1600$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án đúng là A.\nTa có:\n$Q_D = 1500 - \\frac{1}{2}P \\implies P = 3000 - 2Q$.\nDoanh thu: $R(Q) = P \\cdot Q = 3000Q - 2Q^2$.\nDoanh thu biên: $MR(Q) = 3000 - 4Q$.\nXí nghiệp đạt lợi nhuận tối đa khi doanh thu biên bằng chi phí biên:\n$MC(Q_0) = MR(Q_0) = 3000 - 4Q_0$.\nTại $Q_0 = 400$, ta có chi phí biên là:\n$MC(400) = 3000 - 4 \\cdot 400 = 1400$."
      },
      {
        "id": "k51-354-q2",
        "section": "Trắc nghiệm",
        "prompt": "Câu 2. Cho hàm số $f(x, y) = (y^2 - 4)(e^x - e)$. Chọn phát biểu đúng:",
        "options": [
          {
            "id": "A",
            "text": "$(1, 2)$ không phải là một điểm dừng của $f$"
          },
          {
            "id": "B",
            "text": "$f$ đạt cực đại địa phương tại $(1, 2)$"
          },
          {
            "id": "C",
            "text": "$f$ có điểm yên ngựa tại $(1, 2)$"
          },
          {
            "id": "D",
            "text": "$f$ đạt cực tiểu địa phương tại $(1, 2)$"
          }
        ],
        "correct": "C",
        "explanation": "Đáp án đúng là C.\nTa có các đạo hàm riêng:\n$f_x(x, y) = (y^2 - 4)e^x$\n$f_y(x, y) = 2y(e^x - e)$\nTại $(1, 2)$:\n$f_x(1, 2) = 0$ và $f_y(1, 2) = 0$, do đó $(1, 2)$ là một điểm dừng của $f$.\nCác đạo hàm riêng cấp hai tại $(1, 2)$ là:\n$A = f_{xx}(1, 2) = (2^2 - 4)e^1 = 0$\n$B = f_{xy}(1, 2) = 2 \\cdot 2 \\cdot e^1 = 4e$\n$C = f_{yy}(1, 2) = 2(e^1 - e) = 0$\nTa có: $H = AC - B^2 = 0 \\cdot 0 - (4e)^2 = -16e^2 < 0$.\nVì $H < 0$, nên $(1, 2)$ là điểm yên ngựa của hàm số."
      },
      {
        "id": "k51-354-q3",
        "section": "Trắc nghiệm",
        "prompt": "Câu 3. Xét các ma trận $A = \\begin{bmatrix} 1 & 1 & 2 \\\\ 1 & 2 & -1 \\\\ m & 1 & 1 \\end{bmatrix}$ và $B = \\begin{bmatrix} 1 & -1 & 2 \\\\ 1 & 3 & 1 \\\\ 2 & -1 & -2 \\end{bmatrix}$. Ma trận $A^2 + AB$ không suy biến khi và chỉ khi:",
        "options": [
          {
            "id": "A",
            "text": "$m \\neq -\\frac{5}{2}$ và $m \\neq \\frac{4}{5}$"
          },
          {
            "id": "B",
            "text": "$m \\neq \\frac{5}{2}$ và $m \\neq -\\frac{4}{5}$"
          },
          {
            "id": "C",
            "text": "$m \\neq \\frac{5}{2}$ và $m \\neq \\frac{4}{5}$"
          },
          {
            "id": "D",
            "text": "$m \\neq -\\frac{5}{2}$ và $m \\neq -\\frac{4}{5}$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án đúng là A.\nTa có: $A^2 + AB = A(A + B)$.\nMa trận $A^2 + AB$ không suy biến khi và chỉ khi:\n$\\det(A^2 + AB) \\neq 0 \\iff \\det(A) \\cdot \\det(A + B) \\neq 0 \\iff \\begin{cases} \\det(A) \\neq 0 \\\\ \\det(A + B) \\neq 0 \\end{cases}$.\nTính $\\det(A)$:\n$\\det(A) = \\begin{vmatrix} 1 & 1 & 2 \\\\ 1 & 2 & -1 \\\\ m & 1 & 1 \\end{vmatrix} = 4 - 5m$.\nDo đó, $\\det(A) \\neq 0 \\iff m \\neq \\frac{4}{5}$.\nTính $\\det(A + B)$:\n$A + B = \\begin{bmatrix} 2 & 0 & 4 \\\\ 2 & 5 & 0 \\\\ m+2 & 0 & -1 \\end{bmatrix}$.\n$\\det(A + B) = 5 \\cdot \\begin{vmatrix} 2 & 4 \\\\ m+2 & -1 \\end{vmatrix} = 5(-2 - 4(m+2)) = -20m - 50$.\nDo đó, $\\det(A + B) \\neq 0 \\iff m \\neq -\\frac{5}{2}$.\nVậy điều kiện cần và đủ là $m \\neq -\\frac{5}{2}$ và $m \\neq \\frac{4}{5}$."
      },
      {
        "id": "k51-354-q4",
        "section": "Trắc nghiệm",
        "prompt": "Câu 4. Cho $A$ là một ma trận vuông cấp $n \\ge 2$. Ký hiệu $P_{3A}$ là ma trận phụ hợp của ma trận $3A$. Cho biết $|A| = 3$ và $|P_{3A}| = 27$. Hãy chọn kết quả đúng:",
        "options": [
          {
            "id": "A",
            "text": "$n = 5$"
          },
          {
            "id": "B",
            "text": "$n = 4$"
          },
          {
            "id": "C",
            "text": "$n = 3$"
          },
          {
            "id": "D",
            "text": "$n = 2$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án đúng là D.\nVới ma trận vuông $C$ cấp $n$, ma trận phụ hợp $P_C$ thỏa mãn:\n$|P_C| = |C|^{n-1}$.\nÁp dụng cho $C = 3A$, ta có:\n$|3A| = 3^n |A| = 3^n \\cdot 3 = 3^{n+1}$.\nDo đó:\n$|P_{3A}| = |3A|^{n-1} = \\left(3^{n+1}\\right)^{n-1} = 3^{n^2-1}$.\nTheo giả thiết, $|P_{3A}| = 27 = 3^3$, suy ra:\n$n^2 - 1 = 3 \\implies n^2 = 4$.\nVì $n \\ge 2$, ta chọn $n = 2$."
      },
      {
        "id": "k51-354-q5",
        "section": "Trắc nghiệm",
        "prompt": "Câu 5. Cho $A$ và $B$ là các ma trận vuông cấp $4$ thỏa $A^{-1}B^2 A = 2I_4$. Chọn phát biểu SAI:",
        "options": [
          {
            "id": "A",
            "text": "$\\text{rank}(A) = \\text{rank}(B)$"
          },
          {
            "id": "B",
            "text": "$\\text{rank}(B) = 4$"
          },
          {
            "id": "C",
            "text": "$(B + I_4)^{-1} = B - I_4$"
          },
          {
            "id": "D",
            "text": "$\\text{det}(B) = 4$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án đúng là D.\nTừ giả thiết $A^{-1}B^2 A = 2I_4$, nhân cả hai vế với $A$ bên phải và $A^{-1}$ bên trái, ta được:\n$B^2 = A(2I_4)A^{-1} = 2I_4$.\nLấy định thức hai vế:\n$\\det(B^2) = \\det(2I_4) \\implies (\\det B)^2 = 2^4 = 16 \\implies \\det B = \\pm 4$.\nDo đó phát biểu \"$\\det B = 4$\" chưa chắc đúng (vì có thể $\\det B = -4$).\nKiểm tra các phát biểu khác:\n- Vì $\\det B \\neq 0$ nên $B$ khả nghịch $\\implies \\text{rank}(B) = 4$. Ma trận $A$ cũng khả nghịch (có $A^{-1}$) nên $\\text{rank}(A) = 4$. Vậy $\\text{rank}(A) = \\text{rank}(B) = 4$ (A và B đúng).\n- Ta có $(B + I_4)(B - I_4) = B^2 - I_4 = 2I_4 - I_4 = I_4 \\implies (B + I_4)^{-1} = B - I_4$ (C đúng)."
      },
      {
        "id": "k51-354-q6",
        "section": "Trắc nghiệm",
        "prompt": "Câu 6. Cho ma trận $A = \\begin{bmatrix} 1 & 2 & 1 & 4 \\\\ 0 & -5 & 4 & 5 \\\\ 0 & 0 & 0 & 2 \\\\ 0 & 0 & 0 & 6 \\end{bmatrix}$. Chọn khẳng định đúng:",
        "options": [
          {
            "id": "A",
            "text": "$\\text{rank}(A^2) < 4$"
          },
          {
            "id": "B",
            "text": "$A$ khả nghịch"
          },
          {
            "id": "C",
            "text": "$\\text{rank}(A) = 2$"
          },
          {
            "id": "D",
            "text": "$\\text{rank}(A) = 4$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án đúng là A.\nTa biến đổi ma trận $A$ để tìm hạng của nó:\n$A = \\begin{bmatrix} 1 & 2 & 1 & 4 \\\\ 0 & -5 & 4 & 5 \\\\ 0 & 0 & 0 & 2 \\\\ 0 & 0 & 0 & 6 \\end{bmatrix} \\xrightarrow{R_4 \\to R_4 - 3R_3} \\begin{bmatrix} 1 & 2 & 1 & 4 \\\\ 0 & -5 & 4 & 5 \\\\ 0 & 0 & 0 & 2 \\\\ 0 & 0 & 0 & 0 \\end{bmatrix}$.\nMa trận bậc thang có 3 dòng khác không, do đó $\\text{rank}(A) = 3$.\nVì $\\text{rank}(A) = 3 < 4$ nên $A$ không khả nghịch, suy ra $\\det(A) = 0$.\nDo đó $\\det(A^2) = (\\det A)^2 = 0$, nghĩa là $A^2$ không khả nghịch $\\implies \\text{rank}(A^2) < 4$."
      },
      {
        "id": "k51-354-q7",
        "section": "Trắc nghiệm",
        "prompt": "Câu 7. Cho biết hàm cầu $P = 250 - 0.5Q^2$, trong đó $P$ là đơn giá bán và $Q$ là lượng cầu. Khi đó, tại mức giá $P = 50$, nếu giá giảm $2\\%$ thì:",
        "options": [
          {
            "id": "A",
            "text": "lượng cầu tăng xấp xỉ $0.5\\%$"
          },
          {
            "id": "B",
            "text": "lượng cầu tăng xấp xỉ $0.75\\%$"
          },
          {
            "id": "C",
            "text": "lượng cầu tăng xấp xỉ $0.05\\%$"
          },
          {
            "id": "D",
            "text": "lượng cầu tăng xấp xỉ $0.25\\%$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án đúng là D.\nTừ hàm cầu $P = 250 - 0.5Q^2$, ta có:\n$dP/dQ = -Q \\implies dQ/dP = -\\frac{1}{Q}$.\nHệ số co giãn của cầu theo giá là:\n$E_P^D = \\frac{dQ}{dP} \\cdot \\frac{P}{Q} = -\\frac{1}{Q} \\cdot \\frac{P}{Q} = -\\frac{P}{Q^2}$.\nTại mức giá $P = 50$, ta có:\n$50 = 250 - 0.5Q^2 \\implies 0.5Q^2 = 200 \\implies Q^2 = 400 \\implies Q = 20$.\nGiá trị hệ số co giãn tại $P = 50$ là:\n$E_P^D = -\\frac{50}{20^2} = -\\frac{50}{400} = -0.125$.\nÝ nghĩa: Tại mức giá $P = 50$, nếu giá giảm $1\\%$ thì lượng cầu tăng khoảng $0.125\\%$.\nDo đó, nếu giá giảm $2\\%$ thì lượng cầu tăng xấp xỉ:\n$2 \\cdot 0.125\\% = 0.25\\%$."
      },
      {
        "id": "k51-354-q8",
        "section": "Trắc nghiệm",
        "prompt": "Câu 8. Tìm $\\frac{dy}{dx}$ biết $x^4 + x^5 = (y - x^2)^2$.",
        "options": [
          {
            "id": "A",
            "text": "$\\frac{dy}{dx} = \\frac{5x^4 + 2xy - 4x^3}{y - x^2}$"
          },
          {
            "id": "B",
            "text": "$\\frac{dy}{dx} = \\frac{5x^4 + 4xy - 4x^3}{y - x^2}$"
          },
          {
            "id": "C",
            "text": "$\\frac{dy}{dx} = \\frac{5x^4 + 4xy - 2x^3}{2(y - x^2)}$"
          },
          {
            "id": "D",
            "text": "$\\frac{dy}{dx} = \\frac{5x^4 + 4xy}{2(y - x^2)}$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án đúng là D.\nĐạo hàm hai vế của phương trình $x^4 + x^5 = (y - x^2)^2$ theo biến $x$ (với $y$ là hàm theo $x$):\n$4x^3 + 5x^4 = 2(y - x^2) \\cdot \\left(\\frac{dy}{dx} - 2x\\right)$\n$\\iff 4x^3 + 5x^4 = 2(y - x^2)\\frac{dy}{dx} - 4x(y - x^2)$\n$\\iff 4x^3 + 5x^4 = 2(y - x^2)\\frac{dy}{dx} - 4xy + 4x^3$\n$\\iff 5x^4 + 4xy = 2(y - x^2)\\frac{dy}{dx}$\n$\\iff \\frac{dy}{dx} = \\frac{5x^4 + 4xy}{2(y - x^2)}$."
      },
      {
        "id": "k51-354-q9",
        "section": "Trắc nghiệm",
        "prompt": "Câu 9. Xét hệ $\\begin{cases} 2x + 3y + 4z = 3 \\\\ x + 2y + 3z = 2 \\\\ 3x + 3y + (m + 2)z = m \\end{cases}$ với tham số thực $m$. Hệ có nghiệm nếu và chỉ nếu:",
        "options": [
          {
            "id": "A",
            "text": "$m \\neq 2$"
          },
          {
            "id": "B",
            "text": "$m \\neq 1$"
          },
          {
            "id": "C",
            "text": "$m \\neq 3$"
          },
          {
            "id": "D",
            "text": "$m \\neq 4$"
          }
        ],
        "correct": "B",
        "explanation": "Đáp án đúng là B.\nTa lập ma trận bổ sung của hệ phương trình:\n$\\overline{A} = \\begin{bmatrix} 2 & 3 & 4 & 3 \\\\ 1 & 2 & 3 & 2 \\\\ 3 & 3 & m+2 & m \\end{bmatrix}$.\nĐổi chỗ dòng 1 và dòng 2:\n$\\overline{A} \\to \\begin{bmatrix} 1 & 2 & 3 & 2 \\\\ 2 & 3 & 4 & 3 \\\\ 3 & 3 & m+2 & m \\end{bmatrix}$.\nThực hiện các phép biến đổi sơ cấp trên dòng:\n- $R_2 \\to R_2 - 2R_1$\n- $R_3 \\to R_3 - 3R_1$\nTa được:\n$\\overline{A} \\to \\begin{bmatrix} 1 & 2 & 3 & 2 \\\\ 0 & -1 & -2 & -1 \\\\ 0 & -3 & m-7 & m-6 \\end{bmatrix}$.\nTiếp tục biến đổi:\n- $R_2 \\to -R_2$\n- $R_3 \\to R_3 + 3R_2$\nTa được:\n$\\overline{A} \\to \\begin{bmatrix} 1 & 2 & 3 & 2 \\\\ 0 & 1 & 2 & 1 \\\\ 0 & 0 & m-1 & m-3 \\end{bmatrix}$.\nHệ phương trình có nghiệm khi và chỉ khi $\\text{rank}(A) = \\text{rank}(\\overline{A})$.\n- Nếu $m - 1 = 0 \\iff m = 1$, dòng cuối trở thành $\\begin{bmatrix} 0 & 0 & 0 & -2 \\end{bmatrix} \\implies \\text{rank}(A) = 2 \\neq \\text{rank}(\\overline{A}) = 3$, hệ vô nghiệm.\n- Nếu $m \\neq 1 \\implies \\text{rank}(A) = \\text{rank}(\\overline{A}) = 3$, hệ có nghiệm duy nhất.\nVậy hệ phương trình có nghiệm khi và chỉ khi $m \\neq 1$."
      },
      {
        "id": "k51-354-q10",
        "section": "Trắc nghiệm",
        "prompt": "Câu 10. Cho phương trình vi phân $y' + 2y = e^{5x}$. Nghiệm tổng quát của phương trình là:",
        "options": [
          {
            "id": "A",
            "text": "$y = \\frac{1}{7}e^{5x} + Ce^{-2x}$"
          },
          {
            "id": "B",
            "text": "$y = \\frac{1}{7}e^{2x} + Ce^{-5x}$"
          },
          {
            "id": "C",
            "text": "$y = -\\frac{1}{7}e^{5x} + Ce^{-2x}$"
          },
          {
            "id": "D",
            "text": "$y = -\\frac{1}{7}e^{2x} + Ce^{-5x}$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án đúng là A.\nPhương trình vi phân tuyến tính cấp một: $y' + 2y = e^{5x}$.\nThừa số tích phân: $u(x) = e^{\\int 2 dx} = e^{2x}$.\nNhân hai vế của phương trình với $e^{2x}$, ta có:\n$e^{2x}y' + 2e^{2x}y = e^{7x} \\implies \\frac{d}{dx}\\left(y e^{2x}\\right) = e^{7x}$.\nTích phân hai vế theo $x$:\n$y e^{2x} = \\int e^{7x} dx = \\frac{1}{7}e^{7x} + C$.\nSuy ra nghiệm tổng quát:\n$y = \\frac{1}{7}e^{5x} + C e^{-2x}$."
      }
    ]
  },
  {
    "id": "k51-442",
    "title": "Toán Cao Cấp K51 Mã Đề 442",
    "sourceLabel": "MAIN K51",
    "sourcePdf": "main.pdf",
    "durationMinutes": 30,
    "description": "Đề K51 mới nhất mã 442, mô phỏng bài kiểm tra 30 phút kèm thống kê kết quả.",
    "questions": [
      {
        "id": "k51-442-q1",
        "section": "Trắc nghiệm",
        "prompt": "Xét hàm sản xuất $Q = 0.5K^{0.25}L^{0.75}$, trong đó $Q$ là sản lượng, $K$ là lượng vốn và $L$ là lượng lao động. Ký hiệu $E_{QK}$ và $E_{QL}$ lần lượt là độ co giãn riêng của sản lượng theo vốn và theo lao động. Phát biểu nào sau đây là SAI:",
        "options": [
          {
            "id": "A",
            "text": "$E_{QK} < E_{QL}$"
          },
          {
            "id": "B",
            "text": "$3E_{QK} = E_{QL}$"
          },
          {
            "id": "C",
            "text": "$E_{QK} + E_{QL} = 1$"
          },
          {
            "id": "D",
            "text": "$E_{QK} > E_{QL}$"
          }
        ],
        "correct": "D",
        "explanation": "Ta có hàm sản xuất dạng Cobb-Douglas: $Q = 0.5 K^{0.25} L^{0.75}$.\nĐộ co giãn riêng của sản lượng theo vốn là $E_{QK} = 0.25$.\nĐộ co giãn riêng của sản lượng theo lao động là $E_{QL} = 0.75$.\nXét các phương án:\n- A. $E_{QK} < E_{QL} \\Leftrightarrow 0.25 < 0.75$ (Đúng).\n- B. $3 E_{QK} = E_{QL} \\Leftrightarrow 3 \\cdot 0.25 = 0.75$ (Đúng).\n- C. $E_{QK} + E_{QL} = 0.25 + 0.75 = 1$ (Đúng).\n- D. $E_{QK} > E_{QL} \\Leftrightarrow 0.25 > 0.75$ (Sai).\nVậy phát biểu sai là D."
      },
      {
        "id": "k51-442-q2",
        "section": "Trắc nghiệm",
        "prompt": "Cho $y = y(x)$ là hàm ẩn xác định bởi phương trình $x^3 + 3xy^4 + 3x^2y^2 + 2y^3e^x - 16 = 0$. Tính giá trị $y'(0)$.",
        "options": [
          {
            "id": "A",
            "text": "$2$"
          },
          {
            "id": "B",
            "text": "$-2$"
          },
          {
            "id": "C",
            "text": "$-\\frac{8}{3}$"
          },
          {
            "id": "D",
            "text": "$\\frac{8}{3}$"
          }
        ],
        "correct": "C",
        "explanation": "Đặt $F(x, y) = x^3 + 3xy^4 + 3x^2y^2 + 2y^3e^x - 16 = 0$.\nThay $x = 0$ vào phương trình ta được:\n$$2y^3e^0 - 16 = 0 \\Leftrightarrow y^3 = 8 \\Leftrightarrow y(0) = 2$$\nĐạo hàm các đạo hàm riêng tại $(0, 2)$:\n$$F'_x = 3x^2 + 3y^4 + 6xy^2 + 2y^3e^x \\Rightarrow F'_x(0, 2) = 3 \\cdot 2^4 + 2 \\cdot 2^3 = 48 + 16 = 64$$\n$$F'_y = 12xy^3 + 6x^2y + 6y^2e^x \\Rightarrow F'_y(0, 2) = 6 \\cdot 2^2 \\cdot e^0 = 24$$\nÁp dụng công thức đạo hàm hàm ẩn:\n$$y'(0) = -\\frac{F'_x(0, 2)}{F'_y(0, 2)} = -\\frac{64}{24} = -\\frac{8}{3}$$\nDo đó đáp án đúng là C."
      },
      {
        "id": "k51-442-q3",
        "section": "Trắc nghiệm",
        "prompt": "Cho $A, B, C$ là các ma trận vuông cấp 3 thỏa mãn $AB = 2B^2C$. Nếu $\\det(B) = 3$ và $\\det(C) = 2$ thì khẳng định nào sau đây ĐÚNG:",
        "options": [
          {
            "id": "A",
            "text": "$A = 2BC$ và $\\det(A) = 48$"
          },
          {
            "id": "B",
            "text": "$A = 2B^2CB^{-1}$ và $\\det(A) = 12$"
          },
          {
            "id": "C",
            "text": "$A = 2BC$ và $\\det(A) = 12$"
          },
          {
            "id": "D",
            "text": "$A = 2B^2CB^{-1}$ và $\\det(A) = 48$"
          }
        ],
        "correct": "D",
        "explanation": "Từ giả thiết $AB = 2B^2C$. Vì $\\det(B) = 3 \\neq 0$ nên ma trận $B$ khả nghịch.\nNhân cả hai vế của phương trình với $B^{-1}$ từ phía bên phải:\n$$A = 2B^2C B^{-1}$$\nTính định thức của ma trận $A$ (lưu ý các ma trận đều có cấp 3):\n$$\\det(A) = \\det(2B^2C B^{-1}) = 2^3 \\cdot \\det(B)^2 \\cdot \\det(C) \\cdot \\det(B^{-1})$$\nVì $\\det(B^{-1}) = \\frac{1}{\\det(B)}$, ta có:\n$$\\det(A) = 8 \\cdot \\det(B) \\cdot \\det(C) = 8 \\cdot 3 \\cdot 2 = 48$$\nVậy ta chọn D."
      },
      {
        "id": "k51-442-q4",
        "section": "Trắc nghiệm",
        "prompt": "Hàm số $f(x, y) = \\frac{x^3}{3} + \\frac{y^3}{3} - x - 9y$ đạt cực tiểu địa phương tại:",
        "options": [
          {
            "id": "A",
            "text": "$(1, 3)$"
          },
          {
            "id": "B",
            "text": "$(-1, 3)$"
          },
          {
            "id": "C",
            "text": "$(1, -3)$"
          },
          {
            "id": "D",
            "text": "$(-1, -3)$"
          }
        ],
        "correct": "A",
        "explanation": "Hàm số $f(x, y) = \\frac{x^3}{3} + \\frac{y^3}{3} - x - 9y$.\nCác đạo hàm riêng bậc nhất:\n$$f'_x = x^2 - 1, \\quad f'_y = y^2 - 9$$\nHệ phương trình tìm điểm dừng:\n$$\\begin{cases} x^2 - 1 = 0 \\\\ y^2 - 9 = 0 \\end{cases} \\Leftrightarrow \\begin{cases} x = \\pm 1 \\\\ y = \\pm 3 \\end{cases}$$\nCác đạo hàm riêng bậc hai:\n$$A = f''_{xx} = 2x, \\quad B = f''_{xy} = 0, \\quad C = f''_{yy} = 2y$$\nTa có $\\Delta = AC - B^2 = 4xy$.\nĐể hàm số đạt cực tiểu địa phương tại $(x_0, y_0)$, ta cần:\n$$\\begin{cases} \\Delta(x_0, y_0) > 0 \\\\ A(x_0, y_0) > 0 \\end{cases} \\Leftrightarrow \\begin{cases} 4x_0 y_0 > 0 \\\\ 2x_0 > 0 \\end{cases} \\Leftrightarrow \\begin{cases} x_0 > 0 \\\\ y_0 > 0 \\end{cases}$$\nTrong các điểm dừng, chỉ có điểm $(1, 3)$ thỏa mãn điều kiện trên.\nVậy hàm số đạt cực tiểu địa phương tại $(1, 3)$."
      },
      {
        "id": "k51-442-q5",
        "section": "Trắc nghiệm",
        "prompt": "Cho $A, B, C$ là các ma trận vuông cấp 3 có $|A| = -2$, $|B| = 2$, $|C| = 9$. Đặt $D = 3A^{-1}B^2C^T$. Khi đó định thức của $D$ là:",
        "options": [
          {
            "id": "A",
            "text": "$-486$"
          },
          {
            "id": "B",
            "text": "$486$"
          },
          {
            "id": "C",
            "text": "$-432$"
          },
          {
            "id": "D",
            "text": "$432$"
          }
        ],
        "correct": "A",
        "explanation": "Ta có các ma trận vuông cấp 3. Định thức của ma trận $D = 3 A^{-1} B^2 C^T$ được tính như sau:\n$$\\det(D) = \\det(3 A^{-1} B^2 C^T) = 3^3 \\cdot \\det(A^{-1}) \\cdot \\det(B^2) \\cdot \\det(C^T)$$\nSử dụng các tính chất của định thức:\n- $\\det(A^{-1}) = \\frac{1}{\\det(A)}$\n- $\\det(B^2) = (\\det(B))^2$\n- $\\det(C^T) = \\det(C)$\nTa được:\n$$\\det(D) = 27 \\cdot \\frac{1}{|A|} \\cdot |B|^2 \\cdot |C| = 27 \\cdot \\frac{1}{-2} \\cdot 2^2 \\cdot 9 = 27 \\cdot (-2) \\cdot 9 = -486$$\nVậy định thức của $D$ bằng $-486$."
      },
      {
        "id": "k51-442-q6",
        "section": "Trắc nghiệm",
        "prompt": "Cho $y(x)$ là nghiệm của phương trình vi phân $y' + \\frac{2xy}{1+x^2} = 0$ với điều kiện $y(2) = 10$. Tính $y(-3)$.",
        "options": [
          {
            "id": "A",
            "text": "$-5$"
          },
          {
            "id": "B",
            "text": "$5$"
          },
          {
            "id": "C",
            "text": "$0$"
          },
          {
            "id": "D",
            "text": "Một kết quả khác"
          }
        ],
        "correct": "B",
        "explanation": "Phương trình vi phân đã cho là phương trình tách biến (với $y \\neq 0$):\n$$y' + \\frac{2xy}{1 + x^2} = 0 \\Leftrightarrow \\frac{dy}{y} = -\\frac{2x}{1 + x^2} dx$$\nTích phân hai vế:\n$$\\int \\frac{dy}{y} = -\\int \\frac{2x}{1 + x^2} dx \\Leftrightarrow \\ln|y| = -\\ln(1+x^2) + C \\Leftrightarrow y = \\frac{C_1}{1+x^2}$$\nThay điều kiện ban đầu $y(2) = 10$:\n$$10 = \\frac{C_1}{1 + 2^2} = \\frac{C_1}{5} \\Rightarrow C_1 = 50$$\nVậy nghiệm của phương trình là:\n$$y(x) = \\frac{50}{1+x^2}$$\nTính $y(-3)$:\n$$y(-3) = \\frac{50}{1 + (-3)^2} = \\frac{50}{10} = 5$$\nDo đó chọn B."
      },
      {
        "id": "k51-442-q7",
        "section": "Trắc nghiệm",
        "prompt": "Cho hệ phương trình bậc nhất:\n$$\\begin{cases} 2x + 2y + mz = -2 \\\\ x - y + z = m \\\\ 3x + my + 2z = -1 \\end{cases}$$\nvới tham số thực $m$. Tìm $m$ để hệ đã cho vô nghiệm.",
        "options": [
          {
            "id": "A",
            "text": "Cả ba mệnh đề đều sai."
          },
          {
            "id": "B",
            "text": "$m = -2$, $m = 1$"
          },
          {
            "id": "C",
            "text": "$m = 1$"
          },
          {
            "id": "D",
            "text": "$m = -2$"
          }
        ],
        "correct": "D",
        "explanation": "Xét ma trận hệ số của hệ phương trình:\n$$A = \\begin{bmatrix} 2 & 2 & m \\\\ 1 & -1 & 1 \\\\ 3 & m & 2 \\end{bmatrix}$$\nTính định thức của ma trận $A$:\n$$\\det(A) = 2(-2 - m) - 2(2 - 3) + m(m + 3) = m^2 + m - 2$$\nĐể hệ phương trình vô nghiệm hoặc vô số nghiệm thì ta phải có:\n$$\\det(A) = 0 \\Leftrightarrow m^2 + m - 2 = 0 \\Leftrightarrow \\begin{bmatrix} m = 1 \\\\ m = -2 \\end{bmatrix}$$\n- Với $m = 1$, hệ phương trình trở thành:\n$$\\begin{cases} 2x + 2y + z = -2 \\\\ x - y + z = 1 \\\\ 3x + y + 2z = -1 \\end{cases}$$\nCộng hai phương trình đầu ta được $3x + y + 2z = -1$ (chính là phương trình thứ ba). Do đó hệ có vô số nghiệm.\n- Với $m = -2$, hệ phương trình trở thành:\n$$\\begin{cases} 2x + 2y - 2z = -2 \\\\ x - y + z = -2 \\\\ 3x - 2y + 2z = -1 \\end{cases} \\Leftrightarrow \\begin{cases} x + y - z = -1 \\\\ x - y + z = -2 \\\\ 3x - 2y + 2z = -1 \\end{cases}$$\nCộng hai phương trình đầu ta được:\n$$2x = -3 \\Leftrightarrow x = -1.5$$\nThế vào hai phương trình sau:\n$$\\begin{cases} -y + z = -0.5 \\\\ -2y + 2z = 3.5 \\end{cases} \\Leftrightarrow \\begin{cases} y - z = 0.5 \\\\ y - z = -1.75 \\end{cases} \\quad (\\text{Vô lý})$$\nNên hệ phương trình vô nghiệm.\nVậy hệ vô nghiệm khi $m = -2$. Chọn đáp án D."
      },
      {
        "id": "k51-442-q8",
        "section": "Trắc nghiệm",
        "prompt": "Cho ma trận $A = \\begin{bmatrix} 1 & 1 & m \\\\ 2 & 1 & 1 \\\\ 1 & 1 & 1 \\end{bmatrix}$. Khẳng định nào sau đây là SAI:",
        "options": [
          {
            "id": "A",
            "text": "Với mọi $m \\in \\mathbb{R}$, $\\text{rank}(A) > 1$"
          },
          {
            "id": "B",
            "text": "Tồn tại $m \\in \\mathbb{R}$ để $\\text{rank}(A) = 2$"
          },
          {
            "id": "C",
            "text": "Tồn tại $m \\in \\mathbb{R}$ để $\\text{rank}(A) = 3$"
          },
          {
            "id": "D",
            "text": "Với mọi $m \\in \\mathbb{R}$, $\\text{rank}(A^2) > 2$"
          }
        ],
        "correct": "D",
        "explanation": "Tính định thức của ma trận $A$:\n$$\\det(A) = \\det\\begin{bmatrix} 1 & 1 & m \\\\ 2 & 1 & 1 \\\\ 1 & 1 & 1 \\end{bmatrix} = 1(1 - 1) - 1(2 - 1) + m(2 - 1) = m - 1$$\n- Nếu $m \\neq 1$, $\\det(A) \\neq 0 \\Rightarrow \\text{rank}(A) = 3$.\n- Nếu $m = 1$, $\\det(A) = 0$. Vì có định thức con cấp 2 là $\\det\\begin{bmatrix} 1 & 1 \\\\ 2 & 1 \\end{bmatrix} = -1 \\neq 0$ nên $\\text{rank}(A) = 2$.\nNhư vậy:\n- Với mọi $m \\in \\mathbb{R}$, ta luôn có $\\text{rank}(A) \\ge 2 > 1$, suy ra khẳng định A đúng.\n- Tồn tại $m = 1$ để $\\text{rank}(A) = 2$, suy ra khẳng định B đúng.\n- Tồn tại $m \\neq 1$ để $\\text{rank}(A) = 3$, suy ra khẳng định C đúng.\n- Khi $m = 1$, ta có $\\text{rank}(A) = 2 \\Rightarrow \\text{rank}(A^2) \\le \\text{rank}(A) = 2$. Do đó không thể có $\\text{rank}(A^2) > 2$ với mọi $m$. Khẳng định D sai.\nVậy chọn D."
      },
      {
        "id": "k51-442-q9",
        "section": "Trắc nghiệm",
        "prompt": "Cho ma trận $A = \\begin{bmatrix} -1 & 1 & -1 \\\\ 0 & -1 & -1 \\\\ 0 & 0 & -1 \\end{bmatrix}$. Khi đó giá trị định thức của $A^{2026} - A^{2025}$ là:",
        "options": [
          {
            "id": "A",
            "text": "$0$"
          },
          {
            "id": "B",
            "text": "$-8$"
          },
          {
            "id": "C",
            "text": "$-1$"
          },
          {
            "id": "D",
            "text": "$8$"
          }
        ],
        "correct": "D",
        "explanation": "Ma trận $A = \\begin{bmatrix} -1 & 1 & -1 \\\\ 0 & -1 & -1 \\\\ 0 & 0 & -1 \\end{bmatrix}$ là ma trận tam giác trên, do đó:\n- Định thức của $A$ là:\n$$\\det(A) = (-1) \\cdot (-1) \\cdot (-1) = -1$$\n- Ta cần tính định thức của ma trận $A^{2026} - A^{2025}$:\n$$A^{2026} - A^{2025} = A^{2025}(A - I)$$\n- Áp dụng tính chất định thức:\n$$\\det(A^{2026} - A^{2025}) = \\det(A^{2025}(A - I)) = (\\det(A))^{2025} \\cdot \\det(A - I)$$\n- Ta có ma trận $A - I$:\n$$A - I = \\begin{bmatrix} -2 & 1 & -1 \\\\ 0 & -2 & -1 \\\\ 0 & 0 & -2 \\end{bmatrix}$$\nVì $A - I$ cũng là ma trận tam giác trên, định thức của nó là:\n$$\\det(A - I) = (-2) \\cdot (-2) \\cdot (-2) = -8$$\n- Do đó:\n$$\\det(A^{2026} - A^{2025}) = (-1)^{2025} \\cdot (-8) = (-1) \\cdot (-8) = 8$$\nVậy ta chọn D."
      },
      {
        "id": "k51-442-q10",
        "section": "Trắc nghiệm",
        "prompt": "Cho hàm sản xuất $Q = \\frac{L}{2} + \\frac{\\ln(2L+1)}{2}$, trong đó $Q$ là sản lượng và $L$ là lượng lao động ($L \\ge 0$). Chọn phát biểu ĐÚNG:",
        "options": [
          {
            "id": "A",
            "text": "Khi $L$ tăng dần ra $+\\infty$ thì biên tế (giá trị cận biên) của $Q$ luôn bé hơn $\\frac{1}{2}$"
          },
          {
            "id": "B",
            "text": "Khi $L$ tăng dần ra $+\\infty$ thì biên tế (giá trị cận biên) của $Q$ theo $L$ tiến dần về một hằng số"
          },
          {
            "id": "C",
            "text": "Biên tế (giá trị cận biên) của $Q$ theo $L$ khi $L = 1$ có giá trị là $\\frac{7}{12}$"
          },
          {
            "id": "D",
            "text": "Khi $L$ tăng dần ra $+\\infty$ thì biên tế (giá trị cận biên) của $Q$ theo $L$ tăng"
          }
        ],
        "correct": "B",
        "explanation": "Hàm sản xuất: $Q = \\frac{L}{2} + \\frac{\\ln(2L + 1)}{2}$.\nBiên tế (đạo hàm riêng bậc nhất) của $Q$ theo $L$ là:\n$$Q'_L = \\frac{1}{2} + \\frac{1}{2} \\cdot \\frac{2}{2L + 1} = \\frac{1}{2} + \\frac{1}{2L + 1}$$\nXét các phát biểu:\n- A. Với mọi $L \\ge 0$, ta có $2L + 1 \\ge 1 \\Rightarrow \\frac{1}{2L + 1} > 0 \\Rightarrow Q'_L > \\frac{1}{2}$. Vậy phát biểu A sai.\n- B. Khi $L \\to +\\infty$, ta có:\n$$\\lim_{L \\to +\\infty} Q'_L = \\lim_{L \\to +\\infty} \\left( \\frac{1}{2} + \\frac{1}{2L + 1} \\right) = \\frac{1}{2}$$\nGiới hạn này là một hằng số. Vậy phát biểu B đúng.\n- C. Tại $L = 1$:\n$$Q'_L(1) = \\frac{1}{2} + \\frac{1}{2 \\cdot 1 + 1} = \\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6}$$\nVậy phát biểu C sai.\n- D. Vì đạo hàm của $Q'_L$ theo $L$ là $(Q'_L)' = -\\frac{2}{(2L + 1)^2} < 0$, nên biên tế của $Q$ theo $L$ là hàm giảm khi $L$ tăng. Vậy phát biểu D sai.\nDo đó chọn B."
      }
    ]
  },
  {
    "id": "k50-dot-2",
    "title": "Toán Cao Cấp K50 Đợt 2",
    "sourceLabel": "FINAL 2807",
    "sourcePdf": "final 2807.pdf",
    "durationMinutes": 30,
    "description": "Đề K50 đợt 2 trong FINAL 2807, luyện như một bài kiểm tra 30 phút.",
    "questions": [
      {
        "id": "k50-dot-2-q1",
        "section": "Trắc nghiệm",
        "prompt": "Hàm cầu của một sản phẩm được cho bởi $Q = 500 - 4P$ ($P$ là giá bán và $Q$ là lượng cầu sản phẩm). Ta ký hiệu $\\epsilon(P)$ là hệ số co giãn của lượng cầu theo giá tại mức giá $P$. Gọi $R_0$ là doanh thu khi $|\\epsilon(P)| = 2$. Giá trị của $R_0$ là:",
        "options": [
          {
            "id": "A",
            "text": "$2100$"
          },
          {
            "id": "B",
            "text": "$1000$"
          },
          {
            "id": "C",
            "text": "$2125$"
          },
          {
            "id": "D",
            "text": "$500$"
          }
        ],
        "correct": "B",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: B."
      },
      {
        "id": "k50-dot-2-q2",
        "section": "Trắc nghiệm",
        "prompt": "Chi phí $C$ phụ thuộc vào sản lượng $Q$ và thỏa mãn phương trình $C^2 - 2CQ + Q^2 - 2Q - 4800 = 0$. Chi phí biên tại $Q = 50$ là:",
        "options": [
          {
            "id": "A",
            "text": "$\\frac{9}{14}$"
          },
          {
            "id": "B",
            "text": "$\\frac{70}{63}$"
          },
          {
            "id": "C",
            "text": "$\\frac{71}{70}$"
          },
          {
            "id": "D",
            "text": "$\\frac{14}{11}$"
          }
        ],
        "correct": "C",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: C."
      },
      {
        "id": "k50-dot-2-q3",
        "section": "Trắc nghiệm",
        "prompt": "Xét phương trình ma trận $AX = B$, trong đó $A = \\begin{bmatrix} 1 & 2 \\\\ m & 4 \\end{bmatrix}$ và $B = \\begin{bmatrix} -1 & 3 \\\\ -2 & 6 \\end{bmatrix}$, với $m$ là tham số thực. Tìm giá trị của $m$ để phương trình đã cho có nghiệm.",
        "options": [
          {
            "id": "A",
            "text": "$m = 2$"
          },
          {
            "id": "B",
            "text": "Không tồn tại $m$"
          },
          {
            "id": "C",
            "text": "$m \\neq 2$"
          },
          {
            "id": "D",
            "text": "$m$ tùy ý"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "k50-dot-2-q4",
        "section": "Trắc nghiệm",
        "prompt": "Cho $A$ và $B$ là các ma trận vuông cấp 4 với $\\text{rank}(A) = 4$ và $\\text{rank}(B) < 4$. Chọn kết luận đúng.",
        "options": [
          {
            "id": "A",
            "text": "$\\text{det}(B^T \\cdot A^3) \\neq 0$"
          },
          {
            "id": "B",
            "text": "Ma trận $C = B^2 + 4B$ là khả nghịch."
          },
          {
            "id": "C",
            "text": "Ma trận $D = A^2 B + AB^2$ có hạng $\\text{rank}(D) < 4$."
          },
          {
            "id": "D",
            "text": "Phương trình $AX = B$ vô nghiệm."
          }
        ],
        "correct": "C",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: C."
      },
      {
        "id": "k50-dot-2-q5",
        "section": "Trắc nghiệm",
        "prompt": "Cho hệ phương trình tuyến tính (I): $\\begin{cases} 2x + (m - 1)y - z = 3 \\\\ 3x + (2m - 1)y - 2z = -2 \\\\ -x - y - z = -m \\end{cases}$ với $m \\in \\mathbb{R}$ là tham số. Tìm $m$ để hệ (I) vô nghiệm hoặc có vô số nghiệm.",
        "options": [
          {
            "id": "A",
            "text": "$m = 3$"
          },
          {
            "id": "B",
            "text": "$m = -1$"
          },
          {
            "id": "C",
            "text": "Không tồn tại $m$"
          },
          {
            "id": "D",
            "text": "$m = -3$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "k50-dot-2-q6",
        "section": "Trắc nghiệm",
        "prompt": "Xét phương trình vi phân $y' + \\frac{2y}{x} = 2\\frac{e^x}{x^2}$ (1). Chọn phát biểu đúng.",
        "options": [
          {
            "id": "A",
            "text": "Phương trình (1) có một nghiệm riêng thỏa điều kiện $y(1) = 2e$ là $y = (e^x - 2e)x^{-2}$."
          },
          {
            "id": "B",
            "text": "Mọi nghiệm $y(x)$ của phương trình (1) đều thỏa mãn $\\lim_{x \\to -\\infty} y(x) = 0$."
          },
          {
            "id": "C",
            "text": "Phương trình (1) có nghiệm tổng quát là $y = (2e^x + C)x^{-2}$."
          },
          {
            "id": "D",
            "text": "Mọi nghiệm $y(x)$ của phương trình (1) đều thỏa mãn $\\lim_{x \\to +\\infty} y(x) = 0$."
          }
        ],
        "correct": "B",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: B."
      },
      {
        "id": "k50-dot-2-q7",
        "section": "Trắc nghiệm",
        "prompt": "Cho hàm sản xuất $Q(L, K) = 8L^{0,3} K^{0,6}$ với $L$ là lượng lao động và $K$ là vốn. Khi $K$ tăng $1,5\\%$ và $L$ không đổi thì $Q$ tăng xấp xỉ:",
        "options": [
          {
            "id": "A",
            "text": "$0,1\\%$"
          },
          {
            "id": "B",
            "text": "$0,9\\%$"
          },
          {
            "id": "C",
            "text": "$0,45\\%$"
          },
          {
            "id": "D",
            "text": "$1,55\\%$"
          }
        ],
        "correct": "B",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: B."
      },
      {
        "id": "k50-dot-2-q8",
        "section": "Trắc nghiệm",
        "prompt": "Xét hàm số $f(x, y) = x^2 y(1 - x - y)$ và điểm $M(1, 0)$. Chọn kết luận đúng.",
        "options": [
          {
            "id": "A",
            "text": "Hàm số $f$ đạt cực đại tại $M$."
          },
          {
            "id": "B",
            "text": "$M$ không phải là điểm dừng của $f$."
          },
          {
            "id": "C",
            "text": "Hàm số $f$ đạt cực trị tại điểm $M$."
          },
          {
            "id": "D",
            "text": "$M$ là điểm dừng nhưng không phải là cực trị của $f$."
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "k50-dot-2-q9",
        "section": "Trắc nghiệm",
        "prompt": "Trong mô hình Input-Output của Leontief, cho ma trận hệ số đầu vào $A = \\begin{bmatrix} 0,1 & 0,2 & 0,3 \\\\ 0,2 & 0,3 & m \\\\ 0,3 & 0,2 & 0,1 \\end{bmatrix}$. Biết rằng giá trị sản lượng của ngành 2 và ngành 3 lần lượt là $200$ và $150$; tổng giá trị nguyên liệu đầu vào của ngành 3 là $75$. Tính tổng giá trị nguyên liệu mà ngành 2 cung cấp cho ngành 3 và ngành 3 cung cấp cho ngành 2.",
        "options": [
          {
            "id": "A",
            "text": "$50$"
          },
          {
            "id": "B",
            "text": "$60$"
          },
          {
            "id": "C",
            "text": "$50$"
          },
          {
            "id": "D",
            "text": "$65$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "k50-dot-2-q10",
        "section": "Trắc nghiệm",
        "prompt": "Cho $A$ là ma trận vuông cấp 3 thỏa mãn $A^2 P_A = 16I_3$, trong đó $P_A$ là ma trận phụ hợp của $A$. Định thức của ma trận $3A^T$ có giá trị là:",
        "options": [
          {
            "id": "A",
            "text": "$\\pm 216$"
          },
          {
            "id": "B",
            "text": "$216$"
          },
          {
            "id": "C",
            "text": "$\\pm 108$"
          },
          {
            "id": "D",
            "text": "$-108$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      }
    ]
  },
  {
    "id": "ap1-f2",
    "title": "Toán Cao Cấp K50 Đợt 1",
    "sourceLabel": "FINAL 2807",
    "sourcePdf": "final 2807.pdf",
    "durationMinutes": 30,
    "description": "Đề K50 đợt 1 trong FINAL 2807, có cờ đánh dấu câu khó và nộp bài tự động khi hết giờ.",
    "questions": [
      {
        "id": "ap1-f2-q1",
        "section": "Trắc nghiệm",
        "prompt": "Câu 1. Hàm tổng chi phí khi sản xuất một sản phẩm cho bởi $c = \\frac{5q^2}{\\sqrt{q^2 + 3}} + 5000$, với $q$ là sản lượng. Tính chi phí biên khi $q = 10$ (làm tròn kết quả đến 2 chữ số thập phân).",
        "options": [
          {
            "id": "A",
            "text": "$4{,}12$"
          },
          {
            "id": "B",
            "text": "$5{,}07$"
          },
          {
            "id": "C",
            "text": "$5{,}84$"
          },
          {
            "id": "D",
            "text": "$4{,}93$"
          }
        ],
        "correct": "B",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: B."
      },
      {
        "id": "ap1-f2-q2",
        "section": "Trắc nghiệm",
        "prompt": "Câu 2. Cho ma trận $A = \\begin{bmatrix} -4 & -3 & x \\\\ 1 & 0 & 1 \\\\ 4 & 4 & 3 \\end{bmatrix}$ với $x$ là một số thực và $P_A$ là ma trận phụ hợp của $A$. Giả sử $P_A = A$. Chọn phát biểu đúng.",
        "options": [
          {
            "id": "A",
            "text": "$|A| = 1$"
          },
          {
            "id": "B",
            "text": "$|A| = -7$"
          },
          {
            "id": "C",
            "text": "$|A| = 25$"
          },
          {
            "id": "D",
            "text": "$|A| = 33$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f2-q3",
        "section": "Trắc nghiệm",
        "prompt": "Câu 3. Cho các ma trận $A = \\begin{bmatrix} 1 & 1 & 1 \\\\ 2 & 3 & 4 \\\\ m & 5 & 6 \\end{bmatrix}$ và $B = A^2 - A$. Tìm các giá trị của $m$ để $B$ khả nghịch.",
        "options": [
          {
            "id": "A",
            "text": "$m \\neq 0$"
          },
          {
            "id": "B",
            "text": "$m \\neq 4$"
          },
          {
            "id": "C",
            "text": "$m$ tùy ý"
          },
          {
            "id": "D",
            "text": "$m \\neq 0$ và $m \\neq 4$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "ap1-f2-q4",
        "section": "Trắc nghiệm",
        "prompt": "Câu 4. Giả sử giá trị lớn nhất của hàm số $z = f(x, y) = -x^2 - xy - y^2 + 3x + my - 2m$ ($m$ là tham số) bằng $z_M$ và đạt được tại điểm $(1, 1)$. Chọn phát biểu đúng.",
        "options": [
          {
            "id": "A",
            "text": "$z_M = 3$"
          },
          {
            "id": "B",
            "text": "$z_M = -3$"
          },
          {
            "id": "C",
            "text": "$z_M = -4$"
          },
          {
            "id": "D",
            "text": "$z_M = 4$"
          }
        ],
        "correct": "B",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: B."
      },
      {
        "id": "ap1-f2-q5",
        "section": "Trắc nghiệm",
        "prompt": "Câu 5. Chi tiêu $C$ của một thành phố phụ thuộc vào thu nhập $I$ của thành phố đó. Mối liên hệ được xác định bởi phương trình $C^2 + \\frac{1}{4}I^2 = IC + \\frac{3}{2}I$. Biết rằng phần chi tiêu lớn hơn 50% thu nhập. Tính giá trị chi tiêu biên (biên tế của hàm chi tiêu) khi $I = 24$.",
        "options": [
          {
            "id": "A",
            "text": "$MC = \\frac{3}{4}$"
          },
          {
            "id": "B",
            "text": "$MC = \\frac{1}{4}$"
          },
          {
            "id": "C",
            "text": "$MC = \\frac{3}{8}$"
          },
          {
            "id": "D",
            "text": "$MC = \\frac{5}{8}$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "ap1-f2-q6",
        "section": "Trắc nghiệm",
        "prompt": "Câu 6. Cho hệ phương trình tuyến tính $\\begin{cases} x + 2y + 3z = 1 \\\\ 2x + 5y + 8z = 4 \\\\ x + 3y + mz = 4 \\end{cases}$ với $m \\in \\mathbb{R}$ là một tham số. Phát biểu nào sau đây là sai?",
        "options": [
          {
            "id": "A",
            "text": "Hệ có nghiệm với mọi $m$."
          },
          {
            "id": "B",
            "text": "Không có $m$ để hệ có vô số nghiệm."
          },
          {
            "id": "C",
            "text": "Tồn tại $m$ để hệ có nghiệm."
          },
          {
            "id": "D",
            "text": "Tồn tại $m$ để hệ có nghiệm duy nhất."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f2-q7",
        "section": "Trắc nghiệm",
        "prompt": "Câu 7. Xét mô hình Input-Output gồm ba ngành với ma trận hệ số đầu vào $\\begin{bmatrix} 0{,}1 & 0{,}4 & 0{,}2 \\\\ 0{,}3 & 0{,}2 & m \\\\ 0{,}2 & 0{,}1 & 0{,}3 \\end{bmatrix}$ với $m \\in \\mathbb{R}$ là tham số. Biết rằng giá trị sản lượng của ba ngành lần lượt là 200, 240, 120, và giá trị nguyên liệu ngành 2 cung cấp cho ngành 3 bằng hai lần giá trị nguyên liệu ngành 3 cung cấp cho ngành 2. Tính tổng giá trị nguyên liệu đầu vào của ngành 3.",
        "options": [
          {
            "id": "A",
            "text": "$66$"
          },
          {
            "id": "B",
            "text": "$100$"
          },
          {
            "id": "C",
            "text": "$84$"
          },
          {
            "id": "D",
            "text": "$108$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "ap1-f2-q8",
        "section": "Trắc nghiệm",
        "prompt": "Câu 8. Cho $A$ là ma trận vuông cấp 3 thỏa mãn $A^T \\cdot P_A = 4I_3$, trong đó $P_A$ là ma trận phụ hợp của $A$. Khi đó $\\det\\left(\\frac{1}{4}A\\right)^{-1}$ là:",
        "options": [
          {
            "id": "A",
            "text": "$1$"
          },
          {
            "id": "B",
            "text": "$\\frac{1}{64}$"
          },
          {
            "id": "C",
            "text": "$4^4$"
          },
          {
            "id": "D",
            "text": "$16$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "ap1-f2-q9",
        "section": "Trắc nghiệm",
        "prompt": "Câu 9. Xét hàm sản xuất $Q = K^{0{,}25} L^{0{,}75}$, trong đó $Q$ là sản lượng, $K$ là lượng vốn và $L$ là lượng lao động. Ký hiệu $MQ_K$ và $MQ_L$ lần lượt là sản lượng biên theo vốn và theo lao động. Phát biểu nào sau đây là sai?",
        "options": [
          {
            "id": "A",
            "text": "Khi $K = L$ thì $MQ_K < MQ_L$."
          },
          {
            "id": "B",
            "text": "Khi $K < L$ thì $MQ_K < \\frac{1}{4}$."
          },
          {
            "id": "C",
            "text": "Khi $K = L$ thì $MQ_K + MQ_L = 1$."
          },
          {
            "id": "D",
            "text": "Khi $K < L$ thì $MQ_L < \\frac{3}{4}$."
          }
        ],
        "correct": "B",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: B."
      },
      {
        "id": "ap1-f2-q10",
        "section": "Trắc nghiệm",
        "prompt": "Câu 10. Xét phương trình vi phân $y' - \\frac{y}{x} = x \\sin x$. Phát biểu nào sau đây là đúng?",
        "options": [
          {
            "id": "A",
            "text": "Mọi nghiệm của phương trình thỏa $y(-x) = y(x)$."
          },
          {
            "id": "B",
            "text": "Phương trình có nghiệm riêng $y = x \\sin x$."
          },
          {
            "id": "C",
            "text": "Mọi nghiệm của phương trình thỏa $y(-x) = -y(x)$."
          },
          {
            "id": "D",
            "text": "Phương trình có nghiệm riêng $y = x \\cos x$."
          }
        ],
        "correct": "C",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: C."
      }
    ]
  },
  {
    "id": "ap1-f1",
    "title": "Toán Cao Cấp K50 Đợt 1 Mã Đề Khác",
    "sourceLabel": "FINAL 2807",
    "sourcePdf": "final 2807.pdf",
    "durationMinutes": 30,
    "description": "Mã đề khác của K50 đợt 1 trong FINAL 2807, đưa vào chế độ làm bài kiểm tra.",
    "questions": [
      {
        "id": "ap1-f1-q1",
        "section": "Trắc nghiệm",
        "prompt": "Câu 1. Nghiệm tổng quát của phương trình vi phân $y' + \\frac{y}{x} = \\frac{\\sin x}{x}$ là",
        "options": [
          {
            "id": "A",
            "text": "$\\frac{C + \\cos x}{x}, C \\in \\mathbb{R}$"
          },
          {
            "id": "B",
            "text": "$x(C + \\cos x), C \\in \\mathbb{R}$"
          },
          {
            "id": "C",
            "text": "$\\frac{C - \\cos x}{x}, C \\in \\mathbb{R}$"
          },
          {
            "id": "D",
            "text": "$x(C + \\sin x), C \\in \\mathbb{R}$"
          }
        ],
        "correct": "C",
        "explanation": "Đáp án đúng là C. Giải chi tiết: Phương trình vi phân $y' + \\frac{y}{x} = \\frac{\\sin x}{x}$ có nghiệm tổng quát là $y = \\frac{C - \\cos x}{x}, C \\in \\mathbb{R}$."
      },
      {
        "id": "ap1-f1-q2",
        "section": "Trắc nghiệm",
        "prompt": "Câu 2. Cho $g(x) = f(x^3 - 3x)$ khả vi trên $\\mathbb{R}$ và $f'(x) > 0, \\forall x$. Chọn phát biểu đúng.",
        "options": [
          {
            "id": "A",
            "text": "Hàm $g$ đạt cực đại tại $-1$."
          },
          {
            "id": "B",
            "text": "Hàm $g$ đạt cực đại tại $1$."
          },
          {
            "id": "C",
            "text": "Hàm $g$ tăng trên $(0, +\\infty)$."
          },
          {
            "id": "D",
            "text": "Hàm $g$ giảm trên $(-\\infty, -3)$."
          }
        ],
        "correct": "A",
        "explanation": "Ta có $g'(x) = 3(x^2 - 1)f'(x^3 - 3x)$. Vì $f'(t) > 0, \\forall t$ nên dấu của $g'(x)$ cùng dấu với biểu thức $3(x^2 - 1)$. Bảng xét dấu của $g'(x)$ cho thấy $g'(x)$ đổi chiều từ dương sang âm tại $x = -1$, do đó hàm số $g(x)$ đạt cực đại tại $x = -1$."
      },
      {
        "id": "ap1-f1-q3",
        "section": "Trắc nghiệm",
        "prompt": "Câu 3. Cho $A$ và $B$ là các ma trận vuông cấp $n$ thỏa mãn $A^2 = I_n = B^2$. Chọn phát biểu sai.",
        "options": [
          {
            "id": "A",
            "text": "$(AB)^{-1} = BA$"
          },
          {
            "id": "B",
            "text": "$AB^{-1} = A^{-1}B$"
          },
          {
            "id": "C",
            "text": "$A = \\pm B$"
          },
          {
            "id": "D",
            "text": "$|\\det(A)| = |\\det(B)|$"
          }
        ],
        "correct": "C",
        "explanation": "Từ giả thiết $A^2 = I_n$ và $B^2 = I_n$, ta có $A^{-1} = A$ và $B^{-1} = B$. Do đó:\\n- $(AB)^{-1} = B^{-1}A^{-1} = BA$ (đúng).\\n- $AB^{-1} = AB = A^{-1}B$ (đúng).\\n- $\\det(A)^2 = \\det(I_n) = 1 \\implies |\\det(A)| = 1$. Tương tự, $|\\det(B)| = 1$. Suy ra $|\\det(A)| = |\\det(B)|$ (đúng).\\n- Hệ thức $A = \\pm B$ không nhất thiết đúng (ví dụ $A = \\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$ và $B = I_2$ đều có bình phương bằng $I_2$ nhưng $A \\neq \\pm B$)."
      },
      {
        "id": "ap1-f1-q4",
        "section": "Trắc nghiệm",
        "prompt": "Câu 4. Giả sử giá trị nhỏ nhất của hàm số $z = f(x, y) = x^2 + xy + y^2 - 3x - my + 2m$ ($m$ là tham số) có giá trị bằng $z_M$ và đạt được tại điểm $M(1, 1)$. Chọn phát biểu đúng.",
        "options": [
          {
            "id": "A",
            "text": "$z_M = 3$"
          },
          {
            "id": "B",
            "text": "$z_M = 4$"
          },
          {
            "id": "C",
            "text": "$z_M = -3$"
          },
          {
            "id": "D",
            "text": "$z_M = -4$"
          }
        ],
        "correct": "A",
        "explanation": "Điểm $M(1, 1)$ phải là điểm dừng của hàm số $f(x, y)$, do đó ta có hệ điều kiện cần:\\n$\\begin{cases} \\frac{\\partial f}{\\partial x}(1, 1) = 0 \\\\ \\frac{\\partial f}{\\partial y}(1, 1) = 0 \\end{cases} \\implies \\begin{cases} 2(1) + 1 - 3 = 0 \\\\ 1 + 2(1) - m = 0 \\end{cases} \\implies m = 3$.\\nKhi đó, giá trị nhỏ nhất của hàm số là $z_M = f(1, 1) = 1^2 + 1\\cdot 1 + 1^2 - 3(1) - 3(1) + 2(3) = 3$."
      },
      {
        "id": "ap1-f1-q5",
        "section": "Trắc nghiệm",
        "prompt": "Câu 5. Trong mô hình Input - Output mở, cho ma trận hệ số đầu vào\\n$A = \\begin{bmatrix} 0.1 & 0.3 & 0.3 \\\\ 0.2 & 0.2 & 0.2 \\\\ 0.3 & 0.3 & 0.2 \\end{bmatrix}$\\nBiết ngành 3 cung cấp 60 (đvt) cho ngành 2. Khi đó ngành 2 phải cung cấp cho chính nó là",
        "options": [
          {
            "id": "A",
            "text": "$30$"
          },
          {
            "id": "B",
            "text": "$20$"
          },
          {
            "id": "C",
            "text": "$40$"
          },
          {
            "id": "D",
            "text": "$50$"
          }
        ],
        "correct": "C",
        "explanation": "Gọi $x_2$ là tổng sản lượng của ngành 2. Theo công thức của mô hình Input - Output, lượng sản phẩm ngành 3 cung cấp cho ngành 2 là $x_{32} = a_{32} x_2$.\\nTừ ma trận $A$, ta có $a_{32} = 0.3$. Do đó:\\n$60 = 0.3 x_2 \\implies x_2 = 200$.\\nLượng sản phẩm ngành 2 tự cung cấp cho chính nó là:\\n$x_{22} = a_{22} x_2 = 0.2 \\cdot 200 = 40$."
      },
      {
        "id": "ap1-f1-q6",
        "section": "Trắc nghiệm",
        "prompt": "Câu 6. Cho hệ phương trình (I): $\\begin{cases} mx - y + 4z = -3 \\\\ x + y + 2z = 2m \\\\ 2mx - 3y + 4z = m \\end{cases}$. Hệ (I) có nghiệm duy nhất nếu và chỉ nếu",
        "options": [
          {
            "id": "A",
            "text": "$m \\neq -4$"
          },
          {
            "id": "B",
            "text": "$m \\neq 2$"
          },
          {
            "id": "C",
            "text": "$m = 2$"
          },
          {
            "id": "D",
            "text": "$m \\neq 4$"
          }
        ],
        "correct": "A",
        "explanation": "Hệ phương trình tuyến tính (I) có nghiệm duy nhất khi và chỉ khi định thức của ma trận hệ số khác 0:\\n$D = \\det \\begin{bmatrix} m & -1 & 4 \\\\ 1 & 1 & 2 \\\\ 2m & -3 & 4 \\end{bmatrix} \\neq 0$.\\nTa tính định thức bằng cách khai triển hoặc biến đổi:\\n$D = m(4 + 6) + 1(4 - 4m) + 4(-3 - 2m) = 10m + 4 - 4m - 12 - 8m = -2m - 8$.\\nĐiều kiện để hệ có nghiệm duy nhất là $D \\neq 0 \\implies -2m - 8 \\neq 0 \\implies m \\neq -4$."
      },
      {
        "id": "ap1-f1-q7",
        "section": "Trắc nghiệm",
        "prompt": "Câu 7. Cho hàm số $u(x, y)$ có các đạo hàm riêng cấp một liên tục trên $\\mathbb{R}^2$. Giả sử ta có điều kiện $6x^2 + 5y^2 = 230$ (1). Điều kiện cần để $u$ đạt cực trị tại $(x, y)$ thỏa mãn điều kiện (1) là",
        "options": [
          {
            "id": "A",
            "text": "$6y u'_x = 5x u'_y$"
          },
          {
            "id": "B",
            "text": "$5x u'_x = 6y u'_y$"
          },
          {
            "id": "C",
            "text": "Các đáp án kia đều sai."
          },
          {
            "id": "D",
            "text": "$5y u'_x = 6x u'_y$"
          }
        ],
        "correct": "D",
        "explanation": "Đặt điều kiện ràng buộc là $g(x, y) = 6x^2 + 5y^2 - 230 = 0$. Theo phương pháp nhân tử Lagrange, điều kiện cần để hàm số đạt cực trị có điều kiện là tồn tại $\\lambda$ sao cho:\\n$\\begin{cases} u'_x = \\lambda g'_x \\\\ u'_y = \\lambda g'_y \\end{cases} \\implies \\begin{cases} u'_x = 12\\lambda x \\\\ u'_y = 10\\lambda y \\end{cases}$\\nNhân phương trình đầu với $5y$ và phương trình sau với $6x$, ta được:\\n$5y u'_x = 60\\lambda xy$ và $6x u'_y = 60\\lambda xy$. Suy ra $5y u'_x = 6x u'_y$."
      },
      {
        "id": "ap1-f1-q8",
        "section": "Trắc nghiệm",
        "prompt": "Câu 8. Cho $A$ là ma trận vuông cấp 4 thỏa mãn $(A^T)^3 A = 3I_4$. Định thức của ma trận $\\left( \\frac{1}{6} A^T \\right)^{-1}$ có giá trị",
        "options": [
          {
            "id": "A",
            "text": "$432$"
          },
          {
            "id": "B",
            "text": "$\\pm 432$"
          },
          {
            "id": "C",
            "text": "$-216$"
          },
          {
            "id": "D",
            "text": "$\\pm 216$"
          }
        ],
        "correct": "B",
        "explanation": "Từ giả thiết $(A^T)^3 A = 3I_4$, lấy định thức hai vế:\\n$\\det((A^T)^3 A) = \\det(3I_4) \\implies (\\det A)^3 \\cdot \\det A = 3^4 \\cdot \\det(I_4) \\implies (\\det A)^4 = 81 \\implies \\det A = \\pm 3$.\\nĐịnh thức của ma trận cần tìm là:\\n$\\det\\left( \\left( \\frac{1}{6} A^T \\right)^{-1} \\right) = \\frac{1}{\\det\\left( \\frac{1}{6} A^T \\right)} = \\frac{1}{6^{-4} \\cdot \\det(A^T)} = \\frac{1296}{\\det A} = \\frac{1296}{\\pm 3} = \\pm 432$."
      },
      {
        "id": "ap1-f1-q9",
        "section": "Trắc nghiệm",
        "prompt": "Câu 9. Hàm tổng chi phí khi sản xuất một sản phẩm cho bởi $C = \\frac{3Q^2}{\\sqrt{Q^2 + 5}} + 1000$, với $Q$ là sản lượng. Tính chi phí biên khi $Q = 10$ (làm tròn kết quả đến 2 chữ số thập phân).",
        "options": [
          {
            "id": "A",
            "text": "$4.32$"
          },
          {
            "id": "B",
            "text": "$4.75$"
          },
          {
            "id": "C",
            "text": "$3.07$"
          },
          {
            "id": "D",
            "text": "$5.12$"
          }
        ],
        "correct": "C",
        "explanation": "Chi phí biên là đạo hàm bậc nhất của hàm tổng chi phí theo $Q$:\\n$MC(Q) = C'(Q) = \\left( \\frac{3Q^2}{\\sqrt{Q^2 + 5}} + 1000 \\right)'$\\n$= \\frac{(3Q^2)' \\sqrt{Q^2 + 5} - 3Q^2 \\left( \\sqrt{Q^2 + 5} \\right)'}{Q^2 + 5} = \\frac{6Q\\sqrt{Q^2+5} - 3Q^2 \\cdot \\frac{Q}{\\sqrt{Q^2+5}}}{Q^2 + 5} = \\frac{3Q^3 + 30Q}{(Q^2 + 5)^{3/2}}$.\\nTại $Q = 10$, ta có:\\n$MC(10) = \\frac{3(10)^3 + 30(10)}{(10^2 + 5)^{3/2}} = \\frac{3300}{105^{3/2}} \\approx 3.07$."
      },
      {
        "id": "ap1-f1-q10",
        "section": "Trắc nghiệm",
        "prompt": "Câu 10. Giả sử $x = \\begin{bmatrix} x_1 \\\\ x_2 \\end{bmatrix}$ là nghiệm của hệ phương trình $\\begin{cases} -x_1 - 2x_2 = 1 \\\\ 2x_1 + 3x_2 = -1 \\end{cases}$ (*). Gọi $A$ là ma trận hệ số của (*). Tính $A^{2025} x$.",
        "options": [
          {
            "id": "A",
            "text": "$\\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix}$"
          },
          {
            "id": "B",
            "text": "$\\begin{bmatrix} 2025 \\\\ 2024 \\end{bmatrix}$"
          },
          {
            "id": "C",
            "text": "$\\begin{bmatrix} 1 \\\\ -1 \\end{bmatrix}$"
          },
          {
            "id": "D",
            "text": "$\\begin{bmatrix} 2024 \\\\ 2025 \\end{bmatrix}$"
          }
        ],
        "correct": "C",
        "explanation": "Giải hệ phương trình (*):\\n$\\begin{cases} -x_1 - 2x_2 = 1 \\\\ 2x_1 + 3x_2 = -1 \\end{cases} \\implies \\begin{cases} x_1 = 1 \\\\ x_2 = -1 \\end{cases} \\implies x = \\begin{bmatrix} 1 \\\\ -1 \\end{bmatrix}$.\\nMa trận hệ số của (*) là $A = \\begin{bmatrix} -1 & -2 \\\\ 2 & 3 \\end{bmatrix}$.\\nTa có:\\n$Ax = \\begin{bmatrix} -1 & -2 \\\\ 2 & 3 \\end{bmatrix} \\begin{bmatrix} 1 \\\\ -1 \\end{bmatrix} = \\begin{bmatrix} -1(1) - 2(-1) \\\\ 2(1) + 3(-1) \\end{bmatrix} = \\begin{bmatrix} 1 \\\\ -1 \\end{bmatrix} = x$.\\nVì $Ax = x$, ta suy ra $A^{2025} x = x = \\begin{bmatrix} 1 \\\\ -1 \\end{bmatrix}$."
      }
    ]
  },
  {
    "id": "ap1-f3",
    "title": "Toán Cao Cấp K49 Mã Đề 1",
    "sourceLabel": "FINAL 2807",
    "sourcePdf": "final 2807.pdf",
    "durationMinutes": 30,
    "description": "Đề K49 mã đề 1 trong FINAL 2807, dùng để luyện phản xạ làm bài cuối kỳ.",
    "questions": [
      {
        "id": "ap1-f3-q1",
        "section": "Trắc nghiệm",
        "prompt": "Câu 1. Cho $y = y(x)$ là hàm ẩn xác định bởi phương trình $4x^2 + xy^3 - 5x + 3y + 4ye^x - 7 = 0$. Đạo hàm của $y$ tại $x = 0$ có giá trị là",
        "options": [
          {
            "id": "A",
            "text": "$0$"
          },
          {
            "id": "B",
            "text": "$1$"
          },
          {
            "id": "C",
            "text": "$-\\frac{5}{7}$"
          },
          {
            "id": "D",
            "text": "$\\frac{4}{7}$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f3-q2",
        "section": "Trắc nghiệm",
        "prompt": "Câu 2. Cho $A, B, C$ là các ma trận vuông cấp $3$. Giả sử $|A| = -2$, $|B| = 3$, $|C| = -4$. Định thức của ma trận $2A^3 B^T C^{-1}$ có giá trị là",
        "options": [
          {
            "id": "A",
            "text": "$-48$"
          },
          {
            "id": "B",
            "text": "$48$"
          },
          {
            "id": "C",
            "text": "$16$"
          },
          {
            "id": "D",
            "text": "$3$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f3-q3",
        "section": "Trắc nghiệm",
        "prompt": "Câu 3. Cho hàm số $z = f(x, y) = 4x^2 + y^2 - 4mx - 2my + 2m^2 + 2m - 1$ ($m$ là tham số). Tìm $m$ để giá trị nhỏ nhất của $f$ trên toàn bộ mặt phẳng lớn hơn hay bằng $5$.",
        "options": [
          {
            "id": "A",
            "text": "Không tồn tại $m$"
          },
          {
            "id": "B",
            "text": "$m \\ge 2$"
          },
          {
            "id": "C",
            "text": "$m \\ge 3$"
          },
          {
            "id": "D",
            "text": "$m = 1$"
          }
        ],
        "correct": "C",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: C."
      },
      {
        "id": "ap1-f3-q4",
        "section": "Trắc nghiệm",
        "prompt": "Câu 4. Xét phương trình vi phân $y' - 3y = 2xe^{3x}$. Phát biểu nào sau đây là đúng?",
        "options": [
          {
            "id": "A",
            "text": "Nghiệm tổng quát của phương trình là $y = (3x^2 + C)e^{3x}$."
          },
          {
            "id": "B",
            "text": "Nghiệm riêng thỏa điều kiện $y(0) = 2$ của phương trình là $y = (x^2 - 3)e^{3x}$."
          },
          {
            "id": "C",
            "text": "Nghiệm riêng thỏa điều kiện $y(0) = 1$ của phương trình là $y = (-3x^2 + 1)e^{3x}$."
          },
          {
            "id": "D",
            "text": "Nghiệm riêng thỏa điều kiện $y(1) = 2e^3$ của phương trình là $y = (x^2 + 1)e^{3x}$."
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "ap1-f3-q5",
        "section": "Trắc nghiệm",
        "prompt": "Câu 5. Cho $A$ là ma trận vuông cấp $3$, không suy biến. Giả sử $B$ là ma trận phù hợp của $A$ và $|B| = 16$. Phát biểu nào sau đây là đúng?",
        "options": [
          {
            "id": "A",
            "text": "$BA = -4$"
          },
          {
            "id": "B",
            "text": "$AB = I_3$"
          },
          {
            "id": "C",
            "text": "$BA = \\pm \\frac{1}{4}I_3$"
          },
          {
            "id": "D",
            "text": "$AB = \\pm 4I_3$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "ap1-f3-q6",
        "section": "Trắc nghiệm",
        "prompt": "Câu 6. Xét mô hình input-output gồm ba ngành kinh tế với ma trận hệ số đầu vào là $A = \\begin{bmatrix} 0{,}1 & 0{,}4 & m \\\\ 0{,}3 & 0{,}2 & 0{,}1 \\\\ 0{,}2 & 0{,}1 & 0{,}3 \\end{bmatrix}$.\n- Giá trị sản lượng của $3$ ngành lần lượt là $210$, $200$, $180$.\n- Tổng giá trị nguyên liệu đầu vào của ngành $3$ là $108$.\nTính tổng giá trị nguyên liệu mà ngành $1$ cung cấp cho cả ba ngành.",
        "options": [
          {
            "id": "A",
            "text": "$142$"
          },
          {
            "id": "B",
            "text": "$154$"
          },
          {
            "id": "C",
            "text": "$164$"
          },
          {
            "id": "D",
            "text": "$137$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "ap1-f3-q7",
        "section": "Trắc nghiệm",
        "prompt": "Câu 7. Cho ma trận $A = \\begin{bmatrix} 0 & 2 & 3 \\\\ 2 & 2 & 1 \\\\ m & 3 & 3 \\end{bmatrix}$. Khi đó $(A - I_3)^2$ suy biến khi và chỉ khi",
        "options": [
          {
            "id": "A",
            "text": "$m = 10$"
          },
          {
            "id": "B",
            "text": "$m = -15$"
          },
          {
            "id": "C",
            "text": "$m = 11$"
          },
          {
            "id": "D",
            "text": "$m = -11$"
          }
        ],
        "correct": "C",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: C."
      },
      {
        "id": "ap1-f3-q8",
        "section": "Trắc nghiệm",
        "prompt": "Câu 8. Một nhà máy sản xuất một mặt hàng, sử dụng nguyên liệu thô là thép. Hàm doanh thu được xác định bởi $R = 36x^{2/3} y^{1/3}$, trong đó $x$ là số giờ lao động và $y$ là số tấn thép được sử dụng. Khi $x = 8$ và $y = 125$, phát biểu nào sau đây là đúng?",
        "options": [
          {
            "id": "A",
            "text": "Nếu lượng thép giảm $6\\%$ và số giờ lao động không đổi thì doanh thu giảm xấp xỉ $4\\%$."
          },
          {
            "id": "B",
            "text": "Nếu giảm $1$ tấn thép và số giờ lao động không đổi thì doanh thu giảm xấp xỉ $5$ đơn vị."
          },
          {
            "id": "C",
            "text": "Nếu tăng thêm $1$ giờ lao động và lượng thép không đổi thì doanh thu tăng xấp xỉ $80$ đơn vị."
          },
          {
            "id": "D",
            "text": "Nếu giờ lao động tăng $6\\%$ và lượng thép không đổi thì doanh thu tăng xấp xỉ $4\\%$."
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "ap1-f3-q9",
        "section": "Trắc nghiệm",
        "prompt": "Câu 9. Cho $A$ là ma trận vuông cấp $n$, khả nghịch. Giả sử $B$ là ma trận nhận được từ $A$ bằng cách thay dòng $1$ bằng cách lấy $-2$ nhân với dòng $1$ rồi cộng với $3$ lần dòng $2$. Phát biểu nào sau đây là sai?",
        "options": [
          {
            "id": "A",
            "text": "Hệ $AX = 0$ có vô số nghiệm $\\implies$ hệ $BX = 0$ có vô số nghiệm."
          },
          {
            "id": "B",
            "text": "$\\det(A^T) = \\det(B)$."
          },
          {
            "id": "C",
            "text": "$\\text{rank}(-2A) = \\text{rank}(B)$."
          },
          {
            "id": "D",
            "text": "$\\text{rank}(A) = \\text{rank}(-2B)$."
          }
        ],
        "correct": "B",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: B."
      },
      {
        "id": "ap1-f3-q10",
        "section": "Trắc nghiệm",
        "prompt": "Câu 10. Giả sử hàm chi phí sản xuất của một xí nghiệp là $C = C(Q)$, với $Q$ là sản lượng, có đạo hàm tại mọi $Q > 0$. Biết rằng chi phí trung bình $\\overline{C} = \\frac{C(Q)}{Q}$ đạt giá trị nhỏ nhất là $20000$ khi $Q = Q_0 = 400$. Xác định chi phí biên tại $Q_0$.",
        "options": [
          {
            "id": "A",
            "text": "$20000$"
          },
          {
            "id": "B",
            "text": "$25000$"
          },
          {
            "id": "C",
            "text": "$50$"
          },
          {
            "id": "D",
            "text": "Chưa đủ điều kiện để xác định."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      }
    ]
  },
  {
    "id": "ap1-f4",
    "title": "Toán Cao Cấp K49 Mã Đề 2",
    "sourceLabel": "FINAL 2807",
    "sourcePdf": "final 2807.pdf",
    "durationMinutes": 30,
    "description": "Đề K49 mã đề 2 trong FINAL 2807, có một câu được giữ đúng ghi chú đáp án của tài liệu nguồn.",
    "questions": [
      {
        "id": "ap1-f4-q1",
        "section": "Trắc nghiệm",
        "prompt": "Xét ma trận $A = \\begin{bmatrix} -1 & 1 & -2 \\\\ m & 1 & 0 \\\\ 2 & -1 & -4 \\end{bmatrix}$ với $m \\in \\mathbb{R}$. Khi đó, ma trận $A^2 - A$ suy biến khi và chỉ khi:",
        "options": [
          {
            "id": "A",
            "text": "$m = -3/4$"
          },
          {
            "id": "B",
            "text": "$m = -4/3$"
          },
          {
            "id": "C",
            "text": "Với mọi $m \\in \\mathbb{R}$"
          },
          {
            "id": "D",
            "text": "$m = -4/3 \\vee m = 0$"
          }
        ],
        "correct": "D",
        "explanation": "Ma trận $A^2 - A$ suy biến khi và chỉ khi $\\det(A^2 - A) = 0 \\iff \\det(A)\\det(A - I) = 0$.\n\nTính $\\det(A)$:\n$$\\det(A) = \\begin{vmatrix} -1 & 1 & -2 \\\\ m & 1 & 0 \\\\ 2 & -1 & -4 \\end{vmatrix} = -1(-4 - 0) - 1(-4m - 0) - 2(-m - 2) = 4 + 4m + 2m + 4 = 6m + 8.$$\n\nTính $\\det(A - I)$:\n$$\\det(A - I) = \\begin{vmatrix} -2 & 1 & -2 \\\\ m & 0 & 0 \\\\ 2 & -1 & -5 \\end{vmatrix} = -m(-5 - 2) = 7m.$$\n\nDo đó, $\\det(A^2 - A) = 0 \\iff (6m + 8)(7m) = 0 \\iff m = -\\frac{4}{3}$ hoặc $m = 0$.\n\nChọn đáp án D."
      },
      {
        "id": "ap1-f4-q2",
        "section": "Trắc nghiệm",
        "prompt": "Cho $A$ là một ma trận vuông cấp $n \\ge 2$. Ký hiệu $P_A$ là ma trận phù hợp của ma trận $A$. Cho biết $\\det(P_A) = -27$ và $\\det(2A) = -48$. Hãy chọn kết quả đúng.",
        "options": [
          {
            "id": "A",
            "text": "$|A| = -6$"
          },
          {
            "id": "B",
            "text": "$|A| = -12$"
          },
          {
            "id": "C",
            "text": "$n = 4$"
          },
          {
            "id": "D",
            "text": "$n = 3$"
          }
        ],
        "correct": "C",
        "explanation": "Với ma trận vuông $A$ cấp $n$, ta có các công thức:\n- $\\det(P_A) = |A|^{n-1} = -27$.\n- $\\det(2A) = 2^n |A| = -48 \\implies |A| = \\frac{-48}{2^n}$.\n\nThay $|A|$ vào phương trình thứ nhất:\n$$\\left( \\frac{-48}{2^n} \\right)^{n-1} = -27.$$\n\n- Nếu $n = 4$, ta có: $\\left( \\frac{-48}{16} \\right)^3 = (-3)^3 = -27$ (thỏa mãn). Khi đó $|A| = -3$.\n- Nếu $n = 3$, ta có: $\\left( \\frac{-48}{8} \\right)^2 = (-6)^2 = 36 \\neq -27$.\n\nVậy $n = 4$ và $|A| = -3$.\n\nChọn đáp án C."
      },
      {
        "id": "ap1-f4-q3",
        "section": "Trắc nghiệm",
        "prompt": "Cho $A, B, C$ là các ma trận vuông cấp $4$ thỏa mãn $|A| = -3$, $|B| = 2$, $|C| = 4$. Đặt ma trận $M = 2A^2 \\cdot B^T \\cdot C^{-1}$. Chọn kết quả đúng.",
        "options": [
          {
            "id": "A",
            "text": "$|M| = 144$"
          },
          {
            "id": "B",
            "text": "$|M| = 72$"
          },
          {
            "id": "C",
            "text": "$|M| = 36$"
          },
          {
            "id": "D",
            "text": "$|M| = 9$"
          }
        ],
        "correct": "B",
        "explanation": "Ta có:\n$$|M| = |2A^2 \\cdot B^T \\cdot C^{-1}| = 2^4 \\cdot |A|^2 \\cdot |B^T| \\cdot |C^{-1}| = 16 \\cdot |A|^2 \\cdot |B| \\cdot \\frac{1}{|C|}.$$\n\nThay các giá trị $|A| = -3$, $|B| = 2$, $|C| = 4$ vào:\n$$|M| = 16 \\cdot (-3)^2 \\cdot 2 \\cdot \\frac{1}{4} = 16 \\cdot 9 \\cdot 2 \\cdot \\frac{1}{4} = 72.$$\n\nChọn đáp án B."
      },
      {
        "id": "ap1-f4-q4",
        "section": "Trắc nghiệm",
        "prompt": "Cho ma trận $A = \\begin{bmatrix} 1 & 0 & 1 \\\\ 1 & 1 & 0 \\\\ m & -1 & 1 \\end{bmatrix}$ với $m \\in \\mathbb{R}$. Khi $A$ khả nghịch, ta đặt $A^{-1} = (b_{ij})_{3 \\times 3}$. Hãy chọn phát biểu đúng.",
        "options": [
          {
            "id": "A",
            "text": "$b_{23} = 1$"
          },
          {
            "id": "B",
            "text": "$b_{32} = -1$"
          },
          {
            "id": "C",
            "text": "$b_{22} = m$"
          },
          {
            "id": "D",
            "text": "$\\det(A) = m$"
          },
          {
            "id": "E",
            "text": "Đề gốc không có đáp án đúng"
          }
        ],
        "correct": "E",
        "explanation": "Tính định thức của ma trận $A$:\n$$\\det(A) = 1(1 - 0) - 0 + 1(-1 - m) = 1 - 1 - m = -m.$$\n\nĐể $A$ khả nghịch thì $\\det(A) \\neq 0 \\iff m \\neq 0$. Khi đó ta tìm các phần tử của $A^{-1} = \\frac{1}{\\det(A)} C^T$:\n- $b_{23} = \\frac{1}{\\det(A)} C_{32} = \\frac{-1}{m} \\cdot \\left( -\\begin{vmatrix} 1 & 1 \\\\ 1 & 0 \\end{vmatrix} \\right) = \\frac{-1}{m} \\cdot 1 = -\\frac{1}{m}$.\n- $b_{32} = \\frac{1}{\\det(A)} C_{23} = \\frac{-1}{m} \\cdot \\left( -\\begin{vmatrix} 1 & 0 \\\\ m & -1 \\end{vmatrix} \\right) = \\frac{-1}{m} \\cdot 1 = -\\frac{1}{m}$.\n- $b_{22} = \\frac{1}{\\det(A)} C_{22} = \\frac{-1}{m} \\cdot \\begin{vmatrix} 1 & 1 \\\\ m & 1 \\end{vmatrix} = \\frac{m-1}{m}$.\n\nĐối chiếu với các phương án:\n- A: $b_{23} = 1 \\iff m = -1$.\n- B: $b_{32} = -1 \\iff m = 1$.\n- C: $b_{22} = m \\iff \\frac{m-1}{m} = m \\iff m^2 - m + 1 = 0$ (vô nghiệm).\n- D: $\\det(A) = m \\iff -m = m \\iff m = 0$ (không thỏa mãn điều kiện khả nghịch).\n\nDo các phát biểu A, B, C, D đều không đúng với mọi $m$ nên đề gốc không có đáp án đúng.\n\nChọn đáp án E."
      },
      {
        "id": "ap1-f4-q5",
        "section": "Trắc nghiệm",
        "prompt": "Xét mô hình Input – Output mở Leontief có ba ngành với ma trận hệ số đầu vào\n$$A = \\begin{bmatrix} 0,1 & 0,3 & 0,2 \\\\ 0,6 & 0,2 & 0,1 \\\\ 0,2 & 0,3 & 0,3 \\end{bmatrix}$$\nGọi $x_1, x_2, x_3$ lần lượt là giá trị sản lượng của ba ngành. Nhờ cải tiến kĩ thuật nên ngành 1 tiết kiệm được $\\frac{1}{3}$ nguyên liệu của ngành 2. Khi nhu cầu cuối cùng của ngành mở đối với 3 ngành lần lượt là $75, 90, 81$. Hãy chọn kết quả đúng.",
        "options": [
          {
            "id": "A",
            "text": "$x_1 + x_2 + x_3 = 810$"
          },
          {
            "id": "B",
            "text": "$x_1 = 270$"
          },
          {
            "id": "C",
            "text": "$x_2 = 260$"
          },
          {
            "id": "D",
            "text": "$x_3 = 250$"
          }
        ],
        "correct": "A",
        "explanation": "Nhờ cải tiến kĩ thuật, ngành 1 tiết kiệm được $\\frac{1}{3}$ nguyên liệu của ngành 2, do đó hệ số đầu vào mới $a'_{21}$ là:\n$$a'_{21} = \\left(1 - \\frac{1}{3}\\right) \\cdot 0,6 = 0,4.$$\n\nMa trận hệ số đầu vào mới lúc này là:\n$$A' = \\begin{bmatrix} 0,1 & 0,3 & 0,2 \\\\ 0,4 & 0,2 & 0,1 \\\\ 0,2 & 0,3 & 0,3 \\end{bmatrix}.$$\n\nTa giải hệ phương trình $(I - A')X = D$ với nhu cầu cuối cùng $D = [75, 90, 81]^T$:\n$$\\begin{bmatrix} 0,9 & -0,3 & -0,2 \\\\ -0,4 & 0,8 & -0,1 \\\\ -0,2 & -0,3 & 0,7 \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{bmatrix} = \\begin{bmatrix} 75 \\\\ 90 \\\\ 81 \\end{bmatrix} \\iff \\begin{cases} 0,9x_1 - 0,3x_2 - 0,2x_3 = 75 \\\\ -0,4x_1 + 0,8x_2 - 0,1x_3 = 90 \\\\ -0,2x_1 - 0,3x_2 + 0,7x_3 = 81 \\end{cases} \\implies \\begin{cases} x_1 = 240 \\\\ x_2 = 270 \\\\ x_3 = 300 \\end{cases}.$$\n\nTổng giá trị sản lượng của ba ngành là:\n$$x_1 + x_2 + x_3 = 240 + 270 + 300 = 810.$$\n\nChọn đáp án A."
      },
      {
        "id": "ap1-f4-q6",
        "section": "Trắc nghiệm",
        "prompt": "Cho ma trận $A$ vuông cấp $3$ có hạng $\\text{rank}(A) \\le 2$. Hãy chọn phát biểu sai.",
        "options": [
          {
            "id": "A",
            "text": "Ma trận $A^2 - 2A$ suy biến"
          },
          {
            "id": "B",
            "text": "Ma trận $A^3 + 3A$ khả nghịch"
          },
          {
            "id": "C",
            "text": "$\\det(A^T \\cdot A^5) = 0$"
          },
          {
            "id": "D",
            "text": "Hệ phương trình tuyến tính $AX = 0$ có vô số nghiệm"
          }
        ],
        "correct": "C",
        "explanation": "Vì ma trận $A$ vuông cấp $3$ có hạng $\\text{rank}(A) \\le 2 < 3$ nên $\\det(A) = 0$. Xét tính đúng/sai của các phương án:\n- A: $\\det(A^2 - 2A) = \\det(A) \\cdot \\det(A - 2I) = 0 \\cdot \\det(A - 2I) = 0$ nên $A^2 - 2A$ suy biến (Đúng).\n- B: $\\det(A^3 + 3A) = \\det(A) \\cdot \\det(A^2 + 3I) = 0 \\cdot \\det(A^2 + 3I) = 0$ nên $A^3 + 3A$ suy biến, tức là không khả nghịch (Sai).\n- C: $\\det(A^T \\cdot A^5) = \\det(A^T) \\cdot \\det(A)^5 = 0 \\cdot 0 = 0$ (Đúng).\n- D: Do $\\det(A) = 0$ nên hệ phương trình tuyến tính thuần nhất $AX = 0$ có vô số nghiệm (Đúng).\n\n(Lưu ý: Đề bài yêu cầu tìm phát biểu sai, do đó phát biểu B là đáp án cần chọn. Tuy nhiên, tài liệu nguồn FINAL 2807 ghi chú đáp án đúng là C, có thể do nhầm lẫn giữa định nghĩa \"phát biểu sai\" và \"phát biểu đúng\")."
      },
      {
        "id": "ap1-f4-q7",
        "section": "Trắc nghiệm",
        "prompt": "Hàm chi phí là $C(q)$ với $q$ là mức sản lượng. Ký hiệu $\\bar{c}(q) = \\frac{C(q)}{q}$ là hàm chi phí trung bình theo $q$. Biết rằng khi $q = 10$ thì hệ số co giãn của chi phí theo $q$ là $1$ và chi phí trung bình là $40$. Hãy tính chi phí biên theo $q$ khi $q = 10$.",
        "options": [
          {
            "id": "A",
            "text": "$80$"
          },
          {
            "id": "B",
            "text": "$60$"
          },
          {
            "id": "C",
            "text": "$-40$"
          },
          {
            "id": "D",
            "text": "$20$"
          }
        ],
        "correct": "A",
        "explanation": "Hệ số co giãn của chi phí $C$ theo sản lượng $q$ được xác định bởi:\n$$\\varepsilon = C'(q) \\cdot \\frac{q}{C(q)} = \\frac{C'(q)}{\\bar{c}(q)}.$$\n\nTại $q = 10$, ta có $\\varepsilon = 1$ và chi phí trung bình $\\bar{c}(10) = 40$.\nDo đó, chi phí biên (đạo hàm của hàm chi phí) là:\n$$C'(10) = \\varepsilon \\cdot \\bar{c}(10) = 1 \\cdot 40 = 40.$$\n\n(Lưu ý: Trong tài liệu gốc ghi chú đáp án là A. Nếu hệ số co giãn của chi phí theo sản lượng được sửa thành $2$ thì chi phí biên sẽ là $80$)."
      },
      {
        "id": "ap1-f4-q8",
        "section": "Trắc nghiệm",
        "prompt": "Xét hàm lợi nhuận $\\pi(L, K) = 3L^{1/3} K^{1/3} - L - 0,04K$. Ma trận Hess của hàm lợi nhuận là:\n$$H = \\begin{bmatrix} \\pi''_{LL} & \\pi''_{LK} \\\\ \\pi''_{KL} & \\pi''_{KK} \\end{bmatrix}$$\nBiết rằng hàm lợi nhuận $\\pi(L, K)$ đạt giá trị lớn nhất tại $(L, K) = (L_0, K_0)$. Hãy chọn phát biểu đúng.",
        "options": [
          {
            "id": "A",
            "text": "$\\pi''_{LL}(L, K) = \\frac{2}{3} L^{-5/3} K^{1/3}$"
          },
          {
            "id": "B",
            "text": "$\\det(H) = \\frac{5}{9} L^{-4/3} K^{-4/3}$"
          },
          {
            "id": "C",
            "text": "$L_0 + K_0 = 600$"
          },
          {
            "id": "D",
            "text": "$L_0 \\cdot K_0 = 25^3$"
          }
        ],
        "correct": "D",
        "explanation": "Tính các đạo hàm riêng cấp 1 của hàm lợi nhuận $\\pi(L, K)$:\n$$\\pi'_L = K^{1/3} L^{-2/3} - 1 = 0 \\iff K^{1/3} L^{-2/3} = 1.$$\n$$\\pi'_K = L^{1/3} K^{-2/3} - 0,04 = 0 \\iff L^{1/3} K^{-2/3} = 0,04.$$\n\nChia vế theo vế hai phương trình trên:\n$$\\frac{K^{1/3} L^{-2/3}}{L^{1/3} K^{-2/3}} = \\frac{1}{0,04} = 25 \\iff KL^{-1} = 25 \\iff K = 25L.$$\n\nThế $K = 25L$ vào phương trình thứ nhất:\n$$(25L)^{1/3} L^{-2/3} = 1 \\iff 25^{1/3} L^{-1/3} = 1 \\iff L^{-1/3} = 25^{-1/3} \\iff L_0 = 25.$$\n\nTừ đó, $K_0 = 25 \\cdot 25 = 25^2 = 625$.\nGiá trị lớn nhất của hàm lợi nhuận đạt tại $(L_0, K_0) = (25, 625)$.\nTích sản lượng tối ưu:\n$$L_0 \\cdot K_0 = 25 \\cdot 25^2 = 25^3.$$\n\nTính các đạo hàm riêng cấp 2 để kiểm tra các phương án còn lại:\n$$\\pi''_{LL} = -\\frac{2}{3} K^{1/3} L^{-5/3} \\quad \\text{(A sai vì thiếu dấu âm)}.$$\n$$\\pi''_{KK} = -\\frac{2}{3} L^{1/3} K^{-5/3}, \\quad \\pi''_{LK} = \\frac{1}{3} K^{-2/3} L^{-2/3}.$$\n$$\\det(H) = \\pi''_{LL} \\pi''_{KK} - (\\pi''_{LK})^2 = \\frac{4}{9} K^{-4/3} L^{-4/3} - \\frac{1}{9} K^{-4/3} L^{-4/3} = \\frac{1}{3} K^{-4/3} L^{-4/3} \\quad \\text{(B sai)}.$$\n$$L_0 + K_0 = 25 + 625 = 650 \\neq 600 \\quad \\text{(C sai)}.$$\n\nChọn đáp án D."
      },
      {
        "id": "ap1-f4-q9",
        "section": "Trắc nghiệm",
        "prompt": "Một xí nghiệp có hàm năng suất $Q(x, y) = 7x^{1/2} y^{1/3}$ với $x, y$ lần lượt là lượng nguyên liệu thứ nhất, thứ hai. Ký hiệu $\\varepsilon_x (Q)(x_0, y_0)$, $\\varepsilon_y (Q)(x_0, y_0)$ lần lượt là hệ số co giãn của $Q$ theo $x$, theo $y$ tại điểm $(x_0, y_0)$. Hãy chọn kết quả đúng.",
        "options": [
          {
            "id": "A",
            "text": "$\\varepsilon_x (Q)(27, 4) = \\frac{7}{2}$"
          },
          {
            "id": "B",
            "text": "$\\varepsilon_y (Q)(27, 4) = \\frac{1}{3}$"
          },
          {
            "id": "C",
            "text": "$\\varepsilon_x (Q)(9, 8) = \\frac{1}{3}$"
          },
          {
            "id": "D",
            "text": "$\\varepsilon_y (Q)(9, 8) = \\frac{1}{2}$"
          }
        ],
        "correct": "B",
        "explanation": "Ta tính hệ số co giãn của hàm năng suất $Q(x, y) = 7x^{1/2} y^{1/3}$:\n- Theo $x$:\n$$\\varepsilon_x(Q) = Q'_x \\cdot \\frac{x}{Q} = \\left( \\frac{7}{2} x^{-1/2} y^{1/3} \\right) \\cdot \\frac{x}{7x^{1/2} y^{1/3}} = \\frac{1}{2}.$$\n- Theo $y$:\n$$\\varepsilon_y(Q) = Q'_y \\cdot \\frac{y}{Q} = \\left( \\frac{7}{3} x^{1/2} y^{-2/3} \\right) \\cdot \\frac{y}{7x^{1/2} y^{1/3}} = \\frac{1}{3}.$$\n\nCác hệ số co giãn là hằng số với mọi điểm $(x_0, y_0)$, cụ thể $\\varepsilon_x(Q)(x_0, y_0) = \\frac{1}{2}$ và $\\varepsilon_y(Q)(x_0, y_0) = \\frac{1}{3}$.\n\nĐối chiếu các phương án:\n- A: $\\varepsilon_x(Q)(27, 4) = \\frac{1}{2} \\neq \\frac{7}{2}$ (Sai).\n- B: $\\varepsilon_y(Q)(27, 4) = \\frac{1}{3}$ (Đúng).\n- C: $\\varepsilon_x(Q)(9, 8) = \\frac{1}{2} \\neq \\frac{1}{3}$ (Sai).\n- D: $\\varepsilon_y(Q)(9, 8) = \\frac{1}{3} \\neq \\frac{1}{2}$ (Sai).\n\nChọn đáp án B."
      },
      {
        "id": "ap1-f4-q10",
        "section": "Trắc nghiệm",
        "prompt": "Nghiệm tổng quát của phương trình vi phân $y' + \\frac{y}{x} = \\frac{\\cos x}{x}$ là:",
        "options": [
          {
            "id": "A",
            "text": "$y = \\frac{C}{x} - \\frac{\\sin x}{x}$, với $C \\in \\mathbb{R}$"
          },
          {
            "id": "B",
            "text": "$y = Cx - x \\cdot \\sin x$, với $C \\in \\mathbb{R}$"
          },
          {
            "id": "C",
            "text": "$y = \\frac{C}{x} + \\frac{\\sin x}{x}$, với $C \\in \\mathbb{R}$"
          },
          {
            "id": "D",
            "text": "$y = Cx + x \\cdot \\cos x$, với $C \\in \\mathbb{R}$"
          }
        ],
        "correct": "C",
        "explanation": "Đây là phương trình vi phân tuyến tính cấp một có dạng $y' + P(x)y = Q(x)$ với $P(x) = \\frac{1}{x}$ và $Q(x) = \\frac{\\cos x}{x}$.\n\nThừa số tích phân:\n$$\\mu(x) = e^{\\int \\frac{1}{x} dx} = e^{\\ln|x|} = x \\quad (x > 0).$$\n\nNhân hai vế của phương trình với $x$:\n$$x y' + y = \\cos x \\iff (xy)' = \\cos x.$$\n\nTích phân hai vế:\n$$xy = \\int \\cos x dx = \\sin x + C \\implies y = \\frac{C}{x} + \\frac{\\sin x}{x} \\quad (C \\in \\mathbb{R}).$$\n\nChọn đáp án C."
      }
    ]
  },
  {
    "id": "ap1-f6",
    "title": "Toán Cao Cấp K47",
    "sourceLabel": "FINAL 2807",
    "sourcePdf": "final 2807.pdf",
    "durationMinutes": 30,
    "description": "Đề K47 trong FINAL 2807, gồm 20 câu trắc nghiệm để luyện bài dài hơn.",
    "questions": [
      {
        "id": "ap1-f6-q1",
        "section": "Trắc nghiệm",
        "prompt": "Câu 1. Xét các ma trận $A = \\begin{bmatrix} 2 & 1 & 1 \\\\ 1 & 1 & 1 \\\\ m & 1 & 1 \\end{bmatrix}$ và $B = \\begin{bmatrix} -1 & 1 & 2 \\\\ 1 & 3 & 1 \\\\ 2 & -1 & -2 \\end{bmatrix}$. Khi đó, $\\det(AB - B^2)$ là:",
        "options": [
          {
            "id": "A",
            "text": "$-2m - 14$"
          },
          {
            "id": "B",
            "text": "$-2m + 14$"
          },
          {
            "id": "C",
            "text": "$2m - 14$"
          },
          {
            "id": "D",
            "text": "Một kết quả khác."
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "ap1-f6-q2",
        "section": "Trắc nghiệm",
        "prompt": "Câu 2. Với $x$ là ẩn số thực, xét ma trận $A = \\begin{bmatrix} 1 & x & -1 & -1 \\\\ 1 & x & 1 & 1 \\\\ 0 & 1 & 1 & 1 \\\\ 0 & 2 & 0 & 2 \\end{bmatrix}$. Tìm số nghiệm thực của phương trình $\\det(A) = 0$.",
        "options": [
          {
            "id": "A",
            "text": "Vô nghiệm."
          },
          {
            "id": "B",
            "text": "Một nghiệm."
          },
          {
            "id": "C",
            "text": "Hai nghiệm."
          },
          {
            "id": "D",
            "text": "Vô số nghiệm."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q3",
        "section": "Trắc nghiệm",
        "prompt": "Câu 3. Cho $A, B, C$ là các ma trận vuông cấp 3 và $\\det(A) = 2$, $\\det(B) = 4$, $\\det(C) = -4$. Đặt ma trận $D = A^2 \\cdot B^{-1} \\cdot C^T$. Khi đó $\\det(2D^{-1})$ bằng:",
        "options": [
          {
            "id": "A",
            "text": "$-2$"
          },
          {
            "id": "B",
            "text": "$-0.25$"
          },
          {
            "id": "C",
            "text": "$-4$"
          },
          {
            "id": "D",
            "text": "Một kết quả khác."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q4",
        "section": "Trắc nghiệm",
        "prompt": "Câu 4. Cho $A$ là ma trận vuông cấp 4 khả nghịch thỏa mãn $A + 2A^T = 6I$ với $I$ là ma trận đơn vị cùng cấp với $A$. Chọn phát biểu sai.",
        "options": [
          {
            "id": "A",
            "text": "$\\det(A) = 2$"
          },
          {
            "id": "B",
            "text": "$A = A^T$"
          },
          {
            "id": "C",
            "text": "$A^2 = 4I$"
          },
          {
            "id": "D",
            "text": "$2A^{-1} = I$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q5",
        "section": "Trắc nghiệm",
        "prompt": "Câu 5. Cho ma trận $A = \\begin{bmatrix} 0 & 3 & -1 \\\\ 1 & 0 & 2 \\\\ 1 & 2 & m \\end{bmatrix}$. Khi $A$ khả nghịch, ta viết $A^{-1} = \\frac{1}{|A|} \\begin{bmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{bmatrix}$. Chọn kết quả sai.",
        "options": [
          {
            "id": "A",
            "text": "$a_{32} = 1$"
          },
          {
            "id": "B",
            "text": "$a_{22} = 1$"
          },
          {
            "id": "C",
            "text": "$a_{23} = -1$"
          },
          {
            "id": "D",
            "text": "$\\det(A) = 4 - 3m$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q6",
        "section": "Trắc nghiệm",
        "prompt": "Câu 6. Cho $A$ là ma trận vuông cấp 4. Ký hiệu $P_A$ là ma trận phụ hợp của $A$. Cho biết $\\det(-P_A) = 64$. Khi đó $\\det(2A)$ bằng:",
        "options": [
          {
            "id": "A",
            "text": "$64$"
          },
          {
            "id": "B",
            "text": "$-64$"
          },
          {
            "id": "C",
            "text": "$32$"
          },
          {
            "id": "D",
            "text": "Một kết quả khác."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q7",
        "section": "Trắc nghiệm",
        "prompt": "Câu 7. Xét ma trận $A = \\begin{bmatrix} 2 & m & -1 \\\\ -1 & m + 1 & -1 \\\\ 3 & -1 & 0 \\end{bmatrix}$. Tìm $m$ để hạng của $A$ bằng 3.",
        "options": [
          {
            "id": "A",
            "text": "Không tồn tại $m \\in \\mathbb{R}$."
          },
          {
            "id": "B",
            "text": "$m = -1$"
          },
          {
            "id": "C",
            "text": "$m = -2$"
          },
          {
            "id": "D",
            "text": "$\\forall m \\in \\mathbb{R}$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q8",
        "section": "Trắc nghiệm",
        "prompt": "Câu 8. Tìm $m$ để hệ phương trình tuyến tính sau đây có vô số nghiệm: $\\begin{cases} mx + y + z = 1 \\\\ 4x + my + 2z = 2 \\\\ 2x - y + z = 0 \\end{cases}$",
        "options": [
          {
            "id": "A",
            "text": "$m = 2$"
          },
          {
            "id": "B",
            "text": "$m = -2$"
          },
          {
            "id": "C",
            "text": "$m = \\pm 1$"
          },
          {
            "id": "D",
            "text": "Không tồn tại $m \\in \\mathbb{R}$."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q9",
        "section": "Trắc nghiệm",
        "prompt": "Câu 9. Cho các hệ phương trình tuyến tính (I): $A \\cdot X = B$ (có $n$ ẩn số) và (II): $A \\cdot X = 0$ với $A$ là ma trận vuông cấp $n$ thoả mãn $A^2 = 0$. Chọn kết luận sai.",
        "options": [
          {
            "id": "A",
            "text": "Hệ (I) có nghiệm duy nhất."
          },
          {
            "id": "B",
            "text": "Hệ (II) có vô số nghiệm."
          },
          {
            "id": "C",
            "text": "$(A^T)^2 = 0$"
          },
          {
            "id": "D",
            "text": "$A + I$ là ma trận khả nghịch, với $I$ là ma trận đơn vị cùng cấp với $A$."
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "ap1-f6-q10",
        "section": "Trắc nghiệm",
        "prompt": "Câu 10. Trong mô hình Input-Output mở Leontief, xét ma trận hệ số đầu vào $A = \\begin{bmatrix} 0.2 & 0.1 & 0.3 \\\\ 0.3 & 0.2 & 0.2 \\\\ m & 0.3 & 0.2 \\end{bmatrix}$. Cho biết sản lượng của ngành 1 là 200 và yêu cầu cuối của ngành 1 là 60. Tìm lượng nguyên liệu của ngành 3 cung cấp cho ngành 1.",
        "options": [
          {
            "id": "A",
            "text": "$30$"
          },
          {
            "id": "B",
            "text": "$45$"
          },
          {
            "id": "C",
            "text": "$60$"
          },
          {
            "id": "D",
            "text": "$75$"
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "ap1-f6-q11",
        "section": "Trắc nghiệm",
        "prompt": "Câu 11. Tính đạo hàm của hàm số $y = f(x) = x^{x+1}$.",
        "options": [
          {
            "id": "A",
            "text": "$x^x(\\ln x + 1 + x)$"
          },
          {
            "id": "B",
            "text": "$x^x(\\ln x + 1)$"
          },
          {
            "id": "C",
            "text": "$x^x(\\ln x + x)$"
          },
          {
            "id": "D",
            "text": "Một kết quả khác."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q12",
        "section": "Trắc nghiệm",
        "prompt": "Câu 12. Cho hàm số $y = \\sqrt{8x + 8}$. Tìm biên tế của $y$ theo $x$ khi hệ số co giãn của $y$ theo $x$ bằng $0.25$.",
        "options": [
          {
            "id": "A",
            "text": "$1.00$"
          },
          {
            "id": "B",
            "text": "$1.25$"
          },
          {
            "id": "C",
            "text": "$1.50$"
          },
          {
            "id": "D",
            "text": "Một kết quả khác."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q13",
        "section": "Trắc nghiệm",
        "prompt": "Câu 13. Gọi $P, Q$ lần lượt là giá bán và mức sản lượng, $C(Q)$ là hàm chi phí. Cho biết $P \\cdot Q = 250$ và $\\frac{dC}{dP}$ tại $Q = 25$ là $-0.5$. Hãy tính chi phí biên theo sản lượng $Q$ khi $Q = 25$.",
        "options": [
          {
            "id": "A",
            "text": "$0.2$"
          },
          {
            "id": "B",
            "text": "$0.3$"
          },
          {
            "id": "C",
            "text": "$0.4$"
          },
          {
            "id": "D",
            "text": "Một kết quả khác."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q14",
        "section": "Trắc nghiệm",
        "prompt": "Câu 14. Xét hàm hai biến $f(x, y) = \\ln(2xy) - 2xy + 2y^2 - 6y + 1$. Gọi $H$ là ma trận Hess của hàm $f(x, y)$. Tìm $y$ thỏa mãn $\\det(H) = -4$.",
        "options": [
          {
            "id": "A",
            "text": "$y = \\pm 0.5$"
          },
          {
            "id": "B",
            "text": "$y = \\pm 1$"
          },
          {
            "id": "C",
            "text": "$y = \\pm 2$"
          },
          {
            "id": "D",
            "text": "Các câu kia đều sai."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q15",
        "section": "Trắc nghiệm",
        "prompt": "Câu 15. Xét hàm hai biến $f(x, y) = x^3 + y^4 - 3mx - 4y$ (với $m > 0$). Chọn phát biểu sai.",
        "options": [
          {
            "id": "A",
            "text": "Hàm $f(x, y)$ có cực đại."
          },
          {
            "id": "B",
            "text": "Hàm $f(x, y)$ có cực tiểu."
          },
          {
            "id": "C",
            "text": "Hàm $f(x, y)$ chỉ có một cực trị."
          },
          {
            "id": "D",
            "text": "Hàm $f$ có hai điểm dừng."
          }
        ],
        "correct": "D",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: D."
      },
      {
        "id": "ap1-f6-q16",
        "section": "Trắc nghiệm",
        "prompt": "Câu 16. Cho hàm sản lượng $Q$ của một xí nghiệp là $Q(L, K) = 2L + 3\\sqrt{LK}$, với $L$ là lượng lao động và $K$ là lượng vốn. Tại thời điểm $L = 25, K = 100$, xí nghiệp giảm lượng lao động 1 đơn vị. Để sản lượng tăng thêm 1 đơn vị, xí nghiệp cần tăng lượng vốn xấp xỉ là kết quả nào sau đây?",
        "options": [
          {
            "id": "A",
            "text": "$12$"
          },
          {
            "id": "B",
            "text": "$18$"
          },
          {
            "id": "C",
            "text": "$20$"
          },
          {
            "id": "D",
            "text": "Một kết quả khác."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q17",
        "section": "Trắc nghiệm",
        "prompt": "Câu 17. Xét hàm phụ Lagrange $L(x, y, \\lambda) = f(x, y) + \\lambda [16 - g(x, y)]$, trong đó $f(x, y) = 3x^2 - 5xy$, $g(x, y) = 2x - 2y$. Cho biết $M(10, 2, k)$ là điểm dừng của hàm $L$. Ký hiệu $H_b$ là ma trận Hess biên tại điểm $M$. Chọn kết quả đúng.",
        "options": [
          {
            "id": "A",
            "text": "$k = 25$"
          },
          {
            "id": "B",
            "text": "$k = 50$"
          },
          {
            "id": "C",
            "text": "$|H_b| = 4$"
          },
          {
            "id": "D",
            "text": "$|H_b| = -4$"
          }
        ],
        "correct": "C",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: C."
      },
      {
        "id": "ap1-f6-q18",
        "section": "Trắc nghiệm",
        "prompt": "Câu 18. Xét phương trình vi phân $y' - 3y = -6 \\quad (*)$ và gọi $Y(x)$ là nghiệm tổng quát của phương trình $(*)$. Chọn phát biểu sai.",
        "options": [
          {
            "id": "A",
            "text": "$\\lim_{x \\to +\\infty} Y(x) = 2$"
          },
          {
            "id": "B",
            "text": "$\\lim_{x \\to -\\infty} Y(x) = 2$"
          },
          {
            "id": "C",
            "text": "Hàm $Y(x) = 2 - e^{3x}$ là một nghiệm của phương trình $(*)$."
          },
          {
            "id": "D",
            "text": "Phương trình $(*)$ có một nghiệm riêng là hàm hằng."
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q19",
        "section": "Trắc nghiệm",
        "prompt": "Câu 19. Xét phương trình vi phân $y'' - 6y' + 5y = 2y' - 11y \\quad (*)$. Nghiệm tổng quát của $(*)$ là:",
        "options": [
          {
            "id": "A",
            "text": "$y(x) = C_1 e^{4x} + x C_2 e^{4x} \\quad (C_1, C_2 \\in \\mathbb{R})$"
          },
          {
            "id": "B",
            "text": "$y(x) = C_1 e^{-x} + C_2 e^{5x} \\quad (C_1, C_2 \\in \\mathbb{R})$"
          },
          {
            "id": "C",
            "text": "$y(x) = C_1 e^{-4x} + C_2 x e^{-4x} \\quad (C_1, C_2 \\in \\mathbb{R})$"
          },
          {
            "id": "D",
            "text": "$y(x) = C_1 e^x + C_2 e^{-5x} \\quad (C_1, C_2 \\in \\mathbb{R})$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      },
      {
        "id": "ap1-f6-q20",
        "section": "Trắc nghiệm",
        "prompt": "Câu 20. Xét phương trình vi phân $y'' + x^2 = y \\quad (*)$. Nghiệm tổng quát của phương trình $(*)$ là:",
        "options": [
          {
            "id": "A",
            "text": "$f(x) = C_1 e^x + C_2 e^{-x} + x^2 + 2 \\quad (C_1, C_2 \\in \\mathbb{R})$"
          },
          {
            "id": "B",
            "text": "$f(x) = C_1 e^x + C_2 e^{-x} - x^2 + 2 \\quad (C_1, C_2 \\in \\mathbb{R})$"
          },
          {
            "id": "C",
            "text": "$f(x) = C_1 e^{-x} + C_2 e^x + x^2 - 2 \\quad (C_1, C_2 \\in \\mathbb{R})$"
          },
          {
            "id": "D",
            "text": "$f(x) = C_1 e^{-x} + C_2 e^x - x^2 - 2 \\quad (C_1, C_2 \\in \\mathbb{R})$"
          }
        ],
        "correct": "A",
        "explanation": "Đáp án theo phần lời giải trong FINAL 2807: A."
      }
    ]
  },
  {
    "id": "ap1-f7",
    "title": "Toán Cao Cấp K46",
    "sourceLabel": "FINAL 2807",
    "sourcePdf": "final 2807.pdf",
    "durationMinutes": 30,
    "description": "Đề K46 trong FINAL 2807, chuyển từ tài liệu lời giải sang bài kiểm tra tương tác.",
    "questions": [
      {
        "id": "ap1-f7-q1",
        "section": "Trắc nghiệm",
        "prompt": "Cho hệ phương trình tuyến tính $(I)$:\n$$\\begin{cases} x + y + 2z = 2m \\\\ mx - y + 4z = -3 \\\\ 2mx - 3y + 4z = m \\end{cases}$$\nHệ $(I)$ có nghiệm duy nhất khi và chỉ khi:",
        "options": [
          {
            "id": "A",
            "text": "$m \\neq 4$"
          },
          {
            "id": "B",
            "text": "$m \\neq -4$"
          },
          {
            "id": "C",
            "text": "$m \\neq -2$"
          },
          {
            "id": "D",
            "text": "$m \\neq 2$"
          }
        ],
        "correct": "B",
        "explanation": "Hệ phương trình có nghiệm duy nhất khi và chỉ khi định thức của ma trận hệ số khác $0$:\n$$D = \\begin{vmatrix} 1 & 1 & 2 \\\\ m & -1 & 4 \\\\ 2m & -3 & 4 \\end{vmatrix} \\neq 0 \\iff 2m + 8 \\neq 0 \\iff m \\neq -4.$$\n\nChọn đáp án B."
      },
      {
        "id": "ap1-f7-q2",
        "section": "Trắc nghiệm",
        "prompt": "Trong mô hình Input-Output mở Leontief, cho ma trận hệ số đầu vào là:\n$$A = \\begin{bmatrix} 0,1 & 0,3 & 0,3 \\\\ 0,2 & 0,2 & 0,2 \\\\ 0,3 & 0,3 & 0,2 \\end{bmatrix}$$\nBiết ngành 3 cung cấp $60$ (đvt) cho ngành 1, khi đó ngành 1 phải cung cấp cho chính nó:",
        "options": [
          {
            "id": "A",
            "text": "$20$"
          },
          {
            "id": "B",
            "text": "$10$"
          },
          {
            "id": "C",
            "text": "$40$"
          },
          {
            "id": "D",
            "text": "$30$"
          }
        ],
        "correct": "A",
        "explanation": "Ta có lượng cung cấp từ ngành 3 cho ngành 1 là $x_{31} = a_{31} x_1$. Từ ma trận hệ số đầu vào, $a_{31} = 0,3$.\nTheo đề bài, $x_{31} = 60 \\implies 0,3 x_1 = 60 \\implies x_1 = 200$.\nKhi đó, ngành 1 tự cung cấp cho chính nó một lượng là:\n$x_{11} = a_{11} x_1 = 0,1 \\cdot 200 = 20$.\n\nChọn đáp án A."
      },
      {
        "id": "ap1-f7-q3",
        "section": "Trắc nghiệm",
        "prompt": "Cho $A$ là một ma trận vuông cấp $4$. Ký hiệu $P_A$ là ma trận phụ hợp của $A$. Biết rằng $|P_A| = 8$, khi đó $|3A|$ bằng:",
        "options": [
          {
            "id": "A",
            "text": "$|3A| = 6$"
          },
          {
            "id": "B",
            "text": "$|3A| = 18$"
          },
          {
            "id": "C",
            "text": "$|3A| = 54$"
          },
          {
            "id": "D",
            "text": "$|3A| = 162$"
          }
        ],
        "correct": "D",
        "explanation": "Với ma trận vuông $A$ cấp $n = 4$, ta có công thức liên hệ giữa định thức của ma trận phụ hợp và định thức của ma trận gốc:\n$|P_A| = |A|^{n-1} = |A|^3$.\nDo $|P_A| = 8 \\implies |A|^3 = 8 \\implies |A| = 2$.\nKhi đó, ta có:\n$|3A| = 3^n |A| = 3^4 |A| = 81 \\cdot 2 = 162$.\n\nChọn đáp án D."
      },
      {
        "id": "ap1-f7-q4",
        "section": "Trắc nghiệm",
        "prompt": "Cho ma trận $A = \\begin{bmatrix} 2 & 2 & 1 \\\\ 2 & 4 & 1 \\\\ 0 & m & 3 \\end{bmatrix}$. Đặt $B = (A - I)^2$. Khi đó, $B$ suy biến khi và chỉ khi:",
        "options": [
          {
            "id": "A",
            "text": "$m = \\pm 2$"
          },
          {
            "id": "B",
            "text": "$m = -2$"
          },
          {
            "id": "C",
            "text": "$m = 2$"
          },
          {
            "id": "D",
            "text": "Không tồn tại $m$"
          }
        ],
        "correct": "C",
        "explanation": "Ma trận $B$ suy biến khi và chỉ khi $\\text{det}(B) = 0$.\nTa có: $\\text{det}(B) = \\text{det}((A - I)^2) = (\\text{det}(A - I))^2$.\nDo đó, $B$ suy biến khi và chỉ khi $\\text{det}(A - I) = 0$.\nTính ma trận $A - I$:\n$$A - I = \\begin{bmatrix} 1 & 2 & 1 \\\\ 2 & 3 & 1 \\\\ 0 & m & 2 \\end{bmatrix}$$\nĐịnh thức của $A - I$ là:\n$$\\text{det}(A - I) = 1(3 \\cdot 2 - m) - 2(2 \\cdot 2 - 0) + 1(2m - 0) = 6 - m - 8 + 2m = m - 2.$$\nĐể $\\text{det}(A - I) = 0 \\iff m - 2 = 0 \\iff m = 2$.\n\nChọn đáp án C."
      },
      {
        "id": "ap1-f7-q5",
        "section": "Trắc nghiệm",
        "prompt": "Cho $x > 0$ và $y = \\frac{x}{\\sqrt{x + 30}}$. Hệ số co giãn của $y$ đối với $x$ tại $x = 30$ là:",
        "options": [
          {
            "id": "A",
            "text": "$\\frac{4}{3}$"
          },
          {
            "id": "B",
            "text": "$\\frac{3}{4}$"
          },
          {
            "id": "C",
            "text": "$3$"
          },
          {
            "id": "D",
            "text": "$\\frac{1}{3}$"
          }
        ],
        "correct": "B",
        "explanation": "Ta có hàm số $y = \\frac{x}{\\sqrt{x + 30}}$. Lấy logarit tự nhiên hai vế:\n$\\ln y = \\ln x - \\frac{1}{2} \\ln(x + 30)$.\nHệ số co giãn của $y$ theo $x$ là:\n$$E_x(y) = x \\cdot (\\ln y)' = x \\left( \\frac{1}{x} - \\frac{1}{2(x + 30)} \\right) = 1 - \\frac{x}{2(x + 30)}.$$\nTại $x = 30$, ta có:\n$$E_x(y)\\Big|_{x=30} = 1 - \\frac{30}{2(30 + 30)} = 1 - \\frac{30}{120} = 1 - \\frac{1}{4} = \\frac{3}{4}.$$\n\nChọn đáp án B."
      },
      {
        "id": "ap1-f7-q6",
        "section": "Trắc nghiệm",
        "prompt": "Gọi $P$ là giá bán và $C = C(Q)$ là hàm chi phí, với $Q$ là mức sản lượng. Biết rằng $P \\cdot Q = 500$ và chi phí biên tại $Q = 10$ là $10$. Khi đó $\\frac{dC}{dP}$ tại $Q = 10$ là:",
        "options": [
          {
            "id": "A",
            "text": "$-2$"
          },
          {
            "id": "B",
            "text": "$-4$"
          },
          {
            "id": "C",
            "text": "$-12$"
          },
          {
            "id": "D",
            "text": "$-24$"
          }
        ],
        "correct": "A",
        "explanation": "Từ $P \\cdot Q = 500 \\implies P = \\frac{500}{Q}$ và $Q = \\frac{500}{P}$.\nTại $Q = 10 \\implies P = 50$.\nĐạo hàm của $Q$ theo $P$ là: $\\frac{dQ}{dP} = -\\frac{500}{P^2}$. Tại $P = 50$, ta có: $\\frac{dQ}{dP}\\Big|_{P=50} = -\\frac{500}{2500} = -\\frac{1}{5}$.\nChi phí biên tại $Q = 10$ là $C'(10) = \\frac{dC}{dQ}\\Big|_{Q=10} = 10$.\nTheo quy tắc đạo hàm hàm hợp, ta có:\n$$\\frac{dC}{dP}\\Big|_{Q=10} = \\frac{dC}{dQ}\\Big|_{Q=10} \\cdot \\frac{dQ}{dP}\\Big|_{Q=10} = 10 \\cdot \\left(-\\frac{1}{5}\\right) = -2.$$\n\nChọn đáp án A."
      },
      {
        "id": "ap1-f7-q7",
        "section": "Trắc nghiệm",
        "prompt": "Nghiệm tổng quát của phương trình vi phân $y'' - 4y' - 5y = 7x \\cos x$ có dạng:",
        "options": [
          {
            "id": "A",
            "text": "$u(x) = (mx + n) \\cos x + (px + q) \\sin x$ với $m, n, p, q$ là các hằng số."
          },
          {
            "id": "B",
            "text": "$u(x) = a e^{-x} + b e^{5x} + (mx^2 + nx) \\cos x + (px^2 + qx) \\sin x$ với $a, b, m, n, p, q$ là các hằng số."
          },
          {
            "id": "C",
            "text": "$u(x) = a e^{-x} + b e^{5x} + (mx^2 + nx) \\cos x$ với $a, b, m, n$ là các hằng số."
          },
          {
            "id": "D",
            "text": "$u(x) = a e^{-x} + b e^{5x} + (mx + n) \\cos x + (px + q) \\sin x$ với $a, b, m, n, p, q$ là các hằng số."
          }
        ],
        "correct": "D",
        "explanation": "Phương trình đặc trưng của phần thuần nhất là: $k^2 - 4k - 5 = 0 \\iff k = -1$ hoặc $k = 5$.\nNên nghiệm của phương trình thuần nhất có dạng: $y_0(x) = a e^{-x} + b e^{5x}$.\nVế phải là $f(x) = 7x \\cos x$ (không chứa số hạng là nghiệm của phương trình đặc trưng vì $\\pm i$ không phải là nghiệm đặc trưng).\nDo đó, nghiệm riêng của phương trình vi phân có dạng: $y_p(x) = (mx + n) \\cos x + (px + q) \\sin x$.\nNghiệm tổng quát của phương trình là:\n$u(x) = y_0(x) + y_p(x) = a e^{-x} + b e^{5x} + (mx + n) \\cos x + (px + q) \\sin x$.\n\nChọn đáp án D."
      },
      {
        "id": "ap1-f7-q8",
        "section": "Trắc nghiệm",
        "prompt": "Xét phương trình vi phân $y' - 2y = 2x e^{2x} \\quad (1)$. Phát biểu nào sau đây là sai?",
        "options": [
          {
            "id": "A",
            "text": "Phương trình $(1)$ có một nghiệm riêng $y = x^2 e^{2x}$."
          },
          {
            "id": "B",
            "text": "Phương trình $(1)$ có một nghiệm riêng $y = x^2 e^{2x} - 3e^{2x}$."
          },
          {
            "id": "C",
            "text": "Mọi nghiệm $y(x)$ của phương trình $(1)$ có tính chất $\\lim_{x \\to +\\infty} y(x) = 0$."
          },
          {
            "id": "D",
            "text": "Mọi nghiệm $y(x)$ của phương trình $(1)$ có tính chất $\\lim_{x \\to -\\infty} y(x) = 0$."
          }
        ],
        "correct": "C",
        "explanation": "Nghiệm tổng quát của phương trình vi phân tuyến tính cấp một $y' - 2y = 2x e^{2x}$ thu được bằng cách nhân thừa số liên kết $e^{-2x}$:\n$\\frac{d}{dx}(y e^{-2x}) = 2x \\implies y e^{-2x} = x^2 + C \\implies y(x) = (x^2 + C)e^{2x}$.\n- Với $C = 0$, $y = x^2 e^{2x}$ là một nghiệm riêng (Phát biểu A đúng).\n- Với $C = -3$, $y = (x^2 - 3)e^{2x} = x^2 e^{2x} - 3e^{2x}$ là một nghiệm riêng (Phát biểu B đúng).\n- Khi $x \\to -\\infty$, $\\lim_{x \\to -\\infty} (x^2 + C)e^{2x} = 0$ do số mũ âm giảm về $0$ nhanh hơn đa thức tăng (Phát biểu D đúng).\n- Khi $x \\to +\\infty$, $\\lim_{x \\to +\\infty} (x^2 + C)e^{2x} = +\\infty$ (Phát biểu C sai).\n\nChọn đáp án C."
      },
      {
        "id": "ap1-f7-q9",
        "section": "Trắc nghiệm",
        "prompt": "Cho hàm số $f(x, y) = -4x^2 - 4y^2 + 72 \\ln(xy)$. Kết luận nào sau đây là đúng?",
        "options": [
          {
            "id": "A",
            "text": "$f$ không có cực trị."
          },
          {
            "id": "B",
            "text": "$f$ chỉ có cực đại."
          },
          {
            "id": "C",
            "text": "$f$ chỉ có cực tiểu."
          },
          {
            "id": "D",
            "text": "$f$ có cả cực đại và cực tiểu."
          }
        ],
        "correct": "B",
        "explanation": "Tìm các điểm dừng của hàm số trong miền xác định $xy > 0$:\n$$\\begin{cases} f'_x = -8x + \\frac{72}{x} = 0 \\\\ f'_y = -8y + \\frac{72}{y} = 0 \\end{cases} \\iff \\begin{cases} x^2 = 9 \\\\ y^2 = 9 \\end{cases} \\iff (x, y) \\in \\{(3, 3), (-3, -3)\\} \\text{ (do } xy > 0).$$\nTính các đạo hàm cấp hai:\n$A = f''_{xx} = -8 - \\frac{72}{x^2}$, $B = f''_{xy} = 0$, $C = f''_{yy} = -8 - \\frac{72}{y^2}$.\nTại cả hai điểm dừng $(3, 3)$ và $(-3, -3)$, ta có:\n$A = -16 < 0$, $B = 0$, $C = -16 < 0$.\nĐịnh thức Hessian là: $AC - B^2 = (-16)(-16) - 0 = 256 > 0$.\nVì $AC - B^2 > 0$ và $A < 0$ nên cả hai điểm dừng đều là điểm cực đại của hàm số. Vậy hàm số chỉ có cực đại.\n\nChọn đáp án B."
      },
      {
        "id": "ap1-f7-q10",
        "section": "Trắc nghiệm",
        "prompt": "Cho $g$ là hàm khả vi trên $\\mathbb{R}$ và đặt $f(x, y) = -y + g(-x^2 + y^2)$ với $(x, y) \\in \\mathbb{R}^2$. Chọn kết quả đúng:",
        "options": [
          {
            "id": "A",
            "text": "$y \\cdot f'_x(x, y) + x \\cdot f'_y(x, y) = -x$"
          },
          {
            "id": "B",
            "text": "$y \\cdot f'_x(x, y) + x \\cdot f'_y(x, y) = -y$"
          },
          {
            "id": "C",
            "text": "$y \\cdot f'_x(x, y) + x \\cdot f'_y(x, y) = x$"
          },
          {
            "id": "D",
            "text": "$y \\cdot f'_x(x, y) + x \\cdot f'_y(x, y) = y$"
          }
        ],
        "correct": "A",
        "explanation": "Ta tính các đạo hàm riêng của $f(x, y) = -y + g(-x^2 + y^2)$:\n$f'_x(x, y) = g'(-x^2 + y^2) \\cdot (-2x)$,\n$f'_y(x, y) = -1 + g'(-x^2 + y^2) \\cdot (2y)$.\nThay vào biểu thức:\n$$y \\cdot f'_x(x, y) + x \\cdot f'_y(x, y) = y[-2x g'(-x^2 + y^2)] + x[-1 + 2y g'(-x^2 + y^2)] = -x.$$\n\nChọn đáp án A."
      }
    ]
  }
];

export const practiceExams = practiceExamsData;

export const practiceExamMap = Object.fromEntries(
  practiceExams.map((exam) => [exam.id, exam])
);

export const getPracticeExamById = (id) => practiceExamMap[id] || practiceExamMap['k50-dot-2'];

export const isPracticeExamId = (id) => Boolean(practiceExamMap[id]);
