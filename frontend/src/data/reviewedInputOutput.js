const R = String.raw;
const ex = (question, steps, casioTip) => ({ question, steps, casioTip });
const recall = (front, back) => ({ front, back });
const trap = (title, wrong, right, explanation) => ({ title, wrong, right, explanation });
export const reviewedInputOutput = {
  summary: 'Từ hệ số kỹ thuật $a_{ij}$, lập giao dịch thực $x_{ij}=a_{ij}X_j$, đọc bảng theo dòng cung và cột nhận, rồi thiết lập cân đối $X=AX+D$. Chương cũng phân biệt thay đổi nhu cầu cuối với thay đổi công nghệ.',
  objectives: ["Diễn giải $a_{ij}$ và $x_{ij}$, xác định đúng ngành cung cấp, ngành nhận và đơn vị.", 'Tính giao dịch theo dòng hoặc cột, suy hệ số còn thiếu và kiểm tra tổng.', "Lập cân đối $X=AX+D$; phân biệt nhu cầu trung gian và nhu cầu cuối.", 'Giải và kiểm tra sản lượng; phân tích riêng cú sốc nhu cầu và thay đổi hệ số kỹ thuật.'],
  references: ['Ghi chép Buổi 7 · trang 1–9; main.pdf · trang 198–200 (trang in 193–195)', 'TUD_v2.pdf · Bài 2, trang 17–19', 'U.S. BEA · Requirement Tables: Direct and Total Requirements', 'J. Wyss-Gallifent · Leontief Input-Output Models, mục 1.1 và 1.3.1'],
  sections: [{
    id: 'section-1', title: 'Hệ số kỹ thuật: từ bản chất đến công thức', scene: 'io-coefficient',
    conditions: "Giao dịch dùng cùng đơn vị giá trị, cùng thời kỳ. $X_{j}>0$ khi tính tỷ số; công nghệ giữ cố định trong phạm vi mô hình.",
    definition: R`Theo quy ước của chương này, $a_{ij}$ là **lượng đầu vào trực tiếp do ngành $i$ cung cấp để ngành $j$ tạo một đơn vị giá trị sản lượng**. Vì vậy, $i$ chỉ ngành cung cấp và $j$ chỉ ngành nhận; cột $j$ mô tả công thức đầu vào của ngành $j$.
Chẳng hạn, $a_{13}=0{,}2$ nghĩa là một đơn vị sản lượng ngành $3$ cần $0{,}2$ đơn vị đầu vào từ ngành $1$. Đây là định mức trực tiếp, chưa phải lượng giao dịch của toàn ngành.`,
    content: R`### Một quy ước chỉ số xuyên suốt
Đọc ma trận theo hướng **vào cột, ra dòng**: cột $j$ là các đầu vào mà ngành $j$ cần; dòng $i$ là lượng sản phẩm ngành $i$ bán cho các ngành nhận. Vì cách lập bảng I–O có thể phân loại theo ngành hoặc theo sản phẩm, mọi bài toán phải nêu rõ quy ước. Ở đây ta dùng đúng quy ước trong bài giảng: dòng là ngành cung cấp, cột là ngành nhận.

### Bốn đại lượng không được đồng nhất
| Ký hiệu | Câu hỏi được trả lời | Ý nghĩa và đơn vị |
|---|---|---|
| $a_{ij}$ | Mỗi đơn vị sản lượng ngành $j$ cần bao nhiêu từ ngành $i$? | Định mức đầu vào trực tiếp; không có đơn vị tiền tệ. |
| $x_{ij}$ | Trong kỳ, ngành $i$ đã cung cấp bao nhiêu cho ngành $j$? | Giao dịch trung gian thực; cùng đơn vị giá trị với $X_j$. |
| $X_i$ | Ngành $i$ phải sản xuất tổng cộng bao nhiêu? | Tổng sản lượng gộp của ngành $i$. |
| $D_i$ | Bao nhiêu sản lượng ngành $i$ đi ra ngoài hệ thống sản xuất? | Nhu cầu cuối cùng của sản phẩm ngành $i$. |

### Từ định mức đến giao dịch thực
Nếu công nghệ cố định và ngành nhận sản xuất $X_j$ đơn vị, mọi định mức trong cột $j$ cùng nhân với $X_j$:
$$\boxed{x_{ij}=a_{ij}X_j},\qquad \boxed{a_{ij}=\frac{x_{ij}}{X_j}}\quad (X_j>0).$$
Mẫu số là sản lượng **ngành nhận**. Không dùng $X_i$ chỉ vì $i$ là bên cung cấp. Trong ngôn ngữ tài khoản I–O, $a_{ij}$ là yêu cầu trực tiếp; tác động gián tiếp qua các nhà cung ứng được tính ở nghịch đảo Leontief về sau, không gộp vào $A$.

### Kiểm tra thứ nguyên và phạm vi giả thiết
Với $X_3=200$ triệu đồng và $a_{13}=0{,}2$, ta có $x_{13}=40$ triệu đồng. Tỷ số $a_{13}$ không có đơn vị; $X_3$ và $x_{13}$ cùng đơn vị giá trị. Mô hình tuyến tính giả thiết định mức không đổi trong phạm vi đang xét; nó chưa mô tả thay thế nguyên liệu, giới hạn công suất hay biến động giá. Khi quy trình sản xuất đổi, phải cập nhật hệ số tương ứng.`,
    references: ['Ghi chép Buổi 7 · trang 1–2', 'TUD_v2.pdf · Bài 2, trang 17', 'U.S. BEA · Requirement Tables: Direct Requirements'],
    workedExample: ex("$a_{13}=0{,}2$, ngành $3$ sản xuất $200$ triệu đồng. Tính giao dịch $x_{13}$; sau đó tìm $X_3$ nếu biết $x_{13}=40$.", [R`Định mức cho một đơn vị sản lượng ngành $3$ là $0{,}2$ đơn vị đầu vào từ ngành $1$.`, R`$x_{13}=0{,}2\cdot 200=40$ triệu đồng.`, R`Nếu $x_{13}=40$ và $a_{13}=0{,}2$, thì $X_3=\frac{40}{0{,}2}=200$ triệu đồng.`, R`Kiểm tra ngược: $a_{13}=\frac{x_{13}}{X_3}=\frac{40}{200}=0{,}2$.`], 'Trước khi nhân hoặc chia, xác định đâu là định mức, đâu là giao dịch thực và đâu là sản lượng của ngành nhận.'),
    recall: recall("Vì sao $x_{ij}=a_{ij}X_{j}$ nhân với $X_{j}$ thay vì $X_{i}$?", "$a_{ij}$ đo đầu vào từ i trên một đơn vị ngành nhận j sản xuất. Nhân định mức với tổng số đơn vị ngành j nên dùng $X_{j}$."),
    trap: trap('Đảo hướng giao dịch', "$a_{13}$ là ngành 3 cung cho ngành 1.", "$a_{13}$ là ngành 1 cung đầu vào cho ngành 3.", 'Dòng cung, cột nhận quyết định cả hướng lẫn sản lượng dùng trong phép tính.'),
  }, {
    id: 'io-table', title: 'Bảng ba ngành: dòng cung và cột nhận', scene: 'io-table',
    conditions: "Phân biệt bảng hệ số $A=(a_{ij})$ với bảng giao dịch thực $(x_{ij})$. Ở cột $j$, mỗi giao dịch bằng hệ số kỹ thuật nhân sản lượng ngành nhận $X_j$.",
    definition: R`Bảng giao dịch thực có các phần tử $x_{ij}=a_{ij}X_j$. **Dòng $i$** ghi sản phẩm ngành $i$ cung cấp cho các ngành nhận; **cột $j$** ghi đầu vào mà các ngành cung cấp cho ngành $j$.`,
    content: R`### Một bộ số liệu dùng xuyên suốt chương
Theo Buổi 7:
$$A=\begin{pmatrix}0{,}1&0{,}2&0{,}2\\0{,}3&0{,}2&0{,}1\\0{,}2&0{,}3&0{,}3\end{pmatrix},\qquad X=\begin{pmatrix}210\\180\\200\end{pmatrix}.$$
Nhân lần lượt các cột của $A$ với $X_1=210$, $X_2=180$, $X_3=200$:
$$ (x_{ij})=\begin{pmatrix}21&36&40\\63&36&20\\42&54&60\end{pmatrix}.$$
Ô $(2,1)$ là $x_{21}=0{,}3\cdot210=63$: ngành $2$ cung đầu vào cho ngành $1$. Ô $(1,2)$ là $x_{12}=0{,}2\cdot180=36$: ngành $1$ cung cho ngành $2$. Hai hướng giao dịch dùng hai hệ số và hai sản lượng nhận khác nhau; nhìn chung $x_{12}\\ne x_{21}$.

### Tổng theo dòng: một ngành cung cho nhiều ngành
Ngành $2$ cung cả ba lượng $63+36+20=119$. Ba tích lần lượt dùng $X_1$, $X_2$ và $X_3$, vì ba ngành nhận có thể sản xuất khác quy mô. Ngành $1$ cung cho ngành $2$ và $3$ lượng $36+40=76$; tính cả tự cung $x_{11}=21$, tổng bán trung gian của ngành $1$ là $97$.

### Tổng theo cột: đầu vào một ngành nhận
Ngành $3$ nhận đầu vào trung gian $40+20+60=120$. Cả ba giao dịch cùng nhân $X_3=200$, do đó cũng có thể tính $(0{,}2+0{,}1+0{,}3)\cdot200$. Tự cung $x_{33}$ vẫn là giao dịch trung gian; chỉ được bỏ nếu đề loại rõ giao dịch nội ngành.

### Tổng toàn bảng
Cộng ba tổng dòng hoặc ba tổng cột đều cho tổng giao dịch trung gian 372. Không cộng thêm cả hai lần. Tổng dòng của riêng ngành i không cần bằng tổng cột của cùng ngành đó: một bên là bán ra, một bên là mua vào.`,
    references: ['Ghi chép Buổi 7 · trang 1–4', 'TUD_v2.pdf · Bài 2, trang 19'],
    workedExample: ex('Với $A$ và $X$ ở trên, tính tổng ngành $2$ cung cho cả ba ngành, tổng đầu vào ngành $3$ nhận và tổng giao dịch trung gian.', [R`Dòng $2$: $0{,}3\cdot210+0{,}2\cdot180+0{,}1\cdot200=119$.`, R`Cột $3$: $(0{,}2+0{,}1+0{,}3)\cdot200=120$.`, R`Cộng theo các dòng: $97+119+156=372$. Cộng theo các cột: $126+126+120=372$.`], 'Hai cách cộng toàn bảng phải cho cùng tổng 372; tổng dòng 2 không cần bằng tổng cột 2.'),
    recall: recall('Tổng dòng i và tổng cột j trả lời hai câu hỏi gì?', R`Dòng i: i cung cho các ngành, $\sum_j a_{ij}X_j$. Cột j: các ngành cung cho j, $X_j\sum_i a_{ij}$.`),
    trap: trap('Đặt sai sản lượng ra ngoài tổng', "$(a_{21}+a_{22}+a_{23})X_{2}$ là ngành 2 cung cả ba.", "Phải là $a_{21}X_{1}+a_{22}X_{2}+a_{23}X_{3}$.", 'Các ngành nhận khác nhau có sản lượng khác nhau.'),
  }, {
    id: 'io-flows', title: 'Các dạng giao dịch và bài toán ngược', scene: 'io-flows',
    conditions: "Ghi rõ cung → nhận trước khi lập biểu thức. Suy $X_{j}$ từ $x_{ij}$ cần $a_{ij}>0$.",
    definition: R`Một ngành i cung cho hai ngành j,k lượng $a_{ij}X_{j}+a_{ik}X_{k}$. Hai ngành i,k cung cho j lượng $(a_{ij}+a_{kj})X_{j}$. Tổng quát:
$$\sum_{j\in J}x_{ij}=\sum_{j\in J}a_{ij}X_j,\qquad\sum_{i\in S}x_{ij}=X_j\sum_{i\in S}a_{ij}.$$
Hai biểu thức khác nhau ở chỉ số được giữ cố định.`,
    content: R`### Chuyển câu chữ thành dòng, cột và sản lượng
| Mô tả giao dịch | Địa chỉ / hướng đọc | Lượng giao dịch |
|---|---|---|
| Ngành $1$ cung cho ngành $2$ | Ô dòng $1$, cột $2$ | $x_{12}=a_{12}X_2$ |
| Ngành $1$ cung cho ngành $2$ và $3$ | Cố định dòng $1$ | $a_{12}X_2+a_{13}X_3$ |
| Ngành $1$ cung cho cả ba ngành | Cố định dòng $1$, kể cả tự cung | $a_{11}X_1+a_{12}X_2+a_{13}X_3$ |
| Ngành $2$ cung cho ngành $1$ | Ô dòng $2$, cột $1$ | $x_{21}=a_{21}X_1$ |
| Ngành $1$ và $2$ cung cho ngành $1$ | Cố định cột $1$ | $(a_{11}+a_{21})X_1$ |
| Cả ba ngành cung cho ngành $1$ | Cộng toàn cột $1$ | $(a_{11}+a_{21}+a_{31})X_1$ |

Trong tổng theo dòng, giữ ngành cung cấp cố định nên các ngành nhận có thể có $X_j$ khác nhau. Trong tổng theo cột, giữ ngành nhận cố định nên cùng một $X_j$ được đặt ngoài tổng.

### Biết một giao dịch, suy giao dịch khác cùng cột
$a_{13}=0{,}2$ và $x_{13}=40$ cho $X_3=200$. Nếu $a_{23}=0{,}1$ thì $x_{23}=20$. Có thể tính trực tiếp $\frac{x_{23}}{x_{13}}=\frac{a_{23}}{a_{13}}$ vì cả hai giao dịch cùng nhân $X_3$. Hai ô khác cột không được tự khử hai sản lượng khác nhau.

### Tìm hệ số còn thiếu từ tổng đầu vào
Giả sử cột $3$ của một bảng khác là $(0{,}3;m;0{,}1)^T$, $X_3=150$ và tổng đầu vào ngành $3$ là $75$. Khi ấy $150(0{,}3+m+0{,}1)=75$, nên $m=0{,}1$. Đây là tổng theo cột, không có $X_1$ hay $X_2$.

### Hai giao dịch ngược chiều
“Ngành 2 cung cho 3 gấp đôi ngành 3 cung cho 2” nghĩa là $a_{23}X_{3}=2a_{32}X_{2}$. Hai vế có hai ngành nhận khác nhau. Chỉ được suy $a_{23}=2a_{32}$ khi đã có $X_{2}=X_{3}$.`,
    references: ['Ghi chép Buổi 7 · trang 2–3', 'TUD_v2.pdf · Bài 2, trang 19'],
    workedExample: ex("Ở một bảng khác, $a_{13}=0{,}3$, $a_{23}=m$, $a_{33}=0{,}1$, $X_2=200$, $X_3=150$, $a_{32}=0{,}2$. Tổng đầu vào ngành $3$ là $75$. Tìm $m$, rồi tính hai giao dịch ngược chiều.", [R`$150(0{,}3+m+0{,}1)=75$, suy ra $m=0{,}1$.`, R`$x_{23}=0{,}1\cdot150=15$, còn $x_{32}=0{,}2\cdot200=40$.`, R`Tổng hai giao dịch là $55$. Kiểm tra cột $3$: $45+15+15=75$.`], 'Mẫu số của hệ số là sản lượng ngành nhận. Hai giao dịch ngược chiều không dùng chung một sản lượng.'),
    recall: recall("Biết $x_{13}$, $a_{13}>0$ và $a_{23}$: suy $x_{23}$ bằng cách nào?", R`$X_3=\frac{x_{13}}{a_{13}}$ rồi $x_{23}=a_{23}X_3$. Chỉ cùng cột mới khử được sản lượng chung.`),
    trap: trap('Khử hai sản lượng khác nhau', "$x_{23}=2x_{32}$ nên $a_{23}=2a_{32}$.", "$a_{23}X_{3}=2a_{32}X_{2}$; cần biết thêm $\\frac{X_{2}}{X_{3}}$.", 'Hai giao dịch ngược chiều có hai ngành nhận khác nhau.'),
  }, {
    id: 'section-2', title: 'Từ cân đối từng ngành đến $(I-A)X=D$', scene: 'io-balance',
    conditions: "Công nghệ giữ cố định và $I-A$ khả nghịch. Trong mô hình Leontief, giả thiết $A\\ge0$ và $(I-A)^{-1}\\ge0$ bảo đảm nghiệm sản lượng không âm khi $D\\ge0$.",
    definition: R`Ngành i phân phối sản lượng cho nhu cầu trung gian và cuối cùng:
$$X_i=\sum_{j=1}^{n}a_{ij}X_j+D_i.$$
Gộp các dòng:
$$\boxed{X=AX+D\iff(I-A)X=D.}$$
Khi $I-A$ khả nghịch, $X=(I-A)^{-1}D$. Ma trận cần đảo là $I-A$, không phải A.`,
    content: R`### Từ giao dịch trung gian đến cân đối ngành
Sản lượng ngành $i$ được phân bổ cho các ngành sản xuất khác và cho nhu cầu cuối. Vì $x_{ij}=a_{ij}X_j$, cân đối của ngành $i$ là
$$X_i=\sum_{j=1}^{n}x_{ij}+D_i=\sum_{j=1}^{n}a_{ij}X_j+D_i.$$
Gom $n$ phương trình theo cùng thứ tự ngành cho
$$X=AX+D,\qquad (I-A)X=D.$$
Đây là phương trình cân đối của mô hình Input–Output mở: $D$ là nhu cầu cuối nằm ngoài khu vực sản xuất trung gian.

### Lập ma trận $I-A$
Với ma trận hệ số đang dùng, phép trừ cho
$$(I-A)=\begin{pmatrix}0{,}9&-0{,}2&-0{,}2\\-0{,}3&0{,}8&-0{,}1\\-0{,}2&-0{,}3&0{,}7\end{pmatrix}.$$
Ô chéo là $1-a_{ii}$; ô ngoài đường chéo là $-a_{ij}$. Chẳng hạn, dòng thứ nhất là $0{,}9X_1-0{,}2X_2-0{,}2X_3=D_1$. Chỉ trừ $A$ khỏi $I$ theo đúng từng vị trí.

### Nhu cầu cuối trong mô hình mở
$D_i$ là phần sản lượng ngành $i$ dành cho nhu cầu cuối sau khi đã phân bổ cho các ngành sản xuất. Vì vậy, mô hình tập trung vào cân đối $X=AX+D$; nhu cầu cuối được xem là dữ liệu bên ngoài hệ thống sản xuất.

### Giải và kiểm tra cân đối
Với $D=(113,61,44)^T$, giải hệ $(I-A)X=D$ thu được $X=(210,180,200)^T$. Thay lại từng ngành:
$$21+36+40+113=210,\quad 63+36+20+61=180,\quad 42+54+60+44=200.$$
Mỗi dòng phải cân bằng riêng; tổng toàn bảng đúng chưa đủ để phát hiện sai lệch giữa hai ngành.

Để có nghiệm đại số duy nhất cần $|I-A|\ne0$. Nghiệm ấy chỉ có ý nghĩa sản lượng khi các thành phần của $X$ không âm. Trong bài tập, kiểm tra điều kiện khả nghịch trước khi dùng nghịch đảo, sau đó thế nghiệm vào $(I-A)X=D$ theo từng dòng.`,
    workedExample: ex("Với A xuyên suốt chương, $D=(113,61,44)^{T}$. Tìm và kiểm tra sản lượng.", [R`Giải $(I-A)X=D$ được $X=(210,180,200)^{T}$.`, R`Dòng 1: $21+36+40+113=210$.`, R`Dòng 2: $63+36+20+61=180$; dòng 3: $42+54+60+44=200$.`, R`Tổng $X=590$ gồm trung gian 372 và nhu cầu cuối 218.`], 'Cả ba cân đối đúng. Kiểm tra số lượng, dấu và đơn vị trước khi diễn giải.'),
    recall: recall("Vì sao $X=(I-A)^{-1}D$ thay vì $A^{-1}D$?", "Từ $X=AX+D$ chuyển AX sang trái cho $(I-A)X=D$. Hệ số của hệ cần giải là $I-A$."),
    trap: trap('Nhầm nhu cầu cuối với sản lượng', "$D=(113,61,44)$ nên X cũng bằng cột đó.", 'X còn phải đáp ứng đầu vào trung gian AX.', 'Sản phẩm được dùng cả trong sản xuất và ngoài hệ thống.'),
  }, {
    id: 'section-3', title: 'Biến động nhu cầu cuối và từng cột nghịch đảo', scene: 'io-demand',
    conditions: "Giữ A cố định giữa hai trạng thái; $I-A$ khả nghịch. $\\Delta D$ có thể gồm cả tăng và giảm.",
    definition: R`Hai trạng thái cùng công nghệ thỏa $(I-A)X=D$ và $(I-A)(X+\Delta X)=D+\Delta D$. Lấy hiệu:
$$\boxed{\Delta X=(I-A)^{-1}\Delta D.}$$
Đây là đẳng thức chính xác trong mô hình tuyến tính, không phải xấp xỉ vi phân.`,
    content: R`### Một cột của nghịch đảo trả lời một câu hỏi cụ thể
Đặt $L=(I-A)^{-1}$. Từ $(I-A)X=D$ suy ra $X=LD$. Nếu chỉ nhu cầu cuối ngành $j$ tăng một đơn vị, $\Delta D$ là vectơ có số $1$ ở vị trí $j$ và các vị trí còn lại bằng $0$; do đó $\Delta X=L\Delta D$ chính là cột $j$ của $L$. Phần tử $l_{ij}$ cho biết sản lượng ngành $i$ cần tăng bao nhiêu để đáp ứng một đơn vị nhu cầu cuối tăng thêm ở ngành $j$, kể cả nhu cầu trung gian phát sinh.

Với bảng ba ngành đang xét,
$$L=\frac{1}{381}\begin{pmatrix}530&200&180\\230&590&150\\250&310&660\end{pmatrix}.$$
Nếu $D_2$ tăng một đơn vị thì
$$\Delta X=\frac{1}{381}\begin{pmatrix}200\\590\\310\end{pmatrix}.$$
Nhu cầu cuối chỉ tăng ở ngành $2$, nhưng cả ba ngành đều điều chỉnh sản lượng vì có giao dịch trung gian liên ngành.

### Khi nhiều thành phần của nhu cầu cùng đổi
Tính chất tuyến tính cho phép cộng phản ứng của từng cột: với $\Delta D=(10,-5,5)^T$,
$$\Delta X=L\Delta D=10L_{\cdot1}-5L_{\cdot2}+5L_{\cdot3}.$$
Dấu của một thành phần $\Delta D_j$ không quyết định riêng dấu của $\Delta X_i$; mỗi sản lượng chịu tác động tổng hợp từ mọi ngành.

Phân biệt mức thay đổi với mức sau biến động:
$$X'=X+\Delta X,\qquad \Delta X=(I-A)^{-1}(D'-D),\qquad X'=(I-A)^{-1}D'.$$
Các công thức này giả thiết $A$ không đổi. Nếu công nghệ đổi, phải dùng ma trận hệ số mới ở mục kế tiếp.`,
    workedExample: ex(R`$D$ đổi từ $(113,61,44)^T$ thành $(123,56,49)^T$, còn $A$ giữ nguyên. Tìm $\Delta X$ và $X'$.`, [R`$\Delta D=(10,-5,5)^T$.`, R`$\Delta X=\frac{1}{381}\begin{pmatrix}5200\\100\\4250\end{pmatrix}\approx\begin{pmatrix}13{,}6483\\0{,}2625\\11{,}1549\end{pmatrix}$.`, R`$X'=X+\Delta X\approx\begin{pmatrix}223{,}6483\\180{,}2625\\211{,}1549\end{pmatrix}$.`, R`Kiểm tra chính xác: $(I-A)\Delta X=\Delta D$, do đó $(I-A)X'=D'$.`], R`$D_2$ giảm nhưng $X_2$ vẫn tăng nhẹ vì nhu cầu cuối của hai ngành kia tăng và các ngành có liên kết qua $A$.`),
    recall: recall("Cột j của $(I-A)^{-1}$ diễn giải thế nào?", 'Mức thay đổi sản lượng tất cả ngành khi nhu cầu cuối ngành j tăng một đơn vị, các nhu cầu khác và công nghệ giữ nguyên.'),
    trap: trap("Nhầm $D'$ với $\\Delta D$", "$LD'$ là $\\Delta X$.", "$LD'$ là $X'$; $L(D'-D)$ mới là $\\Delta X$.", 'Công thức mức mới và mức tăng dùng cùng ma trận nhưng khác cột vế phải.'),
  }, {
    id: 'io-technology', title: 'Cải tiến kỹ thuật: đổi hệ số và giải lại cân đối', scene: 'io-technology',
    conditions: 'Xác định đúng ngành nhận đầu vào và ngành cung cấp; chỉ giữ D khi giả thiết nói nhu cầu cuối không đổi.',
    references: ['Ghi chép Buổi 7 · trang 7–9', 'main.pdf · trang 198–200 (trang in 193–195)'],
    definition: R`Ngành $j$ giảm tỷ lệ $s$ lượng đầu vào mua từ ngành $i$ trên mỗi đơn vị sản lượng thì hệ số mới là
$$a'_{ij}=(1-s)a_{ij},\qquad 0\le s\le 1.$$
Lập ma trận hệ số mới $A'$ bằng cách đổi đúng ô $(i,j)$, rồi giải lại cân đối $(I-A')X'=D'$. Nếu nhu cầu cuối không đổi thì $D'=D$. Công nghệ đổi làm thay đổi ma trận hệ số và nghịch đảo Leontief.`,
    content: R`### Đọc câu chữ thành dòng–cột
“Ngành $1$ tiết kiệm nguyên liệu ngành $2$” nghĩa là ngành $2$ cung cấp đầu vào cho ngành $1$. Vì vậy hệ số cần sửa nằm ở dòng $2$, cột $1$: $a_{21}$. Tiết kiệm $\frac{1}{3}$ nghĩa là còn sử dụng $1-\frac{1}{3}=\frac{2}{3}$ định mức cũ; không được nhầm với chỉ còn $\frac{1}{3}$. Chỉ điều chỉnh hệ số được nêu trong giả thiết.

### Hệ số đầu vào không phải tổng sản lượng
$a_{21}$ là lượng đầu vào ngành $2$ cần cho một đơn vị sản lượng ngành $1$, còn $X_2$ là tổng sản lượng ngành $2$. Hai đại lượng có ý nghĩa và đơn vị khác nhau. Thay đổi $a_{21}$ làm thay đổi cân đối sản xuất; không lấy $X_2$ cũ nhân $\frac{2}{3}$ và cũng không giữ nguyên các sản lượng khác. Phải giải lại toàn bộ hệ.

### Quan hệ giữa hai trạng thái
Nếu $D'=D$, lấy hai hệ cân đối $X'=A'X'+D$ và $X=AX+D$ rồi chuyển vế, ta được
$$(I-A')(X'-X)=(A'-A)X.$$
Đẳng thức này tách riêng tác động của thay đổi công nghệ. Nếu giải trực tiếp biến thiên thì dùng nghịch đảo mới $(I-A')^{-1}$. Công thức $\Delta X=(I-A)^{-1}\Delta D$ ở mục trước giả thiết $A$ không đổi nên không thể thay thế.

### Kết luận phải dựa trên hệ mới
Tiết kiệm đầu vào trung gian có thể làm giảm sản lượng cân bằng cần thiết ở nhiều ngành; điều đó không có nghĩa nhu cầu cuối đã giảm. Thế $X'$ vào đúng hệ số mới $A'$ để kiểm tra từng ngành. Dùng $A$ cũ sẽ kiểm tra một mô hình khác.`,
    workedExample: ex(R`$D=(113,61,44)^T$. Ngành $1$ tiết kiệm $\frac{1}{3}$ nguyên liệu từ ngành $2$; nhu cầu cuối không đổi. Tính $X'$.`, [R`Thay $a_{21}=0{,}3$ bằng $a'_{21}=0{,}3\cdot\frac{2}{3}=0{,}2$; các hệ số khác giữ nguyên.`, R`A'=\begin{pmatrix}0{,}1&0{,}2&0{,}2\\0{,}2&0{,}2&0{,}1\\0{,}2&0{,}3&0{,}3\end{pmatrix},\qquad I-A'=\begin{pmatrix}0{,}9&-0{,}2&-0{,}2\\-0{,}2&0{,}8&-0{,}1\\-0{,}2&-0{,}3&0{,}7\end{pmatrix}$.`, R`Giải $(I-A')X'=D$: $X'=\frac{1}{401}(80010,59790,73690)^T\approx(199{,}5262,149{,}1022,183{,}7656)^T$.`, R`Thế vào ba cân đối mới: $0{,}1X'_1+0{,}2X'_2+0{,}2X'_3+113=X'_1$; $0{,}2X'_1+0{,}2X'_2+0{,}1X'_3+61=X'_2$; $0{,}2X'_1+0{,}3X'_2+0{,}3X'_3+44=X'_3$.`], R`So với $X=(210,180,200)^T$, sản lượng cân bằng lần lượt giảm xấp xỉ $(10{,}4738,30{,}8978,16{,}2344)^T$. Véc-tơ nhu cầu cuối vẫn giữ nguyên là $D=(113,61,44)^T$.`),
    recall: recall(R`Ngành $1$ tiết kiệm $\frac{1}{3}$ đầu vào từ ngành $2$: sửa hệ số nào?`, R`Sửa $a_{21}$ thành $a'_{21}=\frac{2}{3}a_{21}$, sau đó giải lại toàn bộ $(I-A')X'=D$.`),
    trap: trap('Nhầm tỷ lệ tiết kiệm với tỷ lệ còn sử dụng', R`$a'_{21}=\frac{1}{3}a_{21}$.`, R`$a'_{21}=\left(1-\frac{1}{3}\right)a_{21}=\frac{2}{3}a_{21}$.`, 'Một phần ba được tiết kiệm; hai phần ba định mức ban đầu vẫn còn được sử dụng.'),
  }],
};
