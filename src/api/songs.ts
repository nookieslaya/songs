import axios from 'axios';

// iTunes Search API (no key required)
const ITUNES_API_URL = 'https://itunes.apple.com/search';
// Free Apple Music RSS feeds for charts
const APPLE_RSS_BASE = 'https://rss.applemarketingtools.com/api/v2';

export type Album = {
  idAlbum: string;
  strAlbum: string;
  strArtist: string;
  intYearReleased?: string;
  strGenre?: string;
  strAlbumThumb?: string;
};

const cache = new Map<string, { data: Album[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function searchAlbums(
  query: string,
  opts?: { signal?: AbortSignal; limit?: number }
): Promise<Album[]> {
  const q = query?.trim();
  if (!q) return [];

  const now = Date.now();
  const cached = cache.get(q);
  if (cached && now - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  const response = await axios.get(ITUNES_API_URL, {
    params: { term: q, entity: 'album', limit: opts?.limit ?? 50 },
    signal: opts?.signal,
  });

  const results = (response.data?.results ?? []) as any[];
  const albums: Album[] = results.map((r) => ({
    idAlbum: String(r.collectionId),
    strAlbum: r.collectionName,
    strArtist: r.artistName,
    intYearReleased: r.releaseDate ? String(new Date(r.releaseDate).getFullYear()) : undefined,
    strGenre: r.primaryGenreName,
    strAlbumThumb: typeof r.artworkUrl100 === 'string' ? r.artworkUrl100.replace('100x100', '200x200') : undefined,
  }));

  cache.set(q, { data: albums, ts: now });
  return albums;
}

// Track search and lyrics helpers
export type Track = {
  idTrack: string;
  strTrack: string;
  strArtist: string;
  strAlbum?: string;
  collectionId?: string;
  releaseYear?: string;
  genre?: string;
  artwork?: string;
  previewUrl?: string;
  explicit?: boolean;
};

export async function searchSongs(
  query: string,
  opts?: { signal?: AbortSignal; limit?: number }
): Promise<Track[]> {
  const q = query?.trim();
  if (!q) return [];

  const response = await axios.get(ITUNES_API_URL, {
    params: { term: q, entity: 'song', limit: opts?.limit ?? 50 },
    signal: opts?.signal,
  });

  const results = (response.data?.results ?? []) as any[];
  const tracks: Track[] = results.map((r) => ({
    idTrack: String(r.trackId ?? r.collectionId ?? r.artistId),
    strTrack: r.trackName,
    strArtist: r.artistName,
    strAlbum: r.collectionName,
    collectionId: r.collectionId ? String(r.collectionId) : undefined,
    releaseYear: r.releaseDate ? String(new Date(r.releaseDate).getFullYear()) : undefined,
    genre: r.primaryGenreName,
    artwork: typeof r.artworkUrl100 === 'string' ? r.artworkUrl100.replace('100x100', '300x300') : undefined,
    previewUrl: r.previewUrl,
    explicit: r.trackExplicitness === 'explicit',
  }));

  return tracks;
}

export async function fetchLyrics(artist: string, title: string): Promise<string | null> {
  const a = artist?.trim();
  const t = title?.trim();
  if (!a || !t) return null;
  // Try a sequence of free providers. Keep timeouts small to avoid long waits.
  // 1) lyrics.ovh (may be unreliable, but simple)
  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(a)}/${encodeURIComponent(t)}`;
    const res = await axios.get(url, { timeout: 8000 });
    const lyrics = (res.data?.lyrics as string | undefined) ?? null;
    if (lyrics && lyrics.trim()) return lyrics;
  } catch {}

  // 2) Some Random API (free, no key). Query by combined title for better recall.
  try {
    const q = `${a} ${t}`.trim();
    const url = `https://some-random-api.com/lyrics?title=${encodeURIComponent(q)}`;
    const res = await axios.get(url, { timeout: 8000 });
    const lyrics = (res.data?.lyrics as string | undefined) ?? null;
    if (lyrics && lyrics.trim()) return lyrics;
  } catch {}

  // If none succeeded, return null so the UI can offer search links.
  return null;
}

// Top charts (free, no key)
const topCache = new Map<string, { data: any[]; ts: number }>();
const TOP_TTL = 10 * 60 * 1000; // 10 minutes

export async function getTopSongs(
  opts?: { country?: string; limit?: number; signal?: AbortSignal }
): Promise<Track[]> {
  const country = (opts?.country ?? 'us').toLowerCase();
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 100);
  const key = `songs:${country}:${limit}`;
  const now = Date.now();
  const cached = topCache.get(key);
  if (cached && now - cached.ts < TOP_TTL) {
    return cached.data as Track[];
  }
  const url = `${APPLE_RSS_BASE}/${encodeURIComponent(country)}/music/most-played/${limit}/songs.json`;
  const res = await axios.get(url, { signal: opts?.signal });
  const results = (res.data?.feed?.results ?? []) as any[];
  const tracks: Track[] = results.map((r) => ({
    idTrack: String(r.id ?? r.url ?? Math.random()),
    strTrack: r.name,
    strArtist: r.artistName,
    strAlbum: undefined,
    collectionId: undefined,
    releaseYear: r.releaseDate ? String(new Date(r.releaseDate).getFullYear()) : undefined,
    genre: Array.isArray(r.genreNames) ? r.genreNames[0] : undefined,
    artwork: typeof r.artworkUrl100 === 'string' ? r.artworkUrl100.replace('100x100', '300x300') : undefined,
    previewUrl: undefined,
    explicit: r.contentAdvisoryRating === 'Explicit',
  }));
  topCache.set(key, { data: tracks, ts: now });
  return tracks;
}

