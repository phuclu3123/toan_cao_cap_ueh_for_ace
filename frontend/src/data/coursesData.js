// E-Learning Courses Data Structure for UEH TCC
export const coursesData = [
  {
    id: 'power-bi-uiux',
    title: 'Power BI UI/UX – Nghệ thuật kể chuyện bằng dữ liệu',
    badge: 'ĐANG DIỄN RA',
    tag: 'Khóa e-learning',
    instructor: 'Dứa Data & Đội ngũ UEH TCC',
    image: '/images/tccvang.jpg',
    bannerBg: 'linear-gradient(135deg, #0e4e35 0%, #176b4a 50%, #063121 100%)',
    originalPrice: '799.000đ',
    discountPrice: '349.000đ',
    priceNote: 'GIÁ SAU KHUYẾN MÃI',
    isFree: false,
    lessonsCount: 27,
    sectionsCount: 4,
    documentsCount: 5,
    studentsCount: 158,
    duration: '00:00 - 23:59',
    desc: 'Khóa học thiết kế báo cáo Power BI chuẩn UI/UX hiện đại, giúp bạn biến các con số thô thành bảng điều khiển tương tác trực quan đỉnh cao.',
    highlights: [
      'Học online trực tiếp trên nền tảng web UEH TCC',
      '4 phần bài giảng gồm 27 bài học từ tư duy tới thực hành',
      'Tài liệu mẫu, file Background Canva/Figma đính kèm',
      'Bài giảng video chuẩn HD sắc nét + Bài giảng text tóm tắt'
    ],
    chapters: [
      {
        id: 'ch-1',
        sectionLabel: 'PHẦN 1',
        title: 'Chương 0: Giới thiệu khóa học',
        lessonsCount: 3,
        lessons: [
          {
            id: 'les-1-1',
            title: 'Lời mở đầu',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '03:41',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          },
          {
            id: 'les-1-2',
            title: 'Tổng kết đầu ra khóa học',
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
            content: 'Bộ tài liệu đính kèm gồm: 15 Mẫu Theme Màu Power BI HSL, 5 Template SVG Background cho Dashboard, 1 File Mẫu .pbix thực hành.'
          }
        ]
      },
      {
        id: 'ch-2',
        sectionLabel: 'PHẦN 2',
        title: 'Chương 1: Tại sao UI/UX quan trọng trong Power BI Dashboard',
        lessonsCount: 2,
        lessons: [
          {
            id: 'les-2-1',
            title: 'Tại sao UI đóng vai trò quan trọng trong Power BI Dashboard',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '06:15',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
          },
          {
            id: 'les-2-2',
            title: 'Tại sao UX đóng vai trò quan trọng trong Power BI Dashboard',
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
        title: 'Chương 2: Nguyên tắc cốt lõi trong thiết kế và trực quan hóa dữ liệu',
        lessonsCount: 4,
        lessons: [
          {
            id: 'les-3-1',
            title: 'Nguyên tắc 1: Tư duy thiết kế hướng người dùng',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '10:12',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
          },
          {
            id: 'les-3-2',
            title: 'Nguyên tắc 2: Phối màu sắc và Typography chuẩn UI/UX',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '12:45',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
          },
          {
            id: 'les-3-3',
            title: 'Nguyên tắc 3: Bố cục Grid System và Visual Hierarchy',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '09:30',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4'
          },
          {
            id: 'les-3-4',
            title: 'Nguyên tắc 4: Tối ưu tương tác và trải nghiệm chọn lọc (Drill-through/Filter)',
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
        title: 'Chương 3: Thực hành thiết kế báo cáo',
        lessonsCount: 18,
        lessons: [
          {
            id: 'les-4-1',
            title: 'Giới thiệu chương',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '05:10',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
          },
          {
            id: 'les-4-2',
            title: 'Thiết kế background Home Page',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '14:20',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
          },
          {
            id: 'les-4-3',
            title: 'Thiết kế background Report Page',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '16:05',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          },
          {
            id: 'les-4-4',
            title: 'Thiết kế background Help Page',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '11:40',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
          },
          {
            id: 'les-4-5',
            title: 'Sử dụng power query để import dữ liệu vào báo cáo',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '18:30',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
          },
          {
            id: 'les-4-6',
            title: 'Thiết kế thanh Header Report Page',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '13:15',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4'
          },
          {
            id: 'les-4-7',
            title: 'Thiết kế thanh điều hướng Navigation Report Page',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '15:50',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
          }
        ]
      }
    ]
  },
  {
    id: 'python-genz',
    title: 'Lớp tự học python Tháng 8 cho Dứa & cộng đồng GenZ làm Data',
    badge: 'ĐANG DIỄN RA',
    tag: 'Tự học Python',
    instructor: 'DUA Edu x GenZ làm Data',
    image: '/images/bg.jpg',
    bannerBg: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
    originalPrice: 'Miễn phí',
    discountPrice: 'Miễn phí',
    priceNote: 'DÀNH CHO CỘNG ĐỒNG',
    isFree: true,
    lessonsCount: 45,
    sectionsCount: 5,
    documentsCount: 8,
    studentsCount: 692,
    duration: 'Tự do 24/7',
    desc: 'Lộ trình nhập môn Python cho phân tích dữ liệu, tự học bài bản từ cú pháp cơ bản đến Pandas, Numpy và Matplotlib.',
    highlights: [
      '45 bài giảng chi tiết xây dựng nền tảng Lập trình Data',
      'Học hoàn toàn miễn phí cùng cộng đồng sinh viên GenZ',
      'Hỗ trợ giải đáp bài tập trên nhóm Zalo & Forum',
      'Cấp chứng nhận hoàn thành lớp tự học'
    ],
    chapters: [
      {
        id: 'py-ch-1',
        sectionLabel: 'PHẦN 1',
        title: 'Chương 1: Cấu trúc dữ liệu & Cú pháp Python cơ bản',
        lessonsCount: 3,
        lessons: [
          {
            id: 'py-1-1',
            title: 'Cài đặt Python, Jupyter Notebook và VS Code',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '05:40',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          },
          {
            id: 'py-1-2',
            title: 'Biến, kiểu dữ liệu nguyên thủy và toán tử',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '08:15',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
          },
          {
            id: 'py-1-3',
            title: 'List, Tuple, Set và Dictionary trong Python',
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
    id: 'data-analysis-beginner',
    title: 'Thực chiến phân tích dữ liệu cho người mới bắt đầu',
    badge: 'ĐANG DIỄN RA',
    tag: 'Khóa học Thực chiến',
    instructor: 'ThS. Mạnh Tuấn',
    image: '/images/c4678.jpg',
    bannerBg: 'linear-gradient(135deg, #1d3557 0%, #457b9d 100%)',
    originalPrice: '5.000.000đ',
    discountPrice: '4.100.000đ',
    priceNote: 'ƯU ĐÃI KHÓA HỌC THÁNG 8',
    isFree: false,
    lessonsCount: 12,
    sectionsCount: 3,
    documentsCount: 4,
    studentsCount: 38,
    duration: '12 Buổi thực chiến',
    desc: 'Phương pháp tư duy phân tích dữ liệu doanh nghiệp từ SQL, Excel tới thiết kế Dashboard báo cáo thực tế.',
    highlights: [
      'Giảng dạy bởi ThS. Mạnh Tuấn - Chuyên gia CNTT & Data Analyst',
      'Thực hành làm dự án cá nhân đính kèm CV xin việc',
      'Cam kết đầu ra tự tin xử lý bài toán Data thực tế'
    ],
    chapters: [
      {
        id: 'da-ch-1',
        sectionLabel: 'PHẦN 1',
        title: 'Chương 1: Quy trình Phân tích Dữ liệu Chuẩn Doanh Nghiệp',
        lessonsCount: 2,
        lessons: [
          {
            id: 'da-1-1',
            title: 'Tổng quan quy trình Business Intelligence & Data Analytics',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '07:30',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4'
          },
          {
            id: 'da-1-2',
            title: 'Tư duy Đặt câu hỏi kinh doanh (Business Questions)',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '11:10',
            isLocked: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
          }
        ]
      }
    ]
  },
  {
    id: 'data-analysis-practical',
    title: 'Thực chiến phân tích dữ liệu qua các bài toán thực tế',
    badge: 'ĐANG DIỄN RA',
    tag: 'Dự án Doanh nghiệp',
    instructor: 'Đội ngũ giảng dạy DUA Edu',
    image: '/images/tccvang.jpg',
    bannerBg: 'linear-gradient(135deg, #2b2d42 0%, #8d99ae 100%)',
    originalPrice: '4.500.000đ',
    discountPrice: '3.900.000đ',
    priceNote: 'GIÁ SAU KHUYẾN MÃI',
    isFree: false,
    lessonsCount: 48,
    sectionsCount: 6,
    documentsCount: 12,
    studentsCount: 44,
    duration: 'Tự do 24/7',
    desc: 'Giải quyết 10 Case Study kinh điển trong Thương mại điện tử, Tài chính, Chuỗi bán lẻ và Marketing.',
    highlights: [
      '48 bài học dự án thực tế xây dựng Portfolio',
      'Đội ngũ Tutor theo sát và giải đáp bài làm 1:1',
      'Kho dữ liệu thực tế hơn 1,000,000 dòng dữ liệu'
    ],
    chapters: [
      {
        id: 'dap-ch-1',
        sectionLabel: 'PHẦN 1',
        title: 'Chương 1: Case Study Phân tích Tỷ lệ Rời bỏ Khách hàng (Churn Rate)',
        lessonsCount: 2,
        lessons: [
          {
            id: 'dap-1-1',
            title: 'Phân tích định nghĩa Churn Rate & Giới thiệu Dataset',
            subtitle: 'Video bài học',
            type: 'video',
            duration: '09:15',
            isLocked: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
          },
          {
            id: 'dap-1-2',
            title: 'Xây dựng Mô hình Cohort Analysis trong SQL & Tableau',
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
