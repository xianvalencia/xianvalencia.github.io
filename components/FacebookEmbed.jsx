'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function FacebookEmbed({ url }) {
  const isPost = url.includes('/posts/');

  // Re-parse if the URL changes (e.g. navigating between posts)
  useEffect(() => {
    if (window.FB) window.FB.XFBML.parse();
  }, [url]);

  return (
    <>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v21.0"
        strategy="lazyOnload"
        onLoad={() => window.FB?.XFBML.parse()}
      />
      {isPost ? (
        <div
          className="fb-post"
          data-href={url}
          data-width="500"
          data-show-text="true"
        />
      ) : (
        <div
          className="fb-video"
          data-href={url}
          data-width="auto"
          data-show-text="false"
          data-allowfullscreen="true"
        />
      )}
    </>
  );
}
