const R = String.raw;
const ex = (question, steps, casioTip) => ({ question, steps, casioTip });
// Source locators refer to physical PDF pages, not the printed page number.
const sources = {
  1: ["Ghi chép Buổi 1 · trang 1–10", 'Slide LXT · lecture01 và lecture02', 'TUD_v2.pdf · trang 3–10'],
  2: ["Ghi chép Buổi 2 · trang 1–10; Buổi 5 · trang 1–12", 'Slide LXT · lecture03 và lecture04', 'TUD_v2.pdf · trang 10–12'],
  3: ["Ghi chép Buổi 2–4 · hệ phương trình và biện luận", 'Slide LXT · lecture05', 'main.pdf · trang 222–223: hai cách giải hệ tham số'],
  4: ["Ghi chép Buổi 7 · trang 1–10", 'Slide LXT · lecture06', 'main.pdf · trang 198–200: cân đối và cải tiến kỹ thuật'],
  5: ['Ghi chép Buổi 8 · trang 2–3, 6–7: quy tắc hàm hợp và đạo hàm hàm ẩn', 'Slide LXT · lecture07', 'TUD_v2.pdf · trang 19–20, 26–27', 'OpenStax, Calculus Volume 1 · §§ 3.1, 3.3, 3.6, 3.8, 4.2'],
  6: ["Ghi chép Buổi 8 · trang 5: đại lượng biên và hệ số co giãn", 'TUD_v2.pdf · trang 36: bài tập hệ số co giãn', 'main.pdf · trang 40–41: hệ số co giãn của hàm ẩn'],
  7: ['Ghi chép Buổi 8 · đạo hàm riêng, hàm nhiều biến và quy tắc dây chuyền', 'Slide LXT · lecture08, trang 3–13', 'TUD_v2.pdf · trang 25–27, 31', 'main.pdf · trang 177–179, 185–186, 190–191', 'OpenStax, Calculus Volume 3 · §§ 4.3–4.5'],
  8: ['Slide LXT · lecture07, trang 10–13: bảng biến thiên, tiêu chuẩn đạo hàm cấp hai và tính lồi', 'Slide LXT · lecture08, trang 14–16: cực trị hai biến và Hessian', 'TUD_v2.pdf · trang 28–30', 'main.pdf · trang 188: bài K51 phân loại bốn điểm dừng'],
  9: ['Slide LXT · lecture08, trang 17–21: Lagrange và Hessian biên', 'TUD_v2.pdf · trang 29–30: điều kiện dừng và tối thiểu chi phí', 'main.pdf · trang 57–59: lập luận bằng hàm ẩn', 'main.pdf · trang 196–197, 223–224: kiểm tra toàn cục'],
  10: ["Ghi chép Buổi 9–10 · phương trình vi phân cấp một", 'Slide LXT · slides-lec9_Vie; công thức tích phân từng phần', 'TUD_v2.pdf · trang 32–34: tăng trưởng và Solow', 'main.pdf · trang 194, 220–221: tuyến tính và tăng trưởng giới hạn'],
};
const additions = {
  'chuyen-de-1': [{
    id: 'matrix-scalar', title: 'Nhân ma trận với một số: tác động lên từng phần tử', scene: 'scalar',
    conditions: "Ma trận $A\\in\\mathbb{R}^{m\\times n}$ và $k\\in\\mathbb{R}$. Không cần $A$ vuông để định nghĩa $kA$.",
    definition: R`Nhân ma trận với số $k$ là nhân **mọi phần tử** với cùng số ấy:
$$kA=(ka_{ij})_{m\times n}.$$
Kích thước không đổi. Đây là phép nhân vô hướng với ma trận, khác phép nhân hai ma trận.`,
    content: R`### Cấu trúc và ý nghĩa
Mỗi phần tử giữ nguyên địa chỉ $(i,j)$; chỉ giá trị thay đổi. Khi $k=0$, kết quả là ma trận không (mọi phần tử đều bằng $0$) cùng kích thước với $A$; khi $k=-1$, mọi phần tử đổi dấu. Vì thế $A-B=A+(-1)B$.

### Các quy tắc đại số
$$k(A+B)=kA+kB,\quad(k+\ell)A=kA+\ell A,\quad k(\ell A)=(k\ell)A.$$
Những đẳng thức này được kiểm tra ở từng vị trí. Chẳng hạn phần tử $(i,j)$ của hai vế đẳng thức đầu đều là $k(a_{ij}+b_{ij})$.

### Phân biệt hai loại hệ số
Nếu chỉ nhân **một dòng** của ma trận vuông với $k$, định thức nhân $k$. Nếu nhân **cả ma trận cấp n**, tất cả n dòng đều nhận hệ số nên $|kA|=k^n|A|$. Đừng đưa quy tắc định thức vào định nghĩa kA: ma trận chữ nhật vẫn nhân vô hướng bình thường.`,
    workedExample: ex(R`Cho $A=\begin{pmatrix}1&-2&0\\3&4&-1\end{pmatrix}$. Tính −2A.`, [R`Giữ nguyên bố trí hai dòng, ba cột.`, R`Nhân lần lượt từng ô với −2: dòng đầu là $(-2,4,0)$; dòng sau là $(-6,-8,2)$.`, R`$-2A=\begin{pmatrix}-2&4&0\\-6&-8&2\end{pmatrix}$.`], 'Có sáu phần tử nên cả sáu ô đều phải nhận hệ số; số 0 vẫn bằng 0.'),
    recall: { front: R`Nhân $kA$ có làm thay đổi kích thước hoặc vị trí phần tử không?`, back: R`Không. $(kA)_{ij}=ka_{ij}$, vẫn m dòng, n cột. Mọi phần tử đều được nhân, không chỉ một dòng hoặc đường chéo.` },
    trap: { title: 'Chỉ nhân các phần tử trên đường chéo', wrong: "kA chỉ thay đổi $a_{11},a_{22}$,…", right: "Mọi $a_{ij}$ đều trở thành $ka_{ij}$.", explanation: 'Nhân vô hướng được định nghĩa trên từng phần tử của toàn ma trận.' },
  }],
  'chuyen-de-3': [{
    id: 'homogeneous', title: 'Hệ thuần nhất và cấu trúc tập nghiệm', scene: 'homogeneous',
    conditions: "A có m dòng, n cột; $B = 0$. Các kết luận về số tham số dùng hạng r của A.",
    definition: R`Hệ $AX=0$ gọi là hệ tuyến tính thuần nhất. Nó luôn có nghiệm $X=0$ (nghiệm tầm thường).
Số ẩn tự do bằng số ẩn trừ hạng của A.
Hệ có nghiệm khác 0 khi và chỉ khi $r(A)<n$. Nếu A vuông, điều này tương đương $|A|=0$.`,
    content: R`### Vì sao đếm được $n - r$ tham số?
Sau khử Gauss có r cột trụ. Chọn $n-r$ ẩn còn lại làm ẩn tự do; các ẩn trụ được biểu diễn tuyến tính theo chúng. Không có dòng mâu thuẫn vì mọi vế phải vẫn bằng 0. Đặc biệt, hệ m phương trình, n ẩn với $m<n$ luôn có nghiệm không tầm thường.

### Hai loại tập nghiệm liên hệ thế nào?
Nếu $X_p$ là một nghiệm của $AX=B$, thì mọi nghiệm có dạng
$$X=X_p+X_h,\qquad AX_h=0.$$
Thật vậy, $A(X-X_p)=B-B=0$; chiều ngược lại cũng đúng. Hệ không thuần nhất có nghiệm tạo một tập affine, không nhất thiết đi qua gốc. Hệ thuần nhất có tập nghiệm là không gian vectơ, đóng với cộng và nhân vô hướng.

### Kết hợp các nghiệm
Nếu $X_{1},X_{2}$ giải cùng hệ không thuần nhất, $X_{1}-X_{2}$ giải hệ thuần nhất. Tổ hợp $\alpha X_1+\beta X_2$ chắc chắn vẫn giải $AX=B$ khi $\alpha+\beta=1$. Với $B=0$, không cần điều kiện này.`,
    workedExample: ex(R`Giải hệ $x+y+z=0,\ 2x+2y+2z=0$. Sau đó mô tả nghiệm khi vế phải lần lượt là 3 và 6.`, [R`Hạng A bằng 1; có $3-1=2$ ẩn tự do. Đặt $y=s,z=t$.`, R`Hệ thuần nhất: $X=(-s-t,s,t)^T=s(-1,1,0)^T+t(-1,0,1)^T$.`, R`Hệ vế phải (3,6) có nghiệm riêng (3,0,0). Tập nghiệm là $(3-s-t,s,t)^T$.`], 'Nghiệm hệ thuần nhất đi qua gốc; tập nghiệm hệ sau được tịnh tiến, không được gọi là không gian vectơ.'),
    recall: { front: R`Từ hai nghiệm $X_1,X_2$ của $AX=B$, vì sao $X_1-X_2$ giải hệ thuần nhất?`, back: R`Do tính tuyến tính: $A(X_1-X_2)=AX_1-AX_2=B-B=0$. Mọi nghiệm không thuần nhất là một nghiệm riêng cộng một nghiệm thuần nhất.` },
    trap: { title: 'Hệ thuần nhất có thể vô nghiệm', wrong: "$\\det  A=0$ khiến $AX=0$ vô nghiệm.", right: "$AX=0$ luôn có $X=0$; suy biến làm xuất hiện thêm nghiệm khác 0 khi A vuông.", explanation: 'Vế phải bằng 0 bảo đảm tính tương thích.' },
  }, {
    id: 'exam-methods', title: 'Biện luận tự luận và kiểm tra trắc nghiệm', scene: 'parameter-cases',
    conditions: "Tiêu chuẩn định thức áp dụng cho hệ vuông. Tại mọi giá trị làm $\\det  A = 0$, phải xét lại tính tương thích.",
    definition: R`Với hệ vuông phụ thuộc m: $|A(m)|\ne0$ cho nghiệm duy nhất. Tại các nghiệm của $|A(m)|=0$, so sánh $r(A)$ với $r(\bar A)$.
Gọi S là tập giá trị cho hệ có nghiệm, $S_{1}$ cho nghiệm duy nhất, $S\infty$ cho vô số nghiệm. Khi đó $S=S_1\cup S_\infty$.
Không được chia cho biểu thức chứa m trước khi tách trường hợp nó bằng 0.`,
    content: R`### Tự luận: hai quy trình hoàn chỉnh
Cách thứ nhất tính |A|, tìm các giá trị ngoại lệ, thay từng giá trị vào ma trận mở rộng rồi khử và kết luận bằng hạng. Cách thứ hai khử ngay từ đầu bằng những phép không làm mất trường hợp tham số, sau đó tách theo các phần tử trụ. Cả hai cách phải nêu nghiệm hoặc số tham số khi đề yêu cầu giải hệ.

### Trắc nghiệm: kiểm tra để loại, lập luận để kết luận
Máy tính có thể giải hệ số cụ thể tại từng giá trị ngoại lệ. Tuy nhiên, thử vài m không chứng minh mệnh đề “với mọi m”. Một phản ví dụ đủ bác bỏ mệnh đề phổ quát; một giá trị phù hợp đủ chứng minh mệnh đề tồn tại. Muốn chọn công thức đúng với mọi m, vẫn cần phép biến đổi hoặc kiểm tra bao quát toàn bộ các trường hợp.

### Năm câu hỏi khác nhau
“Duy nhất”, “không duy nhất”, “vô số”, “vô nghiệm”, “có nghiệm” là năm tập điều kiện khác nhau. Với hệ vuông, $|A|=0$ chỉ cho **không có nghiệm duy nhất**, chưa phân biệt vô số và vô nghiệm. Nhiều giá trị ngoại lệ có thể cùng cho vô nghiệm hoặc cùng cho vô số; không có quy tắc bắt buộc mỗi loại một giá trị.`,
    workedExample: ex(R`Xét $x+3y+2z=-1,\ 2x+4y+mz=2,\ x+my-z=3$ theo Buổi 3.`, [R`Sau $d_2\leftarrow d_2-2d_1$, $d_3\leftarrow d_3-d_1$, hai dòng dưới là $(0,-2,m-4|4)$ và $(0,m-3,-3|4)$.`, R`Dùng $d_3\leftarrow2d_3+(m-3)d_2$ (hệ số của dòng cũ luôn là $2\ne 0$). Dòng cuối: $(0,0,(m-1)(m-6)|4(m-1))$.`, R`$m=1$: hạng chung 2, nghiệm $(5+5t/2,-2-3t/2,t)$. $m=6$: dòng cuối $0=20$, vô nghiệm.`, R`$m\ne 1,6$: $z=y=4/(m-6)$ và $x=-(m+14)/(m-6)$.`], "Không cần tách riêng $m=3$: phép tổ hợp sử dụng hệ số 2 của dòng nhận, không chia cho $m-3$."),
    recall: { front: "$\\det  A(m)=0$ cho biết chính xác điều gì về hệ vuông?", back: 'Hệ không có nghiệm duy nhất. Phải xét hạng mở rộng để phân biệt vô nghiệm và vô số nghiệm; không thể suy ra một trong hai chỉ từ định thức.' },
    trap: { title: 'Thử một m rồi kết luận mọi m', wrong: "$m=0$ có nghiệm nên hệ luôn có nghiệm.", right: 'Phải kiểm tra toàn bộ các giá trị ngoại lệ và trường hợp tổng quát.', explanation: 'Mệnh đề tồn tại và mệnh đề với mọi có yêu cầu chứng minh khác nhau.' },
  }],
  'chuyen-de-4': [{
    id: 'io-flows', title: 'Một ngành cung cấp, nhiều ngành nhận và bài toán ngược', scene: 'io-flows',
    conditions: "Dùng cùng đơn vị giá trị; $X_{j} > 0$ khi suy ngược từ giao dịch. Các hệ số kỹ thuật đang xét cố định.",
    definition: R`Ký hiệu giao dịch $x_{ij}=a_{ij}X_j$ phân biệt với sản lượng $X_j$:
$$\underbrace{\sum_{j\in J}a_{ij}X_j}_{\text{ngành i cung cho nhóm J}},\qquad
\underbrace{X_j\sum_{i\in I}a_{ij}}_{\text{nhóm I cung cho ngành j}}.$$
Chỉ trong cùng một cột j mới đặt $X_{j}$ làm nhân tử chung.`,
    content: R`### Từ một giao dịch đến sản lượng ngành nhận
Biết $x_{ij}$ và $a_{ij}>0$ thì $X_j=\frac{x_{ij}}{a_{ij}}$. Sau đó tính giao dịch khác vào cùng ngành j bằng $x_{kj}=a_{kj}X_j$. Tỉ số $\frac{x_{kj}}{x_{ij}}=\frac{a_{kj}}{a_{ij}}$ là hệ quả của chung $X_{j}$, không phải quy tắc áp dụng cho hai ô bất kỳ.

### Cung cho hai hoặc ba ngành
Ngành 1 cung cho ngành 2 và 3 lượng $a_{12}X_2+a_{13}X_3$. Nếu cung cho cả ba, thêm $a_{11}X_1$ — phần tự sử dụng cũng là nhu cầu trung gian. Không lấy $(a_{12}+a_{13})X_1$ vì hai hệ số nhân hai sản lượng nhận khác nhau.

### Nguyên liệu đầu vào của một ngành
Các ngành 1,2 cung cho ngành 3 lượng $(a_{13}+a_{23})X_3$; cả ba ngành cung cho ngành 3 lượng $(a_{13}+a_{23}+a_{33})X_3$. Đây là tổng theo cột, khác tổng bán theo dòng.`,
    workedExample: ex(R`Với $A=\begin{pmatrix}.1&.4&.2\\.3&.2&.1\\.2&.1&.3\end{pmatrix}$, $X=(210,180,200)^T$, tính ba loại giao dịch.`, [R`Ngành 1 cung cho 2 và 3: $.4\cdot180+.2\cdot200=112$.`, R`Ngành 2 cung cả ba: $.3\cdot210+.2\cdot180+.1\cdot200=119$.`, R`Cả ba cung cho ngành 3: $(0{,}2+0{,}1+0{,}3)\\cdot200=120$.`, R`Nếu chỉ biết $x_{13}=40$, suy ra $X_3=\frac{40}{0{,}2}=200$, rồi $x_{23}=.1\cdot200=20$.`], 'Ghi rõ cung → nhận trước khi chọn dòng/cột; mỗi tích dùng sản lượng ngành nhận.'),
    recall: { front: R`Ngành 1 cung cho ngành 2 và 3 có lượng giao dịch nào?`, back: R`$a_{12}X_2+a_{13}X_3$. Hai ngành nhận có sản lượng khác nhau, nên không gom hệ số rồi nhân $X_{1}$.` },
    trap: { title: 'Dùng sản lượng ngành cung cấp', wrong: "$x_{12}=a_{12}X_{1}$.", right: "$x_{12}=a_{12}X_{2}$.", explanation: 'Hệ số là đầu vào trên một đơn vị sản lượng ngành nhận.' },
  }, {
    id: 'io-technology', title: 'Cải tiến kỹ thuật và mô hình cân đối mới', scene: 'io-technology',
    conditions: 'Nêu rõ ngành nhận tiết kiệm loại đầu vào nào, tỷ lệ giảm và nhu cầu cuối giữ nguyên hay thay đổi.',
    definition: R`Ngành j tiết kiệm tỷ lệ s đầu vào từ ngành i nghĩa là
$$a'_{ij}=(1-s)a_{ij},\qquad0\le s\le1.$$
Lập $A'$ rồi giải $(I-A')X'=D'$. Nếu D không đổi, không được giữ X cũ vì quan hệ liên ngành đã thay đổi.`,
    content: R`### Chọn đúng ô trước khi tính
“Ngành 1 tiết kiệm nguyên liệu từ ngành 2” tác động dòng 2, cột 1, tức $a_{21}$. “Tiết kiệm một phần ba” là còn hai phần ba hệ số cũ; “còn một phần ba” là một dữ kiện khác.

### Đối chiếu hai trạng thái
Với D giữ nguyên, trừ hai hệ cho
$$ (I-A')(X'-X)=(A'-A)X.$$
Đây là đẳng thức chính xác, dùng nghịch đảo **mới** nếu giải biến thiên. Công thức cũ $\Delta X=(I-A)^{-1}\Delta D$ chỉ dùng khi A không đổi.

### Phạm vi diễn giải
Trong mô hình sản xuất có nghịch đảo Leontief không âm, tiết kiệm đầu vào có thể giảm sản lượng cần thiết để đáp ứng cùng D. Kết quả không đồng nghĩa nhu cầu cuối giảm, cũng không tự là dự báo về lao động hoặc giá cả.`,
    workedExample: ex(R`Cho $A=\begin{pmatrix}.1&.2&.2\\.3&.2&.1\\.2&.3&.3\end{pmatrix}$ và $D=(113,61,44)^{T}$. Ngành 1 tiết kiệm $\frac{1}{3}$ đầu vào từ ngành 2.`, [R`Trạng thái đầu giải $(I-A)X=D$ cho $X=(210,180,200)^{T}$.`, R`Sửa $a_{21}=.3$ thành $0{,}3(1-\frac{1}{3})=0{,}2$; giữ mọi ô khác và D.`, R`$X'=\frac1{401}(80010,59790,73690)^T\approx(199.53,149.10,183.77)^T$.`, R`Thế vào ma trận mới: $.9X'_1-.2X'_2-.2X'_3=113$, và hai dòng còn lại lần lượt bằng 61,44.`], "Không sửa $a_{12}$. Không chỉ lấy $X_{2}$ giảm một phần ba: tất cả sản lượng được xác định lại đồng thời."),
    recall: { front: "Ngành 1 giảm $1/3$ nguyên liệu mua từ ngành 2: sửa ô nào và sửa thế nào?", back: R`Sửa $a_{21}$ thành $(2/3)a_{21}$. Sau đó giải lại $(I-A')X'=D$ nếu nhu cầu cuối giữ nguyên.` },
    trap: { title: 'Công nghệ đổi nhưng vẫn giữ nghịch đảo cũ', wrong: 'Chỉ trừ phần tiết kiệm khỏi một sản lượng.', right: 'Sửa hệ số đầu vào rồi giải hệ cân đối mới.', explanation: 'Thay một đầu vào tạo tác động qua toàn bộ mạng liên ngành.' },
  }],
  'chuyen-de-7': [{
    id: 'multivariable-chain', title: 'Quy tắc dây chuyền với nhiều đường phụ thuộc', scene: 'multichain',
    conditions: 'Hàm ngoài khả vi tại các giá trị trung gian và từng hàm trong khả vi tại điểm xét. Tính các đạo hàm riêng của hàm ngoài tại đúng trạng thái trung gian.',
    definition: R`Nếu $z=f(u,v)$, $u=u(t)$ và $v=v(t)$ thì
$$\frac{dz}{dt}=f_u(u(t),v(t))\frac{du}{dt}+f_v(u(t),v(t))\frac{dv}{dt}.$$
Nếu $u=u(x,y)$ và $v=v(x,y)$ thì
$$z_x=f_u u_x+f_v v_x,\qquad z_y=f_u u_y+f_v v_y.$$
Mỗi đường phụ thuộc tạo một tích; cộng tất cả các tích để được tốc độ tổng.`,
    content: R`### Từ một đường đến nhiều đường
Trong hàm hợp một biến $f(g(x))$, đầu vào $x$ tác động đến kết quả qua biến trung gian $g(x)$. Với $z=f(u(t),v(t))$, $t$ tác động đồng thời qua $u$ và $v$. Nhân tốc độ của mỗi biến trung gian với đạo hàm riêng tương ứng của hàm ngoài, rồi cộng các đóng góp. Đây là quy tắc dây chuyền (chain rule), không phải chọn một trong hai đường phụ thuộc.

### Đạo hàm riêng và đạo hàm toàn phần
Đạo hàm riêng $f_u$ giữ $v$ cố định; $dz/dt$ cho phép cả $u,v$ thay đổi theo $t$. Hai ký hiệu mô tả hai quá trình khác nhau. Nếu $z=F(t,u(t),v(t))$ còn phụ thuộc trực tiếp vào $t$, công thức đầy đủ là
$$\frac{dz}{dt}=F_t+F_u\frac{du}{dt}+F_v\frac{dv}{dt}.$$

### Trường hợp chỉ biết $f'$ tại một điểm
Với $Q=f(K+3\sqrt L)$ và $f'(4)=1$, tại $K=L=1$ đối số bằng $4$. Quy tắc dây chuyền cho
$$Q_L=f'(K+3\sqrt L)\frac{3}{2\sqrt L}=\frac32.$$
Dữ kiện về $f'(4)$ chỉ xác định tốc độ tại trạng thái ban đầu. Khi $L$ đổi một lượng hữu hạn, không thể suy ra chính xác $Q$ mới nếu chưa biết thêm về hàm $f$; chỉ có thể lập xấp xỉ bậc nhất.`,
    workedExample: ex(R`Cho $z=u^{2}+uv, u=t^{2}, v=3t$. Tính $dz/dt$ tại $t=1$ theo hai cách.`, [R`$f_u=2u+v$, $f_v=u$; tại $t=1$ có $u=1,v=3, u'=2,v'=3$.`, R`$z'=5\cdot2+1\cdot3=13$.`, R`Thế trước: $z=t^{4}+3t^{3}$ nên $z'=4t^{3}+9t^{2}$; tại $t=1$ cũng bằng 13.`], 'Đóng góp qua u bằng 10, qua v bằng 3. Phải cộng cả hai đường.'),
    recall: { front: R`$z=f(u(t),v(t))$: mỗi đường phụ thuộc đóng góp gì?`, back: R`Đường $t\to u\to z$ đóng góp $f_u u'$; đường $t\to v\to z$ đóng góp $f_v v'$. Tổng là $\frac{dz}{dt}$. Mọi đạo hàm được đánh giá tại cùng trạng thái.` },
    trap: { title: 'Chỉ tính một đường phụ thuộc', wrong: "$dz/dt=f_uu'$ dù v cũng phụ thuộc t.", right: "$dz/dt=f_uu'+f_vv'$.", explanation: 'Sự thay đổi của cả hai biến trung gian đều ảnh hưởng kết quả.' },
  }],
  'chuyen-de-8': [{
    id: 'one-variable-extrema', title: 'Cực trị một biến: bảng biến thiên và tiêu chuẩn đạo hàm', scene: 'sign-chart',
    conditions: "Dùng định lý Fermat tại điểm trong miền trong mà hàm khả vi. Khi tìm giá trị lớn nhất, nhỏ nhất trên đoạn, phải xét cả hai đầu mút.",
    definition: R`Điểm $x_0$ là cực tiểu địa phương nếu tồn tại $\delta>0$ sao cho $f(x_0)\le f(x)$ với mọi $x$ trong miền xác định thỏa $|x-x_0|<\delta$; cực đại địa phương được định nghĩa bằng dấu bất đẳng thức ngược lại. Cực trị toàn cục so sánh $f(x_0)$ với mọi điểm của miền.

Nếu $x_0$ là điểm trong miền và $f$ khả vi tại đó, định lý Fermat cho điều kiện cần $f'(x_0)=0$. Những điểm trong miền mà $f'=0$ hoặc $f'$ không tồn tại là các ứng viên; đầu mút được xét riêng. Điều kiện cần chưa phân loại được ứng viên.`,
    content: R`### Bảng dấu của đạo hàm bậc nhất
Tách miền tại nghiệm của $f'$ và tại những điểm mà $f'$ không xác định. Trên mỗi khoảng con, dấu của $f'$ xác định chiều biến thiên: $f'>0$ thì $f$ tăng, $f'<0$ thì $f$ giảm. Khi qua $x_0$, dấu $f'$ đổi từ dương sang âm thì $x_0$ là cực đại địa phương; đổi từ âm sang dương thì là cực tiểu. Nếu không đổi dấu, điểm dừng không phải cực trị; chẳng hạn $f(x)=x^3$ tại $x=0$.

### Tiêu chuẩn đạo hàm bậc hai
Giả sử $f'(x_0)=0$ và $f$ có đạo hàm bậc hai liên tục gần $x_0$. Nếu $f''(x_0)>0$, đồ thị lõm lên quanh điểm dừng nên $x_0$ là cực tiểu chặt; nếu $f''(x_0)<0$, đó là cực đại chặt. Khi $f''(x_0)=0$, tiêu chuẩn không kết luận: $x^4$ có cực tiểu tại 0, còn $x^3$ không có cực trị tại đó. Khi ấy quay lại bảng dấu của $f'$ hoặc xét trực tiếp $f(x)-f(x_0)$.

### Trường hợp đạo hàm đầu tiên khác 0 ở bậc cao
Giả sử $f$ khả vi đủ lần trong lân cận của $x_0$, các đạo hàm từ bậc nhất đến bậc $n-1$ bằng 0 tại đó, còn $f^{(n)}(x_0)\ne0$. Taylor cho
$$f(x_0+h)-f(x_0)=\frac{f^{(n)}(x_0)}{n!}h^n+o(|h|^n).$$
Nếu $n$ chẵn, $h^n$ cùng dấu hai phía: đạo hàm cấp $n$ dương cho cực tiểu, âm cho cực đại. Nếu $n$ lẻ, hiệu đổi dấu qua $x_0$, nên không có cực trị. Giả thiết “đạo hàm đầu tiên khác 0” là thiết yếu; khi các đạo hàm cần xét vẫn bằng 0, tiêu chuẩn này không kết luận.

### Từ cực trị địa phương đến kết luận toàn cục
Trên một khoảng lồi, $f''\ge0$ bảo đảm $f$ lồi; một điểm dừng khi đó là điểm cực tiểu toàn cục. Nếu $f''\le0$, kết luận tương tự cho cực đại toàn cục. Tính lồi chặt cho tính duy nhất. Trên đoạn $[a,b]$, nếu $f$ liên tục thì giá trị lớn nhất và nhỏ nhất đều đạt được; so sánh $f(a)$, $f(b)$ với giá trị tại mọi ứng viên nội miền, kể cả điểm không khả vi.`,
    workedExample: ex(R`Lập bảng biến thiên cho $f(x)=x^3-3x$ trên $[-2,2]$, phân loại điểm dừng và tìm giá trị lớn nhất, nhỏ nhất trên đoạn.`, [R`$f'(x)=3(x-1)(x+1)$ có các điểm dừng $x=-1,1$. Dấu của $f'$ lần lượt là $+,-,+$ trên $(-2,-1),(-1,1),(1,2)$.`, R`Tại $x=-1$, $f'$ đổi $+\to-$ và $f''(-1)=-6$, nên đây là cực đại địa phương với $f(-1)=2$. Tại $x=1$, $f'$ đổi $-\to+$ và $f''(1)=6$, nên đây là cực tiểu địa phương với $f(1)=-2$.`, R`Kiểm tra hai đầu: $f(-2)=-2$, $f(2)=2$. Trên đoạn, giá trị lớn nhất là $2$ tại $x=-1,2$; giá trị nhỏ nhất là $-2$ tại $x=-2,1$.`], 'Bảng dấu cho biết tăng, giảm và cực trị địa phương; so sánh thêm hai đầu mút mới kết luận được trên đoạn.'),
    recall: { front: "$f'(x_{0})=0$ và $f''(x_{0})=0$ có đủ để nói không có cực trị không?", back: "Không. $x^{4}$ có cực tiểu tại 0, còn $x^{3}$ không có cực trị tại 0. Cần bảng dấu $f'$ hoặc lập luận trực tiếp." },
    trap: { title: 'Mọi nghiệm đạo hàm đều là cực trị', wrong: "$f'(x_{0})=0$ nên $x_{0}$ là cực trị.", right: 'Cần kiểm tra đổi dấu hoặc điều kiện đủ khác.', explanation: 'Điểm dừng là ứng viên, không phải kết luận.' },
  }],
  'chuyen-de-10': [{
    id: 'ode-model', title: 'Phương trình vi phân và bài toán giá trị đầu', scene: 'ode-definition',
    conditions: 'Chỉ xét phương trình cấp một. Nghiệm được xác định trên một khoảng mà phương trình gốc có nghĩa.',
    definition: R`Phương trình vi phân cấp một có dạng $F(x,y,y')=0$, hoặc khi giải được theo đạo hàm là $y'=f(x,y)$. Một nghiệm là hàm khả vi y(x) thỏa phương trình tại **mọi điểm của một khoảng**.
Điều kiện $y(x_0)=y_0$ chọn nghiệm đi qua một trạng thái ban đầu.`,
    content: R`### Hàm chưa biết thay cho số chưa biết
Phương trình đại số tìm một số; phương trình vi phân tìm một hàm cùng tốc độ thay đổi của nó. Nghiệm tổng quát thường chứa hằng số C; dùng điều kiện đầu để xác định C, rồi kiểm tra lại cả phương trình lẫn điều kiện đầu.

### Ba câu hỏi trước khi giải
Phương trình có tách được x và y không? Có đưa được về dạng tuyến tính $y'+p(x)y=q(x)$ không? Có phải kiểm tra miền, nghiệm hằng hoặc điểm hệ số không xác định không? Một phương trình có thể thuộc cả hai dạng; chọn cách ngắn nhưng không bỏ điều kiện.

### Tồn tại và duy nhất
Nếu f và đạo hàm riêng theo y liên tục gần $(x_{0},y_{0})$, bài toán $y'=f(x,y), y(x_{0})=y_{0}$ có nghiệm duy nhất cục bộ. Đây là điều kiện đủ thường dùng, không khẳng định nghiệm tồn tại với mọi x. Chẳng hạn $y'=y^{2}, y(0)=1$ có $y=1/(1-x)$, không kéo dài qua $x=1$.`,
    workedExample: ex(R`Kiểm tra $y=x-1/2+2e^{-2x}$ là nghiệm của $y'+2y=2x, y(0)=3/2$.`, [R`$y'=1-4e^{-2x}$.`, R`$y'+2y=1-4e^{-2x}+2x-1+4e^{-2x}=2x$ với mọi $x\in \mathbb R$.`, R`$y(0)=-1/2+2=3/2$. Cả hai yêu cầu đều thỏa.`], 'Chỉ thỏa giá trị ban đầu chưa đủ; chỉ thỏa phương trình mà sai hằng số cũng chưa giải đúng bài toán đầu.'),
    recall: { front: 'Cần kiểm tra những gì để xác nhận nghiệm bài toán giá trị đầu?', back: "Thay hàm và đạo hàm vào phương trình trên khoảng xác định; sau đó thay $x_{0}$ để kiểm tra $y(x_{0})=y_{0}$. Nêu khoảng nghiệm." },
    trap: { title: 'Thử một điểm thay cho kiểm tra hàm nghiệm', wrong: "Đúng tại $x=0$ nên đúng trên cả khoảng.", right: 'Phải có đồng nhất thức theo x trên khoảng.', explanation: 'Một nghiệm phương trình vi phân là một hàm thỏa tại mọi điểm, không phải một cặp số.' },
  }, {
    id: 'ode-parts', title: 'Tuyến tính có tích phân từng phần', scene: 'integration-parts',
    conditions: 'p,q liên tục trên khoảng xét; nguyên hàm từng phần phải kèm đúng dấu và hằng số tổng quát.',
    definition: R`Nhân tử tích phân đưa phương trình về $(\mu y)'=\mu q$. Nếu vế phải là tích đa thức với hàm mũ, dùng
$$\int u\,dv=uv-\int v\,du.$$
Công thức xuất phát từ $(uv)'=u'v+uv'$, không phải một quy tắc nhớ dấu tùy ý.`,
    content: R`### Kết hợp hai kỹ thuật theo đúng thứ tự
Trước hết chuẩn hóa hệ số của $y'$ bằng 1. Tiếp theo tìm $\mu$ từ p, nhân cả hai vế và nhận ra đạo hàm tích. Chỉ lúc tính $\int\mu q\,dx$ mới chọn đổi biến hoặc từng phần. Không lấy nguyên hàm từng hạng $y'$ và p(x)y một cách độc lập khi y chưa biết.

### Vì sao chọn u là đa thức?
Với $x e^{2x}$, lấy $u=x$ làm $du=dx$ đơn giản hơn; chọn $dv=e^{2x}dx$ có nguyên hàm dễ. Hệ số $1/2$ xuất hiện trong nguyên hàm $e^{2x}$ và phải được giữ đến cuối. Có thể kiểm tra bằng đạo hàm trước khi dùng điều kiện đầu.`,
    workedExample: ex(R`Giải $y'+2y=2x, y(0)=3/2$ theo Buổi 10.`, [R`$\mu =e^{2x}$. Phương trình trở thành $(e^{2x}y)'=2xe^{2x}$.`, R`Đặt $u=x, dv=2e^{2x}dx \Rightarrow  du=dx, v=e^{2x}$. $\int2xe^{2x}dx=e^{2x}(x-1/2)+C$.`, R`Chia $e^{2x}$: $y=x-1/2+Ce^{-2x}$. Điều kiện đầu cho $C=2$.`, R`Kết luận $y=x-1/2+2e^{-2x}, x\in \mathbb R$.`], "Đạo hàm nghiệm cho $y'+2y=2x$; giá trị ban đầu bằng $3/2$. Đây là bước nghiệm thu độc lập."),
    recall: { front: R`Vì sao $\int2xe^{2x}dx=e^{2x}(x-1/2)+C$ có dấu trừ?`, back: R`Từ $\int u\,dv=uv-\int v\,du$ với $u=x, dv=2e^{2x}dx$. Đạo hàm $e^{2x}(x-1/2)$ bằng $2xe^{2x}$, kiểm tra được cả dấu lẫn hệ số.` },
    trap: { title: 'Nguyên hàm hàm mũ thiếu hệ số', wrong: "$\\int e^{2x}\\,dx=e^{2x}+C$.", right: "$\\int e^{2x}\\,dx=e^{2x}/2+C$.", explanation: "Đạo hàm $e^{2x}$ tạo thêm hệ số 2 do quy tắc hàm hợp." },
  }, {
    id: 'bounded-growth', title: 'Tăng trưởng theo khoảng cách đến mức giới hạn', scene: 'bounded-growth',
    conditions: "$k>0, M$ cố định, $0\\le N_{0}<M$. Phân biệt mô hình khoảng cách với mô hình logistic.",
    definition: R`Nếu tốc độ tăng tỉ lệ với phần còn thiếu tới M thì
$$N'=k(M-N),\qquad N(t)=M-(M-N_0)e^{-kt}.$$
Đây không phải mô hình Malthus $N'=kN$, cũng không phải logistic $N'=kN$($M-N$).`,
    content: R`### Từ lời văn đến phương trình
Đại lượng “tỉ lệ với” là $M-N$, nên khi N gần M, tốc độ nhỏ dần. Đặt $E=M-N$ thì $E'=-$kE; khoảng cách đến mức giới hạn giảm theo hàm mũ. M là nghiệm cân bằng bị bỏ sót nếu chia ngay cho $M-N$ mà không xét.

### Hiệu chỉnh và dự báo thời điểm
Từ một quan sát $N(t_{1})=N_{1}$, có $k=\ln[(M-N_0)/(M-N_1)]/t_1$. Muốn đạt $N*$, với $N_{0}<N*<M$, thời gian là $t=\ln[(M-N_0)/(M-N^*)]/k$. Không đạt chính xác M trong thời gian hữu hạn khi $N_{0}<M$.`,
    workedExample: ex("Cho $M=4N_{0}, N(10)=2N_{0}$. Khi nào đạt $3N_{0}$?", [R`$N=4N_0-3N_0e^{-kt}$. Tại $t=10$: $e^{-10k}=2/3, k=\ln (3/2)/10$.`, R`Đặt $N=3N_{0} \Rightarrow  e^{-kt}=1/3$.`, R`$t=10\ln3/\ln(3/2)\approx27.10$.`], "Thời điểm lớn hơn 10; nghiệm tăng và tiệm cận $4N_{0}$, phù hợp giả thiết."),
    recall: { front: 'Tốc độ tỉ lệ với phần còn thiếu tới M dẫn đến mô hình nào?', back: R`$N'=k(M-N)$, nghiệm $N=M-(M-N_{0})e^{-kt}$. Khoảng cách đến M giảm mũ; không thêm thừa số N nếu lời văn không có.` },
    trap: { title: 'Mọi tăng trưởng giới hạn đều là logistic', wrong: "Tự thêm N vào $k(M-N)$.", right: 'Lập phương trình đúng đại lượng được nêu trong giả thiết.', explanation: 'Hai mô hình có tốc độ và đường nghiệm khác nhau.' },
  }, {
    id: 'exchange-adjustment', title: 'Ứng dụng tuyến tính: điều chỉnh tỷ giá và sai lệch cân bằng', scene: 'exchange',
    conditions: "$\\gamma >0$; tỷ giá cân bằng sₑ(t)=$a+\\pi t$; tốc độ bổ sung U và $\\pi$ là hằng số, cùng đơn vị thời gian.",
    definition: R`Với $s'=\gamma(s_e-s)+U$, đặt sai lệch $E=s-s_e$. Khi đó
$$E'+\gamma E=U-\pi,$$
$$E(t)=\frac{U-\pi}{\gamma}+\left(E(0)-\frac{U-\pi}{\gamma}\right)e^{-\gamma t}.$$
Tỷ giá bám đúng đường cân bằng về dài hạn khi $U=\pi$.`,
    content: R`### Tách xu hướng và sai lệch
sₑ không phải hằng số, nên $E'=s'-\pi$. Quên đạo hàm của đường cân bằng sẽ làm sai điều kiện hội tụ. Nhờ đặt E, phương trình có vế phải hằng và được giải bằng nhân tử $e^{\gamma t}$.

### Hai kiểu hội tụ
E(t) tiến về $(U-\pi )/\gamma$. Nếu $U\ne \pi , s$ và sₑ có thể cùng xu hướng nhưng giữ một khoảng cách khác 0. Nếu $U=\pi$, phần lệch ban đầu giảm theo $e^{-\gamma t}$ và E→0. Đây là một bài ứng dụng riêng của tuyến tính cấp một, không thay cho công thức tổng quát.`,
    workedExample: ex("Cho sₑ=$10+0,2t, \\gamma =0,5, U=0,2$ và $s(0)=12$. Tìm s.", [R`$E(0)=12-10=2; U-\pi =0$ nên $E'+0,5E=0$.`, R`$E=2e^{-0.5t}$, suy ra $s=10+.2t+2e^{-.5t}$.`, R`$s-$sₑ→0, dù bản thân s không tiến về một hằng số.`], 'Phân biệt hội tụ về đường chuyển động với hội tụ về một mức cố định.'),
    recall: { front: "Vì sao $E'=s'-\\pi$ khi $E=s-$sₑ và sₑ=$a+\\pi t$?", back: "Do đạo hàm của sₑ là $\\pi$. Khi chuyển từ s sang sai lệch, phải trừ tốc độ của đường cân bằng, nên vế phải mới là $U-\\pi$." },
    trap: { title: 'Coi đường cân bằng là hằng số', wrong: "$E'=s'$ dù sₑ phụ thuộc t.", right: "$E'=s'-s_e'=s'-\\pi$.", explanation: 'Đạo hàm của hiệu phải tính cả hai thành phần.' },
  }],
};

