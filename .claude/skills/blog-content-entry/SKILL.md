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

- **YouTube**: use the YouTube Data API v3 to retrieve full video metadata.
  Follow these steps exactly:

  1. Extract the video ID from the URL:
     - `youtube.com/watch?v=<id>` → use `v=` param
     - `youtu.be/<id>` → path segment after the domain
     - `youtube.com/shorts/<id>` → path segment after `/shorts/`
  2. Read `YOUTUBE_API_KEY` from the project's `.env` file.
  3. Fetch video details:
     ```bash
     curl -s "https://www.googleapis.com/youtube/v3/videos\
?id=<video_id>&key=$YOUTUBE_API_KEY&part=snippet"
     ```
  4. Parse `items[0].snippet` from the response. Extract:
     - `title` → video title
     - `description` → full video description (use as body source)
     - `publishedAt` → post date (`YYYY-MM-DD`, strip the time component)
     - `tags` → array of hashtags (use to help pick blog tags)

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
     - **start_date_local** → `YYYY-MM-DD` (strip the time component). This is
       the **event date** — the calendar day the race/ride actually happened
       in the athlete's local timezone. Use `start_date_local`, not the UTC
       `start_date`, since a late-night/early-morning gun start can land on a
       different UTC day than the local race day.
     - **sport_type** → e.g. `"Run"`, `"Ride"` (determines pace vs. speed)
     - **distance** (meters) → km: `round(distance / 1000, 2)` → `"X.XX km"`
     - **moving_time** (seconds) → `HH:MM:SS`
     - **total_elevation_gain** (meters) → `"X m"`
     - For **runs** — compute pace: `moving_time / (distance / 1000)` seconds/km
       → format as `"M:SS /km"`
     - For **rides** — compute avg speed: `(distance / moving_time) * 3.6`
       → format as `"X.X km/h"`
     - Include **calories** if present in the response.

- **Facebook**: attempt the Graph API with the app token, fall back to asking
  the user. Follow these steps exactly:

  1. Read `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` from the project's `.env`.
  2. If the URL is a short share link (`facebook.com/share/v/...`), follow
     the redirect to extract the canonical video/reel ID:
     ```bash
     curl -sI -L "<share_url>" | grep -i "location:" | tail -1
     ```
     The canonical URL will be in the form `facebook.com/reel/<id>/` or
     `facebook.com/<user>/videos/<id>/`. Parse the numeric ID.
     For direct URLs (`facebook.com/reel/<id>` or `facebook.com/watch/?v=<id>`),
     extract the ID directly.
  3. Try fetching video details with the app token:
     ```bash
     curl -s "https://graph.facebook.com/v21.0/<video_id>\
?fields=title,description,created_time&access_token=<FACEBOOK_APP_ID>|<FACEBOOK_APP_SECRET>"
     ```
  4. If the API returns a permissions error (personal profile reels and videos
     are not accessible via app token — Meta's `user_videos` permission requires
     formal app review and is unavailable for standard apps), **ask the user to
     paste the caption**. Note why the API couldn't fetch it so they understand
     it's a platform limitation, not a bug.

