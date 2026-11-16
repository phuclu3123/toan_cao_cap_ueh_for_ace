# Đối chiếu giáo trình và nghiệm thu giao diện học tập

Ngày thực hiện: 08/11/2026. Phạm vi: giao diện và nội dung trang `/flashcards` trong workspace; chưa triển khai MongoDB cho thẻ cá nhân và chưa phát hành lên production.

## Nguồn đã đối chiếu

Ưu tiên trình tự bài giảng viết tay, dùng slide và giáo trình để kiểm tra phát biểu; dùng đề thi để phát hiện dạng bài cần bổ sung. Số trang dưới đây là số trang vật lý của PDF.

| Nhóm nguồn | Phạm vi đã đọc | Cách sử dụng |
|---|---|---|
| Ghi chép Buổi 1–10 | 10, 10, 3, 8, 12, 31, 10, 9, 8, 10 trang; các trang viết tay được xem dưới dạng ảnh | Trình tự, ký hiệu P_A, cách biện luận, bảng Input–Output, biên/co giãn, PTVP cấp một |
| `TUD_v2.pdf` | 45 trang, gồm phần hệ thống kiến thức và năm đề ôn | Kiểm tra các điều kiện, công thức, phạm vi ứng dụng |
| Bộ slide LXT trong ZIP | lecture01–08, slides-lec9_Vie và tài liệu tích phân từng phần | Định nghĩa, hạng, hệ tuyến tính, I-O, đạo hàm, cực trị, Lagrange, PTVP |
| Bộ tài liệu bổ sung trong ZIP | Chương_mới_tcc; TL1_HPT_LG; TL2_BIEN_HSCD | Bài tập đại số, co giãn, ứng dụng tuyến tính và tỷ giá |
| `main.pdf` | 237 trang, gồm đề và lời giải K51 | Tách kiến thức gốc khỏi ví dụ thi; kiểm tra cả phương pháp tự luận lẫn trắc nghiệm |
| `FINAL2807 (1).pdf` | 81 trang, đề và lời giải K46, K47, K49, K50 | Đối chiếu các dạng cũ; loại PTVP cấp hai theo phạm vi hiện tại |

Các bản trích xuất và ảnh đọc nguồn nằm trong `tmp/study-sources`, `tmp/source-pages`, `tmp/course-reference`. Chúng là tài liệu làm việc, không được nhập vào bundle frontend. Tệp `tmp/course-reference/inventory.json` ánh xạ tên gốc trong ZIP sang tên tệp làm việc.

Việc đối chiếu không có nghĩa nhập nguyên mọi câu hoặc mọi đáp án từ nguồn vào website. Ngân hàng hiện tại là câu hỏi biên soạn lại để kiểm tra kiến thức.

## Các điểm hiệu chỉnh khi biên soạn

- `P_A` là chuyển vị của ma trận phần bù đại số; được định nghĩa cả khi A suy biến. Công thức nghịch đảo mới cần det A≠0. Không suy luận A khả nghịch chỉ vì đề nhắc P_A.
- `AB=kI ⇒ BA=kI` cần k≠0 nếu dùng để suy ra khả nghịch; với k=0 có phản ví dụ.
- Hạng tính bằng số dòng khác 0 sau khi đưa về bậc thang; không đơn thuần đếm ô đường chéo khác 0 của một ma trận tam giác chưa chuẩn hóa bậc thang.
- Trong hệ Buổi 3, phép `d3 ← 2d3+(m−3)d2` vẫn hợp lệ tại m=3. Hệ số của dòng cũ là 2; không cần chia cho m−3. m=1 cho vô số nghiệm, m=6 vô nghiệm.
- I-O dùng `z_ij=a_ij X_j`. Tổng theo dòng phải nhân đúng từng sản lượng nhận; tổng theo cột mới có chung X_j. Hệ số đầu vào không phải giao dịch thực.
- Nghịch đảo Leontief không âm cần giả thiết sản xuất thích hợp. A không âm và tổng mỗi cột nhỏ hơn 1 là một điều kiện đủ, không phải định lý “mọi ma trận khả nghịch đều khả thi”.
- Khi kỹ thuật đổi, sửa A rồi giải lại cân đối. Công thức biến động nhu cầu với nghịch đảo cố định không dùng nguyên vẹn cho thay đổi công nghệ.
- Đạo hàm ẩn và co giãn ẩn giữ dấu âm `−F_x/F_y`, kiểm tra nhánh và mẫu khác 0.
- Biên là đạo hàm, không đồng nhất với mức tăng hữu hạn. Công thức xấp xỉ dùng dấu ≈.
- Một Hessian biên 3×3 đủ phân loại tại điểm dừng chính quy của hai biến với một ràng buộc: `det H_b=−tᵀH_Lt`, t=(g_y,−g_x). Nếu một đạo hàm ràng buộc bằng 0, đổi biến được giải bằng hàm ẩn; không chia cho 0. Định thức bằng 0 chưa kết luận.
- Hessian tại một điểm chỉ cho kết luận địa phương. Toàn cục cần bất đẳng thức, tính lồi/lõm trên miền, hoặc xét đầy đủ miền/biên. “Dùng hết ngân sách” khác “không vượt ngân sách”.
- Tăng trưởng Malthus, tăng theo khoảng cách tới giới hạn và logistic là ba mô hình khác nhau. Từ doanh số 500, gấp đôi sau 10 tháng, dự báo tháng 24 là khoảng 2639; không thay tốc độ liên tục bằng 0,1.
- Các câu PTVP cấp hai trong đề cũ không được chuyển vào giáo trình mới. Đạo hàm riêng cấp hai dùng cho Hessian vẫn được giữ; không đưa vi phân cấp hai vào nội dung.

