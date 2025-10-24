# Find Your Lyrics (React + Vite)

Simple music search built with React, TypeScript, Vite and Tailwind. Search songs/albums via the free iTunes Search API, view album details, and fetch lyrics with a free multi‑provider fallback. When the search box is empty, the app shows popular items using Apple’s public charts (with a reliable fallback).

## Features
- Song and album search (no API key) using iTunes Search API
- Song details with artwork, preview audio, metadata, and lyrics
- Lyrics fetched from free sources with fallback chain
  - lyrics.ovh → Some Random API (no keys)
- Album details view with tracklist and previews
- “Top when empty” homepage
  - Apple Music RSS charts (country: `us`) with fallback to iTunes search
- Pagination and simple list/grid toggle

## Tech Stack
- React 19, TypeScript, Vite 7
- React Router v6
- Tailwind CSS v4
- Axios for HTTP

## Getting Started
1. Install dependencies
   - `npm install`
2. Run in development
   - `npm run dev`
   - Open the printed local URL in your browser
3. Build for production
   - `npm run build`
4. Preview the production build
   - `npm run preview`

No API keys are required. All data sources are public endpoints with permissive CORS.

## Project Structure (Key Files)
- `src/App.tsx` – Routes wiring
- `src/layout/Layout.tsx` – App shell
- `src/pages/SearchPage.tsx` – Search UI, top lists when empty, pagination
- `src/pages/SongDetails.tsx` – Track details + lyrics
- `src/pages/AlbumDetails.tsx` – Album details + tracks
- `src/components/SongCard.tsx` / `src/components/AlbumCard.tsx` – Item renderers
- `src/api/songs.ts` – iTunes search, Apple charts, lyrics helpers

## Data Sources
- Search: `https://itunes.apple.com/search` (entity: `song` or `album`)
- Track/Album lookup: `https://itunes.apple.com/lookup`
- Top charts: `https://rss.applemarketingtools.com/api/v2/<country>/music/...`
  - Default country: `us`
- Lyrics (fallback chain):
  1) `https://api.lyrics.ovh/v1/<artist>/<title>`
  2) `https://some-random-api.com/lyrics?title=<artist title>`

## Behavior Notes
- Empty search input shows “Top Songs/Top Albums” from Apple RSS; if that request fails (e.g., CORS/network), we fallback to iTunes Search with a common term to keep the page populated.
- Lyrics are best‑effort with free sources; if unavailable, the UI offers quick search links (Google, DuckDuckGo, Genius, AZLyrics) on the song details page.

## Troubleshooting
- “Network Error” on the home page with empty search
  - The app now gracefully falls back to iTunes Search if Apple RSS charts are blocked by CORS or the network.
- No lyrics found
  - Free providers don’t cover every song. Use the built‑in search links shown in the UI.

## Customization Ideas
- Add a country selector for charts (e.g., `us`, `pl`, `de`)
- Persist last mode/layout and recent searches in `localStorage`
- Add badges for “Top” vs “Search” results
- Serverless proxy + caching if you want stronger reliability

