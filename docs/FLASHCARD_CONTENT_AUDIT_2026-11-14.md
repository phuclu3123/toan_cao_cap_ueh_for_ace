# Rà soát học liệu Flashcard TCC: chuyên đề 1–10

Ngày rà: 14/11/2026. Kết luận: **chưa đủ nội dung để chốt bản học liệu rồi nhập MongoDB**.

## 1. Phạm vi và cách đối chiếu

- Đối chiếu cả 17 PDF trong `frontend/public/docs/SLIDE_PNTA` và `SLIDE_LXT`: 449 trang PDF, trong đó PNTA 330 trang và LXT 119 trang.
- “Chương 1–10” trong báo cáo là 10 chuyên đề trên website. Chương trong slide PNTA và số lecture LXT không trùng số chuyên đề website.
- Đúng yêu cầu đã chốt: **PTVP cấp một thuộc phạm vi; PTVP cấp hai không thuộc phạm vi; đạo hàm cấp cao và công thức vi phân cấp hai vẫn thuộc phạm vi nếu có trong hai bộ slide**.
- PNTA Chương 7 mục II từ trang 39 nói về PTVP cấp hai: không tính thiếu nội dung này. Cuối trang 56 và trang 57 có bài tập PTVP cấp một, vẫn thuộc phạm vi.
- Kiểm tra đúng dữ liệu được sử dụng: `App.jsx` đặt tên biến lazy là `FlashcardStudyPage` nhưng thực tế import `pages/StudyWorkspace`. Nội dung cuối được tạo từ `studyCurriculum.js`, các nguồn nền, các bản `reviewed*`, rồi ghi đè thêm bằng `chapterEditorial.js`.
- Đã xuất đối tượng `studyTopics` sau khi ghép tất cả các lớp để đối chiếu bài học, thẻ và quiz. Một chủ đề có trong file cũ nhưng bị ghi đè hoặc bỏ khỏi bộ cuối không được tính là đã có.
- Đã kiểm tra các scene được gọi bởi `MathExplorers`; không đánh đồng “không có trong đoạn văn” với “không có ở đâu trên trang”.
- Rà bao phủ theo chủ đề và các trang nguồn; đọc sâu các định nghĩa, công thức và ví dụ liên quan khoảng trống. Một số trang công thức PDF được render để kiểm tra trực quan. Đây **không phải xác nhận từng bước của toàn bộ bài tập trong 449 trang**, cũng chưa phải nghiệm thu hiển thị trên mọi trình duyệt.
- Không sửa học liệu, không ghi MongoDB trong lượt rà này. Các script và trích xuất phục vụ đối chiếu nằm trong `tmp/flashcard-audit/`.

## 2. Hiện trạng đo được

| Chuyên đề website | Mục lý thuyết | Thẻ | Câu quiz | Mục có ít nhất một quiz |
| --- | ---: | ---: | ---: | ---: |
| 1. Ma trận và định thức | 10 | 30 | 3 | 3/10 |
| 2. Nghịch đảo và hạng | 8 | 24 | 3 | 3/8 |
| 3. Hệ phương trình tuyến tính | 7 | 21 | 3 | 3/7 |
| 4. Leontief | 6 | 18 | 3 | 3/6 |
| 5. Đạo hàm và hàm ẩn | 5 | 15 | 3 | 3/5 |
| 6. Đại lượng biên và co giãn | 4 | 12 | 3 | 2/4 |
| 7. Hàm nhiều biến và vi phân | 4 | 12 | 2 | 2/4 |
| 8. Cực trị một và hai biến | 5 | 15 | 3 | 3/5 |
| 9. Lagrange và Hessian biên | 4 | 12 | 3 | 3/4 |
| 10. Tích phân và PTVP cấp một | 9 | 27 | 9 | 9/9 |
| **Tổng** | **62** | **186** | **35** | **34/62** |

28 mục hiện chưa có câu hỏi quiz riêng. Đây là số đo theo `sectionId`, không phải tỷ lệ kiến thức đã đầy đủ. Có quiz hoặc có ba thẻ không có nghĩa mọi công thức của mục đã được ôn.

Mỗi mục đang sinh đúng ba thẻ bằng `textbookCards`: một thẻ recall, một thẻ nhận diện sai lầm và một thẻ từ ví dụ có lời giải. Ví dụ mục “bảng đạo hàm” có nhiều công thức nhưng thẻ recall chỉ hỏi arctan và ln trị tuyệt đối, thẻ vận dụng cũng chỉ kiểm tra hai dạng này; chưa có các thẻ riêng để bao phủ toàn bảng.

