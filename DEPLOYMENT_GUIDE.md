# CẨM NANG HƯỚNG DẪN DEPLOY THỰC TẾ - UEH TCC WEBSITE (MONGODB ATLAS)

Chào bạn! Để đưa website **Toán Cao Cấp UEH (UEH TCC)** lên internet chạy online vĩnh viễn 24/7 hoàn toàn miễn phí, chúng ta sẽ triển khai hệ thống theo mô hình hiện đại và tối ưu:

* **Frontend (Vite-React SPA)**: Triển khai trên **Vercel** hoặc **Netlify** (Miễn phí, hạ tầng CDN toàn cầu siêu nhanh).
* **Backend (Node.js/Express Server)**: Triển khai trên **Render.com** (Miễn phí, chạy online 24/7).
* **Database (MongoDB Atlas Cloud)**: Lưu trữ trên đám mây **MongoDB Atlas** (Kết nối trực tiếp qua Internet, miễn phí 512MB đủ lưu hàng triệu tài khoản học viên và đề thi, không sợ mất dữ liệu khi server reset).

---

## 🛠️ Bước Chuẩn Bị Quan Trọng: Cấu Hình API Động

Tôi đã tối ưu hóa mã nguồn bằng tệp cấu hình động tại [config.js](file:///c:/Users/ADMIN/Downloads/deploy-69204e4335d33fba20759b00/frontend/src/config.js). 

Khi chạy dưới máy cá nhân (offline), hệ thống mặc định kết nối tới `http://localhost:3001`. Khi đưa lên internet, bạn chỉ cần gán biến môi trường `VITE_API_URL` của Frontend bằng đường dẫn máy chủ Render của bạn, hệ thống sẽ tự động chuyển hướng kết nối an toàn!

---

## 🟢 PHẦN 1: KHỞI TẠO MONGODB ATLAS TRÊN ĐÁM MÂY (Miễn phí)

Đây là bước cực kỳ quan trọng để lưu dữ liệu vĩnh viễn trực tiếp qua Internet. Hãy làm theo từng bước sau để tránh mọi lỗi kết nối:

### Bước 1. Đăng ký tài khoản
1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) và đăng ký tài khoản miễn phí.
2. Trả lời vài câu hỏi khảo sát ngắn và nhấn **Submit**.

### Bước 2. Tạo Cluster (Cụm Cơ Sở Dữ Liệu)
1. Chọn gói **M0** (Free tier - Miễn phí $0/tháng).
2. Chọn nhà cung cấp hạ tầng (khuyên dùng **AWS** hoặc **Google Cloud**), vùng chọn **Singapore (ap-southeast-1)** để tốc độ kết nối về Việt Nam nhanh nhất.
3. Đặt tên cụm máy chủ hoặc giữ nguyên `Cluster0`.
4. Nhấn **Create**.

### Bước 3. Cấu hình Tài khoản kết nối (Database User)
1. Hệ thống sẽ yêu cầu bạn tạo một User để kết nối:
   * **Username**: Đặt tên (ví dụ: `uehadmin`)
   * **Password**: Đặt mật khẩu an toàn (ví dụ: `UehTcc123` - hoặc tự sinh rồi copy lại).
2. Nhớ lưu lại Username và Password này để dùng cho chuỗi kết nối ở bước sau! Click **Create Database User**.

### Bước 4. Cấu hình IP Access List (QUAN TRỌNG NHẤT ĐỂ TRÁNH LỖI KẾT NỐI)
> [!IMPORTANT]
> **Bắt buộc cấu hình kết nối trực tiếp từ mọi nơi qua Internet:**
> Máy chủ Render Free sử dụng dải IP động thay đổi liên tục. Nếu bạn chỉ add IP máy tính cá nhân của bạn, Render sẽ không thể kết nối được và bị báo lỗi `fail` ngay lập tức!
> 
> 1. Tại màn hình Security Quickstart (hoặc cột menu trái chọn **Network Access** -> click **Add IP Address**).
> 2. Chọn **Allow Access from Anywhere** (Cho phép truy cập từ mọi nơi).
> 3. Hệ thống sẽ tự động điền địa chỉ IP là: `0.0.0.0/0`.
> 4. Nhập ghi chú là "Render Server" và nhấn **Add IP Address**.
> 5. Nhấn **Finish and Close** để hoàn tất cấu hình an toàn.

### Bước 5. Lấy Chuỗi Kết Nối (Connection String URI)
1. Quay lại trang quản trị chính (Database). Nhấn vào nút **Connect** bên cạnh tên Cluster của bạn.
2. Chọn **Drivers** (đối với Node.js).
3. Copy chuỗi kết nối hiển thị trên màn hình có dạng:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
4. Thay thế `<username>` bằng tên user và `<password>` bằng mật khẩu bạn đã tạo ở Bước 3.
   * *Ví dụ thực tế:* `mongodb+srv://uehadmin:UehTcc123@cluster0.xxxxx.mongodb.net/ueh_tcc?retryWrites=true&w=majority&appName=Cluster0`
   * *(Nên thêm tên database là `ueh_tcc` ngay sau dấu `/` trước dấu `?` để dữ liệu gom gọn gàng)*

