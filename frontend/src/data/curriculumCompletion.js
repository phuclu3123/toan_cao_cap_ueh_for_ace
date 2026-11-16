// Source-bound additions approved after the 14/11/2026 PNTA/LXT audit.
// PTVP remains first order. Second differentials are calculus, not second-order ODEs.
const R = String.raw;
const refs = {
  limits: ['Slide PNTA · Chương 4 · trang 1–18'],
  derivative: ['Slide PNTA · Chương 5 · trang 1–7, 35–50, 60–65', 'Slide LXT · lecture07 · trang 3–13'],
  economics: ['Slide PNTA · Chương 5 · trang 7–21, 31–38', 'Slide LXT · lecture07 · trang 7, 13'],
  partial: ['Slide PNTA · Chương 6 · trang 1–17, 51–55', 'Slide LXT · lecture08 · trang 3–13'],
  extrema: ['Slide PNTA · Chương 5 · trang 50–59; Chương 6 · trang 17–33', 'Slide LXT · lecture07 · trang 10–13; lecture08 · trang 14–16'],
  lagrange: ['Slide PNTA · Chương 6 · trang 34–50', 'Slide LXT · lecture08 · trang 17–21'],
  ode: ['Slide PNTA · Chương 7 · trang 1–38, 56–57', 'Slide LXT · slides-lec9_Vie · trang 9–26'],
};
const q = (sectionId, question, options, correctIndex, explanation) => ({ sectionId, question, options, correctIndex, explanation });
const section = (id, title, source, data) => ({
  id, title, references: refs[source], ...data,
  recall: data.recalls[0],
});

