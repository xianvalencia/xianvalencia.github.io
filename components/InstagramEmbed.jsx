'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function InstagramEmbed({ url }) {
  // Re-process if the URL changes (e.g. navigating between posts)
  useEffect(() => {
    if (window.instgrm) window.instgrm.Embeds.process();
  }, [url]);

  return (
    <>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => window.instgrm?.Embeds.process()}
      />
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
      />
    </>
  );
}
