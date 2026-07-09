'use client';

// Client component that performs the actual redirect to the external social
// page. Static hosts like GitHub Pages can't do server-side redirects, so we
// redirect on the client after a brief branded interstitial.
import { useEffect } from 'react';

export default function SocialRedirect({ label, url, color }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.replace(url);
    }, 800);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div className="redirect-page">
      <div className="spinner" style={{ borderTopColor: color }} />
      <p>
        redirecting you to <strong style={{ color }}>{label}</strong>…
      </p>
      <p>
        not moving? <a href={url}>tap here</a>
      </p>
    </div>
  );
}