const additions = {
  5: [
    section('limits-core', 'Giới hạn: hai phía, một phía và tại vô cực', 'limits', {
      conditions: 'Xét điểm tụ của miền xác định. Khi tìm giới hạn tại a, không cần hàm xác định tại chính a.',
      definition: R`$\lim_{x\to a}f(x)=L$ diễn tả giá trị $f(x)$ tiến gần $L$ khi $x$ tiến gần $a$ trong miền xác định, với $x\ne a$. Giới hạn hữu hạn hai phía tồn tại khi và chỉ khi hai giới hạn một phía cùng tồn tại hữu hạn và bằng nhau.`,
      content: R`### Phân biệt điểm đang tiến đến và giá trị tại điểm
Với $f(x)=(x^2-1)/(x-1)$, hàm không xác định tại $1$ nhưng trên $x\ne1$ bằng $x+1$, nên giới hạn bằng $2$. Không gán $f(1)=2$ nếu đề chưa mở rộng hàm.

### Một phía và giới hạn vô cực
Với $f(x)=1/x$, giới hạn phải tại $0$ là $+\infty$, giới hạn trái là $-\infty$: không có giới hạn hai phía. Dấu vô cực mô tả không bị chặn, không phải một số thực để thực hiện phép trừ $\infty-\infty$.
Tại $+\infty$ và $-\infty$ phải xét riêng. Chẳng hạn $e^x\to+\infty$ khi $x\to+\infty$ nhưng $e^x\to0$ khi $x\to-\infty$.

### Quy tắc hữu hạn
Khi hai giới hạn hữu hạn tồn tại, giới hạn bảo toàn tổng, hiệu và tích. Với thương, giới hạn mẫu phải khác $0$. Dạng $0/0$ chưa cho đáp số: cần biến đổi trên lân cận thủng trước khi lấy giới hạn.`,
      workedExample: { question: R`Tính $\lim_{x\to1}(x^2-1)/(x-1)$ và phân biệt với $f(1)$.`, steps: [R`Với $x\ne1$, phân tích $x^2-1=(x-1)(x+1)$, nên thương bằng $x+1$.`, R`Lấy giới hạn được $2$. Hàm gốc chưa xác định tại $1$; giới hạn không tự tạo giá trị $f(1)$.`], casioTip: 'Thử số gần điểm chỉ gợi ý kết quả; phép biến đổi trên x khác 1 mới giải thích giới hạn.' },
      recalls: [{ front: 'Khi nào giới hạn hai phía bằng L?', back: 'Khi cả giới hạn trái và phải tồn tại và cùng bằng L; giá trị tại điểm có thể không được định nghĩa.' }, { front: R`$\lim_{x\to0^+}1/x$ và $\lim_{x\to0^-}1/x$?`, back: R`Lần lượt $+\infty$ và $-\infty$; không tồn tại giới hạn hai phía.` }],
      trap: { title: 'Thay số vào dạng vô định', wrong: '0/0 bằng 0 nên giới hạn bằng 0.', right: '0/0 là dạng vô định, phải phân tích thêm.', explanation: 'Các hàm khác nhau có thể cùng tạo 0/0 nhưng có giới hạn khác nhau.' },
    }),
    section('special-limits', 'Giới hạn đặc biệt, so sánh bậc và định lý kẹp', 'limits', {
      conditions: 'Góc đo bằng radian. Biến phụ phải thật sự tiến về 0; với log và lũy thừa phải kiểm tra miền xác định.',
      definition: R`Khi $u\to0$: $\dfrac{\sin u}{u}\to1$, $\dfrac{e^u-1}{u}\to1$, $\dfrac{\ln(1+u)}{u}\to1$, $\dfrac{(1+u)^\alpha-1}{u}\to\alpha$ và $(1+u)^{\dfrac1u}\to e$.`,
      content: R`### Đổi đúng biến nhỏ
$$\lim_{x\to0}\frac{e^{2x}-1}{\sin3x}=\lim\frac{e^{2x}-1}{2x}\frac{3x}{\sin3x}\frac23=\frac23.$$
Với phân thức đa thức tại vô cực, chia cho lũy thừa cao nhất cần thiết. Hai đa thức cùng bậc cho tỷ số hệ số đầu; tử bậc thấp hơn mẫu cho $0$. Khi tử bậc cao hơn, phải xét dấu và chiều vô cực, không kết luận chỉ bằng tên dạng.

### Định lý kẹp
Nếu $g(x)\le f(x)\le h(x)$ gần điểm xét và hai hàm ngoài cùng có giới hạn $L$, thì $f(x)\to L$. Vì $|\sin(1/x)|\le1$, ta có $|x^2\sin(1/x)|\le x^2\to0$; giới hạn bằng $0$ dù $\sin(1/x)$ không có giới hạn. Tổng quát: một hàm tiến về $0$ nhân hàm bị chặn sẽ tiến về $0$.`,
      workedExample: { question: R`Tính $\lim_{x\to0}x^2\sin\left(\dfrac1x\right)$ và $\lim_{x\to0}\dfrac{\ln(1+4x)}{\sin2x}$.`, steps: [R`Kẹp $-x^2\le x^2\sin\left(\dfrac1x\right)\le x^2$ cho giới hạn thứ nhất bằng $0$.`, R`Viết thương thứ hai thành $\dfrac{\ln(1+4x)}{4x}\,\dfrac{2x}{\sin2x}\,2$. Hai phân thức tiến về $1$, kết quả bằng $2$.`], casioTip: 'Không cần tìm giới hạn riêng của sin(1/x) để dùng định lý kẹp.' },
      recalls: [{ front: R`Ba giới hạn đặc biệt cho sin, exp và log khi $u\to0$?`, back: R`$\dfrac{\sin u}{u}\to1$, $\dfrac{e^u-1}{u}\to1$, $\dfrac{\ln(1+u)}{u}\to1$.` }, { front: 'Khi nào tích của một hàm dao động vẫn có giới hạn 0?', back: 'Khi nhân tử còn lại tiến về 0 và hàm dao động bị chặn gần điểm xét.' }],
      trap: { title: 'Bỏ hệ số biến phụ', wrong: R`$\ln(1+4x)/\sin2x\to1$.`, right: 'Phải giữ tỷ số 4/2; kết quả bằng 2.', explanation: 'Hai giới hạn chuẩn dùng hai biến phụ khác nhau.' },
    }),
    section('continuity-piecewise', 'Liên tục và khả vi của hàm từng đoạn', 'limits', {
      conditions: 'Liên tục tại a đòi hỏi a thuộc miền xác định. Khả vi hai phía được xét tại điểm trong miền.',
      definition: R`Hàm liên tục tại $a$ khi $\lim_{x\to a}f(x)=f(a)$. Với hàm từng đoạn, cần $\lim_{x\to a^-}f(x)=\lim_{x\to a^+}f(x)=f(a)$. Khả vi suy ra liên tục; chiều đảo không đúng.`,
      content: R`### Trình tự biện luận
Tìm miền xác định, tính giá trị tại điểm nối, tính hai giới hạn để tìm tham số liên tục. Sau đó dùng thương sai phân trái/phải để kiểm tra khả vi. Có thể dùng giới hạn đạo hàm các nhánh khi đã có các giả thiết phù hợp, nhưng không được bỏ bước liên tục.

Ví dụ $f(x)=ax+b$ khi $x<1$ và $f(x)=x^2$ khi $x\ge1$. Liên tục cần $a+b=1$. Đạo hàm trái bằng $a$, đạo hàm phải bằng $2$, nên khả vi cần thêm $a=2$, từ đó $b=-1$.`,
      workedExample: { question: R`Với hàm từng đoạn $ax+b$ khi $x<1$ và $x^2$ khi $x\ge1$, tìm a,b để khả vi tại 1.`, steps: [R`$f(1)=1$ và giới hạn trái là $a+b$, nên cần $a+b=1$.`, R`Sau khi liên tục, thương sai phân phải tiến về $2$ và trái về $a$.`, R`Cho hai đạo hàm bằng nhau: $a=2$, suy ra $b=-1$.`], casioTip: 'Điều kiện liên tục và điều kiện bằng nhau của đạo hàm là hai bước riêng.' },
      recalls: [{ front: 'Ba điều kiện để liên tục tại một điểm?', back: 'Giá trị hàm tại điểm tồn tại; giới hạn tồn tại hữu hạn; hai giá trị bằng nhau.' }, { front: 'Liên tục có bảo đảm khả vi không?', back: R`Không. $|x|$ liên tục tại 0 nhưng đạo hàm trái −1 khác đạo hàm phải 1.` }],
      trap: { title: 'Chỉ khớp đạo hàm các nhánh', wrong: 'Hai nhánh có cùng đạo hàm nên hàm chắc chắn khả vi tại điểm nối.', right: 'Còn phải kiểm tra giá trị và tính liên tục tại điểm nối.', explanation: 'Hai đường song song lệch nhau có thể cùng đạo hàm nhưng tạo bước nhảy.' },
    }),
    section('lhopital', 'L’Hôpital: giả thiết và chuyển dạng vô định', 'derivative', {
      conditions: R`Hai hàm khả vi trên lân cận thủng; mẫu đạo hàm khác 0; thương gốc có dạng $0/0$ hoặc $\infty/\infty$; giới hạn thương đạo hàm phải tồn tại (hữu hạn hoặc vô cực).`,
      definition: R`Dưới các giả thiết L’Hôpital, $\lim f/g=\lim f'/g'$. Đây không phải công thức đạo hàm của thương; lấy đạo hàm riêng tử và mẫu chỉ là phép thay thế để tính giới hạn.`,
      content: R`### Kiểm tra dạng trước mỗi lần áp dụng
Với $(e^x-1-x)/x^2$ khi $x\to0$, lần đầu cho $(e^x-1)/(2x)$ vẫn là $0/0$; lần hai cho $e^x/2\to1/2$.

### Dạng khác phải biến đổi
Với $0\cdot\infty$, chuyển tích thành thương, ví dụ $x\ln x=\ln x/(1/x)$ khi $x\to0^+$. Với $\infty-\infty$, quy đồng hoặc biến đổi liên hợp. Với $1^\infty$, $0^0$, $\infty^0$, đặt $y=u(x)^{v(x)}>0$, tìm giới hạn $\ln y=v\ln u$ trước rồi lấy mũ. Ví dụ $x^x$ khi $x\to0^+$: $x\ln x\to0$ nên $x^x\to1$.

Không tồn tại giới hạn $f'/g'$ không tự chứng minh $f/g$ không có giới hạn: tiêu chuẩn này có điều kiện, không phải một phép tương đương hai chiều.`,
      workedExample: { question: R`Tính $\lim_{x\to0^+}x^x$.`, steps: [R`Đặt $y=x^x>0$, nên $\ln y=x\ln x=\ln x/(1/x)$, dạng $-\infty/\infty$.`, R`L’Hôpital cho $\lim (1/x)/(-1/x^2)=\lim(-x)=0$.`, R`Do hàm mũ liên tục, $\lim y=e^0=1$.`], casioTip: 'Lấy log chỉ hợp lệ khi cơ số dương trên khoảng xét.' },
      recalls: [{ front: 'L’Hôpital áp dụng trực tiếp cho dạng nào?', back: R`$0/0$ và $\infty/\infty$, kèm giả thiết khả vi, mẫu đạo hàm khác 0 và giới hạn thương đạo hàm.` }, { front: R`Cách xử lý $u(x)^{v(x)}$ có dạng vô định?`, back: 'Khi u>0, xét v ln(u), tìm giới hạn rồi lấy hàm mũ; không đạo hàm số mũ và cơ số riêng rẽ.' }],
      trap: { title: 'Dùng L’Hôpital khi chưa có dạng vô định', wrong: R`$\lim_{x\to0}(1+x)/(2+x)=1$.`, right: 'Thay trực tiếp cho 1/2; không dùng thương hai đạo hàm.', explanation: 'Giới hạn tử và mẫu đều khác 0 nên không có dạng vô định.' },
    }),
    section('higher-derivatives', 'Đạo hàm cấp cao và công thức Leibniz', 'derivative', {
      conditions: 'Các đạo hàm đến cấp n cần tồn tại trên miền xét. Với công thức lũy thừa và log, giữ điều kiện miền ban đầu.',
      definition: R`$f^{(n)}$ là đạo hàm của $f^{(n-1)}$. Với tích hai hàm: $$(uv)^{(n)}=\sum_{k=0}^n\binom nk u^{(k)}v^{(n-k)}.$$`,
      content: R`### Công thức thường dùng
$$(e^{ax})^{(n)}=a^ne^{ax},\quad (\sin ax)^{(n)}=a^n\sin(ax+n\pi/2),$$
$$(\ln x)^{(n)}=(-1)^{n-1}(n-1)!/x^n\quad(n\ge1,x>0).$$
Với đa thức bậc m, đạo hàm cấp lớn hơn m bằng 0. Bởi vậy tổng Leibniz có thể còn rất ít hạng dù n lớn. Mỗi hạng dùng tổng cấp đạo hàm bằng n, có hệ số nhị thức; không chỉ lấy đạo hàm cấp n của từng nhân tử rồi nhân lại.

Ví dụ $f=x^3\sin x$ và n=20 tại 0: chỉ hạng có đạo hàm cấp 3 của $x^3$ còn đóng góp. Đạo hàm cấp 17 của sin tại 0 bằng 1, nên $f^{(20)}(0)=\binom{20}{3}\,6=6840$.`,
      workedExample: { question: R`Tính $f^{(20)}(0)$ với $f=x^3\sin x$.`, steps: [R`Áp dụng Leibniz, chỉ cần xét các cấp đạo hàm 0,1,2,3 của $x^3$.`, R`Tại 0, ba cấp đầu đều bằng 0; cấp 3 bằng 6. Các cấp cao hơn bằng 0.`, R`Còn $\binom{20}{3}6\sin^{(17)}(0)=1140\cdot6\cdot1=6840$.`], casioTip: 'Xét các hạng bằng 0 trước khi tính các hệ số lớn.' },
      recalls: [{ front: 'Công thức Leibniz cho đạo hàm cấp n của tích?', back: R`$(uv)^{(n)}=\sum_{k=0}^n\binom nk u^{(k)}v^{(n-k)}$.` }, { front: R`Đạo hàm cấp n của $e^{ax}$ và $\ln x$?`, back: R`$a^ne^{ax}$; $(-1)^{n-1}(n-1)!/x^n$ với n≥1,x>0.` }],
      trap: { title: 'Nhân hai đạo hàm cấp n', wrong: R`$(uv)^{(n)}=u^{(n)}v^{(n)}$.`, right: 'Phải cộng các hạng Leibniz, mỗi hạng có tổng cấp bằng n.', explanation: 'Ngay cấp một đã có hai hạng u′v và uv′.' },
    }),
    section('taylor-maclaurin', 'Taylor–Maclaurin và kiểm soát sai số', 'derivative', {
      conditions: 'Hàm có đạo hàm đến cấp n+1 trên khoảng chứa x0 và x; chặn đạo hàm cấp n+1 trên đoạn nối hai điểm để chặn phần dư.',
      definition: R`$$f(x)=\sum_{k=0}^n\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k+R_n,\quad R_n=\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-x_0)^{n+1}.$$Điểm ξ nằm giữa x0 và x. Khi x0=0 gọi là khai triển Maclaurin.`,
      content: R`### Những khai triển cần nhớ
$$e^x=1+x+\frac{x^2}{2!}+\cdots+\frac{x^n}{n!}+R_n.$$
Gần 0: $\sin x=x-x^3/3!+x^5/5!+\cdots$; $\cos x=1-x^2/2!+x^4/4!+\cdots$; $\ln(1+x)=x-x^2/2+x^3/3-\cdots$. Với một đa thức hữu hạn luôn có phần dư; không viết dấu bằng chính xác sau khi tự bỏ phần dư.

### Chặn sai số
Nếu $|f^{(n+1)}|\le M$ trên đoạn xét thì $|R_n|\le M|x-x_0|^{n+1}/(n+1)!$. Khai triển ln quanh 0 phải ở miền $x>-1$; dùng chặn đạo hàm trên đoạn thật, không áp dụng một chặn cho mọi x.

### Tính giới hạn bằng phần đầu khác 0
Vì $e^x=1+x+x^2/2+o(x^2)$ nên $(e^x-1-x)/x^2\to1/2$. Đẳng thức khai triển chỉ hữu ích khi biết bậc phần dư so với mẫu.`,
      workedExample: { question: R`Dùng Maclaurin bậc hai ước lượng $e^{0,1}$ và chặn sai số.`, steps: [R`Đa thức cho $1+0,1+0,1^2/2=1,105$.`, R`Trên [0;0,1], đạo hàm cấp ba là $e^x<1,106$.`, R`Sai số không quá $1,106\cdot0,1^3/6<0,000185$. Vì phần dư dương, giá trị thực lớn hơn 1,105.`], casioTip: 'Số bậc khai triển và bậc phần dư khác nhau một đơn vị.' },
      recalls: [{ front: 'Taylor quanh x0 khác Maclaurin ở đâu?', back: 'Maclaurin là Taylor với tâm x0=0; hệ số chung là đạo hàm cấp k tại tâm chia k!.' }, { front: 'Chặn phần dư Taylor bằng đạo hàm thế nào?', back: R`Nếu $|f^{(n+1)}|\le M$, thì $|R_n|\le M|x-x_0|^{n+1}/(n+1)!$.` }],
      trap: { title: 'Đổi xấp xỉ thành đẳng thức', wrong: R`$e^{0,1}=1,105$ chính xác.`, right: 'Đây là xấp xỉ; cần giữ hoặc chặn phần dư.', explanation: 'Hàm mũ không trùng với một đa thức hữu hạn.' },
    }),
    section('second-differential', 'Vi phân cấp hai của hàm một biến', 'derivative', {
      conditions: 'Biến độc lập x có dx cố định khi lấy vi phân tiếp; hàm có đạo hàm cấp hai gần điểm xét.',
      definition: R`$$dy=f'(x)dx,\qquad d^2y=f''(x)(dx)^2.$$Với bước h=dx nhỏ: $\Delta y=f'(x)h+\frac12 f''(x)h^2+o(h^2)\approx dy+\frac12d^2y$.`,
      content: R`### Hệ số 1/2 nằm ở công thức xấp xỉ
Vi phân cấp hai tự nó không có hệ số 1/2. Hệ số này xuất hiện khi đưa vào khai triển Taylor. Ký hiệu $(dx)^2$ không phải $d(x^2)$, và $d^2y$ không phải $(dy)^2$.

Với $f(x)=\cos x$ tại 0, $dy=0$, $d^2y=-(dx)^2$, nên $\cos h\approx1-h^2/2$. Đây là phép tính vi phân của một hàm đã biết, không phải bài toán tìm nghiệm phương trình vi phân cấp hai.`,
      workedExample: { question: R`Tính dy,d²y của $f=x^5e^{3x}$.`, steps: [R`$f'=e^{3x}(5x^4+3x^5)$.`, R`Dùng quy tắc tích lần nữa: $f''=e^{3x}(20x^3+30x^4+9x^5)$.`, R`$dy=e^{3x}(5x^4+3x^5)dx$ và $d^2y=e^{3x}(20x^3+30x^4+9x^5)(dx)^2$.`], casioTip: 'Đạo hàm hai lần rồi mới nhân (dx)²; không bình phương đạo hàm lần đầu.' },
      recalls: [{ front: 'Vi phân cấp hai và xấp xỉ bậc hai một biến?', back: R`$d^2y=f''(x)(dx)^2$; $\Delta y\approx dy+\frac12d^2y$.` }],
      trap: { title: 'Bình phương vi phân cấp một', wrong: R`$d^2y=(f'(x)dx)^2$.`, right: R`$d^2y=f''(x)(dx)^2$.`, explanation: 'Lấy vi phân tiếp và bình phương một biểu thức là hai phép khác nhau.' },
    }),
  ],
  6: [
    section('economic-marginals', 'Ứng dụng: chi phí, doanh thu và lợi nhuận biên', 'economics', {
      group: 'applications', conditions: 'Sản lượng q thuộc miền kinh tế; các hàm khả vi. Thay đổi một đơn vị chỉ là xấp xỉ khi đường cong chưa tuyến tính.',
      definition: R`$MC=C'(q)$, $MR=R'(q)$, $\pi=R-C$ và $\pi'=MR-MC$. Nếu giá phụ thuộc sản lượng, doanh thu là $R(q)=q\,p(q)$ nên $MR=p+qp'$.`,
      content: R`### Đọc đúng ba câu hỏi
MC đo chi phí tăng xấp xỉ khi sản lượng tăng một đơn vị quanh mức hiện tại; MR đo doanh thu tương ứng; MR−MC đo lợi nhuận biên. Không dùng MR=p nếu giá thay đổi theo q.

### Điều kiện tối đa lợi nhuận
Nghiệm nội bộ khả vi cần MR=MC. Cần thêm kiểm tra dấu π′ hoặc độ cong π″, miền q≥0, giới hạn cầu và các đầu mút; MR=MC một mình chưa bảo đảm tối đa.`,
      workedExample: { question: R`Cho $p=100-q$, $C=q^2+10q+50$. Tìm mức sản lượng có lợi nhuận lớn nhất trên $0\le q\le100$.`, steps: [R`$R=100q-q^2$, $MR=100-2q$, $MC=2q+10$.`, R`$MR=MC$ cho $q=22,5$.`, R`$\pi=-2q^2+90q-50$ có $\pi''=-4<0$, nên đây là tối đa toàn cục trên đoạn; giá bán bằng 77,5 và lợi nhuận bằng 962,5.`], casioTip: 'Kiểm tra q thuộc miền cầu trước khi kết luận.' },
      recalls: [{ front: 'MR và lợi nhuận biên tính thế nào khi p=p(q)?', back: R`$MR=p+qp'$, $\pi'=MR-MC$.` }, { front: 'MR=MC đã đủ tối đa lợi nhuận chưa?', back: 'Chưa; đây là điều kiện dừng nội bộ, cần kiểm tra cực đại và miền khả thi.' }],
      trap: { title: 'Bỏ tác động giảm giá', wrong: 'Với p=100−q thì MR luôn bằng p.', right: 'MR=100−2q vì bán thêm còn làm thay đổi doanh thu của lượng đã bán.', explanation: 'Phải đạo hàm tích qp(q).' },
    }),
    section('economic-average', 'Ứng dụng: chi phí bình quân và MC–AC', 'economics', {
      group: 'applications', conditions: 'q>0, C khả vi; kiểm tra dấu hoặc đạo hàm cấp hai khi tìm min AC.',
      definition: R`$$AC(q)=\frac{C(q)}q,\qquad AC'(q)=\frac{MC(q)-AC(q)}q.$$Vì q>0, MC<AC làm AC giảm, MC>AC làm AC tăng.`,
      content: R`### Bình quân khác tốc độ thay đổi trung bình
AC là tổng chi phí chia số sản phẩm tại một mức sản lượng. Tốc độ thay đổi trung bình trên [q1,q2] là $[C(q_2)-C(q_1)]/(q_2-q_1)$: đó là một đại lượng khác. Đồ thị AC biểu diễn độ dốc từ gốc tới điểm trên đồ thị C; MC là độ dốc tiếp tuyến.

Tại một cực tiểu nội bộ của AC khả vi, MC=AC. Chiều đảo cần kiểm tra: hai đường cắt nhau chỉ cho điểm dừng.`,
      workedExample: { question: R`Cho $C(q)=q^2+10q+100$. Tìm min AC trên q>0.`, steps: [R`$AC=q+10+100/q$, $AC'=1-100/q^2$.`, R`Điểm dừng q=10; $AC''=200/q^3>0$ với mọi q>0.`, R`Min AC=30 và MC(10)=2·10+10=30.`], casioTip: 'Cực tiểu bình quân không phải cực tiểu tổng chi phí.' },
      recalls: [{ front: 'Tại sao MC thấp hơn AC làm AC giảm?', back: R`$AC'=(MC-AC)/q$ và q>0 nên AC′ cùng dấu với MC−AC.` }],
      trap: { title: 'Nhầm hai loại trung bình', wrong: 'AC luôn bằng độ dốc cát tuyến giữa hai mức sản lượng bất kỳ.', right: 'AC=C/q; tốc độ trung bình dùng hiệu chi phí chia hiệu sản lượng.', explanation: 'Hai phép chia dùng hai bộ dữ kiện khác nhau.' },
    }),
    section('demand-revenue', 'Ứng dụng: co giãn cầu, cầu ngược và doanh thu', 'economics', {
      group: 'applications', conditions: 'p>0,q>0, q=q(p) khả vi. Công thức dùng cầu ngược cần p′(q) khác 0 và nhánh có thể đảo cục bộ.',
      definition: R`Co giãn có dấu $\varepsilon=(p/q)q'(p)$. Với cầu dốc xuống, độ co giãn không âm thường dùng là $E=-\varepsilon=|\varepsilon|$. Vì $R(p)=p q(p)$: $$R'(p)=q(1+\varepsilon)=q(1-E).$$`,
      content: R`### Phân loại và quyết định giá
E>1: cầu co giãn, tăng giá nhỏ làm doanh thu giảm. 0≤E<1: cầu kém co giãn, tăng giá nhỏ làm doanh thu tăng. E=1: doanh thu dừng ở bậc nhất; chưa tự kết luận tối đa toàn miền.

### Khi đề cho p=p(q)
$$q'(p)=1/p'(q),\qquad \varepsilon=\frac{p}{q\,p'(q)}.$$
Phải tìm q tương ứng với p đang xét trước khi thế. Không lấy đạo hàm p theo q rồi nhân p/q như thể đó là đạo hàm q theo p. Với cầu không dốc xuống, dùng công thức có dấu R′=q(1+ε), không tự thay bằng q(1−|ε|).`,
      workedExample: { question: R`Cho cầu ngược $p=250-0,5q^2$. Tại p=50, giá giảm 2% thì lượng cầu và doanh thu thay đổi xấp xỉ thế nào?`, steps: [R`$50=250-0,5q^2$, lấy nhánh q>0 cho q=20. $p'(q)=-q=-20$.`, R`$\varepsilon=50/[20(-20)]=-1/8$. Lượng cầu tăng xấp xỉ $(-1/8)(-2\%)=0,25\%$.`, R`$\Delta R/R\approx\Delta p/p+\Delta q/q=-1,75\%$. Đây là xấp xỉ cục bộ.`], casioTip: 'Dùng co giãn có dấu khi nhân phần trăm, dùng độ lớn khi phân loại.' },
      recalls: [{ front: 'Co giãn cầu liên hệ doanh thu theo giá thế nào?', back: R`$R'(p)=q(1+\varepsilon)$; với cầu dốc xuống, $R'=q(1-E)$.` }, { front: 'Co giãn cầu khi biết p=p(q)?', back: R`$\varepsilon=p/[q p'(q)]$ khi nhánh đảo khả vi và p′≠0.` }],
      trap: { title: 'Làm mất dấu của thay đổi', wrong: 'E=2 và giá giảm 1% nên lượng cầu giảm 2%.', right: 'Cầu dốc xuống có ε=−2, nên lượng cầu tăng xấp xỉ 2%.', explanation: 'Độ lớn để phân loại không thay thế dấu trong phép tính.' },
    }),
    section('consumption-saving', 'Ứng dụng: tiêu dùng, tiết kiệm và hữu dụng biên', 'economics', {
      group: 'applications', conditions: 'Thu nhập I được phân thành tiêu dùng C(I) và tiết kiệm S(I), cùng đơn vị và cùng kỳ; các hàm khả vi.',
      definition: R`Từ $I=C(I)+S(I)$ suy ra $MPC=C'(I)$, $MPS=S'(I)$ và $MPC+MPS=1$. Với hữu dụng U(x), hữu dụng biên là MU=U′(x).`,
      content: R`### Mức tổng và mức biên
MPC=0,8 nghĩa là thu nhập tăng nhỏ một đơn vị thì tiêu dùng tăng xấp xỉ 0,8; không có nghĩa tiêu dùng tổng bằng 80% thu nhập. Tỷ phần tổng là APC=C/I và APS=S/I. Đẳng thức MPC+MPS=1 đến từ giả thiết phân bổ toàn thu nhập, không phải một quy luật của mọi mô hình có thuế/chuyển giao chưa được đưa vào.

Với U=6√x (x>0), MU=3/√x>0 và U″<0: hữu dụng tăng nhưng hữu dụng biên giảm. Hữu dụng biên giảm không đồng nghĩa hữu dụng tổng giảm.`,
      workedExample: { question: R`Cho $C(I)=20+0,8I$. Tại I=100, tính C,S,MPC,MPS và ước lượng khi I tăng 5.`, steps: [R`C(100)=100; S=I−C=0,2I−20 nên S(100)=0.`, R`MPC=0,8; MPS=0,2; tổng bằng 1.`, R`ΔC=4 và ΔS=1. Vì mô hình tuyến tính, hai thay đổi này là chính xác, không chỉ xấp xỉ.`], casioTip: 'Có thể có tiết kiệm bằng 0 tại một mức thu nhập dù MPS khác 0.' },
      recalls: [{ front: 'Từ I=C+S suy ra quan hệ giữa MPC và MPS?', back: 'Lấy đạo hàm theo I: 1=C′+S′=MPC+MPS.' }, { front: 'Hữu dụng biên giảm có nghĩa hữu dụng giảm không?', back: 'Không; U′ có thể vẫn dương nhưng U″ âm: tổng tăng với tốc độ nhỏ dần.' }],
      trap: { title: 'Nhầm biên với tỷ phần', wrong: 'MPC=0,8 nên C/I luôn bằng 0,8.', right: 'MPC là C′; APC là C/I và có thể khác nhau.', explanation: 'Một số hạng tiêu dùng tự định làm hai đại lượng khác nhau.' },
    }),
    section('marginal-product-revenue', 'Ứng dụng: năng suất biên và doanh thu sản phẩm biên', 'economics', {
      group: 'applications', conditions: 'Sản lượng q=q(L) và doanh thu R=R(q) khả vi; giữ các đầu vào khác cố định khi thay L.',
      definition: R`$MPL=q'(L)$ và $MRP=dR/dL=R'(q)q'(L)=MR\cdot MPL$. Với vốn K, dùng đạo hàm theo K tương ứng.`,
      content: R`### Hai tầng phụ thuộc
Lao động làm thay đổi sản lượng; sản lượng làm thay đổi doanh thu. Nhân hai tốc độ theo chuỗi cho đơn vị tiền trên một đơn vị lao động. Không cộng MR và MPL vì hai đại lượng có đơn vị khác nhau. Nếu giá bán p cố định, MR=p và MRP=p·MPL; nếu p thay đổi theo q phải tính MR trước.`,
      workedExample: { question: R`Giả sử $q=2\sqrt L+10L$, $p=4020-0,5q$. Tính MRP tại L=100.`, steps: [R`q(100)=1020 và MPL=1/√L+10=10,1.`, R`R=4020q−0,5q² nên MR=4020−q=3000 tại q=1020.`, R`MRP=3000·10,1=30300, đơn vị tiền trên đơn vị lao động.`], casioTip: 'MR phải tính tại sản lượng ứng với đúng mức lao động đang xét.' },
      recalls: [{ front: 'Công thức doanh thu sản phẩm biên theo lao động?', back: R`$MRP=MR\cdot MPL$ từ quy tắc dây chuyền.` }],
      trap: { title: 'Thay MR bằng giá trong độc quyền', wrong: 'MRP luôn bằng p·MPL.', right: 'Chỉ dùng công thức đó khi giá cố định; nói chung MRP=MR·MPL.', explanation: 'Giá phụ thuộc sản lượng làm doanh thu biên khác giá.' },
    }),
  ],
  7: [
    section('multivariable-domain', 'Miền xác định của hàm hai biến', 'partial', {
      conditions: 'Lấy giao tất cả điều kiện căn, log, mẫu số; biên được lấy hay bỏ tùy biểu thức.',
      definition: 'Miền xác định D là tập các cặp (x,y) làm công thức có nghĩa trong số thực. Điểm trong và điểm biên của D có vai trò khác nhau trong vi phân và tối ưu.',
      content: R`Với $f=\sqrt{4-x^2-y^2}$, miền là đĩa đóng $x^2+y^2\le4$. Với $g=\ln(2x-3y^2)$, cần $2x-3y^2>0$; đường parabol biên không thuộc miền log. Với phân thức, loại đường làm mẫu bằng 0. Khi có cả log và căn, phải thỏa đồng thời, không lấy hợp hai miền.

Khả vi trên một lân cận mở là giả thiết thuận tiện cho công thức vi phân; có giá trị trên biên chưa bảo đảm có đạo hàm hữu hạn tại đó.`,
      workedExample: { question: R`Tìm miền của $f(x,y)=\ln(4-x^2-y^2)/(x-y)$.`, steps: [R`Log cần $x^2+y^2<4$.`, R`Mẫu cần x≠y.`, R`Miền là phần trong đường tròn bán kính 2, loại đường x=y; không lấy đường tròn biên.`], casioTip: 'Mẫu khác 0 không thay thế điều kiện đối số log dương.' },
      recalls: [{ front: 'Miền của căn và log khác nhau ở đường biên thế nào?', back: 'Căn bậc hai cho phép biểu thức dưới căn bằng 0; log bắt buộc đối số dương.' }],
      trap: { title: 'Lấy hợp các điều kiện', wrong: 'Chỉ cần log có nghĩa hoặc mẫu khác 0.', right: 'Mọi điều kiện phải đồng thời đúng.', explanation: 'Mỗi thành phần của công thức đều phải có nghĩa.' },
    }),
    section('second-partials', 'Đạo hàm riêng cấp hai và đạo hàm hỗn hợp', 'partial', {
      conditions: 'Dùng quy ước f_xy là lấy theo x trước rồi theo y. Nếu các đạo hàm hỗn hợp liên tục gần điểm xét thì chúng bằng nhau.',
      definition: R`$$f_{xx}=\partial_x(f_x),\quad f_{xy}=\partial_y(f_x),\quad f_{yx}=\partial_x(f_y),\quad f_{yy}=\partial_y(f_y).$$Khi f thuộc C² gần điểm xét, f_xy=f_yx.`,
      content: R`### Tính từng bước
Với $f=x^2e^{5y}$: $f_x=2xe^{5y}$, $f_y=5x^2e^{5y}$. Lấy thêm đạo hàm cho $f_{xx}=2e^{5y}$, $f_{xy}=f_{yx}=10xe^{5y}$, $f_{yy}=25x^2e^{5y}$.

Không tự đổi thứ tự trong mọi hàm không trơn. Hai bộ slide có cách ghi chỉ số hỗn hợp khác nhau; ở đây định nghĩa thứ tự bằng phép toán, và với C² các giá trị trùng nhau. Ma trận Hessian dùng bốn đạo hàm này, không dùng hai đạo hàm cấp một.`,
      workedExample: { question: R`Tính đủ bốn đạo hàm riêng cấp hai của $f=x^2e^{5y}$ tại (1,0).`, steps: [R`Tính f_x=2xe^(5y), f_y=5x²e^(5y).`, R`Lần hai cho f_xx=2e^(5y), f_xy=f_yx=10xe^(5y), f_yy=25x²e^(5y).`, 'Tại (1,0), các giá trị lần lượt 2,10,10,25.'], casioTip: 'Tính hai đạo hàm hỗn hợp theo cả hai đường để tự đối chiếu.' },
      recalls: [{ front: 'Khi nào đổi thứ tự đạo hàm hỗn hợp được?', back: 'Khi các đạo hàm riêng cấp hai liên tục trên một lân cận điểm xét; khi đó f_xy=f_yx.' }],
      trap: { title: 'Đổi thứ tự mà bỏ giả thiết', wrong: 'Đạo hàm hỗn hợp luôn bằng nhau chỉ vì cả hai tồn tại tại điểm.', right: 'Cần điều kiện đủ phù hợp, chẳng hạn liên tục gần điểm.', explanation: 'Tồn tại tại một điểm yếu hơn tính liên tục trên lân cận.' },
    }),
    section('second-total-differential', 'Vi phân cấp hai và xấp xỉ bậc hai', 'partial', {
      conditions: 'f có đạo hàm riêng cấp hai liên tục gần điểm gốc; dx,dy là các gia số độc lập.',
      definition: R`$$d^2f=f_{xx}(dx)^2+2f_{xy}dx\,dy+f_{yy}(dy)^2.$$Khi các đạo hàm tính tại điểm gốc, $\Delta f\approx df+\frac12d^2f$ cho bước nhỏ.`,
      content: R`### Vì sao có hệ số 2 ở hạng chéo?
Lấy vi phân tiếp của $df=f_xdx+f_ydy$ cho hai hạng $f_{xy}dy\,dx$ và $f_{yx}dx\,dy$; với C², chúng cộng thành $2f_{xy}dxdy$. Có thể viết $d^2f=h^THh$, với $h=(dx,dy)^T$. Đây là nền của tiêu chuẩn Hessian ở chuyên đề 8.

Không nhầm d²f với (df)². Trong Taylor, hệ số 1/2 nhân toàn bộ dạng toàn phương, kể cả hạng chéo.`,
      workedExample: { question: R`Với $f=x^2e^{5y}$ tại (1,0), dùng dx=0,01, dy=0,02 để xấp xỉ f mới đến bậc hai.`, steps: [R`f(1,0)=1; df=2dx+5dy=0,12.`, R`d²f=2dx²+20dxdy+25dy²=0,0142.`, R`f(1,01;0,02)≈1+0,12+0,0142/2=1,1271. Giá trị thực là 1,0201·e^(0,1)≈1,127385; xấp xỉ bậc hai vẫn có phần dư.`], casioTip: 'Tất cả đạo hàm phải tính tại cùng điểm (1,0), không tại điểm mới.' },
      recalls: [{ front: 'Công thức vi phân cấp hai hai biến?', back: R`$d^2f=f_{xx}dx^2+2f_{xy}dxdy+f_{yy}dy^2$.` }, { front: 'Xấp xỉ độ biến thiên đến bậc hai?', back: R`$\Delta f\approx df+\frac12d^2f$, với đạo hàm tại điểm gốc.` }],
      trap: { title: 'Quên hạng chéo', wrong: 'd²f chỉ có f_xx dx² và f_yy dy².', right: 'Còn 2f_xy dxdy khi hai biến cùng đổi.', explanation: 'Tương tác hai biến đóng góp ngay ở bậc hai.' },
    }),
    section('cross-demand', 'Cầu nhiều biến: hàng thay thế và bổ sung', 'partial', {
      conditions: 'Giữ các giá khác và thu nhập cố định; xét trên miền lượng cầu có ý nghĩa kinh tế.',
      definition: R`Dấu của $\partial q_A/\partial p_B$ đo phản ứng cầu A khi giá B đổi. Dương gợi quan hệ thay thế; âm gợi quan hệ bổ sung theo chiều đang xét.`,
      content: R`Nếu B đắt hơn và người mua chuyển sang A, cầu A tăng: đạo hàm chéo dương. Nếu A thường dùng cùng B, B đắt hơn làm cầu A giảm: đạo hàm chéo âm. Muốn kết luận quan hệ đối ứng như trong bài giảng, kiểm tra cả hai hàm cầu; dấu một chiều không tự bảo đảm dấu chiều ngược lại.

Co giãn chéo là $\varepsilon_{q_A,p_B}=(p_B/q_A)\partial q_A/\partial p_B$. Với giá và cầu dương, dấu trùng dấu đạo hàm chéo.`,
      workedExample: { question: R`Cho $q_A=100-2p_A+3p_B$, $q_B=80+p_A-2p_B$. Tại (p_A,p_B)=(10,20), xác định quan hệ và ε của q_A theo p_B.`, steps: ['Đạo hàm chéo lần lượt 3 và 1, đều dương: hai hàng thay thế trong mô hình.', 'q_A=140. Co giãn chéo bằng 3·20/140=3/7.', 'Nếu chỉ giá B tăng 1%, cầu A tăng xấp xỉ 3/7%, quanh điểm đang xét.'], casioTip: 'Không dùng đạo hàm theo chính giá A để kết luận quan hệ giữa A và B.' },
      recalls: [{ front: 'Đạo hàm chéo cầu theo giá dương/âm diễn giải thế nào?', back: 'Dương: thay thế theo chiều xét; âm: bổ sung. Kiểm tra cả hai chiều nếu cần quan hệ đối ứng.' }],
      trap: { title: 'Nhầm đạo hàm theo chính giá với giá hàng khác', wrong: 'q_A giảm theo p_A nên A và B bổ sung.', right: 'Quan hệ A–B dùng giá chéo p_B trong q_A và p_A trong q_B.', explanation: 'Hai loại đạo hàm trả lời hai câu hỏi khác nhau.' },
    }),
    section('input-compensation', 'Giữ sản lượng: bù đắp vốn và lao động', 'partial', {
      conditions: 'Q khả vi, Q_K≠0 tại điểm xét; các thay đổi nhỏ để dùng vi phân.',
      definition: R`Giữ sản lượng ở bậc nhất: $dQ=Q_LdL+Q_KdK=0$, nên $dK/dL=-Q_L/Q_K$.`,
      content: R`Tỷ lệ bù đắp phụ thuộc vào điểm đang xét và đơn vị đo. Đây là độ dốc của đường đồng lượng, không phải tự động là tỷ lệ tối ưu giá đầu vào; điều kiện tối ưu còn cần bài toán chi phí ở chuyên đề 9.

Với Cobb–Douglas $Q=AK^\alpha L^\beta$, quan hệ phần trăm là $\alpha\,dK/K+\beta\,dL/L=0$. Nó là xấp xỉ của quan hệ hữu hạn $(1+r_K)^\alpha(1+r_L)^\beta=1$.`,
      workedExample: { question: R`Cho Q=10√(KL) tại (K,L)=(4,9). Khi L tăng 0,3, cần đổi K xấp xỉ bao nhiêu để giữ Q?`, steps: ['Q_L=5√(K/L)=10/3; Q_K=5√(L/K)=7,5.', 'dK=−(Q_L/Q_K)dL=−(4/9)·0,3=−0,133333.', 'Kiểm tra bằng quan hệ chính xác KL=36: K mới=36/9,3≈3,870968, mức giảm≈0,129032.'], casioTip: 'Chênh lệch với cách giữ KL chính xác là phần dư xấp xỉ.' },
      recalls: [{ front: 'Giữ Q không đổi ở bậc nhất thì tỷ lệ bù vốn–lao động là gì?', back: R`$dK/dL=-Q_L/Q_K$ khi Q_K≠0.` }],
      trap: { title: 'Coi bù đắp là tối ưu chi phí', wrong: 'Bất kỳ điểm nào trên cùng đường đồng lượng cũng tối thiểu chi phí.', right: 'Đồng lượng chỉ giữ Q; tối ưu còn phụ thuộc giá và điều kiện Lagrange.', explanation: 'Khả thi khác tối ưu.' },
    }),
  ],
  8: [
    section('higher-order-extrema', 'Cực trị khi đạo hàm cấp hai bằng 0', 'extrema', {
      conditions: 'Hàm đủ trơn gần x0; đạo hàm đầu tiên khác 0 tại x0 là cấp n≥2.',
      definition: R`Nếu $f'(x_0)=\cdots=f^{(n-1)}(x_0)=0$, $f^{(n)}(x_0)\ne0$: n lẻ không có cực trị; n chẵn và đạo hàm dương cho cực tiểu, âm cho cực đại địa phương.`,
      content: R`Taylor cho $f(x_0+h)-f(x_0)=f^{(n)}(x_0)h^n/n!+o(h^n)$. Khi n chẵn, h^n cùng dấu ở hai phía; khi n lẻ, h^n đổi dấu. Nếu chưa tìm được đạo hàm đầu tiên khác 0, phép thử này chưa kết luận; dùng bảng dấu hoặc xét trực tiếp.

Với x⁴, đạo hàm cấp bốn tại 0 bằng 24: cực tiểu. Với x³, đạo hàm cấp ba bằng 6: không cực trị. Không chỉ đếm cấp đạo hàm lớn nhất mà mình đã tính.`,
      workedExample: { question: 'Phân loại 0 cho f=x⁶ và g=−x⁵.', steps: ['Với f, đạo hàm cấp 1–5 tại 0 bằng 0, cấp 6 bằng 720>0: cực tiểu.', 'Với g, cấp đầu khác 0 là 5, giá trị −120; cấp lẻ nên không cực trị.', 'Xét dấu x⁶ và −x⁵ gần 0 cho cùng kết luận.'], casioTip: 'Dấu âm ở cấp lẻ không biến điểm thành cực đại.' },
      recalls: [{ front: 'Tiêu chuẩn đạo hàm đầu tiên khác 0 phân loại thế nào?', back: 'Cấp lẻ: không cực trị; cấp chẵn: dương cực tiểu, âm cực đại, với giả thiết đủ trơn.' }],
      trap: { title: 'f″=0 thì không có cực trị', wrong: 'x⁴ không có cực trị tại 0 vì f″(0)=0.', right: 'Tiêu chuẩn cấp hai chưa kết luận; cấp bốn hoặc xét dấu cho cực tiểu.', explanation: 'Không đủ thông tin khác với phủ định cực trị.' },
    }),
    section('convex-global', 'Độ cong trên miền lồi và cực trị toàn cục', 'extrema', {
      conditions: 'Miền D lồi, mở và hàm C²; khi dùng điểm dừng, điểm phải nằm trong D. Miền có biên cần kiểm tra tính khả thi và biên.',
      definition: 'Hessian nửa xác định dương trên toàn miền lồi cho hàm lồi; nửa xác định âm cho hàm lõm. Một điểm dừng của hàm lồi là cực tiểu toàn cục; hàm lõm cho cực đại toàn cục.',
      content: R`### Tại điểm khác trên toàn miền
Hessian dương xác định chỉ tại một điểm dừng cho cực tiểu địa phương. Nếu dương xác định tại mọi điểm trên miền lồi, hàm lồi chặt và điểm dừng là cực tiểu toàn cục duy nhất. Hai biến có điều kiện đủ $f_{xx}>0$ và $\det H>0$ trên toàn miền; với cực đại đổi điều kiện đầu thành $f_{xx}<0$.

Một biến: f″≥0 trên khoảng cho lồi, f″≤0 cho lõm. Dùng dấu và điều kiện miền để tránh nhầm cách gọi lồi/lõm không thống nhất giữa tài liệu.`,
      workedExample: { question: R`Chứng minh $f=x^2+xy+y^2-4x-5y$ có min toàn cục duy nhất.`, steps: ['Điểm dừng là (1,2). Hessian [[2,1],[1,2]] có f_xx=2>0 và định thức 3>0 tại mọi điểm.', 'Miền R² lồi nên f lồi chặt, (1,2) là cực tiểu toàn cục duy nhất.', 'Đặt u=x−1,v=y−2: f=−7+u²+uv+v²≥−7, kiểm tra độc lập.'], casioTip: 'Chứng minh dấu trên toàn miền, không chỉ thế điểm dừng.' },
      recalls: [{ front: 'Muốn suy toàn cục từ Hessian cần kiểm tra thêm gì?', back: 'Dấu Hessian trên toàn miền lồi và tính khả thi của điểm dừng; dấu tại một điểm chỉ cho địa phương.' }],
      trap: { title: 'Quên miền lồi', wrong: 'Dấu Hessian tại điểm dừng bảo đảm tối ưu trên mọi miền.', right: 'Cần điều kiện trên miền và khảo sát biên khi có.', explanation: 'Đường nối các điểm trong lập luận lồi phải còn ở trong miền.' },
    }),
    section('monopoly-tax', 'Tối ưu kinh tế: doanh nghiệp phản ứng với thuế', 'extrema', {
      conditions: 'Doanh nghiệp độc quyền chọn q để tối đa lợi nhuận; thuế t≥0 trên mỗi đơn vị; thị trường dùng cầu p=2640−q, chi phí q²+1000q+100.',
      definition: R`Lợi nhuận sau thuế $\pi(q;t)=p(q)q-C(q)-tq$. Lượng bán tối ưu phụ thuộc t; doanh thu thuế của cơ quan thuế là $T(t)=tq^*(t)$, không phải lợi nhuận của doanh nghiệp.`,
      content: R`### Hai bài tối ưu nối nhau
Trước tiên giữ t cố định và tìm phản ứng doanh nghiệp: $\pi=(1640-t)q-2q^2-100$ trên q≥0. Vì π_qq=−4<0, $q^*(t)=\max\{0,(1640-t)/4\}$. Sau đó cơ quan thuế tối đa $T=t(1640-t)/4$ trên [0,1640]; thuế cao hơn làm sản lượng bằng 0 trong mô hình.

Không tối ưu T theo q trong khi quên doanh nghiệp tự điều chỉnh lượng bán. Các kết luận thuộc đúng mô hình cầu, chi phí và giả thiết hoạt động này.`,
      workedExample: { question: 'Với mô hình trên, tìm t cho tổng thu thuế lớn nhất.', steps: ['Với 0≤t≤1640, doanh nghiệp chọn q=(1640−t)/4.', 'T(t)=410t−t²/4, T′=410−t/2=0 cho t=820.', 'T″=−1/2<0, hai đầu mút cho 0; t=820 cho q=205 và T=168100.'], casioTip: 'Thuế trên một sản phẩm khác với tổng số tiền thu thuế.' },
      recalls: [{ front: 'Bài tối ưu thuế có hai hàm mục tiêu nào?', back: 'Doanh nghiệp tối đa π theo q với t cố định; nhà thuế tối đa t·q*(t) theo t.' }],
      trap: { title: 'Giữ sản lượng khi tăng thuế', wrong: 'Tăng t mãi sẽ luôn tăng tổng thu vì T=tq.', right: 'q thay đổi theo phản ứng doanh nghiệp; phải thay q*(t) vào T.', explanation: 'Sản lượng là hàm của mức thuế.' },
    }),
    section('two-market-profit', 'Tối ưu hai biến: phân phối trên hai thị trường', 'extrema', {
      conditions: 'Hai thị trường tách biệt, bán hết lượng phân phối; q1,q2≥0 và giá không âm.',
      definition: R`Với cầu ngược $p_1=a_1-b_1q_1$, $p_2=a_2-b_2q_2$, doanh thu là $R=p_1q_1+p_2q_2$; chi phí phụ thuộc tổng q1+q2. Tối ưu π=R−C theo hai lượng phân phối.`,
      content: R`### Đặt đúng tổng sản lượng
Nếu $C(q)=cq^2$, phải thay $q=q_1+q_2$ trước khi đạo hàm: $C=c(q_1+q_2)^2$, có hạng chéo. Nghiệm nội bộ thường thỏa MR1=MR2=MC; nếu nghiệm âm hoặc vượt miền cầu phải xét biên thay vì giữ nghiệm hệ điểm dừng.`,
      workedExample: { question: R`Cho p1=100−q1, p2=80−q2 và C=(q1+q2)². Tối đa lợi nhuận.`, steps: ['π=100q1+80q2−2q1²−2q2²−2q1q2.', 'Hệ điểm dừng: 4q1+2q2=100, 2q1+4q2=80, cho q1=20,q2=10.', 'Hessian [[−4,−2],[−2,−4]] âm xác định (định thức 12>0); miền khả thi lồi nên nghiệm là tối đa toàn cục. π=1400, tổng sản lượng 30.'], casioTip: 'Chi phí của tổng không bằng tổng hai chi phí riêng nếu C phi tuyến.' },
      recalls: [{ front: 'Vì sao C(q1+q2) có thể tạo đạo hàm chéo?', back: 'Hai thị trường dùng chung tổng sản lượng; ví dụ bình phương tổng tạo hạng 2q1q2.' }],
      trap: { title: 'Bỏ liên kết chi phí', wrong: 'Thay C=(q1+q2)² bằng q1²+q2².', right: 'Giữ hạng chéo và đạo hàm theo đúng tổng.', explanation: 'Thay thế đó làm đổi mô hình kinh tế.' },
    }),
  ],
  9: [
    section('constraint-substitution', 'Ràng buộc: đưa về một biến và chuẩn hóa c dương', 'lagrange', {
      conditions: 'Phép thay biến phải giữ toàn bộ miền khả thi; khi dùng Lagrange cần ràng buộc chính quy. Bộ bài thống nhất c>0.',
      definition: R`Quy ước của bộ bài là $c-g(x,y)=0$ với c>0. Từ h(x,y)=d bất kỳ, chọn c>0 rồi đặt g=h+c−d: khi đó c−g=d−h, nên tập khả thi không đổi.`,
      content: R`### Vì sao có thể giữ c dương?
Phép cộng một hằng vào hàm ràng buộc không đổi g_x,g_y. Nếu đổi dấu ràng buộc thì nhân tử Lagrange đổi dấu tương ứng; phải dùng đạo hàm của đúng L đã lập. c>0 ở đây là quy ước biểu diễn đã chọn.

### Đưa về một biến
Khi có thể giải ràng buộc thành y=y(x), thay vào f để được F(x)=f(x,y(x)); tìm miền của x rồi tối ưu trên miền ấy. Cần xét mọi nhánh nếu đường cong không thể viết thành một hàm duy nhất.`,
      workedExample: { question: R`Tìm cực trị f=x²−3xy+12x với 2x+3y=6.`, steps: ['y=2−2x/3, x tùy ý thực.', 'F(x)=x²−3x(2−2x/3)+12x=3x²+6x=3(x+1)²−3.', 'Cực tiểu toàn cục tại x=−1,y=8/3; giá trị −3. Không có cực đại trên đường thẳng không bị chặn.'], casioTip: 'Không mặc định x,y không âm khi đề bài chỉ cho ràng buộc đại số.' },
      recalls: [{ front: 'Đưa h=d thành c−g=0 với c>0 bằng cách nào?', back: 'Chọn c>0, đặt g=h+c−d. Khi đó c−g=d−h và tập nghiệm không đổi.' }],
      trap: { title: 'Đổi dạng nhưng giữ sai đạo hàm', wrong: 'Đảo dấu ràng buộc mà vẫn dùng nguyên hệ phương trình theo λ cũ.', right: 'Lấy đạo hàm lại từ hàm Lagrange đã chọn.', explanation: 'Nhất quán dấu quan trọng hơn tên của nhân tử.' },
    }),
    section('utility-budget', 'Ứng dụng Lagrange: hữu dụng và ngân sách', 'lagrange', {
      conditions: 'x,y≥0, giá dương, ngân sách B>0; kiểm tra nghiệm nội bộ và hai đầu mút của đường ngân sách.',
      definition: R`Tối đa U(x,y) với p_xx+p_yy=B: $L=U+\lambda(B-p_xx-p_yy)$. Tại nghiệm nội bộ, $U_x/p_x=U_y/p_y=\lambda$.`,
      content: 'Hai tỷ số là hữu dụng biên trên một đơn vị chi tiêu. Điều kiện này không thay phương trình ngân sách. Nếu đề cho ngân sách tối đa, cần chứng minh mục tiêu tăng theo chi tiêu hoặc xét cả điểm trong miền trước khi dùng đẳng thức.',
      workedExample: { question: 'Tối đa U=xy với 2x+y=100, x,y≥0.', steps: ['Hệ Lagrange: y−2λ=0, x−λ=0, 100−2x−y=0.', 'Suy ra x=25,y=50,λ=25.', 'Thay y=100−2x: U=1250−2(x−25)² trên [0,50]. Max toàn cục bằng 1250; hai đầu mút cho 0.'], casioTip: 'Thế ràng buộc để kiểm tra toàn cục độc lập với dấu Hessian biên.' },
      recalls: [{ front: 'Tối đa hữu dụng nội bộ cân bằng tỷ số nào?', back: R`$U_x/p_x=U_y/p_y$, cùng với phương trình ngân sách.` }],
      trap: { title: 'Cân bằng hữu dụng biên chưa chia giá', wrong: 'Tối ưu luôn đòi hỏi U_x=U_y.', right: 'Cần so sánh hữu dụng biên trên đơn vị giá, trừ khi hai giá bằng nhau.', explanation: 'Các đầu vào có chi phí cơ hội khác nhau.' },
    }),
    section('production-budget', 'Ứng dụng Lagrange: sản lượng và chi phí', 'lagrange', {
      conditions: 'K,L>0 tại nghiệm nội bộ, giá đầu vào dương; phân biệt tối đa Q với tối thiểu C.',
      definition: R`Tối đa Q với wL+rK=B dùng $L=Q+\lambda(B-wL-rK)$. Tối thiểu C=wL+rK với Q=Q0 dùng $L=C+\lambda(Q0-Q)$. Cả hai có quan hệ nội bộ Q_L/Q_K=w/r nhưng khác dữ kiện và mục tiêu.`,
      content: 'Bài tối đa sản lượng cần suy mức Q từ ngân sách. Bài tối thiểu chi phí cần suy ngân sách cần thiết từ Q0. Không dùng một nghiệm thỏa tỷ lệ biên mà bỏ ràng buộc. Tối ưu phân bổ hai phân xưởng cũng cùng cách lập: mục tiêu là tổng chi phí, ràng buộc là tổng lượng đơn hàng.',
      workedExample: { question: 'Với Q=2√(LK), w=3,r=6,B=180, tối đa Q.', steps: ['Q_L/Q_K=K/L=3/6, nên K=L/2.', '3L+6K=180 cho L=30,K=15.', 'Q=2√450=30√2. Trên ngân sách, LK=L(30−L/2)=450−(L−30)²/2 nên đây là tối đa toàn cục.'], casioTip: 'w nhân lao động L; r nhân vốn K. Đảo giá làm đổi tỷ lệ.' },
      recalls: [{ front: 'Hai bài sản lượng/chi phí khác nhau ở đâu?', back: 'Một bài cho ngân sách và tối đa Q; bài kia cho Q0 và tối thiểu C. Cùng tỷ lệ nội bộ nhưng phải dùng đúng ràng buộc.' }],
      trap: { title: 'Chỉ giải tỷ lệ biên', wrong: 'K=L/2 là toàn bộ nghiệm tối ưu.', right: 'Cần kết hợp ngân sách hoặc sản lượng cho trước để tìm mức cụ thể và kiểm tra tối ưu.', explanation: 'Một tỷ lệ chứa vô số cặp khả thi hoặc không khả thi.' },
    }),
  ],
  10: [
    section('rational-integration', 'Phân thức hữu tỷ và tích phân trong logistic', 'ode', {
      conditions: 'Không chia cho giá trị làm mẫu bằng 0; xét từng khoảng mà các mẫu và log có nghĩa.',
      definition: R`Với M>0 và N≠0,M: $$\frac1{N(M-N)}=\frac1M\left(\frac1N+\frac1{M-N}\right).$$Do đó $\int dN/[N(M-N)]=(\ln|N|-\ln|M-N|)/M+C$.`,
      content: R`### Đồng nhất hệ số
Đặt 1/[N(M−N)]=A/N+B/(M−N). Nhân mẫu: 1=A(M−N)+BN, suy ra A=B=1/M. Khi tích phân 1/(M−N), có dấu âm do đạo hàm của M−N là −1.

### Luyện hai kỹ thuật còn lại
Đổi biến cho $\int e^{3x}/(e^{3x}+1)dx=\frac13\ln(e^{3x}+1)+C$. Từng phần cho $\int\arctan x\,dx=x\arctan x-\frac12\ln(1+x^2)+C$. Giữ hằng số C một lần và kiểm tra bằng đạo hàm.`,
      workedExample: { question: R`Tính $\int dN/[N(100-N)]$ trên 0<N<100.`, steps: [R`Phân tích thành $(1/100)[1/N+1/(100-N)]$.`, R`Tích phân cho $(1/100)[\ln N-\ln(100-N)]+C$.`, R`Viết gọn thành $(1/100)\ln[N/(100-N)]+C$.`], casioTip: 'Nhánh N=0 và N=M phải xét ở phương trình gốc trước khi sử dụng tích phân này.' },
      recalls: [{ front: 'Phân tích 1/[N(M−N)] thế nào?', back: R`$[1/N+1/(M-N)]/M$; tích phân hạng thứ hai mang dấu âm.` }, { front: R`Nguyên hàm của $\arctan x$?`, back: R`$x\arctan x-\frac12\ln(1+x^2)+C$.` }],
      trap: { title: 'Quên dấu của mẫu M−N', wrong: R`$\int dN/(M-N)=\ln|M-N|+C$.`, right: R`Kết quả là $-\ln|M-N|+C$.`, explanation: 'Cần bù hệ số đạo hàm trong bằng −1.' },
    }),
    section('logistic', 'Mô hình logistic: sức chứa và đường tăng trưởng chữ S', 'ode', {
      conditions: 'r,M>0; xét quần thể không âm. Công thức tăng trưởng chữ S dưới đây dùng 0<N0<M; các nghiệm cân bằng xét riêng.',
      definition: R`$$N'=rN(1-N/M),\qquad N(0)=N_0.$$Trên 0<N0<M: $$N(t)=\frac{M}{1+b e^{-rt}},\qquad b=\frac{M}{N_0}-1>0.$$Trong ký hiệu PNTA N′=KN(M−N), ta có r=KM; ký hiệu LXT r=k0 và M=1/α.`,
      content: R`### Từ phương trình đến nghiệm
N=0 và N=M là hai nghiệm cân bằng. Trên nhánh khác, phân tích phân thức khi tách biến cho $\ln[N/(M-N)]=rt+C$. Dùng N(0) để tìm b, thay ngược kiểm tra phương trình và điều kiện đầu.

### Hiệu chỉnh tham số
Nếu biết M,N0 và N(t1), $r=\{\ln[(M/N_0-1)/(M/N(t_1)-1)]\}/t_1$. Không dùng tỷ số N(t1)/N0 như Malthus. Muốn đạt mức N*, giải $t=(1/r)\ln[b/(M/N^*-1)]$ và kiểm tra mức nằm trong khoảng quần thể đạt được.

### Tăng nhanh nhất và giới hạn
N′ lớn nhất tại N=M/2, bằng rM/4. Điểm uốn nằm tại t*=ln(b)/r. Nếu chỉ xét t≥0 và N0>M/2 thì t*<0: từ thời điểm ban đầu tốc độ đã giảm; tốc độ lớn nhất trên tương lai tại t=0. Với 0<N0<M, N tiến tới M nhưng không đạt M ở thời gian hữu hạn.

Phân biệt: Malthus N′=rN; tăng theo khoảng cách N′=k(M−N); logistic có thêm tích với N.`,
      workedExample: { question: 'Một câu lạc bộ có sức chứa 800, năm trước 50 thành viên, năm nay 200. Dự báo sau ba năm nữa theo logistic.', steps: ['Chọn năm trước t=0, nên N0=50 và b=800/50−1=15.', 'N(1)=200 cho 1+15e^(−r)=4, suy ra e^(−r)=1/5 và r=ln5.', 'Ba năm nữa ứng với t=4: N(4)=800/[1+15/625]=781,25. Đây là mức dự báo liên tục; nếu cần số người phải nêu quy tắc làm tròn.', 'Thời điểm tăng nhanh nhất t*=ln15/ln5≈1,683 năm sau mốc năm trước.'], casioTip: 'Đừng nhầm ba năm nữa với t=3 khi gốc thời gian là năm trước.' },
      recalls: [{ front: 'Phương trình và nghiệm logistic với 0<N0<M?', back: R`$N'=rN(1-N/M)$, $N=M/[1+(M/N_0-1)e^{-rt}]$.` }, { front: 'Logistic tăng nhanh nhất ở mức nào?', back: 'N=M/2, tốc độ rM/4. Phải kiểm tra thời điểm tương ứng có thuộc khoảng xét.' }, { front: 'Vì sao cần xét N=0 và N=M trước khi tách biến?', back: 'Chia N(M−N) làm mất hai nghiệm cân bằng của phương trình gốc.' }],
      trap: { title: 'Thay logistic bằng tăng theo khoảng cách', wrong: 'Có sức chứa M thì luôn dùng N′=k(M−N).', right: 'Logistic là N′=rN(1−N/M), phải suy từ giả thiết tốc độ.', explanation: 'Hai mô hình có độ cong, tham số và nghiệm khác nhau.' },
    }),
    section('ppp-intervention', 'PPP mở rộng: can thiệp U và sai lệch dài hạn', 'ode', {
      conditions: 'γ>0; π,U là hằng số có cùng đơn vị nghịch đảo thời gian; s,sᵉ là log của tỷ giá dương.',
      definition: R`Với $s^e=a+\pi t$, PNTA xét $s'=\gamma(s^e-s)+U$. Đặt E=s−sᵉ: $$E'+\gamma E=U-\pi.$$Nghiệm: $$E(t)=\frac{U-\pi}{\gamma}+\left[E(0)-\frac{U-\pi}{\gamma}\right]e^{-\gamma t}.$$`,
      content: R`### Mô hình gốc và mô hình có can thiệp
LXT trình bày mô hình gốc U=0: sai lệch tiến về −π/γ. PNTA thêm can thiệp U để điều chỉnh độ trễ khi đường cân bằng dịch chuyển. Hai mô hình phải ghi rõ giả thiết, không loại một mô hình chỉ vì mô hình kia không có U.

### Hội tụ về đường cân bằng đang chuyển động
Giới hạn E bằng (U−π)/γ. Muốn s−sᵉ→0 cần U=π; với π=0,2 trong PNTA, chọn U=0,2. Đây là hội tụ của hiệu, không có nghĩa s và sᵉ đều tiến tới một hằng số khi π khác 0.

Tỷ giá mức thực tế là S=e^s; tỷ số S/Sᵉ=e^E tiến về exp[(U−π)/γ]. Không đồng nhất chênh lệch log với chênh lệch số đơn vị tiền.`,
      workedExample: { question: 'Cho sᵉ=a+0,2t, γ=0,5 và s(0)=a+1. Tìm s(t) khi U=0,2 và kiểm tra sai lệch.', steps: ['U−π=0 nên E(t)=E(0)e^(−0,5t)=e^(−0,5t).', 's(t)=a+0,2t+e^(−0,5t).', 'Đạo hàm s′=0,2−0,5e^(−0,5t), bằng γ(sᵉ−s)+U. Sai lệch về 0, còn hai đường log cùng tăng theo xu hướng 0,2t.'], casioTip: 'Với U=0, cùng mô hình cho sai lệch dài hạn −0,4; đừng dùng kết luận U=π cho trường hợp U=0.' },
      recalls: [{ front: 'PPP có U cho sai lệch dài hạn nào?', back: R`$(U-\pi)/\gamma$; muốn sai lệch về 0 cần U=π.` }, { front: 'Hội tụ log s−sᵉ về 0 tương ứng gì ở tỷ giá mức?', back: 'S/Sᵉ→1; không khẳng định mỗi tỷ giá mức có giới hạn hữu hạn.' }],
      trap: { title: 'Quên đạo hàm đường cân bằng', wrong: 'E′=s′ nên E′+γE=U.', right: 'E′=s′−π, nên E′+γE=U−π.', explanation: 'Đường cân bằng sᵉ phụ thuộc thời gian.' },
    }),
    section('solow-initial-value', 'Solow: nghiệm theo điều kiện đầu và hai dạng lũy thừa', 'ode', {
      conditions: 'A,s,c>0, 0<α<1, c=n+δ và k0>0; phép đổi biến dùng nhánh vốn bình quân dương.',
      definition: R`Với $k'=sAk^\alpha-ck$, đặt $v=k^{1-\alpha}$. Khi đó $v'+(1-\alpha)cv=(1-\alpha)sA$ và $$k(t)=\left[\frac{sA}{c}+\left(k_0^{1-\alpha}-\frac{sA}{c}\right)e^{-(1-\alpha)ct}\right]^{1/(1-\alpha)}.$$`,
      content: R`### Giữ đúng hệ số hao hụt
Tăng lao động và khấu hao cùng làm giảm vốn trên mỗi lao động, nên c=n+δ. Chỉ bỏ δ nếu đề cho bằng 0. Khi α=1/2, đặt v=√k và bình phương để trả về k. Khi α=2/3, đặt v=k^(1/3) và lập phương lại. Nhánh k=0 phải thử ở phương trình gốc trước phép chia; công thức ở đây dành cho k0>0.

Với điều kiện trên, biểu thức trong ngoặc là tổ hợp giữa hai mức dương nên có nghĩa với t≥0; k tiến về (sA/c)^(1/(1−α)). Trạng thái dừng vốn bình quân không có nghĩa tổng vốn đứng yên.`,
      workedExample: { question: 'Cho k′=0,4k^(2/3)−0,2k và k(0)=1. Tìm k(t).', steps: ['Đặt v=k^(1/3); v′+(0,2/3)v=0,4/3.', 'v(t)=2+(1−2)e^(−t/15)=2−e^(−t/15).', 'k(t)=[2−e^(−t/15)]³. Tại 0 bằng 1; giới hạn bằng 8.', 'Hệ số 0,2 ở đây là tổng tăng lao động và khấu hao, không tự thay bằng từng thành phần.'], casioTip: 'Đổi biến xong cần trả về k bằng đúng lũy thừa nghịch đảo.' },
      recalls: [{ front: 'Đặt biến nào trong Solow với α=1/2 hoặc 2/3?', back: 'Lần lượt v=√k hoặc v=k^(1/3); cả hai biến phương trình thành tuyến tính cấp một.' }],
      trap: { title: 'Quên đổi ngược biến', wrong: 'Giải ra v(t) rồi dùng v làm đáp số vốn k.', right: 'Trả về k=v^(1/(1−α)).', explanation: 'v là biến phụ, không có cùng ý nghĩa kinh tế với k.' },
    }),
    section('linear-fund', 'Ứng dụng tuyến tính: quỹ tích lũy và nguồn bổ sung', 'ode', {
      conditions: 'Lãi suất liên tục r và tốc độ gửi a không đổi; cùng đơn vị thời gian. Mô hình chưa tính rút tiền hay phí.',
      definition: R`Quỹ F nhận tiền liên tục a và sinh lãi theo quy mô: F′=rF+a. Với r≠0: $$F(t)=(F_0+a/r)e^{rt}-a/r.$$Với r=0: F=F0+at.`,
      content: 'Phần rF là tăng trưởng theo vốn đang có; a là nguồn tiền bổ sung mỗi đơn vị thời gian. Không dùng F0e^(rt) khi có a khác 0. Đưa về F′−rF=a và nhân tử e^(−rt). Mô hình giá điều chỉnh P′=a−bP (b>0) cũng tuyến tính: P=a/b+(P0−a/b)e^(−bt), với a/b là giá cân bằng.',
      workedExample: { question: 'F0=100, r=0,05 mỗi năm, gửi liên tục 10 mỗi năm. Tính quỹ sau 2 năm.', steps: ['F(t)=(100+10/0,05)e^(0,05t)−10/0,05=300e^(0,05t)−200.', 'F(2)=300e^(0,1)−200≈131,551.', 'Kiểm tra F(0)=100 và F′=15e^(0,05t)=0,05F+10.'], casioTip: 'Tốc độ gửi liên tục khác một khoản nộp cuối kỳ; không dùng cùng công thức khi giả thiết thay đổi.' },
      recalls: [{ front: 'Quỹ có lãi liên tục và gửi đều thỏa phương trình nào?', back: 'F′=rF+a, trong đó a là tiền trên một đơn vị thời gian; không phải chỉ F′=rF.' }],
      trap: { title: 'Cộng tiền gửi mà bỏ lãi của tiền gửi', wrong: 'F(t)=F0e^(rt)+at luôn đúng.', right: 'Khoản gửi cũng sinh lãi; phải giải F′=rF+a.', explanation: 'Hai thành phần tương tác theo thời gian.' },
    }),
  ],
};

