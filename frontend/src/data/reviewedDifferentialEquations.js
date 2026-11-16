const R = String.raw;
const ex = (question, steps, casioTip) => ({ question, steps, casioTip });
const recall = (front, back) => ({ front, back });
const trap = (title, wrong, right, explanation) => ({ title, wrong, right, explanation });

const lecture = 'Ghi chép Buổi 9–10 · tích phân và phương trình vi phân cấp một';
const lxtOde = 'Slide LXT · slides-lec9_Vie.pdf · trang 1–18';
const lxtPpp = 'Slide LXT · slides-lec9_Vie.pdf · trang 19–26';
const tud = 'TUD_v2.pdf · Bài 3, trang 32–34';
const main = 'main.pdf · trang 194, 220–221';

export const reviewedDifferentialEquations = {
  summary: 'Chương đi từ công thức nguyên hàm và hai kỹ thuật đổi biến, từng phần đến phương trình vi phân cấp một. Người học phân loại phương trình, giữ nghiệm hằng khi tách biến, dựng nhân tử tích phân, áp dụng điều kiện đầu, rồi đọc đúng các mô hình tăng trưởng, Solow và PPP.',
  objectives: [
    'Chọn đúng công thức nguyên hàm, đổi biến hoặc tích phân từng phần; kiểm tra kết quả bằng đạo hàm.',
    'Phân biệt nghiệm tổng quát với nghiệm thỏa điều kiện đầu và nêu khoảng mà nghiệm có nghĩa.',
    'Giải phương trình tách biến mà không bỏ nghiệm hằng, và giải phương trình tuyến tính bằng nhân tử tích phân.',
    'Lập phương trình từ giả thiết mô hình, hiệu chỉnh tham số theo dữ kiện, giữ đúng đơn vị thời gian và diễn giải nghiệm.'
  ],
  references: [
    lecture,
    'Slide LXT · cong_thuc_bien_doi_tich_phan_tung_phan.pdf · trang 1–2',
    tud,
    main,
    '[OpenStax, Calculus Volume 2 · Separable Equations](https://openstax.org/books/calculus-volume-2/pages/4-3-separable-equations)',
    '[OpenStax, Calculus Volume 2 · First-Order Linear Equations](https://openstax.org/books/calculus-volume-2/pages/4-5-first-order-linear-equations)',
    '[MIT OpenCourseWare · Introduction and the Solow Model](https://ocw.mit.edu/courses/14-05-intermediate-macroeconomics-spring-2013/c132cddf2e9d05c5d42dfadece492d72_MIT14_05S13_LecNot_Int_Sol.pdf)'
  ],
  sections: [{
    id: 'section-1', title: 'Nguyên hàm và hai kỹ thuật tính tích phân', scene: 'integral',
    conditions: 'Các công thức được xét trên khoảng mà biểu thức có nghĩa. Với tích phân xác định, hàm phải khả tích trên đoạn lấy tích phân.',
    definition: R`Hàm $F$ là một nguyên hàm của $f$ trên khoảng $I$ nếu $F'(x)=f(x)$ với mọi $x\in I$. Trên một khoảng liên thông, mọi nguyên hàm của cùng một hàm chỉ khác nhau một hằng số:
$$\int f(x)\,dx=F(x)+C.$$
Nếu $f$ liên tục trên $[a,b]$, định lý cơ bản của giải tích cho
$$\int_a^b f(x)\,dx=F(b)-F(a).$$
Tích phân bất định là một họ hàm; tích phân xác định là một số.`,
    content: R`### Bảng công thức cần nhận ra

| Hàm dưới dấu tích phân | Nguyên hàm | Điều kiện |
|---|---|---|
| $x^n$ | $\displaystyle \frac{x^{n+1}}{n+1}+C$ | $n\ne-1$ |
| $\displaystyle \frac{1}{x}$ | $\ln|x|+C$ | $x\ne0$ trên khoảng xét |
| $e^{ax}$ | $\displaystyle \frac{e^{ax}}{a}+C$ | $a\ne0$ |
| $b^x$ | $\displaystyle \frac{b^x}{\ln b}+C$ | $b>0,\ b\ne1$ |
| $\sin(ax)$ | $\displaystyle -\frac{\cos(ax)}{a}+C$ | $a\ne0$ |
| $\cos(ax)$ | $\displaystyle \frac{\sin(ax)}{a}+C$ | $a\ne0$ |

Các hệ số trong mẫu xuất hiện để bù cho đạo hàm của hàm bên trong. Chẳng hạn, đạo hàm của $e^{ax}$ là $ae^{ax}$; vì vậy nguyên hàm phải có hệ số $\frac{1}{a}$.

### Đổi biến: nhận diện hàm trong và vi phân của nó

Khi biểu thức chứa $g(x)$ cùng với $g'(x)\,dx$, đặt $u=g(x)$ và $du=g'(x)\,dx$. Ví dụ:
$$\int 2x e^{x^2+1}\,dx=\int e^u\,du=e^{x^2+1}+C,\qquad u=x^2+1.$$
Phải đổi ngược về biến $x$ trước khi kết luận tích phân bất định. Với tích phân xác định, có thể đổi cả hai cận sang $u$ hoặc trở lại biến ban đầu trước khi thế cận; không dùng cận của hai biến lẫn nhau.

### Tích phân từng phần bắt nguồn từ quy tắc đạo hàm tích

Từ $(uv)'=u'v+uv'$ suy ra
$$\int u\,dv=uv-\int v\,du.$$
Chọn $u$ để đạo hàm đơn giản hơn, còn $dv$ sao cho tìm được $v$ dễ dàng. Thứ tự ưu tiên logarit, đa thức, lượng giác, hàm mũ là một mẹo chọn lựa; công thức không phụ thuộc vào mẹo ấy.

Với tích phân xuất hiện trong phương trình vi phân ở phần sau:
$$\int 2x e^{2x}\,dx=x e^{2x}-\frac12 e^{2x}+C.$$
Đặt $u=2x$, $dv=e^{2x}\,dx$ thì $du=2\,dx$ và $v=\frac12e^{2x}$. Giữ hệ số $\frac12$ đến cuối để không sai hạng còn lại. Một ví dụ khác trong tài liệu là
$$\int \ln x\,dx=x\ln x-x+C,\qquad x>0.$$`,
    references: [lecture, 'Slide LXT · cong_thuc_bien_doi_tich_phan_tung_phan.pdf · trang 1–2', main],
    workedExample: ex('Tính $\\int 2x e^{2x}\\,dx$ bằng tích phân từng phần rồi kiểm tra kết quả.', [
      R`Đặt $u=2x$, $dv=e^{2x}\,dx$. Khi đó $du=2\,dx$ và $v=\frac12e^{2x}$.`,
      R`Áp dụng công thức: $\int 2x e^{2x}\,dx=x e^{2x}-\int e^{2x}\,dx$.`,
      R`Suy ra $\int 2x e^{2x}\,dx=x e^{2x}-\frac12e^{2x}+C$.`,
      R`Lấy đạo hàm vế phải được $2xe^{2x}$; kết quả được xác nhận.`
    ], 'Lấy đạo hàm kết quả; hằng số $C$ biến mất và phải trả lại đúng hàm dưới dấu tích phân.'),
    recall: recall('Khi nào dùng đổi biến, khi nào dùng từng phần?', R`Đổi biến khi nhận ra $g(x)$ và $g'(x)\,dx$. Dùng từng phần khi tích là hai loại hàm và có thể chọn $u$ sao cho $du$ đơn giản hơn.`),
    trap: trap('Quên hệ số của hàm trong', R`$\int e^{3x}\,dx=e^{3x}+C$.`, R`$\int e^{3x}\,dx=\frac13e^{3x}+C$.`, 'Lấy đạo hàm kết quả là cách kiểm tra nhanh hệ số.'),
  }, {
    id: 'ode-model', title: 'Phương trình vi phân và điều kiện đầu', scene: 'ode-definition',
    conditions: 'Nghiệm được xét trên một khoảng mà hàm và mọi hệ số trong phương trình đều xác định.',
    definition: R`Phương trình vi phân chứa một hàm chưa biết cùng với ít nhất một đạo hàm của hàm đó. Cấp của phương trình là cấp cao nhất của đạo hàm xuất hiện. Chương này xét phương trình vi phân thường cấp một. Dạng ẩn thường viết là $F(x,y,y')=0$; khi giải được theo đạo hàm, ta có dạng tường minh $y'=f(x,y)$.
Một nghiệm là hàm khả vi $y=y(x)$ thỏa phương trình trên một khoảng. Điều kiện $y(x_0)=y_0$ chọn nghiệm đi qua trạng thái ban đầu $(x_0,y_0)$; phương trình kèm điều kiện ấy được gọi là bài toán giá trị đầu.`,
    content: R`### Từ phương trình đại số đến một hàm cần tìm

Trong phương trình đại số, ẩn là một số. Ở đây ẩn là cả hàm số; đạo hàm mô tả tốc độ biến thiên của hàm theo biến độc lập. Vì vậy, nghiệm phải được kiểm tra bằng cách lấy đạo hàm rồi thay vào phương trình, không chỉ bằng cách thế một cặp số.

### Nghiệm tổng quát và nghiệm riêng

Một nghiệm tổng quát thường chứa hằng số tùy ý $C$. Điều kiện đầu xác định giá trị của hằng số để thu được nghiệm riêng. Chẳng hạn, với $y'=2x$, họ nghiệm là
$$y=x^2+C.$$
Nếu $y(0)=1$ thì $C=1$, nên nghiệm của bài toán giá trị đầu là $y=x^2+1$ trên toàn $\mathbb{R}$.

### Miền nghiệm là một phần của kết luận

Nếu phép giải tạo mẫu số $x$ thì công thức không xác định tại $x=0$. Không thể nối hai nhánh qua điểm ấy chỉ vì biểu thức giống nhau ở hai phía. Sau khi giải, cần ghi một khoảng chứa điểm đầu mà phương trình gốc có nghĩa và kiểm tra cả phương trình lẫn điều kiện đầu. Một biểu thức thỏa công thức biến đổi sau khi chia chưa chắc đã bao gồm nghiệm bị loại ở bước chia.`,
    references: [lecture, lxtOde, tud],
    workedExample: ex('Giải bài toán giá trị đầu $y\\prime=2x$, $y(0)=1$ và kiểm tra nghiệm.', [
      R`Lấy nguyên hàm hai vế: $y=x^2+C$.`,
      R`Thay $x=0$, $y=1$: $C=1$.`,
      R`Nghiệm riêng là $y=x^2+1$.`,
      R`Kiểm tra: $y'=2x$ và $y(0)=1$, nên hàm thỏa cả phương trình lẫn điều kiện đầu.`
    ], 'Điều kiện đầu xác định hằng số sau khi đã tìm họ nghiệm; đừng bỏ qua điều kiện ban đầu trong kết luận.'),
    recall: recall('Điều kiện đầu làm gì trong phương trình vi phân cấp một?', 'Nó chọn một nghiệm riêng từ họ nghiệm tổng quát bằng cách xác định hằng số tích phân.'),
    trap: trap('Chỉ kiểm tra công thức đại số', 'Có biểu thức của y là kết luận đủ.', 'Phải kiểm tra đạo hàm, phương trình gốc, điều kiện đầu và khoảng xác định.', 'Một phép biến đổi có thể chia cho biểu thức bằng không hoặc đi qua điểm phương trình không xác định.'),
  }, {
    id: 'section-2', title: 'Phương trình tách biến và nghiệm hằng', scene: 'separable',
    conditions: 'Trước khi chia cho $h(y)$, giải $h(c)=0$ và thử từng hàm hằng $y(x)=c$ trong phương trình ban đầu.',
    definition: R`Phương trình tách biến có thể viết dưới dạng
$$y'=g(x)h(y).$$
Mỗi hằng số $c$ thỏa $h(c)=0$ tạo một nghiệm hằng $y(x)=c$, nếu phương trình ban đầu xác định tại đó. Với nhánh $h(y)\ne0$, tách biến:
$$\frac{dy}{h(y)}=g(x)\,dx,\qquad
\int\frac{dy}{h(y)}=\int g(x)\,dx+C.$$
Kết quả có thể là nghiệm hiện hoặc một quan hệ ẩn $H(y)=G(x)+C$.`,
    content: R`### Bốn bước giải và một bước kiểm tra

1. Viết phương trình thành tích của một hàm theo $x$ và một hàm theo $y$.
2. Tìm các giá trị $c$ làm $h(c)=0$; thử $y=c$ trong phương trình gốc và ghi lại nghiệm hằng.
3. Chỉ trên nhánh $h(y)\ne0$, chuyển các biểu thức chứa $y$ về một vế, các biểu thức chứa $x$ về vế còn lại.
4. Lấy nguyên hàm hai vế, gom các hằng số tích phân thành một hằng số $C$, rồi giải ra $y$ nếu có thể.
5. Thế nghiệm vào phương trình ban đầu và kiểm tra điều kiện đầu cùng miền xác định.

Kiểm tra nghiệm hằng đứng trước phép chia vì chia cho $h(y)$ loại đúng những giá trị làm $h(y)=0$. Nếu $h(y)$ triệt tiêu ở một số mức, các mức đó là những đường cân bằng cần xét riêng.`,
    references: [lecture, lxtOde, tud, '[OpenStax · Separable Equations](https://openstax.org/books/calculus-volume-2/pages/4-3-separable-equations)'],
    workedExample: ex('Giải phương trình $y\\prime=2xy$ và kiểm tra nghiệm hằng.', [
      R`Trước khi chia, $h(y)=y=0$ cho nghiệm hằng $y=0$; thay vào phương trình gốc, hai vế đều bằng $0$.`,
      R`Với nhánh $y\ne0$: $\frac{dy}{y}=2x\,dx$.`,
      R`Lấy nguyên hàm: $\ln|y|=x^2+C_1$, nên $y=C e^{x^2}$ với $C\ne0$ trên nhánh này.`,
      R`Gộp nghiệm hằng $y=0$ bằng $C=0$. Họ nghiệm tổng quát là $y=C e^{x^2}$, $C\in\mathbb{R}$.`,
      R`Kiểm tra: $y'=2xCe^{x^2}=2xy$, kể cả khi $C=0$.`
    ], 'Nghiệm $C=0$ được giữ lại vì đã thử riêng trước khi chia cho y.'),
    recall: recall('Vì sao phải thử $h(y)=0$ trước khi tách biến?', 'Chia cho $h(y)$ chỉ hợp lệ khi $h(y)\\ne0$ và có thể loại nghiệm hằng. Những nghiệm ấy phải được thử trực tiếp trong phương trình gốc.'),
    trap: trap('Chia cho ẩn mà không xét nghiệm hằng', R`Từ $y'=2xy$ chia cho $y$ rồi kết luận $y=Ce^{x^2}$ với $C\ne0$ là toàn bộ nghiệm.`, R`Thử $y=0$ trước khi chia; sau đó nhánh khác cho $y=Ce^{x^2}$ với $C\ne0$.`, 'Phép chia làm mất nhánh nghiệm hằng, dù họ nghiệm sau cùng có thể được mở rộng để chứa nó.'),
  }, {
    id: 'section-3', title: 'Phương trình tuyến tính cấp một và nhân tử tích phân', scene: 'integrating-factor',
    conditions: 'Đưa phương trình về $y\\prime+p(x)y=q(x)$ trên một khoảng mà $p$ và $q$ liên tục. Nếu phải chia cho hệ số của $y\\prime$, loại các điểm làm hệ số đó bằng $0$.',
    definition: R`Dạng tuyến tính cấp một chuẩn là
$$y'+p(x)y=q(x).$$
Chọn
$$\mu(x)=e^{\int p(x)\,dx}.$$
Vì $\mu'=p\mu$, nhân hai vế với $\mu$ cho
$$(\mu y)'=\mu q.$$
Do đó nghiệm tổng quát là
$$y(x)=\frac{1}{\mu(x)}\left(\int\mu(x)q(x)\,dx+C\right).$$
Trong phương trình thuần nhất $q=0$, công thức trở thành $y=C/\mu$.`,
    content: R`### Nhân tử được suy ra từ quy tắc đạo hàm tích

Ta muốn biến $y'+py$ thành đạo hàm của một tích:
$$(\mu y)'=\mu y'+\mu'y.$$
Để hệ số của $y$ khớp, cần $\mu'=p\mu$. Chia cho $\mu>0$ rồi tích phân cho $\ln\mu=\int p(x)\,dx$; chọn một nguyên hàm bất kỳ và đặt hằng số cộng bằng $0$ vì nhân $\mu$ với một hằng số khác không chỉ làm đổi cách viết hằng số nghiệm.

### Quy trình không đảo dấu

1. Chuẩn hóa hệ số $y'$ thành $1$ và ghi rõ $p(x),q(x)$.
2. Tính $\mu=e^{\int p(x)\,dx}$.
3. Nhân toàn bộ hai vế với $\mu$, rồi xác nhận vế trái đúng là $(\mu y)'$.
4. Tích phân: $\mu y=\int\mu q\,dx+C$.
5. Chia cho $\mu$, dùng điều kiện đầu nếu có và kiểm tra lại phương trình ban đầu.

Số mũ của nhân tử là $+\int p$; dấu âm chỉ xuất hiện khi chia công thức cuối cho $\mu$.`,
    references: [lecture, lxtOde, tud, '[OpenStax · First-Order Linear Equations](https://openstax.org/books/calculus-volume-2/pages/4-5-first-order-linear-equations)'],
    workedExample: ex('Giải $y\\prime+2xy=xe^{-x^2}$, $y(0)=1$.', [
      R`Phương trình đã chuẩn hóa với $p(x)=2x$, $q(x)=xe^{-x^2}$.`,
      R`$\mu(x)=e^{\int2x\,dx}=e^{x^2}$. Nhân phương trình cho $e^{x^2}$: $(e^{x^2}y)'=x$.`,
      R`Tích phân hai vế: $e^{x^2}y=\frac{x^2}{2}+C$, nên $y=e^{-x^2}\left(\frac{x^2}{2}+C\right)$.`,
      R`Điều kiện $y(0)=1$ cho $C=1$.`,
      R`Thế $y=e^{-x^2}(\frac{x^2}{2}+1)$ vào phương trình gốc cho $y'+2xy=xe^{-x^2}$; điều kiện đầu cũng được thỏa.`
    ], 'Nhân lại với $\\mu$ phải tạo đúng đạo hàm tích; kiểm tra dấu của $p(x)$ trước khi lấy mũ.'),
    recall: recall('Vì sao nhân tử là $e^{+\\int p(x)\\,dx}$?', R`Ta cần $\mu'=p\mu$ để $(\mu y)'=\mu(y'+py)$. Vì thế $\frac{\mu'}{\mu}=p$ và $\mu=e^{\int p\,dx}$.`),
    trap: trap('Đảo dấu trong số mũ của nhân tử', R`Với $y'+2xy=q(x)$, lấy $\mu=e^{-x^2}$.`, R`Với $p(x)=2x$, $\mu=e^{x^2}$.`, 'Dấu của tích phân được quyết định bởi hệ số p trong dạng chuẩn; dấu âm xuất hiện sau khi chia cho nhân tử.'),
  }, {
    id: 'ode-parts', title: 'Khi phương trình tuyến tính dẫn đến tích phân từng phần', scene: 'integration-parts',
    conditions: 'Chỉ dùng tích phân từng phần sau khi nhân tử đã biến vế trái thành đạo hàm của tích. Hằng số tích phân được giữ ở một nơi trong nghiệm tổng quát.',
    definition: R`Khi $\int\mu(x)q(x)\,dx$ là tích của một đa thức với hàm mũ, công thức tích phân từng phần giúp tính vế phải:
$$\int u\,dv=uv-\int v\,du.$$
Kỹ thuật này và nhân tử tích phân giải quyết hai phần khác nhau của cùng một bài: nhân tử xử lý vế chứa $y$, còn từng phần xử lý nguyên hàm còn lại.`,
    content: R`### Ví dụ chuẩn trong bài giảng và đề K51

Xét bài toán
$$y'+2y=2x,\qquad y(0)=\frac32.$$
Phương trình có $p(x)=2$, vì vậy $\mu=e^{2x}$. Sau khi nhân:
$$(e^{2x}y)'=2x e^{2x}.$$
Đây là lúc dùng tích phân từng phần; không tích phân riêng $y'$ và $2y$ khi chưa biết hàm $y$.

Đặt $u=2x$ và $dv=e^{2x}\,dx$. Khi ấy $du=2\,dx$, $v=\frac12e^{2x}$, do đó
$$\int 2x e^{2x}\,dx=x e^{2x}-\int e^{2x}\,dx
=\left(x-\frac12\right)e^{2x}+C.$$
Suy ra
$$e^{2x}y=\left(x-\frac12\right)e^{2x}+C,\qquad
y=x-\frac12+Ce^{-2x}.$$

Điều kiện đầu xác định $C$ sau cùng. Đạo hàm của nghiệm phải được thế về phương trình gốc; đây là cách phát hiện sai dấu hoặc thiếu hệ số trong phép tích phân từng phần.`,
    references: [lecture, 'Slide LXT · cong_thuc_bien_doi_tich_phan_tung_phan.pdf · trang 2', 'main.pdf · trang 194 · câu 9'],
    workedExample: ex('Giải $y\\prime+2y=2x$, biết $y(0)=\\frac32$.', [
      R`Nhân tử tích phân là $\mu=e^{\int2\,dx}=e^{2x}$. Khi nhân hai vế, $(e^{2x}y)'=2x e^{2x}$.`,
      R`Đặt $u=2x$, $dv=e^{2x}\,dx$; khi đó $du=2\,dx$, $v=\frac12e^{2x}$.`,
      R`$\int2x e^{2x}\,dx=uv-\int v\,du=xe^{2x}-\int e^{2x}\,dx=(x-\frac12)e^{2x}+C$.`,
      R`Chia cho $e^{2x}$: $y=x-\frac12+Ce^{-2x}$.`,
      R`Từ $y(0)=\frac32$: $-\frac12+C=\frac32$, nên $C=2$. Vậy $y=2e^{-2x}+x-\frac12$.`,
      R`Kiểm tra: $y'=1-4e^{-2x}$, nên $y'+2y=2x$; đồng thời $y(0)=\frac32$.`
    ], 'Thử nghiệm ở hai nơi: phương trình vi phân và điều kiện đầu.'),
    recall: recall('Tích phân từng phần xuất hiện ở bước nào của phương trình tuyến tính?', R`Sau khi nhân tử biến vế trái thành $(\mu y)'$, ta tính $\int\mu q\,dx$. Nếu tích phân này là tích phù hợp, mới áp dụng $\int u\,dv=uv-\int v\,du$.`),
    trap: trap('Tích phân hai hạng chứa hàm chưa biết riêng rẽ', R`Từ $y'+2y=2x$, tích phân riêng từng hạng chứa $y$ rồi kết luận.`, R`Nhân với $e^{2x}$ để tạo $(e^{2x}y)'$, sau đó tính $\int2xe^{2x}\,dx$.`, 'Hàm y chưa biết nên không thể xem các hạng chứa y như những hàm đã có nguyên hàm.'),
  }, {
    id: 'section-4', title: 'Mô hình Malthus: tăng trưởng và suy giảm theo hàm mũ', scene: 'growth',
    conditions: 'Hệ số $k$ được giả thiết không đổi trên khoảng dự báo. Đơn vị của $k$ là nghịch đảo đơn vị thời gian của $t$.',
    definition: R`Nếu tốc độ thay đổi tức thời tỉ lệ với quy mô hiện tại $N(t)$, mô hình là
$$N'(t)=kN(t).$$
Với điều kiện đầu $N(0)=N_0$, nghiệm là
$$N(t)=N_0e^{kt}.$$
Khi $k>0$, quy mô tăng; khi $k<0$, quy mô suy giảm; khi $k=0$, quy mô không đổi.`,
    content: R`### Từ giả thiết đến nghiệm

Chia cho $N$ trên nhánh dương rồi tích phân:
$$\frac{N'}{N}=k
\quad\Longrightarrow\quad
\ln N=kt+C
\quad\Longrightarrow\quad
N(t)=N_0e^{kt}.$$
Mô hình giả định tốc độ tương đối $N'/N$ không đổi. Tốc độ tăng tuyệt đối $N'=kN$ vẫn thay đổi cùng quy mô $N$.

### Hiệu chỉnh k từ hai quan sát

Nếu $N(t_1)=N_1$ và $N(t_2)=N_2$, với các giá trị dương, thì
$$k=\frac{\ln(N_2/N_1)}{t_2-t_1}.$$
Không lấy tỷ số tăng tuyệt đối chia cho thời gian rồi gọi đó là hằng số $k$; mô hình mũ yêu cầu so sánh tỷ số các quy mô. Khi $k>0$, thời gian gấp đôi là $\frac{\ln2}{k}$; khi $k<0$, thời gian còn một nửa là $\frac{\ln2}{|k|}$.

### Giới hạn của dự báo

Nghiệm là hệ quả của giả thiết $k$ cố định. Nếu nguồn lực, cấu trúc dân số hoặc môi trường làm tốc độ tương đối thay đổi, ngoại suy dài hạn theo cùng một $k$ không còn được bảo đảm. Luôn ghi mốc thời gian, đơn vị và khoảng dự báo.`,
    references: [lecture, lxtOde, tud, 'main.pdf · trang 220–221 · bài tập tăng trưởng và tắt dần'],
    workedExample: ex('Một quần thể có $N(0)=500$ và $N(10)=1000$, trong đó thời gian tính bằng tháng. Dự báo $N(24)$ theo mô hình Malthus.', [
      R`Từ $N(t)=500e^{kt}$ và $N(10)=1000$, ta có $e^{10k}=2$, nên $k=\frac{\ln2}{10}$. Vì $t$ tính bằng tháng, $k$ có đơn vị tháng$^{-1}$.`,
      R`Thay $k$ vào nghiệm: $N(t)=500e^{(\ln2)t/10}=500\cdot2^{t/10}$.`,
      R`$N(24)=500\cdot2^{24/10}\approx2639$.`,
      R`Kiểm tra mốc đã cho: $N(0)=500$ và $N(10)=500\cdot2=1000$.`
    ], 'Giữ $k=\\frac{\\ln2}{10}$; không thay $\\ln2$ bằng 1. Kết quả dùng tháng làm đơn vị thời gian.'),
    recall: recall("Trong mô hình $N'=kN$, đại lượng nào không đổi khi $k$ không đổi?", R`Tốc độ tương đối $\frac{N'}{N}=k$ không đổi; tốc độ tuyệt đối $N'=kN$ phụ thuộc vào quy mô tại thời điểm đó.`),
    trap: trap('Nhầm tốc độ liên tục với phần trăm hữu hạn', R`Dữ kiện tăng gấp đôi trong 10 tháng cho $k=\frac{1}{10}$.`, R`Từ $e^{10k}=2$ suy ra $k=\frac{\ln2}{10}$.`, 'Cần lấy logarit của tỷ số hai mức để hiệu chỉnh tốc độ liên tục.'),
  }, {
    id: 'section-5', title: 'Mô hình Solow: vốn bình quân lao động', scene: 'solow',
    conditions: 'Với sản xuất Cobb–Douglas, giả sử $A>0$, $0<\\alpha<1$, tiết kiệm $0<s<1$, tăng lao động $n\\ge0$, khấu hao $\\delta\\ge0$; xét trạng thái vốn bình quân dương.',
    definition: R`Đặt $k=K/L$ là vốn trên một lao động. Với sản xuất $Y=AK^{\alpha}L^{1-\alpha}$, sản lượng trên lao động là $y=Y/L=Ak^{\alpha}$. Nếu vốn tích lũy theo $K'=sY-\delta K$ và lao động theo $L'=nL$, quy tắc đạo hàm thương cho
$$k'=sAk^{\alpha}-(n+\delta)k.$$
Trạng thái dừng dương $k^*$ thỏa
$$sA(k^*)^{\alpha}=(n+\delta)k^*.$$
Khi $n+\delta>0$:
$$k^*=\left(\frac{sA}{n+\delta}\right)^{\frac{1}{1-\alpha}}.$$
Nếu bỏ khấu hao, đặt $\delta=0$; không tự xóa $\delta$ khi đề bài có cho.`,
    content: R`### Vì sao phải chuyển từ tổng lượng sang bình quân?

Phương trình vốn tổng mô tả cả thay đổi vốn lẫn thay đổi quy mô lao động. Chia cho $L$ và lấy đạo hàm thương:
$$k'=\left(\frac{K}{L}\right)'
=\frac{K'}{L}-\frac{K}{L}\frac{L'}{L}
=sAk^{\alpha}-\delta k-nk.$$
Đầu tư làm tăng vốn bình quân; khấu hao và tăng lao động làm giảm lượng vốn bình quân còn lại trên mỗi lao động.

### Trạng thái dừng là cân bằng dòng, không phải nền kinh tế ngừng sản xuất

Tại $k^*$, đầu tư bình quân vừa đủ bù khấu hao và phần vốn cần để trang bị cho lao động tăng thêm:
$$sAk^\alpha=(n+\delta)k.$$
Với $0<\alpha<1$, vế trái tăng chậm hơn theo $k$ so với đường chi phí thay thế tuyến tính. Vì thế $k'<0$ khi $k>k^*$ và $k'>0$ khi $0<k<k^*$. Trạng thái dừng của $k$ không kéo theo $K'=0$; nếu lao động tăng, vốn tổng vẫn có thể tăng để giữ nguyên vốn trên mỗi lao động.

### Liên hệ trở lại phương trình tuyến tính

Trên nhánh $k>0$, đặt $v=k^{1-\alpha}$ và viết $c=n+\delta>0$. Khi đó
$$v'+(1-\alpha)c\,v=(1-\alpha)sA.$$
Đây là phương trình tuyến tính cấp một. Nghiệm tiến về $v^*=\frac{sA}{c}$, tương ứng $k^*=(v^*)^{1/(1-\alpha)}$. Phép đặt biến cho thấy vì sao công cụ của chương có ích trong mô hình tăng trưởng.`,
    references: [tud, 'TUD_v2.pdf · Bài 11–12, trang 34', '[MIT OpenCourseWare · Introduction and the Solow Model](https://ocw.mit.edu/courses/14-05-intermediate-macroeconomics-spring-2013/c132cddf2e9d05c5d42dfadece492d72_MIT14_05S13_LecNot_Int_Sol.pdf)'],
    workedExample: ex('Xét $Y=K^{1/2}L^{1/2}$, $s=0{,}3$, $n=0{,}05$, $\\delta=0$. Tìm trạng thái dừng của vốn và sản lượng trên lao động.', [
      R`Ở đây $A=1$, $\alpha=\frac12$, $k=K/L$, nên $y=Y/L=\sqrt{k}$.`,
      R`Phương trình động là $k'=0{,}3\sqrt{k}-0{,}05k$.`,
      R`Trạng thái dừng dương thỏa $0{,}3\sqrt{k}=0{,}05k$. Chia cho $\sqrt{k}>0$: $\sqrt{k}=6$, nên $k^*=36$.`,
      R`Sản lượng trên lao động tại trạng thái dừng là $y^*=\sqrt{36}=6$.`,
      R`Với $0<k<36$, $k'>0$; với $k>36$, $k'<0$. Dấu này xác nhận trạng thái dừng hút các mức vốn bình quân dương.`
    ], 'Kiểm tra riêng k = 0 trước khi chia cho $\\sqrt{k}$; đề bài yêu cầu trạng thái dừng dương.'),
    recall: recall('Điều kiện trạng thái dừng trong Solow cấp một là gì?', R`$k'=0$, tức đầu tư bình quân $s f(k)$ bằng lượng vốn phải bù cho tăng lao động và khấu hao: $(n+\delta)k$.`),
    trap: trap('Đồng nhất k không đổi với K không đổi', R`$k'=0$ nên tổng vốn K không tăng.`, R`$k'=0$ chỉ nói $K/L$ không đổi; khi $L$ tăng, $K$ vẫn có thể tăng cùng tốc độ.`, 'Cần phân biệt một đại lượng bình quân với tổng lượng.'),
  }, {
    id: 'bounded-growth', title: 'Tăng trưởng theo khoảng cách đến mức giới hạn', scene: 'bounded-growth',
    conditions: 'Giả sử $k>0$, $M$ cố định và $N_0<M$. Đây là mô hình tốc độ tỉ lệ với phần còn thiếu, không phải mô hình Malthus hay phương trình logistic.',
    definition: R`Nếu tốc độ tăng tỉ lệ với khoảng cách từ quy mô hiện tại đến mức giới hạn $M$, ta có
$$N'=k(M-N),\qquad k>0.$$
Đặt $E=M-N$. Khi ấy $E'=-kE$, nên
$$N(t)=M-(M-N_0)e^{-kt}.$$
Nghiệm cân bằng $N=M$ phải được thử trước khi chia cho $M-N$.`,
    content: R`### Phân biệt hai giả thiết về tốc độ tăng

Malthus giả định $N'$ tỉ lệ với quy mô hiện tại $N$. Bài toán giới hạn giả định $N'$ tỉ lệ với khoảng cách còn lại $M-N$. Hai giả thiết cho hai phương trình khác nhau:
$$N'=kN,\qquad N'=k(M-N).$$
Trong phương trình thứ hai, tốc độ giảm khi $N$ tiến gần $M$. Đây cũng không phải phương trình logistic $N'=rN(1-N/M)$, vốn chứa tích của quy mô hiện tại và phần còn thiếu.

### Giải và diễn giải nghiệm

Nghiệm hằng $N=M$ thỏa phương trình. Với nhánh còn lại, đặt $E=M-N$ thì $E'=-N'=-kE$; do đó $E(t)=E(0)e^{-kt}$ và khoảng cách đến giới hạn giảm theo hàm mũ. Nếu $N_0<M$, nghiệm tiến gần $M$ nhưng không đạt đúng $M$ trong thời gian hữu hạn.

### Dùng dữ kiện để tìm thời điểm

Trước khi lấy logarit, kiểm tra mức cần đạt nằm giữa $N_0$ và $M$. Công thức thời điểm được lập từ tỷ số hai khoảng cách còn thiếu, không phải tỷ số hai quy mô. Dự báo tiến sát giới hạn nhạy với sai số đo của $M$; cần nêu giả thiết $M$ cố định.`,
    references: [lxtOde, tud, 'main.pdf · trang 220–221 · bài toán quần thể có mức giới hạn'],
    workedExample: ex('Cho $N(0)=N_0$, mức giới hạn $M=4N_0$ và $N(10)=2N_0$. Tìm $N(t)$ và thời điểm $N(t)=3N_0$.', [
      R`Mô hình cho $N(t)=4N_0-3N_0e^{-kt}$.`,
      R`Thay $t=10$ và $N(10)=2N_0$: $2=4-3e^{-10k}$, nên $e^{-10k}=\frac23$ và $k=\frac{\ln(3/2)}{10}$.`,
      R`Vậy $N(t)=N_0\left[4-3\left(\frac23\right)^{t/10}\right]$.`,
      R`Để $N(t)=3N_0$, cần $3=4-3e^{-kt}$, tức $e^{-kt}=\frac13$.`,
      R`Thời điểm cần tìm là $t=\frac{10\ln3}{\ln(3/2)}\approx27{,}1$. Thời điểm này lớn hơn $10$, phù hợp với việc quy mô tiến gần dần đến $4N_0$.`
    ], 'Tìm k từ khoảng cách còn thiếu: $M-N(10)=2N_0$, không phải từ tỷ số $N(10)/N(0)$.'),
    recall: recall("Khác biệt cốt lõi giữa $N'=kN$ và $N'=k(M-N)$ là gì?", 'Mô hình thứ nhất có tốc độ tỉ lệ với quy mô hiện tại; mô hình thứ hai có tốc độ tỉ lệ với khoảng cách còn thiếu đến M.'),
    trap: trap('Gọi mô hình khoảng cách là logistic', R`$N'=k(M-N)$ là phương trình logistic.`, R`Đây là phương trình tuyến tính theo N; logistic có dạng $N'=rN(1-N/M)$.`, 'Mô hình logistic chứa tích $N(M-N)$ sau khi chuẩn hóa; không được bỏ nhân tử N.'),
  }, {
    id: 'exchange-adjustment', title: 'PPP và điều chỉnh tỷ giá về quan hệ cân bằng', scene: 'exchange',
    conditions: 'Lạm phát trong nước và nước ngoài là hằng số trên khoảng xét; $\\gamma>0$. Phải phân biệt tỷ giá cân bằng theo PPP với tỷ giá thực tế.',
    definition: R`Theo quy ước của slide, tỷ giá cân bằng là
$$S^e(t)=a\frac{P_d(t)}{P_f(t)},$$
trong đó $P_d,P_f$ lần lượt là chỉ số giá trong nước và nước ngoài, còn $a>0$ điều chỉnh khác biệt thị trường. Đặt $s=\ln S$ và $s^e=\ln S^e$. Nếu lạm phát là $\pi_d$ và $\pi_f$, thì
$$s^e(t)=s^e_0+\pi t,\qquad \pi=\pi_d-\pi_f.$$
Mô hình hiệu chỉnh sai số của bài giảng là
$$s'=\gamma(s^e-s).$$`,
    content: R`### Từ mức giá đến đường tỷ giá cân bằng

Lấy logarit của quan hệ PPP:
$$s^e=\ln a+\ln P_d-\ln P_f.$$
Vì $\frac{d}{dt}\ln P_d=\pi_d$ và $\frac{d}{dt}\ln P_f=\pi_f$, tốc độ thay đổi của tỷ giá cân bằng là chênh lệch lạm phát:
$$\frac{d s^e}{dt}=\pi_d-\pi_f=\pi.$$
Do đó $s^e(t)=s^e_0+\pi t$, với $s^e_0=\ln a+\ln\frac{P_{d,0}}{P_{f,0}}$.

### Giải phương trình hiệu chỉnh sai số

Tỷ giá thực tế điều chỉnh theo khoảng cách đến tỷ giá cân bằng:
$$s'=\gamma(s^e-s),\qquad\gamma>0.$$
Thay $s^e=s^e_0+\pi t$ và chuyển hạng chứa $s$ sang trái:
$$s'+\gamma s=\gamma s^e_0+\gamma\pi t.$$
Đây là phương trình tuyến tính cấp một. Nhân tử tích phân là $e^{\gamma t}$; nghiệm tổng quát là
$$s(t)=s^e_0+\pi t-\frac{\pi}{\gamma}+Ce^{-\gamma t}.$$
Với điều kiện $s(0)=s_0$, hằng số là $C=s_0-s^e_0+\frac{\pi}{\gamma}$. Nghiệm cho thấy tốc độ hiệu chỉnh càng lớn thì độ trễ dài hạn do chênh lệch lạm phát càng nhỏ.

### Đọc đúng hội tụ và đơn vị

Sai lệch $E=s-s^e$ thỏa
$$E'+\gamma E=-\pi,\qquad
E(t)=-\frac{\pi}{\gamma}+\left(E(0)+\frac{\pi}{\gamma}\right)e^{-\gamma t}.$$
Nếu $\pi=0$, tỷ giá thực tế hội tụ về đường cân bằng cố định. Nếu $\pi\ne0$, đường cân bằng đang dịch chuyển nên sai lệch tiến về $-\frac{\pi}{\gamma}$; không được kết luận sai lệch luôn tiến về $0$. Trong công thức rời rạc một kỳ của slide, $\gamma$ là phần sai lệch được hiệu chỉnh trong mỗi kỳ; trong phương trình vi phân, $\gamma$ có đơn vị nghịch đảo thời gian.`,
    references: [lxtPpp, 'Chương_mới_tcc.pdf · dạng toán PPP · trang 4–5'],
    workedExample: ex('Giả sử $s^e_0=\\ln 1{,}20$, $\\pi=0{,}02$ mỗi năm, $\\gamma=0{,}25$ mỗi năm và $s(0)=\\ln1{,}30$. Tìm sai lệch dài hạn và nghiệm $s(t)$.', [
      R`Từ công thức nghiệm, $C=s_0-s^e_0+\frac{\pi}{\gamma}=\ln\frac{1{,}30}{1{,}20}+0{,}08$.`,
      R`Do đó $s(t)=\ln1{,}20+0{,}02t-0{,}08+\left(\ln\frac{1{,}30}{1{,}20}+0{,}08\right)e^{-0{,}25t}$.`,
      R`Sai lệch là $s(t)-s^e(t)=-0{,}08+\left(\ln\frac{1{,}30}{1{,}20}+0{,}08\right)e^{-0{,}25t}$.`,
      R`Khi $t\to\infty$, sai lệch tiến đến $-0{,}08=-\frac{0{,}02}{0{,}25}$. Vì tỷ giá cân bằng tăng theo thời gian, tỷ giá thực tế chạy theo nhưng có độ trễ.`
    ], 'Không thêm một hạng tăng trưởng ngoại sinh vào mô hình: trong slide, động lực là $s\\prime=\\gamma(s^e-s)$.'),
    recall: recall('Trong mô hình PPP, vì sao $s^e$ có tốc độ $\\pi_d-\\pi_f$?', R`Lấy logarit $s^e=\ln a+\ln P_d-\ln P_f$ rồi đạo hàm theo thời gian; hai tốc độ lạm phát được trừ nhau.`),
    trap: trap('Khẳng định sai lệch luôn về 0', R`Từ $s'=\gamma(s^e-s)$ suy ra $s-s^e\to0$ kể cả khi $s^e$ tăng đều.`, R`Khi $s^e=s^e_0+\pi t$, sai lệch tiến về $-\frac{\pi}{\gamma}$; chỉ khi $\pi=0$ mới tiến về 0.`, 'Tỷ giá cân bằng dịch chuyển liên tục khi có chênh lệch lạm phát.'),
  }]
};