const enrichments = {
  'chuyen-de-1/matrix-shape': R`### Đọc một ma trận theo địa chỉ
Trong ký hiệu $a_{ij}$, chỉ số thứ nhất xác định dòng, chỉ số thứ hai xác định cột. Vì vậy $1\le i\le m$ và $1\le j\le n$; ma trận có đúng $mn$ vị trí:
$$A=(a_{ij})_{m\times n}\in\mathbb R^{m\times n}.$$
Một chỉ số ngoài các khoảng này không phải một ô đang bị khuyết mà là địa chỉ không tồn tại. Chẳng hạn với ma trận $2\times3$, $a_{23}$ có nghĩa nhưng $a_{31}$ không được gán bằng 0.

### Các dạng được xác định bởi kích thước và vị trí
Ma trận vuông có $m=n$ và được gọi là cấp $n$. Ma trận dòng có dạng $1\times n$; ma trận cột có dạng $m\times1$. Ma trận không $0_{m\times n}$ có mọi phần tử bằng 0; ma trận đơn vị $I_n$ là ma trận vuông có các phần tử đường chéo bằng 1 và các ô ngoài đường chéo bằng 0. Ma trận đối xứng phải vuông và thỏa $A^T=A$; điều kiện vuông tự nó chưa bảo đảm đối xứng.

Hai ma trận bằng nhau khi chúng có cùng kích thước và $a_{ij}=b_{ij}$ tại mọi địa chỉ hợp lệ. Chỉ kiểm tra vài ô, hoặc chỉ so sánh tổng số phần tử, chưa đủ để kết luận hai ma trận bằng nhau.

### Kích thước quyết định phép toán
Hai bảng $2\times3$ và $3\times2$ đều chứa sáu số nhưng không thể cộng: các ô cùng địa chỉ không cùng vai trò dòng–cột. Kích thước còn xác định phép nhân có thực hiện được hay không; vì thế trước khi tính, hãy ghi kích thước của từng thừa số và kết quả dự kiến. Ma trận tam giác, đường chéo và chuyển vị được xét riêng ở các mục tương ứng.`,
  'chuyen-de-1/matrix-product': R`### Một phần tử của tích là một tích vô hướng
Cho $A\in\mathbb R^{m\times n}$ và $B\in\mathbb R^{n\times p}$. Cột thứ $j$ của $B$ có $n$ hệ số; dùng các hệ số ấy để tổ hợp các cột của $A$ sẽ tạo cột thứ $j$ của $AB$. Vì vậy dòng $i$ của $A$ phải ghép với cột $j$ của $B$:
$$c_{ij}=\sum_{r=1}^{n}a_{ir}b_{rj},\qquad AB\in\mathbb R^{m\times p}.$$
Số chỉ số $r$ chạy đúng qua kích thước ở giữa. Hai kích thước ở giữa khác nhau thì tích không xác định; hai kích thước ngoài cho biết hình dạng ma trận kết quả.

### Tính một ô trước khi hoàn tất bảng
Trong ví dụ thực hành ngay dưới đây, để tính $c_{12}$, giữ dòng 1 của $A$ và cột 2 của $B$:
$$c_{12}=1\cdot0+2\cdot3+3\cdot2=12.$$
Mỗi số hạng ghép hai phần tử có cùng chỉ số $r$. Sau khi tính ô này, lặp lại với từng cặp dòng–cột; không nhân các ô cùng vị trí như phép cộng. Phép kiểm tra đầu tiên là kích thước: $(2\times3)(3\times2)$ phải cho ma trận $2\times2$.

### Các quy tắc và giới hạn của phép nhân
Khi mọi kích thước đều tương thích, phép nhân có tính kết hợp và phân phối:
$$(AB)C=A(BC),\qquad A(B+C)=AB+AC,\qquad (A+B)C=AC+BC.$$
Ma trận đơn vị cần đúng cấp: nếu $A$ là $m\times n$ thì $I_mA=A$ và $AI_n=A$. Nói chung $AB\ne BA$; ngay cả khi hai tích đều xác định, chúng có thể khác nhau. Ví dụ
$$A=\begin{pmatrix}0&1\\0&0\end{pmatrix},\qquad
B=\begin{pmatrix}1&0\\0&0\end{pmatrix}$$
cho $AB=0$ nhưng $BA=A$. Do đó không thể khử một thừa số khỏi hai vế chỉ vì nó xuất hiện trong tích; cần có giả thiết khả nghịch phù hợp.`,
  'chuyen-de-2/section-3': R`

### Định nghĩa bằng định thức con
Hạng r(A) là cấp lớn nhất của một định thức con khác 0; ma trận không có hạng 0. Do đó $0\le r(A)\le\min(m,n)$. Sau khi đưa về **dạng bậc thang**, hạng bằng số dòng khác 0, cũng bằng số pivot. Không đếm phần tử đường chéo của một ma trận tam giác tùy ý để thay cho hạng.

Ví dụ $\begin{pmatrix}1&2&1&4\\0&-5&4&5\\0&0&0&2\\0&0&0&0\end{pmatrix}$ có hạng 3: ma trận đã ở dạng bậc thang với ba dòng khác 0. Dù chỉ có hai ô đường chéo khác 0, pivot thứ ba ở cột 4.

### Hạng của tích
Với tích AB xác định, $r(AB)\le\min(r(A),r(B))$. Nếu P,Q khả nghịch thì r(PAQ)=r(A), vì nhân khả nghịch không làm mất quan hệ độc lập. Không tự thay dấu $\le$ bằng $=$: ma trận khác 0 có thể thỏa $A^{2}=0$.`,
  'chuyen-de-3/section-1': R`

### Từ hệ phương trình đến bốn khối dữ liệu
Với m phương trình và n ẩn:
$$\sum_{j=1}^n a_{ij}x_j=b_i\quad(i=1,\ldots,m)
\quad\Longleftrightarrow\quad
\underbrace{A}_{m\times n}\underbrace{X}_{n\times1}=\underbrace{B}_{m\times1}.$$
A chỉ chứa hệ số theo một thứ tự ẩn thống nhất; X là cột ẩn; B là cột hằng số. Ma trận mở rộng $\bar A$ có m dòng, $n+1$ cột. Một ẩn không xuất hiện phải có hệ số 0, không được xóa ô rồi làm lệch cột.

Nếu B có nhiều cột, $AX=B$ là nhiều hệ chung ma trận hệ số, giải độc lập từng cột. Với A khả nghịch, $AX=B$ cho $X=A^{-1}B$; phương trình $YA=C$ cho $Y=$C$A^{-1}$. Vị trí nhân nghịch đảo phụ thuộc phía của A, không được đảo thứ tự theo thói quen số học.`,
  'chuyen-de-5/section-2': R`

### Bảng đạo hàm cơ bản
$$\begin{array}{c|c|c}
f(x)&f'(x)&D\\\hline
c&0&c\in\mathbb R\\
x^\alpha&\alpha x^{\alpha-1}&x>0\\
e^x&e^x&x\in\mathbb R\\
a^x&a^x\ln a&a>0,\ a\ne1\\
\ln x&1/x&x>0\\
\log_a x&1/(x\ln a)&x>0,\ a>0,\ a\ne1\\
\sin x&\cos x&x\in\mathbb R\\
\cos x&-\sin x&x\in\mathbb R\\
\tan x&1/\cos^2x&\cos x\ne0\\
\cot x&-1/\sin^2x&\sin x\ne0
\end{array}$$
Góc lượng giác đo bằng radian. Với hàm trong u(x), thay x bằng u rồi nhân $u'$. Tính tuyến tính cho $(\alpha u+\beta v)'=\alpha u'+\beta v'$ với $\alpha ,\beta$ hằng.

### Tại sao cần hàm hợp?
Một biến đầu vào thường không tác động trực tiếp: x xác định $u=g(x)$, rồi u xác định $y=f(u)$. Xấp xỉ $\Delta u$≈$g'(x)\Delta x$ và $\Delta y$≈$f'(u)\Delta u$ dẫn tới $y'=f'(u)g'(x)$. Ví dụ $y=(4x+5)^{3}$ có đạo hàm $12(4x+5)^{2}$; hệ số 4 ghi lại thay đổi của biến trung gian.`,
  'chuyen-de-7/section-1': R`

### Vì sao xuất hiện đạo hàm riêng?
Giá một căn nhà không chỉ phụ thuộc diện tích mà còn khoảng cách tới trung tâm và mức tiện nghi. Mô hình $P=P(S,d,u)$ cần tách câu hỏi “diện tích thay đổi, các yếu tố khác giữ nguyên” khỏi câu hỏi “nhiều yếu tố cùng thay đổi”. Đạo hàm riêng trả lời câu thứ nhất.
$$f_x(x_0,y_0)=\lim_{h\to0}\frac{f(x_0+h,y_0)-f(x_0,y_0)}h.$$
Trên mặt $z=f(x,y)$, giữ $y=y_{0}$ tạo một đường mặt cắt; $f_{x}$ là độ dốc của đường ấy. Đổi biến được giữ cố định sẽ đổi mặt cắt và đổi đạo hàm.

### Các đạo hàm cấp hai phục vụ cực trị
Lấy đạo hàm riêng một lần nữa được $f_{xx}, f_{xy}, f_{yx}, f_{yy}$. Theo quy ước, $f_{xy}=\frac{\partial}{\partial y}(f_x)$ và $f_{yx}=\frac{\partial}{\partial x}(f_y)$. Nếu các đạo hàm hỗn hợp liên tục gần điểm xét thì $f_{xy}=f_{yx}$. Phần này dùng cho Hessian; không đưa vi phân cấp hai vào bài học.`,
  'chuyen-de-7/section-2': R`

### Khả vi mạnh hơn có riêng từng đạo hàm riêng
Hàm khả vi tại $(x_{0},y_{0})$ có biểu diễn
$$\Delta f=f_x\Delta x+f_y\Delta y+o\!\left(\sqrt{\Delta x^2+\Delta y^2}\right).$$
Việc riêng $f_{x},f_{y}$ tồn tại tại một điểm chưa bảo đảm biểu diễn này. Điều kiện đủ thuận tiện là các đạo hàm riêng liên tục trong lân cận điểm. Khi khả vi, vi phân toàn phần $df=f_xdx+f_ydy$ là phần tuyến tính của mức tăng.

### Ví dụ chỉ biết dữ liệu tại một điểm
Nếu $f(10,5)=1000, f_{x}(10,5)=2, f_{y}(10,5)=-3$, thì tại (10,1;4,8) có $\Delta x=0,1, \Delta y=-0,2$ và
$$f(10.1,4.8)\approx1000+2(.1)+(-3)(-.2)=1000.8.$$
Đóng góp do y là dương vì y giảm trong khi đạo hàm theo y âm. Dữ kiện chỉ cho xấp xỉ, không quyết định giá trị chính xác.`,
  'chuyen-de-9/section-2': R`

### Chứng minh chỉ cần một Hessian biên
Đặt $Q=\nabla^2_{(x,y)}L$ và $t=(g_{y},-g_{x})^{T}$. Khai triển trực tiếp định thức cho
$$\det H_b=-\big(g_y^2L_{xx}-2g_xg_yL_{xy}+g_x^2L_{yy}\big)=-t^TQt.$$
Vì $\nabla g\ne 0, t$ khác 0 và sinh toàn bộ đường tiếp xúc. Với đường khả thi r(s), đạo hàm hai lần của $g(r(s))=c$ và f(r(s)), kết hợp $\nabla f=\lambda \nabla g$ tại điểm dừng, cho $(f\circ r)''=r'^TQr'$. Mọi vận tốc tiếp xúc khác 0 có dạng $r'=\alpha t$, nên dấu độ cong là dấu $t^{T}$Qt. Do đó $\det  H_b<0$ cho cực tiểu chặt, $\det  H_b>0$ cho cực đại chặt. Không cần lập thêm một Hessian thứ hai để phân loại.

Nếu $g_{y}\ne 0$, có thể dùng hàm ẩn $y=\varphi (x)$ và nhận $(f(x,\varphi(x)))''=-\det H_b/g_y^2$ tại điểm dừng. Nếu $g_{y}=0$ nhưng $g_{x}\ne 0$, đổi vai x,y; không chia cho đạo hàm bằng 0. Nếu $\det  H_b=0$, phải xét trực tiếp. Đây là tiêu chuẩn **địa phương**, không tự chứng minh toàn cục.`,
  'chuyen-de-9/section-1': R`

### Dùng hết ngân sách khác với ngân sách tối đa
Nếu yêu cầu dùng hết M, ràng buộc là px+qy=M và Lagrange đẳng thức áp dụng ở điểm chính quy. Nếu chỉ được chi không quá M, miền là px+qy≤M: trước hết kiểm tra tối ưu nội miền, rồi khảo sát biên. Không tự thay bất đẳng thức bằng đẳng thức nếu chưa có lý do cho thấy ngân sách phải được dùng hết.

Ví dụ trong lời giải K51: $\pi=120x+240y-x^2-2xy-3y^2$. Với $x+2y=120$ và $x,y\ge 0$, thế $x=120-2y$ cho $\pi=4800-3(y-40)^2$, nên tối đa là 4800 tại (40,40). Nhưng với $x+2y\le 120$, điểm dừng tự do (30,30) chỉ chi 90 và cho $\pi =5400$. Hessian âm xác định trên toàn miền bảo đảm điểm này là tối đa toàn cục. Hai cách hiểu ngân sách tạo hai bài toán khác nhau.`,
  'chuyen-de-6/section-3': R`

### Co giãn khi quan hệ được xác định ẩn

Nếu $F(I,S)=0$ xác định khả vi $S=S(I)$ tại điểm xét và $F_S\ne0$, thì
$$S'=-\frac{F_I}{F_S},\qquad
\varepsilon_{S,I}=\frac{I}{S}S'=-\frac{I F_I}{S F_S}\quad(IS\ne0).$$

Xét $S^2+\frac{I^2}{4}=SI+I$. Tại $I=16$, các nghiệm là $S=4$ và $S=12$. Điều kiện tiết kiệm không vượt quá $30\%$ thu nhập, $S\le0{,}3I$, chọn $S=4$ vì $4\le4{,}8$, còn $12>4{,}8$.

Đặt $F(I,S)=S^2+\frac{I^2}{4}-SI-I$. Tại $(16,4)$, $F_I=\frac I2-S-1=3$ và $F_S=2S-I=-8$. Vì vậy $S'=-\frac{3}{-8}=\frac38$, rồi
$$\varepsilon_{S,I}=\frac{16}{4}\cdot\frac38=\frac32.$$

Thu nhập tăng một phần trăm nhỏ làm tiết kiệm tăng xấp xỉ $1{,}5\%$ quanh điểm này. Đạo hàm $\frac38$ mô tả thay đổi tuyệt đối; hệ số $\frac32$ mô tả thay đổi tương đối.`,
  'chuyen-de-10/section-5': R`

### Đưa Solow về tuyến tính cấp một
Với $k>0$, đặt $v=k^{1-\alpha }$. Từ $k'=$sAkᵅ−$(n+\delta )k$ suy ra
$$v'=(1-\alpha)k^{-\alpha}k'=(1-\alpha)sA-(1-\alpha)(n+\delta)v.$$
Đây là phương trình tuyến tính. Nếu $n+\delta >0$ thì
$$v(t)=\frac{sA}{n+\delta}+\left(v_0-\frac{sA}{n+\delta}\right)e^{-(1-\alpha)(n+\delta)t},\qquad k=v^{1/(1-\alpha)}.$$
Nếu $n+\delta =0$, công thức có mẫu không dùng được: $v=v_{0}+(1-\alpha )$sAt. Trường hợp $k=0$ phải được xét riêng trước phép nhân $k^{-\alpha }$. Minh họa dưới dùng đúng ví dụ sA=$0,4, n=0,1, \delta =0, \alpha =1/2$.`,
};

