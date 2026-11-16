const R = String.raw;
const ex = (question, steps, casioTip) => ({ question, steps, casioTip });
const recall = (front, back) => ({ front, back });
const trap = (title, wrong, right, explanation) => ({ title, wrong, right, explanation });
export const reviewedAlgebra = {
  summary: 'Bắt đầu bằng điều kiện khả nghịch, rồi dựng ma trận phụ hợp $P_A$ từ các phần bù đại số và suy ra công thức nghịch đảo. Tiếp theo là Gauss–Jordan, phương trình ma trận, hạng qua định thức con và dạng bậc thang, cuối cùng xét hạng phụ thuộc tham số.',
  objectives: ['Phân biệt tính khả nghịch với ma trận nghịch đảo $A^{-1}$.', 'Lập ma trận phụ hợp $P_A$ từ các phần bù đại số và áp dụng công thức nghịch đảo.', 'Thực hiện Gauss–Jordan trên toàn ma trận ghép và giải phương trình ma trận đúng phía.', 'Tìm hạng bằng định thức con hoặc dạng bậc thang; biện luận các giá trị tham số đặc biệt.'],
  references: ['Buổi 1 · trang 6–10; Buổi 2 · trang 1–4; Buổi 5 · trang 1–10', 'TL Phu · Buổi 1 · trang 4–11; Buổi 2 · trang 2, 5–7; Buổi 4 · trang 2–8', 'TL1_HPT_LG.pdf · trang 2–11, 15–24; TUD_v2.pdf · trang 9–13', 'Slide LXT · lecture03 · trang 2–7; lecture04 · trang 2–5', 'Đề thi K51 · câu 3, main.pdf · trang 6: ma trận phụ hợp và định thức'],
  sections: [{
    id: 'section-1', title: 'Khả nghịch, khả đảo, không suy biến',
    conditions: 'A là ma trận vuông cấp n. Kết luận về nghịch đảo một phía chỉ áp dụng cho các ma trận vuông cùng cấp.',
    definition: R`Ma trận A được gọi là **khả nghịch**, **khả đảo**, hay **không suy biến** nếu tồn tại ma trận B sao cho
$$AB=BA=I_n.$$
Khi ấy B là **ma trận nghịch đảo của A**, ký hiệu $B=A^{-1}$. Nếu không tồn tại, A được gọi là **suy biến**. Ba tên gọi đầu mô tả tính chất của $A; A^{-1}$ là ma trận thực hiện phép đảo.`,
    content: R`### Điều kiện tồn tại
Với A vuông cấp n:
$$\boxed{|A|\ne0\iff r(A)=n.}$$
Điều kiện định thức khác 0 phải được kiểm tra trước khi dùng công thức có mẫu $|A|$. Ma trận chữ nhật không có nghịch đảo hai phía theo định nghĩa này; không có định thức của toàn ma trận để dùng tiêu chuẩn trên.

### Vì sao nghịch đảo duy nhất?
Giả sử B,C đều là nghịch đảo của A. Khi đó
$$B=B(AC)=(BA)C=IC=C.$$
Với A,B vuông cùng cấp, chỉ cần kiểm tra $AB=I$: lấy định thức cho $|A|\cdot |B|=1$, nên A khả nghịch; nhân trái với $A^{-1}$ được $B=A^{-1}$ và suy ra $BA=I$. Lập luận này không áp dụng cho hai ma trận chữ nhật.

### Phép đảo tác động lên toàn ma trận
Nếu $AX=B$ và A khả nghịch thì nhân bên trái với $A^{-1}$ cho $X=A^{-1}B$. Đây là phép hoàn tác quan hệ giữa các phần tử, không phải thay từng $a_{ij}$ bằng $1/a_{ij}$. Một ma trận có nhiều số 0 vẫn có thể khả nghịch; ví dụ $I_{n}$ có nghịch đảo chính nó.

### Xét đúng ma trận mà đề hỏi
Nếu đề hỏi $B=(A-I)^{2}$ suy biến khi nào thì điều kiện là $|B|=0$, tương đương $|A-I|=0$; không phải $|A|=0$. “A khả nghịch” và “$A-I$ khả nghịch” là hai câu hỏi khác nhau.

### Một điều kiện, nhiều cách nhận diện
Với A vuông cấp n, các mệnh đề sau tương đương. Mỗi dòng cho một cách kiểm tra khác nhau, nhưng kết luận là cùng một tính chất của A.

| Dấu hiệu | Kết luận | Phù hợp khi |
|---|---|---|
| $\lvert A\rvert\ne0$ | A khả nghịch | Đã tính được định thức. |
| $r(A)=n$ | A có đủ n pivot | Đang khử dòng hoặc xét hạng. |
| Tồn tại $A^{-1}$ sao cho $AA^{-1}=A^{-1}A=I_n$ | A có ma trận nghịch đảo duy nhất | Cần dùng phép đảo trong một phương trình ma trận. |
| Với mọi $B\in\mathbb R^n$, hệ $AX=B$ có nghiệm duy nhất | A tác động một-một và phủ lên $\mathbb R^n$ | Cần nối khả nghịch với tính giải được của hệ. |

Không áp dụng bảng này cho ma trận chữ nhật: định thức toàn ma trận và nghịch đảo hai phía ở đây đều đòi hỏi A vuông.`,
    workedExample: ex(R`Cho $A=\begin{pmatrix}2&2&1\\2&4&1\\0&m&3\end{pmatrix}$, $B=(A-I_3)^2$. Tìm m để B suy biến.`, [R`$A-I_3=\begin{pmatrix}1&2&1\\2&3&1\\0&m&2\end{pmatrix}$. Chỉ trừ 1 tại ba ô chéo chính.`, R`$|A-I_3|=(6-m)-8+2m=m-2$.`, R`$|B|=(m-2)^2=0\iff m=2$.`], 'Kiểm tra điều kiện trên B. Không thay bằng điều kiện suy biến của A.'),
    recall: recall("“Khả nghịch”, “khả đảo”, “không suy biến” khác nhau không? $A^{-1}$ là gì?", R`Ba tên gọi cùng nghĩa với A vuông: $|A|\ne0$. $A^{-1}$ là nghịch đảo duy nhất, thỏa $AA^{-1}=A^{-1}A=I$.`),
    trap: trap('Xét khả nghịch theo từng ô', 'A có một ô bằng 0 nên không có nghịch đảo.', "Khả nghịch được quyết định bởi $|A| \\ne  0$.", "$I_{n}$ chứa nhiều số 0 nhưng vẫn khả nghịch."),
  }, {
    id: 'section-2', title: 'Ma trận con, phần bù đại số và phụ hợp P_A', scene: 'cofactor',
    conditions: "A vuông cấp $n \\ge  2$. $P_A$ luôn tồn tại; công thức nghịch đảo mới cần $|A| \\ne  0$.",
    definition: R`Bỏ dòng i và cột j của A để được ma trận con $M_{ij}$ cấp $n-1$. Phần bù đại số của $a_{ij}$ là
$$C_{ij}=(-1)^{i+j}|M_{ij}|.$$
Lập $C=(C_{ij})$, rồi chuyển vị để được **ma trận phụ hợp**:
$$\boxed{P_A=C^T=(C_{ji}),\qquad (P_A)_{ij}=C_{ji}.}$$
$P_A$ còn được ký hiệu là $\operatorname{adj}(A)$ hoặc $A^*$. Công thức nghịch đảo và cơ sở của nó được chứng minh ở mục kế tiếp.`,
    content: R`### Phân biệt ba đối tượng
$M_{ij}$ là ma trận; $|M_{ij}|$ là số; $C_{ij}$ là số ấy sau khi nhân dấu $(-1)^{i+j}$. Dấu phần bù cấp ba xếp theo bảng
$$\begin{pmatrix}+&-&+\\-&+&-\\+&-&+\end{pmatrix}.$$
Chỉ số i,j chọn dòng và cột cần bỏ. Khi lắp $P_A$, phần bù $C_{ij}$ được đưa vào vị trí **(j,i)**. Vì vậy tìm một ô của nghịch đảo không đòi hỏi tính đủ các phần bù:
$$\boxed{(A^{-1})_{ij}=\frac{C_{ji}}{|A|}.}$$

### Quy trình bằng định thức
Tính $|A|$ trước. Nếu bằng 0 thì không có $A^{-1}$, nhưng vẫn tính được $P_A$ nếu đề hỏi phụ hợp. Nếu khác 0, tính các phần bù, chuyển vị và nhân **mọi ô** của $P_A$ với $1/|A|$. Cuối cùng kiểm tra $AA^{-1}=I$.

Với cấp hai, quy trình rút gọn thành
$$A=\begin{pmatrix}a&b\\c&d\end{pmatrix},\quad P_A=\begin{pmatrix}d&-b\\-c&a\end{pmatrix}.$$
Quy tắc đổi hai ô chéo, đổi dấu hai ô còn lại là công thức riêng cấp hai, không áp dụng nguyên xi cho cấp ba.

### Vì sao phải chuyển vị?
Khai triển định thức theo dòng i dùng tổng $\sum _{j}a_{ij}C_{ij}$. Để tổng đó xuất hiện tại ô (i,i) của $AP_A$, cột i của $P_A$ phải chứa $C_{i1}$,…,$C_{in}$. Đó là dòng i của C sau chuyển vị. Bỏ bước này làm sai cả công thức nghịch đảo.`,
    workedExample: ex(R`Theo Buổi 1, cho $A=\begin{pmatrix}1&0&6\\2&1&5\\3&4&1\end{pmatrix}$. Tìm $P_A$ và $A^{-1}$.`, [R`$|A|=(1-20)+6(8-3)=11$.`, R`$C_{12}=-\left|\begin{pmatrix}2&5\\3&1\end{pmatrix}\right|=13$; $C_{21}=-\left|\begin{pmatrix}0&6\\4&1\end{pmatrix}\right|=24$.`, R`Tính đủ: $C=\begin{pmatrix}-19&13&5\\24&-17&-4\\-6&7&1\end{pmatrix}$.`, R`Chuyển vị: $P_A=\begin{pmatrix}-19&24&-6\\13&-17&7\\5&-4&1\end{pmatrix}$; $A^{-1}=P_A/11$.`, R`Ô (1,2) của nghịch đảo là $C_{21}/11=24/11$, không phải $13/11$.`], R`$AP_A=11I_3$, nên $A(P_A/11)=I_{3}$. Tích kiểm tra được cả dấu và bước chuyển vị.`),
    recall: recall("Ô (2,3) của $A^{-1}$ dùng $C_{23}$ hay $C_{32}$?", R`Dùng $C_{32}$: $(A^{-1})_{23}=C_{32}/|A|$, do $P_A$ là chuyển vị của ma trận phần bù.`),
    trap: trap('Bỏ chuyển vị', "$P_A=(C_{ij})$.", "$P_A=(C_{ji})$.", "Phần bù $C_{ij}$ được đưa từ vị trí (i,j) sang (j,i)."),
  }, {
    id: 'adjugate-identities', title: 'Tích ma trận phụ hợp và điều kiện nghịch đảo', scene: 'adjugate-identities',
    conditions: 'A vuông cấp n; ma trận phụ hợp được lập từ các phần bù đại số của A.',
    definition: R`Ký hiệu $P_A=(C_{ji})$ là ma trận phụ hợp, tức chuyển vị của ma trận các phần bù đại số. Khai triển định thức theo dòng và cột cho công thức (8), đúng với mọi ma trận vuông:
$$\boxed{AP_A=P_AA=|A|I_n.}\tag{8}$$
Nếu $|A|\ne0$, nhân công thức này với $A^{-1}$ suy ra công thức (7):
$$\boxed{P_A=|A|A^{-1}}\tag{7}$$
và do đó
$$\boxed{A^{-1}=\frac{1}{|A|}P_A.}$$`,
    content: R`### Vì sao tích phụ hợp cho ra đường chéo?
Phần tử $(i,j)$ của $AP_A$ là $\sum_{k=1}^{n}a_{ik}C_{jk}$. Khi $i=j$, đây là khai triển Laplace theo dòng $i$, nên bằng $|A|$. Khi $i\ne j$, tổng ấy là khai triển của định thức nhận được khi thay dòng $j$ bằng dòng $i$; ma trận mới có hai dòng trùng nhau nên định thức bằng 0. Lập luận theo cột cho $P_AA$. Do đó
$$AP_A=P_AA=|A|I_n,$$
kể cả khi $A$ suy biến. Đây là công thức (8); bản thân đẳng thức không đòi hỏi nghịch đảo.

### Điều kiện để chuyển sang công thức nghịch đảo
Chỉ khi $|A|\ne0$ mới được chia hai vế cho định thức. Từ $A^{-1}AP_A=A^{-1}|A|I_n$ suy ra $P_A=|A|A^{-1}$, công thức (7), rồi $A^{-1}=P_A/|A|$. Nếu $|A|=0$, công thức (8) vẫn đúng nhưng không thể chia cho 0; điều này không cho phép kết luận rằng $P_A$ bằng ma trận không.

### Hệ quả định thức dùng trong bài K51
Với ma trận khả nghịch cấp $n$, lấy định thức hai vế của $P_A=|A|A^{-1}$:
$$|P_A|=|A|^n|A^{-1}|=|A|^{n-1},$$
vì $|A^{-1}|=1/|A|$. Trong câu K51, $A,B$ khả nghịch cấp 3 và $|P_A|=2$, nên $|A|^2=2$. Đồng thời
$$\begin{aligned}
\left|2AB^TA^TB^{-1}\right|
&=2^3|A|\,|B^T|\,|A^T|\,|B^{-1}|\\
&=8|A|^2\\
&=16.
\end{aligned}$$
Ở đây $2^3$ xuất hiện vì hệ số 2 nhân ma trận cấp 3; hai định thức của $B$ triệt tiêu nhau. Điều kiện khả nghịch của $B$ cho phép dùng $|B^{-1}|=1/|B|$.`,
    workedExample: ex(R`Với $A=\begin{pmatrix}1&0&6\\2&1&5\\3&4&1\end{pmatrix}$ và $P_A=\begin{pmatrix}-19&24&-6\\13&-17&7\\5&-4&1\end{pmatrix}$, hãy kiểm tra một phần tử đường chéo và một phần tử ngoài đường chéo của $AP_A$.`, [R`Phần tử $(1,1)$ là $1(-19)+0(13)+6(5)=11=|A|$.`, R`Phần tử $(1,2)$ là $1(24)+0(-17)+6(-4)=0$. Đây là phép khai triển của một ma trận có hai dòng trùng nhau.`, R`Nhân đủ hai ma trận thu được $AP_A=11I_3$.`, R`Vì $|A|=11\ne0$, suy ra $A^{-1}=\frac{1}{11}P_A$.`], 'Đường chéo ghi lại định thức; các ô ngoài đường chéo triệt tiêu.'),
    recall: recall('Khi nào được chuyển từ $AP_A=(|A|)I_n$ sang công thức nghịch đảo?', R`Chỉ khi $|A|\ne0$: $A^{-1}=\dfrac{1}{|A|}P_A$. Đẳng thức $AP_A=(|A|)I_n$ vẫn đúng khi A suy biến.`),
    trap: trap('Chia cho định thức bằng 0', '$|A|=0$ nhưng vẫn đặt $A^{-1}=P_A/|A|$.', 'Khi định thức bằng 0, A không có nghịch đảo; chỉ có thể kết luận $AP_A=P_AA=0$.', 'Đẳng thức phụ hợp không được phép chia cho định thức nếu nó bằng 0.'),
  }, {
    id: 'gauss-jordan', title: 'Gauss–Jordan: tìm nghịch đảo cấp ba', scene: 'inverse',
    conditions: "Chỉ biến đổi dòng trên toàn [$A | I_{3}$]. Hệ số nhân một dòng phải khác 0.",
    definition: R`Lập ma trận mở rộng rồi đưa ba cột trái về đơn vị:
$$[A\mid I_3]\xrightarrow{\text{row operations}}[I_3\mid A^{-1}].$$
Gauss tạo dạng bậc thang; Gauss–Jordan khử tiếp phía trên trụ và chuẩn hóa để vế trái đúng bằng $I_{3}$.`,
    content: R`### Vì sao khối phải trở thành nghịch đảo?
Mỗi thao tác dòng tác động lên cả sáu cột. Nếu chuỗi thao tác là phép nhân trái E, bảng cuối bằng [EA|EI]. Khi EA=I thì $E=A^{-1}$, còn EI=E nên khối phải là $A^{-1}$. Chỉ khử ba cột trái sẽ phá vỡ lập luận này.

### Thứ tự thực hiện
Chọn trụ khác 0, đổi dòng nếu cần. Khử các ô dưới trụ từ trái sang phải, tiếp tục khử các ô trên trụ từ dưới lên rồi chuẩn hóa trụ thành 1. Có thể hoãn chuẩn hóa để tránh nhiều phân số. Các dòng trong bước sau là các dòng đã được cập nhật.

### Nhận ra ma trận suy biến
Nếu khối trái không có đủ ba trụ, không thể biến nó thành $I_{3}$. Khi đó A suy biến và không có nghịch đảo; không đọc một khối phải bất kỳ làm đáp số.

### Kiểm tra độc lập
Tách khối phải B rồi tính AB. Một lỗi dấu ở một thao tác có thể ảnh hưởng cả dòng; kiểm tra tích giúp phát hiện lỗi mà không lặp lại toàn bộ phép khử.
### Chọn cách dựng nghịch đảo

| Phương pháp | Lộ trình tính | Nên chọn khi | Kiểm tra kết quả |
|---|---|---|---|
| Phụ hợp $P_A$ | Tính $\lvert A\rvert$, lập các $C_{ij}$, chuyển vị thành $P_A$, rồi chia cho $\lvert A\rvert$. | Cần trình bày phần bù đại số, chứng minh công thức hoặc ma trận cấp nhỏ. | Kiểm tra $AP_A=\lvert A\rvert\,I_n$ trước khi chia. |
| Gauss–Jordan | Khử đồng thời hai khối trong $[A\mid I_3]$ cho đến khi khối trái thành $I_3$. | Muốn tính trực tiếp nghịch đảo $3\times3$ hoặc tránh khai triển nhiều định thức con. | Nhân $A$ với ma trận vừa tìm và thu được $I_3$. |

Hai phương pháp phải trả cùng một $A^{-1}$. Nếu $|A|=0$, phép phụ hợp vẫn cho $P_A$, nhưng Gauss–Jordan không thể tạo đủ pivot và không có nghịch đảo để đọc ở khối phải.`,
    workedExample: ex(R`Tìm nghịch đảo của $A=\begin{pmatrix}1&1&0\\0&1&1\\1&0&1\end{pmatrix}$.`, [R`Lập $\left(\begin{array}{ccc|ccc}1&1&0&1&0&0\\0&1&1&0&1&0\\1&0&1&0&0&1\end{array}\right)$.`, R`$d_3\leftarrow d_3-d_1$ cho dòng 3 là $(0,-1,1 | -1,0,1)$.`, R`$d_3\leftarrow d_3+d_2$ cho $(0,0,2 | -1,1,1)$; chia dòng 3 cho 2.`, R`$d_2\leftarrow d_2-d_3$, rồi $d_1\leftarrow d_1-d_2$.`, R`$A^{-1}=\frac12\begin{pmatrix}1&-1&1\\1&1&-1\\-1&1&1\end{pmatrix}$.`], "Nhân A với ma trận nguyên ở tử cho $2I_{3}$; hệ số $1/2$ đưa về $I_{3}$."),
    recall: recall("Vì sao [A | I] → [I | B] cho $B=A^{-1}$?", "Cùng chuỗi biến đổi E cho EA=I và EI=B. Suy ra $E=A^{-1}, B=E$."),
    trap: trap('Khử một nửa bảng', 'Đưa A thành I nhưng giữ nguyên các cột bên phải.', 'Áp dụng mọi thao tác dòng cho tất cả các cột.', 'Khối phải phải ghi nhận đúng cùng một phép nhân trái.'),
  }, {
    id: 'matrix-equations', title: 'Quy tắc nghịch đảo và phương trình ma trận', scene: 'matrix-equations',
    conditions: "Các tích xác định; các ma trận lấy nghịch đảo phải vuông, khả nghịch. $k\\ne 0$ trong công thức nghịch đảo kA.",
    definition: R`Các quy tắc:
$$\begin{aligned}(A^{-1})^{-1}&=A,&(A^T)^{-1}&=(A^{-1})^T,\\(AB)^{-1}&=B^{-1}A^{-1},&(kA)^{-1}&=\frac1kA^{-1}.\end{aligned}$$
Giữ đúng phía nhân:
$$AX=B\Rightarrow X=A^{-1}B,\quad XA=B\Rightarrow X=BA^{-1}.$$
Nếu A,C khả nghịch, $AXC=B\Rightarrow X=A^{-1}BC^{-1}$.`,
    content: R`### Vì sao thứ tự bị đảo?
$$(AB)(B^{-1}A^{-1})=A(BB^{-1})A^{-1}=I.$$
B đứng cạnh $B^{-1}$ ở giữa nên khử được; $A^{-1}B^{-1}$ nói chung không có cấu trúc ấy. Nghịch đảo của ABC tương tự bằng $C^{-1}B^{-1}A^{-1}$.

### B có nhiều cột
$AX=B$ với $B=[B_1\ \cdots\ B_p]$, $X=[X_1\ \cdots\ X_p]$ tương đương từng hệ $AX_{j}=B_{j}$. Khi A khả nghịch, một $A^{-1}$ giải tất cả các cột. Nếu A suy biến, phải xét tính tương thích của từng cột $B_{j}$; không có $A^{-1}$ chưa đồng nghĩa phương trình vô nghiệm.

### Giải phương trình theo đúng phía
Cho $A=\begin{pmatrix}2&1\\1&1\end{pmatrix}$ thì $|A|=1$ và $A^{-1}=\begin{pmatrix}1&-1\\-1&2\end{pmatrix}$. Với $AX=B$, nhân **trái** hai vế bởi $A^{-1}$; với $YA=C$, nhân **phải** hai vế bởi $A^{-1}$. Hai thao tác cho hai quy tắc khác nhau:
$$AX=B\Longrightarrow X=A^{-1}B,\qquad YA=C\Longrightarrow Y=CA^{-1}.$$
Chẳng hạn, nếu $B=\begin{pmatrix}1&2\\3&4\end{pmatrix}$ và $C=\begin{pmatrix}2&0\\1&3\end{pmatrix}$ thì
$$X=\begin{pmatrix}-2&-2\\5&6\end{pmatrix},\qquad Y=\begin{pmatrix}2&-2\\-2&5\end{pmatrix}.$$
Thế lại cho $AX=B$ và $YA=C$. Đổi thứ tự thành $BA^{-1}$ hoặc $A^{-1}C$ là sai nói chung. Nếu $A$ suy biến, không được áp dụng hai công thức này; khi ấy phải giải bằng phép biến đổi sơ cấp và kiểm tra điều kiện tương thích.

### Phân tích biểu thức trước khi tính định thức
Với $B=A^{2}-A=A(A-I), |B|=|A|\cdot |A-I|$. B khả nghịch cần **cả hai** thừa số khác 0; B suy biến cần **ít nhất một** bằng 0. Không dùng $|A^{2}-A|=(|A|)^{2}-|A|$ vì định thức không có tính cộng tổng quát.

### Trường hợp $AB=$kI
Nếu $k\ne 0$ thì A,B khả nghịch, $B=kA^{-1}$, nên $BA=kI$. Khi ấy $AB=BA$, có thể dùng $(A-B)^{2}=A^{2}-2AB+B^{2}$. Nếu $k=0$, kết luận giao hoán không còn đúng tổng quát: lấy $A=\begin{pmatrix}1&0\\0&0\end{pmatrix}$, $B=\begin{pmatrix}0&0\\1&0\end{pmatrix}$ thì $AB=0$ nhưng $BA=B\ne 0$.`,
    workedExample: ex(R`Giải hai phương trình ma trận $AX=B$ và $YA=C$, với $A=\begin{pmatrix}2&1\\1&1\end{pmatrix}$, $B=\begin{pmatrix}1&2\\3&4\end{pmatrix}$, $C=\begin{pmatrix}2&0\\1&3\end{pmatrix}$.`, [R`$|A|=2\cdot1-1\cdot1=1\ne0$, do đó $A^{-1}=\begin{pmatrix}1&-1\\-1&2\end{pmatrix}$.`, R`Với $AX=B$, nhân trái hai vế bởi $A^{-1}$: $X=A^{-1}B=\begin{pmatrix}-2&-2\\5&6\end{pmatrix}$.`, R`Với $YA=C$, nhân phải hai vế bởi $A^{-1}$: $Y=CA^{-1}=\begin{pmatrix}2&-2\\-2&5\end{pmatrix}$.`, R`Kiểm tra: $AX=B$ và $YA=C$. Phép kiểm tra xác nhận cả tích lẫn vị trí của nghịch đảo.`], 'Ghi đúng phía của phép nhân trước khi khử: vế trái có A thì nhân trái; vế phải có A thì nhân phải.'),
    recall: recall('AXC=B với A,C khả nghịch: nhân nghịch đảo ở đâu?', R`Nhân trái $A^{-1}$ và nhân phải $C^{-1}$: $X=A^{-1}BC^{-1}$.`),
    trap: trap('Xem ma trận như số khi chuyển vế', "$AX=B$ nên $X=BA^{-1}$.", "$AX=B$ nên $X=A^{-1}B$.", "Phải nhân trái để $A^{-1}$ đứng sát A và tạo I."),
  }, {
    id: 'rank-minors', title: 'Hạng qua định thức con: tồn tại và mọi', scene: 'rank-minors',
    conditions: 'A có m dòng, n cột, có thể chữ nhật. Hạng có thể bằng 0; đặc biệt, $r(A)=0$ khi và chỉ khi $A=0$.',
    definition: R`Chọn k dòng và k cột của A, giữ các phần tử tại giao của chúng để lập một ma trận vuông cấp k. Định thức đó gọi là **định thức con cấp k**.
Nếu $r=0$, điều kiện là $A=0$. Với $r\ge1$, hạng $r(A)=r$ khi **tồn tại** định thức con cấp $r$ khác 0 và **mọi** định thức con có cấp lớn hơn $r$ đều bằng 0. Các ký hiệu rank(A), R(A), r(A) có cùng nghĩa.`,
    content: R`### Một kết luận về hạng cần hai cận
Một định thức con cấp k khác 0 chỉ cho $r(A)\ge k$. Muốn kết luận $r(A)=k$ còn phải loại khả năng có định thức con lớn hơn khác 0. Với A vuông cấp $3, |A|=0$ và một định thức con cấp 2 khác 0 là đủ: $r(A)\le 2$ và $r(A)\ge 2$.

Kích thước cho giới hạn
$$0\le r(A)\le\min(m,n),\qquad r(A)=0\iff A=0.$$
Ma trận $3\times 4$ không có định thức của toàn bảng, nhưng có các định thức con cấp 1,2,3. Vì vậy hạng vẫn được định nghĩa bình thường.

### Liên hệ với nghịch đảo
Đối với A vuông cấp $n, r(A)=n$ ⇔ $|A|\ne 0$ ⇔ A khả nghịch. $|A|=0$ chỉ cho $r(A)<n$. Các ma trận $\operatorname{diag}(1,1,0), \operatorname{diag}(1,0,0), 0_{3}$ cùng định thức 0 nhưng hạng lần lượt 2,1,0.

### Chọn dòng, cột để chứng minh hiệu quả
Ưu tiên định thức con có nhiều số 0 hoặc cấu trúc tam giác. Có thể lấy cận trên từ khử dòng, rồi tìm một định thức con đạt cận ấy. Không phải tính riêng từng định thức con nếu đã có lập luận bao quát.

Một định thức con cấp 3 bằng 0 chưa chứng minh hạng nhỏ hơn 3: có thể một cách chọn ba dòng, ba cột khác cho định thức khác 0. Cụm từ “mọi” trong định nghĩa không thể thay bằng “một”.`,
    workedExample: ex(R`Cho $A=\begin{pmatrix}1&2&1&4\\0&-5&4&5\\0&0&0&2\\0&0&0&6\end{pmatrix}$. Chứng minh $r(A)=3$.`, [R`A tam giác trên có một ô chéo bằng 0, nên $|A|=0$ và $r(A)\le 3$.`, R`Chọn dòng 1,2,3 và cột 1,2,4, được $M=\begin{pmatrix}1&2&4\\0&-5&5\\0&0&2\end{pmatrix}$.`, R`$|M|=-10\ne 0$ nên $r(A)\ge 3$. Kết hợp hai cận cho $r(A)=3$.`], 'Không bắt buộc lấy ba cột đầu tiên. Bỏ cột 3 giúp giữ trụ ở cột 4.'),
    recall: recall("Có một định thức con cấp 2 khác 0 đã đủ kết luận $r(A)=2$ chưa?", "Chưa: mới có $r(A)\\ge 2$. Cần cận trên, chẳng hạn khử được hai dòng khác 0 hoặc mọi định thức con cấp cao hơn bằng 0."),
    trap: trap('Nhầm một với mọi', 'Một định thức con cấp 3 bằng 0 nên hạng nhỏ hơn 3.', 'Phải loại tất cả định thức con cấp 3 khác 0.', 'Một cách chọn dòng, cột không đại diện cho mọi cách chọn.'),
  }, {
    id: 'section-3', title: 'Dạng bậc thang, phần tử trụ và tính chất hạng', scene: 'rank',
    conditions: 'Đếm dòng khác 0 sau khi khử về bậc thang. Phép nhân dòng dùng hệ số khác 0.',
    definition: R`Ma trận bậc thang dòng có các dòng 0 ở dưới cùng; phần tử khác 0 đầu tiên của mỗi dòng dưới nằm bên phải phần tử đầu tiên của dòng trên. Phần tử đầu tiên ấy gọi là **phần tử trụ**.
Hạng của ma trận bậc thang bằng số dòng khác 0, cũng là số trụ. Biến đổi sơ cấp bảo toàn hạng nhưng có thể làm đổi định thức.`,
    content: R`### Phải khử trước khi đếm
Hai dòng (1,2,3), (2,4,6) đều khác 0 nhưng $d_{2}\leftarrow d_{2}-2d_{1}$ làm dòng sau bằng 0; chỉ có một trụ. Ngược lại, một ô đường chéo bằng 0 không có nghĩa cả dòng ấy bằng 0.

### Quy trình từ trái sang phải
Tìm phần tử khác 0 làm trụ, đổi dòng nếu cần. Khử các ô bên dưới trụ rồi chuyển sang cột tiếp theo. Nếu một cột không tạo được trụ mới, bỏ qua cột đó; không ép mọi trụ nằm trên đường chéo chính. Khi bảng đã bậc thang, đếm dòng khác 0.

Trong ví dụ dưới, các trụ nằm tại cột 1,2,4. Dòng cuối được khử thành 0, còn ba dòng độc lập. Hạng bằng 3 dù chỉ hai ô chéo chính khác 0.

### Những tính chất dùng trong bài phối hợp
$$r(A^T)=r(A),\quad r(kA)=r(A)\ (k\ne0),\quad r(AB)\le\min\{r(A),r(B)\}.$$
Suy ra $r(A^{2})\le r(A)$. Nhân bên trái hoặc bên phải với ma trận khả nghịch không đổi hạng. Với A,B vuông cấp n, còn có $r(A)+r(B)\le n+r(AB)$. Không tự thay dấu $\le$ bằng $=$: hai ma trận khác 0 có thể có tích bằng 0.

### Tìm hạng khác tính định thức
Khi tìm hạng, đổi dòng và nhân dòng với $k\ne 0$ không đổi đáp số. Khi tính định thức, phải theo dõi dấu và hệ số của các phép ấy. Cùng một phép biến đổi có tác động khác nhau đến hai đại lượng.`,
    workedExample: ex(R`Tìm hạng của $A=\begin{pmatrix}1&2&1&4\\2&-1&6&13\\0&0&0&2\\0&0&0&6\end{pmatrix}$.`, [R`$d_2\leftarrow d_2-2d_1$ cho dòng 2 là $(0,-5,4,5)$.`, R`$d_4\leftarrow d_4-3d_3$ cho dòng 0. Ba dòng còn lại có trụ ở cột 1,2,4.`, R`Bảng đã bậc thang, có ba dòng khác 0 nên $r(A)=3$.`], 'Định thức con của ba cột trụ khác 0 xác nhận lại kết quả bằng định nghĩa.'),
    recall: recall('Có hai ô chéo khác 0 có đủ kết luận hạng bằng 2 không?', 'Không. Phải xét dạng bậc thang và đếm trụ; trụ có thể ở cột 4 của dòng 3.'),
    trap: trap('Đếm dòng của bảng chưa khử', 'Bốn dòng đều khác 0 nên hạng 4.', 'Hai dòng tỉ lệ chỉ tạo một trụ; khử trước rồi đếm.', 'Các dòng (0,0,0,2) và (0,0,0,6) không tạo hai trụ độc lập.'),
  }, {
    id: 'rank-parameter', title: 'Biện luận hạng theo tham số', scene: 'rank-parameter',
    conditions: 'Tách trường hợp mẫu bằng 0 trước khi chia cho biểu thức theo m. Phép cộng bội dòng cho phép bội số bằng 0.',
    definition: R`Với A(m) vuông cấp n: $|A(m)|\ne 0$ cho $r(A)=n$. Tại mỗi giá trị làm $|A|=0$, thay vào ma trận chưa chia rồi khử hoặc xét định thức con. $|A|=0$ chưa đủ kết luận $r(A)=n-1$.`,
    content: R`### Khử không làm mất trường hợp
Theo TL Phu, Buổi 2, xét
$$A(m)=\begin{pmatrix}1&2&0\\2&5&1\\1&m&1\end{pmatrix}.$$
Dùng $d_{2}\leftarrow d_{2}-2d_{1}, d_{3}\leftarrow d_{3}-d_{1}$, rồi $d_{3}\leftarrow d_{3}-(m-2)d_{2}$:
$$U(m)=\begin{pmatrix}1&2&0\\0&1&1\\0&0&3-m\end{pmatrix}.$$
Ba phép hợp lệ với **mọi m**, kể cả $m=2$. Bội số bằng 0 ở phép cuối chỉ có nghĩa dòng nhận không đổi, không làm mất tính tương đương.

### Kết luận từ hai trụ hằng và một trụ tham số
Nếu $m\ne 3$, có ba trụ nên $r(A)=3$. Nếu $m=3$, dòng cuối bằng 0, hai dòng đầu vẫn có trụ 1 nên $r(A)=2$. Định thức con hai dòng, hai cột đầu bằng 1 không phụ thuộc m, bảo đảm hạng không xuống dưới 2.

### Liên hệ với định thức
Chuỗi chỉ dùng cộng bội dòng nên $|A|=|U|=3-m$. Xét định thức tìm đúng giá trị ngoại lệ $m=3$; xét hạng tại đó mới xác định hạng bằng 2. Không cần tách riêng $m=2$ vì không có phép chia cho $m-2$.

### Khi chỉ biết thông tin gián tiếp
Nếu A cấp 3 có $r(A)\le 2$ thì $|A|=0; A^{2}-2A=A(A-2I)$ cũng suy biến, và $r(A^{2})\le 2$. Nhưng $|A^{2}|=0$ không tự xác định $r(A^{2})$ bằng 1 hay 2. Kết luận phải dừng đúng mức thông tin cho phép.`,
    workedExample: ex(R`Biện luận hạng của A(m) ở trên; giải thích vì sao $m=2$ không phải ngoại lệ.`, [R`Khử được U có đường chéo $1,1,3-m; |A|=3-m$.`, R`$m\ne 3$: $r(A)=3$. $m=3$: còn hai dòng khác 0 nên $r(A)=2$.`, R`$m=2$ cho trụ cuối bằng 1, hạng vẫn là 3; không có bước chia cho $m-2$.`], 'Có thể kiểm tra cận dưới bằng định thức con cấp 2 bằng 1 với mọi m.'),
    recall: recall("Bội $m-2$ bằng 0 trong $d_{3}\\leftarrow d_{3}-(m-2)d_{2}$ có làm phép khử không hợp lệ không?", 'Không. Bội số trong phép cộng dòng được bằng 0. Chỉ hệ số nhân dòng nhận phải khác 0 để thao tác hoàn tác được.'),
    trap: trap('Chia cho trụ chưa biết khác 0', "Chia dòng cuối cho $3-m$ rồi kết luận luôn ba trụ.", "Tách $m=3$ trước khi chia; tại đó hạng bằng 2.", 'Chuẩn hóa trụ chỉ hợp lệ khi trụ khác 0.'),
  }],
};
