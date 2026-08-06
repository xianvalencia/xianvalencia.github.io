import strava from 'strava-v3';

export async function getYtdStats() {
  try {
    const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env;
    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) return null;

    strava.config({ client_id: STRAVA_CLIENT_ID, client_secret: STRAVA_CLIENT_SECRET });
    const { access_token } = await strava.oauth.refreshToken(STRAVA_REFRESH_TOKEN);
    strava.config({ access_token });

    const athlete = await strava.athlete.get({});
    const stats = await strava.athletes.stats({ id: athlete.id });

    const fmt = (meters) => `${(meters / 1000).toFixed(2)}km`;
    return {
      runKm: fmt(stats.ytd_run_totals?.distance ?? 0),
      rideKm: fmt(stats.ytd_ride_totals?.distance ?? 0),
    };
  } catch {
    return null;
  }
}
