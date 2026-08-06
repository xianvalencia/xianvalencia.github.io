# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export → ./out (also the deploy build)
npm run lint    # next lint
```

There is no test suite. `npm run build` is the verification step — it also proves every post in `data/content.json` still renders, since pages are generated from that JSON at build time.

Node 24 is required (`.nvmrc`, `engines`, and the deploy workflow all pin it). The default `node` on this machine's PATH is v14, which lacks global `fetch` and will fail; use `nvm use` or an explicit path such as `~/.nvm/versions/node/v22.10.0/bin/node` when running scripts directly.

## Architecture

Next.js 15 App Router + React 19, exported as a fully static site (`output: 'export'`, `trailingSlash: true`, unoptimized images) and deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

**Everything renders at build time.** Pages are authored as React Server Components, so removing `output: 'export'` from `next.config.mjs` would give real request-time SSR with no page changes. Two consequences to keep in mind:

- Server-side redirects are impossible, so `/go/[platform]/` renders a branded interstitial and redirects client-side (`components/SocialRedirect.jsx`).
- Anything needing runtime data must be a client component. The five that are: `Reveal`, `TypeWriter`, `SocialRedirect`, `InstagramEmbed`, `FacebookEmbed`.

### Data flow

`data/content.json` (profile, socials, posts) → `lib/content.js` → pages.

`lib/content.js` is deliberately the **only** module that imports the JSON, so a future CMS/API swap touches one file. Keep it that way — don't import `content.json` from a page or component.

`lib/strava.js` is a separate live source: at build time `getProfile()` overlays real Strava year-to-date run/ride distances onto the profile stat cards, matched by the stat's `icon` field (`run`, `bike`, `terminal`). It returns `null` on any failure or missing credentials, and the JSON values act as the fallback — so builds succeed without secrets, just with stale stats. `terminal` is computed from a hardcoded `CODING_START` date.

### Routes

- `/` — hero + post grid
- `/blog/[slug]/` — `generateStaticParams()` emits one page per post in the JSON
- `/go/[platform]/` — one page per entry in `socials`

### Posts and embeds

A post object is `{ slug, title, date, tags, excerpt, readingTime, cover, body, embeds }`. `body` is an **array of paragraph strings** (no markdown/HTML — each element becomes a `<p>`). `date` is the *event* date, and `getPosts()` sorts by it descending.

`components/Embed.jsx` is a switch over `embed.type` — `youtube`, `strava`, `facebook`, `instagram` — and returns `null` for unknown types. New embed types are added as new cases there. The `strava` case currently renders a hand-built card from the embed's `stats` object rather than Strava's official embed script.

Cover images are hand-authored SVGs in `public/images/posts/<slug>.svg`, all sharing one terminal-styled visual language (640×360, `#10161d` background, monospace text, green `#00ff88` / orange `#ff6b35` accents). Match it when adding one.

All styling is plain CSS in `app/globals.css` — no CSS modules, no Tailwind. Import alias `@/*` maps to the repo root.

### Adding posts

Use the `blog-content-entry` skill (`.claude/skills/blog-content-entry/SKILL.md`) rather than hand-writing entries — it encodes the schema, the voice, the date-precedence rule for multi-source posts, and the SVG cover conventions.

## Secrets and generated data

`.env` (gitignored) holds `STRAVA_*`, `YOUTUBE_API_KEY`, and `FACEBOOK_*`. Only the three `STRAVA_*` values are needed for a build; they're also GitHub Actions secrets.

`scripts/fetch-strava-activities.js` bulk-fetches raw Strava activities into `data/activities.json` as a local research corpus for writing posts. It is **not** part of the build — nothing in `app/` or `lib/` reads it. Note that it rewrites `STRAVA_REFRESH_TOKEN` in `.env` on every run, because Strava rotates the refresh token on each exchange; if you rotate it locally, the GitHub secret goes stale and the deployed stats silently fall back to the JSON values.
