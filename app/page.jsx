// Home page — a server component. Data is fetched on the server (at build
// time with static export; at request time if deployed with SSR).
import { getProfile, getPosts } from '@/lib/content';
import PostCard from '@/components/PostCard';
import TypeWriter from '@/components/TypeWriter';
import Reveal from '@/components/Reveal';

export default async function HomePage() {
  const [profile, posts] = await Promise.all([getProfile(), getPosts()]);

  return (
    <div className="container">
      <section className="hero">
        <p className="kicker">{profile.location} · {profile.handle}</p>
        <h1>
          {profile.name.split(' ').slice(0, -1).join(' ')}{' '}
          <span className="highlight">{profile.name.split(' ').at(-1)}</span>
        </h1>
        <TypeWriter />
        <p className="bio">{profile.bio}</p>

        <div className="stats">
          {profile.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 90}>
              <div className="stat-card">
                <div className="value">{stat.value}</div>
                <div className="label">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <h2 className="section-title">latest_posts</h2>
      <section className="post-grid">
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={(i % 3) * 90}>
            <PostCard post={post} />
          </Reveal>
        ))}
      </section>
    </div>
  );
}
