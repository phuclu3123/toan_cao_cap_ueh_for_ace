const R=String.raw;
const example=(question,steps,casioTip)=>({question,steps,casioTip});
export const optimizationFoundations={
 'chuyen-de-8':{
  summary:'Chương đi từ bảng dấu đạo hàm một biến đến điều kiện dừng nhiều biến. Điểm dừng chỉ là ứng viên; kết luận cực trị cần đúng giả thiết, đúng miền và một phép kiểm tra độ cong hoặc dấu của hàm.',
  objectives:['Lập bảng biến thiên và phân biệt cực trị địa phương, toàn cục, đầu mút.','Giải hệ điều kiện dừng và phân loại bằng Hessian khi tiêu chuẩn áp dụng.','Xử lý trường hợp suy biến, điểm yên ngựa và miền khả thi có biên.'],
  references:['TUD_v2.pdf · trang 28–30: cực trị hàm hai biến','Ghi chép Buổi 8 · hàm nhiều biến và ứng dụng'],
  sections:[
   {id:'section-1',title:'Miền xác định, điểm dừng và điều kiện cần',conditions:'Điều kiện gradient bằng 0 chỉ áp dụng tại điểm trong miền mà hàm khả vi. Với miền có biên, điểm biên cần được xét riêng.',definition:R`Cho miền khả thi $\Omega\subseteq\mathbb{R}^{2}$. Điểm $(x_{0},y_{0})\in\Omega$ là cực tiểu địa phương nếu tồn tại $\delta>0$ sao cho
$$f(x_{0},y_{0})\le f(x,y)\quad\forall (x,y)\in\Omega\text{ with }0<\sqrt{(x-x_{0})^{2}+(y-y_{0})^{2}}<\delta.$$
Nếu bất đẳng thức đúng với mọi $(x,y)\in\Omega$, đó là cực tiểu toàn cục. Định nghĩa cực đại đổi chiều bất đẳng thức. Nếu điểm là điểm trong và $f$ khả vi, định lý Fermat cho điều kiện cần $f_{x}(x_{0},y_{0})=f_{y}(x_{0},y_{0})=0$.`,content:R`### Địa phương và toàn cục
Cực tiểu địa phương chỉ so sánh với các điểm đủ gần; cực tiểu toàn cục so sánh với mọi điểm khả thi. Một bài toán trên miền đóng, bị chặn cần xét cả nội miền lẫn biên; chỉ giải gradient bằng 0 có thể bỏ sót đáp án.

### Vì sao gradient phải bằng 0?
Nếu thay riêng x hoặc riêng y quanh điểm cực trị nội bộ, hai hàm một biến thu được đều có cực trị tại đó. Đạo hàm một biến phải bằng 0, nên cả hai thành phần gradient bằng 0.

### Điều kiện cần không phải điều kiện đủ
$f=x^2-y^2$ có gradient 0 tại gốc nhưng tăng theo trục x và giảm theo trục y. Vì vậy gốc là điểm yên ngựa. Ngược lại, điểm biên hoặc điểm không khả vi có thể đạt cực trị mà không thỏa điều kiện gradient bằng 0.

Một điểm yên ngựa không phải cực đại hay cực tiểu địa phương: trong mọi lân cận của điểm đó đều có điểm cho giá trị hàm lớn hơn, đồng thời có điểm cho giá trị nhỏ hơn. Với $x^{2}-y^{2}$ tại gốc, hai trục tọa độ cung cấp ngay hai họ điểm trái dấu.

### Quy trình trước khi phân loại
Ghi miền xác định, tính hai đạo hàm riêng, giải đồng thời, kiểm tra mọi nghiệm thuộc miền. Không giải một phương trình rồi bỏ phương trình còn lại.`,workedExample:example(R`Tìm điểm dừng của $f(x,y)=x^2+xy+y^2-6x-6y$.`,[R`$f_x=2x+y-6$, $f_y=x+2y-6$.`,R`Trừ hai phương trình dừng được $x=y$. Thế vào cho $3x=6$ nên $x=y=2$.`,R`Chỉ có một điểm dừng (2,2); vẫn cần kiểm tra Hessian hoặc hoàn thành bình phương để phân loại.`],R`Gradient tại (2,2) bằng (0,0). Giá trị hàm là −12, nhưng riêng giá trị ấy chưa chứng minh cực tiểu.`),recall:{front:'Vì sao tìm được gradient bằng 0 chưa thể kết luận cực trị?',back:'Gradient bằng 0 chỉ cho điều kiện cần của cực trị nội bộ khả vi. Điểm đó có thể là cực tiểu, cực đại hoặc điểm yên ngựa.'},trap:{title:'Bỏ qua miền và biên',wrong:"Mọi tối ưu đều tìm bằng $f_{x}=f_{y}=0$.",right:'Xét nội miền, biên và điểm không khả vi nếu có.',explanation:'Điều kiện dừng dựa trên khả năng thay đổi theo cả hai chiều quanh điểm.'}},
   {id:'section-2',title:'Hessian, định thức và trường hợp suy biến',conditions:'Điểm cần phân loại là điểm dừng nội miền; f có các đạo hàm riêng cấp hai liên tục trong một lân cận của điểm đó. Đánh giá các đạo hàm tại chính điểm dừng.',definition:R`Do tính liên tục của đạo hàm hỗn hợp, Hessian tại điểm dừng là ma trận đối xứng:
$$H=\begin{pmatrix}f_{xx}&f_{xy}\\f_{xy}&f_{yy}\end{pmatrix},\qquad D=|H|=f_{xx}f_{yy}-f_{xy}^{2}.$$
Tại điểm dừng, tiêu chuẩn phân loại là
$$\begin{array}{c|c}D>0,\ f_{xx}>0&\text{strict local minimum}\\D>0,\ f_{xx}<0&\text{strict local maximum}\\D<0&\text{saddle point}\\D=0&\text{inconclusive test}\end{array}.$$
`,content:R`### Vì sao Hessian phân loại được điểm dừng?
Với $h=(u,v)^{T}$ nhỏ, khai triển Taylor quanh điểm dừng cho
$$f(x_{0}+u,y_{0}+v)-f(x_{0},y_{0})=\frac{1}{2}h^{T}H(x_{0},y_{0})h+o(\|h\|^{2}).$$
Số hạng bậc nhất mất đi vì gradient bằng 0. Do đó dấu của dạng toàn phương $h^{T}Hh$ quyết định biến thiên gần điểm dừng khi dạng này xác định: dương xác định cho cực tiểu chặt, âm xác định cho cực đại chặt. Với Hessian $2\times2$, điều này được rút gọn thành bảng điều kiện trong phát biểu.

### Trường hợp suy biến
Nếu $D=0$, phần bậc hai không cho đủ thông tin; không được kết luận hàm không có cực trị. Chẳng hạn $x^{4}+y^{4}$ có cực tiểu tại gốc, còn $x^{4}-y^{4}$ có điểm yên ngựa tại đó. Mục kế tiếp sẽ kiểm tra trực tiếp hiệu $f-f(x_{0},y_{0})$ và phân biệt bằng chứng đủ với việc chỉ khảo sát vài đường.

`,workedExample:example(R`Phân loại điểm dừng $(2,2)$ của $f(x,y)=x^{2}+xy+y^{2}-6x-6y$.`,[R`Tại $(2,2)$, $f_{xx}=2$, $f_{xy}=1$, $f_{yy}=2$, nên $D=2\cdot2-1^{2}=3>0$.`,R`Vì $f_{xx}=2>0$, Hessian xác định dương và $(2,2)$ là cực tiểu địa phương chặt.`,R`Đặt $u=x-2$, $v=y-2$. Khi đó $f(x,y)+12=u^{2}+uv+v^{2}=(u+v/2)^{2}+3v^{2}/4\ge0$, nên cực tiểu còn là toàn cục duy nhất.`],R`Giá trị $f(2,2)=-12$ không tự chứng minh cực tiểu; kết luận đến từ Hessian, và bất đẳng thức cuối xác nhận toàn cục.`),recall:{front:"$D = 0$ trong tiêu chuẩn Hessian cho phép kết luận gì?",back:'Tiêu chuẩn không kết luận. Cần một lập luận khác; có thể có cực tiểu, cực đại hoặc yên ngựa tùy hàm.'},trap:{title:'Chỉ nhìn dấu định thức',wrong:"$D>0$ luôn là cực tiểu.",right:"Cần thêm dấu $f_{xx}$; dương cho cực tiểu, âm cho cực đại.",explanation:'Định thức dương cho hai độ cong cùng dấu, nhưng chưa cho biết cùng dương hay cùng âm.'}},
   {id:'section-3',title:'Tối đa hóa lợi nhuận và xác nhận toàn cục',conditions:'Mô hình khả vi trong miền sản lượng; mọi nghiệm phải thỏa điều kiện kinh tế như sản lượng không âm.',definition:R`Với lợi nhuận $\pi(q_1,q_2)$, ứng viên nội bộ thỏa $\pi_{q_1}=\pi_{q_2}=0$. Để kết luận tối đa toàn cục, cần thêm tính lõm trên miền lồi hoặc so sánh đầy đủ miền khả thi.`,content:R`### Phân biệt kết luận của Hessian
Hessian âm xác định **tại điểm dừng** cho cực đại địa phương. Nếu Hessian âm xác định tại mọi điểm trên một miền lồi, hàm lõm chặt trên miền đó; điểm dừng khi ấy là tối đa toàn cục duy nhất.

### Ràng buộc kinh tế không biến mất
Một nghiệm đại số âm có thể không thuộc miền $q_{1},q_{2}\ge 0$. Nếu điểm tối ưu không ở nội miền, phải xét các cạnh $q_{1}=0, q_{2}=0$ và các giới hạn hoặc ràng buộc còn lại. Không sửa nghiệm âm thành 0 mà không giải lại bài toán.

### Báo cáo kết quả
Ghi cả phối hợp sản lượng, giá trị lợi nhuận và cơ sở phân loại. Nếu chỉ xác nhận được địa phương, không gọi đó là tối ưu toàn cục.`,workedExample:example(R`Tối đa hóa $\pi=20q_1+16q_2-q_1^2-q_2^2-q_1q_2$ trên $q_{1},q_{2}\ge 0$.`,[R`Hệ dừng: $2q_1+q_2=20$, $q_1+2q_2=16$. Nghiệm (8,4) thuộc nội miền.`,R`$H=\begin{pmatrix}-2&-1\\-1&-2\end{pmatrix}$, $D=3>0$ và phần tử đầu −$2<0$.`,R`H không đổi, âm xác định trên toàn mặt phẳng; $\pi$ lõm chặt. Điểm (8,4) là tối đa toàn cục trên miền khả thi.`,R`$\pi(8,4)=160+64-64-16-32=112$.`],R`Nếu xét cạnh $q_{2}=0$, tối đa cạnh là $\pi (10,0)=100$, thấp hơn 112. Cạnh $q_{1}=0$ cũng cho giá trị thấp hơn.`),recall:{front:'Khi nào một cực đại địa phương được xác nhận là tối đa toàn cục?',back:'Một cơ sở đủ là hàm lõm trên toàn miền lồi và điểm xét là điểm dừng khả thi; lõm chặt còn cho tính duy nhất.'},trap:{title:'Tự động nâng địa phương thành toàn cục',wrong:'Hessian âm tại một điểm nên điểm đó lớn nhất trên mọi miền.',right:'Cần tính lõm trên miền hoặc lập luận so sánh toàn cục.',explanation:'Độ cong tại một điểm không mô tả mọi nơi khác.'}}
  ]
 },
 'chuyen-de-9':{
  summary:'Từ điều kiện tiếp xúc suy ra hệ Lagrange; Hessian biên xét độ cong trên đúng đường khả thi; bài toán chi phí và ngân sách cho thấy vì sao phải kiểm tra toàn miền.',
  objectives:['Thiết lập hệ Lagrange cùng phương trình ràng buộc, nêu điều kiện chính quy.','Phân loại ứng viên trên đường bằng một Hessian biên và phân biệt kết luận địa phương với toàn cục.','Giải bài toán tối thiểu chi phí và kiểm tra riêng ràng buộc ngân sách dạng bằng hoặc không vượt mức.'],
  references:['Slide LXT · lecture08, trang 17–21: cực trị có điều kiện, Lagrange và Hessian biên','TUD_v2.pdf · trang 29–30: Lagrange, Hessian biên và bài toán chi phí','main.pdf · trang 196–197, 223–224: nghiệm tối ưu và cách đọc ràng buộc'],
  sections:[
   {id:'section-1',title:'Hướng tiếp xúc và hệ phương trình Lagrange',conditions:"f,g khả vi; tại ứng viên trên $g=c$ cần $\\nabla g \\ne  0$. Bất đẳng thức và điểm biên cần xét riêng.",definition:R`Chọn quy ước $L=f-\lambda(g-c)$. Ứng viên chính quy thỏa
$$f_x-\lambda g_x=0,\quad f_y-\lambda g_y=0,\quad g=c.$$
Không được bỏ phương trình ràng buộc.`,content:R`### Ý nghĩa hình học
Dọc đường $g=c$, các hướng tiếp xúc u thỏa $\nabla g\cdot u=0$. Tại cực trị có ràng buộc, f không tăng hay giảm bậc một theo các hướng ấy, nên $\nabla f$ vuông góc cùng đường tiếp xúc: $\nabla f=\lambda \nabla g$.

### Quy ước dấu
Nếu dùng $L=f+\lambda(g-c)$ thay vì dấu trừ, dấu của $\lambda$ đổi nhưng điểm tối ưu không đổi. Không trộn hai quy ước trong cùng phép tính. Diễn giải $\lambda$ như giá trị biên của ràng buộc cũng phải theo quy ước và điều kiện thích hợp.

### Khi điều kiện chính quy hỏng
Nếu $\nabla g=0$ tại một điểm khả thi, không dùng riêng hệ Lagrange thông thường để loại bỏ điểm đó. Phải xét trực tiếp. Tương tự, với miền có thêm $x,y\ge 0$, điểm trên các trục không nhất thiết được tìm thấy từ bài toán đẳng thức nội bộ.`,workedExample:example(R`Tìm ứng viên tối đa $f=xy$ với $x+y=10$ và $x,y\ge 0$.`,[R`$L=xy-\lambda(x+y-10)$.`,R`$L_x=y-\lambda=0$, $L_y=x-\lambda=0$, $x+y=10$.`,R`Suy ra $x=y=\lambda =5$. Giá trị ứng viên $f=25$.`,R`$\nabla g=(1,1)$ khác 0, nên điều kiện chính quy được thỏa.`],R`Lagrange mới xác định ứng viên. Cần phân loại hoặc viết $y=10-x$ để xét trực tiếp.`),recall:{front:"Vì sao phải có $\\nabla g \\ne  0$ khi dùng điều kiện Lagrange thông thường?",back:"Để đường ràng buộc có hướng tiếp xúc chính quy và $\\nabla g$ đóng vai trò pháp tuyến. Khi gradient ràng buộc bằng 0, điều kiện này có thể bỏ sót điểm cực trị."},trap:{title:'Bỏ phương trình ràng buộc',wrong:"Chỉ giải $L_{x}=L_{y}=0$ rồi tự chọn $\\lambda$.",right:"Giải đồng thời hai phương trình đạo hàm và $g=c$.",explanation:"$\\lambda , x, y$ đều là ẩn; ràng buộc là phương trình thiết yếu."}},
   {id:'section-2',title:'Hessian biên và kiểm tra trên đường khả thi',conditions:'Hai biến, một ràng buộc đẳng thức chính quy; f,g có đạo hàm cấp hai liên tục. Lập H của L theo x,y tại ứng viên.',definition:R`Với quy ước biên
$$H_b=\begin{pmatrix}0&g_x&g_y\\g_x&L_{xx}&L_{xy}\\g_y&L_{yx}&L_{yy}\end{pmatrix},$$
vectơ tiếp xúc có thể chọn $t=(g_{y},-g_{x})$. Khi đó $\det H_b=-t^T H_Lt$.`,content:R`### Vì sao dấu khác Hessian thông thường?
Chỉ các hướng tiếp xúc ràng buộc mới được phép xét. Với hai biến và một ràng buộc chính quy, độ cong hạn chế là một số $t^TH_Lt$. Dương cho cực tiểu chặt trên đường, âm cho cực đại chặt. Do đẳng thức trên, $\det (H_b)<0$ cho cực tiểu và $\det (H_b)>0$ cho cực đại, theo đúng quy ước ma trận đã ghi.

### Không học thuộc dấu tách khỏi ma trận
Thay số biến, số ràng buộc hay quy ước biên có thể thay tiêu chuẩn. Phải ghi cấu trúc đang dùng. Nếu định thức bằng 0, tiêu chuẩn không kết luận.

### Toàn cục vẫn cần xét miền
Một kết luận địa phương trên đường không tự bảo đảm toàn cục. Với đoạn khả thi compact, xét ứng viên và hai đầu đoạn; với đường không bị chặn, cần thêm lập luận về giới hạn hoặc bất đẳng thức.`,workedExample:example(R`Phân loại điểm (5,5) của $f=xy$ trên $x+y=10, x,y\ge 0$.`,[R`Với $L=xy-\lambda (x+y-10)$, $H_L=\begin{pmatrix}0&1\\1&0\end{pmatrix}$.`,R`Chọn $t=(1,-1)$, được $t^{T}H_{L}t=-2<0$: cực đại chặt trên đường.`,R`$H_b=\begin{pmatrix}0&1&1\\1&0&1\\1&1&0\end{pmatrix}$ có định thức $2>0$, khớp tiêu chuẩn.`,R`Thế $y=10-x$: $f=25-(x-5)^{2}\le 25$ trên [0,10]. Hai đầu cho 0, nên đây là tối đa toàn cục.`],R`Dấu dương của $\det (H_b)$ cho cực đại trong cấu trúc này, không áp dụng quy tắc $D>0$ của Hessian $2\times 2$ một cách máy móc.`),recall:{front:"Với Hessian biên đã ghi cho hai biến, một ràng buộc chính quy, $\\det (H_b)>0$ nghĩa là gì?",back:"Cho cực đại địa phương chặt trên đường ràng buộc, vì độ cong tiếp xúc $t^{T}H_{L}t = -\\det (H_b)<0$. Cần ghi đúng cấu trúc ma trận và kiểm tra chính quy."},trap:{title:'Đồng nhất Hessian biên với Hessian thường',wrong:'Định thức Hessian biên dương nên chắc chắn cực tiểu.',right:'Phải xét tiêu chuẩn phù hợp cấu trúc biên và hướng tiếp xúc.',explanation:'Ràng buộc loại bớt các hướng biến thiên; quy tắc dấu đổi theo cấu trúc.'}},
    {id:'section-3',title:'Tối thiểu chi phí: tỷ lệ biên và chứng minh nghiệm',conditions:"Hai đầu vào $x,y>0$; đơn giá $p_x,p_y>0$; sản lượng mục tiêu khả thi. Điều kiện tỷ lệ áp dụng cho nghiệm nội bộ.",definition:R`Xét hàm sản xuất $Q(x,y)$ và tổng chi phí $C=p_xx+p_yy$. Tại nghiệm tối thiểu nội bộ trên đường $Q(x,y)=Q_0$, với $L=C-\lambda(Q-Q_0)$, ta có
$$\frac{Q_x}{p_x}=\frac{Q_y}{p_y}\qquad\Longleftrightarrow\qquad\frac{Q_x}{Q_y}=\frac{p_x}{p_y},$$
miễn các đạo hàm và đơn giá trong mẫu khác $0$. Hai đầu vào phải tạo ra cùng sản lượng biên trên một đơn vị chi phí.`,content:R`### Suy ra điều kiện cân bằng đầu vào
Từ $L=p_xx+p_yy-\lambda(Q-Q_0)$, điều kiện dừng theo hai đầu vào là $p_x=\lambda Q_x$ và $p_y=\lambda Q_y$. Chia từng phương trình cho đơn giá cho $\frac{Q_x}{p_x}=\frac{Q_y}{p_y}$. Đây là sự cân bằng năng suất biên trên mỗi đồng chi phí; nó đi cùng ràng buộc $Q=Q_0$, không thay thế ràng buộc đó.

### Bài giảng: hàm sản xuất Cobb–Douglas
Với $Q=3x^{2/3}y^{1/3}$, ta có
$$Q_x=2x^{-1/3}y^{1/3},\qquad Q_y=x^{2/3}y^{-2/3},\qquad \frac{Q_x}{Q_y}=\frac{2y}{x}.$$
Nếu giá hai đầu vào lần lượt là $p_x=2$ và $p_y=1$, điều kiện cân bằng cho $\frac{2y}{x}=2$, tức phối hợp nội bộ tối ưu phải có $x=y$. Mức sản lượng mục tiêu quyết định quy mô của phối hợp ấy.

### Từ ứng viên địa phương đến tối ưu toàn cục
Lagrange tìm ứng viên nội bộ. Để khẳng định chi phí nhỏ nhất trên toàn đường sản lượng, có thể rút một biến từ ràng buộc rồi khảo sát hàm một biến, hoặc dùng một bất đẳng thức với điều kiện dấu bằng. Cần kiểm tra miền dương và hành vi ở hai đầu miền; riêng điều kiện dừng không đủ loại mọi khả năng.` ,workedExample:example(R`Theo bài giảng, tìm chi phí nhỏ nhất để sản xuất $100$ đơn vị với $Q=3x^{2/3}y^{1/3}$ và $C=2x+y$.`,[R`Đặt $L=2x+y-\lambda(Q-100)$. Hệ điều kiện dừng gồm $2=\lambda Q_x$, $1=\lambda Q_y$ và $3x^{2/3}y^{1/3}=100$.`,R`Chia hai phương trình đầu: $2=\frac{Q_x}{Q_y}=\frac{2y}{x}$, do đó $y=x$.`,R`Thế vào ràng buộc: $3x=100$. Vì $x,y>0$, ta được $x=y=\frac{100}{3}$ và $C=2\cdot\frac{100}{3}+\frac{100}{3}=100$.`,R`Kiểm tra toàn cục: ràng buộc tương đương $x^{2}y=\frac{10^{6}}{27}$, nên $y=\frac{10^{6}}{27x^{2}}$ và $\phi(x)=2x+\frac{10^{6}}{27x^{2}}$.`,R`Ta có $\phi'(x)=2-2\cdot\frac{10^{6}}{27x^{3}}$; nghiệm dừng duy nhất là $x=\frac{100}{3}$. Hơn nữa $\phi''(x)=6\cdot\frac{10^{6}}{27x^{4}}>0$ với mọi $x>0$, còn $\phi(x)\to+\infty$ khi $x\to0^{+}$ hoặc $x\to+\infty$. Vậy phối hợp trên là cực tiểu toàn cục duy nhất.`],R`Từ slide: $Q=3x^{2/3}y^{1/3}$, $p_x=2$, $p_y=1$, $Q_0=100$. Kết quả $x=y=\frac{100}{3}$, $C_{\min}=100$.`),recall:{front:"Tại sao điều kiện chi phí tối thiểu là $\\frac{Q_x}{p_x}=\\frac{Q_y}{p_y}$?",back:"Điều kiện dừng cho $p_x=\\lambda Q_x$ và $p_y=\\lambda Q_y$. Chia lần lượt cho đơn giá cho cùng sản lượng biên trên mỗi đồng chi phí; vẫn phải ghép với $Q=Q_0$."},trap:{title:'Chỉ giải tỷ lệ mà quên quy mô',wrong:'Từ $\\frac{Q_x}{p_x}=\\frac{Q_y}{p_y}$ kết luận được ngay lượng đầu vào tối ưu.',right:'Dùng tỷ lệ để tìm phối hợp, rồi thế vào ràng buộc sản lượng để tìm lượng cụ thể.',explanation:'Điều kiện tối ưu biên xác định quan hệ giữa đầu vào; mục tiêu sản lượng xác định quy mô.'}}
  ]
 },
 'chuyen-de-10':{
  summary:'Nguyên hàm kiểm tra bằng đạo hàm; phương trình vi phân kiểm tra bằng thay nghiệm và điều kiện đầu. Chỉ xét phương trình vi phân cấp một và các ứng dụng.',
  objectives:['Chọn đổi biến hoặc từng phần phù hợp và giữ đúng hằng số.','Giải tách biến không bỏ nghiệm hằng; giải tuyến tính với nhân tử tích phân.','Hiệu chỉnh mô hình tăng trưởng và diễn giải tham số, đơn vị.'],
  references:['TUD_v2.pdf · trang 22–24: tích phân','TUD_v2.pdf · trang 32–34: phương trình vi phân cấp một, tăng trưởng và Solow','Ghi chép Buổi 9–10 · vi phân và PTVP'],
  sections:[
   {id:'section-1',title:'Nguyên hàm, tích phân và cách chọn phương pháp',conditions:"Xét trên một khoảng mà các hàm liên quan xác định. Với ∫$1/x$ cần khoảng không qua 0; tích phân xác định cần điều kiện tồn tại phù hợp.",definition:R`F là một nguyên hàm của f nếu $F'=f$. Mọi nguyên hàm trên một khoảng có dạng $F+C$. Với f liên tục, $\int_a^b f(x)dx=F(b)-F(a)$.`,content:R`### Bảng công thức cốt lõi
$\int x^a dx=x^{a+1}/(a+1)+C$ khi $a\ne -1$ trên miền phù hợp; $\int dx/x=\ln|x|+C$; $\int e^x dx=e^x+C$. Phân biệt nguyên hàm có C với tích phân xác định là một số.

### Đổi biến
Nếu thấy hàm trong và đạo hàm của nó, đặt $u=g(x), du=g'(x)dx$. Ví dụ $\int2x/(1+x^2)dx=\ln(1+x^2)+C$. Với tích phân xác định, hoặc đổi cả cận sang u, hoặc trở lại x trước khi thế cận; không trộn hai hệ cận.

### Từng phần
Từ $(uv)'=u'v+uv'$ suy ra $\int u\,dv=uv-\int v\,du$. Chọn u sao cho đạo hàm đơn giản hơn, dv sao cho tìm được v. Đây là lựa chọn theo cấu trúc, không chỉ thuộc một thứ tự máy móc.

### Diện tích có dấu
Tích phân f là diện tích có dấu. Nếu f đổi dấu, diện tích hình học là tích phân |f| và cần chia khoảng theo các nghiệm; không lấy một tích phân có triệt tiêu rồi gọi là diện tích.`,workedExample:example(R`Tính $\int xe^x dx$ và $\int_0^1 xe^x dx$.`,[R`Đặt $u=x, dv=e^{x}dx$; khi đó $du=dx, v=e^{x}$.`,R`$\int xe^x dx=xe^x-\int e^x dx=(x-1)e^x+C$.`,R`Tích phân từ 0 đến 1 bằng $[(x-1)e^x]_0^1=0-(-1)=1$.`],R`Đạo hàm $(x-1)e^{x}$ bằng $e^{x}+(x-1)e^{x}=$xeˣ. Hàm không âm trên [0,1], nên kết quả 1 cũng là diện tích.`),recall:{front:'Cách kiểm tra một nguyên hàm và cách tránh nhầm cận khi đổi biến?',back:'Đạo hàm kết quả phải thu lại hàm dưới dấu tích phân. Khi đổi sang u, đổi cả cận hoặc quay lại x trước khi thế cận.'},trap:{title:'Quên dấu trừ trong từng phần',wrong:"∫$u dv = uv +$ ∫v du.",right:"∫$u dv = uv -$ ∫v du.",explanation:'Công thức được chuyển vế từ đạo hàm của tích, vì vậy có dấu trừ.'}},
   {id:'section-2',title:'Phương trình tách biến và nghiệm bị mất khi chia',conditions:"Trước khi chia cho h(y), xét riêng các nghiệm $h(y)=0$. Làm việc trên khoảng mà nghiệm và các phép chia xác định.",definition:R`Dạng tách biến: $y'=g(x)h(y)$. Với h(y) khác 0:
$$\frac{dy}{h(y)}=g(x)dx.$$
Lấy nguyên hàm hai vế để tìm một quan hệ giữa x và y, rồi dùng điều kiện đầu nếu có.`,content:R`### Nghiệm hằng phải xét trước
Mỗi nghiệm $y=c$ của $h(c)=0$ cho một nghiệm hằng của phương trình, nếu phương trình ban đầu xác định. Chia ngay cho h(y) sẽ loại mất chúng. Đây là một thay đổi miền của phép biến đổi, không phải chi tiết nhỏ.

### Hằng số và dấu
Tích phân $dy/y$ cho ln|y|, không phải luôn ln y. Sau lấy hàm mũ, hằng số nhân có thể mang dấu tùy nhánh nghiệm. Nếu đã giả thiết $y>0$, hằng số tương ứng phải dương.

### Điều kiện đầu
Thay $(x_{0},y_{0})$ vào họ nghiệm để tìm C; kiểm tra nghiệm trên một khoảng chứa $x_{0}$. Không chỉ tìm C rồi bỏ qua mẫu có thể bằng 0 hoặc nhánh không tương thích.

### Kiểm tra cuối
Tính $y'$ từ kết quả và thay vào phương trình gốc, đồng thời kiểm tra điều kiện đầu. Kiểm tra phương trình đã chia có thể không phát hiện nghiệm hằng bị mất.`,workedExample:example(R`Giải $y'=2xy$ và tìm nghiệm thỏa $y(0)=2$.`,[R`Xét $y=0$: đây là một nghiệm hằng của phương trình gốc.`,R`Với $y\ne 0$: $dy/y=2x dx$; tích phân cho $\ln |y|=x^{2}+C_{1}$.`,R`Suy ra $y=Ce^{x^2}$; cho phép $C=0$ để gom cả nghiệm hằng.`,R`Điều kiện $y(0)=2$ cho $C=2$, nên nghiệm riêng $y=2e^{x^2}$.`],R`$y'=4$xeˣ²=$2x\cdot y$ và $y(0)=2$. Nghiệm xác định trên toàn trục thực.`),recall:{front:"Trước khi tách $dy/h(y)$, phải làm bước nào và vì sao?",back:"Xét nghiệm $h(y)=0$ để giữ các nghiệm hằng. Phép chia chỉ tương đương trên miền $h(y)\\ne 0$."},trap:{title:'Đặt hằng số cộng bên ngoài hàm mũ',wrong:"$\\ln |y|=x^{2}+C$ nên $y=e^{x^2}+C$.",right:"Hằng số trở thành hệ số nhân: $y=Ce^{x^2}$, với quy ước C phù hợp.",explanation:"$e^{x^{2}+C_{1}}=e^{C_{1}}\\cdot e^{x^2}$, không phải $e^{x^2}+C_{1}$."}},
   {id:'section-3',title:'Tuyến tính cấp một và nhân tử tích phân',conditions:"Đưa về $y'+p(x)y=q(x); p,q$ liên tục trên khoảng xét. Nếu chia để chuẩn hóa, phải loại các điểm làm hệ số $y'$ bằng 0.",definition:R`Đặt $\mu(x)=e^{\int p(x)dx}$. Vì $\mu'=p\mu$, nhân hai vế cho $\mu$ biến vế trái thành $(\mu y)'$:
$$y=\frac1\mu\left(\int\mu q\,dx+C\right).$$`,content:R`### Tại sao nhân tử tích phân có dấu như vậy?
$(\mu y)'=\mu y'+\mu'y=\mu(y'+py)$ nếu $\mu '/\mu =p$. Do đó $\mu$ phải có số mũ +∫p; sau khi tích phân mới chia cho $\mu$. Nhớ cả hai bước sẽ tránh đảo dấu nhầm.

### Cách dùng hằng số
Hệ số nhân khác 0 của $\mu$ có thể được bỏ vì sẽ được hấp thụ vào hằng số C. Không cần thêm một hằng số độc lập cho mọi lần tính nguyên hàm trung gian.

### Miền nghiệm
Nếu p hoặc q có điểm kỳ dị, giải trên từng khoảng liên thông tránh các điểm ấy. Điều kiện đầu quyết định khoảng thích hợp. Một biểu thức đại số có thể viết ra ngoài khoảng nhưng không có nghĩa phương trình gốc xác định ở đó.

### Phân biệt với phương trình không tuyến tính
Các hạng như $y^{2}$ hay $yy'$ khiến phương trình không còn tuyến tính theo y ở dạng này. Một phương trình có thể vừa tách biến vừa tuyến tính, nhưng không phải mọi phương trình đều thuộc hai dạng đó.`,workedExample:example(R`Giải $y'-2y/x=x^2$, $y(1)=2$ trên $x>0$.`,[R`$p(x)=-2/x$ nên $\mu=e^{-2\ln x}=x^{-2}$.`,R`Nhân hai vế: $(x^{-2}y)'=1$.`,R`Tích phân cho $x^{-2}y=x+C$, tức $y=x^{3}+$Cx².`,R`$y(1)=2$ cho $C=1; y=x^{3}+x^{2}$.`],R`$y'-2y/x=(3x^{2}+2x)-(2x^{2}+2x)=x^{2}$. Điểm $x=0$ không nằm trong miền phương trình.`),recall:{front:"Giải thích $\\mu=e^{\\int p\\,dx}$ bằng quy tắc đạo hàm tích.",back:"Chọn $\\mu'=p\\mu$ để $(\\mu y)'=\\mu y'+\\mu'y=\\mu(y'+py)$. Sau đó tích phân $\\mu q$ và chia lại cho $\\mu$."},trap:{title:"Quên chuẩn hóa hệ số $y'$",wrong:"Từ $a(x)y'+b(x)y=c(x)$ lấy $p=b$ ngay.",right:"Trên $a(x)\\ne 0$, chia trước để có $p=b/a, q=c/a$.",explanation:"Công thức nhân tử tích phân áp dụng khi hệ số của $y'$ bằng 1."}},
   {id:'section-4',title:'Tăng trưởng mũ và hiệu chỉnh tham số',conditions:"$N'=kN$ với k không đổi, $N_{0}>0$. Đơn vị thời gian của k phải thống nhất với t.",definition:R`Nghiệm là $N(t)=N_0e^{kt}$. Từ hai quan sát $N_{1},N_{2}$ cách nhau $\Delta t$:
$$k=\frac{\ln(N_2/N_1)}{\Delta t}.$$
Nếu $k>0$, thời gian gấp đôi là $T_2=\ln2/k$.`,content:R`### Tốc độ tương đối và tuyệt đối
$k=N'/N$ là tốc độ tăng trưởng tức thời tương đối; $N'=kN$ là tốc độ tăng tuyệt đối. Cùng k nhưng quy mô N lớn hơn sẽ có số tăng thêm lớn hơn. $k=0,05$ $\text{nam}^{-1}$ không có nghĩa mỗi năm cộng 0,05 đơn vị dân số.

### Tăng trưởng liên tục và lãi kép rời rạc
Mô hình $e^{kt}$ dùng tốc độ liên tục. Một mức tăng theo năm rời rạc g thỏa $N(t+1)=(1+g)N(t)$ tương ứng $k=\ln (1+g)$, không phải luôn $k=g$ chính xác.

### Giới hạn của mô hình
Giả thiết k cố định có thể chỉ phù hợp một khoảng thời gian. Ngoại suy rất xa có thể sai lớn. Báo cáo kết quả như hệ quả của mô hình, không như sự kiện chắc chắn của dân số hay nền kinh tế.`,workedExample:example(R`Dân số tăng từ 2 lên 3 tỷ người sau 30 năm. Hiệu chỉnh k và tìm thời gian gấp đôi trong mô hình mũ.`,[R`$3=2e^{30k}$ nên $k=\ln(3/2)/30\approx0.0135155$ $\text{nam}^{-1}$.`,R`$T_2=\ln2/k\approx51.2853$ năm.`,R`Tại $t=85$ năm từ mốc đầu, dự báo theo mô hình là $2e^{85\ln(1.5)/30}$ tỷ người.`],R`Thế $t=30$ phải thu lại đúng 3. Không lấy $(3-2)/30$ làm tốc độ k vì đó là mức tăng tuyệt đối bình quân.`),recall:{front:'Hai quan sát dân số cho tốc độ k bằng công thức nào? Tại sao dùng logarit của tỷ số?',back:"$k=\\ln (N_{2}/N_{1})/\\Delta t$ vì $N_2/N_1=e^{k\\Delta t}$. Mô hình quy định tăng theo tỷ lệ, không theo chênh lệch tuyệt đối cố định."},trap:{title:'Nhầm tốc độ liên tục với mức tăng rời rạc',wrong:"Tăng 10% mỗi năm rời rạc luôn có $k=0,10$ chính xác.",right:"Tốc độ liên tục tương đương là $k=\\ln (1,10)$.",explanation:'Hai mô hình chỉ gần nhau khi tốc độ đủ nhỏ.'}},
   {id:'section-5',title:'Solow đơn giản: trạng thái dừng và hướng chuyển động',conditions:"Mô hình đang dùng $k'=$sAkᵅ−nk, chưa có khấu hao; $A>0, 0<s<1, n>0, 0<\\alpha <1, k>0$.",definition:R`$k=K/L$ là vốn bình quân lao động; $f(k)=$Akᵅ là sản lượng bình quân. Đầu tư bình quân sf(k) tăng k, còn tăng lao động tạo mức pha loãng nk. Trạng thái dừng dương:
$$k^*=\left(\frac{sA}{n}\right)^{1/(1-\alpha)}.$$`,content:R`### Suy ra phương trình từ đại lượng bình quân
Khi $K'=$sQ, $L'=$nL và $Q=$Lf($K/L$), quy tắc đạo hàm thương cho $k'=K'/L-KL'/L^2=sf(k)-nk$. Vì vậy hai hạng có cùng đơn vị vốn bình quân trên đơn vị thời gian.

### Trạng thái dừng không phải tổng vốn đứng yên
$k'=0$ nghĩa là $K/L$ không đổi. Nếu L vẫn tăng thì K và Q vẫn có thể tăng cùng tốc độ n. Phải phân biệt tổng lượng và lượng bình quân.

### Ổn định theo dấu
Với $\alpha <1, k$ dưới $k^*$ cho $k'>0, k$ trên $k^*$ cho $k'<0$; trạng thái dương thu hút các nghiệm có vốn ban đầu dương. Nếu bổ sung khấu hao $\delta$, hạng pha loãng đổi thành $(n+\delta )k$ và công thức trạng thái dừng cũng đổi. Không tự thêm $\delta$ vào mô hình không có $\delta$.`,workedExample:example(R`Cho $k'=0,4\sqrt k-0,1k$ với $k>0$. Tìm trạng thái dừng và hướng chuyển động.`,[R`Đặt $k'=0$: $\sqrt k(0,4-0,1\sqrt k)=0$. Trong miền $k>0, \sqrt k=4$ nên $k^*=16$.`,R`Nếu $0<k<16$ thì $0,4-0,1\sqrt k>0$, nên k tăng. Nếu $k>16$ thì k giảm.`,R`Đặt $u=\sqrt k$ để kiểm tra: $u'=0,2-0,05u$; do đó $u(t)=4+(u_{0}-4)e^{-0.05t}$ và $k(t)=u(t)^{2}$.`],R`Khi t tăng, u tiến về 4, nên k tiến về 16. Đây vẫn là ứng dụng phương trình vi phân cấp một.`),recall:{front:"Trong mô hình Solow, $k'=0$ có nghĩa K và Q không tăng nữa không?",back:"Không. $k=K/L$ là đại lượng bình quân; k cố định vẫn cho phép K và Q tăng cùng tốc độ với lao động. Cần đọc đúng đại lượng đang dừng."},trap:{title:'Nhầm tổng vốn với vốn bình quân',wrong:'k đứng yên nên tổng vốn K đứng yên.',right:"$k=K/L$ có thể đứng yên trong khi K,L cùng tăng.",explanation:'Đạo hàm của một tỷ số phụ thuộc cả tử lẫn mẫu.'}}
  ]
 }
};
