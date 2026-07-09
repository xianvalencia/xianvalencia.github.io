# xianvalencia.github.io

Personal blog — fitness × software engineering. Next.js (App Router) with static export for GitHub Pages.

## Quick start

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # static export → ./out
```

## Deploy to GitHub Pages

1. Push this repo to `xianvalencia/xianvalencia.github.io` (branch `main`).
2. In repo **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push.

## Content

All content lives in `data/content.json` — profile, stats, social URLs, posts, and embeds. Swap the placeholder social URLs for your real ones there.

`lib/content.js` is the only module that touches the JSON. To move to a dynamic source (CMS/API) later, change those functions and everything else keeps working.

### Embeds

Each post has an `embeds` array rendered by `components/Embed.jsx`:

- `youtube` — real iframe embed, set `videoId`
- `strava` — styled activity card from dummy stats; swap for the official Strava embed script when you have real `embedId`s (instructions in the component)
- Add `instagram` / `facebook` as new cases in `Embed.jsx` when needed

## Social redirects

`/go/strava/`, `/go/facebook/`, `/go/instagram/`, `/go/youtube/` — static pages that client-redirect to your profiles (GitHub Pages can't do server redirects). URLs come from `data/content.json`.

## About SSR

Pages are authored as React Server Components. With `output: 'export'` they render at build time (GitHub Pages requirement). If you later move to Vercel or a Node host, delete `output: 'export'` from `next.config.mjs` to get true request-time SSR — no page code changes needed.