## 3. Đối chiếu từng chuyên đề

### 1. Ma trận và định thức — nền tảng đã có, thiếu nhánh lũy thừa và ứng dụng

**Có:** kích thước, chỉ số, các dạng cơ bản; cộng/trừ/nhân số/nhân ma trận; chuyển vị và đảo thứ tự tích; ma trận tam giác; định thức cấp 2, Sarrus, Laplace; tác động biến đổi dòng/cột; định thức tích, chuyển vị, lũy thừa, nghịch đảo; phản ví dụ cho tính cộng của định thức.

**Cần bổ sung:**

1. Định nghĩa lũy thừa ma trận vuông, `A^0=I`, quy tắc theo số mũ và điều kiện áp dụng. Hiện có `det(A^r)` nhưng chưa có bài học về chính `A^r`.
2. Điều kiện giao hoán khi dùng `(AB)^k=A^kB^k` và hằng đẳng thức như `(A+B)^2=A^2+2AB+B^2`. Chuyên đề 2 mới nêu một tình huống đặc biệt `AB=kI`, chưa thay thế được lý thuyết chung.
3. Ma trận quay, tính lũy thừa ma trận quay, ma trận lũy linh và cách khai thác cấu trúc để tính `A^n`.
4. Ít nhất một bài toán lập phép nhân ma trận từ bảng giá–lượng hàng/doanh thu.

**Nguồn:** PNTA C1 trang 10–19; nền phép toán/định thức ở PNTA C1 trang 1–29 và LXT lecture01–02. Số chương của PNTA C1 còn bao gồm nghịch đảo và hạng, được đối chiếu tại chuyên đề 2 bên dưới.

**Lưu ý biên tập:** `det-laplace` dùng câu “Định thức con M_ij là một ma trận” trong khi chính bài đã đặt M_ij là ma trận con và |M_ij| mới là số. Cần thống nhất thuật ngữ “ma trận con” và “định thức con”.

### 2. Nghịch đảo và hạng — bao phủ tốt phần phương pháp, còn thiếu một số hệ quả

**Có:** khả nghịch/không suy biến; tính duy nhất; điều kiện định thức và hạng; phần bù/phụ hợp; `AP_A=P_AA=det(A)I`; công thức nghịch đảo; Gauss–Jordan cấp ba; phương trình ma trận đúng phía; hạng qua định thức con, bậc thang và tham số.

**Cần bổ sung:**

1. Dựng nghịch đảo từ đẳng thức đa thức của A, ví dụ `A²−5A+I=0`, thay vì chỉ từ phụ hợp hoặc Gauss–Jordan.
2. Trường hợp `A²=0` dẫn đến `(I+A)^−1=I−A`.
3. Công thức phụ hợp khi nhân vô hướng `P_(αA)=α^(n−1)P_A`; ứng dụng với `P_(2A)`, `AP_(3A)` và dấu khi thay A bằng −A. Hiện có định thức của phụ hợp, nhưng chưa có hệ quả này trong học liệu cuối.
4. Thẻ và quiz riêng cho các phương pháp tính nghịch đảo và biện luận hạng. Hiện phần quiz chỉ gắn với ba mục.

**Nguồn:** PNTA C1 trang 30–37, 44–52, 58–73; LXT lecture03–04. Không cần bổ sung các chủ đề ngoài hai bộ slide như chéo hóa hoặc SVD.

### 3. Hệ tuyến tính — lý thuyết giải hệ tốt, cần bài toán lập mô hình và chặt giả thiết

**Có:** dạng tổng quát/chữ nhật; ma trận mở rộng; khử Gauss/thế ngược; Kronecker–Capelli; số tham số; hệ thuần nhất; Cramer cấp ba; phân loại theo tham số; quan hệ nghiệm riêng và nghiệm thuần nhất.

**Cần bổ sung:**

1. Bài toán từ câu chữ đến hệ: danh mục cổ phiếu, kế hoạch sản xuất, giới hạn máy móc hoặc khẩu phần dinh dưỡng; kiểm tra điều kiện không âm/nguyên khi đề yêu cầu.
2. Một ví dụ có nhiều ẩn tự do được giải đủ quá trình, không chỉ nêu quy tắc n−r; một bài thực hành hệ chữ nhật là phù hợp với PNTA và LXT.
3. Với Cramer, nên ghi công thức tổng quát `x_j=D_j/D` cho cấp n rồi minh họa cấp ba; hiện mục đang giới hạn cách trình bày ở cấp ba.

