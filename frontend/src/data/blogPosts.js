import { economicsDerivativePost } from './economicsDerivativePost';
import { quantFinanceStatisticsPost } from './quantFinanceStatisticsPost';
import { deepBsdeMfgMfcPost } from './deepBsdeMfgMfcPost';

export const blogPosts = [
  deepBsdeMfgMfcPost,
  quantFinanceStatisticsPost,
  economicsDerivativePost,
  {
    slug: 'lo-trinh-on-toan-cao-cap',
    title: 'Lộ trình ôn Toán Cao Cấp cho sinh viên UEH mới bắt đầu',
    category: 'Kinh nghiệm học',
    date: '25/05/2026',
    author: 'UEH TCC',
    keywords: ['lộ trình học', 'Toán Cao Cấp', 'UEH', 'ôn thi'],
    image: '/images/tccvang.jpg',
    excerpt: 'Cách học theo thứ tự: nắm nền tảng, ôn dạng bài, rồi chuyển sang luyện đề thử có thời gian.',
    toc: ['Mở đầu', 'Nắm nền tảng', 'Ôn theo dạng bài', 'Luyện đề thử', 'Tài liệu nên dùng'],
    sections: [
      {
        heading: 'Mở đầu',
        body: 'Vấn đề lớn nhất khi học Toán Cao Cấp thường không phải thiếu tài liệu, mà là không biết bắt đầu từ đâu. Một lộ trình rõ sẽ giúp bạn tránh học lan man và biết khi nào nên chuyển sang luyện đề.'
      },
      {
        heading: 'Nắm nền tảng',
        body: 'Hãy bắt đầu với ma trận, định thức, hệ phương trình tuyến tính và không gian vector. Đây là nhóm kiến thức thường xuất hiện trong nhiều dạng bài và giúp bạn đọc đề nhanh hơn.'
      },
      {
        heading: 'Ôn theo dạng bài',
        body: 'Sau khi có nền tảng, hãy học theo dạng: giới hạn, đạo hàm, hàm nhiều biến, cực trị và mô hình kinh tế. Mỗi dạng nên có ví dụ mẫu, bài tập tự luyện và ghi chú lỗi sai.'
      },
      {
        heading: 'Luyện đề thử',
        body: 'Khi đã nắm dạng bài, hãy làm đề trong thời gian giới hạn. Sau mỗi đề, ghi lại câu sai, lý do sai và chương cần ôn lại.'
      },
      {
        heading: 'Tài liệu nên dùng',
        body: 'Ưu tiên giáo trình, bài tập chương và đề có lời giải. Không nên tải quá nhiều file cùng lúc nếu bạn chưa có kế hoạch học cụ thể.'
      }
    ]
  },
  {
    slug: '7-ngay-cuoi-truoc-ky-thi',
    title: '7 ngày cuối trước kỳ thi Toán Cao Cấp nên ôn gì?',
    category: 'Luyện thi',
    date: '24/05/2026',
    author: 'UEH TCC',
    keywords: ['luyện thi', '7 ngày cuối', 'đề thi'],
    image: '/images/bg.jpg',
    excerpt: 'Gợi ý cách chia thời gian trong tuần cuối để vừa ôn công thức, vừa luyện đề và sửa lỗi.',
    toc: ['Mở đầu', 'Ngày 1-2', 'Ngày 3-5', 'Ngày 6-7'],
    sections: [
      { heading: 'Mở đầu', body: 'Tuần cuối không nên học tràn lan. Mục tiêu là rà lại phần trọng tâm, làm đề và sửa đúng lỗi sai.' },
      { heading: 'Ngày 1-2', body: 'Rà công thức, ví dụ mẫu và các dạng bài cơ bản. Ghi lại phần chưa chắc để xử lý trước khi làm đề.' },
      { heading: 'Ngày 3-5', body: 'Làm bài theo chương và luyện những dạng thường sai. Mỗi buổi nên có một danh sách lỗi sai ngắn.' },
      { heading: 'Ngày 6-7', body: 'Làm đề thử theo thời gian, kiểm tra lại câu sai và ngủ đủ trước ngày thi.' }
    ]
  },
  {
    slug: 'nhan-dien-gioi-han-ham-nhieu-bien',
    title: 'Cách nhận diện nhanh bài giới hạn hàm nhiều biến',
    category: 'Phương pháp',
    date: '23/05/2026',
    author: 'UEH TCC',
    keywords: ['giới hạn', 'hàm nhiều biến', 'phương pháp'],
    image: '/images/c4678.jpg',
    excerpt: 'Một số tín hiệu trong đề giúp bạn chọn hướng biến đổi, xét đường đi hoặc đổi biến phù hợp.',
    toc: ['Mở đầu', 'Dấu hiệu nhận diện', 'Cách kiểm tra', 'Lỗi thường gặp'],
    sections: [
      { heading: 'Mở đầu', body: 'Bài giới hạn hàm nhiều biến dễ gây rối vì có nhiều hướng tiếp cận. Điều quan trọng là đọc dạng biểu thức trước khi biến đổi.' },
      { heading: 'Dấu hiệu nhận diện', body: 'Nếu biểu thức có căn, nhân liên hợp có thể hữu ích. Nếu có tổng bình phương, hãy nghĩ đến đánh giá hoặc đổi sang tọa độ cực.' },
      { heading: 'Cách kiểm tra', body: 'Khi nghi ngờ giới hạn không tồn tại, hãy thử nhiều đường đi khác nhau. Nếu kết quả khác nhau, giới hạn không tồn tại.' },
      { heading: 'Lỗi thường gặp', body: 'Lỗi phổ biến là áp dụng công thức một biến cho bài nhiều biến hoặc bỏ qua điều kiện đường đi.' }
    ]
  },
  {
    slug: 'thu-tu-dung-tai-lieu-tcc',
    title: 'Thứ tự dùng giáo trình, bài tập chương và đề thi',
    category: 'Tài liệu',
    date: '22/05/2026',
    author: 'UEH TCC',
    keywords: ['tài liệu', 'giáo trình', 'PDF'],
    image: '/images/c123.jpg',
    excerpt: 'Không phải tài liệu nào cũng nên đọc trước. Bài viết này gợi ý thứ tự dùng tài liệu hiệu quả hơn.',
    toc: ['Mở đầu', 'Giáo trình', 'Bài tập chương', 'Đề thi'],
    sections: [
      { heading: 'Mở đầu', body: 'Nếu có quá nhiều PDF, bạn dễ mất thời gian chọn file thay vì học. Hãy dùng tài liệu theo từng giai đoạn.' },
      { heading: 'Giáo trình', body: 'Dùng giáo trình để hiểu định nghĩa, công thức và ví dụ chuẩn. Không cần đọc quá dài nếu mục tiêu là ôn thi.' },
      { heading: 'Bài tập chương', body: 'Sau mỗi chương, chọn các bài đại diện để luyện kỹ năng nhận dạng dạng bài.' },
      { heading: 'Đề thi', body: 'Đề thi nên dùng sau khi đã học qua dạng bài. Làm đề quá sớm dễ tạo cảm giác nản vì thiếu nền tảng.' }
    ]
  }
];

export const getBlogPostBySlug = (slug) => blogPosts.find((post) => post.slug === slug);
