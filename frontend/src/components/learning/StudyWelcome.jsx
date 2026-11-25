import { StudyScene } from './StudyDoodles';
import '../../assets/styles/StudyEditorial.css';

const stories = {
  courses: {
    kicker: 'CỨ TỪNG CHÚT MỘT',
    title: <>Từ một điều chưa hiểu,<br/>đến <em>“à, ra là vậy!”</em></>,
    description: 'Một bài giảng, vài nét ghi chú, rồi thêm một lần tự làm. Hiểu Toán bắt đầu từ những bước nhỏ như thế.',
    note: 'Chậm một chút cũng được.'
  },
  community: {
    kicker: 'NGHĨ CÙNG NHAU',
    title: <>Bạn hỏi một câu.<br/><em>Mở một góc nhìn.</em></>,
    description: 'Đôi khi, điều còn thiếu chỉ là một góc nhìn khác. Cứ kể chỗ bạn đang vướng, mình cùng gỡ từng bước.',
    note: 'Chưa hiểu? Cứ hỏi nhé!'
  },
  resources: {
    kicker: 'MỘT GÓC HỌC LIỆU',
    title: <>Lật một trang,<br/><em>nối thêm một ý.</em></>,
    description: 'Có trang để đọc kỹ, có dòng để gạch chân. Mong bạn tìm được điều mình cần giữa những tài liệu ở đây.',
    note: 'Để dành một trang hay.'
  },
  exams: {
    kicker: 'THỬ SỨC, HIỂU MÌNH HƠN',
    title: <>Không chỉ tìm đáp án.<br/><em>Tìm cách mình tiến bộ.</em></>,
    description: 'Làm một đề để biết mình đã vững ở đâu. Những câu còn sai sẽ chỉ cho bạn bước học tiếp theo.',
    note: 'Mỗi lần thử, thêm một chút vững vàng.'
  },
  blog: {
    kicker: 'NHỮNG Ý NGHĨ BÊN LỀ',
    title: <>Toán còn ở ngoài<br/><em>những trang bài tập.</em></>,
    description: 'Một câu chuyện nhỏ, một liên hệ bất ngờ, một ý tưởng muốn kể. Đọc thong thả, biết đâu bạn gặp điều thú vị.',
    note: 'Một chút tò mò, một câu chuyện mới.'
  }
};

export default function StudyWelcome({ current = 'courses' }) {
  const story = stories[current] || stories.courses;
  return <section className={`study-welcome study-welcome--${current}`} aria-label={story.kicker}>
    <div className="study-welcome-copy">
      <span className="study-editorial-kicker">{story.kicker}</span>
      <h2>{story.title}</h2>
      <p>{story.description}</p>
    </div>
    <figure className="study-welcome-art">
      <StudyScene kind={current}/>
      <figcaption>{story.note}</figcaption>
    </figure>
  </section>;
}
