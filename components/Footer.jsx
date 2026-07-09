import SocialLinks from './SocialLinks';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container inner">
        <span>
          © {new Date().getFullYear()} Xian Rex Valencia — built with Next.js, fueled by carbs
        </span>
        <SocialLinks />
      </div>
    </footer>
  );
}