**Lỗi giả thiết cần sửa:** ví dụ `exam-logic` hỏi phát biểu nào sai và chọn “X1−X2 là nghiệm AX=B”, nhưng đề chưa ghi B≠0/hệ không thuần nhất. Nếu B=0, hiệu hai nghiệm vẫn giải hệ ban đầu. Cần thêm B≠0 hoặc hỏi phát biểu “không đúng nói chung”; không chuyển kết luận thường gặp thành một kết luận tuyệt đối thiếu giả thiết.

**Nguồn:** PNTA C2 trang 1, 7–13, 27–33, 35–37; LXT lecture05 trang 2–10.

### 4. Leontief — cân đối và giao dịch đã khá tốt, thiếu điều kiện kinh tế và dựng A từ bảng đầy đủ

**Có:** quy ước dòng cung/cột nhận; `a_ij=x_ij/X_j`; bảng giao dịch và tổng theo dòng/cột; bài toán ngược; `(I−A)X=D`; thay đổi nhu cầu cuối; cải tiến kỹ thuật và giải lại hệ; ý nghĩa cột của nghịch đảo Leontief.

**Cần bổ sung:**

1. Tổng hệ số theo cột và phần đầu vào ngoài hệ thống/giá trị gia tăng: `1−Σ_i a_ij`; phân biệt với `D_i`, là phần nhu cầu cuối theo dòng.
2. Điều kiện đủ được dùng trong slide: `A≥0` và mọi tổng cột <1 bảo đảm tính khả sản, nghịch đảo Leontief tồn tại và không âm. Hiện bài yêu cầu nghịch đảo không âm như một giả thiết nhưng chưa giải thích cách kiểm tra đủ qua bảng hệ số.
3. Một ví dụ dựng A từ bảng có giao dịch, đầu cuối và hàng “các yếu tố khác”; hiện ví dụ chủ yếu cho sẵn A và X.

**Nguồn:** PNTA C3 trang 1–6; LXT lecture06 trang 2–7. Nội dung giao dịch/công nghệ ở PNTA trang 7–23 phần lớn đã có nhóm bài tương ứng; không cần chép lặp từng bộ số liệu.

### 5. Đạo hàm và hàm ẩn — thiếu nhiều nội dung giải tích trong nguồn

**Có:** định nghĩa đạo hàm và tiếp tuyến; đạo hàm một phía ở mức khái niệm; khả vi suy ra liên tục; bảng đạo hàm; quy tắc tích/thương/hàm hợp; công thức hàm ngược; hàm ẩn; vi phân cấp một và sai số xấp xỉ.

**Thiếu trọng yếu:**

1. **Giới hạn và liên tục**: giới hạn một phía; điều kiện tồn tại giới hạn hai phía; giới hạn tại vô cực; các dạng vô định; giới hạn đặc biệt sin, exp, log và lũy thừa; biến đổi/chia bậc cao nhất; định lý kẹp; liên tục tại điểm và hàm từng đoạn theo tham số. Chưa có một mục học đầy đủ cho nội dung PNTA C4, dù đạo hàm và mô hình động đều dùng giới hạn.
2. **L’Hôpital**: giả thiết áp dụng cho 0/0 và ∞/∞; đổi các dạng khác về thương; lặp khi hợp lệ; dùng log cho lũy thừa vô định. Vắng trong nội dung cuối cả lý thuyết, thẻ và quiz.
3. **Đạo hàm cấp cao và công thức Leibniz** của tích. Không thể coi ký hiệu f'' ở chuyên đề cực trị là đã học phương pháp đạo hàm cấp cao.
4. **Taylor–Maclaurin**: khai triển quanh x0 và quanh 0; phần dư; xấp xỉ và chặn sai số; các khai triển exp/sin/cos/log trong slide.
5. **Vi phân cấp hai một biến**: `d²y=f''(x)(dx)²` và xấp xỉ `Δy≈dy+½d²y`. Đây là công thức vi phân, không phải PTVP cấp hai.
6. Bài biện luận đạo hàm hàm từng đoạn, so sánh điều kiện liên tục với điều kiện khả vi, để người học thực hành định nghĩa chứ không chỉ nhận biết |x|.

