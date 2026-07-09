import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, getPosts } from '@/lib/content';
import Embed from '@/components/Embed';
import Reveal from '@/components/Reveal';

// Pre-render one static page per post in the JSON.
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="container">
      <header className="post-header">
        <Link href="/" className="back-link">
          ← cd ~/blog
        </Link>
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span>{post.date}</span>
          <span>{post.readingTime}</span>
        </div>
        <div className="tags" style={{ marginTop: '0.8rem' }}>
          {post.tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      </header>

      <div className="post-body">
        {post.body.map((paragraph, i) => (
          <Reveal key={i}>
            <p>{paragraph}</p>
          </Reveal>
        ))}

        {post.embeds.map((embed, i) => (
          <Reveal key={i}>
            <Embed embed={embed} />
          </Reveal>
        ))}
      </div>
    </article>
  );
}
