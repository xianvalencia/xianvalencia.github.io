#!/usr/bin/env node
// Refreshes the Strava access token and fetches every activity in a date
// range, writing the raw API results to data/activities.json.
//
// Usage: node scripts/fetch-strava-activities.js [afterISO] [beforeISO]
// Defaults to 2025-07-19T00:00:00+08:00 through now.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');
const OUTPUT_PATH = path.join(ROOT, 'data', 'activities.json');
const PER_PAGE = 200;

function loadEnv() {
  const raw = fs.readFileSync(ENV_PATH, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

function writeEnvValue(key, value) {
  const raw = fs.readFileSync(ENV_PATH, 'utf8');
  const lines = raw.split('\n');
  const idx = lines.findIndex((line) => line.startsWith(`${key}=`));
  if (idx !== -1) lines[idx] = `${key}=${value}`;
  else lines.push(`${key}=${value}`);
  fs.writeFileSync(ENV_PATH, lines.join('\n'));
}

async function refreshAccessToken(env) {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: env.STRAVA_REFRESH_TOKEN,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);

  const data = await res.json();
  writeEnvValue('STRAVA_REFRESH_TOKEN', data.refresh_token);
  return data.access_token;
}

async function fetchActivitiesPage(accessToken, afterEpoch, beforeEpoch, page) {
  const url = new URL('https://www.strava.com/api/v3/athlete/activities');
  url.searchParams.set('after', afterEpoch);
  url.searchParams.set('before', beforeEpoch);
  url.searchParams.set('page', page);
  url.searchParams.set('per_page', PER_PAGE);

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Activities fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchAllActivities(accessToken, afterEpoch, beforeEpoch) {
  const activities = [];
  for (let page = 1; ; page += 1) {
    const batch = await fetchActivitiesPage(accessToken, afterEpoch, beforeEpoch, page);
    if (batch.length === 0) break;
    activities.push(...batch);
    if (batch.length < PER_PAGE) break;
  }
  return activities;
}

async function main() {
  const [afterISO = '2025-07-19T00:00:00+08:00', beforeISO] = process.argv.slice(2);
  const after = Math.floor(new Date(afterISO).getTime() / 1000);
  const before = Math.floor((beforeISO ? new Date(beforeISO) : new Date()).getTime() / 1000);

  const env = loadEnv();
  const accessToken = await refreshAccessToken(env);
  const activities = await fetchAllActivities(accessToken, after, before);

  activities.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(activities, null, 2)}\n`);

  console.log(`Wrote ${activities.length} activities (${afterISO} → now) to ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
