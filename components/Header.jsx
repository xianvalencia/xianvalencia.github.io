import Link from 'next/link';
import SocialLinks from './SocialLinks';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="logo">
          <span className="prompt">~/</span>xianvalencia<span className="cursor" />
        </Link>
        <SocialLinks />
      </div>
    </header>
  );
}
