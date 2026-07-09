import Link from 'next/link';

export default function PostCard({ post }) {
  return (
    <article className="post-card">
      <Link href={`/blog/${post.slug}/`}>
        <img className="cover" src={post.cover} alt="" />
        <div className="body">
          <div className="post-meta">
            <span>{post.date}</span>
            <span>{post.readingTime}</span>
          </div>
          <h3>{post.title}</h3>
          <p className="excerpt">{post.excerpt}</p>
          <div className="tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