export const completionQuestions = {
  5: [
    q('limits-core', R`Giới hạn $(x^2-1)/(x-1)$ khi x→1?`, ['0','1','2','Không có vì f(1) chưa xác định'], 2, 'Với x≠1, thương bằng x+1, nên giới hạn bằng 2; không đòi f(1) tồn tại.'),
    q('special-limits', R`$\lim_{x\to0}(e^{2x}-1)/\sin3x$?`, [R`$2/3$`,R`$3/2$`,'1','0'], 0, 'Tách hai tỷ số chuẩn với 2x và 3x, giữ hệ số ngoài bằng 2/3.'),
    q('continuity-piecewise', 'Nhánh trái ax+b, nhánh phải x² tại điểm nối 1. Khả vi cần?', ['a+b=1 là đủ','a=2 là đủ','a=2,b=−1','a=1,b=0'], 2, 'Liên tục cần a+b=1, đạo hàm hai phía bằng nhau cần a=2, do đó b=−1.'),
    q('lhopital', R`$\lim_{x\to0^+}x^x$?`, ['0','1','e','∞'], 1, 'Log của biểu thức là x ln x→0; lấy mũ cho 1, với x>0 để log có nghĩa.'),
    q('higher-derivatives', 'f=x³ sin x. f^(20)(0)?', ['120','6840','0','1140'], 1, 'Leibniz chỉ còn đạo hàm cấp 3 của x³ tại 0, nên C(20,3)·6·1=6840.'),
    q('taylor-maclaurin', 'Hệ số bậc k của Taylor quanh x0?', ['f^(k)(x0)','f^(k)(x0)/k!','f(x0)/k','k! f^(k)(x0)'], 1, 'Đạo hàm cấp k của (x−x0)^k tại tâm bằng k!, nên phải chia hệ số cho k!.'),
    q('second-differential', 'Công thức đúng cho vi phân cấp hai một biến?', [R`$d^2y=(dy)^2$`,R`$d^2y=f''(x)(dx)^2$`,R`$d^2y=f'(x)(dx)^2$`,R`$d^2y=f''(x)dx$`], 1, 'Lấy vi phân tiếp với dx độc lập cho f″(x)(dx)², khác bình phương vi phân cấp một.'),
  ],
  6: [
    q('economic-marginals', 'p=100−q. Doanh thu biên là?', ['100−q','100−2q','100','−1'], 1, 'R=qp=100q−q² nên MR=100−2q, khác giá khi giá phụ thuộc sản lượng.'),
    q('economic-average', 'Khi q>0 và MC<AC, AC thay đổi thế nào?', ['Tăng','Giảm','Không đổi','Không xác định được'], 1, 'AC′=(MC−AC)/q<0 nên bình quân giảm; cần phân biệt AC với tốc độ thay đổi trung bình.'),
    q('demand-revenue', 'Cầu dốc xuống có E=2. Giá tăng nhỏ làm doanh thu?', ['Tăng','Giảm','Không đổi','Chắc chắn gấp đôi'], 1, 'R′(p)=q(1−E)=−q<0 tại điểm xét; kết luận là phản ứng cục bộ với bước tăng nhỏ.'),
    q('consumption-saving', 'MPC=0,8 trong I=C+S. MPS bằng?', ['0,8','1,8','0,2','−0,8'], 2, 'Lấy đạo hàm I=C+S theo I: 1=MPC+MPS, nên MPS=0,2.'),
    q('marginal-product-revenue', 'MR=3000,MPL=10,1. MRP bằng?', ['3010,1','30300','300','10,1'], 1, 'Quy tắc dây chuyền cho MRP=MR·MPL=30300, đơn vị tiền trên đơn vị lao động.'),
  ],
  7: [
    q('multivariable-domain', 'Miền của ln(4−x²−y²)?', ['x²+y²≤4','x²+y²<4','x²+y²>4','Toàn R²'], 1, 'Đối số log phải dương nghiêm ngặt; đường tròn biên không thuộc miền xác định.'),
    q('second-partials', 'f=x²e^(5y). f_xy(1,0) bằng?', ['2','5','10','25'], 2, 'f_x=2xe^(5y), đạo hàm theo y là 10xe^(5y), tại (1,0) bằng 10.'),
    q('second-total-differential', 'Hệ số của dxdy trong d²f tại (1,0), f=x²e^(5y)?', ['5','10','20','25'], 2, 'Hệ số chéo là 2f_xy=2·10=20; hệ số 1/2 chỉ xuất hiện ở công thức Taylor.'),
    q('cross-demand', 'q_A tăng khi giá B tăng, giữ các biến khác. Quan hệ theo chiều xét?', ['Bổ sung','Thay thế','Luôn độc lập','Không thể đọc dấu'], 1, 'Đạo hàm chéo theo giá dương biểu thị chuyển cầu sang A khi B đắt hơn, tức thay thế theo chiều xét.'),
    q('input-compensation', 'Giữ Q ở bậc nhất, Q_K≠0. dK/dL bằng?', [R`$Q_L/Q_K$`,R`$-Q_L/Q_K$`,R`$-Q_K/Q_L$`,'0'], 1, 'Từ dQ=Q_LdL+Q_KdK=0 suy ra tỷ lệ bù vốn trên lao động bằng −Q_L/Q_K.'),
  ],
  8: [
    q('higher-order-extrema', 'Cấp đầu có đạo hàm khác 0 tại điểm dừng là 4 và giá trị dương. Kết luận?', ['Cực đại','Cực tiểu','Không cực trị','Chưa thể dùng vì cấp hai bằng 0'], 1, 'Với giả thiết đủ trơn, cấp chẵn có đạo hàm đầu tiên khác 0 dương cho cực tiểu địa phương.'),
    q('convex-global', 'Hessian dương xác định trên toàn miền lồi và có điểm dừng nội bộ. Kết luận?', ['Chỉ địa phương','Cực tiểu toàn cục duy nhất','Cực đại toàn cục','Không có cực trị'], 1, 'Hessian dương xác định trên miền lồi cho lồi chặt; điểm dừng khả thi là cực tiểu toàn cục duy nhất.'),
    q('monopoly-tax', 'q*(t)=(1640−t)/4 trên [0,1640]. Thuế tối đa hóa tq*(t)?', ['410','820','1640','0'], 1, 'T′=410−t/2=0 cho 820; T″=−1/2 và các đầu mút cho 0, xác nhận tối đa.'),
    q('two-market-profit', 'C=(q1+q2)² có đạo hàm riêng theo q1?', ['2q1','2(q1+q2)','2q2','q1+q2'], 1, 'Quy tắc hàm hợp nhân đạo hàm trong bằng 1; không bỏ đóng góp q2 của tổng sản lượng.'),
  ],
  9: [
    q('constraint-substitution', 'Đưa h=d thành c−g=0 với c>0, chọn g nào?', ['g=h+d−c','g=h+c−d','g=h−c−d','g=c−h'], 1, 'Thế g=h+c−d cho c−g=d−h; tập nghiệm giữ nguyên và các đạo hàm theo x,y không đổi.'),
    q('utility-budget', 'Max xy với 2x+y=100, x,y≥0. Nghiệm?', ['(50,0)','(0,100)','(25,50)','(50,50)'], 2, 'Thay y=100−2x cho U=1250−2(x−25)²; tối đa tại x=25,y=50.'),
    q('production-budget', 'Q=2√(LK), w=3,r=6, ngân sách180. Nghiệm tối đa?', ['L=15,K=30','L=30,K=15','L=20,K=20','L=60,K=0'], 1, 'Tỷ lệ Q_L/Q_K=K/L=w/r=1/2 và 3L+6K=180 cho L=30,K=15.'),
  ],
  10: [
    q('rational-integration', R`$\int dN/(M-N)$ bằng?`, [R`$\ln|M-N|+C$`,R`$-\ln|M-N|+C$`,R`$1/(M-N)+C$`,R`$-1/(M-N)+C$`], 1, 'Đạo hàm M−N theo N bằng −1, nên nguyên hàm có dấu âm trước log trị tuyệt đối.'),
    q('logistic', 'Logistic N′=rN(1−N/M) tăng nhanh nhất ở mức nào?', ['N=0','N=M','N=M/2','N=rM'], 2, 'Tốc độ là parabol theo N; đỉnh tại M/2, giá trị rM/4. Thời điểm phải thuộc khoảng đề xét.'),
    q('logistic', 'Sức chứa800, N0=50, N(1)=200. Năm sau nữa t=2 có bao nhiêu theo mô hình?', ['400','500','600','800'], 1, 'b=15 và e^(−r)=1/5; N(2)=800/(1+15/25)=500, khác tăng trưởng mũ.'),
    q('ppp-intervention', 'sᵉ=a+0,2t, s′=γ(sᵉ−s)+U. Muốn s−sᵉ→0 cần?', ['U=0','U=γ','U=0,2','U=−0,2'], 2, 'Sai lệch dài hạn bằng (U−π)/γ; với γ>0 và π=0,2, phải chọn U=0,2.'),
    q('solow-initial-value', 'Solow có α=2/3. Đặt biến nào để tuyến tính hóa trên k>0?', ['v=k²','v=√k','v=k^(1/3)','v=k^(2/3)'], 2, 'Đặt v=k^(1−α)=k^(1/3), sau đó nhớ trả về k=v³ và dùng điều kiện đầu.'),
    q('linear-fund', 'Quỹ nhận a mỗi năm liên tục và lãi liên tục r. Phương trình đúng?', ['F′=rF','F′=aF','F′=rF+a','F′=r+a'], 2, 'rF phụ thuộc vốn đang có, còn a là nguồn bổ sung theo thời gian; cả hai cùng góp vào tốc độ F′.'),
  ],
};