---

## 🟡 PHẦN 2: DEPLOY BACKEND SERVER LÊN RENDER

Chúng ta sẽ đưa backend Node.js lên Render và cấu hình biến môi trường kết nối trực tiếp đến MongoDB Atlas qua Internet.

### Các bước thực hiện:
1. Tạo một kho chứa (Repository) mới trên **GitHub** (có thể chọn Private để bảo mật code) và push toàn bộ mã nguồn dự án của bạn lên đó.
2. Đăng ký/Đăng nhập tài khoản trên [Render.com](https://render.com) bằng tài khoản GitHub.
3. Trên bảng điều khiển Render, click **New** ➔ chọn **Web Service**.
4. Chọn repository GitHub vừa push lên.
5. Cấu hình các thông số Web Service như sau:
   * **Name**: `ueh-tcc-backend` (hoặc tên bất kỳ bạn thích)
   * **Region**: Chọn Singapore hoặc Oregon để tối ưu tốc độ về Việt Nam.
   * **Runtime**: `Node`
   * **Root Directory**: `backend` (Rất quan trọng, để Render chỉ đọc riêng folder Backend)
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
   * **Instance Type**: `Free` ($0/tháng)
6. **Cấu hình Biến Môi Trường (Environment Variables):**
   * Di chuyển sang tab **Environment** ở cột menu trái trên Render.
   * Click **Add Environment Variable** và thêm biến sau:
     * **Key**: `MONGODB_URI`
     * **Value**: Dán chuỗi kết nối MongoDB Atlas đã thay mật khẩu hoàn chỉnh ở Phần 1 (Bước 5).
     * *(Nếu muốn cấu hình email gửi mã OTP thực, bạn thêm các biến sau: `EMAIL_USER` (tài khoản gmail) và `EMAIL_PASS` (mật khẩu ứng dụng gmail), nếu không thì server mặc định chạy chế độ mô phỏng offline in mã OTP ra Terminal).*
7. Click **Deploy Web Service**.

*Sau vài phút, Render sẽ chạy xong và cấp cho bạn một đường dẫn URL công khai có dạng:* `https://ueh-tcc-backend.onrender.com`

---

## 🔵 PHẦN 3: DEPLOY FRONTEND REACT APP LÊN VERCEL

### Các bước thực hiện trên Vercel:
1. Đăng ký/Đăng nhập tài khoản trên [Vercel.com](https://vercel.com) bằng tài khoản GitHub.
2. Click **Add New** ➔ chọn **Project**.
3. Chọn Repository chứa dự án của bạn và bấm **Import**.
4. Cấu hình các thông số Project Vercel:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend` (Rất quan trọng! Bạn click chọn **Edit** kế bên tên Repo và trỏ vào folder `frontend`)
5. **CẤU HÌNH BIẾN MÔI TRƯỜNG KẾT NỐI FRONTEND - BACKEND:**
   * Mở rộng phần **Environment Variables** (Biến môi trường).
   * Thêm một biến mới:
     * **Key**: `VITE_API_URL`
     * **Value**: Dán đường dẫn URL Render của bạn vừa nhận ở Phần 2 (Ví dụ: `https://ueh-tcc-backend.onrender.com`).
     * *(Đảm bảo không có dấu gạch chéo `/` ở cuối đường dẫn)*
6. Click **Deploy**.

*Vercel sẽ tự động build và cấp cho bạn đường dẫn URL tuyệt đẹp dạng:* `https://frontend-ueh-tcc.vercel.app`

---

## 🚀 QUÁ TRÌNH TỰ ĐỘNG DI TRÚ DỮ LIỆU CŨ (AUTO-MIGRATION)
Ngay sau khi Backend deploy thành công và kết nối tới cơ sở dữ liệu MongoDB Atlas:
1. Server sẽ tự động kiểm tra xem các bảng dữ liệu trên Cloud đã có dữ liệu chưa.
2. Vì là lần đầu tiên chạy, dữ liệu trống, server sẽ **tự động đọc dữ liệu từ các file JSON cục bộ sẵn có trong folder backend (`users.json`, `resources.json`) và đẩy toàn bộ chúng lên MongoDB Atlas**.
3. Toàn bộ tài khoản Admin, tài khoản học viên và đề thi mẫu sẽ được bảo toàn nguyên vẹn 100%!
4. Kể từ lúc này, mọi thao tác cập nhật tài liệu, đăng ký, đăng nhập đều ghi trực tiếp lên đám mây MongoDB Atlas trực tuyến, an toàn, bảo mật và lưu trữ vĩnh viễn!