- **Instagram**: use the Instagram Basic Display API via Facebook credentials.
  Follow these steps exactly:

  1. Read credentials from the project's `.env` file:
     `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `INSTAGRAM_ACCESS_TOKEN`.

  2. **If `INSTAGRAM_ACCESS_TOKEN` is missing from `.env`**, a one-time OAuth
     setup is required. Tell the user to complete these steps, then re-run:

     a. Open this URL in a browser (replace values):
        ```
        https://api.instagram.com/oauth/authorize
          ?client_id=<FACEBOOK_APP_ID>
          &redirect_uri=https://localhost
          &scope=user_profile,user_media
          &response_type=code
        ```
     b. Authorize the app. The browser will redirect to
        `https://localhost?code=<auth_code>#_` — copy everything between
        `code=` and `#_`.
     c. Exchange the code for a short-lived token:
        ```bash
        curl -X POST https://api.instagram.com/oauth/access_token \
          -F "client_id=<FACEBOOK_APP_ID>" \
          -F "client_secret=<FACEBOOK_APP_SECRET>" \
          -F "grant_type=authorization_code" \
          -F "redirect_uri=https://localhost" \
          -F "code=<auth_code>"
        ```
     d. Exchange that for a long-lived token (valid 60 days):
        ```bash
        curl -s "https://graph.instagram.com/access_token\
?grant_type=ig_exchange_token\
&client_id=<FACEBOOK_APP_ID>\
&client_secret=<FACEBOOK_APP_SECRET>\
&access_token=<short_lived_token>"
        ```
     e. Write the `access_token` from the response to `.env` as
        `INSTAGRAM_ACCESS_TOKEN=<value>`.

  3. **Refresh the token** every time it is used (resets the 60-day clock):
     ```bash
     curl -s "https://graph.instagram.com/refresh_access_token\
?grant_type=ig_refresh_token&access_token=$INSTAGRAM_ACCESS_TOKEN"
     ```
     Write the new `access_token` value back to `.env` as
     `INSTAGRAM_ACCESS_TOKEN`.

  4. List the user's recent media to find the matching post:
     ```bash
     curl -s "https://graph.instagram.com/v21.0/me/media\
?fields=id,caption,media_type,timestamp,permalink\
&access_token=$INSTAGRAM_ACCESS_TOKEN"
     ```
     Match the result whose `permalink` contains the shortcode from the
     given Instagram URL. If not found in the first page, follow the
     `paging.next` cursor and repeat until found or exhausted.

  5. Extract `caption` (use as body source), `timestamp` (use as post date),
     and `media_type` (`IMAGE`, `VIDEO`, `CAROUSEL_ALBUM`, `REELS`).

If any fetch fails, ask the user for the missing data. Never invent stats.

**Multi-source date precedence**: a post may combine a Strava activity with a
recap video/photo (YouTube, Instagram, Facebook) published days or weeks
later. The `date` field must always represent the **event date** — when the
underlying race/ride happened — never the recap's publish date. When a
Strava embed is present, its `start_date_local` always wins as the `date`,
regardless of how much later the video/post went up. Only fall back to the
video/post's own timestamp when there is no Strava embed at all.

## Step 2 — Build the entry

Follow this schema exactly (it must match the existing objects in
`data/content.json`):

```json
{
  "slug": "kebab-case-from-title",
  "title": "Post title",
  "date": "YYYY-MM-DD (event date — see Multi-source date precedence)",
  "tags": ["three-to-four", "lowercase-kebab", "tags"],
  "excerpt": "1–2 sentence hook.",
  "readingTime": "N min",
  "cover": "/images/posts/<slug>.svg",
  "body": ["paragraph 1", "paragraph 2", "..."],
  "embeds": [ { ...platform embed object... } ]
}
```

Field rules:

- **title** — derive from the fetched title/caption and reframe it as a
  software engineering pun or metaphor. The pun should feel natural, not
  forced — map a real detail from the activity or event onto a coding concept.
  Good sources: error codes (404, 500, NullPointer), git commands, deployment
  terms (push to production, merge, rollback), runtime concepts (infinite loop,
  stack overflow, recursion), debugging metaphors, CLI commands. The activity
  facts come first; the pun frames them. Not clickbait.
- **date** — the event date (`YYYY-MM-DD`), per the Multi-source date
  precedence rule above: Strava `start_date_local` if a Strava embed exists,
  otherwise the source post/video's own publish timestamp, otherwise today.
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

1. Read `data/content.json`, add the new entry to the `posts` array, then
   sort the entire array by `date` (the event date) descending (newest first)
   before writing it back. Preserve the existing structure and formatting
   (2-space indent); touch nothing outside `posts`. If an entry with the same
   slug already exists, ask before overwriting.
2. Validate: run `node -e "JSON.parse(require('fs').readFileSync('data/content.json'))"`
   (or equivalent) to confirm the file is still valid JSON. If the project's
   dependencies are installed, optionally offer a `next build` check.
3. Show the user the entry that was added (code block), confirm the cover was
   saved to `public/images/posts/<slug>.svg`, and remind them to commit and
   push to deploy. Nothing else — no long recap.
