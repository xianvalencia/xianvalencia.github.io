---
name: blog-content-entry
description: >-
  Generates a ready-to-paste post entry for the xianvalencia.github.io blog
  (data/content.json) from a social media URL — YouTube, Strava, Instagram,
  or Facebook. Fetches the caption/description from the URL, expands it into
  a blog-style body, generates tags, reading time, a themed SVG cover image,
  and the correct embed object, then appends the entry to data/content.json.
  Use whenever the user says things like "add a blog entry from <url>",
  "generate a content entry", "turn this video/activity/post into a blog
  post", or pastes a social URL and asks for a post for their blog.
---

# Blog Content Entry Generator

Generate one post object from a social URL and **append it to the `posts`
array in `data/content.json`** of the user's Next.js blog
(xianvalencia.github.io project), plus save a matching SVG cover image into
`public/images/posts/`.

First locate the blog project: a folder containing `data/content.json` and
`app/` in the connected folder(s). If it isn't accessible, ask the user to
connect it — and offer the fallback of printing the JSON for manual pasting.

## Inputs

A URL from one of: YouTube (video/short), Strava (activity), Instagram (post/reel),
Facebook (post/video). If no URL was given, ask for one.

## Step 1 — Fetch caption/description

Identify the platform from the URL, then:

- **YouTube**: fetch `https://www.youtube.com/oembed?url=<URL>&format=json`
  for `title` and `author_name`; also fetch the video page and read the
  `og:description` meta tag for the description. Extract the video ID from the
  URL (`v=` param, `youtu.be/<id>`, or `/shorts/<id>`).
- **Strava**: fetch the activity page and read `og:title` / `og:description`
  (contains distance, time, pace when public). Extract the activity ID from
  `strava.com/activities/<id>`.
- **Instagram / Facebook**: fetch the page and try `og:title` / `og:description`.
  These platforms usually block anonymous fetches — if nothing useful comes
  back, ask the user to paste the caption instead of guessing.

If any fetch fails or returns a login wall, ask the user for the caption and
(for Strava) the activity stats. Never invent stats.

## Step 2 — Build the entry

Follow this schema exactly (it must match the existing objects in
`data/content.json`):

```json
{
  "slug": "kebab-case-from-title",
  "title": "Post title",
  "date": "YYYY-MM-DD (today, unless the user says otherwise)",
  "tags": ["three-to-four", "lowercase-kebab", "tags"],
  "excerpt": "1–2 sentence hook.",
  "readingTime": "N min",
  "cover": "/images/posts/<slug>.svg",
  "body": ["paragraph 1", "paragraph 2", "..."],
  "embeds": [ { ...platform embed object... } ]
}
```

Field rules:

- **title** — derive from the fetched title/caption; punch it up to fit the
  blog's fitness × software-engineering voice. Not clickbait.
- **slug** — kebab-case of the title, short, no stop-word soup.
- **tags** — 3–4 lowercase kebab-case tags inferred from the content
  (e.g. `running`, `nextjs`, `vlog`, `marathon`, `strava-api`). Reuse tags
  already common on the blog when they fit.
- **excerpt** — the fetched caption, tightened to 1–2 sentences. This is the
  card teaser on the homepage.
- **body** — expand the caption into 3–4 blog-style paragraphs (each one array
  element) in the site's voice: first-person, warm, wry humor that maps
  running onto engineering (sprints, deploys, postmortems, uptime) without
  overdoing the metaphor. The caption's facts are the source of truth — expand
  tone and context, never fabricate events, numbers, or results.
- **readingTime** — total body word count ÷ 200 wpm, rounded up, min 1 →
  `"N min"`.

## Step 3 — Embed object

Add exactly one embed for the source URL, by platform:

```json
{ "type": "youtube", "title": "...", "videoId": "<id>" }

{ "type": "strava", "title": "...", "activityId": "<id>",
  "embedId": "pending",
  "stats": { "distance": "…", "time": "…", "pace": "…", "elevation": "…" } }

{ "type": "instagram", "title": "...", "url": "<original URL>" }

{ "type": "facebook", "title": "...", "url": "<original URL>" }
```

Strava stats come from the fetched og:description or from the user — omit any
stat you don't actually have. For instagram/facebook, remind the user that
`components/Embed.jsx` only renders `youtube` and `strava` today, and offer to
add the missing cases to the component.

## Step 4 — Cover image (themed SVG)

Create `<slug>.svg` and save it to `public/images/posts/<slug>.svg` in the
blog project. Match the blog's existing covers:

- `viewBox="0 0 640 360"`, background `#10161d`
- Palette: green `#00ff88`, orange `#ff6b35`, dim text `#7d8fa3`,
  light text `#d8e2ec`, borders `#223040`, surfaces `#151d26`,
  Strava orange `#fc4c02`, YouTube red `#ff0000`
- Monospace `font-family="monospace"` text styled like terminal output —
  a `$ command` line, log lines, or a chart/graph motif relevant to the post
  (route polyline for runs, play button for videos, bars for stats)
- Keep it hand-drawn simple: a handful of shapes and text, no gradients/filters

## Step 5 — Append to content.json

1. Read `data/content.json`, prepend the new entry to the **front** of the
   `posts` array (newest first), and write it back. Preserve the existing
   structure and formatting (2-space indent); touch nothing outside `posts`.
   If an entry with the same slug already exists, ask before overwriting.
2. Validate: run `node -e "JSON.parse(require('fs').readFileSync('data/content.json'))"`
   (or equivalent) to confirm the file is still valid JSON. If the project's
   dependencies are installed, optionally offer a `next build` check.
3. Show the user the entry that was added (code block), confirm the cover was
   saved to `public/images/posts/<slug>.svg`, and remind them to commit and
   push to deploy. Nothing else — no long recap.