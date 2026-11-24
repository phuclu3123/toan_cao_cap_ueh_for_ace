import '../../assets/styles/SocialLinks.css';

export default function SocialLinks() {
  return <div className="brand-socials" aria-label="Kết nối α∫M4A">
    <a className="brand-social brand-social--facebook" href="https://www.facebook.com/profile.php?id=61577916376501" target="_blank" rel="noopener noreferrer" aria-label="Facebook α∫M4A" title="Facebook α∫M4A">
      <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M19 29V18h3.7l.6-4.3H19V11c0-1.3.4-2.2 2.2-2.2h2.4V5a31 31 0 0 0-3.4-.2c-3.4 0-5.7 2-5.7 5.8v3.1h-3.8V18h3.8v11Z" /></svg>
    </a>
    <a className="brand-social brand-social--youtube" href="https://www.youtube.com/@phuclu3569" target="_blank" rel="noopener noreferrer" aria-label="YouTube Phúc Lữ" title="YouTube Phúc Lữ">
      <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="9" width="22" height="15" rx="5" fill="currentColor" /><path d="m14 13 7 3.5-7 3.5Z" fill="#ee3025" /></svg>
    </a>
    <span className="brand-social brand-social--tiktok" role="img" aria-label="TikTok, đang chuẩn bị" title="TikTok · Đang chuẩn bị">
      <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M20 6v14a6 6 0 1 1-5-6" stroke="#25f4ee" strokeWidth="4" fill="none" transform="translate(-1 1)" /><path d="M20 6c0 4 2 6 6 6M20 6v14a6 6 0 1 1-5-6" stroke="#fe2c55" strokeWidth="4" fill="none" transform="translate(1 0)" /><path d="M20 6c0 4 2 6 6 6M20 6v14a6 6 0 1 1-5-6" stroke="white" strokeWidth="3" fill="none" /></svg>
    </span>
    <a className="brand-social brand-social--zalo" href="https://zalo.me/0833830322" target="_blank" rel="noopener noreferrer" aria-label="Zalo Phúc Lữ" title="Zalo Phúc Lữ"><svg viewBox="0 0 40 32" aria-hidden="true"><text x="20" y="22" textAnchor="middle" fill="white" fontSize="14" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="-.7">Zalo</text></svg></a>
  </div>;
}