## Cấu trúc nội dung đã kết nối

| Chuyên đề | Số mục | Minh họa chính |
|---|---:|---|
| Ma trận và định thức | 9 | Kích thước/chỉ số; ba dạng tam giác; cộng/trừ; kA; nhân chữ nhật theo cặp phần tử; chuyển vị; Laplace; Sarrus; bốn dạng biến đổi dòng |
| Nghịch đảo và hạng | 3 | Gauss–Jordan 3×3; phần bù và P_A; pivot và bậc thang |
| Hệ tuyến tính | 5 | Hệ → A,X,B → mở rộng; ba loại hạng; Cramer thay cột; hệ thuần nhất; hệ tham số từ Buổi 3 |
| Input–Output | 5 | Bảng ba ngành; giao dịch xuôi/ngược và tổng dòng/cột; cân đối; cú sốc nhu cầu; sửa hệ số kỹ thuật |
| Đạo hàm và hàm ẩn | 4 | Δx/Δy, cát tuyến/tiếp tuyến; hai tầng hàm hợp; đường ẩn; mức tăng và vi phân |
| Đại lượng biên và co giãn | 3 | Độ dốc theo đơn vị; bình quân so với biên; thay đổi phần trăm |
| Hàm nhiều biến và vi phân | 4 | Mặt cắt; nhiều đường phụ thuộc; cộng đóng góp vi phân; biên/co giãn riêng Cobb–Douglas |
| Cực trị một và hai biến | 4 | Bảng dấu một biến; điểm dừng; mặt cong min/max/yên ngựa; xác nhận toàn cục |
| Lagrange | 3 | Đường khả thi; Hessian biên và hướng tiếp xúc; chi phí trên ràng buộc sản lượng |
| Tích phân và PTVP cấp một | 9 | Diện tích tích lũy; kiểm tra nghiệm; tách biến; nhân tử tích phân; từng phần; tăng trưởng mũ; Solow; tăng trưởng giới hạn; điều chỉnh tỷ giá |

Tổng cộng: 49 mục, 147 thẻ (bản chất/công thức, sai lầm, vận dụng), 30 câu trắc nghiệm có giải thích. Mỗi mục có scene ID cụ thể; không còn fallback chọn một đồ thị cho toàn chuyên đề.

## Quy tắc hình ảnh và chuyển động

- Nền sáng; cam cho nguồn/dòng/biến đầu vào, xanh cho cột hoặc biến được giữ vai trò đối ứng, tím cho giao điểm/đóng góp/kết quả. Màu luôn đi cùng nhãn hoặc ký hiệu.
- Phép nhân làm nổi đúng hai phần tử của từng tích; các số chuyển từ ô nguồn tới công thức bằng Web Animations. Ô kết quả chưa tính để trống.
- Một phép biến đổi dòng giữ cả ma trận cũ, ký hiệu và ma trận mới để đối chiếu. Chuỗi nhiều phép mới fade nguồn và chuyển kết quả sang trái trước bước tiếp.
- Tự động chỉ chạy khi cảnh đang nhìn thấy và tab hoạt động; có tạm dừng, xem lại và từng bước. Chế độ giảm chuyển động có cùng trạng thái toán học, không bắt buộc animation.
- Thanh kính ngắn, ẩn khi cuộn xuống; ngăn menu viewport nằm ngoài header có transform để tránh tràn trên tablet.
- Thẻ lật bằng chạm/click trên bề mặt hoặc bàn phím; đánh dấu, lọc, tự đánh giá và hoàn tác vẫn hoạt động. Lưu cục bộ phụ thuộc lựa chọn cookie.

## Bằng chứng nghiệm thu

- Kiểm thử Node: 50/50 đã qua ở lần kiểm tra nội dung và phép tính.
- Edge/Playwright: 49 mục và 377 trạng thái đã duyệt trong vòng kiểm tra thủ công; ảnh và bảng frame ở `artifacts/study-workspace/textbook`.
- `npm run check` đã qua: lint toàn frontend, 50 bài kiểm thử, kiểm tra công thức và build. Lần build sau hiệu chỉnh bố cục phép biến đổi cũng đã qua.
- Hồi quy giao diện: 10 tình huống đã qua ở `final-results`; tình huống chờ fade được sửa để chờ kết thúc transition. Bốn kiểm tra cuối ở `targeted-results` đều qua, gồm thao tác một bước, chuyển trái nhiều bước, giảm chuyển động và các trường hợp tham số/câu hỏi.
- Kiểm tra responsive ở 1440, 768 và 390 px; có bảng dữ liệu cuộn nội bộ khi cần, không dùng che tràn cả trang.
- Các lần kiểm tra cuối, kiểm thử hồi quy và ảnh sau hiệu chỉnh được ghi trong `artifacts/study-workspace`.

Các kiểm thử xác nhận hành vi và các phép tính nêu trên; chúng không thay thế phản biện học thuật độc lập cho toàn bộ giáo trình. Chưa xác minh phát hành production hoặc đăng nhập OAuth thật trong đợt nội dung này.
