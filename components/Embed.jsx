// Renders a social embed from the JSON `embeds` array by type.
// Add new embed types (instagram, facebook, tiktok…) as new cases here.
export default function Embed({ embed }) {
  switch (embed.type) {
    case 'youtube':
      return (
        <figure className="embed">
          <figcaption className="embed-title">{embed.title}</figcaption>
          <div className="embed-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${embed.videoId}`}
              title={embed.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </figure>
      );

    case 'strava':
      // Dummy-data activity card. When real Strava embed IDs are available,
      // swap this for the official embed:
      // <div class="strava-embed-placeholder" data-embed-type="activity"
      //      data-embed-id={embed.embedId} /> + https://strava-embeds.com/embed.js
      return (
        <figure className="embed">
          <figcaption className="embed-title">{embed.title}</figcaption>
          <div className="strava-card">
            <div className="strava-head">
              <span className="strava-brand">STRAVA</span>
              <a
                href={`https://www.strava.com/activities/${embed.activityId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                view activity →
              </a>
            </div>
            <div className="strava-stats">
              {Object.entries(embed.stats).map(([label, value]) => (
                <div key={label}>
                  <div className="value">{value}</div>
                  <div className="label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </figure>
      );

    case 'facebook':
      return (
        <figure className="embed">
          <figcaption className="embed-title">{embed.title}</figcaption>
          <div className="embed-frame">
            <iframe
              src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(embed.url)}&show_text=0&width=640`}
              title={embed.title}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </figure>
      );

    default:
      return null;
  }
}
