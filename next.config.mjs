/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages serves static files only, so we pre-render everything at
  // build time (SSG via React Server Components). Pages are still authored
  // as server components — swap this out for true SSR if you move to Vercel.
  output: 'export',
  images: {
    unoptimized: true, // next/image optimization needs a server
  },
  trailingSlash: true, // nicer URLs on GitHub Pages (folder/index.html)
};

export default nextConfig;
