import React from "react";
import { useParams, Link } from "react-router-dom";
import { fetchLyrics, lookupTrack, type Track } from "../api/songs";

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="text-sm"><span className="text-gray-500">{label}: </span><span className="text-gray-900">{value}</span></div>
  );
}

const SongDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [track, setTrack] = React.useState<Track | null>(null);
  const [lyrics, setLyrics] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function run() {
      try {
        setLoading(true);
        const t = await lookupTrack(id!, { signal: controller.signal });
        if (cancelled) return;
        setTrack(t);
        if (t) {
          const lyr = await fetchLyrics(t.strArtist, t.strTrack);
          if (!cancelled) setLyrics(lyr);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load song");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id]);

  if (loading) return <div className="p-6 text-gray-700">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!track) return <div className="p-6 text-gray-700">Not found</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link to="/" className="text-sm text-blue-600 hover:underline">← Back to search</Link>
      <div className="relative mt-4 grid grid-cols-[auto,1fr] gap-6">
        <div className="pointer-events-none absolute inset-x-0 -top-2 h-1 bg-gradient-to-r from-blue-500/30 via-blue-400/30 to-cyan-400/30" />
        {track.artwork ? (
          <img src={track.artwork} alt={track.strTrack} className="h-48 w-48 rounded-xl object-cover shadow-sm" />
        ) : (
          <div className="h-48 w-48 rounded-xl bg-gray-100" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{track.strTrack}</h1>
          <p className="text-base text-gray-700">{track.strArtist}</p>
          <div className="mt-2 space-y-1 text-gray-700">
            <InfoRow label="Album" value={track.strAlbum} />
            <InfoRow label="Year" value={track.releaseYear} />
            <InfoRow label="Genre" value={track.genre} />
          </div>
          {track.previewUrl && (
            <audio className="mt-4 w-full" controls preload="none" src={track.previewUrl} />
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900">Lyrics</h2>
        <div className="mt-2 card p-4">
          {lyrics ? (
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-sm text-gray-900">
              {lyrics}
            </pre>
          ) : (
            <div>
              <div className="text-sm text-gray-800">Lyrics not available.</div>
              {track && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(() => {
                    const q = encodeURIComponent(`${track.strArtist} ${track.strTrack} lyrics`);
                    const links = [
                      { name: 'Google', href: `https://www.google.com/search?q=${q}` },
                      { name: 'DuckDuckGo', href: `https://duckduckgo.com/?q=${q}` },
                      { name: 'Genius', href: `https://genius.com/search?q=${q}` },
                      { name: 'AZLyrics', href: `https://search.azlyrics.com/search.php?q=${q}` },
                    ];
                    return links.map((l) => (
                      <a
                        key={l.name}
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        title={`Search on ${l.name}`}
                      >
                        Search on {l.name}
                      </a>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {track.collectionId && (
        <div className="mt-6">
          <Link
            className="text-sm text-blue-600 hover:underline"
            to={`/album/${track.collectionId}`}
          >
            View album details →
          </Link>
        </div>
      )}
    </div>
  );
};

export default SongDetails;
