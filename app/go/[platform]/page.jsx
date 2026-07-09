import { notFound } from 'next/navigation';
import { getSocial, getSocials } from '@/lib/content';
import SocialRedirect from '@/components/SocialRedirect';

// Pre-render /go/strava/, /go/facebook/, /go/instagram/, /go/youtube/
export async function generateStaticParams() {
  const socials = await getSocials();
  return socials.map((s) => ({ platform: s.platform }));
}

export async function generateMetadata({ params }) {
  const { platform } = await params;
  const social = await getSocial(platform);
  if (!social) return {};
  return {
    title: `→ ${social.label}`,
    robots: { index: false },
  };
}

export default async function GoPage({ params }) {
  const { platform } = await params;
  const social = await getSocial(platform);
  if (!social) notFound();

  return <SocialRedirect label={social.label} url={social.url} color={social.color} />;
}
