import chapterEditorial from './chapterEditorial.js';
const R = String.raw;
const ex = (question, steps, casioTip) => ({ question, steps, casioTip });

// Revisions replace the corresponding argument; they are not appended as a second explanation.
const revisions = {
  '5/section-1': {
    workedExample: ex(R`Tính đạo hàm của $f(x)=x^2$ tại $x_0=2$ từ định nghĩa.`, [R`Với $h\ne0$, $\frac{f(2+h)-f(2)}h=\frac{4+4h+h^2-4}h=4+h$.`, R`Khi $h\to0$, tỉ số tiến tới 4. Do đó $f'(2)=4$.`, R`Tiếp tuyến tại (2,4) là $y=4+4(x-2)=4x-4$. Cát tuyến có hệ số góc $4+h$, còn tiếp tuyến có hệ số góc 4.`], "Với $h=0{,}1$ và $h=-0,1$, hai độ dốc 4,1 và 3,9 cùng tiến về 4. Không thay $h=0$ vào một thương có mẫu h."),
  },
  '5/section-2': {
    title: 'Hàm hợp: từ hai mức thay đổi đến quy tắc dây chuyền',
    content: R`### Nhận diện cấu trúc trước khi tính
Cho $u=g(x)$ và $y=f(u)$. Khi x thay đổi một lượng nhỏ, biến trung gian thay đổi theo $\Delta u\approx g'(x)\Delta x$; tiếp đó $\Delta y\approx f'(u)\Delta u$. Vì vậy tốc độ của hai tầng phải được nhân:
$$\frac{dy}{dx}=\frac{dy}{du}\frac{du}{dx}=f'(g(x))g'(x).$$
Đạo hàm ngoài được đánh giá tại **g(x)**. Đây là nội dung của quy tắc dây chuyền (chain rule), không chỉ là thao tác thêm một hệ số vào cuối phép tính.

### Tích, thương và tổ hợp tuyến tính
Nếu u,v khả vi và $\alpha ,\beta$ là hằng số:
$$ (\alpha u+\beta v)'=\alpha u'+\beta v',\qquad(uv)'=u'v+uv',$$
$$\left(\frac uv\right)'=\frac{u'v-uv'}{v^2}\quad(v\ne0).$$
Với $x^2e^{3x}$, phép toán ngoài cùng là tích; chỉ sau khi tách hai đóng góp mới tính đạo hàm hàm hợp trong $e^{3x}$. Kết quả là $e^{3x}(2x+3x^2)$.

### Khi cơ số và số mũ cùng thay đổi
Với $y=x^x$, $x>0$, công thức lũy thừa số mũ hằng không áp dụng. Lấy $\ln y=x\ln x$, đạo hàm cho $y'/y=\ln x+1$, do đó $y'=x^x(\ln x+1)$. Cần giữ miền $x>0$ của phép lấy logarit.

### Kiểm tra tầng phụ thuộc
Với $e^{x^2}$, đạo hàm ngoài cho $e^{x^2}$, đạo hàm trong cho 2x. Với $\ln(1+x^2)$, hai tầng lần lượt cho $1/(1+x^2)$ và 2x. Thiếu tầng nào sẽ làm sai tốc độ thay đổi của toàn hàm.`,
    workedExample: ex(R`Tính đạo hàm $y=(4x+3)^3$ và kiểm tra tại $x=1$.`, [R`Đặt $u=4x+3, y=u^{3}$. Khi đó $\frac{du}{dx}=4$ và $\frac{dy}{du}=3u^{2}$.`, R`$y'=3u^2\cdot4=12(4x+3)^2$.`, R`Tại $x=1, u=7$ và $y'=12\cdot 49=588$.`, R`Khai triển $y=64x^{3}+144x^{2}+108x+27$ cho $y'=192x^{2}+288x+108$; tại $x=1$ cũng bằng 588.`], 'Hai cách tính độc lập cho cùng kết quả. Hệ số 4 đến từ biến trung gian, không đến từ số mũ 3.'),
  },
  '5/section-4': {
    workedExample: ex(R`Với $f(x)=x^{2}$ tại $x_{0}=2$, so sánh mức tăng thực và vi phân khi $\Delta x=h$.`, [R`$\Delta y=(2+h)^2-4=4h+h^2$, còn $dy=f'(2)h=4h$.`, R`Với $h=0{,}1$: $\Delta y=0,41, dy=0,4$. Sai lệch là 0,01.`, R`Với $h=0{,}05$: $\Delta y=0,2025, dy=0,2$. Sai lệch là 0,0025.`, R`Bước thay đổi giảm một nửa làm sai lệch trong ví dụ này giảm bốn lần; điều này không biến xấp xỉ thành đẳng thức.`], "Từ đồ thị, $\\Delta y$ là độ cao tới đường cong; dy là độ cao tới tiếp tuyến trên cùng bước ngang h."),
  },
  '6/section-1': {
    conditions: R`$f$ khả vi tại trạng thái xét; giữ các yếu tố khác cố định. Đơn vị của $f'(x)$ là đơn vị đầu ra trên đơn vị đầu vào.`,
    trap: { title: 'Đồng nhất tốc độ với tổng lượng', wrong: "$f'(5)=44$ nên $f(5)=44$.", right: "$f'(5)=44$ là tốc độ tại $x=5$; giá trị $f(5)$ trong ví dụ là 123.", explanation: 'Giá trị hàm, bình quân và đạo hàm trả lời ba câu hỏi khác nhau; phải đọc cả đơn vị.' },
  },
  '6/section-2': {
    title: 'Bình quân và biên: hai độ dốc, hai câu hỏi',
    conditions: R`Cần $x>0$ và $f$ khả vi. Tỉ số $\frac{f(x)}x$ có ý nghĩa khi gốc đo của đầu vào được xác định.`,
    definition: R`Đặt $a(x)=\frac{f(x)}x$. Quy tắc thương cho
$$a'(x)=\frac{xf'(x)-f(x)}{x^2}
=\frac{f'(x)-a(x)}x.$$
Bình quân đo lượng đầu ra trên một đơn vị đầu vào ở quy mô hiện tại; biên đo tốc độ tức thời tại quy mô đó.`,
    content: R`### Hai độ dốc trên cùng một đồ thị

Với điểm $M=(x,f(x))$, đường thẳng nối gốc tọa độ với $M$ có hệ số góc $\frac{f(x)}x$. Tiếp tuyến tại $M$ có hệ số góc $f'(x)$. Hai đường có thể cùng độ dốc ở một trạng thái nhưng chúng biểu đạt hai đại lượng khác nhau.

### Biên giải thích chiều biến động của bình quân

Vì $x>0$, dấu của $a'(x)$ là dấu của $f'(x)-a(x)$. Nếu phần đầu ra tăng thêm trên một đơn vị đầu vào thấp hơn mức bình quân hiện có, bình quân giảm; nếu cao hơn, bình quân tăng. Đẳng thức $f'(x)=a(x)$ chỉ xác định điểm dừng. Muốn kết luận cực tiểu, phải xét dấu hai phía hoặc dùng một chứng minh tương đương.

### Trường hợp chi phí

Với tổng chi phí $C(q)$, $q>0$, chi phí bình quân là $AC(q)=\frac{C(q)}q$, còn chi phí biên là $MC(q)=C'(q)$. Chi phí cố định không góp vào $MC$ nhưng vẫn xuất hiện trong $AC$. Chẳng hạn $C(q)=100+2q+q^2$ cho
$$AC(q)=\frac{100}{q}+2+q,\qquad MC(q)=2+2q.$$
Chi phí bình quân giảm trên $(0,10)$ và tăng trên $(10,+\infty)$; vì thế $q=10$ là điểm cực tiểu toàn cục, với $AC(10)=MC(10)=22$.

### Không đồng nhất hai bài toán tối ưu

Quan hệ $MC=AC$ mô tả điểm dừng của chi phí bình quân; quan hệ $MR=MC$ là điều kiện cần cho tối ưu lợi nhuận nội bộ. Chúng phát sinh từ hai hàm mục tiêu khác nhau, nên không thể thay thế cho nhau.`,
    workedExample: ex(R`Cho $f(x)=x^2+4$, $x>0$. Tìm giá trị nhỏ nhất của bình quân $a(x)=\frac{f(x)}x$ và so sánh bình quân với biên.`, [R`$a(x)=x+\frac4x$, nên $a'(x)=1-\frac4{x^2}$. Nghiệm dừng hợp lệ là $x=2$.`, R`Với $0<x<2$, $a'(x)<0$; với $x>2$, $a'(x)>0$. Do đó $a$ đạt cực tiểu tại $x=2$, với $a(2)=4$.`, R`Biên là $f'(x)=2x$, nên $f'(2)=4$. Tại điểm này, hệ số góc của đường từ gốc và tiếp tuyến bằng nhau.`, R`Tại $x=1$, $a(1)=5$ trong khi $f'(1)=2$; tại $x=3$, $a(3)=\frac{13}{3}$ trong khi $f'(3)=6$. Bình quân và biên không trùng nhau ở mọi trạng thái.`], 'Bất đẳng thức $x+\\frac4x\\ge4$ trên $x>0$ xác nhận cực tiểu toàn cục, đạt dấu bằng tại $x=2$.'),
    recall: { front: 'Vì sao biên nhỏ hơn bình quân làm bình quân giảm?', back: R`Với $x>0$, $a'(x)=\frac{f'(x)-a(x)}x$. Vì thế $f'(x)<a(x)$ cho $a'(x)<0$. Điểm $f'(x)=a(x)$ chỉ là điểm dừng; cần xét dấu để phân loại.` },
    trap: { title: 'Nhầm tối ưu bình quân với tối ưu tổng', wrong: R`$f'(x)=\frac{f(x)}x$ cũng là điều kiện để $f$ đạt cực tiểu.`, right: R`Đó là điều kiện dừng của bình quân $\frac{f(x)}x$; điểm dừng của $f$ thỏa $f'(x)=0$.`, explanation: 'Xác định đúng hàm mục tiêu trước khi lấy đạo hàm.' },
  },
  '6/section-3': {
    title: 'Hệ số co giãn: phản ứng tương đối tại một trạng thái',
    content: R`### Chuẩn hóa trước khi so sánh

Một thay đổi tuyệt đối chưa cho biết mức độ phản ứng nếu chưa xét quy mô ban đầu. Với $y=f(x)$ và $xy\ne0$, so sánh hai biến thiên tương đối:
$$\frac{\Delta y/y}{\Delta x/x}=\frac{x}{y}\frac{\Delta y}{\Delta x}.$$
Khi $\Delta x\to0$, ta thu được hệ số co giãn có dấu tại trạng thái đang xét:
$$\varepsilon_{y,x}=\frac{x}{y}f'(x).$$
Hệ số này không có đơn vị. Với thay đổi nhỏ, $\frac{\Delta y}{y}\approx\varepsilon_{y,x}\frac{\Delta x}{x}$. Đây là xấp xỉ cục bộ, không phải đẳng thức cho mọi bước hữu hạn.

### Đọc dấu, độ lớn và quy ước

Nếu $\varepsilon_{y,x}>0$, hai đại lượng biến thiên cùng chiều; nếu $\varepsilon_{y,x}<0$, chúng biến thiên ngược chiều. Độ lớn $|\varepsilon_{y,x}|>1$ biểu thị phản ứng phần trăm mạnh hơn đầu vào; $|\varepsilon_{y,x}|<1$ biểu thị phản ứng yếu hơn. Giữ dấu khi cần xác định chiều thay đổi.

Với $y=Ax^\alpha$ trên $x>0$, hệ số co giãn bằng $\alpha$. Hệ số không đổi giúp so sánh độ nhạy, nhưng không làm cho dự báo tuyến tính trở thành thay đổi chính xác. Với $y=x^2$ và $r=\frac{\Delta x}{x}$, thay đổi tương đối chính xác là
$$(1+r)^2-1=2r+r^2.$$
Co giãn cho phần tuyến tính $2r$; số hạng $r^2$ là sai khác hữu hạn. Vì vậy, tăng $10\%$ làm $y$ tăng $21\%$, còn xấp xỉ bậc nhất là $20\%$.

### Co giãn cầu và doanh thu

Với lượng cầu $q=q(p)>0$, co giãn có dấu là $\varepsilon_{q,p}=\frac{p}{q}q'(p)$. Doanh thu $R(p)=p\,q(p)$ thỏa
$$R'(p)=q(p)+p\,q'(p)=q(p)(1+\varepsilon_{q,p}).$$
Khi cầu dốc xuống, $\varepsilon_{q,p}<-1$ nghĩa là tăng giá nhỏ làm doanh thu giảm cục bộ; $-1<\varepsilon_{q,p}<0$ nghĩa là doanh thu tăng cục bộ. Tại $\varepsilon_{q,p}=-1$, doanh thu có đạo hàm bằng $0$; để kết luận cực đại cần xét sự đổi dấu hoặc cấu trúc của $R$. Một số giáo trình dùng độ co giãn cầu dương $-\varepsilon_{q,p}$; phải xác định quy ước trước khi áp dụng tiêu chuẩn.

### Bài tập K51: giữ đúng cấu trúc hàm

Xét $y=\frac{x}{\sqrt{x+30}}$, $x>0$. Tử số là $x$, còn căn chỉ phủ $x+30$. Ta có
$$y'=\frac{x+60}{2(x+30)^{3/2}},\qquad
\varepsilon_{y,x}=\frac{x+60}{2(x+30)}.$$
Tại $x=30$, hệ số co giãn bằng $\frac34$. Vì hệ số dương, $x$ và $y$ biến thiên cùng chiều; tăng $x$ một phần trăm nhỏ làm $y$ tăng xấp xỉ $0{,}75\%$. Hàm này không phải $\sqrt{\frac{x}{x+30}}$. Với bước lớn, phải tính mức thay đổi từ hàm gốc thay vì xem xấp xỉ như đẳng thức.`,
    workedExample: ex(R`Cho $y=\frac{x}{\sqrt{x+30}}$, $x>0$. Tính hệ số co giãn tại $x=30$ và diễn giải kết quả.`, [R`$y'=(x+30)^{-1/2}-\frac{x}{2}(x+30)^{-3/2}=\frac{x+60}{2(x+30)^{3/2}}$.`, R`Theo định nghĩa, $\varepsilon_{y,x}=\frac{x}{y}y'=\frac{x+60}{2(x+30)}$.`, R`Tại $x=30$: $\varepsilon_{y,x}=\frac{90}{120}=\frac34$.`, R`Vì hệ số dương, tăng đầu vào một phần trăm nhỏ làm đầu ra tăng xấp xỉ $0{,}75\%$.`], 'Kết luận là cục bộ quanh x = 30; với một bước hữu hạn, cần tính bằng hàm gốc.'),
    recall: { front: 'Hệ số co giãn khác đạo hàm ở điểm nào?', back: R`Đạo hàm $y'$ đo thay đổi tuyệt đối trên một đơn vị $x$; hệ số $\varepsilon_{y,x}=\frac{x}{y}y'$ đo phản ứng theo tỉ lệ phần trăm và không có đơn vị.` },
    trap: { title: 'Đồng nhất đạo hàm với phần trăm thay đổi', wrong: R`$y'=0{,}75$ nên $x$ tăng $1\%$ thì $y$ tăng $0{,}75\%$.`, right: R`Tính $\varepsilon_{y,x}=\frac{x}{y}y'$ tại trạng thái đang xét.`, explanation: 'Đạo hàm có đơn vị; hệ số co giãn không có đơn vị.' },
  },
  '7/section-1': {
    title: 'Nhiều yếu tố đầu vào và ý nghĩa của đạo hàm riêng',
    content: R`### Từ một biến đến nhiều biến
Giá nhà có thể phụ thuộc diện tích $S$, khoảng cách đến trung tâm $d$ và mức tiện nghi $u$. Mô hình $P=P(S,d,u)$ cho phép đặt một câu hỏi có kiểm soát: nếu chỉ $S$ thay đổi, còn $d,u$ giữ nguyên, giá thay đổi với tốc độ nào? Đại lượng cần tính là $P_{S}$ tại trạng thái đang xét; nó không phải tốc độ khi cả ba yếu tố cùng biến động.

### Giữ biến nào cố định?
Với $z=f(x,y)$, cố định $y=y_{0}$ tạo mặt cắt $g(x)=f(x,y_{0})$. Khi đó $f_{x}(x_{0},y_{0})=g'(x_{0})$ là hệ số góc của mặt cắt theo hướng $x$. Tương tự, mặt cắt $h(y)=f(x_{0},y)$ có hệ số góc $f_{y}(x_{0},y_{0})$ theo hướng $y$. Nếu $y$ thực sự phụ thuộc $x$ dọc một đường, tốc độ dọc đường phải tính bằng quy tắc dây chuyền, không phải đạo hàm riêng $f_x$.

### Tính đạo hàm và ghi địa chỉ đánh giá
Với $f(x,y)=x^{2}+2y^{2}$, ta có $f_{x}=2x$ và $f_{y}=4y$. Tại $(2,2)$, $f_{x}(2,2)=4$ còn $f_{y}(2,2)=8$. Đây là hai hệ số góc của hai mặt cắt khác nhau, không phải hai cách tính cùng một tốc độ. Với $f(x,y)=x^{2}y+e^{xy}$:
$$f_x=2xy+ye^{xy},\qquad f_y=x^2+xe^{xy}.$$
Hệ số $y$ trong đạo hàm theo $x$ và hệ số $x$ trong đạo hàm theo $y$ xuất hiện vì đối số $xy$ cũng thay đổi. Mỗi kết quả là một hàm của $(x,y)$; khi đề hỏi tại điểm cụ thể, phải thay cả hai tọa độ vào.

### Đạo hàm riêng cấp hai
Lấy đạo hàm riêng thêm một lần cho bốn đạo hàm cấp hai. Theo quy ước ở đây, $f_{xy}=\frac{\partial}{\partial y}(f_x)$ và $f_{yx}=\frac{\partial}{\partial x}(f_y)$. Nếu các đạo hàm riêng cấp hai liên tục trong một lân cận của điểm xét, định lý Schwarz cho $f_{xy}=f_{yx}$. Với $f(x,y)=x^{2}y+e^{xy}$, hai đạo hàm hỗn hợp đều bằng $2x+e^{xy}+xye^{xy}$. Điều kiện liên tục cần được nêu; không thể đổi thứ tự hình thức cho mọi hàm.

### Tồn tại hai đạo hàm riêng chưa đủ
Xét
$$g(x,y)=\begin{cases}\dfrac{xy}{x^{2}+y^{2}},&(x,y)\ne(0,0),\\0,&(x,y)=(0,0).\end{cases}$$
Tại gốc, các đạo hàm riêng đều bằng $0$ vì trên mỗi trục tọa độ hàm bằng $0$. Nhưng trên đường $y=x$, $g(x,x)=\frac12$ với mọi $x\ne0$, nên hàm không liên tục tại gốc và do đó không khả vi tại đó. Khả vi đòi hỏi một xấp xỉ tuyến tính chung theo mọi hướng; sự tồn tại riêng từng giới hạn chỉ kiểm tra các hướng tọa độ. Một điều kiện đủ thường dùng là các đạo hàm riêng liên tục trong một lân cận của điểm.` ,
    workedExample: ex(R`Cho $z=x^{2}+2y^{2}$. Tính đạo hàm riêng tại (2,2) và viết hai mặt cắt qua điểm.`, [R`Giữ $y=2$: $z=x^{2}+8$, độ dốc tại $x=2$ bằng $2\cdot 2=4$.`, R`Giữ $x=2$: $z=4+2y^{2}$, độ dốc tại $y=2$ bằng $4\cdot 2=8$.`, R`$f_{xx}=2, f_{yy}=4, f_{xy}=f_{yx}=0$.`, R`$f(2,2)=12$. Cả hai đường mặt cắt đều đi qua cùng điểm trên đồ thị nhưng có hai tốc độ riêng khác nhau.`], 'Nêu biến cố định trước khi lấy đạo hàm. Trong cảnh minh họa, đổi mặt cắt sẽ đổi biến chạy và hệ số góc.'),
  },
  '7/section-2': {
    content: R`### Từ hai đạo hàm riêng đến một xấp xỉ chung
Nếu $f$ khả vi tại $(x_0,y_0)$ thì khi $(\Delta x,\Delta y)\to(0,0)$, mức tăng của hàm có biểu diễn tuyến tính bậc nhất:
$$\Delta f=f_x(x_0,y_0)\Delta x+f_y(x_0,y_0)\Delta y+o\!\left(\sqrt{\Delta x^2+\Delta y^2}\right).$$
Phần tuyến tính là vi phân toàn phần tại điểm gốc:
$$df=f_x(x_0,y_0)\,dx+f_y(x_0,y_0)\,dy.$$
Cả hai đạo hàm được tính tại cùng điểm **ban đầu**. Khi đã tính đóng góp theo $x$, không chuyển điểm đánh giá rồi mới tính đóng góp theo $y$; đó sẽ là một phép xấp xỉ khác.

### Mặt phẳng tiếp xúc và giá trị mới
Mặt phẳng tiếp xúc tại $(x_0,y_0,f(x_0,y_0))$ có phương trình
$$L(x,y)=f(x_0,y_0)+f_x(x_0,y_0)(x-x_0)+f_y(x_0,y_0)(y-y_0).$$
Do đó
$$f(x_0+\Delta x,y_0+\Delta y)\approx f(x_0,y_0)+df.$$
Vi phân $df$ ước lượng **mức tăng**; $f(x_0,y_0)+df$ mới ước lượng **giá trị mới**. Chỉ biết $f,f_x,f_y$ tại điểm gốc chưa đủ xác định sai số chính xác; muốn chặn sai số cần thêm thông tin về hàm, chẳng hạn đạo hàm cấp hai trong một lân cận.

### Thay đổi tuyệt đối và phần trăm
Nếu $x$ tăng $p\%$, thì $\Delta x\approx\frac{p}{100}x_0$, không phải $\frac{p}{100}$ đơn vị. Khi $x_0y_0f(x_0,y_0)\ne0$, chia vi phân cho giá trị ban đầu:
$$\frac{\Delta f}{f(x_0,y_0)}\approx\varepsilon_{f,x}\frac{\Delta x}{x_0}+\varepsilon_{f,y}\frac{\Delta y}{y_0},\qquad
\varepsilon_{f,x}=\frac{x_0f_x(x_0,y_0)}{f(x_0,y_0)},\quad
\varepsilon_{f,y}=\frac{y_0f_y(x_0,y_0)}{f(x_0,y_0)}.$$
Đây là cầu nối từ vi phân đến co giãn riêng. Các tỉ số chỉ có nghĩa khi mẫu số tương ứng khác $0$.

### Bù đắp giữa hai yếu tố
Muốn giữ đầu ra xấp xỉ không đổi thì đặt $df=0$. Nếu $f_y(x_0,y_0)\ne0$:
$$\Delta y\approx-\frac{f_x(x_0,y_0)}{f_y(x_0,y_0)}\,\Delta x.$$
Đây là độ dốc tiếp tuyến của đường mức tại điểm đang xét. Nó chỉ mô tả bù đắp cục bộ; một thay đổi hữu hạn phải được kiểm tra lại trên phương trình mức ban đầu.`,
    workedExample: ex(R`Biết $f(10,5)=1000$, $f_{x}(10,5)=2$ và $f_{y}(10,5)=-3$. Dùng mặt phẳng tiếp xúc để ước lượng $f(10{,}1,4{,}8)$.`, [R`Từ điểm gốc $(10,5)$ đến $(10{,}1,4{,}8)$: $\Delta x=0{,}1$ và $\Delta y=-0{,}2$.`, R`Đóng góp theo $x$: $2\cdot0{,}1=0{,}2$. Đóng góp theo $y$: $(-3)(-0{,}2)=0{,}6$.`, R`Vì vậy $df=0{,}2+0{,}6=0{,}8$ và $f(10{,}1,4{,}8)\approx1000{,}8$.`, R`Dấu xấp xỉ là bắt buộc: ba dữ kiện tại điểm gốc xác định mặt phẳng tiếp xúc, không xác định giá trị chính xác của hàm tại điểm mới.`], 'Biến $y$ giảm nhưng tác động của nó làm $f$ tăng vì $f_y<0$. Xét dấu của cả đạo hàm lẫn biến thiên trước khi cộng.'),
  },
  '7/section-3': {
    title: 'Hàm sản xuất Cobb–Douglas: biên, co giãn và quy mô',
    content: R`### Năng suất biên là đạo hàm riêng
Với $Q=AK^{\alpha}L^{\beta}$, trong đó $A,K,L>0$, giữ lao động $L$ cố định khi xét thêm vốn $K$:
$$MP_K=Q_K=\alpha A K^{\alpha-1}L^{\beta}=\alpha\frac{Q}{K}.$$
Tương tự,
$$MP_L=Q_L=\beta A K^{\alpha}L^{\beta-1}=\beta\frac{Q}{L}.$$
$MP_K$ và $MP_L$ là các thay đổi sản lượng xấp xỉ khi tăng riêng từng yếu tố một đơn vị. Chúng có đơn vị sản lượng trên đơn vị đầu vào; không phải phần trăm.

### Co giãn riêng và lợi suất theo quy mô
Chuẩn hóa năng suất biên theo trạng thái hiện tại:
$$\varepsilon_{Q,K}=\frac{KQ_K}{Q}=\alpha,\qquad
\varepsilon_{Q,L}=\frac{LQ_L}{Q}=\beta.$$
Vì vậy, một phần trăm tăng nhỏ của vốn, khi lao động cố định, làm sản lượng tăng xấp xỉ $\alpha\%$. Nếu tăng **đồng thời** cả vốn và lao động lên $t$ lần, với $t>0$:
$$Q(tK,tL)=t^{\alpha+\beta}Q(K,L).$$
Do đó $\alpha+\beta<1$, $\alpha+\beta=1$ và $\alpha+\beta>1$ lần lượt tương ứng với lợi suất giảm, không đổi và tăng theo quy mô. Đây là phép thay đổi nhiều đầu vào cùng lúc, khác với năng suất biên khi giữ một yếu tố cố định.

### Năng suất biên giảm không đồng nghĩa lợi suất giảm
Khi $0<\alpha<1$, $MP_K$ giảm theo $K$ nếu $L$ cố định; khi $0<\beta<1$, $MP_L$ giảm theo $L$ nếu $K$ cố định. Hai tính chất này vẫn có thể xảy ra đồng thời với lợi suất tăng theo quy mô, chẳng hạn khi $\alpha+\beta>1$. Với mô hình Cobb–Douglas, công thức Euler cho biết
$$KQ_K+LQ_L=(\alpha+\beta)Q.$$
Đẳng thức này là một kiểm tra nhất quán giữa năng suất biên, co giãn riêng và tổng số mũ.`,
    workedExample: ex(R`Cho $Q=10\sqrt{KL}$, giữ $K=4$. Tính Q và năng suất biên theo L tại $L=1$ và $L=4$.`, [R`Với $K=4$: $Q=20\sqrt L$ và $Q_{L}=10/\sqrt L$.`, R`Tại $L=1$: $Q=20, Q_{L}=10$. Tại $L=4$: $Q=40, Q_{L}=5$.`, R`Sản lượng tăng nhưng năng suất biên lao động giảm. Co giãn riêng tại cả hai điểm là $(L/Q)Q_{L}=1/2$.`, R`Nếu tăng đồng thời K và L lên t lần thì Q tăng t lần, vì tổng số mũ bằng 1. Đây là thay đổi quy mô, khác mặt cắt giữ $K=4$.`], 'Một hình mặt cắt chỉ thay L không thể tự chứng minh kết luận tăng đồng thời hai đầu vào; kết luận quy mô đến từ công thức Q(tK,tL).'),
  },
  '8/section-1': { scene: undefined },
  '8/section-2': {
    workedExample: ex(R`Xét bài K51: $f(x,y)=\frac{x^{3}}{3}+\frac{y^{3}}{3}-x-4y$. Tìm và phân loại tất cả điểm dừng.`, [
      R`Giải đồng thời $f_x=x^2-1=0$ và $f_y=y^2-4=0$. Có bốn điểm dừng: $(1,2), (1,-2), (-1,2), (-1,-2)$.`,
      R`Hessian là $H(x,y)=\begin{pmatrix}2x&0\\0&2y\end{pmatrix}$, nên $D=4xy$. Tính $D$ và $f_{xx}=2x$ tại từng điểm; không thay bằng giá trị ở vị trí khác.`,
      R`Tại $(1,2)$: $D=8>0$ và $f_{xx}=2>0$, nên là cực tiểu địa phương chặt; $f(1,2)=-6$.`,
      R`Tại $(-1,-2)$: $D=8>0$ và $f_{xx}=-2<0$, nên là cực đại địa phương chặt; $f(-1,-2)=6$.`,
      R`Tại $(1,-2)$ và $(-1,2)$: $D=-8<0$, nên cả hai là điểm yên ngựa. Các kết luận là địa phương; hàm bậc ba không bị chặn trên toàn $\mathbb{R}^{2}$.`
    ], R`Các cặp dấu $(D,f_{xx})$ theo thứ tự bốn điểm là $(+,+),(-,+),(-,-),(+,-)$; kết luận lần lượt là cực tiểu, yên ngựa, yên ngựa, cực đại. Giá trị hàm không thay thế tiêu chuẩn Hessian.`),
  },
  '8/section-3': {
    workedExample: ex(R`Tối đa hóa $\pi=20q_1+16q_2-q_1^2-q_2^2-q_1q_2$ trên miền $q_1,q_2\ge0$.`, [
      R`Giải $\pi_{q_1}=20-2q_1-q_2=0$ và $\pi_{q_2}=16-q_1-2q_2=0$. Nghiệm nội miền là $(q_1,q_2)=(8,4)$.`,
      R`Tại đó $H=\begin{pmatrix}-2&-1\\-1&-2\end{pmatrix}$, $D=3>0$ và $\pi_{q_1q_1}=-2<0$; Hessian âm xác định.`,
      R`H không đổi trên miền. Với $h=(u,v)^T\ne0$, $h^THh=-(u+v)^2-u^2-v^2<0$. Vì miền khả thi lồi và $\pi$ lõm chặt, $(8,4)$ là điểm tối đa toàn cục duy nhất.`,
      R`$\pi(8,4)=112$. Trên cạnh $q_2=0$, hàm một biến $20q_1-q_1^2$ đạt tối đa $100$ tại $(10,0)$. Trên cạnh $q_1=0$, $16q_2-q_2^2$ đạt tối đa $64$ tại $(0,8)$; góc $(0,0)$ cho $0$.`
    ], R`Các giá trị biên $100$, $64$ và $0$ đều thấp hơn $112$. Tính lõm chặt trên miền lồi đã xác nhận nghiệm nội miền là tối đa toàn cục duy nhất; so sánh biên là phép kiểm tra trực tiếp bổ sung.`),
  },
  '10/section-1': {
    workedExample: ex(R`Với $f(x)=x^{2}$, tìm nguyên hàm rồi tính lượng tích lũy từ 0 đến $b\ge 0$.`, [R`$F(x)=x^{3}/3$ là một nguyên hàm vì $F'=x^{2}$. Họ nguyên hàm là $x^{3}/3+C$.`, R`Lượng tích lũy $A(b)=\int_0^b x^2\,dx=F(b)-F(0)=b^3/3$.`, R`$A(2)=8/3, A(4)=64/3$. Vì $x^{2}\ge 0$, đây đồng thời là diện tích hình học.`, R`$A'(b)=b^{2}$: tốc độ tăng của diện tích bằng độ cao đường cong tại cận đang di chuyển.`], 'Với tích phân xác định, hằng số của nguyên hàm triệt tiêu khi lấy hiệu. Nếu hàm đổi dấu, cần chia khoảng để tính diện tích hình học.'),
  },
  '10/section-2': {
    workedExample: ex(R`Giải $y'+\frac{2x}{1+x^2}y=0$, biết $y(2)=10$. Tính y(3).`, [R`Nghiệm $y=0$ thỏa phương trình gốc nhưng không thỏa điều kiện đầu. Với $y\ne 0$: $dy/y=-2x dx/(1+x^{2})$.`, R`$\ln|y|=-\ln(1+x^2)+C_1$, nên $y=C/(1+x^2)$. Cho $C=0$ để gom cả nghiệm hằng.`, R`$y(2)=C/5=10$ cho $C=50$. Vì $1+x^{2}>0$, nghiệm riêng xác định trên $\mathbb R$.`, R`$y(3)=50/(1+9)=5$. Đạo hàm −$100x/(1+x^{2})^{2}$ triệt tiêu với hạng $2xy/(1+x^{2})$.`], 'Phương trình này vừa tuyến tính vừa tách biến. Nhận diện hai dạng giúp chọn cách tính ngắn mà vẫn giữ đủ nghiệm.'),
  },
  '10/section-3': {
    workedExample: ex(R`Giải $y'+\frac2x y=x^3$ trên $x>0$, biết $y(1)=1$.`, [R`$p=2/x$, $\mu=e^{\int(2/x)\,dx}=x^2$ trên khoảng $x>0$.`, R`Nhân $x^{2}$: $(x^{2}y)'=x^{5}$. Lấy nguyên hàm: $x^{2}y=x^{6}/6+C$.`, R`$y=x^{4}/6+C/x^{2}$. Điều kiện $y(1)=1$ cho $C=5/6$.`, R`$y'+2y/x=(2x^{3}/3-5/(3x^{3}))+(x^{3}/3+5/(3x^{3}))=x^{3}$.`], "$x=0$ không thuộc miền phương trình. Với điều kiện đầu âm phải chọn khoảng $x<0$, không ghép nghiệm qua điểm kỳ dị bằng công thức một cách hình thức."),
  },
  '10/section-4': {
    workedExample: ex(R`Quy mô ban đầu là 500, tăng theo tốc độ tỉ lệ với chính quy mô và gấp đôi sau 10 tháng. Dự báo tại tháng 24.`, [R`$N'=kN$ cho $N=500e^{kt}$. Dữ kiện $N(10)=1000$ dẫn đến $e^{10k}=2$.`, R`$k=\ln2/10$ $\text{thang}^{-1}$, không phải $1/10$.`, R`$N(24)=500e^{24 ln2/10}=500\cdot 2^{2}\cdot ^{4}$≈2639.`, R`Kiểm tra lại $N(0)=500, N(10)=1000$ và $N'/N=k$ không đổi.`], 'Mức dự báo là hệ quả của giả thiết k cố định trong 24 tháng. Tốc độ liên tục k và tỉ lệ tăng rời rạc mỗi tháng không bằng nhau chính xác.'),
  },
  '10/section-5': {
    conditions: "$Q=AK^\\alpha L^{1-\\alpha}$, $A>0$, $0<\\alpha<1$; $K'=sQ-\\delta K$, $L'=nL$, $0<s<1$, $n,\\delta\\ge0$. Phép đặt biến sau dùng $k=K/L>0$.",
    definition: R`Vốn bình quân lao động $k=K/L$ thỏa
$$k'=sAk^\alpha-(n+\delta)k.$$
Nếu $n+\delta >0$, trạng thái dừng dương là
$$k^*=\left(\frac{sA}{n+\delta}\right)^{1/(1-\alpha)}.$$
Mô hình không có khấu hao là trường hợp $\delta =0$.`,
    content: R`### Suy ra phương trình bình quân
Vì $Q/L=Ak^\alpha$, đạo hàm thương cho
$$k'=\frac{K'}L-\frac K L\frac{L'}L=sAk^\alpha-\delta k-nk.$$
Đầu tư tạo vốn, khấu hao làm mất vốn và tăng lao động pha loãng vốn bình quân. Ba đóng góp có cùng đơn vị vốn trên lao động trên thời gian.

### Trạng thái dừng và ổn định
Với $n+\delta >0, 0<k<k^*$ cho $k'>0$ và $k>k^*$ cho $k'<0$. Do đó trạng thái dương thu hút các nghiệm có k ban đầu dương. $k'=0$ không có nghĩa $K'=0$: nếu L tăng và k giữ nguyên thì K vẫn tăng cùng tốc độ với L.

### Đặt biến để trở lại tuyến tính cấp một
Với $k>0$, đặt $v=k^{1-\alpha }$. Khi đó
$$v'+(1-\alpha)(n+\delta)v=(1-\alpha)sA.$$
Đặt $c=n+\delta >0$, lời giải là
$$v(t)=\frac{sA}{c}+\left(v_0-\frac{sA}{c}\right)e^{-(1-\alpha)ct},\qquad k=v^{1/(1-\alpha)}.$$
Nếu $c=0$, không dùng công thức có mẫu c; thay bằng $v=v_{0}+(1-\alpha )$sAt. Nghiệm $k=0$ cần xét trực tiếp trước phép nhân $k^{-\alpha }$. Phép đặt biến chỉ mô tả nhánh $v>0$.

### Diễn giải thay đổi tham số
Tăng s hoặc A làm $k^*$ cao hơn; tăng n hoặc $\delta$ làm $k^*$ thấp hơn khi các tham số khác giữ nguyên. Đây là so sánh trạng thái dừng của mô hình, không phải mức tăng tức thời của k.`,
  },
};

