const R=String.raw;
const example=(question,steps,casioTip)=>({question,steps,casioTip});
const triangle={id:'matrix-triangle',title:'Ma trận tam giác, đường chéo và đơn vị',conditions:'A vuông; định thức bằng tích đường chéo chỉ áp dụng khi mọi phần tử ở một phía đường chéo đều bằng 0.',definition:R`Tam giác trên: $a_{ij}=0$ khi $i>j$. Tam giác dưới: $a_{ij}=0$ khi $i<j$. Đường chéo: $a_{ij}=0$ khi $i\ne j$. Với cả ba dạng:
$$|A|=\prod_{i=1}^n a_{ii}.$$
Ma trận đơn vị $I_{n}$ là ma trận đường chéo có mọi $a_{ii}=1$.`,content:R`### Nhận diện bằng vùng số 0
Điều kiện $i>j$ mô tả vùng dưới đường chéo; $i<j$ mô tả vùng trên đường chéo. Ma trận tam giác vẫn có thể có những phần tử bằng 0 ở phía còn lại. Một ma trận đường chéo đồng thời thuộc cả hai loại tam giác.

### Vì sao chỉ còn tích đường chéo?
Khai triển theo cột đầu của ma trận tam giác trên chỉ còn hạng $a_{11}$ nhân định thức con; định thức con vẫn tam giác trên. Lặp lập luận đến cấp một thu được tích đường chéo. Ma trận tam giác dưới được xử lý tương tự hoặc dùng tính chất chuyển vị.

### Hệ quả về khả nghịch
Ma trận tam giác khả nghịch khi và chỉ khi mọi phần tử đường chéo khác 0. Không cần mọi phần tử của ma trận đều khác 0. Với $I_{n}$, định thức bằng 1 và $I_{n}$ là phần tử đơn vị của phép nhân, nhưng phải chọn đúng cấp cho từng phía.`,workedExample:{question:R`Tính định thức của $U=\begin{pmatrix}1&-1&3\\0&3&4\\0&0&5\end{pmatrix}$ và giải thích vì sao không cần Sarrus.`,steps:[R`U tam giác trên vì mọi phần tử dưới đường chéo chính bằng 0.`,R`$|U|=1\cdot3\cdot5=15$. Các phần tử −1,3,4 phía trên không xuất hiện trong tích.`,R`Đường chéo đều khác 0, nên U khả nghịch.`],casioTip:R`Khai triển cột đầu còn $1\\cdot \\left|\\begin{pmatrix}3&4\\\\0&5\\end{pmatrix}\\right|=15, xác nhận quy tắc.`},recall:{front:'Ma trận tam giác khả nghịch khi nào? Vì sao?',back:R`Khi mọi $a_{ii}$ khác 0, vì $|A|=\prod_i a_{ii}$; tích khác 0 tương đương từng thừa số khác 0.`},trap:{title:'Áp dụng tích đường chéo cho ma trận bất kỳ',wrong:"Mọi định thức $3\\times 3$ đều bằng $a_{11}a_{22}a_{33}$.",right:'Quy tắc chỉ đúng trực tiếp với ma trận tam giác.',explanation:'Ma trận tổng quát có các hạng khác trong khai triển định thức.'}};
const sarrus={id:'det-sarrus',title:'Định thức cấp ba theo quy tắc Sarrus',conditions:"Quy tắc Sarrus chỉ áp dụng cho ma trận vuông cấp $3$. Với cấp $2$, dùng công thức $ad-bc$; với cấp từ $4$ trở lên, không được nối thêm cột để áp dụng Sarrus.",definition:R`Với $A=\begin{pmatrix}a&b&c\\d&e&f\\g&h&i\end{pmatrix}$:
$$|A|=aei+bfg+cdh-ceg-bdi-afh.$$
Ba tích đi xuống được cộng; ba tích đi lên được trừ **cả tổng**.`,content:R`### Đọc hình trước khi tính
Giữ ma trận cấp ba ở bên trái rồi chép cột thứ nhất và thứ hai sang phải. Hai cột lặp được tô riêng để người học nhận ra chúng là bản sao dùng dựng đường chéo, không phải các cột mới của định thức.

### Tách hai nhóm đường chéo
Ba đường chéo đi xuống tạo nhóm $S_{+}$; ba đường chéo đi lên tạo nhóm $S_{-}$. Mỗi đường đóng góp tích của đúng ba phần tử mà nó đi qua. Kết quả là $S_{+}-S_{-}$; phải giữ ngoặc quanh toàn bộ nhóm trừ vì $S_{-}$ có thể âm.

### Chọn đúng phương pháp theo cấp
Cấp $2$ được tính trực tiếp bằng công thức $ad-bc$. Quy tắc Sarrus dành riêng cho cấp $3$. Với ma trận cấp từ $4$ trở lên, dùng khai triển Laplace theo dòng hoặc cột, hoặc khử về ma trận tam giác và theo dõi các phép biến đổi định thức. Nếu ma trận cấp ba có một dòng hoặc cột nhiều số $0$, Laplace đôi khi ngắn hơn Sarrus.
`,workedExample:{question:R`Tính định thức $A=\begin{pmatrix}1&2&3\\0&-1&4\\2&1&5\end{pmatrix}$ theo ví dụ trang 3 ghi chép Buổi 1.`,steps:[R`Nhóm cộng: $S_+=1(-1)5+2\cdot4\cdot2+3\cdot0\cdot1=-5+16+0=11$.`,R`Nhóm trừ: $S_-=3(-1)2+2\cdot0\cdot5+1\cdot4\cdot1=-6+0+4=-2$.`,R`$|A|=S_+-S_-=11-(-2)=13$.`],casioTip:R`Khai triển theo cột 1 cũng cho $1(-9)+2(11)=13$. Không bỏ dấu ngoặc quanh $-2$.`},recall:{front:'Sarrus tính hai nhóm tích nào, và vì sao phải giữ ngoặc nhóm trừ?',back:R`Cộng ba tích đường chéo đi xuống thành $S_{+}$, ba tích đi lên thành $S_{-}$, rồi tính $S_{+}-S_{-}$. Vì $S_{-}$ có thể âm, cần giữ ngoặc: $S_{+}-(S_{-})$.`},trap:{title:'Trừ nhầm tích có dấu âm',wrong:R`$S_{+}=11$, $S_{-}=-2$ nên $|A|=9$.`,right:R`$|A|=11-(-2)=13$.`,explanation:'Nhóm trừ là tổng các tích có dấu, không phải tổng trị tuyệt đối.'}};
const determinantIntro={
 title:'Định thức cấp hai: một số gắn với ma trận vuông',
 scene:null,
 conditions:'A là ma trận vuông. Công thức ở đây dành cho cấp hai; Sarrus và khai triển theo dòng, cột được trình bày ở các mục kế tiếp.',
 definition:R`Định thức của ma trận vuông $A$ là một số thực, ký hiệu là $|A|$. Với ma trận cấp hai:
$$\left|\begin{pmatrix}a&b\\c&d\end{pmatrix}\right|=ad-bc.$$`,
 content:R`### Ma trận vuông và định thức là hai đối tượng khác nhau
$A$ là một ma trận; $|A|$ là một số. Phép cộng, trừ hay lấy chuyển vị áp dụng cho ma trận, còn dấu định thức trả về một giá trị số. Ma trận chữ nhật không có định thức trong phạm vi này.

### Đọc công thức cấp hai
Hai tích $ad$ và $bc$ ghép các phần tử theo hai đường chéo. Ta lấy tích đường chéo chính trừ tích đường chéo phụ. Nếu có số âm, giữ ngoặc để dấu trừ tác động đúng lên toàn tích. Công thức này tính trực tiếp định thức cấp hai; chưa cần chọn dòng hay cột khai triển. Phương pháp khai triển tổng quát được dẫn vào ở mục Laplace.

### Ý nghĩa trong hai chiều
Hệ số thay đổi diện tích bằng trị tuyệt đối của định thức $|A|$. Dấu của định thức cho biết phép biến đổi có đảo định hướng hay không; Định thức âm biểu thị sự đảo định hướng; định thức bằng 0 cho biết một hình có diện tích dương bị ép về đường thẳng hoặc điểm. Vì vậy, định thức giúp nhận biết ma trận vuông có thể đảo hay không; tiêu chuẩn và cách dựng nghịch đảo được phát triển ở chương kế tiếp.`,
 workedExample:example(R`Tính $|A|$ với $A=\begin{pmatrix}2&-1\\3&4\end{pmatrix}$.`,[R`Tích theo đường chéo chính là $2\cdot4=8$.`,R`Tích theo đường chéo phụ là $(-1)\cdot3=-3$.`,R`$|A|=8-(-3)=11$. Dấu định thức trả về số 11, không phải một ma trận mới.`],R`Ma trận $A$ khả nghịch vì $|A|=11\ne0$; phép kiểm tra tổng quát cho ma trận vuông được trình bày ở Chương 2.`),
 recall:{front:'Định thức của ma trận là ma trận hay số? Ma trận chữ nhật có định thức không?',back:R`$|A|$ là một số thực và được định nghĩa cho ma trận vuông. Một ma trận chữ nhật không có định thức.`},
 trap:{title:'Nhầm định thức với ma trận',wrong:'Coi $|A|$ như một ma trận cùng kích thước với A.',right:'$|A|$ là một số; chỉ ma trận vuông mới có định thức.',explanation:'Phân biệt hai đối tượng trước khi thực hiện phép tính hoặc dùng tính chất.'}
};
const laplace={id:'det-laplace',title:'Khai triển Laplace theo dòng hoặc cột',scene:'laplace',conditions:'A là ma trận vuông. Công thức khai triển áp dụng ở mọi cấp; khi cấp từ bốn trở lên, thường chọn dòng hoặc cột có nhiều số 0.',definition:R`Bỏ dòng $i$ và cột $j$ của $A$ để lập ma trận con $M_{ij}$. Phần bù đại số tương ứng là
$$C_{ij}=(-1)^{i+j}|M_{ij}|.$$
Đây là công thức tổng quát trước khi chọn dòng hoặc cột khai triển.

Khi khai triển theo dòng $i$, giữ $i$ cố định và cho chỉ số cột $j$ chạy từ $1$ đến $n$:
$$|A|=\sum_{j=1}^{n}a_{ij}C_{ij}.$$

Khi khai triển theo cột $j$, giữ $j$ cố định và cho chỉ số dòng $i$ chạy từ $1$ đến $n$:
$$|A|=\sum_{i=1}^{n}a_{ij}C_{ij}.$$`,
 content:R`### Chọn dòng, cột rồi mới tính
Mỗi dòng và mỗi cột đều cho cùng định thức. Khác biệt là số hạng phải tính: một phần tử bằng 0 làm mất cả số hạng tương ứng. Với ma trận cấp cao, chọn dòng hoặc cột có nhiều số 0 thường rút ngắn đáng kể phép tính.

### Theo dõi dấu của phần bù
Dấu $(-1)^{i+j}$ đổi theo bảng
$$\begin{pmatrix}+&-&+\\-&+&-\\+&-&+\end{pmatrix}.$$
Định thức con $M_{ij}$ là một ma trận; $|M_{ij}|$ là một số; $C_{ij}$ là số đó sau khi gắn dấu. Khai triển dùng tích $a_{ij}C_{ij}$, không chỉ dùng định thức con.

### Cùng một ma trận, hai cách khai triển
Với
$$A=\begin{pmatrix}2&1&-1\\1&0&6\\5&0&3\end{pmatrix},$$
khai triển theo cột 2 chỉ còn số hạng của $a_{12}=1$:
$$|A|=1\cdot C_{12}
=-\left|\begin{pmatrix}1&6\\5&3\end{pmatrix}\right|
=-(-27)=27.$$
Khai triển theo dòng 1 cũng cho 27; hai số hạng ở cột 1 và cột 3 bằng 0 vì các định thức con tương ứng có một cột bằng 0. Đây là ví dụ trong ghi chép Buổi 1: cách chọn dòng hay cột là một quyết định tính toán, không làm thay đổi kết quả.

### Mở rộng lên cấp bốn trở lên
Định nghĩa $M_{ij}$ và công thức Laplace không đổi khi tăng cấp. Mỗi lần khai triển, định thức cấp $n$ được đưa về các định thức cấp $n-1$. Nếu không có dòng hoặc cột thưa số 0, hãy so sánh số phép tính với khử dòng; không cần khai triển theo một dòng tùy ý.`,
 workedExample:example(R`Cho $A=\begin{pmatrix}2&1&-1\\1&0&6\\5&0&3\end{pmatrix}$. Tính định thức theo cột 2 rồi theo dòng 1.`,[R`Bỏ dòng 1, cột 2: $M_{12}=\begin{pmatrix}1&6\\5&3\end{pmatrix}$, nên $C_{12}=(-1)^3(3-30)=27$.`,R`Hai phần tử còn lại ở cột 2 đều bằng 0; vì thế khai triển cột 2 cho $|A|=0+27+0=27$.`,R`Theo dòng 1, các phần bù của hai đầu mút đều bằng 0, còn $a_{12}C_{12}=27$. Kết quả được giữ nguyên khi đổi dòng khai triển sang cột.`],R`Ví dụ này cũng cho thấy nên tìm dòng/cột thưa trước khi tính các ma trận con.`),
 recall:{front:'Phân biệt $M_{ij}$, $|M_{ij}|$ và $C_{ij}$.',back:R`$M_{ij}$ là ma trận sau khi bỏ dòng i, cột j; $|M_{ij}|$ là một số; $C_{ij}=(-1)^{i+j}|M_{ij}|$ là phần bù đại số có dấu.`},
 trap:{title:'Bỏ dấu luân phiên của phần bù',wrong:'Dùng $a_{ij}|M_{ij}|$ trong mọi hạng.',right:'Dùng $a_{ij}C_{ij}=a_{ij}(-1)^{i+j}|M_{ij}|$.',explanation:'Dấu của phần bù phụ thuộc cả chỉ số dòng và cột.'}
};
const extraRowTheory=R`
### Viết đủ bốn dạng thường dùng trong bài giảng
Với $i\ne j$, các dòng khác giữ nguyên:

| Phép biến đổi | Ảnh hưởng lên định thức | Khi nào là phép tương đương? |
|---|---|---|
| $d_i\leftrightarrow d_j$ | $\lvert A'\rvert=-\lvert A\rvert$ | Luôn; phép nghịch đảo là đổi lại hai dòng. |
| $d_i\leftarrow d_i+kd_j$ | $\lvert A'\rvert=\lvert A\rvert$ | Luôn, với mọi $k$. |
| $d_i\leftarrow kd_i$ | $\lvert A'\rvert=k\lvert A\rvert$ | Cần $k\ne0$ để hoàn tác và bảo toàn hạng, tập nghiệm. |
| $d_i\leftarrow \alpha d_i+\beta d_j$ | $\lvert A'\rvert= \alpha\lvert A\rvert$ | Cần $\alpha\ne0$; thao tác gồm nhân dòng với $\alpha$ rồi cộng bội dòng $d_j$. |

Hai dạng cuối phải có $k\ne 0$ hoặc $\alpha\ne 0$ khi dùng làm phép biến đổi khả nghịch để bảo toàn hạng hay tập nghiệm. Dạng tổ hợp là ghép phép nhân dòng với phép cộng bội dòng, không phải một quy tắc độc lập mới về định thức. Với $\alpha=0$, dòng cũ có thể bị mất thông tin.

Các quy tắc tương tự áp dụng cho cột $c_i$. Khi giải hệ $AX=B$ bằng khử dòng, phải biến đổi cả cột vế phải $B$; không tự đổi cột ẩn mà giữ nguyên cách đọc nghiệm. Ghi ký hiệu biến đổi ngay trên mũi tên để theo dõi hệ số và dấu.

### Chọn công cụ tính định thức
Các cách dưới đây đều tính cùng một số $|A|$; khác nhau ở lượng phép tính và mức độ cần theo dõi.

| Cấu trúc của ma trận | Phương pháp thuận tiện | Điểm cần kiểm soát |
|---|---|---|
| Cấp $2$ | Công thức $ad-bc$ | Giữ ngoặc quanh số âm và trừ tích đường chéo phụ. |
| Cấp $3$ | Sarrus; hoặc Laplace nếu một dòng/cột thưa | Sarrus chỉ áp dụng cho ma trận $3\times3$; trong Laplace phải giữ dấu $(-1)^{i+j}$. |
| Có nhiều số $0$ | Khai triển Laplace theo dòng/cột thưa nhất | Số hạng bằng $0$ bị triệt tiêu, nhưng dấu phần bù vẫn phụ thuộc vị trí. |
| Cấp từ $4$ trở lên | Khai triển Laplace nếu có dòng/cột thưa; nếu không, khử về ma trận tam giác | Sarrus không mở rộng lên cấp cao; khi khử phải theo dõi riêng đổi dòng, nhân dòng và cộng bội dòng. |

### Các hệ quả thường dùng
Nếu có một dòng/cột toàn 0 hoặc hai dòng/cột tỉ lệ, định thức bằng 0. Với số nguyên dương $r$, $|A^r|=(|A|)^r$. Nếu $A$ khả nghịch, $|A^{-1}|=\frac{1}{|A|}$. Các đẳng thức này là đẳng thức của **số**, nên có tính giao hoán dù bản thân tích ma trận không giao hoán.
`;
const cofactorTheory=R`
### Ký hiệu chủ đạo trong bài giảng: $P_A$
Gọi $C=(C_{ij})$ là ma trận các phần bù đại số. Ma trận phụ hợp được ký hiệu
$$\boxed{P_A=C^T},\qquad A^{-1}=\frac1{|A|}P_A\quad(|A|\ne0).$$
Ký hiệu adj(A) trong một số tài liệu cũng chính là $P_A$, không phải ma trận C trước chuyển vị.

### Những đẳng thức cần hiểu giả thiết
Với A vuông, kể cả suy biến:
$$AP_A=P_AA=(|A|)I.$$
Các phần tử đường chéo của tích đến từ khai triển đúng dòng/cột; các phần tử ngoài chéo tương ứng một định thức có hai dòng hoặc cột bằng nhau nên bằng 0. Đây là lập luận không cần giả thiết nghịch đảo tồn tại.

Với $n\ge 2$: $|P_A|=(|A|)^{n-1}$ và $P_{kA}=k^{n-1}P_A$. Hệ số có mũ $n-1$ vì mỗi phần bù là định thức con cấp $n-1$. Khi A khả nghịch, $P_A=(|A|)A^{-1}$ giúp kiểm tra hai công thức này.

Nếu A,B vuông cùng cấp, $P_{AB}=P_BP_A$. Thứ tự đảo giống công thức nghịch đảo, không được đổi thành $P_AP_B$ chỉ vì các định thức là số.

### Một giả thiết cần bổ sung khi đọc ghi chép
Từ $AB=$kI với $k\ne 0$ suy ra A,B khả nghịch và $BA=kI$. Nếu $k=0$ thì kết luận không đúng tổng quát: chọn $A=\begin{pmatrix}1&0\\0&0\end{pmatrix}$, $B=\begin{pmatrix}0&0\\1&0\end{pmatrix}$ thì $AB=0$ nhưng $BA=B\ne 0$.
`;
export function completeAlgebraFoundation(id,foundation){
 if(!foundation)return foundation;
 if(id==='chuyen-de-1'){
  const sections=foundation.sections.flatMap(section=>section.id==='determinant'?[triangle,{...section,...determinantIntro},sarrus,laplace]:section.id==='row-operations'?[{...section,content:section.content+extraRowTheory}]:[section]);
  return {...foundation,sections};
 }
 if(id==='chuyen-de-2')return {...foundation,sections:foundation.sections.map(section=>section.id==='section-2'?{...section,title:'Phần bù đại số, ma trận phụ hợp và nghịch đảo',definition:R`Bỏ dòng i và cột j để lập ma trận con $M_{ij}$; tính phần bù $C_{ij}=(-1)^{i+j}|M_{ij}|$. Sau khi điền đủ các phần bù, chuyển vị:
$$P_A=(C_{ij})^T,\qquad A^{-1}=\frac1{|A|}P_A.$$
Điều kiện của công thức nghịch đảo là $|A|\ne 0$. $P_A$ vẫn được định nghĩa khi A suy biến.`,content:section.content+cofactorTheory}:section)};
 return foundation;
}
