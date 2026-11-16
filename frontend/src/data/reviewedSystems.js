const R = String.raw;
const ex = (question, steps, casioTip) => ({ question, steps, casioTip });
const recall = (front, back) => ({ front, back });
const trap = (title, wrong, right, explanation) => ({ title, wrong, right, explanation });
export const reviewedSystems = {
  summary: 'Từ hệ phương trình, lập $AX=B$ và ký hiệu ma trận mở rộng $\\bar A$, rồi giải bằng Gauss và phân loại nghiệm bằng hạng. Tách ba tuyến làm bài: trắc nghiệm thế từng giá trị $m$ vào Casio HT; tự luận dùng hạng ngay từ đầu; hoặc tách $|A(m)|$, dùng Cramer khi $|A(m)|\\ne0$ và xét hạng tại từng giá trị suy biến.',
  objectives: ['Lập A, X, B và $\\bar A$ theo cùng thứ tự ẩn, kể cả hệ chữ nhật.', 'Giải bằng Gauss, viết nghiệm tổng quát và kiểm tra bằng thế lại.', 'Thay đúng cột trong Cramer $3\\times3$; chỉ áp dụng khi $|A|\\ne0$.', 'Phân biệt cách xử lý trắc nghiệm và tự luận khi hệ phụ thuộc tham số.'],
  references: ['Buổi 2 · trang 5–10; Buổi 3 · trang 1–3; Buổi 4 · trang 1–8', 'TL Phu · Buổi 2 · trang 3–7; Buổi 3 · trang 2–10; Buổi 5 · trang 6–8', 'TL1_HPT_LG.pdf · trang 11–15, 24, 29–31; TUD_v2.pdf · trang 14–16', 'Slide LXT · lecture05 · trang 2–10; main.pdf · trang 222–223; trang 6, 44–45: hệ tham số K51'],
  sections: [{
    id: 'section-1', title: 'Hệ tuyến tính và phương trình ma trận AX=B', scene: 'system-matrix',
    conditions: 'Hệ m phương trình, n ẩn; các ẩn xuất hiện bậc nhất, không có tích giữa các ẩn. Giữ cùng một thứ tự ẩn.',
    definition: R`Hệ tuyến tính tổng quát gồm $m$ phương trình bậc nhất theo $n$ ẩn:
$$\begin{cases}
a_{11}x_1+\cdots+a_{1n}x_n=b_1,\\
a_{21}x_1+\cdots+a_{2n}x_n=b_2,\\
a_{31}x_1+\cdots+a_{3n}x_n=b_3,\\
\vdots\\
a_{m1}x_1+\cdots+a_{mn}x_n=b_m.
\end{cases}$$
Đặt $A=(a_{ij})_{m\times n}$ là ma trận hệ số, $X=(x_1,\ldots,x_n)^T$ là cột ẩn và $B=(b_1,\ldots,b_m)^T$ là cột vế phải. Khi đó hệ được viết gọn thành **$AX=B$**. Chỉ giới thiệu ký hiệu ma trận mở rộng một lần:
$$\boxed{\bar A=[A\mid B].}$$
Về sau, $\bar A$ luôn chỉ ma trận mở rộng của hệ đang xét.`,
    content: R`### Vì sao phép nhân biểu diễn đúng hệ?
Dòng i của A nhân với cột X cho tổng $a_{i1}x_{1}+$…+$a_{in}x_{n}$, chính là vế trái phương trình i. Vì thế
$$A_{m\times n}X_{n\times1}=B_{m\times1}.$$
Mỗi dòng giữ một phương trình; mỗi cột giữ hệ số của cùng một ẩn. Nếu ẩn vắng mặt, ghi hệ số 0 tại đúng ô, không dịch các hệ số còn lại để lấp chỗ.

### Ma trận hệ số và ma trận mở rộng
Vạch đứng trong ký hiệu định nghĩa phân biệt khối hệ số với cột vế phải; nó không phải một cột mới, cũng không phải dấu định thức. $AX=B$ diễn đạt hệ bằng phép nhân; $\bar A$ ghi các hệ số và vế phải trong cùng một bảng để khử.
### Không ép hệ chữ nhật thành hệ vuông
Hệ 3 phương trình, 4 ẩn cho A kích thước $3\times 4$ và ma trận mở rộng kích thước $3\times 5$. Không cần thêm phương trình $0=0$. Thêm phương trình thừa không đổi nghiệm, nhưng cũng không tạo thông tin mới hay biến hệ thành hệ Cramer.

### Đọc ngược để kiểm tra
Đọc từng dòng của tích AX để lấy lại các phương trình, kể cả hệ số 0. Nếu dấu hoặc thứ tự ẩn không khớp hệ ban đầu, ma trận đã được lập sai; việc giải đúng ma trận sai vẫn không giải được bài toán gốc.

### Bốn khối và kích thước của chúng

| Ký hiệu | Kích thước | Cách đọc |
|---|---|---|
| $A=(a_{ij})$ | $m\times n$ | Dòng i ứng với phương trình i; cột j chứa hệ số của ẩn $x_j$. |
| $X=(x_1,\ldots,x_n)^T$ | $n\times1$ | Cột ẩn theo một thứ tự cố định. |
| $B=(b_1,\ldots,b_m)^T$ | $m\times1$ | Cột vế phải, cùng thứ tự với các phương trình. |
| $AX$ | $m\times1$ | Các vế trái thu được từ phép nhân từng dòng với X. |
| $\bar A$ | $m\times(n+1)$ | Bảng hệ số kèm cột vế phải để khử dòng; dấu phân cách chỉ chia hai khối. |

Bảng kích thước là phép kiểm tra nhanh cho phương trình ma trận: số cột của A phải bằng số dòng của X, còn kết quả AX phải có cùng kích thước với B.`,
    workedExample: ex(R`Lập dạng ma trận của $x+y-z=10,\ 2x+y=5,\ x-z=6$.`, [R`Chọn thứ tự x,y,z. Hệ số z ở phương trình 2 và y ở phương trình 3 đều là 0.`, R`$A=\begin{pmatrix}1&1&-1\\2&1&0\\1&0&-1\end{pmatrix},\quad X=\begin{pmatrix}x\\y\\z\end{pmatrix},\quad B=\begin{pmatrix}10\\5\\6\end{pmatrix}$.`, R`Hệ là $AX=B$; ma trận mở rộng $\left(\begin{array}{ccc|c}1&1&-1&10\\2&1&0&5\\1&0&-1&6\end{array}\right)$.`], "Dòng 3 đọc thành $1x+0y-1z=6$. Số dòng, số cột và thứ tự ẩn đều khớp."),
    recall: recall('Hệ 3 phương trình, 4 ẩn: kích thước A, X, B, ma trận mở rộng?', "$A$: $3\\times4$; $X$: $4\\times1$; $B$: $3\\times1$; $\\bar A$: $3\\times5$. Số ẩn bằng số cột của A."),
    trap: trap('Bỏ ô của ẩn không xuất hiện', "$2x+y=5$ chỉ cần hai ô hệ số trong hệ ba ẩn.", 'Theo thứ tự x,y,z phải ghi (2,1,0).', 'Ô 0 giữ đúng địa chỉ của ẩn, không được bỏ.'),
  }, {
    id: 'gauss-system', title: 'Gauss: từ biến đổi tương đương đến thế ngược', scene: 'gauss-system',
    conditions: 'Biến đổi dòng trên toàn bộ $\\bar A$. Mỗi thao tác phải hoàn tác được để giữ nguyên tập nghiệm.',
    definition: R`Ba phép biến đổi tương đương: đổi chỗ hai phương trình; nhân một phương trình với số khác 0; cộng một bội của phương trình khác vào một phương trình.
Sau khi khử, gọi $U$ là khối hệ số và $C$ là cột vế phải của bảng bậc thang thu được. Hệ ban đầu tương đương $UX=C$. Giải từ phương trình cuối lên trên gọi là **thế ngược**.`,
    content: R`### Thao tác dòng chính là thao tác phương trình
$d_{2}\leftarrow d_{2}-2d_{1}$ thay phương trình 2 bằng hiệu của nó với hai lần phương trình 1, gồm cả vế phải. Có thể cộng lại hai lần phương trình 1 để lấy lại phương trình 2 cũ; do hoàn tác được nên hai hệ có cùng tập nghiệm.

### Ba loại dòng cuối
Dòng $(0,0,0|c), c\ne 0$, là mệnh đề $0=c$ nên vô nghiệm. Dòng toàn 0 chỉ là $0=0$, được bỏ qua khi giải. Dòng có một hệ số khác 0 xác định một ẩn theo các ẩn còn lại. Cần đọc cả khối hệ số lẫn cột vế phải.

### Vì sao ưu tiên biến đổi dòng?
Đổi dòng chỉ đổi thứ tự phương trình. Đổi cột hệ số đổi thứ tự ẩn; nếu không ghi lại, nghiệm đọc ra sẽ bị hoán đổi. Quy trình ở đây chỉ thao tác dòng để giữ thứ tự x,y,z xuyên suốt.

### Không cần khử quá mức
Để thế ngược, chỉ cần bảng bậc thang, không bắt buộc đưa A thành I. Trong bài tham số, nên giữ biểu thức trụ ở dòng cuối để xét điều kiện trước khi chuẩn hóa. Sau mỗi phép, các dòng dùng trong bước tiếp theo là dòng đã cập nhật.`,
    workedExample: ex(R`Giải $x+2y+2z=-1,\ 2x+3y+3z=0,\ x+3y-z=1$.`, [R`Lập $\left(\begin{array}{ccc|c}1&2&2&-1\\2&3&3&0\\1&3&-1&1\end{array}\right)$.`, R`$d_2\leftarrow d_2-2d_1$, $d_3\leftarrow d_3-d_1$: hai dòng dưới là $(0,-1,-1|2), (0,1,-3|2)$.`, R`$d_3\leftarrow d_3+d_2$ cho $(0,0,-4|4)$, nên $z=-1$.`, R`Thế ngược: −$y-z=2$ cho $y=-1; x+2y+2z=-1$ cho $x=3$.`], "Thế $(3,-1,-1)$ vào ba phương trình được vế phải $(-1,0,1)$. Cramer ở mục sau cho cùng kết quả."),
    recall: recall('Vì sao khử hệ phải biến đổi cả cột B?', 'Vì phép lấy hiệu hoặc nhân phương trình tác động lên cả hai vế. Chỉ thay hệ số sẽ tạo một hệ khác.'),
    trap: trap('Trộn dòng cũ và dòng mới', "Trong các bước liên tiếp có thể tùy ý dùng $d_{2}$ trước hoặc sau cập nhật.", 'Dùng dòng hiện có, trừ khi chỉ rõ dùng dòng cũ.', 'Viết ma trận mới sau từng phép giúp kiểm soát thứ tự và dấu.'),
  }, {
    id: 'section-2', title: 'Định lý Kronecker–Capelli và nghiệm tổng quát', scene: 'rank-cases',
    references: ['Slide LXT · lecture05 · trang 3–6', 'MIT OpenCourseWare · 18.06 · Lecture 8: Solving Ax=b: Row Reduced Form R'],
    conditions: 'n là số ẩn. Tính hạng A và ma trận mở rộng từ cùng một quá trình khử.',
    definition: R`Hệ $AX=B$ có nghiệm khi và chỉ khi
$$\boxed{r(A)=r(\bar A).}$$
Hạng chung bằng n: nghiệm duy nhất. Hạng chung $r<n$: vô số nghiệm phụ thuộc $n-r$ tham số. Hai hạng khác nhau: vô nghiệm.`,
    content: R`### Hai hạng so sánh điều gì?
Trong bảng bậc thang, r(A) đếm các trụ thuộc khối hệ số. Ghép một cột B chỉ có thể tăng hạng thêm nhiều nhất 1. Nếu B tạo trụ mới trên dòng mà mọi hệ số bằng 0, đó là phương trình mâu thuẫn. Nếu không có trụ mâu thuẫn, hệ tương thích.

### Sau khi có nghiệm: duy nhất hay vô số?
Mỗi trụ xác định một ẩn theo các ẩn phía sau. Có n trụ thì thế ngược xác định duy nhất cả n ẩn. Nếu thiếu trụ, các ẩn ở cột không có trụ được chọn tự do. Đặt chúng bằng $n-r$ tham số thực rồi biểu diễn các ẩn trụ theo tham số.

### Nghiệm tổng quát phải chứa mọi nghiệm
Bảng có $x+y+z=3, y-z=0$ và dòng 0 cho phép đặt $z=t$; khi ấy $y=t, x=3-2t$. Vậy nghiệm là $(3-2t,t,t), t\in \mathbb R$. Chọn riêng $t=0$ chỉ tạo một nghiệm riêng, chưa giải đầy đủ hệ.

### Hai phía của bước kiểm tra
Thế biểu thức tham số vào hệ phải đúng với mọi tham số. Đồng thời mọi nghiệm của bảng bậc thang đều phải được tạo bởi cách chọn các ẩn tự do ấy. Số phương trình bằng số ẩn không thay thế được tiêu chuẩn hai hạng; phương trình có thể thừa hoặc mâu thuẫn.

### Bảng phân loại nghiệm sau khi tính hạng

| Điều kiện hạng | Kết luận | Cách đọc nghiệm sau khử |
|---|---|---|
| $r(A)=r(\bar A)=n$ | Nghiệm duy nhất | Mỗi ẩn là ẩn trụ; thế ngược xác định một bộ nghiệm. |
| $r(A)=r(\bar A)=r<n$ | Vô số nghiệm | Chọn $n-r$ ẩn không có trụ làm tham số rồi biểu diễn các ẩn trụ. |
| $r(A)<r(\bar A)$ | Vô nghiệm | Có một dòng dạng $0= c$ với $c\ne0$. |

Một cột vế phải được thêm vào A nên $r(\bar A)$ chỉ có thể bằng $r(A)$ hoặc tăng đúng 1. Chỉ trường hợp hai hạng bằng nhau mới cho phép tiếp tục phân loại theo số ẩn n.`,
    workedExample: ex(R`Đọc nghiệm từ $\left(\begin{array}{ccc|c}1&1&1&3\\0&1&-1&0\\0&0&0&0\end{array}\right)$; sau đó thay ô cuối bằng 1.`, [R`Bảng ban đầu có $r(A)=r(\bar A)=2<3$, nên có một ẩn tự do.`, R`Đặt $z=t$; dòng 2 cho $y=t$, dòng 1 cho $x=3-2t$.`, R`Nếu ô cuối bằng 1, xuất hiện $0=1$: $r(A)=2$ nhưng $r(\bar A)=3$, hệ vô nghiệm.`], 'Một ô thuộc cột vế phải có thể thay đổi tính tương thích mà không đổi A.'),
    recall: recall('Hệ 4 ẩn có hai hạng cùng bằng 3: kết luận và cách tìm nghiệm?', 'Vô số nghiệm, một tham số. Chọn ẩn không có trụ làm tham số, thế ngược tìm ba ẩn trụ.'),
    trap: trap('Chỉ xét hạng A', "$r(A)<n$ nên hệ có vô số nghiệm.", "Còn phải so sánh hạng của A với hạng ma trận mở rộng; nếu khác nhau, hệ vô nghiệm.", 'Thiếu trụ loại khả năng duy nhất, chưa bảo đảm tồn tại nghiệm.'),
  }, {
    id: 'homogeneous', title: 'Hệ thuần nhất: nghiệm tầm thường và ẩn tự do', scene: 'homogeneous',
    references: ['Slide LXT · lecture05 · trang 2–6', 'MIT OpenCourseWare · 18.06SC · Lecture 7: Solving Ax=0; pivot variables and special solutions'],
    conditions: 'A có m dòng, n cột; mọi vế phải bằng 0. Mô tả nghiệm bằng hạng và số ẩn tự do.',
    definition: R`Hệ $AX=0$ gọi là **hệ tuyến tính thuần nhất**. $X=0$ luôn là nghiệm, gọi là nghiệm tầm thường.
Nếu $r(A)=n$ thì $X=0$ là nghiệm duy nhất. Nếu $r(A)<n$ thì hệ có vô số nghiệm phụ thuộc $n-r(A)$ tham số, trong đó có nghiệm không tầm thường.
Khi A vuông, có nghiệm không tầm thường khi và chỉ khi $|A|=0$.`,
    content: R`### Vì sao không thể vô nghiệm?
Thế mọi ẩn bằng 0 làm mọi vế trái bằng 0. Mọi phép khử cũng giữ cột vế phải toàn 0, không thể xuất hiện mâu thuẫn $0=c$ với $c\ne 0$. Vì vậy $r(\bar A)=r(A)$ trong mọi trường hợp.

### Tìm nghiệm không tầm thường
Đưa A về bậc thang, chọn ẩn tự do rồi thế ngược. Khi có ẩn tự do, chọn ít nhất một tham số khác 0 tạo nghiệm khác 0. Nếu $m<n$ thì $r(A)\le m<n$; hệ thuần nhất chắc chắn có vô số nghiệm, dù các phương trình còn lại độc lập với nhau.

### Quan hệ giữa nghiệm của hai hệ
Nếu $AX_1=0$ và $AX_2=0$, thì với mọi $\alpha,\beta\in\mathbb R$,
$$A(\alpha X_1+\beta X_2)=0.$$
Mọi tổ hợp tuyến tính của các nghiệm thuần nhất vẫn là nghiệm thuần nhất.

Giả sử $X_p$ là một nghiệm riêng của $AX=B$. Nếu $X_h$ giải $AX_h=0$, thì
$$A(X_p+X_h)=AX_p+AX_h=B.$$
Ngược lại, nếu $X$ là một nghiệm bất kỳ của $AX=B$, thì $A(X-X_p)=B-B=0$. Vì vậy, sau khi tìm được một nghiệm riêng, ta tìm tất cả nghiệm bằng cách cộng vào đó nghiệm tổng quát của hệ thuần nhất. Lập luận này cũng cho thấy hiệu của hai nghiệm bất kỳ của cùng một hệ không thuần nhất luôn giải hệ thuần nhất.
`,
    workedExample: ex(R`Giải $x+2y+2z=0,\ 2x+3y+z=0,\ x+y-z=0$.`, [R`$d_2\leftarrow d_2-2d_1$, $d_3\leftarrow d_3-d_1$ cho cùng dòng $(0,-1,-3|0)$. Trừ hai dòng được dòng 0.`, R`Hạng A bằng 2, có một ẩn tự do. Đặt $z=t$.`, R`−$y-3z=0$ cho $y=-3t$; dòng đầu cho $x=4t$.`, R`$(x,y,z)=(4t,-3t,t)$, $t\in \mathbb R$. $t=0$ là nghiệm tầm thường; $t\ne 0$ cho nghiệm không tầm thường.`], "Phương trình 3 nhận $4t-3t-t=0$ với mọi t. Cột vế phải vẫn bằng 0 trong toàn bộ phép khử."),
    recall: recall("Hệ thuần nhất m phương trình, n ẩn với $m<n$ có thể chỉ có nghiệm 0 không?", "Không: $r(A)\\le m<n$, nên có ít nhất một ẩn tự do và vô số nghiệm, gồm nghiệm khác 0."),
    trap: trap('Hệ thuần nhất suy biến có thể vô nghiệm', "$|A|=0$ nên $AX=0$ có thể vô nghiệm.", "$AX=0$ luôn có $X=0; A$ vuông suy biến còn có vô số nghiệm.", 'Vế phải 0 bảo đảm tính tương thích.'),
  }, {
    id: 'section-3', title: "Cramer $3\\times3$: thay cột và tính từng ẩn", scene: 'cramer',
    references: ['Slide LXT · lecture05 · trang 10', 'OpenStax · College Algebra 2e · §7.8: Solving Systems with Cramer’s Rule'],
    conditions: "A vuông cấp $3, D=|A|\\ne 0$. Khi $D=0$ chuyển sang Gauss hoặc hạng; không chia cho 0.",
    definition: R`Viết $A=[C_{1} C_{2} C_{3}]$, mỗi $C_{j}$ là một cột hệ số. $AX=B$ tương đương
$$xC_1+yC_2+zC_3=B.$$
Lập $A_1=[B\ C_2\ C_3]$, $A_2=[C_1\ B\ C_3]$, $A_3=[C_1\ C_2\ B]$. Đặt $D_{j}=|A_{j}|$. Khi $D\ne 0$:
$$\boxed{x=\frac{D_1}{D},\qquad y=\frac{D_2}{D},\qquad z=\frac{D_3}{D}.}$$`,
    content: R`### Một cột được thay, hai cột giữ nguyên
Tìm x thì thay cột 1 bằng B theo thứ tự $b_{1},b_{2},b_{3}$. Tìm y thì bắt đầu lại từ **A gốc**, chỉ thay cột 2. Tìm z cũng bắt đầu từ A gốc. Không thay dòng; không thay tiếp cột trên ma trận đã thay trước đó.

| Ẩn cần tìm | Ma trận thay thế | Các cột giữ nguyên |
|---|---|---|
| $x$ | $A_1=(B,C_2,C_3)$ | Cột 2 và 3 của A. |
| $y$ | $A_2=(C_1,B,C_3)$ | Cột 1 và 3 của A. |
| $z$ | $A_3=(C_1,C_2,B)$ | Cột 1 và 2 của A. |

Lập từng ma trận độc lập từ A ban đầu. Bảng này giúp ngăn lỗi thường gặp là thay tiếp trên $A_1$ hoặc đổi vị trí của các ẩn.

### Vì sao thay B tách được x?
Định thức tuyến tính theo một cột cho
$$\begin{aligned}D_1&=|[B,C_2,C_3]|\\&=x|[C_1,C_2,C_3]|+y|[C_2,C_2,C_3]|+z|[C_3,C_2,C_3]|\\&=xD.\end{aligned}$$
Hai hạng sau triệt tiêu vì có hai cột trùng nhau. Do đó $D_1=xD$; vì $D\ne0$, suy ra $x=\frac{D_1}{D}$. Tương tự, $D_2=yD$ và $D_3=zD$ cho $y=\frac{D_2}{D}$ và $z=\frac{D_3}{D}$. Vì vậy việc thay cột gắn với vai trò của từng ẩn trong AX, không phải một mẹo bố trí số.

### Khi dùng Cramer trong bài biện luận
Trong tuyến tự luận tách theo định thức, $D\ne0$ bảo đảm hệ vuông có nghiệm duy nhất và Cramer cho nghiệm cần tìm. Nếu đề hỏi riêng ẩn $x_j$, chỉ cần tính $D_j$; nếu cần cả nghiệm, tính từng định thức thay cột. Có thể giải lại bằng Gauss để tự kiểm tra, nhưng khi $D=0$ phải chuyển sang so sánh hạng, không dùng công thức Cramer.

### Không suy diễn khi $D=0$
Nếu $D=0$ và một $D_{j}\ne 0$, hệ vô nghiệm. Nếu $D=D_{1}=D_{2}=D_{3}=0$ thì vẫn chưa đủ kết luận vô số nghiệm; cần xét hạng mở rộng. Chẳng hạn $A=0, B\ne 0$ cho tất cả các định thức cấp ba ấy bằng 0 nhưng hệ vô nghiệm.`,
    workedExample: ex(R`Theo TL Phu, Buổi 3 với $m=3$: giải $x+2y+2z=-1,\ 2x+3y+3z=0,\ x+3y-z=1$.`, [R`$A=\begin{pmatrix}1&2&2\\2&3&3\\1&3&-1\end{pmatrix}$, $B=(-1,0,1)^{T}$. $D=(-3-9)-2(-2-3)+2(6-3)=4\ne0$.`, R`$D_1=\left|\begin{pmatrix}-1&2&2\\0&3&3\\1&3&-1\end{pmatrix}\right|=12$. Chỉ cột 1 được thay.`, R`$D_2=\left|\begin{pmatrix}1&-1&2\\2&0&3\\1&1&-1\end{pmatrix}\right|=-4$; $D_3=\left|\begin{pmatrix}1&2&-1\\2&3&0\\1&3&1\end{pmatrix}\right|=-4$.`, R`$x=\frac{12}{4}=3,\quad y=\frac{-4}{4}=-1,\quad z=\frac{-4}{4}=-1$.`], 'Thế lại vào ba phương trình được −1,0,1. Đây cũng là hệ đã giải bằng Gauss ở mục trước.'),
    recall: recall("$A_{2}$ được tạo từ A hay $A_{1}$? Những cột nào đổi?", "Từ A gốc; chỉ cột 2 thay bằng B. Cột 1 và 3 giữ nguyên. Sau đó $y=\\frac{|A_{2}|}{|A|}$ khi $|A|\\ne 0$."),
    trap: trap('Thay hai cột bằng B', "$A_{2}$ được tạo bằng cách thay thêm cột 2 trên $A_{1}$.", "Mỗi $A_{j}$ được lập độc lập từ A gốc.", "Thay tiếp sẽ tạo hai cột B, có định thức 0 không phải $D_{2}$ cần tìm."),
  }, {
    id: 'exam-methods', title: 'Tự luận: giải và biện luận theo tham số', scene: 'parameter-cases',
    references: ['Buổi 2 · trang 5–10; Buổi 3 · trang 1–3; Buổi 4 · trang 1–6', 'TL Phụ · Buổi 2 · trang 3–7; Buổi 3 · trang 2–10; Buổi 5 · trang 6–8', 'TL1_HPT_LG.pdf · trang 11–15, 24, 29–31; TUD_v2.pdf · trang 14–16', 'Slide LXT · lecture05 · trang 2–10; main.pdf · trang in 39–40 (PDF trang 44–45), hệ tham số K51'],
    conditions: 'Dùng tiêu chuẩn $|A|$ khi hệ vuông. Trước mọi phép chia tham số, xét riêng trường hợp mẫu bằng 0.',
    definition: R`Với hệ $AX=B$ phụ thuộc tham số $m$, khi $|A(m)|\ne0$ hệ có nghiệm duy nhất. Tại các giá trị làm $|A(m)|=0$, phải xét $r(A)$ và $r(\bar A)$; nếu hệ tương thích thì tìm nghiệm tổng quát. Kết luận phải bao quát mọi $m\in\mathbb R$.`,
    content: R`### Năm dạng câu hỏi về nghiệm theo tham số
Giả sử A(m) là ma trận vuông cấp n và m thuộc miền tham số $\Omega\subseteq\mathbb R$. Đặt $D(m)=|A(m)|$. Ba tập giá trị phân loại theo kết quả của hệ là
$$\begin{aligned}
\mathcal U&=\{m\in\Omega:D(m)\ne0\},\\
\mathcal I&=\{m\in\Omega:r(A(m))=r(\bar A(m))<n\},\\
\mathcal N&=\{m\in\Omega:r(A(m))<r(\bar A(m))\}.
\end{aligned}$$
Chúng lần lượt ứng với nghiệm duy nhất, vô số nghiệm và vô nghiệm; ba tập rời nhau và hợp lại bằng $\Omega$. Tài liệu K51 gom yêu cầu đề thi thành năm dạng:

| Dạng | Dấu hiệu ban đầu | Việc phải kết luận |
|---|---|---|
| 1. Nghiệm duy nhất | $D(m)\ne0$ | Tìm tập giá trị m thỏa điều kiện; nếu cần nghiệm, dùng Cramer hoặc phép khử. |
| 2. Vô số nghiệm hoặc vô nghiệm | $D(m)=0$ | Chỉ tìm các giá trị suy biến. Tại từng giá trị đó, còn phải kiểm tra tính tương thích. |
| 3. Vô số nghiệm | $D(m)=0$ là điều kiện cần | Thay từng giá trị ngoại lệ vào hệ gốc; cần có $r(A)=r(\bar A)<n$. |
| 4. Vô nghiệm | $D(m)=0$ là điều kiện cần | Thay từng giá trị ngoại lệ vào hệ gốc; cần có $r(A)<r(\bar A)$. |
| 5. Có nghiệm | $r(A)=r(\bar A)$ | Tập tham số là $\mathcal U\cup\mathcal I=\Omega\setminus\mathcal N$; tương ứng hợp hai nhánh có nghiệm hoặc lấy phần bù của nhánh vô nghiệm. |

### Vì sao định thức chỉ là bước sàng lọc?
Định thức khác 0 bảo đảm hệ vuông có nghiệm duy nhất. Nhưng định thức bằng 0 chỉ nói ma trận hệ số suy biến; hệ vẫn có thể tương thích hoặc mâu thuẫn. Với một giá trị $m_0$ làm $D(m_0)=0$, thế $m_0$ vào **toàn bộ hệ ban đầu**, kể cả vế phải, rồi mới so sánh hạng. Không được suy từ $D(m_0)=0$ rằng hệ vô nghiệm, cũng không được tự động kết luận có vô số nghiệm.

Trong câu trắc nghiệm, có thể thế từng giá trị $m_0$ vào chế độ giải hệ của Casio để nhận biết nghiệm duy nhất, vô số nghiệm hoặc vô nghiệm. Bài giảng hướng dẫn chế độ hệ ba ẩn bằng dãy phím MENU 9 1 3 trên dòng máy tương ứng; tên mục và phím tắt có thể khác theo model. Máy chỉ kiểm tra hệ sau khi đã thay một giá trị cụ thể, nên không thay thế phần chứng minh cho mọi $m$.

Trong tự luận, có hai lối giải phù hợp với bài giảng. Lối thứ nhất khử dòng trực tiếp trên $\bar A(m)$ và tách trường hợp trước mỗi phép chia cho biểu thức theo $m$. Lối thứ hai tìm nghiệm tổng quát của $D(m)=0$, xét riêng từng giá trị ngoại lệ bằng hạng của A và $\bar A$, rồi dùng Cramer cho các nhánh $D(m)\ne0$ nếu đề yêu cầu nghiệm. Cả hai lối đều phải xét đủ nhánh và ghi rõ tập giá trị tham số ở từng kết luận.

### Ví dụ K51: có nghiệm với mọi m nhưng không phải lúc nào cũng duy nhất
Xét hệ
$$\begin{cases}
mx+y+2z=1,\\
x+2y+3z=2,\\
2x+3y+5z=3.
\end{cases}$$
Ma trận hệ số có $D(m)=|A(m)|=m-1$. Nếu $m\ne1$, định thức khác 0 nên hệ có nghiệm duy nhất. Nếu $m=1$, phương trình thứ ba là tổng của hai phương trình đầu; hai phương trình độc lập còn lại cho $y+z=1$ và $x+z=0$. Đặt $z=t$, ta được
$$ (x,y,z)=(-t,1-t,t),\qquad t\in\mathbb R. $$
Vì thế tại $m=1$ hệ có vô số nghiệm, còn mọi $m\ne1$ đều cho nghiệm duy nhất. Tập giá trị để hệ có nghiệm là toàn bộ $\mathbb R$; tập giá trị làm hệ vô nghiệm là rỗng. Ví dụ này cho thấy nhánh $D=0$ có thể vẫn tương thích.

### Chọn phương pháp theo dữ kiện và yêu cầu
Với hệ $A(m)X=B(m)$, cần phân biệt việc kiểm tra một vài giá trị tham số với việc phân loại nghiệm cho mọi $m$. Ba quy trình dưới đây có phạm vi kết luận khác nhau.

| Dạng câu hỏi | Quy trình | Kết luận hợp lệ |
|---|---|---|
| Trắc nghiệm cho một số giá trị $m_0$ | Thay từng phương án vào toàn bộ hệ số và vế phải; nhập hệ theo đúng thứ tự ẩn vào chế độ HT của máy tính. Đọc thông báo nghiệm duy nhất, vô số nghiệm hoặc vô nghiệm; nếu máy trả nghiệm cụ thể, thế lại vào hệ ban đầu. | Phân loại đúng giá trị đang thử. Một số lần thử không chứng minh mệnh đề đúng với mọi $m$. |
| Tự luận: khử và biện luận tham số | Khử ma trận mở rộng $\bar A(m)$ từ đầu. Trước mỗi phép chia cho biểu thức theo $m$, tách trường hợp biểu thức bằng $0$ và khác $0$; biến đổi cả cột vế phải. | Bao quát mọi nhánh tham số và cho biết hệ vô nghiệm, có nghiệm duy nhất hay vô số nghiệm. |
| Tự luận: xét từng giá trị ngoại lệ | Dùng định thức hoặc khử để tìm các giá trị có thể làm hệ suy biến. Thay từng giá trị vào hệ gốc, xét $r(A)$ và $r(\bar A)$; nếu hệ vuông có nghiệm duy nhất, có thể dùng Cramer để tính nghiệm. | Phân loại riêng từng giá trị ngoại lệ. Tại $|A|=0$, không được dùng Cramer và không thể suy ra ngay hệ vô nghiệm hay vô số nghiệm. |

### Đọc một dòng cuối sau khi khử
Nếu dòng cuối của ma trận mở rộng có dạng $(0,0,p(m)\mid q(m))$, xét đủ ba khả năng:
- Nếu $p(m)\ne0$, hệ số ở cột cuối cùng của khối hệ số khác $0$, nên dòng này xác định ẩn tương ứng theo các ẩn còn lại.
- Nếu $p(m)=0$ nhưng $q(m)\ne0$, dòng biểu thị $0=q(m)$, nên hệ vô nghiệm.
- Nếu $p(m)=q(m)=0$, dòng trở thành dòng không. Bỏ dòng này rồi xét các dòng còn lại và so sánh hai hạng.
Hệ có nghiệm khi và chỉ khi $r(A)=r(\bar A)$. Khi hai hạng bằng $n$, nghiệm duy nhất; khi chúng bằng nhau và nhỏ hơn $n$, có vô số nghiệm. Một dòng không không tự nó chứng minh có vô số nghiệm.

### Theo dõi định thức khi biến đổi dòng
Cộng bội một dòng khác không làm đổi định thức; đổi chỗ hai dòng làm đổi dấu; nhân một dòng với $c$ làm định thức nhân với $c$. Chẳng hạn, nếu thay $d_3$ bằng $2d_3+(m-3)d_2$, định thức ma trận mới bằng $2|A|$. Phần tử trụ cuối sau phép biến đổi khi ấy không thể được đồng nhất trực tiếp với $|A|$ nếu chưa hoàn lại hệ số đã phát sinh.`,
    workedExample: ex(R`Theo Buổi 3: $x+3y+2z=-1,\ 2x+4y+mz=2,\ x+my-z=3$.`, [R`$d_2\leftarrow d_2-2d_1$, $d_3\leftarrow d_3-d_1$: hai dòng dưới là $(0,-2,m-4|4), (0,m-3,-3|4)$.`, R`$d_3\leftarrow2d_3+(m-3)d_2$ cho $(0,0,(m-1)(m-6)\mid4(m-1))$. Không chia tham số nên hợp lệ với mọi m.`, R`$m=1$: hai hạng bằng 2, đặt $z=t$, được $(x,y,z)=\left(5+\frac{5t}{2},-2-\frac{3t}{2},t\right)$.`, R`$m=6$: dòng cuối $0=20$, r(A)=2<r(\bar A)=3; vô nghiệm.`, R`$m\ne 1,6$: ba trụ; nghiệm duy nhất $x=-\frac{m+14}{m-6}$, $y=z=\frac{4}{m-6}$.`], R`$|A|=-(m-1)(m-6)$. Trụ cuối không bằng $|A|$ vì bước tổ hợp đã nhân dòng; các nghiệm vẫn được bảo toàn.`),
    recall: recall('Dòng cuối (0,0,p(m)|q(m)) cần xét những trường hợp nào?', "$p\\ne 0$: có trụ; $p=0,q\\ne 0$: vô nghiệm; $p=q=0$: bỏ dòng thừa rồi xét các dòng trên và số ẩn tự do."),
    trap: trap('Chỉ xét ngoại lệ', "Xét $m=1,6$ là xong toàn bộ biện luận.", "Còn phải kết luận $m\
e 1,6$; viết nghiệm nếu đề yêu cầu.", 'Biện luận là phân chia toàn bộ tập tham số, không chỉ nghiệm của định thức.'),
  }, {
    id: 'exam-logic', title: 'Trắc nghiệm: quan hệ giữa các nghiệm và kết luận',
    references: ['TL1_HPT_LG.pdf · trang 24 · Câu 15', 'Slide LXT · lecture05 · trang 3'],
    conditions: 'A là ma trận vuông cấp n. Nếu hệ có hai nghiệm phân biệt, dùng hiệu của chúng để xét hệ thuần nhất.',
    definition: R`Với hệ vuông $AX=B$, phân biệt **có nghiệm**, **nghiệm duy nhất**, **vô số nghiệm** và **vô nghiệm**. Hệ có nghiệm duy nhất khi và chỉ khi $|A|\ne0$. Nếu $|A|=0$, hệ không có nghiệm duy nhất; muốn phân biệt vô nghiệm với vô số nghiệm phải xét tính tương thích, chẳng hạn bằng $r(A)$ và $r(\bar A)$.`,
    content: R`### Một nghiệm khác nhau tạo ra nghiệm thuần nhất
Giả sử $X_1$ và $X_2$ cùng giải $AX=B$. Lấy phương trình ma trận thứ nhất trừ phương trình thứ hai:
$$A(X_1-X_2)=B-B=0$$
Vì $X_1\ne X_2$, hiệu $X_1-X_2$ là nghiệm không tầm thường của hệ thuần nhất. Với A vuông cấp n, điều đó kéo theo $r(A)<n$ và $|A|=0$. Hai nghiệm phân biệt vì vậy không thể xuất hiện trong một hệ có nghiệm duy nhất.

### Tách đúng nghiệm riêng và nghiệm của hệ thuần nhất
Hiệu $X_1-X_2$ giải $AX=0$, không phải nói chung giải $AX=B$. Nếu đặt $H=X_2-X_1$, thì $AH=0$ và mọi vector
$$X=X_1+tH,\qquad t\in\mathbb R$$
cũng giải $AX=B$. Khi $H\ne0$, các giá trị t tạo ra vô số nghiệm phân biệt. Đây là lý do một hệ tuyến tính không thể có đúng hai nghiệm: hoặc không có nghiệm, có đúng một nghiệm, hoặc có vô số nghiệm.

### Kiểm tra các tổ hợp tuyến tính
Nếu $AX_1=AX_2=B$, thì tổ hợp $\alpha X_1+\beta X_2$ là nghiệm của hệ ban đầu khi $\alpha+\beta=1$, bởi
$$A(\alpha X_1+\beta X_2)=(\alpha+\beta)B$$
Chẳng hạn $2X_1-X_2$ có tổng hệ số bằng 1 nên vẫn giải $AX=B$. Còn $X_1-X_2$ có tổng hệ số bằng 0 nên giải hệ thuần nhất. Không thể áp dụng phép lấy tổ hợp như thể vế phải cũng giữ nguyên.

### Bảng đọc nhanh câu hỏi trắc nghiệm

| Mệnh đề | Kiểm tra | Kết luận |
|---|---|---|
| Hệ vuông có nghiệm duy nhất | $|A|\ne0$ | Đúng khi ma trận hệ số khả nghịch. |
| Có hai nghiệm phân biệt $X_1,X_2$ | $A(X_1-X_2)=0$ với $X_1-X_2\ne0$ | $|A|=0$; hệ thuần nhất có vô số nghiệm. |
| $X_1-X_2$ giải $AX=B$ | Tính $A(X_1-X_2)$ | Sai nói chung; kết quả là 0. |
| $2X_1-X_2$ giải $AX=B$ | Tính $A(2X_1-X_2)=2B-B$ | Đúng. |

Từ “có nghiệm” không đồng nghĩa với “nghiệm duy nhất”: hệ có nghiệm khi hai hạng bằng nhau; sau đó phải so sánh hạng chung với n để biết nghiệm là duy nhất hay vô số.`,
    workedExample: ex(R`Cho hệ vuông $AX=B$ có hai nghiệm phân biệt $X_1$ và $X_2$. Trong các phát biểu sau, phát biểu nào sai: $r(A)<n$; $2X_1-X_2$ là nghiệm của $AX=B$; $X_1-X_2$ là nghiệm của $AX=B$; hệ thuần nhất $AX=0$ có vô số nghiệm?`, [R`Từ $AX_1=B$ và $AX_2=B$, lấy hiệu được $A(X_1-X_2)=0$. Vì $X_1\ne X_2$, đây là nghiệm không tầm thường của hệ thuần nhất.`, R`A là ma trận vuông nên có nghiệm thuần nhất không tầm thường khi và chỉ khi $|A|=0$; do đó $r(A)<n$. Hai kết luận thứ nhất và thứ tư đều đúng, vì mọi bội của $X_1-X_2$ vẫn giải $AX=0$.`, R`$A(2X_1-X_2)=2B-B=B$, nên tổ hợp này giải hệ ban đầu. Ngược lại, $A(X_1-X_2)=0$, không phải $B$ nói chung.`, R`Phát biểu sai là “$X_1-X_2$ là nghiệm của $AX=B$”. Hiệu hai nghiệm của cùng một hệ không thuần nhất giải hệ thuần nhất.`], 'Nếu thay vào từng phương án, giữ nguyên phép nhân ma trận và phân biệt rõ vế phải là B hay 0.'),
    recall: recall('Nếu $X_1$ và $X_2$ cùng giải $AX=B$, hệ nào nhận hiệu của chúng làm nghiệm?', '$X_1-X_2$ giải hệ thuần nhất $AX=0$. Nó chỉ giải $AX=B$ trong trường hợp đặc biệt $B=0$.'),
    trap: trap('Hiệu hai nghiệm giữ nguyên vế phải', '$AX_1=AX_2=B$ nên $A(X_1-X_2)=B$.', '$A(X_1-X_2)=B-B=0$; hiệu là nghiệm của hệ thuần nhất.', 'Phép trừ hai vế phải cũng phải được thực hiện; B trừ B bằng 0.'),
  }],
};
