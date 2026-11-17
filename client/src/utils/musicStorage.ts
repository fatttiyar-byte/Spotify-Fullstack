import type { Song } from "../components/music/SongCard";

const FAVORITES_KEY = "topmusic-favorites";
const HISTORY_KEY = "topmusic-history";

const getId = (song: Song) => String(song.id ?? song._id ?? "");

function readSongs(key: string): Song[] {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as Song[] : [];
  } catch {
    return [];
  }
}

function writeSongs(key: string, songs: Song[]) {
  localStorage.setItem(key, JSON.stringify(songs));
}

export function getFavorites(): Song[] {
  return readSongs(FAVORITES_KEY);
}

export function isFavorite(song: Song): boolean {
  const id = getId(song);
  return !!id && getFavorites().some((item) => getId(item) === id);
}

export function toggleFavorite(song: Song): Song[] {
  const id = getId(song);
  if (!id) return getFavorites();

  const current = getFavorites();
  const exists = current.some((item) => getId(item) === id);
  const updated = exists
    ? current.filter((item) => getId(item) !== id)
    : [song, ...current];

  writeSongs(FAVORITES_KEY, updated);
  return updated;
}

export function getHistory(): Song[] {
  return readSongs(HISTORY_KEY);
}

export function addToHistory(song: Song): Song[] {
  const id = getId(song);
  if (!id) return getHistory();

  const updated = [
    song,
    ...getHistory().filter((item) => getId(item) !== id),
  ].slice(0, 50);

  writeSongs(HISTORY_KEY, updated);
  return updated;
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