**Nguồn:** PNTA C4 trang 1–18; PNTA C5 trang 1–7, 35, 38–50, 60–65; LXT lecture07 trang 3–4, 9. Có thể đặt “Giới hạn–liên tục” thành nhóm tiền đề trong chuyên đề 5 mà chưa đổi đánh số 10 chuyên đề.

### 6. Đại lượng biên và co giãn — thiếu ứng dụng kinh tế và có lệch bài/thẻ

**Có:** ý nghĩa đạo hàm biên; phân biệt vi phân với thay đổi thực; công thức co giãn có dấu; co giãn hàm ẩn; minh họa so sánh biên và bình quân.

**Cần bổ sung:**

1. Các đại lượng cụ thể `MC=C'`, `MR=R'`, lợi nhuận biên `π'=MR−MC`, MPL, MU; tiêu dùng–tiết kiệm `MPC+MPS=1`. Một số tên này có trong nguồn nền cũ nhưng không còn trong nội dung cuối sau ghi đè.
2. Phân loại cầu co giãn/kém co giãn/đơn vị bằng trị tuyệt đối; trình bày rõ khác biệt giữa co giãn có dấu của LXT và độ co giãn cầu không âm thường dùng trong PNTA.
3. Liên hệ co giãn cầu với doanh thu khi thay đổi giá; xử lý hàm cầu ngược `p=p(q)`.
4. Giá trị bình quân `a(x)=f(x)/x`, công thức `a'(x)=[f'(x)−a(x)]/x`, liên hệ MC với AC và điều kiện dừng của AC.
5. Doanh thu sản phẩm biên theo chuỗi phụ thuộc `MRP=MR×MPL`.

**Lệch nội dung xác nhận được:**

- Mục `section-2` của bài chữ định nghĩa tốc độ thay đổi trung bình `[f(x2)−f(x1)]/(x2−x1)`, trong khi scene `average-marginal` và thẻ recall dùng giá trị bình quân `f(x)/x`. Hai đại lượng khác nhau; cần trình bày thành hai ý riêng.
- Mục `implicit-elasticity` dùng ví dụ `xy=12` tại (3,4), kết quả ε=−1. Thẻ nhận diện sai lầm còn dùng `S'=3/8` và ε=3/2 của bài tiết kiệm cũ, có câu “tại điểm này” nhưng thẻ không cung cấp điểm/quan hệ tương ứng. Thẻ cần được viết lại hoặc bổ sung đủ dữ kiện độc lập.

**Nguồn:** PNTA C5 trang 7–21, 31–38; LXT lecture07 trang 7.

### 7. Hàm nhiều biến và vi phân — có phần cấp một, thiếu cấp hai rõ rệt

**Có:** đạo hàm riêng và giữ các biến còn lại cố định; vi phân toàn phần cấp một; co giãn riêng; Cobb–Douglas, sản phẩm biên và lợi suất theo quy mô.

**Cần bổ sung:**

1. Miền xác định hàm hai biến, đặc biệt căn/log, gắn với biểu diễn miền trong mặt phẳng.
2. Cách tính `f_xx`, `f_xy`, `f_yx`, `f_yy`; điều kiện đổi thứ tự đạo hàm hỗn hợp; ít nhất một ví dụ đủ bốn đạo hàm. Hiện thẻ recall nhắc điều kiện bằng nhau và chuyên đề 8 dùng các ký hiệu, nhưng không có bài học tính cấp hai đầy đủ.
3. **Vi phân cấp hai**: `d²f=f_xx dx²+2f_xy dxdy+f_yy dy²`; xấp xỉ bậc hai `Δf≈df+½d²f`. Ví dụ PNTA `f=x²e^(5y)` tại (1,0) cho `d²f=2dx²+20dxdy+25dy²`.
4. Quan hệ thay thế/bổ sung giữa hai mặt hàng từ dấu đạo hàm chéo của hàm cầu; ví dụ xác định dấu và diễn giải.
5. Ví dụ dùng `dQ=0` để tính mức bù giữa vốn và lao động. Phần co giãn riêng có ý liên quan, nhưng cần nối với đúng bài toán vi phân toàn phần của slide.

**Nguồn:** PNTA C6 trang 1–17, 51–55; LXT lecture08 trang 3–13. Đây là thiếu kiến thức trong phạm vi, không phải lý do mở rộng sang PTVP cấp hai.