const scenes = {
  1: { 'matrix-shape':'dimensions','matrix-triangle':'triangles','matrix-addition':'addition','matrix-product':'product','matrix-transpose':'transpose','det-sarrus':'sarrus','det-laplace':'laplace','row-operations':'row-operations' },
  2: { 'section-1':'inverse','section-2':'cofactor','section-3':'rank' },
  3: { 'section-1':'system-matrix','section-2':'rank-cases','section-3':'cramer' },
  4: { 'section-1':'io-table','section-2':'io-balance','section-3':'io-demand' },
  5: { 'section-1':'secant','section-2':'chain','section-3':'implicit','section-4':'differential' },
  6: { 'section-1':'marginal','section-2':'average-marginal','section-3':'elasticity','implicit-elasticity':'implicit-elasticity' },
  7: { 'section-1':'partial','section-2':'total-differential','section-3':'cobb' },
  8: { 'section-1':'stationary','section-2':'k51-extrema','section-3':'global-optimum' },
  9: { 'section-1':'lagrange','section-2':'bordered-hessian','section-3':'cost-optimum' },
  10: { 'section-1':'integral','section-2':'separable','section-3':'integrating-factor','section-4':'growth','section-5':'solow' },
};


function mergeDuplicateSections(sections) {
  const positions = new Map();
  const unique = [];
  for (const section of sections) {
    const position = positions.get(section.id);
    if (position === undefined) {
      positions.set(section.id, unique.length);
      unique.push(section);
      continue;
    }
    const previous = unique[position];
    const merged = { ...previous };
    for (const [key, value] of Object.entries(section)) {
      if (key === 'scene' && value) merged.scene = value;
      else if ((merged[key] === undefined || merged[key] === null || merged[key] === '') && value !== undefined) merged[key] = value;
    }
    unique[position] = merged;
  }
  return unique;
}

