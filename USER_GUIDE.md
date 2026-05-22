# HƯỚNG DẪN QUẢN TRỊ VIÊN - UEH TCC WEBSITE

Chào bạn! Dưới đây là tài liệu chi tiết hướng dẫn cách vận hành hệ thống, cách cập nhật tài liệu học tập thời gian thực (Real-time), quản lý tệp tin PDF/Hình ảnh và quản trị tài khoản đăng ký/đăng nhập của học viên để phục vụ quản trị khóa học sau này.

---

## 🚀 1. Hướng Dẫn Khởi Chạy Hệ Thống

Để website hoạt động đầy đủ cả chức năng Dynamic Database (Đăng ký, đăng nhập, tải động tài liệu, gửi contact), bạn cần khởi chạy cả **Backend (Express)** và **Frontend (React)**:

### Bước 1: Khởi chạy Backend Server
1. Mở một cửa sổ Terminal/Command Prompt mới.
2. Di chuyển vào thư mục backend và chạy lệnh:
   ```bash
   cd backend
   npm install
   node server.js
   ```
   *Máy chủ API Backend sẽ chạy tại địa chỉ: `http://localhost:3001`*

### Bước 2: Khởi chạy Frontend React App
1. Mở thêm một cửa sổ Terminal/Command Prompt thứ hai.
2. Di chuyển vào thư mục frontend và chạy lệnh:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Nhấp giữ phím `Ctrl` và click chuột vào địa chỉ local hiển thị (thường là `http://localhost:5173`) để mở trang web trên trình duyệt.*

---

## 📁 2. Quản Lý File PDF Và Hình Ảnh Ở Đâu?

Khi tải tài liệu mới lên thông qua trang quản trị, hệ thống sẽ ánh xạ các đường dẫn tệp tin tương ứng. Để hiển thị chính xác, bạn hãy đặt các tệp tin này vào đúng thư mục trong mã nguồn:

1. **Các file tài liệu PDF gốc**: 
   * Đặt tại: `frontend/public/docs/`
   * *Ví dụ*: File `final 2807.pdf` nằm ở đường dẫn `frontend/public/docs/final 2807.pdf`.
2. **Các hình ảnh bìa tài liệu / hình giảng viên**:
   * Đặt tại: `frontend/public/images/`
   * *Ví dụ*: Ảnh đại diện giảng viên `pnta.jpg` nằm ở đường dẫn `frontend/public/images/pnta.jpg`.

> [!TIP]
> **Giải pháp dùng liên kết ngoài (Google Drive, Dropbox, v.v.):**
> Nếu không muốn lưu file PDF trực tiếp trong thư mục dự án (làm nặng bộ nhớ), hệ thống đã hỗ trợ mục **"Link ngoài (Google Drive)"** khi đăng tải. Bạn chỉ cần dán link chia sẻ Drive của file vào ô tương ứng, người dùng khi click sẽ được dẫn thẳng đến Google Drive để tải/xem!

---

## 🗃️ 3. Quản Trị Cơ Sở Dữ Liệu Tài Khoản (Đăng Ký & Đăng Nhập)

Hệ thống lưu trữ tài khoản của học viên và quản trị viên một cách an toàn và trực quan dưới dạng cơ sở dữ liệu JSON tại:
👉 `backend/data/users.json`

### Tài khoản mặc định sẵn có trong hệ thống:
* **Tài khoản Quản Trị Viên (Admin):**
  * **Tên đăng nhập / Email:** `admin@ueh.edu.vn`
  * **Mật khẩu:** `admin123`
  * **Vai trò:** `Admin` (Có đặc quyền mở nút **"Đăng tài liệu"** trên Navbar để cập nhật ấn phẩm mới).
* **Tài khoản Học Viên (Student):**
  * **Tên đăng nhập / Email:** `sinhvien@ueh.edu.vn`
  * **Mật khẩu:** `123`
  * **Vai trò:** `Student`

### Đăng ký tài khoản học viên mới:
* Học viên có thể tự do đăng ký tài khoản trực tiếp trên giao diện bằng cách click **"Đăng Nhập"** trên thanh điều hướng Navbar -> chọn tab **"Đăng Ký"**, điền đầy đủ Họ tên, Email, Mật khẩu.
* Thông tin đăng ký mới sẽ ngay lập tức được ghi nhận và lưu trữ vào file `backend/data/users.json` thông qua API `/api/signup` ở thời gian thực.
* Bạn có thể dễ dàng quản lý, chỉnh sửa, nâng phân quyền học viên thành Admin bằng cách thay đổi giá trị `"role": "Student"` thành `"role": "Admin"` trực tiếp trong file `users.json`. Việc quản lý khóa học sau này hoàn toàn có thể mở rộng dựa trên cấu trúc database người dùng này!

---

## ✍️ 4. Hướng Dẫn Đăng Tải Tài Liệu Mới (Real-Time) Không Cần Viết Code

Nhờ hệ thống API động được liên kết đồng bộ, bạn có thể tự mình cập nhật ấn phẩm, tài liệu, đề thi lên website chỉ bằng vài click chuột:

### Các bước thực hiện:
1. Truy cập vào website, click vào nút **"Đăng Nhập"** ở góc phải trên cùng của thanh Navbar.
2. Nhập tài khoản Admin:
   * **Email:** `admin@ueh.edu.vn`
   * **Mật khẩu:** `admin123`
3. Sau khi đăng nhập thành công, góc phải Navbar của bạn sẽ tự động xuất hiện nút bấm màu xanh ngọc: **"Đăng tài liệu"** 🟢.
4. Click vào nút **"Đăng tài liệu"**, một biểu mẫu Glassmorphic tuyệt đẹp sẽ hiện ra:
   * **Loại tài nguyên:** Lựa chọn giữa *Ấn phẩm tài liệu*, *Đề thi giữa kỳ*, hoặc *Đề thi cuối kỳ*.
   * **Tiêu đề tài liệu:** Tên tài liệu hiển thị (ví dụ: *Đề thi thử Toán Cao Cấp K51*).
   * **Mô tả chi tiết:** Nội dung giới thiệu tóm tắt của tài liệu.
   * **Tên file ảnh bìa (Lưu tại public/images/):** Ví dụ `tccvang.jpg`.
   * **Tên file PDF (Lưu tại public/docs/):** Ví dụ `tccvang.pdf`.
   * **Link ngoài (Drive/Dropbox - Không bắt buộc):** Dán link Drive chứa tài liệu nếu có.
   * *(Nếu là đề giữa kỳ)* **Lựa chọn Giảng viên:** Chọn thầy Phan Ngô Tuấn Anh, Nguyễn Đình Tuấn, Ngô Trấn Vũ, Nguyễn Thanh Vân để hệ thống tự động gán bộ lọc.
5. Bấm nút **"Đăng tải tài liệu"**.
6. **Xác nhận kết quả:** Hệ thống sẽ ngay lập tức gửi dữ liệu tới API server, lưu trữ vào file `backend/data/resources.json` và tự động làm mới giao diện. Tài liệu mới sẽ xuất hiện ở đầu danh sách trang Thư Viện và Trang Chủ ngay tức khắc mà không cần biên dịch lại mã nguồn!

---

Chúc bạn có những trải nghiệm học tập và quản trị tuyệt vời cùng hệ thống **UEH TCC** mới!
 Nếu có bất kỳ câu hỏi nào trong quá trình vận hành, bạn luôn có thể liên hệ lại với tôi để được hỗ trợ nhé.