### 8. Cực trị một và hai biến — có quy trình chính, thiếu tiêu chuẩn và bài kinh tế

**Có:** điểm tới hạn; bảng dấu; thử cấp hai một biến; hệ điểm dừng hai biến; Hessian; trường hợp Hessian suy biến; kiểm tra biên/góc; một scene chứng minh tối ưu toàn cục bằng hoàn thành bình phương.

**Cần bổ sung:**

1. Tiêu chuẩn đạo hàm đầu tiên khác 0 ở cấp n: n chẵn/lẻ và dấu. Nội dung từng có trong nguồn nền nhưng không nằm trong bài cuối.
2. Tiêu chuẩn lồi/lõm trên toàn miền lồi để kết luận cực trị toàn cục; phân biệt điều kiện tại một điểm với điều kiện trên cả miền. Có minh họa riêng bằng bình phương nhưng chưa có tiêu chuẩn tổng quát trong bài chữ/thẻ.
3. Quy trình dựng mục tiêu kinh tế từ cầu, doanh thu và chi phí; bài độc quyền một/hai mặt hàng, hai thị trường, và bài thuế của LXT. Scene cho sẵn π chưa bao phủ bước lập mô hình từ dữ kiện kinh tế.

**Nguồn:** LXT lecture07 trang 10–13; lecture08 trang 14–16; PNTA C5 trang 50–59; PNTA C6 trang 17–33, 55–57.

### 9. Lagrange và Hessian biên — cốt lõi đúng hướng, cần hoàn thiện giả thiết/thẻ và đa dạng ứng dụng

**Có:** điều kiện chính quy; hệ Lagrange; Hessian biên và dấu phân loại địa phương; giải thích theo hướng tiếp tuyến; một ví dụ tối đa xy; scene tối thiểu chi phí với Q=3x^(2/3)y^(1/3); phân biệt ngân sách bằng và ngân sách tối đa.

**Cần hoàn thiện:**

1. `c>0` đang được ghi như điều kiện áp dụng chung của Lagrange. Đây không phải điều kiện cần của phương pháp; dấu c thuộc giả thiết bài kinh tế cụ thể. Cần giữ điều kiện trơn và gradient ràng buộc khác 0, không loại các mức c=0 hay c<0 một cách tổng quát.
2. Bài toán thay trực tiếp một biến từ ràng buộc rồi tối ưu một biến, đúng nội dung LXT lecture08 trang 18. Scene xy có minh họa thay biến, nhưng nên có quy trình và bài độc lập.
3. Các dạng kinh tế: tối đa hữu dụng với ngân sách, tối đa sản lượng với ngân sách và tối thiểu chi phí với sản lượng cho trước; tối ưu phân bổ hai phân xưởng. Cần ít nhất bài mẫu đại diện cho mỗi loại chính thay vì chỉ công thức tỷ lệ.
4. Thẻ `budget-constraint-application` dùng đề “Với π đã cho…” nhưng không mang theo π hoặc hai ràng buộc. Scene có công thức, song thẻ hiển thị độc lập không có scene. Phải đưa đủ dữ kiện vào đề thẻ; câu “hai dạng hoàn thành bình phương ở trên” cũng cần được thay bằng lập luận tự đủ.
5. Hai thẻ dùng literal `g(x,y)le c`; cần sửa thành `g(x,y)\\le c`. Một số thẻ chương 5 dùng chữ `prime` thay cho ký hiệu đạo hàm; cần sửa cùng đợt biên tập.

**Nguồn:** LXT lecture08 trang 17–21; PNTA C6 trang 34–50. Không mặc định mọi cực trị địa phương trong bài kinh tế đều là toàn cục.

### 10. Tích phân và PTVP cấp một — PPP đã có một phần, logistic chưa thành học liệu

**Có:** nguyên hàm; đổi biến/từng phần; định nghĩa PTVP và điều kiện đầu; tách biến và nghiệm hằng; tuyến tính cấp một và nhân tử; bài từng phần trong tuyến tính; Malthus/tắt dần; Solow; tăng trưởng theo phần còn thiếu; PPP cơ bản.

**A. Logistic: thiếu mục riêng và bộ thẻ/quiz tương ứng.**

Nguồn PNTA C7 trang 29–35 triển khai logistic rõ ràng; LXT slides-lec9 trang 15 giới thiệu tên Verhulst và sau đó tập trung Malthus. Bản hiện hành mới viết `N'=rN(1−N/M)` để phân biệt với mô hình `N'=k(M−N)`, chưa dạy cách giải logistic.