const prose = lines => {
  const text = lines.join(String.fromCharCode(10)).replaceAll(String.fromCharCode(167), String.fromCharCode(92));
  const rows = text.split(String.fromCharCode(10));
  for (let i = 0; i < rows.length; i += 1) {
    const trimmed = rows[i].trimStart();
    if (!trimmed.startsWith("$") || trimmed.startsWith("$$")) continue;
    const offset = rows[i].length - trimmed.length;
    rows[i] = rows[i].slice(0, offset) + "$$" + trimmed.slice(1);
    for (let j = i; j < rows.length; j += 1) {
      const candidate = rows[j].trimEnd();
      if (candidate.endsWith(".$")) { rows[j] = candidate.slice(0, -2) + "$$"; break; }
      if (candidate.endsWith("$") && !candidate.endsWith("$$")) { rows[j] = candidate + "$"; break; }
    }
  }
  return rows.join(String.fromCharCode(10));
};

const articleRevisions = {
  'chuyen-de-1': {
    'matrix-shape': {
      definition: prose([
        'Ma trận cỡ $m§times n$ là một bảng gồm $m$ dòng và $n$ cột, ký hiệu',
        '$A=(a_{ij})_{m§times n}§in§mathbb R^{m§times n}.$',
        'Ở đây $a_{ij}$ là phần tử tại dòng $i$, cột $j$. Hai ma trận bằng nhau khi chúng cùng cỡ và mọi phần tử ở cùng địa chỉ bằng nhau.'
      ]),
      content: prose([
        '### Đọc chỉ số trên một ma trận cụ thể',
        'Cho',
        '$A=§begin{pmatrix}1&-2&0§§3&4&5§end{pmatrix}.$',
        'Ma trận có cỡ $2§times3$. Chỉ số thứ nhất là dòng, chỉ số thứ hai là cột; do đó $a_{23}=5$ và $a_{12}=-2$. Ký hiệu $a_{31}$ không biểu thị một ô bằng $0$: địa chỉ ấy không tồn tại vì $A$ chỉ có hai dòng.',
        '',
        '### Các dạng ma trận thường gặp',
        '| Dạng | Điều kiện nhận biết | Ví dụ |',
        '|---|---|---|',
        '| Ma trận vuông cấp $n$ | Số dòng bằng số cột. | $§begin{pmatrix}1&2§§3&4§end{pmatrix}$ |',
        '| Ma trận dòng / cột | Cỡ lần lượt là $1§times n$ và $m§times1$. | $(1§quad -2§quad 3)$; $§begin{pmatrix}1§§-2§§3§end{pmatrix}$ |',
        '| Ma trận không | Mọi phần tử bằng $0$; cỡ được ghi rõ. | $0_{2§times3}=§begin{pmatrix}0&0&0§§0&0&0§end{pmatrix}$ |',
        '| Ma trận đường chéo | $a_{ij}=0$ khi $i§ne j$. | $§begin{pmatrix}2&0&0§§0&-1&0§§0&0&4§end{pmatrix}$ |',
        '| Ma trận đơn vị | $I_n$ là ma trận đường chéo cấp $n$ có các phần tử đường chéo bằng $1$. | $I_2=§begin{pmatrix}1&0§§0&1§end{pmatrix}$ |',
        '| Ma trận đối xứng | Ma trận vuông thỏa $A^T=A$. | $§begin{pmatrix}1&2§§2&3§end{pmatrix}$ |',
        '',
        '### Kích thước là một phần của đối tượng',
        'Hai ma trận cỡ $2§times3$ và $3§times2$ đều có sáu phần tử nhưng không cùng cỡ, nên không thể cộng. Trước mỗi phép toán, ghi số dòng và số cột của từng ma trận; số phần tử tổng cộng không thay thế được hai thông tin này. Ma trận tam giác được xét cùng định thức ở mục riêng; chuyển vị được định nghĩa sau các phép toán cơ bản.'
      ])
    },
    'matrix-product': {
      definition: prose([
        'Cho $A§in§mathbb R^{m§times n}$ và $B§in§mathbb R^{n§times p}$. Tích $C=AB$ xác định khi số cột của $A$ bằng số dòng của $B$; khi đó $C§in§mathbb R^{m§times p}$ và',
        '$c_{ij}=§sum_{r=1}^{n}a_{ir}b_{rj}.$',
        'Muốn tính $c_{ij}$, ghép dòng $i$ của $A$ với cột $j$ của $B$, nhân các phần tử cùng chỉ số rồi cộng.'
      ]),
      content: prose([
        '### Từ kích thước đến một phần tử của tích',
        'Quy tắc kích thước được đọc theo chiều',
        '$(m§times n)(n§times p)§longrightarrow m§times p.$',
        'Kích thước ở giữa phải trùng nhau; hai kích thước ngoài cho biết dạng kết quả. Chẳng hạn',
        '$A=§begin{pmatrix}1&2&3§§4&5&6§end{pmatrix},§qquad',
        'B=§begin{pmatrix}2&0§§1&3§§-1&2§end{pmatrix}.$',
        'Tích $AB$ có cỡ $2§times2$. Ô hàng 1, cột 2 được tính từ đúng hàng 1 của $A$ và cột 2 của $B$:',
        '$c_{12}=1§cdot0+2§cdot3+3§cdot2=12.$',
        'Tính các cặp dòng–cột còn lại cho',
        '$AB=§begin{pmatrix}1&12§§7&27§end{pmatrix}.$',
        'Đây là tích vô hướng của một dòng với một cột; không nhân các ô cùng địa chỉ như phép cộng.',
        '',
        '### Phép nhân ma trận không giao hoán',
        'Trong tập số thực, phép nhân có tính giao hoán: $2\\cdot3=3\\cdot2$. Đổi vị trí hai thừa số không làm thay đổi tích.',
        'Tích ma trận biểu diễn phép hợp thành các biến đổi. Với vectơ cột $x$, ta có $ABx=A(Bx)$: $B$ tác động trước rồi đến $A$. Vì vậy thứ tự thừa số mang thông tin về thứ tự thực hiện; nhìn chung $AB$ và $BA$ khác nhau, thậm chí một trong hai tích có thể không xác định.',
        'Ngay cả khi $A$ và $B$ vuông cùng cấp để cả hai tích đều có nghĩa, chúng vẫn có thể cho kết quả khác nhau. Ví dụ',
        '$A=§begin{pmatrix}1&1§§0&1§end{pmatrix},§qquad',
        'B=§begin{pmatrix}1&0§§1&1§end{pmatrix},$',
        '$AB=§begin{pmatrix}2&1§§1&1§end{pmatrix},§qquad',
        'BA=§begin{pmatrix}1&1§§1&2§end{pmatrix},§qquad AB§ne BA.$',
        'Vì vậy không được đổi thứ tự thừa số hoặc khử một thừa số như với số thực. Cũng có thể có hai ma trận khác không nhưng tích bằng ma trận không:',
        '$§begin{pmatrix}0&1§§0&0§end{pmatrix}§begin{pmatrix}1&0§§0&0§end{pmatrix}=0.$',
        '',
        '### Tính chất và vai trò của ma trận đơn vị',
        'Phép nhân kết hợp và phân phối đối với phép cộng khi mọi tích liên quan đều xác định:',
        '$(AB)C=A(BC),§qquad A(B+C)=AB+AC,§qquad (A+B)C=AC+BC.$',
        'Nếu $A$ có cỡ $m§times n$, ma trận đơn vị bên trái phải có cấp $m$, còn bên phải phải có cấp $n$:',
        '$I_mA=A,§qquad AI_n=A.$',
        'Hai đẳng thức này dùng hai ma trận đơn vị có thể khác cấp; mỗi ma trận chỉ nhân ở phía có kích thước tương thích.'
      ])
    },
    'matrix-transpose': {
      definition: prose([
        'Chuyển vị của $A§in§mathbb R^{m§times n}$ là ma trận $A^T§in§mathbb R^{n§times m}$ thu được khi đổi mỗi dòng thành cột. Giá trị phần tử không đổi:',
        '$(A^T)_{ji}=a_{ij}.$'
      ]),
      content: prose([
        '### Một hàng trở thành một cột',
        'Với',
        '$A=§begin{pmatrix}1&-2&0§§3&4&5§end{pmatrix},§qquad',
        'A^T=§begin{pmatrix}1&3§§-2&4§§0&5§end{pmatrix}.$',
        'Phần tử $a_{12}=-2$ chuyển tới vị trí $(A^T)_{21}=-2$: chỉ số dòng và cột đổi chỗ, còn giá trị giữ nguyên. Bởi vậy cỡ $m§times n$ đổi thành $n§times m$.',
        '',
        '### Các quy tắc được suy ra từ định nghĩa',
        'Chuyển vị hai lần trả về ma trận ban đầu; chuyển vị bảo toàn phép cộng và nhân vô hướng:',
        '$(A^T)^T=A,§qquad(A+B)^T=A^T+B^T,§qquad(kA)^T=kA^T.$',
        'Với tích, thứ tự phải đảo:',
        '$(AB)^T=B^TA^T.$',
        'Nếu $A$ cỡ $m§times k$ và $B$ cỡ $k§times p$, cả hai vế đều có cỡ $p§times m$. Theo phần tử,',
        '$((AB)^T)_{ij}=(AB)_{ji}=§sum_r a_{jr}b_{ri}',
        '=§sum_r(B^T)_{ir}(A^T)_{rj}.$',
        'Hai vế có cùng kích thước và mọi phần tử tương ứng bằng nhau, nên hai ma trận bằng nhau.',
        '',
        '### Ma trận đối xứng',
        'Ma trận $S$ đối xứng khi $S^T=S$; điều này chỉ có thể xảy ra với ma trận vuông. Với mọi ma trận thực $A$, tích $A^TA$ đối xứng vì $(A^TA)^T=A^TA$. Đối xứng không đồng nghĩa với khả nghịch; khả nghịch còn phụ thuộc định thức.'
      ])
    },
    'matrix-triangle': {
      definition: prose([
        'Ma trận vuông $U=(u_{ij})$ tam giác trên nếu $u_{ij}=0$ khi $i>j$; ma trận vuông $L=(l_{ij})$ tam giác dưới nếu $l_{ij}=0$ khi $i<j$. Ma trận đường chéo đồng thời thuộc cả hai dạng.'
      ]),
      content: prose([
        '### Nhận biết vùng bắt buộc bằng 0',
        '$U=§begin{pmatrix}u_{11}&u_{12}&u_{13}§§0&u_{22}&u_{23}§§0&0&u_{33}§end{pmatrix},§qquad',
        'L=§begin{pmatrix}l_{11}&0&0§§l_{21}&l_{22}&0§§l_{31}&l_{32}&l_{33}§end{pmatrix}.$',
        'Trong ma trận tam giác trên, các ô dưới đường chéo chính bằng $0$; trong ma trận tam giác dưới, các ô phía trên đường chéo bằng $0$. Các ô còn lại không bị buộc phải khác $0$.',
        '',
        '### Định thức của ma trận tam giác',
        'Khai triển Laplace theo cột đầu của $U$ chỉ còn hạng $u_{11}$ nhân định thức con. Ma trận con vẫn tam giác trên; lặp đến cấp một thu được',
        '$|U|=u_{11}u_{22}u_{33}.$',
        'Lập luận tương tự áp dụng cho $L$. Với ma trận tam giác cấp $n$,',
        '$|A|=§prod_{i=1}^{n}a_{ii}.$',
        '',
        '### Khi nào ma trận tam giác khả nghịch?',
        'Ma trận tam giác khả nghịch khi và chỉ khi mọi phần tử đường chéo khác $0$, vì định thức bằng tích các phần tử ấy. Các phần tử ngoài đường chéo không ảnh hưởng tích định thức; một số $0$ ở ngoài đường chéo không tự làm ma trận suy biến.'
      ])
    }
  },
  'chuyen-de-2': {
    'rank-parameter': {
      content: prose([
        '### Khử ma trận mà không loại trường hợp tham số',
        'Xét ma trận hệ số',
        '$A(m)=§begin{pmatrix}1&2&0§§2&5&1§§1&m&1§end{pmatrix}.$',
        'Thực hiện $d_2§leftarrow d_2-2d_1$ và $d_3§leftarrow d_3-d_1$, rồi dùng dòng 2 mới trong $d_3§leftarrow d_3-(m-2)d_2$. Ta được',
        '$U(m)=§begin{pmatrix}1&2&0§§0&1&1§§0&0&3-m§end{pmatrix}.$',
        'Các phép cộng bội dòng đều khả nghịch với mọi $m$. Đặc biệt, phép cuối không chia cho $m-2$; tại $m=2$ dòng 3 chỉ giữ nguyên sau phép biến đổi, nên trường hợp ấy vẫn được bao gồm.',
        '',
        '### Đọc hạng từ các trụ',
        'Nếu $m§ne3$, cả ba dòng của $U(m)$ đều có trụ, do đó $r(A)=3$. Nếu $m=3$, dòng cuối bằng không còn hai dòng đầu độc lập, nên $r(A)=2$. Định thức con cấp hai ở hai dòng và hai cột đầu bằng $1$, vì vậy hạng tại $m=3$ không thể nhỏ hơn $2$.',
        '$$m§ne3§implies r(A)=3,§qquad m=3§implies r(A)=2.$$',
        '',
        '### Định thức tìm điểm ngoại lệ; hạng quyết định kết luận',
        'Chỉ dùng phép cộng bội dòng nên định thức không đổi. Vì $U(m)$ tam giác trên,',
        '$$|A(m)|=|U(m)|=3-m.$$',
        'Định thức xác định đúng giá trị làm ma trận suy biến. Tại giá trị đó, phải xét hạng hoặc định thức con để biết hạng giảm bao nhiêu; $|A|=0$ riêng lẻ không cho biết hạng bằng $2$, $1$ hay $0$.',
        '',
        '### Hệ quả không vượt quá thông tin đã biết',
        'Nếu $A$ cấp ba và $r(A)§le2$, thì $|A|=0$. Khi đó $A^2-2A=A(A-2I)$ cũng suy biến, còn $r(A^2)§le r(A)§le2$. Không thể kết luận $r(A^2)$ bằng một giá trị cụ thể nếu chưa xét thêm các phần tử hoặc định thức con.'
      ])
    }
  },
  'chuyen-de-3': {
    'exam-methods': {
      content: prose([
        '### Chọn phương pháp theo dữ kiện và yêu cầu',
        'Với hệ $A(m)X=B(m)$, cần phân biệt việc kiểm tra một vài giá trị tham số với việc phân loại nghiệm cho mọi $m$. Ba quy trình dưới đây có phạm vi kết luận khác nhau.',
        '',
        '| Dạng câu hỏi | Quy trình | Kết luận hợp lệ |',
        '|---|---|---|',
        '| Trắc nghiệm cho một số giá trị $m_0$ | Thay từng phương án vào toàn bộ hệ số và vế phải; nhập hệ theo đúng thứ tự ẩn vào chế độ HT của máy tính. Thế nghiệm máy trả về vào hệ ban đầu để kiểm tra. | Xác nhận hoặc loại giá trị đang thử khi máy cho nghiệm duy nhất. Một số lần thử không chứng minh mệnh đề đúng với mọi $m$. |',
        '| Tự luận: khử và biện luận tham số | Khử ma trận mở rộng $§bar A(m)$ từ đầu. Trước mỗi phép chia cho biểu thức theo $m$, tách trường hợp biểu thức bằng $0$ và khác $0$; biến đổi cả cột vế phải. | Bao quát mọi nhánh tham số và cho biết hệ vô nghiệm, có nghiệm duy nhất hay vô số nghiệm. |',
        '| Tự luận: xét từng giá trị ngoại lệ | Dùng định thức hoặc khử để tìm các giá trị có thể làm hệ suy biến. Thay từng giá trị vào hệ gốc, xét $r(A)$ và $r(§bar A)$; nếu hệ vuông có nghiệm duy nhất, có thể dùng Cramer để tính nghiệm. | Phân loại riêng từng giá trị ngoại lệ. Tại $|A|=0$, không được dùng Cramer và không thể suy ra ngay hệ vô nghiệm hay vô số nghiệm. |',
        '',
        '### Đọc một dòng cuối sau khi khử',
        'Nếu dòng cuối của ma trận mở rộng có dạng $(0,0,p(m)§mid q(m))$, xét đủ ba khả năng:',
        '- Nếu $p(m)§ne0$, dòng xác định ẩn tương ứng theo các ẩn còn lại; đây chưa phải dòng mâu thuẫn.',
        '- Nếu $p(m)=0$ nhưng $q(m)§ne0$, dòng biểu thị $0=q(m)$, nên hệ vô nghiệm.',
        '- Nếu $p(m)=q(m)=0$, dòng trở thành dòng không. Bỏ dòng này rồi xét các dòng còn lại và so sánh hai hạng.',
        'Hệ có nghiệm khi và chỉ khi $r(A)=r(§bar A)$. Khi hai hạng bằng $n$, nghiệm duy nhất; khi chúng bằng nhau và nhỏ hơn $n$, có vô số nghiệm. Một dòng không không tự nó chứng minh có vô số nghiệm.',
        '',
        '### Theo dõi định thức khi biến đổi dòng',
        'Cộng bội một dòng khác không làm đổi định thức; đổi chỗ hai dòng làm đổi dấu; nhân một dòng với $c$ làm định thức nhân với $c$. Chẳng hạn, nếu thay $d_3$ bằng $2d_3+(m-3)d_2$, định thức ma trận mới bằng $2|A|$. Phần tử trụ cuối sau phép biến đổi khi ấy không thể được đồng nhất trực tiếp với $|A|$ nếu chưa hoàn lại hệ số đã phát sinh.'
      ])
    }
  }
};

