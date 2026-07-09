const TOKEN_URL = 'https://www.strava.com/oauth/token';
const API_BASE = 'https://www.strava.com/api/v3';

async function getAccessToken() {
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env;
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) return null;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: STRAVA_REFRESH_TOKEN,
    }),
  });
  const data = await res.json();
  return data.access_token ?? null;
}

export async function getYtdStats() {
  try {
    const token = await getAccessToken();
    if (!token) return null;

    const athleteRes = await fetch(`${API_BASE}/athlete`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { id } = await athleteRes.json();

    const statsRes = await fetch(`${API_BASE}/athletes/${id}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const stats = await statsRes.json();

    const fmt = (meters) => `${(meters / 1000).toFixed(2)}km`;
    return {
      runKm: fmt(stats.ytd_run_totals?.distance ?? 0),
      rideKm: fmt(stats.ytd_ride_totals?.distance ?? 0),
    };
  } catch {
    return null;
  }
}
