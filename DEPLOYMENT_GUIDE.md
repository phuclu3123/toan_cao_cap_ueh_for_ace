# CẨM NANG HƯỚNG DẪN DEPLOY THỰC TẾ - UEH TCC WEBSITE

Chào bạn! Để đưa website **Toán Cao Cấp UEH (UEH TCC)** lên môi trường internet thực tế (chạy online 24/7 cho hàng nghìn sinh viên truy cập), chúng ta sẽ chia dự án làm 2 phần độc lập để tối ưu hóa hiệu năng, tính bảo mật và đặc biệt là **hoàn toàn miễn phí** hoặc chi phí siêu rẻ:

* **Frontend (Vite-React SPA)**: Triển khai trên **Vercel** hoặc **Netlify** (Miễn phí hoàn toàn, hạ tầng CDN toàn cầu siêu nhanh, tải trang <0.5 giây).
* **Backend (Node.js/Express Server + JSON Database)**: Triển khai trên **Render.com** hoặc **Railway** (Hỗ trợ Node.js 24/7 và đặc biệt có **ổ đĩa lưu trữ vĩnh viễn - Persistent Disk Volume** để đảm bảo dữ liệu đăng ký tài khoản & tài liệu mới tải lên không bị mất đi khi máy chủ khởi động lại).

---

## 🛠️ Bước Chuẩn Bị Quan Trọng: Cấu Hình API Động

Tôi đã tối ưu hóa mã nguồn bằng cách tạo tệp cấu hình trung tâm tại [config.js](file:///c:/Users/ADMIN/Downloads/deploy-69204e4335d33fba20759b00/frontend/src/config.js). 

Khi chạy trên máy tính cá nhân (Development), hệ thống mặc định kết nối tới `http://localhost:3001`. Khi đưa lên internet, bạn chỉ cần gán biến môi trường `VITE_API_URL` của Frontend bằng đường dẫn máy chủ Render của bạn, hệ thống sẽ tự động chuyển hướng kết nối an toàn mà không cần thay đổi bất cứ dòng code nào!

---

## 🟢 PHẦN 1: DEPLOY BACKEND SERVER (Lưu Database JSON persistent)

Vì Backend của chúng ta ghi dữ liệu trực tiếp vào các file JSON (`users.json`, `resources.json`), nếu deploy lên các nền tảng serverless thông thường (như Vercel/Netlify Functions), các file này sẽ bị reset sạch mỗi khi server ngủ đông. Do đó, **Render.com** là sự lựa chọn số 1 nhờ tính năng ổ đĩa ảo (Disk Volume) miễn phí.

### Các bước thực hiện:
1. Đăng ký tài khoản miễn phí trên [Render.com](https://render.com) (Đăng nhập bằng tài khoản GitHub).
2. Tạo một kho chứa (Repository) riêng tư hoặc công khai trên **GitHub** và push toàn bộ mã nguồn dự án của bạn lên đó.
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
6. **THIẾT LẬP Ổ ĐĨA DỮ LIỆU ĐỂ GIỮ DATABASE (Quan trọng nhất!):**
   * Di chuyển sang tab **Advanced** hoặc **Disks** ở cột menu trái trên Render.
   * Click **Add Volume**.
   * Cấu hình Disk Volume:
     * **Name**: `database-storage`
     * **Mount Path**: `/opt/render/project/src/backend/data` (Đường dẫn Render mount ổ cứng ảo đè lên thư mục lưu database của node server).
     * **Size**: `1 GB` (Thoải mái lưu hàng triệu tài khoản học viên và tài liệu).
7. Click **Create Web Service**. 

*Render sẽ tiến hành cài đặt và chạy máy chủ. Khi hoàn tất, Render sẽ cấp cho bạn một đường dẫn URL công khai có dạng: `https://ueh-tcc-backend.onrender.com`.*

---

## 🔵 PHẦN 2: DEPLOY FRONTEND REACT APP (Siêu Tốc Độ)

**Netlify** hoặc **Vercel** là giải pháp hoàn hảo để host ứng dụng SPA React. Dưới đây là cách deploy lên **Vercel**:

### Các bước thực hiện trên Vercel:
1. Đăng ký/Đăng nhập tài khoản trên [Vercel.com](https://vercel.com) bằng tài khoản GitHub.
2. Click **Add New** ➔ chọn **Project**.
3. Chọn Repository GitHub chứa dự án của bạn và bấm **Import**.
4. Cấu hình các thông số Project Vercel:
   * **Framework Preset**: `Vite` (Hệ thống sẽ tự nhận diện)
   * **Root Directory**: `frontend` (Rất quan trọng! Bạn click chọn **Edit** kế bên tên Repo và trỏ vào folder `frontend`)
   * **Build and Output Settings**: Giữ mặc định (Vercel tự cấu hình lệnh `npm run build` và thư mục `dist`).
5. **KẾT NỐI FRONTEND VỚI BACKEND (Environment Variables):**
   * Mở rộng phần **Environment Variables** (Biến môi trường).
   * Thêm một biến mới:
     * **Key**: `VITE_API_URL`
     * **Value**: Dán đường dẫn URL Render của bạn vừa nhận ở Phần 1 (Ví dụ: `https://ueh-tcc-backend.onrender.com`).
     * *(Đảm bảo không có dấu gạch chéo `/` ở cuối đường dẫn)*
6. Click **Deploy**.

*Vercel sẽ tự động compile mã nguồn và deploy ứng dụng chỉ trong 1 phút. Sau khi chạy xong, bạn sẽ có một đường dẫn URL tuyệt đẹp dạng: `https://frontend-ueh-tcc.vercel.app`.*

---

## 🤩 THÀNH QUẢ ĐẠT ĐƯỢC

Chúc mừng bạn! Website **UEH TCC** của bạn lúc này đã chính thức online:
1. Sinh viên có thể truy cập vào tên miền Vercel để học tập mượt mà.
2. Học viên đăng ký tài khoản mới ➔ Dữ liệu chuyển ngay về server Render lưu vĩnh viễn vào ổ đĩa ảo.
3. Khi bạn đăng nhập admin bằng tài khoản `admin@ueh.edu.vn` trên web online, nút **"Đăng tài liệu"** sẽ xuất hiện, cho phép bạn cập nhật đề thi, bài viết lên trực tuyến ngay lập tức mà không bao giờ sợ bị mất dữ liệu khi server Render reset!

---

> [!NOTE]
> **Tùy chọn Tên miền riêng (Custom Domain):**
> Cả Vercel và Render đều cho phép bạn trỏ tên miền cá nhân (ví dụ: `toancaocapueh.com`) hoàn toàn miễn phí. Bạn chỉ cần mua domain tại các nhà đăng ký (như Mắt Bão, Nhân Hòa, GoDaddy) và add vào mục **Settings ➔ Domains** trên Vercel là xong!