const chapter5Overrides = {
  'section-1': {
    content: R`### Từ thương sai phân đến tốc độ tức thời
Với $h\ne0$, thương sai phân
$$\frac{f(x_0+h)-f(x_0)}{h}$$
là độ dốc của cát tuyến qua $(x_0,f(x_0))$ và $(x_0+h,f(x_0+h))$. Nó đo tốc độ thay đổi trung bình trên khoảng có dấu $h$. Đạo hàm là giới hạn của các độ dốc ấy khi điểm thứ hai tiến về điểm thứ nhất; không thay $h=0$ vào thương có mẫu bằng $0$.

Một cách viết tương đương, đặt $h=x-x_0$:
$$f\prime(x_0)=\lim_{x\to x_0}\frac{f(x)-f(x_0)}{x-x_0}.$$
Đạo hàm hai phía tồn tại khi giới hạn từ trái và từ phải đều hữu hạn và bằng nhau. Tại đầu mút miền xét, chỉ có thể xác định đạo hàm một phía tương ứng.

### Tiếp tuyến và đơn vị đạo hàm
Khi giới hạn hữu hạn tồn tại, nó là hệ số góc của tiếp tuyến tại $M_0=(x_0,f(x_0))$:
$$y=f(x_0)+f\prime(x_0)(x-x_0).$$
Số hạng $f(x_0)$ đặt tiếp tuyến đi qua $M_0$; hệ số $f\prime(x_0)$ cho biết độ nghiêng. Nếu đầu vào đo bằng giờ và đầu ra bằng kilômét thì đơn vị của đạo hàm là kilômét trên giờ. Vì vậy $f(x_0)$ là mức đầu ra, còn $f\prime(x_0)$ là tốc độ tức thời.

### Khả vi và liên tục
Có đạo hàm tại một điểm suy ra liên tục tại điểm đó, nhưng chiều đảo không đúng. Hàm $f(x)=|x|$ liên tục tại $x=0$; đạo hàm phải bằng $1$, còn đạo hàm trái bằng $-1$. Hai giới hạn khác nhau nên $f\prime(0)$ không tồn tại.

### Đạo hàm như một hàm số
Khi đạo hàm tồn tại tại mọi điểm của một khoảng, $f\prime$ là hàm số gán cho mỗi $x$ tốc độ biến thiên tức thời tại $x$. Giá trị $f\prime(x_0)$ là một số cụ thể; hàm $f\prime$ mô tả cách tốc độ ấy thay đổi theo trạng thái.`,
    workedExample: ex(R`Tính đạo hàm của $f(x)=x^2$ tại $x_0=2$ từ định nghĩa.`, [
      R`Với $h\ne0$, $\frac{f(2+h)-f(2)}{h}=\frac{(2+h)^2-4}{h}=4+h$.`,
      R`Lấy giới hạn khi $h\to0$: $f'(2)=4$. Thương sai phân bằng $4+h$ trước khi lấy giới hạn, không bằng $4$ với mọi $h$.`,
      R`Tiếp tuyến tại $M_0=(2,4)$ là $y=4+4(x-2)=4x-4$. Cát tuyến có hệ số góc $4+h$ và tiến về hệ số góc $4$.`
    ], R`Với $h=0{,}1$ và $h=-0{,}1$, hai hệ số góc cát tuyến là $4{,}1$ và $3{,}9$; hai phía cùng tiến về $4$.`)
  },
  'section-2': {
    content: R`### Nhận diện cấu trúc trước khi tính
Cho $u=g(x)$ và $y=f(u)$. Với một bước nhỏ, mức thay đổi ở tầng trong thỏa $\Delta u\approx g'(x)\Delta x$; ở tầng ngoài, $\Delta y\approx f'(u)\Delta u$. Vì vậy tốc độ của tầng ngoài phải được tính tại giá trị trung gian $u=g(x)$, còn tốc độ của tầng trong được tính theo $x$. Quy tắc dây chuyền ghi lại việc truyền thay đổi qua cả hai tầng.

### Tuyến tính, tích và thương
Với các hàm khả vi $u,v$ và hằng số $\alpha,\beta$, quy tắc tuyến tính và tích là
$$ (\alpha u+\beta v)'=\alpha u'+\beta v',\qquad(uv)'=u' v+uv'.$$
Quy tắc thương chỉ dùng khi $v\ne0$:
$$\left(\frac{u}{v}\right)'=\frac{u' v-uv'}{v^2}.$$
Trong quy tắc tích, mỗi thừa số lần lượt đóng vai trò phần thay đổi; không nhân hai đạo hàm với nhau.

### Bốn mẫu hàm hợp trong bài giảng
Với $u=3x^2+5$, ta có
$$\frac{d}{dx}\sqrt{u}=\frac{u'}{2\sqrt{u}}=\frac{3x}{\sqrt{3x^2+5}}.$$
Với $u=4x+3$,
$$\left(\frac{1}{u}\right)'=-\frac{u'}{u^2}=-\frac{4}{(4x+3)^2}.$$
Hai ví dụ còn lại cho thấy cách giữ nguyên biểu thức trong khi lấy đạo hàm ngoài:
$$\frac{d}{dx}e^{4x^3+3x}=e^{4x^3+3x}(12x^2+3),$$
$$\frac{d}{dx}\ln(4x^3+3x^2+1)=\frac{12x^2+6x}{4x^3+3x^2+1},$$
trong đó công thức logarit được dùng tại những $x$ làm đối số dương.

### Tích kết hợp với hàm hợp
Xét $y=x^2e^{3x}$. Dùng quy tắc tích, rồi lấy đạo hàm của hàm mũ hợp:
$$y'=2xe^{3x}+x^2\left(3e^{3x}\right)=e^{3x}(2x+3x^2).$$
Hạng thứ nhất là đóng góp từ $x^2$; hạng thứ hai là đóng góp từ $e^{3x}$. Hệ số $3$ xuất hiện vì số mũ là $3x$.

### Khi cơ số và số mũ cùng thay đổi
Với $y=x^x$, cần $x>0$ để lấy logarit thực. Từ $\ln y=x\ln x$, đạo hàm hai vế cho
$$\frac{y'}{y}=\ln x+1,\qquad y'=x^x(\ln x+1).$$
Công thức lũy thừa với số mũ hằng không áp dụng trực tiếp ở đây.

### Trình tự kiểm tra
Nhận diện phép toán ngoài cùng; áp dụng quy tắc tương ứng; tiếp tục phân tích các hàm hợp bên trong; cuối cùng kiểm tra miền xác định và các mẫu số. Nếu có thể, khai triển hoặc tính theo cách thứ hai để đối chiếu kết quả.`,
    workedExample: ex(R`Tính đạo hàm $y=(4x+5)^3$ và kiểm tra tại $x=1$.`, [
      R`Đặt $u=4x+5$, khi đó $y=u^3$, $\frac{du}{dx}=4$ và $\frac{dy}{du}=3u^2$.`,
      R`Theo quy tắc dây chuyền, $y'=3u^2\cdot4=12(4x+5)^2$.`,
      R`Tại $x=1$, $y'=12\cdot9^2=972$.`,
      R`Khai triển $y=64x^3+240x^2+300x+125$ rồi lấy đạo hàm cũng cho $y'=192x^2+480x+300$; tại $x=1$ được $972$.`
    ], R`Hệ số 4 là tốc độ thay đổi của biến trung gian $u$ theo $x$; nó đến từ $\frac{du}{dx}$, không đến từ phép lấy đạo hàm của $u^3$.`)
  },
  'section-3': {
    title: 'Hàm ẩn: đạo hàm trên một nhánh nghiệm',
    content: R`### Từ phương trình đến một nhánh hàm
Phương trình $F(x,y)=0$ có thể xác định $y$ theo $x$ mà không đưa sẵn $y$ về một vế. Gần điểm $(x_0,y_0)$, nếu các đạo hàm riêng cấp một của $F$ liên tục gần điểm đó, $F(x_0,y_0)=0$ và $F_y(x_0,y_0)\ne0$, định lý hàm ẩn (Implicit Function Theorem) bảo đảm tồn tại duy nhất một nhánh khả vi $y=y(x)$ trong một lân cận của điểm đó. Đây là kết luận cục bộ; toàn bộ đường cong có thể không phải đồ thị của một hàm duy nhất.

### Lấy đạo hàm mà không giải tường minh
Trên nhánh nghiệm, $F(x,y(x))=0$. Quy tắc dây chuyền cho
$$\frac{d}{dx}F(x,y(x))=F_x(x,y)+F_y(x,y)y'=0,$$
từ đó
$$y'=-\frac{F_x}{F_y},\qquad F_y\ne0.$$
Các đạo hàm riêng được tính tại cùng điểm $(x,y(x))$. Thành phần $F_x$ ghi ảnh hưởng khi $x$ thay đổi; thành phần $F_y y'$ ghi phần bù do $y$ thay đổi để duy trì quan hệ $F=0$.

### Trình tự khi đề chỉ cho $x_0$
Đặt quan hệ về dạng $F(x,y)=0$. Thay $x=x_0$ vào phương trình gốc để tìm $y_0$; kiểm tra $(x_0,y_0)$ thuộc đường; sau đó tính $F_x,F_y$, xác nhận $F_y(x_0,y_0)\ne0$, rồi mới thế vào công thức. Nếu $F_y=0$, không chia cho biểu thức ấy: có thể xét giải $x$ theo $y$ khi $F_x\ne0$, hoặc phải khảo sát riêng điểm kỳ dị.`,
    workedExample: ex(R`Cho $y=y(x)$ thỏa $4x^2+xy^3-5x+3y+4ye^x-7=0$. Tìm $y(0)$ rồi tính $y'(0)$.`, [
      R`Đặt $F(x,y)=4x^2+xy^3-5x+3y+4ye^x-7$. Cho $x=0$: $F(0,y)=7y-7=0$, nên $y(0)=1$.`,
      R`Lấy đạo hàm theo $x$, xem $y$ là hàm của $x$: $8x+y^3+3xy^2y'-5+3y'+4ye^x+4ye^xy'=0$.`,
      R`Thu các hạng chứa $y'$: $(3xy^2+3+4e^x)y'=-(8x+y^3-5+4ye^x)$.`,
      R`Tại $(0,1)$, $F_x(0,1)=0$ và $F_y(0,1)=7\ne0$. Vì vậy $y'(0)=-\frac{F_x(0,1)}{F_y(0,1)}=-\frac{0}{7}=0$.`,
      R`Tiếp tuyến tại $(0,1)$ là $y-1=0$. Kết quả mô tả độ dốc của nhánh nghiệm ngay tại điểm này.`
    ], 'Khi đề chỉ cho $x_0$, phải tìm $y_0$ từ phương trình gốc trước. Sau đó thế cả cặp $(x_0,y_0)$ vào $F_x,F_y$.')
  },
  'section-4': {
    definition: R`Đặt $dx=\Delta x$. Mức tăng thực và vi phân tại điểm đầu lần lượt là
$$\Delta y=f(x_0+\Delta x)-f(x_0),\qquad dy=f'(x_0)\,dx.$$
Tính khả vi cho
$$f(x_0+\Delta x)=f(x_0)+f'(x_0)\Delta x+o(|\Delta x|).$$
Vì vậy $\Delta y\approx dy$ khi bước thay đổi đủ nhỏ.`,
    content: R`### Phần tuyến tính của mức thay đổi
Đặt $h=\Delta x$. Từ định nghĩa đạo hàm, khi $h\to0$ ta có
$$\Delta y=f(x_0+h)-f(x_0)=f'(x_0)h+o(|h|).$$
Ký hiệu $o(|h|)$ là phần dư $r(h)$ thỏa $\lim_{h\to0}\frac{r(h)}{|h|}=0$. Vì vậy, phần tuyến tính của mức tăng là $dy=f'(x_0)dx$; khi chọn $dx=\Delta x$, ta dùng $dy$ để xấp xỉ $\Delta y$, chứ không đồng nhất hai đại lượng.

### Tuyến tính hóa quanh điểm chuẩn
Tiếp tuyến tại $x_0$ tạo hàm tuyến tính hóa
$L(x)=f(x_0)+f'(x_0)(x-x_0),\qquad f(x)\approx L(x).$
Khi $x$ gần $x_0$, hàm tuyến tính hóa $L$ ước lượng giá trị của $f$. Điểm chuẩn nên làm cho $f(x_0)$ và $f'(x_0)$ dễ tính. Hướng của bước thay đổi được giữ trong dấu của $\Delta x$; độ cong và khoảng cách tới điểm chuẩn ảnh hưởng sai số.

### Ước lượng căn bậc hai
Để ước lượng $\sqrt{4{,}08}$, chọn $f(x)=\sqrt{x}$ và $x_0=4$. Khi đó $f(4)=2$ và $f'(4)=\frac{1}{4}$, nên
$$L(x)=2+\frac{1}{4}(x-4),\qquad \sqrt{4{,}08}\approx L(4{,}08)=2{,}02.$$
Giá trị thực gần $2{,}019901$; sai số tuyệt đối của tuyến tính hóa xấp xỉ $9{,}9\times10^{-5}$. Ví dụ này cho thấy vì sao điểm chuẩn gần giá trị cần ước lượng lại quan trọng.

### Đọc sai số mà không khái quát quá mức
Với $f(x)=x^2$ tại $x_0=2$, thay đổi thực là $\Delta y=4h+h^2$, còn vi phân là $dy=4h$. Sai lệch chính xác bằng $h^2$ trong ví dụ này; không được kết luận mọi hàm đều có sai số bằng bình phương bước thay đổi. Khi $f(x_0)\ne0$, có thể xét thay đổi tương đối bằng cách so mức tăng với mức ban đầu; ý nghĩa kinh tế của đại lượng này được phát triển cùng hệ số co giãn ở chương kế tiếp.`,
    workedExample: ex(R`Với $f(x)=x^2$ tại $x_0=2$, đối chiếu thay đổi thực và vi phân khi $\Delta x=h$.`, [
      R`$\Delta y=(2+h)^2-4=4h+h^2$, trong khi $dx=h$ và $dy=f'(2)dx=4h$.`,
      R`Với $h=0{,}1$: $\Delta y=0{,}41$ còn $dy=0{,}4$; sai lệch bằng $0{,}01$.`,
      R`Với $h=0{,}05$: $\Delta y=0{,}2025$ còn $dy=0{,}2$; sai lệch bằng $0{,}0025$.`,
      R`Khi bước giảm một nửa, sai lệch cụ thể này giảm còn một phần tư vì phần dư ở đây là $h^2$.`
    ], R`Trên đồ thị, $\Delta y$ là độ cao tới đường cong; $dy$ là độ cao tới tiếp tuyến trên cùng bước ngang $h$.`)
  }
};

