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

- **Strava**: use the Strava API (not the public webpage) to get full activity
  data. Follow these steps exactly:

  1. Extract the activity ID from `strava.com/activities/<id>`.
  2. Read credentials from the project's `.env` file:
     ```bash
     grep STRAVA_ /path/to/project/.env
     ```
     You need: `STRAVA_REFRESH_TOKEN`, `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`.
  3. Exchange the refresh token for a fresh access token — do this every time,
     do not rely on any stored access token:
     ```bash
     curl -s -X POST https://www.strava.com/oauth/token \
       -d "client_id=$STRAVA_CLIENT_ID" \
       -d "client_secret=$STRAVA_CLIENT_SECRET" \
       -d "grant_type=refresh_token" \
       -d "refresh_token=$STRAVA_REFRESH_TOKEN"
     ```
     Parse `access_token` and `refresh_token` from the response. Write the new
     `STRAVA_REFRESH_TOKEN` value back into `.env` (Strava rotates it on each
     use). Do not write `access_token` to `.env` — it is ephemeral and used
     only for the next step.
  4. Fetch the activity using the fresh access token:
     ```bash
     curl -s -H "Authorization: Bearer <fresh_access_token>" \
       "https://www.strava.com/api/v3/activities/<id>"
     ```
  5. Parse the JSON response. Extract and convert:
     - **name** → activity title
     - **start_date** → `YYYY-MM-DD` (use as post date unless user says otherwise)
     - **sport_type** → e.g. `"Run"`, `"Ride"` (determines pace vs. speed)
     - **distance** (meters) → km: `round(distance / 1000, 2)` → `"X.XX km"`
     - **moving_time** (seconds) → `HH:MM:SS`
     - **total_elevation_gain** (meters) → `"X m"`
     - For **runs** — compute pace: `moving_time / (distance / 1000)` seconds/km
       → format as `"M:SS /km"`
     - For **rides** — compute avg speed: `(distance / moving_time) * 3.6`
       → format as `"X.X km/h"`
     - Include **calories** if present in the response.

- **Instagram / Facebook**: fetch the page and try `og:title` / `og:description`.
  These platforms usually block anonymous fetches — if nothing useful comes
  back, ask the user to paste the caption instead of guessing.

If any fetch fails, ask the user for the missing data. Never invent stats.

## Step 2 — Build the entry

Follow this schema exactly (it must match the existing objects in
`data/content.json`):

```json
{
  "slug": "kebab-case-from-title",
  "title": "Post title",
  "date": "YYYY-MM-DD (from API for Strava; today otherwise)",
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
  overdoing the metaphor. The API data's facts are the source of truth —
  expand tone and context, never fabricate events, numbers, or results.
- **readingTime** — total body word count ÷ 200 wpm, rounded up, min 1 →
  `"N min"`.

## Step 3 — Embed object

Add exactly one embed per source URL, by platform:

```json
{ "type": "youtube", "title": "...", "videoId": "<id>" }

{ "type": "strava", "title": "...", "activityId": "<id>",
  "embedId": "<id>",
  "stats": { "distance": "…", "time": "…", "pace": "… /km", "elevation": "… m" } }

{ "type": "instagram", "title": "...", "url": "<original URL>" }

{ "type": "facebook", "title": "...", "url": "<original URL>" }
```

For Strava, populate all `stats` fields from the API response — no placeholders.
Use `"pace"` key for runs and `"speed"` key for rides.

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
