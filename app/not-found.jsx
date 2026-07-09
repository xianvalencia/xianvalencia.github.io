import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="redirect-page">
      <p style={{ fontSize: '2.4rem' }}>404</p>
      <p>route not found — you&apos;ve run off course</p>
      <Link href="/">← back to start line</Link>
    </div>
  );
}
