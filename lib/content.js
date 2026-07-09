// Data access layer.
// Today this reads from a local dummy JSON file. When you move to a dynamic
// resource (CMS, API, database), replace the internals of these functions —
// every page and component goes through here, so nothing else changes.
import content from '@/data/content.json';
import { getYtdStats } from './strava';

export async function getProfile() {
  const ytd = await getYtdStats();
  if (!ytd) return content.profile;

  return {
    ...content.profile,
    stats: content.profile.stats.map((stat) => {
      if (stat.icon === 'run') return { ...stat, value: ytd.runKm };
      if (stat.icon === 'bike') return { ...stat, value: ytd.rideKm };
      return stat;
    }),
  };
}

export async function getSocials() {
  return content.socials;
}

export async function getSocial(platform) {
  return content.socials.find((s) => s.platform === platform) ?? null;
}

export async function getPosts() {
  return [...content.posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(slug) {
  return content.posts.find((p) => p.slug === slug) ?? null;
}
