// E-Learning Courses Data Structure for UEH TCC
export const coursesData = [
  {
    id: 'tu-hoc-toan-cao-cap',
    title: '1. Tự học Toán Cao Cấp',
    badge: 'ĐANG DIỄN RA',
    tag: 'Khóa e-learning',
    instructor: 'Đội ngũ Giảng viên UEH TCC',
    image: '/images/tccvang.jpg',
    bannerBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    originalPrice: '799.000đ',
    discountPrice: '349.000đ',
    priceNote: 'GIÁ SAU KHUYẾN MÃI',
    isFree: false,
    lessonsCount: 27,
    sectionsCount: 4,
    documentsCount: 5,
    studentsCount: 358,
    duration: 'Tự do 24/7',
    desc: 'Lộ trình bài giảng video chuẩn hóa 100% chương trình Toán Cao Cấp UEH: Ma trận, Hệ phương trình, Đạo hàm nhiều biến và Tích phân ứng dụng kinh tế.',
    highlights: [
      'Học online trực tiếp trên nền tảng web UEH TCC',
      '4 phần bài giảng gồm 27 bài học từ lý thuyết đến phương pháp giải nhanh',
      'Kho đề thi tự luyện & PDF tóm tắt công thức đính kèm',
      'Video bài giảng chuẩn HD sắc nét + Bài giảng text tóm tắt'
    ],
    chapters: [
      {
        id: 'ch-1',
        sectionLabel: 'PHẦN 1',
        title: 'Chương 0: Giới thiệu & Định hướng môn học',
        lessonsCount: 3,
        lessons: [
          {
            id: 'les-1-1',
            title: 'Lời mở đầu & Phương pháp học Toán Cao Cấp hiệu quả',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '03:41',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          },
          {
            id: 'les-1-2',
            title: 'Tổng kết cấu trúc đề thi & Chuẩn đầu ra',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '04:20',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
          },
          {
            id: 'les-1-3',
            title: 'Tài liệu kèm theo ⤵ (Dưới phần mô tả) ⤵',
            subtitle: 'Bài giảng text & File đính kèm',
            type: 'text',
            duration: '05:00',
            isLocked: true,
            content: 'Bộ tài liệu đính kèm gồm: Sổ tay công thức Toán Cao Cấp, File PDF 100 Câu hỏi trắc nghiệm tự luyện, Slide tóm tắt bài giảng.'
          }
        ]
      },
      {
        id: 'ch-2',
        sectionLabel: 'PHẦN 2',
        title: 'Chương 1: Đại số tuyến tính & Ứng dụng Kinh tế',
        lessonsCount: 2,
        lessons: [
          {
            id: 'les-2-1',
            title: 'Phân tích Ma trận & Các phép biến đổi sơ cấp',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '06:15',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
          },
          {
            id: 'les-2-2',
            title: 'Giải Hệ phương trình tuyến tính bằng phương pháp Gauss',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '08:30',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4'
          }
        ]
      },
      {
        id: 'ch-3',
        sectionLabel: 'PHẦN 3',
        title: 'Chương 2: Giải tích hàm một biến & Hàm nhiều biến',
        lessonsCount: 4,
        lessons: [
          {
            id: 'les-3-1',
            title: 'Bài toán Đạo hàm riêng và Vi phân toàn phần',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '10:12',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
          },
          {
            id: 'les-3-2',
            title: 'Cực trị tự do và Cực trị có điều kiện buộc (Lagrange)',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '12:45',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
          },
          {
            id: 'les-3-3',
            title: 'Bài toán tối ưu hóa chi phí & lợi nhuận trong Kinh tế',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '09:30',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4'
          },
          {
            id: 'les-3-4',
            title: 'Tích phân xác định & Tích phân suy rộng ứng dụng',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '11:20',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
          }
        ]
      },
      {
        id: 'ch-4',
        sectionLabel: 'PHẦN 4',
        title: 'Chương 3: Thực hành Phương pháp Giải Đề thi Thi giữa kỳ & Cuối kỳ',
        lessonsCount: 18,
        lessons: [
          {
            id: 'les-4-1',
            title: 'Giới thiệu chương luyện đề',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '05:10',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
          },
          {
            id: 'les-4-2',
            title: 'Giải chi tiết Đề thi giữa kỳ Mã đề 01',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '14:20',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
          },
          {
            id: 'les-4-3',
            title: 'Giải chi tiết Đề thi giữa kỳ Mã đề 02',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '16:05',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          }
        ]
      }
    ]
  },
  {
    id: 'lop-tu-hoc-sql',
    title: '2. Lớp tự học SQL',
    badge: 'ĐANG DIỄN RA',
    tag: 'Tự học SQL Data',
    instructor: 'DUA Edu x GenZ làm Data',
    image: '/images/bg.jpg',
    bannerBg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    originalPrice: 'Miễn phí',
    discountPrice: 'Miễn phí',
    priceNote: 'DÀNH CHO CỘNG ĐỒNG',
    isFree: true,
    lessonsCount: 45,
    sectionsCount: 5,
    documentsCount: 8,
    studentsCount: 692,
    duration: 'Tự do 24/7',
    desc: 'Lộ trình nhập môn SQL cho truy vấn dữ liệu kinh tế, xử lý bảng, JOIN, GROUP BY và Window Functions từ cơ bản đến nâng cao.',
    highlights: [
      '45 bài giảng chi tiết bài bản xây dựng nền tảng SQL',
      'Học hoàn toàn miễn phí cùng cộng đồng sinh viên',
      'Hỗ trợ giải đáp bài tập trên nhóm Zalo & Forum',
      'Cấp chứng nhận hoàn thành lớp tự học'
    ],
    chapters: [
      {
        id: 'sql-ch-1',
        sectionLabel: 'PHẦN 1',
        title: 'Chương 1: Cú pháp SQL Cơ bản & Truy vấn SELECT',
        lessonsCount: 3,
        lessons: [
          {
            id: 'sql-1-1',
            title: 'Cài đặt Cơ sở Dữ liệu & Công cụ Truy vấn',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '05:40',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          },
          {
            id: 'sql-1-2',
            title: 'Truy vấn cơ bản với SELECT, WHERE, ORDER BY',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '08:15',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
          },
          {
            id: 'sql-1-3',
            title: 'Kỹ thuật JOIN bảng (INNER JOIN, LEFT JOIN)',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '12:00',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
          }
        ]
      }
    ]
  },
  {
    id: 'thuc-chien-k46-k50',
    title: '3. Thực chiến phân tích đề thi K46 - K50',
    badge: 'ĐANG DIỄN RA',
    tag: 'Giải Đề Chi Tiết',
    instructor: 'ThS. Mạnh Tuấn & Đội ngũ UEH TCC',
    image: '/images/c4678.jpg',
    bannerBg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
    originalPrice: '5.000.000đ',
    discountPrice: '4.100.000đ',
    priceNote: 'ƯU ĐÃI KHÓA HỌC THÁNG 8',
    isFree: false,
    lessonsCount: 12,
    sectionsCount: 3,
    documentsCount: 4,
    studentsCount: 138,
    duration: '12 Buổi luyện đề',
    desc: 'Tuyển tập phân tích chuyên sâu các dạng đề thi Toán Cao Cấp qua các khóa K46 đến K50, nhận diện bẫy đề và mẹo bấm máy tính Casio tối ưu thời gian.',
    highlights: [
      'Phân tích chi tiết 50+ đề thi các khóa K46 - K50',
      'Mẹo tư duy trắc nghiệm & tự luận chuẩn đáp án UEH',
      'Cam kết tăng ít nhất 2 - 3 điểm bài thi thực tế'
    ],
    chapters: [
      {
        id: 'k46-ch-1',
        sectionLabel: 'PHẦN 1',
        title: 'Chương 1: Phân tích Dạng đề Thi K46 - K48',
        lessonsCount: 2,
        lessons: [
          {
            id: 'k46-1-1',
            title: 'Tổng quan cấu trúc đề thi K46 - K48',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '07:30',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4'
          },
          {
            id: 'k46-1-2',
            title: 'Giải bẫy câu hỏi Ma trận & Hệ phương trình',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '11:10',
            isLocked: true,
            videoUrl: 'https://youtu.be/78djtj2N9QI'
          }
        ]
      },
      {
        id: 'k50-ch-2',
        sectionLabel: 'PHẦN 2',
        title: 'Chương 2: Thực chiến Sửa Đề Thi K50',
        lessonsCount: 1,
        lessons: [
          {
            id: 'k50-1-1',
            title: 'Sửa chi tiết Đề thi Toán Cao Cấp K50 Đợt 1 (Video YouTube HD)',
            subtitle: 'Video chữa đề chi tiết',
            type: 'video',
            duration: '45:00',
            isLocked: false,
            videoUrl: 'https://youtu.be/WDSHTnrv8JI'
          }
        ]
      }
    ]
  },
  {
    id: 'thuc-chien-k51',
    title: '4. Thực chiến phân tích đề thi K51 – Nghệ thuật giải đề trong phòng thi',
    badge: 'ĐANG DIỄN RA',
    tag: 'Bí Quyết Điểm Cao',
    instructor: 'Đội ngũ Giảng viên DUA Edu',
    image: '/images/tccvang.jpg',
    bannerBg: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
    originalPrice: '4.500.000đ',
    discountPrice: '3.900.000đ',
    priceNote: 'GIÁ SAU KHUYẾN MÃI',
    isFree: false,
    lessonsCount: 48,
    sectionsCount: 6,
    documentsCount: 12,
    studentsCount: 244,
    duration: 'Tự do 24/7',
    desc: 'Khóa học thực chiến mới nhất cập nhật ma trận đề thi K51, chiến thuật quản lý thời gian 60 phút phòng thi và các bí quyết đạt điểm A/A+.',
    highlights: [
      'Cập nhật 100% cấu trúc đề thi khóa mới nhất K51',
      'Chiến thuật phân bổ thời gian trong phòng thi',
      'Kho đề minh họa có đáp án chi tiết từng câu'
    ],
    chapters: [
      {
        id: 'k51-ch-1',
        sectionLabel: 'PHẦN 1',
        title: 'Chương 1: Ma trận Đề thi K51 & Chiến thuật Phòng thi',
        lessonsCount: 2,
        lessons: [
          {
            id: 'k51-1-1',
            title: 'Phân tích Ma trận Đề thi K51 Mới nhất',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '09:15',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
          },
          {
            id: 'k51-1-2',
            title: 'Chiến thuật 60 phút phòng thi & Mẹo kiểm tra lại đáp án',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '14:40',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4'
          }
        ]
      }
    ]
  }
];

export const getCourseById = (id) => {
  return coursesData.find((course) => course.id === id) || coursesData[0];
};