Cần có:

- Giả thiết, sức chứa M, phương trình chuẩn và quan hệ giữa các cách ký hiệu hằng số trong hai slide.
- Nghiệm cân bằng N=0 và N=M trước khi chia.
- Tách biến, phân tích phân thức, suy ra `N=M/(1+b e^(−rt))` trên nhánh 0<N0<M, với `b=M/N0−1`.
- Tìm tham số từ dữ kiện; dự báo và tìm thời điểm đạt mức N cho trước.
- Đường chữ S; tốc độ tăng lớn nhất tại N=M/2; `t*=ln(b)/r` phải được kiểm tra với khoảng thời gian đề xét. Nếu t*<0, không kết luận cực đại tương lai trên t≥0 nằm tại t*.
- Bài mẫu câu lạc bộ/tuyển sinh/dân số hoặc lây nhiễm đúng các dạng PNTA; thẻ phải phân biệt logistic, Malthus và tăng trưởng theo khoảng cách.

**B. PPP: không thiếu hoàn toàn, nhưng thiếu mô hình có U.**

Bản đang dùng có `S^e=aP_d/P_f`, log tỷ giá, chênh lệch lạm phát π, phương trình `s'=γ(s^e−s)`, nghiệm và giới hạn sai lệch `−π/γ`. Phần này phù hợp mô hình gốc LXT trang 19–26.

PNTA C7 trang 22–24 còn xét:

`s'=γ(s^e−s)+U`, với `s^e=a+πt`.

Đặt E=s−s^e thì `E'+γE=U−π`, do đó:

`E(t)=(U−π)/γ+[E(0)−(U−π)/γ]e^(−γt)`.

Sai lệch dài hạn là `(U−π)/γ`; muốn sai lệch về 0 cần U=π. Trong ví dụ PNTA, π=0,2 nên U=0,2.

Đặc biệt, `casioTip` của ví dụ PPP hiện ghi “Không thêm một hạng tăng trưởng ngoại sinh vào mô hình…”. Câu này chỉ phù hợp khi nói rõ đang giải mô hình gốc LXT; không được dùng để loại mô hình U có thật trong bộ PNTA người dùng yêu cầu.

**C. Solow: có khung lý thuyết, cần hoàn thiện bài giải và khớp tham số.**

Đã có `k'=sAk^α−(n+δ)k`, trạng thái dừng và phép đặt v=k^(1−α). Cần trình bày nghiệm theo điều kiện đầu, không chỉ trạng thái dừng. Cần bài mẫu dạng căn và dạng lũy thừa 2/3 theo PNTA trang 36–38, với đúng tổng hệ số hao hụt n+δ; scene hiện chỉ minh họa một trường hợp căn.

**D. Tích phân và ứng dụng tuyến tính: cần thêm dạng thực hành.**

Đổi biến và từng phần đã có. Nên bổ sung phân tích phân thức hữu tỷ để giải logistic, và các bài luyện trong tài liệu tích phân hai trang: dạng log, lượng giác, arctan, tích đa thức–hàm mũ; không chỉ lặp cùng bài 2xe^(2x). Bài tuyến tính nên có thêm tình huống quỹ tiết kiệm/nguồn bổ sung và giá cân bằng ở PNTA trang 15–18. Malthus đã có công thức bán rã nhưng chưa có bài luyện bán rã riêng.

**Nguồn:** PNTA C7 trang 1–38, bài cấp một ở cuối trang 56 và trang 57; LXT slides-lec9 trang 1–26; tài liệu đổi biến/từng phần trang 1–2. **Không yêu cầu bổ sung PTVP cấp hai.**

## 4. Một số lỗi ngay trong slide cần tránh chép nguyên

1. **LXT slides-lec9 trang 6:** ghi cos(x) không là nghiệm y''+y=0. Thực ra `(cos x)''+cos x=0`. Đây là lỗi nguồn; ví dụ nằm trong phần minh họa khái niệm, không tạo yêu cầu dạy PTVP cấp hai.
2. **PNTA C6 trang 39–40:** bài f=x+4y+1 với sqrt(xy)=4, x,y>0. Thế y=16/x cho f=x+64/x+1≥17, dấu bằng tại (8,2): đây là cực tiểu toàn cục. Trang 40 ghi cực đại; không dùng nguyên kết luận đó.
3. **PNTA C6 trang 40:** câu ghi chú đồng nhất cực trị địa phương và toàn cục trong các bài toán kinh tế là quá rộng. Chỉ kết luận toàn cục khi có lập luận bao quát tập khả thi/độ cong phù hợp.
4. Thuật ngữ lồi/lõm giữa một số đoạn PNTA và LXT không nhất quán. Khi biên tập, chuẩn hóa theo dấu đạo hàm/Hessian và đồ thị, không chỉ theo chữ lồi/lõm.

