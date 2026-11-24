import { Link } from 'react-router-dom';

/** Curated material and deleted accounts have no member profile to link to. */
export default function CommunityMemberLink({ author, children, ...props }) {
  return author?.id
    ? <Link {...props} to={'/community/user/' + encodeURIComponent(author.id)}>{children}</Link>
    : <span {...props}>{children}</span>;
}
