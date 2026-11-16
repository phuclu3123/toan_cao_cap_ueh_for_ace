const R = String.raw;
const example = (question, steps, casioTip) => ({ question, steps, casioTip });
export const calculusFoundations = {
  'chuyen-de-5': {
    summary: 'Đạo hàm được xây dựng từ giới hạn của tốc độ thay đổi trung bình. Vi phân cấp một là phần tuyến tính dùng để xấp xỉ, không đồng nhất với mức tăng thực tế.',
    objectives: ['Giải thích giới hạn, tiếp tuyến và đơn vị đạo hàm.', 'Chọn đúng quy tắc đạo hàm, đặc biệt với hàm hợp và hàm ẩn.', "Phân biệt $\\Delta y$ với $dy$ và kiểm tra điều kiện xấp xỉ."],
    references: ['Ghi chép Buổi 8 · trang 2–3, 6–7: quy tắc hàm hợp và đạo hàm hàm ẩn', 'TUD_v2.pdf · trang 19–20: định nghĩa, công thức đạo hàm, hàm hợp và hàm ngược', 'TUD_v2.pdf · trang 26–27: đạo hàm hàm ẩn, vi phân và xấp xỉ tuyến tính', 'OpenStax, Calculus Volume 1 · §§ 3.1, 3.3, 3.6, 3.8, 4.2'],
    sections: [
      { id: 'section-1', title: 'Đạo hàm từ tốc độ thay đổi đến tiếp tuyến', conditions: "$x_{0}$ nằm trong một khoảng mở thuộc miền xác định; thương sai phân phải có giới hạn hữu hạn từ hai phía.", definition: R`Đạo hàm tại $x_0$ là
$$f'(x_0)=\lim_{h\to0}\frac{f(x_0+h)-f(x_0)}h.$$
Tỉ số trước khi lấy giới hạn là hệ số góc cát tuyến; giới hạn là hệ số góc tiếp tuyến.`, content: R`### Đại lượng trung bình và tức thời
$\frac{\Delta y}{\Delta x}$ đo tốc độ thay đổi trên một khoảng. $f'(x_0)$ mô tả tốc độ tại một điểm, là giới hạn khi khoảng co lại. Nếu x có đơn vị giờ và y có đơn vị km thì đạo hàm có đơn vị km/giờ.

Hai cách viết định nghĩa tương đương khi đặt $h=x-x_0$:
$$f'(x_0)=\lim_{x\to x_0}\frac{f(x)-f(x_0)}{x-x_0}=\lim_{h\to0}\frac{f(x_0+h)-f(x_0)}{h}.$$
Đạo hàm hai phía tồn tại khi hai đạo hàm một phía đều hữu hạn và bằng nhau. Ở đầu mút miền xét, chỉ xét giới hạn một phía tương ứng; không gọi đó là đạo hàm hai phía.

### Tiếp tuyến
Khi đạo hàm hữu hạn tồn tại, đường thẳng
$$y=f(x_0)+f'(x_0)(x-x_0)$$
đi qua điểm đang xét và khớp tốc độ thay đổi bậc một của hàm tại đó. Không được bỏ hạng $f(x_0)$.

### Khả vi và liên tục
Có đạo hàm tại một điểm suy ra liên tục tại điểm đó; chiều đảo không đúng. Hàm $|x|$ liên tục tại 0 nhưng có đạo hàm trái −1, đạo hàm phải 1 nên không khả vi tại 0. Một công thức đạo hàm chỉ có ý nghĩa tại những điểm nó thực sự xác định.`, workedExample: example(R`Tính đạo hàm của $f(x)=x^{2}$ tại $x_{0}=3$ từ định nghĩa.`, [R`$\frac{(3+h)^2-9}{h}=\frac{6h+h^2}{h}=6+h$ với $h\ne0$.`, R`Cho h tiến đến 0, được $f'(3)=6$.`, R`Tiếp tuyến là $y=9+6(x-3)$, tức $y=6x-9$.`], R`Cát tuyến với $h=0,1$ có hệ số góc 6,1; với $h=-0,1$ có hệ số góc 5,9. Cả hai tiến về 6.`), recall: { front: 'Đạo hàm khác tốc độ thay đổi trung bình ở điểm nào?', back: R`Tốc độ trung bình là $\frac{\Delta y}{\Delta x}$ trên một khoảng. Đạo hàm là giới hạn của tỉ số ấy khi khoảng tiến về 0, nếu giới hạn tồn tại.` }, trap: { title: 'Liên tục có nghĩa là có đạo hàm', wrong: '|x| liên tục tại 0 nên có đạo hàm tại 0.', right: 'Hai đạo hàm một phía khác nhau nên không có đạo hàm tại 0.', explanation: 'Liên tục là điều kiện cần của khả vi, không phải điều kiện đủ.' } },
      { id: 'section-2', title: 'Quy tắc tính và cấu trúc hàm hợp', conditions: 'Các hàm thành phần khả vi tại điểm xét; mẫu số khác $0$; đối số của logarit dương trên $\\mathbb{R}$.', definition: R`Với $y=f(g(x))$ và $u=g(x)$, nếu các hàm liên quan khả vi thì quy tắc dây chuyền là
$$\frac{dy}{dx}=\frac{dy}{du}\frac{du}{dx}=f'(g(x))g'(x).$$
Đạo hàm ngoài được tính tại giá trị trong; đạo hàm trong ghi tốc độ thay đổi của biến trung gian.`, content: R`### Bảng công thức gắn với miền xác định
$(x^a)'=ax^{a-1}$ trên miền mà lũy thừa thực đang xét khả vi; $(e^x)'=e^x$; $(\ln x)'=1/x$ với $x>0$. Với u khác 0, $(\ln|u|)'=u'/u$ trên khoảng không qua nghiệm của u.

### Hàm hợp cần nhân đạo hàm trong
Với $e^{x^2}$, hàm ngoài là hàm mũ và hàm trong là $x^{2}$, nên đạo hàm là $2xe^{x^2}$. Với $\ln(1+x^2)$, kết quả là $2x/(1+x^2)$.

### Đạo hàm bằng logarit
Khi cả cơ số và số mũ phụ thuộc x, chẳng hạn $y=x^x$ với $x>0$, lấy logarit: $\ln y=x\ln x$. Lấy đạo hàm hai vế cho $y'/y=\ln x+1$. Không dùng công thức lũy thừa với số mũ hằng cho trường hợp này.

### Cách kiểm tra
Kiểm tra miền xác định, đơn vị nếu có, và so với sai phân ở vài điểm không đặc biệt. Một kiểm tra số gần đúng không thay thế chứng minh nhưng phát hiện được nhiều lỗi thiếu hệ số.`, workedExample: example(R`Tính đạo hàm $y=x^2e^{3x}$ và $z=x^x$ $(x>0)$.`, [R`Với y, dùng quy tắc tích: $y'=2xe^{3x}+x^2\cdot3e^{3x}$.`, R`Rút gọn $y'=e^{3x}(2x+3x^2)$.`, R`Với z, lấy logarit $\ln z=x\ln x$, suy ra $z'/z=\ln x+1$.`, R`Do đó $z'=x^x(\ln x+1)$.`], R`Tại $x=1$, đạo hàm của $x^{x}$ bằng 1. Không được viết $x\cdot x^{x-1}$ vì số mũ không cố định.`), recall: { front: 'Làm thế nào tránh quên đạo hàm trong khi tính một hàm hợp?', back: R`Tách hàm ngoài f và hàm trong g trước: $(f(g(x)))'=f'(g(x))g'(x)$. Với $e^{3x}$ cần hệ số 3; với $\ln(1+x^2)$ cần hệ số $2x$.` }, trap: { title: 'Đạo hàm của tích bằng tích các đạo hàm', wrong: "$(uv)' = u'v'$.", right: "$(uv)' = u'v + uv'$.", explanation: 'Mỗi thừa số thay đổi tạo một đóng góp bậc một; không chỉ nhân hai tốc độ thay đổi.' } },
      { id: 'section-3', title: 'Hàm ẩn và điều kiện giải theo một biến', conditions: "Các đạo hàm riêng cấp một của $F$ liên tục gần $(x_{0},y_{0})$; $F(x_{0},y_{0})=0$ và $F_{y}(x_{0},y_{0})\\ne0$.", definition: R`Nếu $F(x,y(x))=0$ thì quy tắc hàm hợp cho
$$F_x+F_yy'=0,\qquad y'=-\frac{F_x}{F_y}.$$
Khi lấy đạo hàm theo $x$, xem $y$ là hàm của $x$; mỗi lần đạo hàm biểu thức chứa $y$ đều phải áp dụng quy tắc dây chuyền.`, content: R`### Lập luận từ đường ràng buộc
Ta di chuyển trên đường $F=0$, nên tổng biến thiên bậc một của F bằng 0. Thành phần do x thay đổi là $F_xdx$, do y thay đổi là $F_ydy$. Khi $F_y\ne0$, ta giải được tỉ số $dy/dx$.

### Khi mẫu bằng 0
Không chia cho $F_y=0$. Có thể đường có tiếp tuyến đứng và nên giải x theo y nếu $F_x\ne0$; cũng có thể là một điểm kỳ dị nếu cả hai cùng bằng 0. Cần xét bài toán cụ thể, không gọi mọi trường hợp ấy là đạo hàm vô hạn.

### Đừng quên kiểm tra điểm
Trước khi tính hệ số góc, xác nhận điểm thuộc đường $F=0$. Công thức tính tại một điểm không thuộc đường không mô tả tiếp tuyến của đường ấy.`, workedExample: example(R`Tính hệ số góc của đường tròn $x^2+y^2=25$ tại (3,4).`, [R`Điểm thuộc đường vì $3^2+4^2=25$.`, R`Đạo hàm theo x: $2x+2yy'=0$, nên $y'=-x/y$ khi y khác 0.`, R`Tại (3,4), $y'=-3/4$; tiếp tuyến $y-4=-\frac34(x-3)$.`], R`Tại (5,0), công thức $y' = -x/y$ không dùng được; tiếp tuyến của đường tròn ở đó là đường thẳng đứng $x=5$.`), recall: { front: "Công thức $y' = -F_{x}/F_{y}$ cần điều kiện nào?", back: "Điểm thuộc $F=0$; các đạo hàm riêng liên tục gần điểm; $F_{y}$ khác 0 để có thể giải y theo x và chia cho $F_{y}$." }, trap: { title: 'Coi y là hằng số khi đạo hàm hàm ẩn', wrong: "Đạo hàm của $y^{2}$ theo x bằng 2y.", right: "Đạo hàm bằng $2y\\cdot y'$.", explanation: 'y phụ thuộc x dọc theo đường ràng buộc nên cần quy tắc hàm hợp.' } },
      { id: 'section-4', title: 'Vi phân cấp một và xấp xỉ tuyến tính', conditions: "Hàm $f$ khả vi tại $x_{0}$; bước $h$ đủ nhỏ để $x_{0}+h$ còn thuộc miền xét. Vi phân $dy$ khác mức tăng thực $\\Delta y$.", definition: R`Đặt $h=\Delta x$. Mức tăng thực là $\Delta y=f(x_0+h)-f(x_0)$; vi phân là $dy=f'(x_0)h$.
$$f(x_0+h)=f(x_0)+f'(x_0)h+o(h).$$
Khi h nhỏ, bỏ phần dư để có xấp xỉ tuyến tính.`, content: R`### Vì sao xấp xỉ có cơ sở?
Định nghĩa đạo hàm cho $\Delta y/h\to f'(x_0)$. Do đó $\Delta y-f'(x_0)h$ nhỏ hơn bậc một so với h. Vi phân là phần tuyến tính, không phải một tên khác của toàn bộ mức tăng.

### Chọn điểm chuẩn
Chọn $x_{0}$ gần điểm cần tính và có $f(x_{0}), f'(x_{0})$ dễ tính. Chênh lệch h phải được ghi đúng dấu. Nếu h không nhỏ hoặc đạo hàm thay đổi nhanh, xấp xỉ có thể kém.

### Sai số tương đối
Với $f(x_{0})$ khác 0, $\Delta y/f(x_0)\approx[f'(x_0)/f(x_0)]h$. Muốn đổi thành phần trăm, nhân 100%. Không trộn h đo bằng đơn vị tuyệt đối với một số phần trăm.

Phạm vi bài học ở đây chỉ dùng vi phân cấp một và ứng dụng. Không sử dụng vi phân cấp hai.`, workedExample: example(R`Dùng vi phân xấp xỉ $\sqrt{4.08}$.`, [R`Chọn $f(x)=\sqrt x$, $x_0=4$, $h=0.08$.`, R`$f(4)=2$, $f'(4)=1/(2\sqrt4)=1/4$.`, R`$\sqrt{4.08}\approx2+\frac14\cdot0.08=2.02$.`], R`$2.02^2=4.0804$, gần 4,08. Sai lệch nhỏ phù hợp với một xấp xỉ, không được viết đây là đẳng thức chính xác.`), recall: { front: "$\\Delta y$ và dy khác nhau thế nào?", back: R`$\Delta y=f(x_0+h)-f(x_0)$ là thay đổi chính xác; $dy=f'(x_0)h$ là phần tuyến tính xấp xỉ. Dùng dấu $\approx$ khi thay $\Delta y$ bằng $dy$.` }, trap: { title: 'Dùng dấu bằng cho xấp xỉ', wrong: "$\\sqrt{4{,}08}=2{,}02$ chính xác.", right: "$\\sqrt{4{,}08}\\approx 2{,}02$ bằng xấp xỉ tuyến tính.", explanation: 'Phần dư bị bỏ đi; mức sai lệch phụ thuộc hàm và độ lớn của bước thay đổi.' } }
    ]
  },
  'chuyen-de-6': {
    summary: 'Biên đo thay đổi theo đơn vị tuyệt đối; co giãn đo thay đổi theo tỉ lệ. Hai đại lượng trả lời hai câu hỏi khác nhau và cần đơn vị, dấu, điểm đánh giá rõ ràng.',
    objectives: ['Phân biệt chi phí biên, chi phí bình quân và chi phí tăng thêm.', 'Tính và diễn giải hệ số co giãn có dấu.', 'Liên hệ doanh thu, cầu và điều kiện tối ưu một biến.'],
    references: ['Ghi chép Buổi 8 · trang 5: đại lượng biên và hệ số co giãn', 'TUD_v2.pdf · trang 36: bài toán hệ số co giãn K51', 'main.pdf · trang 40–41: co giãn của quan hệ tiết kiệm ẩn'],
    sections: [
      { id: 'section-1', title: 'Chi phí, doanh thu và lợi nhuận biên', conditions: 'Các hàm kinh tế khả vi; q ở miền sản lượng hợp lệ. Kiểm tra đơn vị tiền và sản lượng trước khi diễn giải.', definition: R`Với tổng chi phí C(q), doanh thu R(q), lợi nhuận $\pi(q)=R(q)-C(q)$:
$$MC=C'(q),\quad MR=R'(q),\quad\pi'=MR-MC.$$
Đại lượng biên là tốc độ tại q, không phải tổng hay bình quân.`, content: R`### Một đơn vị tăng thêm
$C(q+1)-C(q)$ là chi phí tăng chính xác khi thêm một sản phẩm. $MC(q)$ chỉ xấp xỉ mức tăng ấy khi hàm thay đổi đủ đều trên bước một đơn vị. Với bước $\Delta q$ nhỏ, $\Delta C\approx MC(q)\Delta q$.

### Đơn vị quyết định cách đọc
Nếu C tính bằng triệu đồng và q bằng sản phẩm, MC có đơn vị triệu đồng/sản phẩm. Nếu q tính bằng trăm sản phẩm thì một đơn vị q là 100 sản phẩm; phải đổi đơn vị trước khi phát biểu “thêm một sản phẩm”.

### Điều kiện lợi nhuận cực đại
Ở nghiệm tối ưu nội bộ khả vi, điều kiện cần là $MR=MC$. Chưa đủ kết luận cực đại: cần kiểm tra dấu của $\pi '$, độ cong hoặc so sánh giá trị trên miền khả thi, kể cả biên.`, workedExample: example(R`Cho $C(q)=20+2q+0.02q^2$ triệu đồng. Tại $q=40$, ước lượng chi phí tăng khi sản xuất thêm 10 sản phẩm và đối chiếu thực tế.`, [R`$MC(q)=2+0.04q$, nên $MC(40)=3.6$ triệu đồng/sản phẩm.`, R`Vi phân cho $\Delta C\approx3.6\cdot10=36$ triệu đồng.`, R`Mức tăng chính xác $C(50)-C(40)=170-132=38$ triệu đồng.`], R`Sai lệch 2 triệu đồng nhắc rằng bước 10 sản phẩm không phải vô cùng nhỏ. Nếu thêm 1 sản phẩm, xấp xỉ 3,6 và thực tế 3,62.`), recall: { front: "$MC(q), C(q)/q$ và $C(q+1)-C(q)$ lần lượt là gì?", back: "MC là chi phí biên tức thời; $C/q$ là chi phí bình quân; hiệu $C(q+1)-C(q)$ là mức tăng chính xác cho một sản phẩm. Không được đồng nhất ba đại lượng." }, trap: { title: 'Chi phí biên là tổng chi phí', wrong: "$MC(40)=3,6$ nên chi phí sản xuất 40 sản phẩm là 3,6.", right: 'MC chỉ đo tốc độ tăng tại mức 40.', explanation: "Trong ví dụ, tổng $C(40)=132$ triệu đồng; đơn vị của MC còn có “trên sản phẩm”." } },
      { id: 'section-2', title: 'Chi phí bình quân: quan hệ giữa bình quân và biên', conditions: R`Cần $q>0$ để xác định $AC(q)=\frac{C(q)}q$.`, definition: R`$$AC(q)=\frac{C(q)}q,\qquad
AC'(q)=\frac{qC'(q)-C(q)}{q^2}=\frac{MC(q)-AC(q)}q.$$
Vì $q>0$, dấu của $AC'$ bằng dấu của $MC-AC$.`, content: R`### Vì sao biên kéo bình quân?

Nếu chi phí của đơn vị tăng thêm thấp hơn mức bình quân hiện tại, nó kéo bình quân xuống; nếu cao hơn, nó đẩy bình quân lên. Công thức $AC'(q)=\frac{MC(q)-AC(q)}q$ diễn đạt chính xác cơ chế này: $MC<AC$ thì $AC$ giảm; $MC>AC$ thì $AC$ tăng.

### Điểm giao chưa tự động là cực tiểu

Tại một điểm dừng của $AC$, ta có $MC=AC$. Để kết luận cực tiểu, cần chứng minh $AC'$ đổi dấu từ âm sang dương hoặc lập luận tương đương; điều kiện dừng tự nó chưa đủ.

### Chi phí cố định

Nếu $C(q)=F+V(q)$ với $F$ cố định, $F$ không góp vào $MC$ nhưng vẫn góp $\frac Fq$ vào $AC$. Bỏ chi phí cố định khi tính bình quân làm sai mô hình.

Với $C(q)=100+2q+q^2$, ta có $AC(q)=\frac{100}{q}+2+q$. Đạo hàm âm khi $0<q<10$ và dương khi $q>10$, nên chi phí bình quân đạt cực tiểu toàn cục tại $q=10$. Khi đó $AC(10)=MC(10)=22$.`, workedExample: example(R`Với $C(q)=100+2q+q^2$, tìm mức sản lượng làm chi phí bình quân nhỏ nhất trên $q>0$.`, [R`$AC(q)=\frac{C(q)}q=\frac{100}{q}+2+q$.`, R`$AC'(q)=1-\frac{100}{q^2}=0$ cho $q=10$.`, R`$AC'<0$ khi $0<q<10$ và $AC'>0$ khi $q>10$, nên $q=10$ là điểm cực tiểu.`, R`$AC(10)=22$ và $MC(10)=2+2(10)=22$.`], 'Bất đẳng thức $\\frac{100}{q}+q\\ge20$ xác nhận cực tiểu toàn cục, đạt dấu bằng tại $q=10$.'),
      recall: { front: 'Khi nào chi phí bình quân giảm hoặc tăng theo quan hệ với chi phí biên?', back: R`Vì $AC'(q)=\frac{MC(q)-AC(q)}q$ và $q>0$, $MC<AC$ làm bình quân giảm, còn $MC>AC$ làm bình quân tăng.` },
      trap: { title: 'Kết luận cực tiểu chỉ từ phương trình', wrong: 'Mọi nghiệm của $MC=AC$ đều là điểm cực tiểu của $AC$.', right: 'Kiểm tra dấu của $AC\\prime$ quanh nghiệm hoặc chứng minh cực tiểu bằng cách khác.', explanation: 'Điều kiện đạo hàm bằng không chỉ xác định điểm dừng.' }
    },
      { id: 'section-3', title: 'Hệ số co giãn và phản ứng theo phần trăm', conditions: R`Tại điểm xét cần $x\ne0$ và $y=f(x)\ne0$; trong diễn giải kinh tế thường xét $x>0$ và $y>0$.`, definition: R`Hệ số co giãn có dấu của $y=f(x)$ theo $x$ là
$$\varepsilon_{y,x}=\frac{x}{y}f'(x).$$
Với biến thiên nhỏ, $\frac{\Delta y}{y}\approx\varepsilon_{y,x}\frac{\Delta x}{x}$. Hệ số không có đơn vị.`, content: R`### Từ tốc độ tuyệt đối đến độ nhạy tương đối

Đạo hàm $f'(x)$ phụ thuộc đơn vị đo. Nhân với $\frac{x}{y}$ chuẩn hóa tốc độ theo quy mô ban đầu của cả đầu vào lẫn đầu ra, cho phép so sánh phản ứng phần trăm giữa các trạng thái hoặc mô hình khác đơn vị.

Dấu của $\varepsilon_{y,x}$ cho biết chiều phản ứng. Nếu $|\varepsilon_{y,x}|>1$, đầu ra phản ứng mạnh hơn đầu vào theo phần trăm; nếu $|\varepsilon_{y,x}|<1$, phản ứng yếu hơn. Với $y=Ax^\alpha$ trên $x>0$, hệ số bằng $\alpha$; với hàm tổng quát, hệ số thường thay đổi theo trạng thái.

### Co giãn cầu và doanh thu

Với lượng cầu $q=q(p)>0$, co giãn có dấu là $\varepsilon_{q,p}=\frac{p}{q}q'(p)$. Doanh thu $R(p)=p\,q(p)$ thỏa
$$R'(p)=q(p)+p\,q'(p)=q(p)(1+\varepsilon_{q,p}).$$
Khi cầu dốc xuống, $\varepsilon_{q,p}<-1$ cho biết tăng giá nhỏ làm doanh thu giảm cục bộ; $-1<\varepsilon_{q,p}<0$ cho biết doanh thu tăng. Tại $\varepsilon_{q,p}=-1$, $R'(p)=0$, nhưng cần xét sự đổi dấu hoặc dạng hàm để kết luận cực đại. Một số giáo trình ghi độ co giãn cầu dương $-\varepsilon_{q,p}$; phải thống nhất quy ước trước khi dùng kết quả.

### Ví dụ K51: hàm căn và điểm đánh giá

Cho $y=\frac{x}{\sqrt{x+30}}$, $x>0$. Ta có
$$y'=\frac{x+60}{2(x+30)^{3/2}},\qquad
\varepsilon_{y,x}=\frac{x+60}{2(x+30)}.$$
Tại $x=30$, $\varepsilon_{y,x}=\frac34$. Vì hệ số dương, tăng $x$ một phần trăm nhỏ làm $y$ tăng xấp xỉ $0{,}75\%$. Đây là kết luận tại trạng thái $x=30$, không phải một tỉ lệ chính xác cho mọi bước thay đổi.`, workedExample: example(R`Cho $y=\frac{x}{\sqrt{x+30}}$, $x>0$. Tính hệ số co giãn tại $x=30$.`, [R`Đạo hàm: $y'=(x+30)^{-1/2}-\frac{x}{2}(x+30)^{-3/2}=\frac{x+60}{2(x+30)^{3/2}}$.`, R`Theo định nghĩa, $\varepsilon_{y,x}=\frac{x}{y}y'=\frac{x+60}{2(x+30)}$.`, R`Tại $x=30$, $\varepsilon_{y,x}=\frac{90}{120}=\frac34$.`, R`Do đó mức tăng nhỏ $1\%$ của $x$ gây ra mức tăng xấp xỉ $0{,}75\%$ của $y$.`], 'Với thay đổi hữu hạn, dùng hàm ban đầu để tính phần trăm chính xác; không đồng nhất nó với xấp xỉ vi phân.'),
      recall: { front: 'Hệ số co giãn khác đạo hàm ở điểm nào?', back: R`Đạo hàm $y'$ đo thay đổi tuyệt đối trên một đơn vị $x$; $\varepsilon_{y,x}=\frac{x}{y}y'$ đo phản ứng tương đối và không có đơn vị.` },
      trap: { title: 'Bỏ dấu hoặc quy ước co giãn', wrong: 'Hệ số co giãn cầu luôn được định nghĩa là số dương.', right: 'Nêu rõ đang dùng co giãn có dấu $\\varepsilon_{q,p}$ hay độ co giãn dương $-\\varepsilon_{q,p}$.', explanation: 'Hai quy ước cho cùng độ lớn nhưng khác dấu; điều kiện doanh thu phải nhất quán.' }
    }

    ]
  },
  'chuyen-de-7': {
    summary: 'Đạo hàm riêng đo tốc độ khi thay đổi một biến và giữ các biến độc lập còn lại cố định. Quy tắc dây chuyền theo dõi nhiều đường tác động; vi phân toàn phần ghép các thay đổi nhỏ thành một xấp xỉ tuyến tính. Mô hình Cobb–Douglas nối năng suất biên, co giãn và lợi suất theo quy mô.',
    objectives: ['Tính đạo hàm riêng từ định nghĩa và từ công thức; xác định rõ biến đang thay đổi, biến đang giữ cố định và điểm đánh giá.', 'Dùng quy tắc dây chuyền khi một đại lượng phụ thuộc vào nhiều biến trung gian; phân biệt đạo hàm riêng với đạo hàm dọc theo một quá trình.', 'Lập vi phân toàn phần để xấp xỉ mức thay đổi đồng thời, ghi đúng dấu và phân biệt xấp xỉ cục bộ với thay đổi hữu hạn chính xác.', 'Phân tích hàm sản xuất Cobb–Douglas bằng năng suất biên, co giãn riêng và tổng số mũ.'],
    references: ['Ghi chép Buổi 8 · đạo hàm riêng, hàm nhiều biến và quy tắc dây chuyền', 'TUD_v2.pdf · trang 25–27: đạo hàm riêng, hàm hợp, vi phân toàn phần và xấp xỉ', 'TUD_v2.pdf · trang 31: hàm sản xuất và co giãn', 'Slide LXT · lecture08, trang 3–13: hàm nhiều biến và các quy tắc đạo hàm', 'main.pdf · trang 177–179, 185–186, 190–191: bài toán đạo hàm riêng, vi phân và hàm sản xuất'],
    sections: [
      { id: 'section-1', title: 'Đạo hàm riêng và mặt cắt', conditions: 'Hàm được xác định trong lân cận điểm xét; giới hạn tương ứng phải tồn tại hữu hạn. Khi lấy đạo hàm theo một biến, giữ các biến độc lập còn lại cố định.', definition: R`Với $z=f(x,y)$, tại $(x_{0},y_{0})$:
$$\frac{\partial f}{\partial x}(x_{0},y_{0})=\lim_{h\to0}\frac{f(x_{0}+h,y_{0})-f(x_{0},y_{0})}{h},\qquad
\frac{\partial f}{\partial y}(x_{0},y_{0})=\lim_{k\to0}\frac{f(x_{0},y_{0}+k)-f(x_{0},y_{0})}{k}.$$
Khi tính $f_{x}$, giữ $y$ cố định; khi tính $f_{y}$, giữ $x$ cố định.`, content: R`### Vectơ gradient
$\nabla f=(f_x,f_y)$ gom các tốc độ riêng. Khi f khả vi, đạo hàm theo vectơ đơn vị u là $D_uf=\nabla f\cdot u$. Hướng gradient cho tốc độ tăng lớn nhất trong chuẩn Euclid; vectơ phải được chuẩn hóa trước khi gọi là hướng đơn vị.

### Có đạo hàm riêng chưa đủ để khả vi
Các giới hạn riêng chỉ kiểm tra hai hướng tọa độ. Có thể tồn tại các đạo hàm riêng tại một điểm nhưng hàm không liên tục ở đó. Một điều kiện đủ thường dùng là $f_{x}, f_{y}$ liên tục trong lân cận.

### Đạo hàm hỗn hợp
Nếu các đạo hàm riêng cấp hai liên tục gần điểm thì $f_{xy}=f_{yx}$. Đây là giả thiết quan trọng của định lý Schwarz, không phải phép đổi thứ tự luôn hợp lệ trong mọi hàm kỳ dị. Đạo hàm riêng cấp hai vẫn cần cho Hessian; không đồng nhất nó với vi phân cấp hai.`, workedExample: example(R`Tính $f_{x}, f_{y}$ và đạo hàm hỗn hợp của $f(x,y)=x^2y+e^{xy}$.`, [R`Giữ y cố định: $f_x=2xy+ye^{xy}$.`, R`Giữ x cố định: $f_y=x^2+xe^{xy}$.`, R`$f_{xy}=2x+e^{xy}+xye^{xy}$. Tính $f_{yx}$ cho cùng kết quả.`, R`Các hàm thành phần trơn trên toàn mặt phẳng nên điều kiện đổi thứ tự được thỏa.`], R`Hệ số y trong đạo hàm $e^{xy}$ theo x đến từ quy tắc hàm hợp; theo y thì hệ số là x.`), recall: { front: 'Tính đạo hàm riêng theo x phải giữ gì cố định? Khi nào được đổi thứ tự đạo hàm hỗn hợp?', back: "Giữ các biến độc lập khác cố định. Được dùng $f_{xy}=f_{yx}$ khi các đạo hàm riêng cấp hai liên tục trong lân cận điểm đang xét." }, trap: { title: 'Coi biến còn lại cũng thay đổi trong đạo hàm riêng', wrong: 'Tính ∂/∂x nhưng đồng thời đạo hàm y như y(x).', right: 'Với x,y độc lập, giữ y cố định; nếu y phụ thuộc x phải dùng đạo hàm toàn phần.', explanation: 'Đạo hàm riêng và đạo hàm dọc một đường là hai bài toán khác nhau.' } },
      { id: 'section-2', title: 'Vi phân toàn phần và thay đổi đồng thời', conditions: 'f khả vi tại điểm; các mức thay đổi nhỏ và ở trong miền xác định. Chỉ dùng vi phân cấp một.', definition: R`Vi phân toàn phần:
$$df=f_xdx+f_ydy.$$
Với $h=\Delta x, k=\Delta y$ nhỏ, $\Delta f\approx f_xh+f_yk$. Mọi đạo hàm được tính tại **điểm ban đầu**.`, content: R`### Mặt phẳng tiếp xúc
Phần tuyến tính $f(x_0,y_0)+f_x(x_0,y_0)(x-x_0)+f_y(x_0,y_0)(y-y_0)$ là mặt phẳng tiếp xúc đồ thị tại điểm đang xét. Nó kết hợp hai thay đổi đồng thời mà không thay lại điểm đánh giá sau từng bước.

### Đạo hàm theo thời gian
Nếu $x=x(t), y=y(t)$, thì $dz/dt=f_xx'+f_yy'$. Mỗi hạng phản ánh một kênh tác động; bỏ một hạng nghĩa là bỏ một biến đang thay đổi.

### Bù đắp một yếu tố
Muốn giữ z gần như không đổi, đặt $df=0$. Nếu $f_{y}$ khác 0, $dy/dx\approx-f_x/f_y$ dọc đường mức. Đây là quan hệ bù đắp cục bộ, không bảo đảm thay đổi lớn vẫn giữ chính xác cùng z.`, workedExample: example(R`Với $f(x,y)=x^2y$, từ (2,3) thay đổi $\Delta x=0,01$ và $\Delta y=-0,02$. Ước lượng $\Delta f$.`, [R`Tại điểm đầu: $f_x=2xy=12$, $f_y=x^2=4$.`, R`$df=12(0.01)+4(-0.02)=0.04$.`, R`Giá trị thực: $f(2.01,2.98)=12.039498$, nên $\Delta f=0.039498$.`], R`Xấp xỉ 0,04 gần mức tăng thực. Không thế (2,01;2,98) vào đạo hàm khi đang tuyến tính hóa tại (2,3).`), recall: { front: "Khi dùng $df = f_{x}dx + f_{y}dy$, đánh giá các đạo hàm ở đâu?", back: 'Tại điểm ban đầu của xấp xỉ. Nếu di chuyển sang điểm khác rồi tính đạo hàm, đó là một tuyến tính hóa khác.' }, trap: { title: 'Đổi dấu của thay đổi giảm', wrong: "Biến y giảm 0,02 nhưng dùng $dy=+0,02$.", right: "Dùng $dy=-0,02$ trong vi phân.", explanation: 'Dấu của biến thiên và dấu của đạo hàm cùng quyết định chiều tác động.' } },
      { id: 'section-3', title: 'Cobb–Douglas, biên và co giãn riêng', conditions: "$Q=A K^{\\alpha }L^{\\beta }, A>0, K>0, L>0$; diễn giải thông thường dùng $\\alpha ,\\beta >0$.", definition: R`Với $Q=A K^\alpha L^\beta$:
$$MP_K=Q_K=\alpha\frac QK,\qquad MP_L=Q_L=\beta\frac QL.$$
Co giãn riêng của Q theo K là $\alpha$, theo L là $\beta$.`, content: R`### Giữ một yếu tố cố định
$MP_{K}$ là sản lượng tăng thêm xấp xỉ khi tăng vốn một đơn vị và giữ lao động cố định. $MP_{L}$ có ý nghĩa tương tự. Đường đồng lượng cho những phối hợp K,L tạo cùng Q; dọc đường đó, $dL/dK=-Q_K/Q_L$ khi $Q_{L}$ khác 0.

### Lợi suất theo quy mô
Tăng **cả hai** yếu tố lên t lần:
$$Q(tK,tL)=t^{\alpha+\beta}Q(K,L).$$
Tổng số mũ lớn hơn 1: tăng theo quy mô; bằng 1: không đổi; nhỏ hơn 1: giảm theo quy mô. Khái niệm này khác năng suất biên giảm khi chỉ một yếu tố tăng.

### Euler cho hàm thuần nhất
Lấy đạo hàm theo t của đẳng thức thuần nhất tại $t=1$:
$$KQ_K+LQ_L=(\alpha+\beta)Q.$$
Đây cũng là một phép kiểm tra công thức đạo hàm. Khi $0<\alpha <1, MP_{K}$ giảm theo K nếu L cố định, dù tổng $\alpha +\beta$ vẫn có thể lớn hơn 1.`, workedExample: example(R`Cho $Q=10\sqrt{KL}$ tại $K=L=25$. Tính hai năng suất biên và đánh giá quy mô.`, [R`$Q=10\sqrt{625}=250$. Hai số mũ đều $1/2$.`, R`$MP_K=\frac12\cdot250/25=5$ và $MP_L=5$.`, R`$\alpha +\beta =1$: tăng cả K,L gấp đôi làm Q tăng từ 250 lên 500.`, R`Chỉ tăng K từ 25 lên 26: dQ≈5; giá trị thực tăng $10\sqrt{650}-250\approx4.951$.`], R`Euler: $25\cdot 5+25\cdot 5=250=Q$. Quy mô không đổi nhưng biên vốn vẫn giảm khi riêng K tăng.`), recall: { front: 'Lợi suất theo quy mô khác năng suất biên giảm thế nào?', back: 'Quy mô thay đổi đồng thời mọi đầu vào; biên riêng thay một đầu vào và giữ các đầu vào còn lại cố định. Hai hiện tượng có thể cùng xuất hiện.' }, trap: { title: 'Nhầm hệ số A với co giãn', wrong: "$Q=10K^{1/2}L^{1/2}$ nên co giãn theo K là 10.", right: "Co giãn riêng theo K là $1/2$.", explanation: 'Hệ số A quyết định mức sản lượng; số mũ mới quyết định co giãn riêng của Cobb–Douglas.' } }
    ]
  }
};
