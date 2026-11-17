
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import toast from "react-hot-toast";
import type { Song as SongCardSong } from "../components/music/SongCard";
import { addSongToPlaylist } from "../services/profileService";

/* =========================
   Song Type
========================= */

export type Song = SongCardSong & {
  url?: string;
};

/* =========================
   Helpers
========================= */

const getSongId = (song: Song): string => {
  return String(song.id ?? song._id ?? "");
};

const getAudioUrl = (song: Song): string => {
  return (
    song.src ||
    song.audio ||
    song.audio_url ||
    song.file_url ||
    song.url ||
    ""
  );
};

/* =========================
   Context Type
========================= */

type RepeatMode = "off" | "one" | "all";

interface MusicPlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;

  isPlaying: boolean;
  currentTime: number;
  duration: number;

  volume: number;
  isMuted: boolean;

  isShuffle: boolean;
  repeatMode: RepeatMode;

  playlistVersion: number;

  audioRef: React.RefObject<HTMLAudioElement | null>;

  playSong: (song: Song, songs?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  previousSong: () => void;

  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  toggleShuffle: () => void;
  toggleRepeat: () => void;

  addCurrentSongToPlaylist: () => Promise<void>;
}

/* =========================
   Context
========================= */

const MusicPlayerContext =
  createContext<MusicPlayerContextType | undefined>(undefined);

/* =========================
   Provider
========================= */

export function MusicPlayerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  const [playlistVersion, setPlaylistVersion] = useState(0);

  /* =========================
     Play Song
  ========================= */

  const playSong = useCallback(
    (song: Song, songs?: Song[]) => {
      const newQueue = songs?.length ? songs : [song];

      const index = newQueue.findIndex(
        (item) => getSongId(item) === getSongId(song)
      );

      setQueue(newQueue);
      setCurrentIndex(index >= 0 ? index : 0);
      setCurrentSong(song);
      setCurrentTime(0);
      setIsPlaying(true);
    },
    []
  );

  /* =========================
     Audio Source
  ========================= */

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentSong) return;

    const audioUrl = getAudioUrl(currentSong);

    if (!audioUrl) {
      toast.error("آدرس فایل صوتی آهنگ موجود نیست.");
      setIsPlaying(false);
      return;
    }

    audio.src = audioUrl;
    audio.load();

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentSong]);

  /* =========================
     Play / Pause
  ========================= */

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;

    if (!audio || !currentSong) return;

    if (audio.paused) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          toast.error("پخش آهنگ امکان‌پذیر نیست.");
        });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
        return;
      }

      nextSong();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [repeatMode, queue, currentIndex]);

  /* =========================
     Next Song
  ========================= */

  const nextSong = useCallback(() => {
    if (!queue.length) return;

    let nextIndex: number;

    if (isShuffle && queue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === currentIndex);
    } else {
      nextIndex = currentIndex + 1;

      if (nextIndex >= queue.length) {
        if (repeatMode === "all") {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
    }

    setCurrentIndex(nextIndex);
    setCurrentSong(queue[nextIndex]);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [queue, currentIndex, isShuffle, repeatMode]);

  /* =========================
     Previous Song
  ========================= */

  const previousSong = useCallback(() => {
    if (!queue.length) return;

    const audio = audioRef.current;

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const previousIndex =
      currentIndex > 0 ? currentIndex - 1 : queue.length - 1;

    setCurrentIndex(previousIndex);
    setCurrentSong(queue[previousIndex]);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [queue, currentIndex]);

  /* =========================
     Seek
  ========================= */

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  /* =========================
     Volume
  ========================= */

  const setVolume = useCallback((value: number) => {
    const newVolume = Math.max(0, Math.min(1, value));

    setVolumeState(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }

    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((previous) => {
      const next = !previous;

      if (audioRef.current) {
        audioRef.current.muted = next;
      }

      return next;
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  /* =========================
     Shuffle / Repeat
  ========================= */

  const toggleShuffle = useCallback(() => {
    setIsShuffle((previous) => !previous);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((previous) => {
      if (previous === "off") return "all";
      if (previous === "all") return "one";
      return "off";
    });
  }, []);

  /* =========================
     Add Current Song To Playlist
  ========================= */

  const addCurrentSongToPlaylist = useCallback(async () => {
    if (!currentSong) {
      toast.error("ابتدا یک آهنگ پخش کن.");
      return;
    }

    const songId = getSongId(currentSong);

    if (!/^[1-9]\d*$/.test(songId)) {
      toast.error("شناسه آهنگ معتبر نیست.");
      return;
    }

    try {
      const response = await addSongToPlaylist(songId);

      setPlaylistVersion((previous) => previous + 1);

      toast.success(
        response?.message ||
          `${currentSong.title} به پلی‌لیست اضافه شد.`
      );
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            message?: string;
          };
        };
      };

      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message;

      if (status === 401) {
        toast.error("برای افزودن آهنگ ابتدا وارد حساب کاربری شو.");
        return;
      }

      toast.error(message || "افزودن آهنگ به پلی‌لیست انجام نشد.");
    }
  }, [currentSong]);

  /* =========================
     Provider Value
  ========================= */

  const value: MusicPlayerContextType = {
    currentSong,
    queue,
    currentIndex,

    isPlaying,
    currentTime,
    duration,

    volume,
    isMuted,

    isShuffle,
    repeatMode,

    playlistVersion,

    audioRef,

    playSong,
    togglePlay,
    nextSong,
    previousSong,

    seek,
    setVolume,
    toggleMute,

    toggleShuffle,
    toggleRepeat,

    addCurrentSongToPlaylist,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      <audio ref={audioRef} preload="metadata" />
      {children}
    </MusicPlayerContext.Provider>
  );
}

/* =========================
   Custom Hook
========================= */

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);

  if (!context) {
    throw new Error(
      "useMusicPlayer must be used inside MusicPlayerProvider"
    );
  }

  return context;
}
