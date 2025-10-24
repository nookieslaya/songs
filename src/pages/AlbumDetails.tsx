import React from "react";
import { useParams, Link } from "react-router-dom";
import { lookupAlbum, type AlbumDetails } from "../api/songs";

const msToTime = (ms?: number) => {
  if (!ms) return undefined;
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const AlbumDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = React.useState<AlbumDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function run() {
      try {
        setLoading(true);
        const a = await lookupAlbum(id!, { signal: controller.signal });
        if (!cancelled) setAlbum(a);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load album");
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
  if (!album) return <div className="p-6 text-gray-700">Not found</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link to="/" className="text-sm text-blue-600 hover:underline">← Back to search</Link>

      <div className="relative mt-4 grid grid-cols-[auto,1fr] gap-6">
        <div className="pointer-events-none absolute inset-x-0 -top-2 h-1 bg-gradient-to-r from-blue-500/30 via-blue-400/30 to-cyan-400/30" />
        {album.artwork ? (
          <img src={album.artwork} alt={album.strAlbum} className="h-48 w-48 rounded-xl object-cover shadow-sm" />
        ) : (
          <div className="h-48 w-48 rounded-xl bg-gray-100" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{album.strAlbum}</h1>
          <p className="text-base text-gray-700">{album.strArtist}</p>
          <p className="mt-1 text-sm text-gray-600">
            {[album.intYearReleased, album.strGenre].filter(Boolean).join(" • ")}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900">Tracks</h2>
        <ol className="mt-2 card divide-y divide-gray-200">
          {album.tracks.map((t) => (
            <li key={t.idTrack} className="grid grid-cols-[auto,1fr,auto] items-center gap-3 p-3">
              <div className="w-6 text-right text-xs text-gray-500">{t.trackNumber ?? ''}</div>
              <div className="min-w-0">
                <p className="truncate text-sm text-gray-900">{t.strTrack}</p>
                <p className="text-xs text-gray-500">{msToTime(t.durationMs)}</p>
              </div>
              {t.previewUrl ? (
                <audio className="h-8" controls preload="none" src={t.previewUrl} />
              ) : (
                <div />
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default AlbumDetailsPage;