const mathSlash5 = String.fromCharCode(92);
chapter5Overrides['section-1'].recall = { front: 'Vì sao không thế $h=0$ vào thương sai phân?', back: 'Khi $h=0$, thương sai phân không xác định. Đạo hàm là giới hạn hữu hạn của thương khi $h\to0$, nếu giới hạn ấy tồn tại.' };
chapter5Overrides['section-1'].trap = { title: 'Đồng nhất thương sai phân với đạo hàm', wrong: 'Thương sai phân bằng $f\'(x_0)$ với mọi $h$.', right: 'Đạo hàm là giới hạn của thương khi $h$ tiến về $0$.', explanation: 'Thương mô tả độ dốc cát tuyến; giới hạn mô tả độ dốc tiếp tuyến.' };
chapter5Overrides['section-3'].recall = { front: 'Khi nào được dùng công thức đạo hàm của hàm ẩn?', back: '$y\'=-'+mathSlash5+'frac{F_x}{F_y}$ khi điểm thuộc $F=0$, các đạo hàm riêng liên tục gần điểm và $F_y'+mathSlash5+'ne0$. Nếu $y_0$ chưa cho, tìm nó từ phương trình gốc trước.' };
chapter5Overrides['section-3'].trap = { title: 'Chia khi mẫu bằng không', wrong: 'Dùng $y\'=-\\frac{F_x}{F_y}$ dù $F_y=0$.', right: 'Chỉ chia cho $F_y$ khi $F_y'+mathSlash5+'ne0$.', explanation: 'Nếu $F_y=0$, cần xét cách giải theo biến kia hoặc khảo sát riêng điểm kỳ dị.' };

