const R = String.raw;
const example = (question, steps, casioTip) => ({ question, steps, casioTip });
export const algebraFoundations = {
  'chuyen-de-1': {
    summary: 'Từ cấu trúc dòng–cột, lần lượt học cộng, nhân vô hướng, tích ma trận và chuyển vị. Sau đó xây dựng định thức theo cấp: công thức cấp hai, Sarrus cấp ba, khai triển Laplace và tác động của phép biến đổi dòng.',
    objectives: ['Xác định kích thước, phần tử và các dạng ma trận theo điều kiện chỉ số.', 'Thực hiện phép cộng, trừ, nhân vô hướng, nhân ma trận và chuyển vị, đồng thời kiểm tra điều kiện xác định.', 'Tính định thức cấp hai, cấp ba và khai triển Laplace; theo dõi ảnh hưởng của các phép biến đổi sơ cấp.'],
    references: ['TUD_v2.pdf · trang 1–6: ma trận, phép toán và định thức', 'Ghi chép Buổi 1 · kích thước, chuyển vị và phép toán'],
    sections: [
      { id: 'matrix-shape', title: 'Ma trận, phần tử và các dạng cơ bản', conditions: "Các phần tử xét trên tập số thực; kích thước $m \\times  n$ có m, n là số nguyên dương.", definition: R`Ma trận $A=(a_{ij})_{m\times n}$ là một bảng gồm $m$ dòng và $n$ cột. Chỉ số thứ nhất chỉ dòng, chỉ số thứ hai chỉ cột. Hai ma trận bằng nhau khi và chỉ khi cùng kích thước và các phần tử tương ứng đều bằng nhau.`, content: R`### Nhận diện cấu trúc
Ma trận vuông có $m=n$; khi đó ta gọi $n$ là cấp. Ma trận dòng có kích thước $1\times n$, ma trận cột có kích thước $m\times1$. Ma trận không có mọi phần tử bằng $0$.

Với ma trận vuông, đường chéo chính gồm $a_{11},a_{22},\ldots,a_{nn}$. Ma trận tam giác trên thỏa $a_{ij}=0$ khi $i>j$; tam giác dưới thỏa $a_{ij}=0$ khi $i<j$. Ma trận đường chéo có mọi phần tử ngoài đường chéo bằng $0$. Ma trận đơn vị $I_n$ còn có các phần tử trên đường chéo bằng $1$.

### Vì sao phải ghi kích thước?
Kích thước quyết định phép toán có xác định hay không. Bảng $2\times3$ và bảng $3\times2$ cùng có sáu phần tử nhưng không cùng cấu trúc, nên không thể cộng. Số lượng phần tử không thay thế được thông tin dòng–cột.

### Chuyển vị như một phép sắp xếp lại
Đổi dòng thành cột cho ma trận $A^T$ kích thước $n\times m$, với $(A^T)_{ji}=a_{ij}$. Không thay đổi giá trị của phần tử và không lấy nghịch đảo từng số.`, workedExample: example(R`Cho $A=\begin{pmatrix}1&-2&0\\3&4&5\end{pmatrix}$. Xác định kích thước, $a_{23}$ và $A^T$.`, [R`Có hai dòng, ba cột nên $A$ có kích thước $2\times3$.`, R`Dòng 2 là $(3,4,5)$, do đó $a_{23}=5$.`, R`Mỗi dòng của $A$ trở thành một cột: $A^T=\begin{pmatrix}1&3\\-2&4\\0&5\end{pmatrix}$.`], R`Ma trận kết quả có kích thước $3\times2$ và chuyển vị lần nữa thu lại đúng $A$.`), recall: { front: 'Vì sao hai ma trận có cùng số phần tử vẫn có thể không cộng được?', back: R`Cần cùng số dòng và cùng số cột, không chỉ cùng tích $mn$. Ví dụ $2\times3$ và $3\times2$ đều có sáu phần tử nhưng không cùng kích thước.` }, trap: { title: 'Nhầm thứ tự dòng và cột', wrong: "$a_{23}$ nghĩa là cột 2, dòng 3.", right: "$a_{23}$ ở dòng 2, cột 3.", explanation: 'Đọc chỉ số theo thứ tự dòng trước, cột sau; luôn đối chiếu với kích thước của ma trận.' } },
      { id: 'matrix-addition', title: 'Cộng và trừ các phần tử cùng vị trí', conditions: "A và B cùng kích thước.", definition: R`Hai ma trận $A=(a_{ij})$ và $B=(b_{ij})$ cùng kích thước được cộng hoặc trừ theo từng vị trí:
$A\pm B=(a_{ij}\pm b_{ij})$
Kết quả có cùng kích thước với $A$ và $B$.`, content: R`### Điều kiện xác định và quy tắc phần tử
Phép cộng hoặc trừ đòi hỏi cùng số dòng và cùng số cột. Khi đó, ô ở địa chỉ $(i,j)$ chỉ kết hợp với ô cùng địa chỉ:
$(A+B)_{ij}=a_{ij}+b_{ij},\qquad (A-B)_{ij}=a_{ij}-b_{ij}$
Hai ma trận có cùng số phần tử nhưng kích thước lần lượt $2\times3$ và $3\times2$ vẫn không cộng được: vị trí tương ứng không còn cùng một dòng và cột.

### Các tính chất và phép trừ
Phép cộng kế thừa tính giao hoán, kết hợp và phần tử không:
$A+B=B+A,\qquad (A+B)+C=A+(B+C),\qquad A+0=A$
Ma trận đối $-A$ thỏa $A+(-A)=0$, nên $A-B=A+(-B)$. Khi $b_{ij}<0$, giữ ngoặc: $a_{ij}-(-c)=a_{ij}+c$. Các đẳng thức được xác nhận bằng cách so sánh từng phần tử cùng địa chỉ.

### Không cộng trực tiếp một số thực vào ma trận
Phép cộng ma trận được định nghĩa giữa hai ma trận cùng kích thước. Một số thực không phải ma trận cùng kích thước, nên $A+2$ không phải phép cộng ma trận. Cần phân biệt nhân vô hướng $2A$, trong đó mọi phần tử của $A$ đều được nhân với $2$, với ma trận $2I_n$, là ma trận đường chéo có cấp $n$:
$$2I_2=\begin{pmatrix}2&0\\0&2\end{pmatrix}$$
Vì $2I_n$ cùng cấp với ma trận vuông $A$, biểu thức $A+2I_n$ có nghĩa. Ngược lại, $A^2+2I_n$ khác $A^2+2A$: số hạng thứ hai ở biểu thức đầu là bội của ma trận đơn vị, còn ở biểu thức sau là bội của toàn bộ $A$.

Với $A$ vuông cấp $n$, ta có thể đặt $A$ làm nhân tử chung:
$$A^2+2A=A^2+A(2I_n)=A(A+2I_n)$$
Bước này dùng $2A=A(2I_n)$ và tính phân phối. Không có quy tắc cho phép cộng trực tiếp số thực $2$ với ma trận.`, workedExample: example(R`Với $A=\begin{pmatrix}1&2&3\\4&5&6\end{pmatrix}$, $B=\begin{pmatrix}2&0&1\\1&3&-2\end{pmatrix}$, tính $A-B$.`, [R`Hai ma trận đều $2\times3$ nên phép trừ xác định.`, R`Dòng thứ nhất: $(1-2,2-0,3-1)=(-1,2,2)$.`, R`Dòng thứ hai: $(4-1,5-3,6-(-2))=(3,2,8)$.`, R`Vậy $A-B=\begin{pmatrix}-1&2&2\\3&2&8\end{pmatrix}$.`], R`Cộng kết quả với $B$ phải thu lại $A$; riêng phần tử cuối kiểm tra $8+(-2)=6$.`), recall: { front: "Cách tính $A - B$ và cách tự kiểm tra kết quả?", back: R`Trừ các phần tử cùng vị trí; giữ ngoặc khi phần tử của $B$ âm. Sau đó kiểm tra $(A-B)+B=A$.` }, trap: { title: 'Trừ số âm trong một ô', wrong: "$6 - (-2) = 4$.", right: "$6 - (-2) = 8$.", explanation: 'Dấu trừ tác động đến cả phần tử của B, bao gồm dấu của phần tử đó.' } },
      { id: 'matrix-product', title: 'Nhân ma trận: định nghĩa và lập luận', conditions: "A kích thước $m \\times  k$ và B kích thước $k \\times  p$; số cột của A bằng số dòng của B.", definition: R`Tích $C=AB$ có kích thước $m\times p$, với
$c_{ij}=\sum_{r=1}^{k}a_{ir}b_{rj}$
Ta giữ dòng $i$ của A và cột $j$ của B, nhân các cặp phần tử tương ứng, rồi cộng các tích.`, content: R`### Tại sao là dòng nhân cột?
Cột thứ $j$ của $B$ chứa $k$ hệ số. Khi tổ hợp tuyến tính các cột của $A$ bằng những hệ số ấy, ta thu được cột thứ $j$ của $AB$. Do đó mỗi ô kết quả là tổng của đúng $k$ tích. Chỉ số cộng $r$ chạy qua kích thước ở giữa.

### Những tính chất đúng
Khi các kích thước phù hợp: $(AB)C=A(BC)$, $A(B+C)=AB+AC$, $(A+B)C=AC+BC$. Với $A$ kích thước $m\times n$, $I_mA=A=AI_n$.

### Phép nhân ma trận không giao hoán
Với số thực, phép nhân có tính giao hoán: đổi thứ tự thừa số không làm đổi tích. Tích ma trận thì khác: nói chung $AB\ne BA$. Nếu $x$ là một vectơ cột, $ABx=A(Bx)$; trong chuỗi tác động này, $B$ thực hiện trước rồi $A$ thực hiện sau. Đổi thành $BAx$ là đổi thứ tự hai phép biến đổi, nên kết quả có thể thay đổi.

Chọn hai ma trận vuông cùng cấp để cả hai tích đều xác định:
$$A=\begin{pmatrix}1&1\\0&1\end{pmatrix},\qquad B=\begin{pmatrix}1&0\\1&1\end{pmatrix}$$
$$AB=\begin{pmatrix}2&1\\1&1\end{pmatrix},\qquad BA=\begin{pmatrix}1&1\\1&2\end{pmatrix}$$
Hai tích khác nhau, vì vậy tính giao hoán của số thực không thể chuyển nguyên vẹn sang phép nhân ma trận. Điều đó không có nghĩa mọi cặp ma trận đều không giao hoán; kết luận đúng là không được mặc nhiên đổi chỗ thừa số.

Cũng có thể có hai ma trận khác không nhưng tích bằng ma trận không:
$$\begin{pmatrix}0&1\\0&0\end{pmatrix}\begin{pmatrix}1&0\\0&0\end{pmatrix}=0$$
Vì vậy không được đổi thứ tự thừa số hoặc khử một thừa số như với số thực nếu chưa có giả thiết thích hợp.`, workedExample: example(R`Tính $AB$ với $A=\begin{pmatrix}1&2&3\\4&5&6\end{pmatrix}$ và $B=\begin{pmatrix}2&0\\1&3\\-1&2\end{pmatrix}$.`, [R`Kích thước $(2\times3)(3\times2)$ khớp; kết quả phải $2\times2$.`, R`Dòng 1: $c_{11}=1\cdot2+2\cdot1+3(-1)=1$; $c_{12}=1\cdot0+2\cdot3+3\cdot2=12$.`, R`Dòng 2: $c_{21}=4\cdot2+5\cdot1+6(-1)=7$; $c_{22}=4\cdot0+5\cdot3+6\cdot2=27$.`, R`Vậy $AB=\begin{pmatrix}1&12\\7&27\end{pmatrix}$.`], R`Mỗi ô đã dùng đủ ba tích. Kiểm tra riêng ô $c_{22}$ bằng dòng $(4,5,6)$ và cột $(0,3,2)^T$.`), recall: { front: "Vì sao $(2\\times 3)(3\\times 2)$ cho ma trận $2\\times 2$, và mỗi ô cần bao nhiêu tích?", back: R`Hai kích thước trong bằng $3$ nên mỗi tổng có ba tích; hai kích thước ngoài là $2$ và $2$ nên kết quả $2\times2$.` }, trap: { title: 'Nhân theo từng ô như phép cộng', wrong: "Lấy $a_{ij}b_{ij}$ làm phần tử của AB.", right: 'Phải lấy tổng theo dòng i của A và cột j của B.', explanation: 'Phép nhân từng ô là một phép toán khác, không phải tích ma trận đang học.' } },
      { id: 'matrix-transpose', title: 'Chuyển vị của tổng và của tích', conditions: 'A, B cùng kích thước đối với tổng; AB xác định đối với công thức chuyển vị tích.', definition: R`Chuyển vị biến dòng thành cột: $(A^T)_{ji}=a_{ij}$. Các quy tắc:
$$ (A^T)^T=A,\quad(A+B)^T=A^T+B^T,\quad(kA)^T=kA^T,$$
$$ (AB)^T=B^TA^T. $$`, content: R`### Vì sao phải đảo thứ tự của tích?
Nếu $A$ là $m\times k$, $B$ là $k\times p$, thì $(AB)^T$ là $p\times m$. Tích $B^TA^T$ có kích thước $(p\times k)(k\times m)$, đúng bằng $p\times m$. Tích $A^TB^T$ có thể còn không xác định.

Đối chiếu phần tử để chứng minh:
$$((AB)^T)_{ij}=(AB)_{ji}=\sum_r a_{jr}b_{ri}=\sum_r(B^T)_{ir}(A^T)_{rj}.$$
Hai vế có cùng kích thước và mọi phần tử bằng nhau, nên bằng nhau.

### Ma trận đối xứng
Ma trận vuông $S$ đối xứng nếu $S^T=S$. Với mọi $A$ thực, $A^TA$ luôn đối xứng vì $(A^TA)^T=A^T(A^T)^T=A^TA$. Đối xứng không tự động có nghĩa là khả nghịch.`, workedExample: example(R`A kích thước $2\times3$, B kích thước $3\times4$. Xác định kích thước của $(AB)^T$ và $B^TA^T$.`, [R`$AB$ là $2\times4$, nên $(AB)^T$ là $4\times2$.`, R`$B^T$ là $4\times3$, $A^T$ là $3\times2$: tích là $4\times2$.`, R`Hai biểu thức bằng nhau theo quy tắc chuyển vị của tích; thứ tự bị đảo, không chỉ thêm ký hiệu T vào từng thừa số.`], R`$A^TB^T$ có dạng $(3\times2)(4\times3)$ nên không xác định trong ví dụ này.`), recall: { front: 'Chứng minh ngắn gọn vì sao phải đảo thứ tự khi chuyển vị AB?', back: R`$(AB)^T=B^TA^T$. Cả kiểm tra kích thước lẫn công thức phần tử đều cho đúng thứ tự $B^T$ trước $A^T$.` }, trap: { title: 'Giữ nguyên thứ tự khi chuyển vị tích', wrong: "$(AB)^{T} = A^{T}B^{T}$.", right: "$(AB)^{T} = B^{T}A^{T}$.", explanation: 'Dòng và cột đổi vai trò, nên thứ tự các phép ánh xạ trong tích bị đảo.' } },
      { id: 'determinant', title: 'Định thức, phần bù đại số và khai triển', conditions: 'A là ma trận vuông cấp n. Quy tắc Sarrus chỉ dùng cho cấp 3.', definition: R`Định thức là một số thực gắn với ma trận vuông. Với cấp hai:
$$\left|\begin{pmatrix}a&b\\c&d\end{pmatrix}\right|=ad-bc.$$
Bỏ dòng $i$ và cột $j$ để lập ma trận con $M_{ij}$; phần bù đại số là $C_{ij}=(-1)^{i+j}|M_{ij}|$.`, content: R`### Khai triển Laplace
Theo một dòng cố định $i$:
$$|A|=\sum_{j=1}^n a_{ij}C_{ij}.$$
Có thể khai triển theo một cột thay vì một dòng. Nên chọn dòng hoặc cột nhiều số 0 để giảm số phép tính. Dấu phần bù bắt đầu bằng dấu cộng ở ô $(1,1)$ và luân phiên theo dòng, cột.

### Ý nghĩa hình học
Trong hai chiều, $\left||A|\right|$ là hệ số biến đổi diện tích của ánh xạ tuyến tính do $A$ biểu diễn. Định thức âm cho biết đảo định hướng; định thức bằng 0 cho biết diện tích bị ép về 0. Điều này giải thích tại sao ma trận suy biến không có phép đảo trên toàn không gian.

### Phân biệt đối tượng
$A$ là ma trận, còn $|A|$ là số. Không cộng, chia hoặc chuyển vế hai loại đối tượng này như thể chúng cùng loại. Không định nghĩa định thức của một ma trận chữ nhật trong phạm vi đang học.`, workedExample: example(R`Tính định thức $A=\begin{pmatrix}1&2&0\\2&5&1\\0&1&3\end{pmatrix}$ bằng khai triển dòng 1.`, [R`Dấu theo dòng 1 là $+,-,+$. Phần tử thứ ba bằng 0 nên không cần tính định thức con của nó.`, R`$M_{11}=\begin{pmatrix}5&1\\1&3\end{pmatrix}$; $|M_{11}|=14$; $M_{12}=\begin{pmatrix}2&1\\0&3\end{pmatrix}$; $|M_{12}|=6$.`, R`$|A|=1\cdot14-2\cdot6+0=2$.`], R`Có thể kiểm tra độc lập bằng khử dòng: thu được đường chéo $1,1,2$ mà không đổi định thức.`), recall: { front: "Định thức con $M_{ij}$ khác phần bù đại số $C_{ij}$ ở điểm nào?", back: R`$M_{ij}$ là ma trận con sau khi bỏ dòng i, cột j. $C_{ij}=(-1)^{i+j}|M_{ij}|$ là định thức con đã gắn dấu. Khai triển dùng $a_{ij}C_{ij}$.` }, trap: { title: 'Dùng Sarrus cho cấp 4', wrong: "Kéo dài đường chéo của ma trận $4\\times 4$ như quy tắc cấp 3.", right: 'Dùng khai triển hoặc khử dòng cho cấp 4 trở lên.', explanation: "Sarrus là công thức riêng cho ma trận $3\\times 3$, không phải thuật toán tổng quát." } },
      { id: 'row-operations', title: 'Tính chất định thức và khử dòng', conditions: "$A, B$ vuông cùng cấp $n$. Với $A^{-1}$ cần $|A| \\ne  0$. Các phép nhân dòng dùng hệ số khác 0 nếu cần bảo toàn tương đương.", definition: R`Định thức thỏa
$$|kA|=k^n|A|,\quad|AB|=|A||B|,\quad|A^T|=|A|.$$
Định thức của ma trận tam giác bằng tích các phần tử đường chéo.`, content: R`### Theo dõi tác động của từng phép biến đổi
Đổi hai dòng làm định thức đổi dấu. Nhân một dòng với $c$ làm định thức nhân $c$. Cộng bội của một dòng khác vào một dòng không làm đổi định thức.

Tính tuyến tính theo **một dòng**, khi các dòng khác cố định, giải thích ba quy tắc này. Trong phép cộng bội dòng, phần phát sinh có hai dòng tỉ lệ nên định thức bằng 0. Nhân toàn bộ ma trận với $k$ tác động đến cả $n$ dòng nên xuất hiện $k^n$, không phải $k$.

### Quy trình tính bằng khử
Chọn pivot khác 0; nếu cần thì đổi dòng và ghi lại dấu. Dùng phép cộng bội dòng để tạo số 0 dưới pivot. Tiếp tục đến dạng tam giác rồi nhân đường chéo, quy đổi lại mọi lần đổi hoặc nhân dòng.

### Không có tính cộng tổng quát
Với $A=B=I_2$, $|A+B|=4$ nhưng $|A|+|B|=2$. Một phản ví dụ bác bỏ khẳng định đúng với mọi $A,B$; không có nghĩa đẳng thức đó sai với từng cặp A, B cụ thể.`, workedExample: example(R`Tính $\left|\begin{pmatrix}1&2&0\\2&5&1\\0&1&3\end{pmatrix}\right|$ bằng biến đổi dòng.`, [R`$d_2\leftarrow d_2-2d_1$ cho dòng 2 là $(0,1,1)$; định thức không đổi.`, R`$d_3\leftarrow d_3-d_2$ cho dòng 3 là $(0,0,2)$; định thức tiếp tục không đổi.`, R`Ma trận tam giác có đường chéo $1,1,2$, nên định thức ban đầu bằng $2$.`], R`Kết quả khớp khai triển Laplace. Không có lần đổi dòng hoặc nhân dòng nên không cần thêm hệ số.`), recall: { front: "Vì sao cộng bội một dòng khác không đổi định thức, còn nhân cả A với k tạo hệ số $k^n$?", back: R`Tuyến tính theo từng dòng: phần phát sinh khi cộng bội có hai dòng tỉ lệ nên bằng 0. Nhân toàn bộ A nhân từng dòng trong n dòng với k, tạo $k^n$.` }, trap: { title: 'Khử dòng nhưng quên hệ số', wrong: 'Nhân một dòng với 2 rồi coi định thức không đổi.', right: 'Định thức mới bằng 2 lần định thức cũ.', explanation: 'Bảo toàn hạng và bảo toàn định thức là hai kết luận khác nhau.' } }
    ]
  },
  'chuyen-de-2': {
    summary: 'Nghịch đảo là phép hoàn tác một ánh xạ tuyến tính; hạng đo số hướng thông tin độc lập. Hai khái niệm liên hệ nhưng không đồng nhất.',
    objectives: ['Nhận diện điều kiện khả nghịch và kiểm tra bằng tích.', 'Thực hiện Gauss–Jordan trên toàn ma trận mở rộng.', 'Xác định hạng, pivot và các giá trị tham số đặc biệt.'],
    references: ['TUD_v2.pdf · trang 9–13: nghịch đảo, ma trận phụ hợp và hạng', 'Ghi chép Buổi 5 · Rank'],
    sections: [
      { id: 'section-1', title: 'Khả nghịch và ý nghĩa phép đảo', conditions: "A vuông cấp n; nghịch đảo tồn tại khi và chỉ khi $|A| \\ne  0$.", definition: R`Ma trận $A^{-1}$ thỏa $AA^{-1}=A^{-1}A=I_n$. Nếu tồn tại, nghịch đảo là duy nhất. Khả nghịch tương đương hạng bằng n và hệ $Ax=b$ có nghiệm duy nhất với mọi b.`, content: R`### Vì sao nghiệm nghịch đảo là duy nhất?
Nếu $AB=I$ và $CA=I$, thì $C=C(AB)=(CA)B=B$. Do đó không có hai phép hoàn tác khác nhau. Với ma trận vuông, nghịch đảo một phía cũng dẫn đến nghịch đảo hai phía; không suy rộng điều này cho ma trận chữ nhật.

### Các quy tắc cần giữ đúng thứ tự
$$(AB)^{-1}=B^{-1}A^{-1},\qquad(A^T)^{-1}=(A^{-1})^T.$$
Quy tắc tích được kiểm tra bởi $(AB)(B^{-1}A^{-1})=I$. Với $k\ne0$, $(kA)^{-1}=k^{-1}A^{-1}$, còn $|A^{-1}|=1/|A|$.

### Giải phương trình ma trận
Từ $AX=B$ suy ra $X=A^{-1}B$; từ $XA=B$ suy ra $X=BA^{-1}$. Phải nhân ở phía phù hợp. Không có phép “chia cho A” bỏ qua thứ tự.`, workedExample: example(R`Kiểm tra nghịch đảo của $A=\begin{pmatrix}1&2\\3&7\end{pmatrix}$.`, [R`$|A|=7-6=1\ne0$.`, R`Ứng viên $B=\begin{pmatrix}7&-2\\-3&1\end{pmatrix}$.`, R`$AB=\begin{pmatrix}7-6&-2+2\\21-21&-6+7\end{pmatrix}=I_2$.`, R`Vậy $B=A^{-1}$; phép nhân kiểm tra xác nhận từng ô.`], R`Không lấy nghịch đảo từng phần tử: ma trận gồm $1/a_{ij}$ nói chung không phải $A^{-1}$.`), recall: { front: "Giải $AX = B$ và XA = B khác nhau thế nào?", back: R`Nếu A khả nghịch: $AX=B\Rightarrow X=A^{-1}B$, còn $XA=B\Rightarrow X=BA^{-1}$. Vị trí nhân nghịch đảo phải được giữ đúng.` }, trap: { title: 'Nghịch đảo từng số', wrong: "Thay mỗi $a_{ij}$ bởi $1/a_{ij}$ để được $A^{-1}$.", right: "Phải tìm ma trận B có $AB = BA = I$.", explanation: 'Nghịch đảo hoàn tác cả phép biến đổi ma trận, không hoàn tác từng ô độc lập.' } },
      { id: 'section-2', title: 'Gauss–Jordan và ma trận phụ hợp', conditions: 'A vuông; nếu khử không đưa vế trái về I thì A không khả nghịch.', definition: R`Ghép $[A\mid I]$, rồi dùng cùng các phép biến đổi dòng trên toàn bảng. Nếu thu được $[I\mid B]$ thì $B=A^{-1}$. Cách khác: $A^{-1}=\operatorname{adj}(A)/|A|$ khi định thức khác 0.`, content: R`### Vì sao phải biến đổi cả hai vế?
Mỗi phép biến đổi dòng tương đương nhân bên trái bởi một ma trận sơ cấp E khả nghịch. Sau chuỗi phép biến đổi, $E_r\cdots E_1A=I$, nên $E_r\cdots E_1=A^{-1}$. Vế phải ban đầu là I ghi lại đúng tích ấy.

### Ma trận phụ hợp được lập như thế nào?
Tính mọi phần bù $C_{ij}$, lập ma trận các phần bù rồi chuyển vị: $\operatorname{adj}(A)=(C_{ij})^T$. Đẳng thức $A\operatorname{adj}(A)=|A|I$ giải thích công thức nghịch đảo. Đừng quên bước chuyển vị.

### Chọn cách giải
Với cấp hai, dùng công thức $\begin{pmatrix}a&b\\c&d\end{pmatrix}^{-1}=\frac1{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$. Với cấp cao hơn, khử dòng thường ít phép tính hơn lập toàn bộ phần bù. Luôn kiểm tra định thức hoặc pivot trước khi chia.`, workedExample: example(R`Đưa $[A\mid I]$ với $A=\begin{pmatrix}1&2\\3&7\end{pmatrix}$ về dạng chuẩn.`, [R`Bắt đầu: $\left(\begin{array}{cc|cc}1&2&1&0\\3&7&0&1\end{array}\right)$.`, R`$d_2\leftarrow d_2-3d_1$: dòng 2 thành $(0,1\mid-3,1)$.`, R`$d_1\leftarrow d_1-2d_2$: dòng 1 thành $(1,0\mid7,-2)$.`, R`Vế trái là I; vế phải là $\begin{pmatrix}7&-2\\-3&1\end{pmatrix}$.`], R`Nếu chỉ khử các cột bên trái mà không khử cùng các cột bên phải thì không còn ghi nhận phép đảo.`), recall: { front: "Giải thích vì sao [A | I] → [I | B] cho $B = A^{-1}$.", back: R`Chuỗi biến đổi dòng là phép nhân trái E. Từ EA = I suy ra $E = A^{-1}$; đồng thời EI = E xuất hiện ở vế phải, nên $B = A^{-1}$.` }, trap: { title: 'Chỉ khử một nửa ma trận mở rộng', wrong: 'Tạo I ở vế trái nhưng giữ nguyên các ô bên phải.', right: 'Mọi thao tác dòng phải áp dụng cho tất cả cột.', explanation: 'Nếu không, vế phải không còn biểu diễn tích các ma trận sơ cấp đã áp dụng.' } },
      { id: 'section-3', title: 'Hạng, pivot và biện luận tham số', conditions: 'A có thể chữ nhật. Không chia cho biểu thức chứa tham số trước khi tách trường hợp bằng 0.', definition: R`Hạng là số cột độc lập tuyến tính, cũng bằng số dòng độc lập, số pivot trong dạng bậc thang và cấp lớn nhất của một định thức con khác 0. Luôn có $0\le r(A)\le\min(m,n)$.`, content: R`### Đếm pivot sau khi khử
Trong dạng bậc thang, các dòng không bằng 0 có pivot ở các cột khác nhau. Số dòng khác 0 chính là hạng. Không đếm số dòng khác 0 của ma trận **trước** khi khử: hai dòng tỉ lệ vẫn có thể cùng khác 0 nhưng chỉ mang một hướng thông tin.

### Hai cách chứng minh hạng bằng r
Cần cả cận dưới và cận trên: tìm một định thức con cấp r khác 0 để có hạng ít nhất r; đồng thời chứng minh mọi định thức con cấp cao hơn bằng 0 hoặc khử được đúng r pivot.

### Tham số đặc biệt
Nếu một pivot là $m-2$, trường hợp $m\ne2$ có thể chia cho pivot; trường hợp $m=2$ phải quay lại ma trận chưa chia để xét lại. Định thức bằng 0 chỉ cho hạng nhỏ hơn n đối với ma trận vuông, không tự động cho một giá trị hạng cụ thể.`, workedExample: example(R`Biện luận hạng của $A=\begin{pmatrix}1&2&0\\2&4&m\end{pmatrix}$.`, [R`$d_2\leftarrow d_2-2d_1$ cho $\begin{pmatrix}1&2&0\\0&0&m\end{pmatrix}$.`, R`Nếu $m\ne0$, có hai pivot ở cột 1 và cột 3 nên hạng bằng 2.`, R`Nếu $m=0$, chỉ còn một dòng khác 0 nên hạng bằng 1.`], R`A không bao giờ có hạng 3 vì chỉ có hai dòng; A không có hạng 0 vì có phần tử 1.`), recall: { front: "Vì sao $|A| = 0$ chưa đủ để kết luận hạng của A?", back: R`Với A vuông cấp n, chỉ suy ra $r(A) < n$. Muốn biết chính xác cần đếm pivot hoặc xét định thức con, đặc biệt tại các giá trị tham số làm pivot bằng 0.` }, trap: { title: 'Chia cho tham số làm mất trường hợp', wrong: 'Chia dòng cho m rồi kết luận hạng luôn bằng 2.', right: "Tách $m \\ne  0$ và $m = 0$ trước khi chia.", explanation: 'Phép biến đổi dòng phải khả nghịch trong từng trường hợp đang xét.' } }
    ]
  },
  'chuyen-de-3': {
    summary: 'Hệ tuyến tính là bài toán tìm một tổ hợp cột bằng vectơ vế phải. Hạng xác định tính tương thích, pivot xác định ẩn cơ sở và ẩn tự do.',
    objectives: ['Lập đúng A, x, b và ma trận mở rộng.', 'Phân loại vô nghiệm, duy nhất, vô số nghiệm bằng hạng.', 'Giải và kiểm tra nghiệm, không dùng Cramer khi định thức bằng 0.'],
    references: ['TUD_v2.pdf · trang 14–16: hệ tuyến tính và quy tắc Cramer', 'Ghi chép Buổi 2–4 · hệ phương trình tuyến tính'],
    sections: [
      { id: 'section-1', title: 'Dạng ma trận và phép biến đổi tương đương', conditions: 'Hệ m phương trình tuyến tính theo n ẩn; các hệ số và vế phải đã được đưa về đúng vị trí.', definition: R`Viết hệ dưới dạng $Ax=b$, với $A$ kích thước $m\times n$, $x$ là cột $n\times1$, $b$ là cột $m\times1$. Ma trận mở rộng là $[A\mid b]$, gồm thêm cột vế phải.`, content: R`### Bản chất của nghiệm
$Ax$ là tổ hợp các cột của A với hệ số $x_1,\ldots,x_n$. Hệ có nghiệm khi b thuộc không gian sinh bởi các cột đó. Trong hai ẩn, mỗi phương trình là một đường thẳng; nghiệm chung là giao điểm hoặc tập giao.

### Vì sao các phép khử bảo toàn nghiệm?
Đổi thứ tự phương trình không đổi điều kiện. Nhân một phương trình với số khác 0 không đổi tập nghiệm. Thay một phương trình bằng nó cộng bội phương trình khác có thể hoàn tác, nên cũng không đổi tập nghiệm.

Phải biến đổi cột b cùng các cột hệ số. Dòng $(0,0,\ldots,0\mid c)$ với $c\ne0$ tương ứng mệnh đề $0=c$, nên lập tức vô nghiệm. Dòng toàn 0 chỉ là phương trình thừa, chưa đủ kết luận có vô số nghiệm nếu vẫn đủ pivot cho các ẩn.`, workedExample: example(R`Giải hệ $x+y=6$, $x-y=2$.`, [R`Lập $\left(\begin{array}{cc|c}1&1&6\\1&-1&2\end{array}\right)$.`, R`$d_2\leftarrow d_2-d_1$ cho $-2y=-4$, nên $y=2$.`, R`Thế vào dòng 1: $x=4$.`], R`Thế (4,2) vào cả hai phương trình: $4+2=6$ và $4-2=2$.`), recall: { front: "Dòng (0,…,0 | c) cho biết gì nếu $c \\ne  0$?", back: "Dòng ấy là phương trình $0 = c$, một mâu thuẫn. Hệ vô nghiệm, dù những dòng khác có giải được riêng lẻ." }, trap: { title: 'Bỏ cột vế phải trong phép khử', wrong: 'Trừ hai dòng hệ số nhưng không trừ hai số ở vế phải.', right: 'Thực hiện trên toàn dòng của ma trận mở rộng.', explanation: 'Nếu không biến đổi đồng thời, phương trình mới không tương đương với hệ cũ.' } },
      { id: 'section-2', title: 'Định lý hạng và các ẩn tự do', conditions: 'So sánh hạng của A với hạng của [A | b]; n là số ẩn, không phải số phương trình.', definition: R`Hệ có nghiệm khi và chỉ khi $r(A)=r([A\mid b])$. Nếu hạng chung bằng n: nghiệm duy nhất. Nếu hạng chung r nhỏ hơn n: có $n-r$ ẩn tự do và vô số nghiệm.`, content: R`### Lý do phải so sánh hai hạng
Thêm b làm một cột mới không tăng hạng chính xác khi b là tổ hợp các cột A. Đây cũng là điều kiện tồn tại x trong $Ax=b$. Vì thế so sánh hạng là một tiêu chuẩn có nghiệm, không chỉ là mẹo đếm phương trình.

### Viết nghiệm tổng quát
Sau khử, chọn ẩn ở các cột không có pivot làm tham số. Tính các ẩn có pivot theo các tham số đó. Tập nghiệm của hệ tương thích có dạng $x=x_0+v$, trong đó $Av=0$.

### Hệ thuần nhất
$Ax=0$ luôn có nghiệm 0. Có nghiệm khác 0 khi và chỉ khi $r(A)<n$. Một hệ thuần nhất nhiều ẩn hơn phương trình chắc chắn có nghiệm không tầm thường vì $r(A)\le m<n$.`, workedExample: example(R`Biện luận hệ $x+y=2$, $2x+2y=m$.`, [R`Trừ 2 lần phương trình đầu khỏi phương trình sau: $0=m-4$.`, R`Nếu $m\ne4$, hạng mở rộng tăng lên 2 trong khi $r(A)=1$: vô nghiệm.`, R`Nếu $m=4$, hạng chung 1 nhỏ hơn 2: đặt $y=t$, $x=2-t$ với $t\in\mathbb R$.`], R`Thế nghiệm tổng quát vào hệ khi $m=4$: cả hai phương trình được thỏa với mọi t.`), recall: { front: 'Hệ tương thích có n ẩn và hạng r: có bao nhiêu ẩn tự do? Vì sao?', back: R`Có $n-r$ ẩn tự do. r pivot xác định r ẩn cơ sở theo các cột không có pivot. Điều kiện tương thích là $r(A)=r([A\mid b])$.` }, trap: { title: 'Đếm phương trình thay cho hạng', wrong: 'Hai phương trình, hai ẩn thì chắc chắn nghiệm duy nhất.', right: 'Cần hai phương trình độc lập và tương thích.', explanation: 'Hai phương trình có thể cùng một đường thẳng hoặc song song khác nhau.' } },
      { id: 'section-3', title: 'Cramer và quy trình biện luận tham số', conditions: "Cramer chỉ áp dụng khi A vuông và $|A| \\ne  0$. Tại các nghiệm của $|A|=0$ phải xét lại hạng.", definition: R`Với hệ vuông khả nghịch, $x_j=|A_j|/|A|$, trong đó $A_j$ thay **cột j** của A bằng b. Công thức nghịch đảo $x=A^{-1}b$ cho cùng nghiệm.`, content: R`### Cột nào được thay?
Ẩn $x_j$ là hệ số của cột j trong tổ hợp cột $Ax=b$. Vì vậy Cramer thay cột, không thay dòng. Nếu mẫu định thức bằng 0, công thức không còn áp dụng; không thể xử lý tỉ số $0/0$ như một nghiệm.

### Tham số: phần tổng quát và phần đặc biệt
Tính $|A(m)|$ để tìm các giá trị tham số đặc biệt. Với m làm định thức khác 0, hệ có duy nhất một nghiệm. Với mỗi m làm định thức bằng 0, thay vào ma trận gốc, khử và so sánh hai hạng. Không mang công thức đã chia cho $m-m_{0}$ sang trường hợp $m=m_{0}$.

### Chọn phương pháp theo cấu trúc
Cramer hữu ích cho một ẩn riêng hoặc cấp nhỏ. Khử Gauss hữu ích để giải toàn bộ hệ và nhận diện tham số. Kết luận cuối cần ghi rõ trường hợp, số nghiệm và dạng nghiệm nếu có.`, workedExample: example(R`Dùng Cramer giải $2x+y=5$, $x-y=1$.`, [R`$D=\left|\begin{pmatrix}2&1\\1&-1\end{pmatrix}\right|=-3\ne0$.`, R`$D_x=\left|\begin{pmatrix}5&1\\1&-1\end{pmatrix}\right|=-6$, nên $x=2$.`, R`$D_y=\left|\begin{pmatrix}2&5\\1&1\end{pmatrix}\right|=-3$, nên $y=1$.`], R`$2\cdot2+1=5$ và $2-1=1$. Đã thay cột, không thay dòng.`), recall: { front: "Khi $D = 0$, có thể dùng các $D_{j}$ để kết luận ngay số nghiệm không?", back: R`Không áp dụng tỉ số Cramer. Cần xét r(A), r([A|b]) hoặc khử trực tiếp, đặc biệt với hệ cấp cao và các trường hợp suy biến.` }, trap: { title: 'D = 0 đồng nghĩa vô nghiệm', wrong: 'Định thức hệ số bằng 0 thì hệ vô nghiệm.', right: 'Có thể vô nghiệm hoặc vô số nghiệm; phải kiểm tra tương thích.', explanation: 'Ma trận hệ số suy biến không quyết định riêng vị trí của vectơ vế phải.' } }
    ]
  },
    'chuyen-de-4': {
    summary: 'Diễn giải hệ số kỹ thuật, lập bảng giao dịch theo dòng cung và cột nhận, rồi thiết lập cân đối sản lượng.',
    objectives: ["Đọc đúng $a_{ij}$ và $x_{ij}=a_{ij}X_j$.", 'Lập và kiểm tra cân đối $X=AX+D$.', 'Phân tích thay đổi nhu cầu cuối khi công nghệ giữ nguyên.'],
    references: ['Ghi chép Buổi 7 · Input–Output', 'TUD_v2.pdf · Bài 2, trang 17–19'],
    sections: [
      {
        id: 'section-1', title: 'Hệ số kỹ thuật và giao dịch thực',
        conditions: "Các lượng được quy về cùng đơn vị giá trị; $X_j>0$ khi tính $a_{ij}$.",
        definition: "$a_{ij}$ là lượng đầu vào ngành $i$ cần để ngành $j$ sản xuất một đơn vị. Vì $i$ là ngành cung cấp còn $j$ là ngành nhận, giao dịch trong kỳ được xác định bởi $$x_{ij}=a_{ij}X_j,\\qquad a_{ij}=\\frac{x_{ij}}{X_j}.$$",
        content: "Theo dòng $i$, cộng lượng ngành $i$ cung cho các ngành nhận. Theo cột $j$, cộng các đầu vào ngành $j$ sử dụng. Mẫu số của $a_{ij}$ luôn là sản lượng ngành nhận $X_j$; không thay bằng $X_i$.",
        workedExample: example("Ngành 1 cung đầu vào cho ngành 2 với $a_{12}=0{,}15$. Nếu $X_2=300$ triệu đồng, hãy tính giao dịch.", ["$x_{12}=a_{12}X_2=0{,}15\\cdot300=45$ triệu đồng."], 'Ô $(1,2)$ dùng sản lượng ngành nhận 2.'),
        recall: { front: "Trong $x_{ij}=a_{ij}X_j$, $i$ và $j$ chỉ ngành nào?", back: "$i$ là ngành cung cấp đầu vào; $j$ là ngành nhận và sản xuất $X_j$." },
        trap: { title: 'Dùng sản lượng của ngành cung cấp', wrong: "$x_{12}=a_{12}X_1$.", right: "$x_{12}=a_{12}X_2$.", explanation: "Hệ số $a_{12}$ đo lượng ngành 1 cần cho mỗi đơn vị sản lượng ngành 2." }
      },
      {
        id: 'section-2', title: 'Cân đối Leontief',
        conditions: "$A\\ge0$. Nghiệm duy nhất tồn tại khi $I-A$ khả nghịch; tính khả thi còn cần kiểm tra $X\\ge0$.",
        definition: "Cân đối theo từng ngành có dạng $$X_i=\\sum_{j=1}^{n}a_{ij}X_j+D_i.$$ Gộp thành $$X=AX+D,\\qquad (I-A)X=D.$$",
        content: "Tổng sản lượng phải đáp ứng cả đầu vào trung gian $AX$ lẫn nhu cầu cuối $D$. Nếu $I-A$ khả nghịch thì $X=(I-A)^{-1}D$. Với $A\\ge0$ và $\\rho(A)<1$, nghịch đảo Leontief $I+A+A^2+\\cdots$ không âm; nghiệm vì thế không âm khi $D\\ge0$.",
        workedExample: example("Cho $A=\\begin{pmatrix}0{,}2&0{,}1\\\\0{,}3&0{,}2\\end{pmatrix}$ và $D=(80,60)^T$. Tính tổng sản lượng.", ["$I-A=\\begin{pmatrix}0{,}8&-0{,}1\\\\-0{,}3&0{,}8\\end{pmatrix}$, có định thức $0{,}61$.", "$X=(I-A)^{-1}D=\\left(\\frac{70}{0{,}61},\\frac{72}{0{,}61}\\right)^T\\approx(114{,}754;118{,}033)^T$.", "Thế lại từng dòng của $X=AX+D$ để kiểm tra."], 'Nhu cầu cuối không phải tổng sản lượng; còn phải bù các đầu vào trung gian.'),
        recall: { front: "Khi nào được viết $X=(I-A)^{-1}D$?", back: "Khi $I-A$ khả nghịch; sau đó vẫn phải kiểm tra dấu và thế lại cân đối." },
        trap: { title: 'Đảo ma trận không đúng', wrong: "$X=A^{-1}D$.", right: "$X=(I-A)^{-1}D$.", explanation: "Cân đối là $X=AX+D$, nên ma trận hệ số sau khi chuyển vế là $I-A$." }
      },
      {
        id: 'section-3', title: 'Thay đổi nhu cầu cuối và công nghệ',
        conditions: "Công thức biến thiên nhu cầu giả thiết $A$ giữ nguyên.",
        definition: "Trừ hai trạng thái có cùng ma trận hệ số, ta được $$\\Delta X=(I-A)^{-1}\\Delta D.$$",
        content: "Cột $j$ của $(I-A)^{-1}$ mô tả phản ứng sản lượng của các ngành khi nhu cầu cuối ngành $j$ tăng một đơn vị. Nếu ma trận hệ số thay đổi, phải lập $A'$ và giải lại $(I-A')X'=D'$; không áp dụng nghịch đảo cũ như thể công nghệ vẫn giữ nguyên.",
        workedExample: example("Nếu nhu cầu cuối ngành 1 tăng 10 đơn vị và $A$ không đổi như ví dụ trước, tính biến thiên sản lượng.", ["$\\Delta D=(10,0)^T$.", "$\\Delta X=(I-A)^{-1}\\Delta D=\\left(\\frac{8}{0{,}61},\\frac{3}{0{,}61}\\right)^T\\approx(13{,}115;4{,}918)^T$."], 'Kiểm tra $(I-A)\\Delta X=\\Delta D$.'),
        recall: { front: "Điều kiện nào cho phép dùng nghịch đảo cũ trong công thức $\\Delta X$?", back: "Ma trận kỹ thuật $A$ phải giữ nguyên giữa hai trạng thái." },
        trap: { title: 'Giữ công nghệ cũ sau khi hệ số đổi', wrong: 'Dùng $(I-A)^{-1}$ để tính sản lượng với ma trận mới $A$.', right: "Dùng $(I-A')^{-1}$ cho hệ cân đối mới.", explanation: "Thay đổi hệ số kỹ thuật làm đổi toàn bộ quan hệ đầu vào giữa các ngành." }
      }
    ]
  }
};
