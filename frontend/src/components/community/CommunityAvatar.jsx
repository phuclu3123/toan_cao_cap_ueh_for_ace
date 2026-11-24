import { useState } from 'react';
import { getInitials } from '../../utils/userInitials';

/** A real profile photo, or initials when the member has none or it fails. */
export default function CommunityAvatar({ src, name = '', imageClassName, fallbackClassName }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const usable = typeof src === 'string' && /^(https?:\/\/|data:image\/(?:png|jpeg|jpg|gif|webp);base64,)/i.test(src);
  return usable && src !== failedSrc
    ? <img src={src} alt="" className={imageClassName} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailedSrc(src)} />
    : <span className={fallbackClassName}>{getInitials(name || 'U')}</span>;
}
