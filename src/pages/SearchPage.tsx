import React from "react";
import Input from "../components/Input";
import {
  searchSongs,
  type Track,
  searchAlbums,
  type Album,
  getTopSongs,
  getTopAlbums,
} from "../api/songs";
import SongCard from "../components/SongCard";
import AlbumCard from "../components/AlbumCard";

const PAGE_SIZE = 10;

const SearchPage: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const [mode, setMode] = React.useState<"songs" | "albums">("songs");
  const [layout, setLayout] = React.useState<"list" | "grid">("list");
  const [resultsSongs, setResultsSongs] = React.useState<Track[]>([]);
  const [resultsAlbums, setResultsAlbums] = React.useState<Album[]>([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const q = query.trim();
    let cancelled = false;
    const controller = new AbortController();
    setError(null);

    async function load() {
      setLoading(true);
      try {
        if (!q) {
          try {
            if (mode === "songs") {
              const data = await getTopSongs({
                signal: controller.signal,
                limit: 60,
              });
              if (!cancelled) setResultsSongs(data);
            } else {
              const data = await getTopAlbums({
                signal: controller.signal,
                limit: 60,
              });
              if (!cancelled) setResultsAlbums(data);
            }
            if (!cancelled) setPage(1);
            return;
          } catch {
            // Fallback: use iTunes Search API with a common term to avoid CORS/network issues on charts
            if (mode === "songs") {
              const data = await searchSongs("the", {
                signal: controller.signal,
                limit: 60,
              });
              if (!cancelled) setResultsSongs(data);
            } else {
              const data = await searchAlbums("the", {
                signal: controller.signal,
                limit: 60,
              });
              if (!cancelled) setResultsAlbums(data);
            }
            if (!cancelled) setPage(1);
            return;
          }
        }

        // With query
        if (mode === "songs") {
          const data = await searchSongs(q, {
            signal: controller.signal,
            limit: 60,
          });
          if (!cancelled) setResultsSongs(data);
        } else {
          const data = await searchAlbums(q, {
            signal: controller.signal,
            limit: 60,
          });
          if (!cancelled) setResultsAlbums(data);
        }
        if (!cancelled) setPage(1);
      } catch (e: any) {
        if (!cancelled) {
          if (q) setError(e?.message ?? "Search failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = setTimeout(load, q ? 500 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, mode]);

  const items = mode === "songs" ? resultsSongs : resultsAlbums;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);

  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function goNext() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-2">
      <div className="pointer-events-none mx-auto mb-4 h-1 w-full bg-gradient-to-r from-blue-500/30 via-blue-400/30 to-cyan-400/30" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              type="button"
              className={`px-3 py-1.5 text-sm rounded-md ${
                mode === "songs"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setMode("songs")}
            >
              Songs
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm rounded-md ${
                mode === "albums"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setMode("albums")}
            >
              Albums
            </button>
          </div>
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              type="button"
              className={`px-3 py-1.5 text-sm rounded-md ${
                layout === "list"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setLayout("list")}
            >
              List
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm rounded-md ${
                layout === "grid"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setLayout("grid")}
            >
              Grid
            </button>
          </div>
        </div>
        <Input
          placeholder={
            mode === "songs"
              ? "Search songs (free iTunes API)..."
              : "Search albums (free iTunes API)..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={mode === "songs" ? "Search songs" : "Search albums"}
        />
      </div>

      {loading && <p className="mt-4 text-sm text-gray-500">Searching...</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && query && items.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">No results</p>
      )}

      {!loading && !error && !query && items.length > 0 && (
        <p className="mt-4 text-xl text-gray-600">
          Look at top {mode} (Apple Music charts)
        </p>
      )}

      <div
        className={`mt-6 grid gap-4 ${
          layout === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {mode === "songs"
          ? (pageItems as Track[]).map((t) => (
              <SongCard key={t.idTrack} track={t} />
            ))
          : (pageItems as Album[]).map((a) => (
              <AlbumCard key={a.idAlbum} album={a} />
            ))}
      </div>

      {items.length > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-between">
          <button
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={goPrev}
            disabled={page === 1}
          >
            Previous
          </button>
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <button
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={goNext}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
