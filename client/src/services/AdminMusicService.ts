
import { adminApi } from "./api";

export interface Song {
  id: number;
  title: string;
  album_id: number | null;
  artist?: string;
  src?: string;
  thumbnail?: string;
}

export interface Album {
  id: number;
  title: string;
  artist?: string;
  cover?: string;
}

interface SongsResponse {
  songs: Song[];
}

interface AlbumsResponse {
  albums: Album[];
}

export const getAllSongs = async (): Promise<Song[]> => {
  const { data } = await adminApi.get<SongsResponse>("/songs");
  return data.songs;
};

export const getAllAlbums = async (): Promise<Album[]> => {
  const { data } = await adminApi.get<AlbumsResponse>("/albums");
  return data.albums;
};
