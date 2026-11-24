import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, BookOpen, Trophy } from 'lucide-react';
import MathRenderer from '../MathRenderer';
import CommunityAvatar from './CommunityAvatar';
import CommunityMemberLink from './CommunityMemberLink';

export default function CommunitySidebar({ leaderboard = [], topUsers, hotQuestions = [],
  onOpenLeaderboard, onOpenCheatsheet, metadataError, onRetry }) {
  const solvers = (topUsers || leaderboard).slice(0, 3);
  return <aside className="se-right-sidebar qa-community-rail" aria-label="Tiện ích cộng đồng">
    {metadataError && <div className="qa-inline-notice" role="status">Chưa tải được dữ liệu cộng đồng. <button type="button" onClick={onRetry}>Thử lại</button></div>}
    <section className="qa-rail-section">
      <div className="qa-rail-heading"><h2>Cùng tìm lời giải</h2></div>
      <ul className="qa-popular-list">{hotQuestions.slice(0, 2).map(post => <li key={post.id}><Link to={'/community/' + post.id}><MathRenderer text={post.title} inline /></Link><Link className="qa-rail-read-link" to={'/community/' + post.id + '#answers-section'}>Trao đổi cách giải <ArrowRight size={14} /></Link></li>)}</ul>
      {!hotQuestions.length && <p className="qa-quiet-empty">Các bài toán sẽ xuất hiện khi có bài đăng.</p>}
    </section>
    {solvers.length > 0 && <section className="qa-rail-section">
      <div className="qa-rail-heading"><h2><Trophy size={16} />Người đóng góp</h2><button type="button" aria-label="Xem bảng xếp hạng" onClick={onOpenLeaderboard}><ArrowUpRight size={18} /></button></div>
      <div className="qa-contributors">{solvers.map(user => <CommunityMemberLink author={user} className="qa-contributor" key={user.id}>
        <span className="qa-contributor-avatar"><CommunityAvatar src={user.avatar} name={user.name} /></span>
        <span><strong>{user.name}</strong><small>{user.answersCount || 0} lời giải · {user.postsCount || 0} câu hỏi</small></span>
      </CommunityMemberLink>)}</div>
    </section>}
    <section className="qa-rail-section qa-notebook"><BookOpen size={23} /><h2>Sổ tay của Phúc</h2>
      <p>Tra công thức, ký hiệu và cách viết một đề toán dễ đọc.</p>
      <button type="button" onClick={onOpenCheatsheet}>Mở sổ tay công thức <ArrowUpRight size={16} /></button>
    </section>
  </aside>;
}