const extras = {
  5: [{
    id: 'derivative-formulas', title: 'Bảng đạo hàm cơ bản và điều kiện sử dụng',
    conditions: 'Góc lượng giác tính bằng radian. Công thức áp dụng trên khoảng mà hàm và đạo hàm xác định; miền của hàm hợp phải được kiểm tra thêm.',
    definition: R`Các công thức dưới đây là đạo hàm theo biến trực tiếp $x$. Nếu thay $x$ bằng $u(x)$, phải nhân thêm $u'(x)$. Với $\alpha$ thực bất kỳ, công thức lũy thừa được bảo đảm trên $x>0$; các số mũ đặc biệt có thể có miền rộng hơn.`,
    content: R`### Lũy thừa và hàm mũ
$$\begin{array}{c|c|c}
f(x)&f'(x)&\text{domain}\\\hline
c&0&\mathbb R\\
x^\alpha&\alpha x^{\alpha-1}&x>0\\
\sqrt x&\frac{1}{2\sqrt x}&x>0\\
\frac{1}{x}&-\frac{1}{x^2}&x\ne0\\
e^x&e^x&\mathbb R\\
a^x&a^x\ln a&a>0,\ a\ne1
\end{array}$$
Hàm căn xác định tại 0 nhưng không có đạo hàm hữu hạn tại 0. Nếu $\alpha$ là số nguyên dương, $x^{\alpha }$ có đạo hàm trên toàn $\mathbb R$; không cần loại $x\le 0$ trong trường hợp đặc biệt ấy.

### Logarit và lượng giác
$$\begin{array}{c|c|c}
f(x)&f'(x)&\text{domain}\\\hline
\ln x&\frac{1}{x}&x>0\\
\log_a x&\frac{1}{x\ln a}&x>0,\ a>0,\ a\ne1\\
\sin x&\cos x&\mathbb R\\
\cos x&-\sin x&\mathbb R\\
\tan x&\frac{1}{\cos^2x}&\cos x\ne0\\
\cot x&-\frac{1}{\sin^2x}&\sin x\ne0
\end{array}$$
Trên mỗi khoảng mà $u\ne0$, đạo hàm của $\ln|u|$ là $\frac{u'}{u}$. Với $u<0$, biểu thức $\ln u$ không xác định trên $\mathbb{R}$; vì vậy không thay $\ln|u|$ bằng $\ln u$.

### Lượng giác ngược
$$\begin{array}{c|c|c}
f(x)&f'(x)&\text{domain}\\\hline
\arcsin x&\frac{1}{\sqrt{1-x^2}}&-1<x<1\\
\arccos x&-\frac{1}{\sqrt{1-x^2}}&-1<x<1\\
\arctan x&\frac{1}{1+x^2}&\mathbb R\\
\operatorname{arccot}x&-\frac{1}{1+x^2}&\mathbb R
\end{array}$$
Quy ước $\operatorname{arccot}x$ nhận giá trị trong $(0,\pi)$, nên đạo hàm âm. Các hàm ngược lượng giác không phải nghịch đảo nhân: $\arcsin x$ không bằng $\frac{1}{\sin x}$.

### Hàm ngược khác nghịch đảo của giá trị
Nếu $f$ khả vi và một-một trong lân cận của $x_0$, đạo hàm $f'$ liên tục gần $x_0$ và $f'(x_0)\ne0$, thì hàm ngược khả vi gần $y_0=f(x_0)$ và
$$(f^{-1})'(y_0)=\frac{1}{f'(x_0)}.$$
Hai đạo hàm được đánh giá tại hai điểm tương ứng $x_{0}$ và $y_{0}$. Vì $x_{0}=f^{-1}(y_{0})$, mẫu số phải là $f'(x_{0})$, không phải $f'(y_{0})$.`,
    workedExample: ex(R`Tính đạo hàm $y=\arctan(2x)$ và $z=\ln|x-1|$ tại các điểm hợp lệ.`, [R`Với $y$, hàm ngoài là $\arctan$, hàm trong là $2x$. Do đó $y'=\frac{2}{1+4x^{2}}$, xác định trên $\mathbb R$.`, R`Với $z$, điều kiện là $x\ne1$. Khi đó $z'=\frac{1}{x-1}$ trên mỗi khoảng $(-\infty,1)$ và $(1,+\infty)$.`, R`Tại $x=0$: $y'=2, z'=-1$. Biểu thức $\ln(x-1)$ không xác định tại $x=0$, còn $\ln|x-1|$ vẫn xác định.`], 'Kiểm tra miền của hàm ban đầu trước khi thế số vào công thức đạo hàm.'),
    recall: { front: 'Đạo hàm của $\\arctan u$ và $\\ln|u|$ cần công thức nào?', back: R`$(\arctan u)'=\frac{u'}{1+u^2}$; $(\ln|u|)'=\frac{u'}{u}$ trên khoảng $u\ne 0$. Cả hai đều cần đạo hàm trong $u'$.` },
    trap: { title: 'Bỏ miền trong công thức có căn ở mẫu', wrong: "$(\\sqrt x)'=\\frac{1}{2\\sqrt{x}}$ nên dùng được tại $x=0$.", right: "Công thức đạo hàm hữu hạn này cần $x>0$.", explanation: 'Miền xác định của hàm có thể rộng hơn miền xác định của đạo hàm.' },
  }],
  6: [{
    id: 'implicit-elasticity',
    title: 'Co giãn của quan hệ ẩn: chọn nhánh trước khi tính',
    scene: 'implicit-elasticity',
    conditions: R`$F(I,S)=0$ xác định cục bộ $S=S(I)$ khi $F_S\ne0$; cần $I,S\ne0$ để xác định co giãn.`,
    definition: R`Lấy đạo hàm ẩn rồi chuẩn hóa theo giá trị hai biến:
$$S'=-\frac{F_I}{F_S},\qquad
\varepsilon_{S,I}=\frac{I}{S}S'=-\frac{I F_I}{S F_S}.$$
Đánh giá các đạo hàm tại cùng một điểm trên nhánh nghiệm đã chọn.`,
    content: R`### Chọn nghiệm theo điều kiện của mô hình

Quan hệ $S^2+\frac{I^2}{4}=SI+I$ có thể cho nhiều mức tiết kiệm $S$ ứng với cùng một thu nhập $I$. Phương trình đại số liệt kê các nghiệm; điều kiện kinh tế chọn nghiệm có ý nghĩa. Chỉ sau khi chọn nhánh mới tính độ nhạy tại trạng thái cần xét.

### Bài toán tiết kiệm tại $I=16$

Đặt $F(I,S)=S^2+\frac{I^2}{4}-SI-I$. Thay $I=16$, ta được $S^2-16S+48=0$, nên $S=4$ hoặc $S=12$. Điều kiện $S\le0{,}3I$ cho $S\le4{,}8$, vì vậy nhánh hợp lệ đi qua $(I,S)=(16,4)$.

Tại điểm này, $F_I=\frac I2-S-1=3$ và $F_S=2S-I=-8\ne0$. Do đó
$$S'=-\frac{F_I}{F_S}=\frac38,\qquad
\varepsilon_{S,I}=\frac{16}{4}\cdot\frac38=\frac32.$$

Đạo hàm $S'=\frac38$ mô tả thay đổi tuyệt đối: một đơn vị thu nhập tăng thêm làm tiết kiệm tăng xấp xỉ $\frac38$ đơn vị tại điểm này. Hệ số co giãn $\frac32$ mô tả thay đổi tương đối: thu nhập tăng một phần trăm nhỏ thì tiết kiệm tăng xấp xỉ $1{,}5\%$.`,
    workedExample: ex(R`Cho $S^2+\frac{I^2}{4}=SI+I$ và điều kiện $S\le0{,}3I$. Tính $S'(16)$ và hệ số co giãn của $S$ theo $I$.`, [R`Thay $I=16$: $S^2-16S+48=0$, nên $S=4$ hoặc $S=12$. Điều kiện $S\le4{,}8$ chọn $S=4$.`, R`Với $F(I,S)=S^2+\frac{I^2}{4}-SI-I$, ta có $F_I=\frac I2-S-1=3$ và $F_S=2S-I=-8$.`, R`Đạo hàm ẩn: $S'=-\frac{F_I}{F_S}=-\frac{3}{-8}=\frac38$.`, R`Chuẩn hóa: $\varepsilon_{S,I}=\frac I S S'=\frac{16}{4}\cdot\frac38=\frac32$.`], 'Nhánh S = 12 thỏa phương trình đại số nhưng không thỏa điều kiện kinh tế; không dùng nhánh đó để kết luận.'),
    recall: { front: 'Vì sao phải chọn nhánh trước khi tính co giãn của quan hệ ẩn?', back: R`Các nhánh có thể cho giá trị $S$, đạo hàm $S'$ và tỉ số $I/S$ khác nhau. Chọn nhánh hợp lệ trước, rồi dùng $\varepsilon_{S,I}=\frac I S S'$.` },
    trap: { title: 'Dùng đạo hàm thay cho hệ số co giãn', wrong: R`$S'=\frac38$ nên thu nhập tăng $1\%$ thì tiết kiệm tăng $\frac38\%$.`, right: R`Nhân đạo hàm với $\frac I S$; tại điểm này $\varepsilon_{S,I}=\frac32$.`, explanation: 'Đạo hàm đo thay đổi tuyệt đối, còn co giãn đo thay đổi tương đối.' },
  }],
  7: [{
    id: 'partial-elasticity', title: 'Co giãn riêng và thay đổi đồng thời nhiều đầu vào', scene: 'partial-elasticity',
    conditions: "f khả vi tại điểm xét; $f(x,y)\\ne0$ và các biến dùng trong tỉ số phần trăm khác $0$. Với hàm lũy thừa, xét $x,y>0$.",
    definition: R`Với $z=f(x,y)$, hệ số co giãn riêng của $z$ theo từng biến là
$$\varepsilon_{z,x}=\frac{x f_x}{f},\qquad\varepsilon_{z,y}=\frac{y f_y}{f}.$$
Tại trạng thái $(x_0,y_0)$, với biến thiên nhỏ:
$$\frac{\Delta z}{z}\approx\varepsilon_{z,x}\frac{\Delta x}{x}+\varepsilon_{z,y}\frac{\Delta y}{y}.$$
Các đạo hàm và hệ số co giãn được tính tại trạng thái ban đầu.`,
    content: R`### Phản ứng riêng và phản ứng tổng
Hệ số $\varepsilon_{z,x}$ đo phản ứng của $z$ theo $x$ khi các đầu vào còn lại được giữ cố định. Nếu nhiều đầu vào cùng thay đổi, mỗi đầu vào tạo một đóng góp riêng; nhân từng tỉ lệ thay đổi với hệ số co giãn tương ứng rồi mới cộng có dấu.

### Từ bản chất đến công thức với hàm lũy thừa
Với $z=cx^{\alpha}y^{\beta}$ trên $x,y>0$, lấy logarit cho $\ln z=\ln c+\alpha\ln x+\beta\ln y$. Vi phân hai vế dẫn đến
$$\frac{dz}{z}=\alpha\frac{dx}{x}+\beta\frac{dy}{y},\qquad
\varepsilon_{z,x}=\alpha,\quad\varepsilon_{z,y}=\beta.$$
Hệ số $c$ quyết định mức đầu ra; hai số mũ quyết định co giãn riêng.

### Bù đắp khi đầu ra giữ nguyên
Muốn giữ đầu ra xấp xỉ không đổi, đặt $dz=0$. Khi $\beta\ne0$:
$$\frac{dy}{y}\approx-\frac{\alpha}{\beta}\frac{dx}{x}.$$
Đây là quan hệ bù đắp bậc nhất. Với thay đổi hữu hạn, quan hệ chính xác là
$$(1+r_x)^{\alpha}(1+r_y)^{\beta}=1,\qquad r_x=\frac{\Delta x}{x},\quad r_y=\frac{\Delta y}{y};$$
không thay đẳng thức hữu hạn bằng xấp xỉ vi phân.

### Ví dụ từ mức giá trị đến phần trăm
Với $R=36x^{2/3}y^{1/3}$ tại $(8,125)$, $R=720$, $R_x=60$ và $R_y=1{,}92$. Hai đạo hàm riêng có đơn vị khác nhau; chuẩn hóa cho $\varepsilon_{R,x}=\frac23$ và $\varepsilon_{R,y}=\frac13$. Chỉ các hệ số không đơn vị này cho phép so sánh phản ứng theo phần trăm.`,
    workedExample: ex(R`Cho $R=36x^{2/3}y^{1/3}$ tại $(8,125)$. Nếu $x$ tăng $6\%$ và $y$ giảm $3\%$, hãy ước lượng doanh thu mới bằng vi phân rồi đối chiếu với thay đổi hữu hạn chính xác.`, [R`Tại điểm gốc, $R_0=720$, $\varepsilon_{R,x}=\frac23$ và $\varepsilon_{R,y}=\frac13$.`, R`Ước lượng bậc nhất: $\frac{\Delta R}{R_0}\approx\frac23(0{,}06)+\frac13(-0{,}03)=0{,}03$.`, R`Suy ra $\Delta R\approx21{,}6$ và $R_{\text{new}}\approx741{,}6$.`, R`Vì $R$ là hàm lũy thừa, thay đổi hữu hạn chính xác là $R_{\text{new}}=720(1{,}06)^{2/3}(0{,}97)^{1/3}\approx740{,}96$. Sai khác xuất hiện vì vi phân chỉ giữ các hạng bậc nhất.`], 'Nếu cần giữ doanh thu gần như không đổi, mức giảm của y phải bù cho mức tăng của x theo trọng số 2/3 và 1/3; không cộng trực tiếp hai phần trăm đầu vào.'),
    recall: { front: "Hàm $z=cx^{\\alpha}y^{\\beta}$ phản ứng thế nào khi cả hai đầu vào thay đổi nhỏ?", back: R`$\frac{\Delta z}{z}\approx\alpha\frac{\Delta x}{x}+\beta\frac{\Delta y}{y}$. Hai số mũ là co giãn riêng, không phải đạo hàm riêng.` },
    trap: { title: 'Cộng hai phần trăm đầu vào không có trọng số', wrong: 'Nếu $x$ tăng $6\\%$ và $y$ giảm $3\\%$, thì $z$ luôn tăng $3\\%$.', right: 'Nhân từng thay đổi tương đối với co giãn riêng tương ứng rồi mới cộng.', explanation: 'Mỗi đầu vào có một mức tác động riêng; kết quả phụ thuộc hàm số và trạng thái.' },
  }],
  8: [{
    id: 'degenerate-extrema', title: 'Khi tiêu chuẩn Hessian không kết luận', scene: 'degenerate-extrema',
    conditions: "Điểm đang xét là điểm dừng và $D=0$. Cần chứng minh trực tiếp dấu của $f-f_{0}$ trong một lân cận.",
    definition: R`$D=0$ không xác định loại điểm dừng. Xét trực tiếp hiệu $f(x,y)-f(x_0,y_0)$: dương với mọi điểm đủ gần khác điểm gốc cho cực tiểu chặt; âm cho cực đại chặt; có cả hai dấu tùy điểm gần cho yên ngựa.`,
    content: R`### Cùng một Hessian, ba kết luận khác nhau
Tại (0,0), cả $x^{4}+y^{4}, -x^{4}-y^{4}$ và $x^{4}-y^{4}$ đều có Hessian bằng 0. Tuy nhiên, hàm thứ nhất không âm và chỉ bằng 0 tại gốc; hàm thứ hai không dương; hàm thứ ba dương trên trục x và âm trên trục y. Vì vậy một bảng dấu Hessian không thể thay thế việc xét hàm khi $D=0$.

### Thế nào là một phép kiểm tra đủ?
Tìm được hai họ điểm tiến về gốc với hiệu trái dấu đủ chứng minh yên ngựa. Ngược lại, kiểm tra vài đường và thấy hiệu dương không đủ chứng minh cực tiểu: còn vô số hướng và đường cong chưa xét. Muốn chứng minh cực tiểu cần bất đẳng thức hoặc một lập luận bao quát cả lân cận.

### Nhận diện địa phương và toàn cục
Với $x^{4}+y^{4}$, bất đẳng thức không âm đúng trên toàn mặt phẳng nên kết luận còn là tối thiểu toàn cục duy nhất. Với bài tổng quát, không được tự mở rộng kết luận ra ngoài miền đã chứng minh.`,
    workedExample: ex(R`Phân loại gốc của $f=x^{4}+y^{4}$ và $g=x^{4}-y^{4}$ mà không dùng tiêu chuẩn $D\ne 0$.`, [R`Tại gốc, cả hai gradient và Hessian đều bằng 0; tiêu chuẩn Hessian không kết luận.`, R`$f\ge 0$ và $f=0$ chỉ khi $x=y=0$. Do đó gốc là cực tiểu chặt, đồng thời là tối thiểu toàn cục duy nhất.`, R`$g(t,0)=t^{4}>0$ và $g(0,t)=-t^{4}<0$ với mọi $t\ne 0$. Hai dãy điểm tiến về gốc cho hai dấu khác nhau.`, R`Gốc của g là yên ngựa. Không có quy tắc $D=0$ thì không có cực trị.`], 'Bằng chứng xét dấu ở đây quyết định kết luận; animation chỉ giúp theo dõi hai đường kiểm tra.'),
    recall: { front: "$D=0$ có loại được cực trị không?", back: 'Không. Có thể có cực tiểu, cực đại hoặc yên ngựa; phải dùng dấu của hàm hoặc lập luận khác.' },
    trap: { title: 'Coi hai đường cùng dấu là chứng minh cực tiểu', wrong: 'Hàm dương trên hai trục nên chắc chắn có cực tiểu.', right: 'Cần kiểm soát mọi điểm trong một lân cận, không chỉ hai trục.', explanation: 'Hai đường trái dấu đủ bác bỏ cực trị; vài đường cùng dấu chưa đủ khẳng định.' },
  }],
  9: [{
    id: 'budget-constraint', title: 'Đọc đúng ràng buộc: ngân sách bằng hay không vượt mức', scene: 'budget-constraint',
    conditions: "$x,y\\ge 0$. Phải giữ đúng dấu $=$ hoặc $\\le$ trong phát biểu; Lagrange đẳng thức chỉ giải bài toán trên đường ràng buộc.",
    definition: R`Hai miền $x+2y=120$ và $x+2y\le120$ khác nhau. Miền thứ nhất chỉ gồm một đoạn thẳng; miền thứ hai là cả tam giác. Một nghiệm tối ưu trong tam giác không bắt buộc dùng hết ngân sách.`,
    content: R`### Kiểm tra điều kiện trước khi lập hàm Lagrange
Nếu đề yêu cầu dùng hết ngân sách, tối ưu trên đường $x+2y=120$. Nếu ngân sách chỉ là mức tối đa, trước hết tìm điểm dừng tự do trong miền rồi khảo sát biên khi cần. Không được tự thêm giả thiết rằng mọi khoản chi tăng đều làm lợi nhuận tăng.

### Ví dụ so sánh từ lời giải K51
Cho $\pi=120x+240y-x^2-2xy-3y^2$. Trên đường dùng hết ngân sách, $x=120-2y, 0\le y\le 60$. Thay vào:
$$\pi=4800-3(y-40)^2\le4800.$$
Điểm (40,40) thỏa ràng buộc và đạt dấu bằng nên là tối đa toàn cục **trên đường**. Lagrange cho cùng ứng viên, còn bất đẳng thức này xác nhận tính toàn cục.

### Miền ngân sách tối đa
Hệ dừng tự do là $x+y=60, x+3y=120$, cho (30,30). Điểm này dùng ngân sách $90<120$ và thuộc tam giác. Mặt khác:
$$\pi=5400-(x+y-60)^2-2(y-30)^2\le5400.$$
Dấu bằng duy nhất tại (30,30) nên đây là tối đa toàn cục trên miền bất đẳng thức. Ép sử dụng hết ngân sách sẽ làm giảm giá trị từ 5400 xuống 4800 trong ví dụ này.

### Vai trò của Hessian biên
Hessian biên phân loại tại điểm dừng chính quy của bài toán đẳng thức. Nó không thay đổi miền khả thi, cũng không cho phép thay dấu $\le$ bằng dấu $=$. Việc đọc đúng giả thiết đi trước mọi công thức phân loại.`,
    workedExample: ex("Với $\\pi$ đã cho, so sánh hai phối hợp (40,40) và (30,30) theo ngân sách và lợi nhuận.", [R`(40,40) chi $40+2\cdot 40=120; \pi =4800$.`, R`(30,30) chi $30+2\cdot 30=90; \pi =5400$.`, R`Nếu phải chi đúng 120, (30,30) không hợp lệ. Nếu được chi tối đa 120, cả hai hợp lệ và (30,30) tốt hơn.`, R`Hai dạng hoàn thành bình phương ở trên chứng minh từng kết luận tối đa, không chỉ so sánh riêng hai điểm.`], 'Không suy ra toàn cục chỉ bằng so sánh hai ứng viên; cần lập luận bao quát miền như các bất đẳng thức đã ghi.'),
    recall: { front: 'Vì sao nghiệm Lagrange với ngân sách bằng chưa giải xong bài toán ngân sách tối đa?', back: 'Miền bất đẳng thức còn có nội miền. Điểm dừng tự do khả thi có thể cho giá trị tốt hơn các điểm trên đường ngân sách.' },
    trap: { title: 'Mặc định chi hết luôn tốt hơn', wrong: 'Ngân sách tối đa M thì cứ lập ràng buộc bằng M.', right: 'Phải kiểm tra tối ưu nội miền trước hoặc chứng minh ngân sách phải dùng hết.', explanation: 'Lợi nhuận có thể giảm khi tăng đầu vào vượt mức tối ưu.' },
  }],
};