Đã render kiểm tra trực quan các trang nguồn liên quan PPP, logistic, vi phân cấp hai và hai ví dụ lỗi nguồn nêu trên; các công thức quan trọng còn được kiểm tra đại số độc lập.

## 5. Kiểm tra đã thực hiện và giới hạn của kết quả

- 20 kiểm tra có sẵn trong `study-acceptance.test.js` và `study-model.test.js` đều qua. Chúng kiểm tra cấu trúc, một số phép tính đại số/Leontief/Hessian, việc ghép thẻ và logic học; không chứng minh đủ giáo trình.
- Quét các biểu thức toán có phân cách $...$/$$...$$ trong đối tượng học liệu cuối bằng KaTeX strict: không thấy lỗi parse ở những biểu thức trích được. Đây không kiểm tra đúng/sai toán học, cũng không phát hiện mọi ký hiệu sai nhưng vẫn hợp cú pháp như `le` hay `prime`.
- Kiểm tra độc lập bằng SymPy: nghiệm PPP gốc/mở rộng thỏa phương trình; giới hạn sai lệch PPP bằng `(U−π)/γ`; nghiệm logistic thỏa phương trình; tốc độ cực đại bằng rM/4; bài tối ưu PNTA (8,2) là cực tiểu; cos là nghiệm của phương trình nguồn đã ghi sai.
- Một số kiểm tra có sẵn nhắc tên các ý như “phần đầu vào ngoài hệ thống” nhưng chỉ kiểm tra công thức/hàm tiện ích; không được coi tên test là bằng chứng bài chữ đang có nội dung ấy.
- Chưa chấm độc lập từng đáp án quiz và từng số ở mọi scene; chưa kiểm chứng lại mọi tài liệu thứ ba được học liệu cũ dẫn như main.pdf/TUD_v2.pdf. Phạm vi nguồn của lượt này là hai thư mục slide người dùng chỉ định.

## 6. Thứ tự hoàn thiện trước khi lưu MongoDB

1. **Sửa lỗi dữ kiện và sự lệch nhau giữa bài học–thẻ–scene**: chương 3 giả thiết hệ không thuần nhất; chương 6 hai loại “trung bình”, ví dụ tiết kiệm cũ; chương 9 thẻ ngân sách và ký hiệu.
2. **Bổ sung các phần thiếu cốt lõi**: giới hạn–liên tục, L’Hôpital, đạo hàm cấp cao/Leibniz, Taylor–Maclaurin, vi phân cấp hai một và nhiều biến, logistic, PPP có U.
3. **Bổ sung ứng dụng theo slide** ở đại số, Leontief, biên/co giãn, cực trị và Lagrange; hoàn thiện lời giải điều kiện đầu của Solow.
4. **Thiết kế thẻ/quiz theo mục tiêu kiến thức**: mỗi kỹ năng trọng tâm có bài tự trả lời và đáp án; số thẻ không bị cố định ba cho mọi mục. Kiểm tra lại dữ kiện của từng thẻ khi đứng độc lập.
5. **Chốt nội dung và truy vết nguồn** bằng `topicId`, `sectionId`, `contentVersion`, `reviewStatus`, file nguồn và trang. Bộ hiện tại đặt `draft:false` đồng loạt; cờ này chưa là bằng chứng đã rà đủ kiến thức.
6. Sau khi hoàn thiện, mới xuất bản dữ liệu có phiên bản để nhập MongoDB và chuyển frontend sang đọc API. Đổi nơi lưu dữ liệu không tự khắc phục thiếu kiến thức hoặc sai dữ kiện.

## 7. Danh mục nguồn và ánh xạ

Trang trong báo cáo là trang PDF tính từ 1.

