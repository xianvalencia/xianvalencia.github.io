// Data access layer.
// Today this reads from a local dummy JSON file. When you move to a dynamic
// resource (CMS, API, database), replace the internals of these functions —
// every page and component goes through here, so nothing else changes.
import content from '@/data/content.json';
import { getYtdStats } from './strava';

const CODING_START = new Date('2010-06-01');

function yearsOfCoding() {
  const ms = Date.now() - CODING_START.getTime();
  return `${Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25))}+`;
}

export async function getProfile() {
  const ytd = await getYtdStats();

  return {
    ...content.profile,
    stats: content.profile.stats.map((stat) => {
      if (stat.icon === 'terminal') return { ...stat, value: yearsOfCoding() };
      if (stat.icon === 'run') return { ...stat, value: ytd?.runKm ?? stat.value };
      if (stat.icon === 'bike') return { ...stat, value: ytd?.rideKm ?? stat.value };
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