export function completeCurriculum(topic) {
  const chapter = Number(topic.id.split('-').at(-1));
  let sections = topic.lesson.sections.map(s => ({ ...s }));
  if (chapter === 6) {
    sections = sections.map(s => s.id === 'section-2' ? {
      ...s, scene: undefined,
      recall: { front: 'Tốc độ thay đổi trung bình trên [x1,x2] là gì?', back: R`$[f(x_2)-f(x_1)]/(x_2-x_1)$; khác giá trị bình quân f(x)/x và khác đạo hàm tại một điểm.` },
      trap: { title: 'Nhầm tốc độ trung bình với bình quân', wrong: 'Tốc độ thay đổi trung bình luôn là f(x)/x.', right: 'Tốc độ thay đổi trung bình dùng hiệu hai giá trị và hiệu hai đầu vào.', explanation: 'Giá trị bình quân được trình bày riêng trong tab ứng dụng.' },
    } : s.id === 'implicit-elasticity' ? { ...s,
      recall: { front: 'Tính co giãn của y theo x với xy=12 tại (3,4).', back: R`$y'=-4/3$, $\varepsilon=y' x/y=-1$. Điểm phải thuộc đường cong và mẫu đạo hàm ẩn phải khác 0.` },
      trap: { title: 'Dùng đạo hàm thay cho co giãn', wrong: 'y′=−4/3 nên x tăng1% thì y giảm4/3%.', right: 'Nhân thêm x/y=3/4; co giãn bằng −1.', explanation: 'Đạo hàm có đơn vị, co giãn không có đơn vị.' },
    } : s);
  }
  if (chapter === 9) sections = sections.map(s => s.id === 'section-1' ? { ...s,
    conditions: 'Bộ bài dùng quy ước c>0 và c−g(x,y)=0. Có thể đưa h=d về dạng này bằng cách đặt g=h+c−d. Ràng buộc trơn, tại ứng viên chính quy cần gradient g khác 0.',
  } : s.id === 'budget-constraint' ? { ...s,
    workedExample: {
      question: R`Cho $\pi=120x+240y-x^2-2xy-3y^2$, x,y≥0. So sánh tối đa với ngân sách x+2y=120 và x+2y≤120.`,
      steps: [R`Trên đường ngân sách, x=120−2y và $\pi=4800-3(y-40)^2$ với 0≤y≤60, nên max4800 tại (40,40).`, R`Trên miền bất đẳng thức, $\pi=5400-(x+y-60)^2-2(y-30)^2\le5400$, dấu bằng tại (30,30).`, 'Điểm (30,30) chi90 nên hợp lệ với ngân sách tối đa120 nhưng không nằm trên đường dùng hết120.'],
      casioTip: 'Hai dạng bình phương chứng minh trên toàn miền, không chỉ so sánh hai điểm.',
    },
    recall: { front: R`Khi nào có thể thay g(x,y)≤c bằng g(x,y)=c?`, back: 'Khi đã chứng minh nghiệm cần xét nằm trên biên hoặc mục tiêu buộc dùng hết ngân sách; nếu không phải xét cả nội miền.' },
    trap: { ...s.trap, wrong: 'Với g(x,y)≤c, luôn lập hệ như g(x,y)=c.' },
  } : s);
  if (chapter === 5) sections = sections.map(s => ({ ...s, trap: { ...s.trap,
    right: s.trap.right.replaceAll('(xy)prime', "(xy)'").replaceAll('(4x+5)prime', "(4x+5)'"),
  } }));
  if (chapter === 10) sections = sections.map(s => s.id === 'exchange-adjustment' ? { ...s, workedExample: { ...s.workedExample, casioTip: 'Đây là mô hình gốc U=0 của LXT. Phần PPP mở rộng trình bày riêng mô hình can thiệp U của PNTA trang22–24.' } } : s);
  const extra = additions[chapter] || [];
  sections.push(...extra);
  // Put prerequisite limit material before the derivative definition.
  if (chapter === 5) {
    const first = ['limits-core','special-limits','continuity-piecewise'];
    sections = [...first.map(id => sections.find(s => s.id === id)), ...sections.filter(s => !first.includes(s.id))];
  }
  sections = sections.map(s => ({ ...s, references: s.references || topic.references, workedExample: { ...s.workedExample, casioTip: s.workedExample.casioTip || s.trap.right } }));
  const allRefs = [...new Set([...topic.references, ...sections.flatMap(s => s.references)])];
  const questions = [...topic.quiz, ...(completionQuestions[chapter] || []).map((item, i) => ({ ...item, id: `${topic.id}-completion-${i+1}` }))];
  return { ...topic, contentVersion: '2026-11-14.1', references: allRefs,
    lesson: { ...topic.lesson, sections, objectives: [...topic.lesson.objectives, ...(chapter === 6 ? ['Vận dụng riêng các công thức biên, co giãn vào chi phí, doanh thu, tiết kiệm và sản xuất.'] : [])] },
    quiz: questions,
  };
}
