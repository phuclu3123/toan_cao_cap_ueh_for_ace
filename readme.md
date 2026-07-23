# 📘 UEH TCC STUDY HELPER - Portal Hỗ Trợ Học Tập Toán Cao Cấp / Toán Ứng Dụng UEH

> **Tác giả:** Lữ Võ Hoàng Phúc (K50 UEH)  
> **Repository:** [https://github.com/phuclu3123/toancaocapueh](https://github.com/phuclu3123/toancaocapueh)  
> **Production App:** [https://toancaocapueh.netlify.app](https://toancaocapueh.netlify.app)

---

## 📌 Giới Thiệu

**UEH TCC Study Helper** là nền tảng web trực tuyến hỗ trợ sinh viên Đại học Kinh tế TP. Hồ Chí Minh (UEH) học tập, tra cứu tài liệu và luyện thi học phần **Toán Cao Cấp / Toán Ứng Dụng** (đặc biệt là khóa K51 và các khóa K50, K49, K48). 

Hệ thống kết hợp giữa thư viện tài liệu phong phú, các phòng luyện thi trắc nghiệm tương tác 30 phút có chấm điểm tự động, cùng hệ thống quản lý tài khoản và tích hợp cổng thanh toán trực tuyến.

---

## 🌟 Tính Năng Nổi Bật

- 🎯 **Phòng Luyện Thi Tương Tác 30 Phút**: Môi trường làm bài thi trắc nghiệm chuẩn nhịp thi thật, có đếm ngược thời gian (Timer), cắm cờ câu hỏi khó, chấm điểm tự động & phân tích đáp án chi tiết sau khi nộp.
- 📚 **Thư Viện Tài Nguyên Học Tập**: Lưu trữ giáo trình PDF, slide bài giảng giảng viên (Thầy Lê Xuân Trường, Thầy Phan Ngô Tuấn Anh, Thầy Nguyễn Thanh Vân, Thầy Ngô Trấn Vũ...), chuyên đề bài tập và bộ đề thi K51 (cả 2 đợt mới nhất).
- 🔐 **Hệ Thống Tài Khoản Multi-Auth**: Đăng nhập qua Email/Mật khẩu (MongoDB), Google/Facebook/GitHub Auth (Firebase), và xác thực mã OTP qua Email SMTP & SMS.
- 🛡️ **Bảo Mật & Phân Quyền Admin**: Admin có quyền mở Modal đăng tải tài liệu trực tiếp lên hệ thống với di trú dữ liệu thời gian thực.
- 💳 **Tích Hợp Cổng Thanh Toán PayOS**: Tạo link thanh toán QR tự động và xử lý webhook xác nhận giao dịch.
- 🌐 **Đa Ngôn Ngữ & Giao Diện Tối/Sáng**: Hỗ trợ Tiếng Việt (VI), Tiếng Anh (EN), Tiếng Nhật (JA), Tiếng Trung (ZH) và Dark/Light Mode.

---

## 🛠️ Kiến Trúc Hệ Thống (System Architecture)

Dự án được thiết kế theo mô hình **Client-Server (Decoupled Architecture)** hoàn chỉnh và chuẩn hóa:

```
WEB_TCC/
├── backend/                  # Node.js + Express RESTful API (Mô hình MVC)
│   ├── config/               # Cấu hình Database MongoDB Atlas & DNS
│   ├── models/               # Schemas Mongoose (User, Resource, Message, Subscriber, Payment)
│   ├── controllers/          # Tầng xử lý Logic kinh doanh (Auth, Resource, Contact, Payment)
│   ├── routes/               # Định tuyến API Endpoints (/api/auth, /api/resources, /api/contact, /api/payos)
│   ├── services/             # Dịch vụ gửi Email SMTP OTP & Auto-Migration dữ liệu
│   ├── utils/                # Tiện ích đọc/ghi file JSON fallback offline
│   ├── data/                 # Bộ lưu trữ JSON offline fallback
│   └── server.js             # Entry point khởi chạy backend server
│
├── frontend/                 # Single Page Application (React 19 + Vite 8)
│   ├── public/               # File tĩnh public (PDFs đề thi, hình ảnh bìa, favicon)
│   └── src/
│       ├── assets/           # CSS styles & hình ảnh minh họa
│       ├── components/       # UI Components (Navbar, DocCard, Footer, FloatingActions)
│       │   └── modals/       # Modular Modals (AuthModal, UploadModal, SearchModal)
│       ├── context/          # React Contexts (ThemeContext, LanguageContext)
│       ├── data/             # Bộ dữ liệu đề thi & đáp án chi tiết (practiceExams.js, documentsData.js)
│       ├── pages/            # Các trang giao diện (Home, CoursesPage, ResourcesPage, ExamsPage, ExamDetail...)
│       └── utils/            # Helper dịch thuật & xử lý thời gian
│
├── DEPLOYMENT_GUIDE.md        # Hướng dẫn triển khai chi tiết
├── USER_GUIDE.md              # Hướng dẫn sử dụng cho người dùng & sinh viên
├── netlify.toml               # Cấu hình deploy Frontend trên Netlify
└── README.md                  # Tài liệu giới thiệu tổng quan dự án
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)

### 1. Yêu Cầu Tiền Đề
- Node.js version `>= 18.0.0`
- Git

### 2. Cài Đặt Backend
```bash
cd backend
npm install
npm start
```
*Backend server sẽ khởi chạy tại `http://localhost:3001`.*

### 3. Cài Đặt Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend phát triển sẽ chạy tại `http://localhost:5173`.*

---

## 📄 Tài Liệu Liên Quan
- 📖 [USER_GUIDE.md](./USER_GUIDE.md): Hướng dẫn sử dụng tính năng cho sinh viên và quản trị viên.
- 🛠️ [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md): Hướng dẫn cấu hình môi trường Production & Deploy lên Netlify / Render / Vercel.

---

## ✒️ Bản Quyền & Tác Giả

Biên soạn và phát triển bởi **Lữ Võ Hoàng Phúc** (Sinh viên Khóa K50 – Đại học Kinh tế TP. Hồ Chí Minh).  
Tài liệu và mã nguồn phục vụ mục đích hỗ trợ cộng đồng sinh viên UEH học tập.

*© 2026 Lữ Võ Hoàng Phúc. All rights reserved.*