| Nguồn | Số trang | Đối chiếu vào chuyên đề website |
| --- | ---: | --- |
| [PNTA C1: Ma trận và định thức](../frontend/public/docs/SLIDE_PNTA/Chuong_1_-_Ma_tran_va_dinh_thuc_cap_nhat.pdf) | 73 | 1–2, một phần liên hệ 3 |
| [PNTA C2: Hệ tuyến tính](../frontend/public/docs/SLIDE_PNTA/Chuong_2_-_He_phuong_trinh_tuyen_tinh_cap_nhat.pdf) | 37 | 3 |
| [PNTA C3: Leontief](../frontend/public/docs/SLIDE_PNTA/Chuong_3_-_Mo_hinh_input-output_Leontief_cap_nhat.pdf) | 23 | 4 |
| [PNTA C4: Giới hạn và liên tục](../frontend/public/docs/SLIDE_PNTA/Chuong_4_-_Gioi_han_va_su_lien_tuc.pdf) | 18 | Nhóm tiền đề còn thiếu trước/trong 5 |
| [PNTA C5: Đạo hàm và vi phân](../frontend/public/docs/SLIDE_PNTA/Chuong_5_-_Dao_ham_va_vi_phan_cap_nhat.pdf) | 65 | 5–6, phần một biến của 8 |
| [PNTA C6: Hàm nhiều biến](../frontend/public/docs/SLIDE_PNTA/Chuong_6_-_Ham_nhieu_bien_cap_nhat.pdf) | 57 | 7–9 |
| [PNTA C7: Phương trình vi phân](../frontend/public/docs/SLIDE_PNTA/Chuong_7_-_Phuong_trinh_vi_phan_cap_nhat.pdf) | 57 | 10; loại phần PTVP cấp hai theo yêu cầu |
| [LXT lecture01](../frontend/public/docs/SLIDE_LXT/lecture01.pdf) | 9 | 1: ma trận |
| [LXT lecture02](../frontend/public/docs/SLIDE_LXT/lecture02.pdf) | 9 | 1: định thức |
| [LXT lecture03](../frontend/public/docs/SLIDE_LXT/lecture03.pdf) | 7 | 2: nghịch đảo |
| [LXT lecture04](../frontend/public/docs/SLIDE_LXT/lecture04.pdf) | 5 | 2: hạng |
| [LXT lecture05](../frontend/public/docs/SLIDE_LXT/lecture05.pdf) | 10 | 3: hệ tuyến tính |
| [LXT lecture06](../frontend/public/docs/SLIDE_LXT/lecture06.pdf) | 7 | 4: Leontief |
| [LXT lecture07](../frontend/public/docs/SLIDE_LXT/lecture07.pdf) | 13 | 5–6, phần một biến của 8 |
| [LXT lecture08](../frontend/public/docs/SLIDE_LXT/lecture08.pdf) | 21 | 7–9 |
| [LXT lecture09](../frontend/public/docs/SLIDE_LXT/slides-lec9_Vie.pdf) | 26 | 10: PTVP cấp một, Malthus, PPP |
| [LXT đổi biến và từng phần](../frontend/public/docs/SLIDE_LXT/cong_thuc_bien_doi_tich_phan_tung_phan.pdf) | 2 | 10: kỹ thuật tích phân |

## 8. File học liệu cần xử lý khi triển khai sửa

- `frontend/src/data/studyCurriculum.js`: điểm ghép và trạng thái xuất bản cuối.
- `frontend/src/data/chapterEditorial.js`: nhiều đoạn ghi đè 5–9; phải sửa ở đúng lớp đang thắng.
- `frontend/src/data/reviewedAlgebra.js`, `reviewedSystems.js`, `reviewedInputOutput.js`: chuyên đề 2–4.
- `frontend/src/data/reviewedCalculus.js`, `studyTextbook.js` và các nguồn nền: cần kiểm soát phần bị ghi đè, không khôi phục máy móc nội dung cũ.
- `frontend/src/data/reviewedDifferentialEquations.js`: chuyên đề 10, đặc biệt logistic và PPP có U.
- `frontend/src/data/studyQuestions.js`: bổ sung độ phủ và đối chiếu lại từng đáp án.
- `frontend/src/components/study/CourseScenes.jsx`, `CalculusReviewScenes.jsx`, `MathExplorers.jsx`: cảnh mới và khớp dữ kiện với bài chữ/thẻ.

Kết quả rà không phải yêu cầu viết lại toàn bộ: giữ các phần đúng đã có, bổ sung các mục thiếu và sửa chỗ lệch theo bảng trên.