export function buildTextbook(id, foundation) {
  const chapter = Number(id.split('-').at(-1));
  let sections = foundation.sections.map(section => ({
    ...section,
    scene: scenes[chapter][section.id],
    content: chapter === 1 && (section.id === 'matrix-shape' || section.id === 'matrix-product') ? (enrichments[`${id}/${section.id}`] || '') : section.content + (enrichments[`${id}/${section.id}`] || ''),
    references: sources[chapter],
  }));
  const extra = (additions[id] || []).map(section => ({ ...section, references: sources[chapter] }));
  if (chapter === 1) sections.splice(sections.findIndex(s => s.id === 'matrix-product'), 0, ...extra);
  else if (chapter === 3) sections.push(...extra);
  else if (chapter === 4) { sections.splice(1, 0, extra[0]); sections.push(extra[1]); }
  else if (chapter === 7) sections.splice(1, 0, ...extra);
  else if (chapter === 8) sections.unshift(...extra);
  else if (chapter === 10) { sections.splice(1, 0, extra[0]); sections.splice(sections.findIndex(s => s.id === 'section-4'), 0, extra[1]); sections.push(...extra.slice(2)); }
  if (chapter === 1) sections = sections.map(s => s.id === 'matrix-addition' ? { ...s, title: 'Cộng và trừ các phần tử cùng vị trí' } : s);
  if (chapter === 1) sections = sections.map(s => s.id === 'matrix-shape' ? { ...s, workedExample: ex(
    R`Cho $A=\begin{pmatrix}1&-2&0\\3&4&5\end{pmatrix}$. Xác định kích thước, số phần tử, $a_{23}$ và $a_{12}$.`,
    [R`A có 2 dòng, 3 cột, nên kích thước là $2\times 3$; có $2\cdot 3=6$ phần tử.`, R`$a_{23}$ thuộc dòng 2, cột 3 nên bằng 5. $a_{12}$ thuộc dòng 1, cột 2 nên bằng −2.`, R`$a_{31}$ không tồn tại vì A chỉ có hai dòng; không được tự điền giá trị 0 cho một địa chỉ ngoài ma trận.`],
    'Số đầu trong chỉ số phải nằm từ 1 đến số dòng; số sau nằm từ 1 đến số cột. Chuyển vị sẽ được khảo sát ở mục riêng.'
  ) } : s);
  if (chapter === 6) {
    sections[0] = {
      ...sections[0],
      title: 'Đại lượng biên: tốc độ thay đổi theo đơn vị tuyệt đối',
      definition: R`Với đại lượng $y=f(x)$, đại lượng biên theo $x$ là $f'(x)$, có đơn vị “đơn vị $y$ trên đơn vị $x$”. Khi $\Delta x$ nhỏ:
$$\Delta y\approx f'(x)\Delta x.$$
Đạo hàm là tốc độ tại trạng thái đang xét; nó không đồng nhất với mức tăng hữu hạn.`,
      content: R`### Hệ số góc và ý nghĩa kinh tế

Trên đồ thị, $f'(x)$ là hệ số góc tiếp tuyến tại trạng thái $x$. Trong mô hình kinh tế, nó cho biết đầu ra thay đổi xấp xỉ bao nhiêu khi đầu vào thay đổi một lượng nhỏ, với các điều kiện khác giữ nguyên. Dấu của đạo hàm xác định chiều biến thiên; đơn vị của nó cho biết mỗi đơn vị đầu vào gắn với bao nhiêu đơn vị đầu ra.

### Đối chiếu vi phân với mức tăng chính xác

Xét $f(x)=4x^2+4x+3$. Tại $x=5$, $f(5)=123$ và $f'(5)=44$. Đặt $dx=\Delta x$. Nếu $\Delta x=0{,}1$, vi phân cho $dy=f'(5)dx=4{,}4$, còn mức tăng chính xác là $f(5{,}1)-f(5)=4{,}44$. Nếu bước tăng là $3$, thì $dy=132$ trong khi mức tăng thực là $f(8)-f(5)=168$. Phần dư tăng theo kích thước bước; đẳng thức $dy=\Delta y$ không đúng nói chung.

### Ký hiệu biên trong ứng dụng

Với tổng chi phí $C(q)$, doanh thu $R(q)$ và lợi nhuận $\pi(q)=R(q)-C(q)$:
$$MC=C'(q),\qquad MR=R'(q),\qquad
\pi'(q)=MR-MC.$$
Đây là các ký hiệu chuyên biệt cho cùng một ý niệm đạo hàm. Nếu đầu ra phụ thuộc nhiều đầu vào, phải chỉ rõ biến đang thay đổi và các biến giữ cố định; khi ấy dùng đạo hàm riêng.`,
      workedExample: ex(R`Cho $f(x)=4x^2+4x+3$ tại $x=5$. So sánh mức tăng thực và vi phân khi $\Delta x=0{,}1$.`, [R`$f'(x)=8x+4$, nên $f'(5)=44$.`, R`Đặt $dx=\Delta x=0{,}1$. Khi đó $dy=f'(5)dx=44\cdot0{,}1=4{,}4$.`, R`Mức tăng chính xác là $\Delta y=f(5{,}1)-f(5)=4{,}44$. Vì vậy $\Delta y-dy=0{,}04$.`], R`Đạo hàm tại điểm đầu tạo phần tuyến tính của mức tăng; trong ví dụ này, phần dư bằng $4(0{,}1)^2$.`),
      recall: { front: 'Đại lượng biên khác mức tăng thực ở điểm nào?', back: R`$f'(x)$ là tốc độ tức thời; với bước nhỏ, $\Delta y\approx f'(x)\Delta x$. Mức tăng chính xác là $f(x+\Delta x)-f(x)$ và có thể khác xấp xỉ.` },
      trap: { title: 'Đồng nhất đạo hàm với mức tăng hữu hạn', wrong: R`Nếu $f'(5)=44$ và $\Delta x=3$, thì mức tăng thực luôn bằng $44\cdot3$.`, right: R`$44\cdot3$ chỉ là xấp xỉ tuyến tính; tính mức tăng thực bằng $f(8)-f(5)$.`, explanation: 'Xấp xỉ tiếp tuyến có thể kém chính xác khi bước thay đổi lớn.' }
    };
  }
  sections = mergeDuplicateSections(sections);
  const revisions = articleRevisions[id] || {};
  sections = sections.map(section => ({ ...section, ...(revisions[section.id] || {}) }));
  const overview = chapter === 6 ? {
    summary: 'Đại lượng biên đo thay đổi theo đơn vị tuyệt đối; hệ số co giãn đo thay đổi tương đối. Bắt đầu từ định nghĩa tổng quát, sau đó áp dụng vào các quan hệ kinh tế cụ thể.',
    objectives: ['Diễn giải đạo hàm theo dấu, đơn vị và trạng thái.', 'Phân biệt thay đổi chính xác với xấp xỉ bậc nhất.', 'Tính co giãn tường minh hoặc ẩn và diễn giải đúng phần trăm.'],
  } : {};
  return { ...foundation, ...overview, references: sources[chapter], sections };
}

// Each card asks for a distinct retrieval task. No generic repeated condition prompt.
export { textbookCards } from '../../../shared/studyCards.mjs';
