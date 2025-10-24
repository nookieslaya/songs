import React from "react";
import type { Album } from "../api/songs";
import { Link } from "react-router-dom";

type AlbumCardProps = {
  album: Album;
};

const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  const meta = [album.intYearReleased, album.strGenre].filter(Boolean).join(" • ");
  return (
    <div className="card hover-lift relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500/30 via-blue-400/30 to-cyan-400/30" />
      <div className="flex gap-4 p-4">
        <Link to={`/album/${album.idAlbum}`} className="block">
          {album.strAlbumThumb ? (
            <img
              src={album.strAlbumThumb}
              alt={album.strAlbum}
              className="h-20 w-20 shrink-0 rounded object-cover"
            />
          ) : (
            <div className="h-20 w-20 shrink-0 rounded bg-gray-100" />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            <Link to={`/album/${album.idAlbum}`} className="hover:underline">
              {album.strAlbum}
            </Link>
          </h3>
          <p className="text-sm text-gray-700">{album.strArtist}</p>
          {meta && <p className="mt-1 text-xs text-gray-500">{meta}</p>}
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;