export function reviewCalculus(chapter, foundation) {
  if (chapter < 5) return foundation;
  let sections = foundation.sections.map(section => ({ ...section, ...revisions[`${chapter}/${section.id}`] }));
  // The implicit case has its own argument and scene; remove its former duplicated appendix.
  if (chapter === 6) sections = sections.map(section => section.id === 'section-3' ? { ...section, content: revisions['6/section-3'].content } : section);
  if (chapter === 10) sections = sections.map(section => section.id === 'section-5' ? { ...section, content: revisions['10/section-5'].content } : section);
  if (chapter === 9) sections = sections.map(section => section.id === 'section-1' ? { ...section, content: section.content.split('### Dùng hết ngân sách')[0] } : section);
  if (chapter === 5) sections = sections.map(section => ({ ...section, ...chapter5Overrides[section.id] }));
  sections.push(...(extras[chapter] || []));
  if (chapter === 5) {
    const table = sections.pop();
    sections.splice(1, 0, table);
  }
  if (chapter === 7) {
    const elasticity = sections.pop();
    sections.splice(sections.findIndex(s => s.id === 'section-3'), 0, elasticity);
  }
  sections = sections.filter((section, index, all) => all.findIndex(item => item.id === section.id) === index);
  const editorial = chapterEditorial[String(chapter)];
  if (editorial) {
    const removed = new Set(editorial.removed || []);
    sections = sections
      .filter(section => !removed.has(section.id))
      .map(section => ({ ...section, ...(editorial.sections?.[section.id] || {}) }));
    if (editorial.order) {
      const byId = new Map(sections.map(section => [section.id, section]));
      sections = editorial.order.map(id => byId.get(id)).filter(Boolean);
    }
  }
  return { ...foundation, ...(chapter === 5 ? { summary: 'Chương này đi từ thương sai phân đến hệ số góc tiếp tuyến, hệ thống hóa các quy tắc đạo hàm, rồi áp dụng quy tắc dây chuyền cho hàm hợp và hàm ẩn. Vi phân cấp một là mô hình tuyến tính của mức thay đổi khi bước dịch chuyển nhỏ.', objectives: ['Tính đạo hàm tại điểm từ định nghĩa và giải thích ý nghĩa hình học, tốc độ tức thời.', 'Chọn đúng quy tắc tính, miền xác định và thứ tự các tầng phụ thuộc.', 'Lập đạo hàm của quan hệ ẩn sau khi xác định đúng điểm trên đường cong.', 'Phân biệt $\\Delta y$ với $dy$ và dùng xấp xỉ tuyến tính có điều kiện.'] } : {}), ...(editorial?.summary ? { summary: editorial.summary } : {}), ...(editorial?.objectives ? { objectives: editorial.objectives } : {}), sections };
}
