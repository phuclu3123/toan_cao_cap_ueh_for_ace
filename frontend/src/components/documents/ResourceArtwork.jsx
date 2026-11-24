import KnowledgeSketch from '../learning/KnowledgeSketch';
import '../../assets/styles/KnowledgeArtwork.css';

export default function ResourceArtwork({ resource, variant = '' }) {
  const originalCover = resource.id === 'k51-2-dot' ? '/images/cover-k51.jpg' : resource.id === 'ap1' ? '/images/cover-final-2807.jpg' : null;
  if (originalCover) return <div className={`resource-artwork resource-artwork--book ${variant}`} aria-hidden="true"><img src={originalCover} alt="" loading="lazy" /></div>;
  const title = String(resource.title || '').toLowerCase();
  const kind = /ma trận|định thức|phương trình/.test(title) ? 'matrix' : /tích phân/.test(title) ? 'integral' : /kinh tế|cực trị/.test(title) ? 'optimize' : /véc tơ|vector/.test(title) ? 'vector' : 'curve';
  return <div className={`resource-artwork paper-surface ${variant}`} data-paper={kind === 'matrix' ? 'sky' : kind === 'integral' ? 'mint' : kind === 'optimize' ? 'sun' : kind === 'vector' ? 'peach' : 'lavender'} aria-hidden="true">
    <span className="resource-art-brand">α∫M4A <span>STUDY NOTES</span></span>
    <KnowledgeSketch kind={kind} step={1} />
    <span className="resource-art-foot">{resource.categoryLabel || 'Toán cao cấp'} <span>↗</span></span>
  </div>;
}
