import React from "react";
import type { Track } from "../api/songs";
import { fetchLyrics } from "../api/songs";
import { Link } from "react-router-dom";

type SongCardProps = {
  track: Track;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export const SongCard: React.FC<SongCardProps> = ({ track }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [lyrics, setLyrics] = React.useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = React.useState(false);
  const [lyricsError, setLyricsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    if (expanded && lyrics === null && !lyricsLoading) {
      setLyricsLoading(true);
      setLyricsError(null);
      fetchLyrics(track.strArtist, track.strTrack)
        .then((text) => {
          if (!cancelled) setLyrics(text);
        })
        .catch((e: any) => {
          if (!cancelled) setLyricsError(e?.message ?? "Failed to load lyrics");
        })
        .finally(() => {
          if (!cancelled) setLyricsLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [expanded, lyrics, lyricsLoading, track.strArtist, track.strTrack]);

  const meta = [track.strAlbum, track.releaseYear, track.genre]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="card hover-lift relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500/30 via-blue-400/30 to-cyan-400/30" />
      <div className="flex gap-4 p-4">
        <Link to={`/song/${track.idTrack}`} className="block">
          {track.artwork ? (
            <img
              src={track.artwork}
              alt={track.strTrack}
              className="h-20 w-20 shrink-0 rounded object-cover"
            />
          ) : (
            <div className="h-20 w-20 shrink-0 rounded bg-gray-100" />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              <Link to={`/song/${track.idTrack}`} className="hover:underline">
                {track.strTrack}
              </Link>
            </h3>
            {track.explicit && (
              <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-700">
                Explicit
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">{track.strArtist}</p>
          {meta && <p className="mt-1 text-xs text-gray-500">{meta}</p>}

          {track.previewUrl && (
            <audio
              className="mt-3 w-full"
              controls
              preload="none"
              src={track.previewUrl}
            />
          )}
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="flex items-center justify-between px-4 py-2">
          {track.collectionId ? (
            <Link
              to={`/album/${track.collectionId}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View album
            </Link>
          ) : (
            <span />
          )}
          <button
            type="button"
            className={cn(
              "px-2 py-1 text-sm font-medium rounded-md",
              "hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            )}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide lyrics" : "Show lyrics"}
          </button>
        </div>
        {expanded && (
          <div className="px-4 pb-4">
            {lyricsLoading && (
              <p className="text-sm text-gray-600">Loading lyrics…</p>
            )}
            {lyricsError && (
              <p className="text-sm text-red-600">{lyricsError}</p>
            )}
            {!lyricsLoading && !lyricsError && (
              <pre className="whitespace-pre-wrap text-sm text-gray-900 max-h-64 overflow-auto">
                {lyrics ?? "Lyrics not available."}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongCard;