export async function getTopAlbums(
  opts?: { country?: string; limit?: number; signal?: AbortSignal }
): Promise<Album[]> {
  const country = (opts?.country ?? 'us').toLowerCase();
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 100);
  const key = `albums:${country}:${limit}`;
  const now = Date.now();
  const cached = topCache.get(key);
  if (cached && now - cached.ts < TOP_TTL) {
    return cached.data as Album[];
  }
  const url = `${APPLE_RSS_BASE}/${encodeURIComponent(country)}/music/top-albums/${limit}/albums.json`;
  const res = await axios.get(url, { signal: opts?.signal });
  const results = (res.data?.feed?.results ?? []) as any[];
  const albums: Album[] = results.map((r) => ({
    idAlbum: String(r.id ?? r.url ?? Math.random()),
    strAlbum: r.name,
    strArtist: r.artistName,
    intYearReleased: r.releaseDate ? String(new Date(r.releaseDate).getFullYear()) : undefined,
    strGenre: Array.isArray(r.genreNames) ? r.genreNames[0] : undefined,
    strAlbumThumb: typeof r.artworkUrl100 === 'string' ? r.artworkUrl100.replace('100x100', '200x200') : undefined,
  }));
  topCache.set(key, { data: albums, ts: now });
  return albums;
}

export async function lookupTrack(id: string, opts?: { signal?: AbortSignal }): Promise<Track | null> {
  if (!id) return null;
  const url = 'https://itunes.apple.com/lookup';
  const res = await axios.get(url, { params: { id }, signal: opts?.signal });
  const r = (res.data?.results?.[0] ?? null) as any | null;
  if (!r) return null;
  return {
    idTrack: String(r.trackId ?? id),
    strTrack: r.trackName,
    strArtist: r.artistName,
    strAlbum: r.collectionName,
    collectionId: r.collectionId ? String(r.collectionId) : undefined,
    releaseYear: r.releaseDate ? String(new Date(r.releaseDate).getFullYear()) : undefined,
    genre: r.primaryGenreName,
    artwork: typeof r.artworkUrl100 === 'string' ? r.artworkUrl100.replace('100x100', '600x600') : undefined,
    previewUrl: r.previewUrl,
    explicit: r.trackExplicitness === 'explicit',
  };
}

export type AlbumDetails = {
  idAlbum: string;
  strAlbum: string;
  strArtist: string;
  intYearReleased?: string;
  strGenre?: string;
  artwork?: string;
  tracks: Array<{
    idTrack: string;
    trackNumber?: number;
    strTrack: string;
    previewUrl?: string;
    durationMs?: number;
    explicit?: boolean;
  }>;
};

export async function lookupAlbum(collectionId: string, opts?: { signal?: AbortSignal }): Promise<AlbumDetails | null> {
  if (!collectionId) return null;
  const url = 'https://itunes.apple.com/lookup';
  const res = await axios.get(url, {
    params: { id: collectionId, entity: 'song' },
    signal: opts?.signal,
  });
  const results = (res.data?.results ?? []) as any[];
  if (results.length === 0) return null;
  const collection = results.find((x) => x.wrapperType === 'collection') ?? results[0];
  const tracks = results.filter((x) => x.wrapperType === 'track');
  return {
    idAlbum: String(collection.collectionId ?? collectionId),
    strAlbum: collection.collectionName,
    strArtist: collection.artistName,
    intYearReleased: collection.releaseDate ? String(new Date(collection.releaseDate).getFullYear()) : undefined,
    strGenre: collection.primaryGenreName,
    artwork: typeof collection.artworkUrl100 === 'string' ? collection.artworkUrl100.replace('100x100', '600x600') : undefined,
    tracks: tracks.map((t: any) => ({
      idTrack: String(t.trackId ?? t.trackName),
      trackNumber: t.trackNumber,
      strTrack: t.trackName,
      previewUrl: t.previewUrl,
      durationMs: typeof t.trackTimeMillis === 'number' ? t.trackTimeMillis : undefined,
      explicit: t.trackExplicitness === 'explicit',
    })),
  };
}
