
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";
import axios from "axios";

import {
  FiMusic,
  FiDisc,
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiMail,
  FiPlay,
  FiAlertCircle,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiUploadCloud,
  FiImage,
  FiHeadphones,
  FiRadio,
  FiVolume2,
  FiActivity,
} from "react-icons/fi";

import { userApi, adminApi } from "../services/api";
import { useTheme } from "../context/ThemeContext";

// -------------------- Types --------------------

interface Song {
  id: string | number;
  title: string;
  description?: string;
  artist?: string;
  album_id?: number | string;
  thumbnail?: string;
  thumbnailUrl?: string;
  audio?: string;
  duration?: number;
  durationSec?: number;
}

interface Album {
  id: string | number;
  title?: string;
  name?: string;
  description?: string;
  artist?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  playlist?: string[];
}

type ModalType = "album" | "song" | null;

// -------------------- Floating Music Icons --------------------

function FloatingMusicIcons() {
  return (
    <div className="tm-floating-music" aria-hidden="true">
      <span className="tm-music-orb tm-orb-one">
        <FiMusic />
      </span>

      <span className="tm-music-orb tm-orb-two">
        <FiDisc />
      </span>

      <span className="tm-music-orb tm-orb-three">
        <FiHeadphones />
      </span>

      <span className="tm-music-orb tm-orb-four">
        <FiRadio />
      </span>

      <span className="tm-music-orb tm-orb-five">
        <FiVolume2 />
      </span>

      <span className="tm-music-orb tm-orb-six">
        <FiActivity />
      </span>
    </div>
  );
}

// -------------------- Avatar --------------------

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-300/30 bg-gradient-to-br from-blue-500 to-cyan-500 font-black text-white shadow-lg shadow-blue-500/20">
      {name?.charAt(0)?.toUpperCase() || "U"}
    </div>
  );
}

// -------------------- Error Box --------------------

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-400">
      <FiAlertCircle className="shrink-0" />
      {message}
    </div>
  );
}

// -------------------- Field --------------------

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="tm-field block space-y-2">
      <span className="text-sm font-semibold">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-blue-400/20 bg-slate-950/50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
      />
    </label>
  );
}

// -------------------- Text Area --------------------

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="tm-field block space-y-2">
      <span className="text-sm font-semibold">{label}</span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-xl border border-blue-400/20 bg-slate-950/50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
      />
    </label>
  );
}

// -------------------- Helper Functions --------------------

function getArray<T>(data: any, key: string): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.[key])) {
    return data[key];
  }

  if (Array.isArray(data?.data?.[key])) {
    return data.data[key];
  }

  return [];
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error;

    if (typeof message === "string") {
      return message;
    }

    if (error.response?.status === 401) {
      return "نشست شما معتبر نیست. دوباره وارد شوید.";
    }

    if (error.response?.status === 403) {
      return "شما اجازه انجام این عملیات را ندارید.";
    }

    if (error.response?.status === 404) {
      return "مسیر درخواستی پیدا نشد.";
    }

    if (!error.response) {
      return "ارتباط با سرور برقرار نشد.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "خطای غیرمنتظره‌ای رخ داد.";
}

// -------------------- Dashboard --------------------

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] =
    useState<Member | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userSearch, setUserSearch] = useState("");
  const [songSearch, setSongSearch] = useState("");
  const [albumSearch, setAlbumSearch] = useState("");

  const [userPage, setUserPage] = useState(1);
  const pageSize = 5;

  // Modal
  const [modal, setModal] = useState<ModalType>(null);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [saving, setSaving] = useState(false);

  // Album form
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [albumFile, setAlbumFile] = useState<File | null>(null);

  // Song form
  const [songTitle, setSongTitle] = useState("");
  const [songDescription, setSongDescription] = useState("");
  const [songAlbum, setSongAlbum] = useState("");
  const [songAudio, setSongAudio] = useState<File | null>(null);
  const [songThumbnail, setSongThumbnail] = useState<File | null>(null);

  // -------------------- Notifications --------------------

  const notificationStyle = {
    borderRadius: "16px",
    padding: "14px 18px",
    fontSize: "13px",
    fontWeight: 700,
    direction: "rtl" as const,
    maxWidth: "calc(100vw - 32px)",
    minWidth: "min(260px, calc(100vw - 32px))",
    backdropFilter: "blur(16px)",
  };

  const notifySuccess = (message: string) => {
    toast.success(message, {
      duration: 3500,
      position: "top-center",
      style: {
        ...notificationStyle,
        color: "#dbeafe",
        background: "linear-gradient(135deg, #0f2d62, #07152f)",
        border: "1px solid rgba(59,130,246,.45)",
        boxShadow: "0 12px 35px rgba(37,99,235,.25)",
      },
    });
  };

  const notifyError = (message: string) => {
    toast.error(message, {
      duration: 4500,
      position: "top-center",
      style: {
        ...notificationStyle,
        color: "#fee2e2",
        background: "linear-gradient(135deg, #451a24, #1c101b)",
        border: "1px solid rgba(248,113,113,.4)",
        boxShadow: "0 12px 35px rgba(220,38,38,.2)",
      },
    });
  };

  const notifyInfo = (message: string) => {
    toast(message, {
      duration: 3500,
      position: "top-center",
      icon: "🎵",
      style: {
        ...notificationStyle,
        color: "#dbeafe",
        background: "linear-gradient(135deg, #123b65, #07152f)",
        border: "1px solid rgba(34,211,238,.35)",
        boxShadow: "0 12px 35px rgba(6,182,212,.2)",
      },
    });
  };

  // -------------------- Load Data --------------------

  const loadDashboard = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError("");

      const [usersRes, songsRes, albumsRes] = await Promise.all([
        userApi.get("/user/admin/users"),
        adminApi.get("/songs"),
        adminApi.get("/albums"),
      ]);

      const users = getArray<Member>(usersRes.data, "users");
      const songsList = getArray<Song>(songsRes.data, "songs");
      const albumsList = getArray<Album>(albumsRes.data, "albums");

      const normalUsers = users.filter((u) => u.role !== "admin");

      setMembers(normalUsers);
      setSongs(songsList);
      setAlbums(albumsList);

      setSelectedMember((current) => {
        if (!current) return normalUsers[0] || null;

        return (
          normalUsers.find((u) => u._id === current._id) ||
          normalUsers[0] ||
          null
        );
      });

      return true;
    } catch (err) {
      console.error("Dashboard error:", err);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("نشست شما معتبر نیست. لطفاً دوباره وارد شوید.");
        } else if (status === 403) {
          setError("شما دسترسی ادمین ندارید.");
        } else if (status === 404) {
          setError(
            "یکی از مسیرهای API پیدا نشد. Routeهای بک‌اند را بررسی کن."
          );
        } else {
          setError(getErrorMessage(err));
        }
      } else {
        setError("خطای غیرمنتظره‌ای هنگام دریافت اطلاعات رخ داد.");
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // -------------------- Refresh --------------------

  const handleRefresh = async () => {
    const refreshed = await loadDashboard();

    if (refreshed) {
      notifyInfo("اطلاعات داشبورد با موفقیت بروزرسانی شد.");
    } else {
      notifyError("بروزرسانی اطلاعات انجام نشد.");
    }
  };

  // -------------------- Modal Helpers --------------------

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setEditingAlbum(null);
    setEditingSong(null);

    setAlbumTitle("");
    setAlbumDescription("");
    setAlbumFile(null);

    setSongTitle("");
    setSongDescription("");
    setSongAlbum("");
    setSongAudio(null);
    setSongThumbnail(null);
  };

  const openAddAlbum = () => {
    closeModal();
    setModal("album");
  };

  const openEditAlbum = (album: Album) => {
    closeModal();
    setEditingAlbum(album);
    setAlbumTitle(album.title || album.name || "");
    setAlbumDescription(album.description || "");
    setModal("album");
  };

  const openAddSong = () => {
    closeModal();
    setSongAlbum(albums[0] ? String(albums[0].id) : "");
    setModal("song");
  };

  const openEditSong = (song: Song) => {
    closeModal();
    setEditingSong(song);
    setSongTitle(song.title || "");
    setSongDescription(song.description || "");
    setSongAlbum(String(song.album_id || ""));
    setModal("song");
  };

  // -------------------- Album CRUD --------------------

  const saveAlbum = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!albumTitle.trim() || !albumDescription.trim()) {
      notifyError("عنوان و توضیحات آلبوم را وارد کن.");
      return;
    }

    if (!editingAlbum && !albumFile) {
      notifyError("برای آلبوم جدید انتخاب تصویر کاور الزامی است.");
      return;
    }

    if (albumFile && !albumFile.type.startsWith("image/")) {
      notifyError("فایل کاور باید تصویر باشد.");
      return;
    }

    const formData = new FormData();
    formData.append("title", albumTitle.trim());
    formData.append("description", albumDescription.trim());

    if (albumFile) {
      formData.append("file", albumFile);
    }

    try {
      setSaving(true);

      if (editingAlbum) {
        await adminApi.patch(`/album/${editingAlbum.id}`, formData);
        notifySuccess("آلبوم با موفقیت ویرایش شد.");
      } else {
        await adminApi.post("/album/new", formData);
        notifySuccess("آلبوم جدید با موفقیت اضافه شد.");
      }

      setModal(null);
      setEditingAlbum(null);
      setAlbumTitle("");
      setAlbumDescription("");
      setAlbumFile(null);

      await loadDashboard();
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteAlbum = async (album: Album) => {
    const name = album.title || album.name || "این آلبوم";

    if (
      !window.confirm(
        `آیا از حذف «${name}» مطمئن هستی؟ آهنگ‌های داخل این آلبوم نیز حذف می‌شوند.`
      )
    ) {
      return;
    }

    try {
      await adminApi.delete(`/album/${album.id}`);

      notifySuccess("آلبوم و آهنگ‌های مرتبط با موفقیت حذف شدند.");

      await loadDashboard();
    } catch (err) {
      notifyError(getErrorMessage(err));
    }
  };

  // -------------------- Song CRUD --------------------

  const saveSong = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!songTitle.trim() || !songDescription.trim() || !songAlbum) {
      notifyError("عنوان، توضیحات و آلبوم را کامل کن.");
      return;
    }

    if (!editingSong && (!songAudio || !songThumbnail)) {
      notifyError("فایل صوتی و کاور آهنگ الزامی هستند.");
      return;
    }

    if (songAudio && !songAudio.type.startsWith("audio/")) {
      notifyError("فایل انتخاب‌شده باید صوتی باشد.");
      return;
    }

    if (songThumbnail && !songThumbnail.type.startsWith("image/")) {
      notifyError("کاور آهنگ باید تصویر باشد.");
      return;
    }

    const formData = new FormData();

    formData.append("title", songTitle.trim());
    formData.append("description", songDescription.trim());
    formData.append("album", songAlbum);

    if (songAudio) {
      formData.append("src", songAudio);
    }

    if (songThumbnail) {
      formData.append("thumbnail", songThumbnail);
    }

    try {
      setSaving(true);

      if (editingSong) {
        await adminApi.patch(`/song/${editingSong.id}`, formData);
        notifySuccess("آهنگ با موفقیت ویرایش شد.");
      } else {
        await adminApi.post("/song/new", formData);
        notifySuccess("آهنگ جدید با موفقیت اضافه شد.");
      }

      setModal(null);
      setEditingSong(null);
      setSongTitle("");
      setSongDescription("");
      setSongAlbum("");
      setSongAudio(null);
      setSongThumbnail(null);

      await loadDashboard();
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteSong = async (song: Song) => {
    if (!window.confirm(`آیا از حذف آهنگ «${song.title}» مطمئنی؟`)) {
      return;
    }

    try {
      await adminApi.delete(`/song/${song.id}`);

      notifySuccess("آهنگ با موفقیت حذف شد.");

      await loadDashboard();
    } catch (err) {
      notifyError(getErrorMessage(err));
    }
  };

  // -------------------- Filtering --------------------

  const filteredMembers = useMemo(() => {
    const value = userSearch.trim().toLowerCase();

    if (!value) return members;

    return members.filter(
      (member) =>
        member.name?.toLowerCase().includes(value) ||
        member.email?.toLowerCase().includes(value)
    );
  }, [members, userSearch]);

  const filteredAlbums = useMemo(() => {
    const value = albumSearch.trim().toLowerCase();

    if (!value) return albums;

    return albums.filter((album) =>
      (album.title || album.name || "").toLowerCase().includes(value)
    );
  }, [albums, albumSearch]);

  const filteredSongs = useMemo(() => {
    const value = songSearch.trim().toLowerCase();

    if (!value) return songs;

    return songs.filter((song) =>
      song.title?.toLowerCase().includes(value)
    );
  }, [songs, songSearch]);

  // -------------------- Pagination --------------------

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / pageSize)
  );

  const currentMembers = filteredMembers.slice(
    (userPage - 1) * pageSize,
    userPage * pageSize
  );

  useEffect(() => {
    setUserPage(1);
  }, [userSearch]);

  useEffect(() => {
    if (userPage > totalPages) {
      setUserPage(totalPages);
    }
  }, [userPage, totalPages]);

  // -------------------- User Playlist --------------------

  const selectedTracks = useMemo(() => {
    if (!selectedMember?.playlist) return [];

    return selectedMember.playlist
      .map((songId) =>
        songs.find((song) => String(song.id) === String(songId))
      )
      .filter((song): song is Song => Boolean(song));
  }, [selectedMember, songs]);

  const totalSavedSongs = members.reduce(
    (total, member) => total + (member.playlist?.length || 0),
    0
  );

  // -------------------- Stats --------------------

  const stats = [
    {
      title: "کاربران",
      value: members.length,
      icon: <FiUsers />,
      color: "text-blue-500",
      gradient: "from-blue-500/20 to-blue-900/5",
    },
    {
      title: "آهنگ‌ها",
      value: songs.length,
      icon: <FiMusic />,
      color: "text-cyan-500",
      gradient: "from-cyan-500/20 to-blue-900/5",
    },
    {
      title: "آلبوم‌ها",
      value: albums.length,
      icon: <FiDisc />,
      color: "text-indigo-500",
      gradient: "from-indigo-500/20 to-blue-900/5",
    },
    {
      title: "آهنگ‌های ذخیره‌شده",
      value: totalSavedSongs,
      icon: <FiPlay />,
      color: "text-sky-500",
      gradient: "from-sky-500/20 to-indigo-900/5",
    },
  ];

  // -------------------- Responsive Theme Classes --------------------

  const panelClass = `tm-panel rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-all duration-300 sm:p-5 ${
    isDark
      ? "border-blue-400/15 bg-gradient-to-br from-[#0a1d4d]/85 to-[#050d24]/95 shadow-black/10"
      : "border-blue-100 bg-white/85 shadow-blue-100/70"
  }`;

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButton = `inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition duration-300 ${
    isDark
      ? "border-blue-400/20 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
      : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
  }`;

  // -------------------- Render --------------------

  return (
    <div
      dir="rtl"
      className={`admin-dashboard relative isolate min-w-0 space-y-6 overflow-hidden pb-10 transition-colors duration-500 sm:space-y-7 ${
        isDark
          ? "admin-dashboard-dark text-white"
          : "admin-dashboard-light text-slate-800"
      }`}
    >
      {/* Animated background */}

      <div
        className={`pointer-events-none absolute -right-20 top-0 -z-10 h-72 w-72 rounded-full blur-[110px] ${
          isDark ? "bg-blue-600/15" : "bg-blue-300/40"
        }`}
      />

      <div
        className={`pointer-events-none absolute -left-20 top-[600px] -z-10 h-80 w-80 rounded-full blur-[110px] ${
          isDark ? "bg-cyan-500/10" : "bg-cyan-300/30"
        }`}
      />

      <FloatingMusicIcons />

      <div className="tm-page-enter relative z-10 space-y-6 sm:space-y-7">

        {/* Header */}

        <header
          className={`tm-header relative overflow-hidden rounded-3xl border p-5 shadow-xl backdrop-blur-xl transition-all duration-500 sm:p-7 ${
            isDark
              ? "border-blue-400/20 bg-gradient-to-l from-[#102c65]/95 via-[#081936]/95 to-[#061127]/95 shadow-blue-950/20"
              : "border-blue-100 bg-gradient-to-l from-white via-blue-50 to-cyan-50 shadow-blue-100/70"
          }`}
        >
          <div className="pointer-events-none absolute -left-10 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <span
                className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black tracking-[2px] ${
                  isDark
                    ? "border-blue-400/25 bg-blue-500/10 text-blue-300"
                    : "border-blue-200 bg-white/80 text-blue-700"
                }`}
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
                TOPMUSIC ADMIN PANEL
              </span>

              <h1
                className={`text-2xl font-black sm:text-3xl ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                داشبورد مدیریت
              </h1>

              <p
                className={`mt-3 max-w-xl text-xs leading-7 sm:text-sm ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                مدیریت کاربران، آلبوم‌ها و آهنگ‌های TopMusic در یک محیط
                حرفه‌ای و یکپارچه
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold ${
                  isDark
                    ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                    : "border-blue-200 bg-white/80 text-blue-700"
                }`}
              >
                <FiRadio className="text-lg" />
                پنل مدیریت موسیقی
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className={secondaryButton}
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />
                بروزرسانی اطلاعات
              </button>
            </div>
          </div>
        </header>

        {error && <ErrorBox message={error} />}

        {/* Statistics */}

        <section className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
          {stats.map((item, index) => (
            <div
              key={item.title}
              style={{ animationDelay: `${index * 100}ms` }}
              className={`tm-stat-card group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${item.gradient} p-4 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl sm:p-6 ${
                isDark
                  ? "border-blue-400/15 shadow-black/10 hover:border-blue-400/40 hover:shadow-blue-950/30"
                  : "border-blue-100 shadow-blue-100/60 hover:border-blue-300 hover:shadow-blue-200/70"
              }`}
            >
              <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-blue-400/10 blur-2xl transition duration-500 group-hover:scale-150" />

              <div className="relative flex items-center justify-between gap-2">
                <div
                  className={`tm-stat-icon flex h-11 w-11 items-center justify-center rounded-2xl border text-xl shadow-lg transition duration-500 group-hover:rotate-6 group-hover:scale-110 sm:h-14 sm:w-14 sm:text-2xl ${
                    isDark
                      ? "border-blue-300/20 bg-[#07152f]/80 shadow-blue-950/30"
                      : "border-white bg-white/90 shadow-blue-200/60"
                  } ${item.color}`}
                >
                  {item.icon}
                </div>

                <span
                  className={`text-xl font-black tabular-nums sm:text-3xl ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {loading ? "—" : item.value.toLocaleString("fa-IR")}
                </span>
              </div>

              <p
                className={`relative mt-5 text-xs font-bold sm:text-sm ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {item.title}
              </p>

              <div className="absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />
            </div>
          ))}
        </section>

        {/* Users and selected user */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">

          {/* Users */}

          <section className={`${panelClass} xl:col-span-3`}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">مدیریت کاربران</h2>

                <p
                  className={`mt-1 text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  مشاهده و بررسی کاربران ثبت‌نام‌شده
                </p>
              </div>

              <span
                className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                  isDark
                    ? "border-blue-400/20 bg-blue-400/10 text-blue-300"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {members.length.toLocaleString("fa-IR")} کاربر
              </span>
            </div>

            <div className="relative mb-5">
              <FiSearch
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              />

              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="جست‌وجوی نام یا ایمیل..."
                className="tm-input w-full rounded-xl border border-blue-400/15 bg-slate-950/40 py-3 pl-4 pr-11 text-sm outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div className="space-y-3">
              {loading ? (
                [1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className={`h-16 animate-pulse rounded-xl ${
                      isDark ? "bg-white/[0.05]" : "bg-blue-100/70"
                    }`}
                  />
                ))
              ) : currentMembers.length === 0 ? (
                <div
                  className={`rounded-xl p-8 text-center text-sm ${
                    isDark
                      ? "bg-white/[0.03] text-slate-400"
                      : "bg-blue-50 text-slate-500"
                  }`}
                >
                  کاربری پیدا نشد.
                </div>
              ) : (
                currentMembers.map((member) => (
                  <button
                    key={member._id}
                    onClick={() => {
                      setSelectedMember(member);
                      notifyInfo(`اطلاعات ${member.name} انتخاب شد.`);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-right transition-all duration-300 hover:-translate-y-0.5 ${
                      selectedMember?._id === member._id
                        ? isDark
                          ? "border-blue-400/40 bg-blue-500/15 shadow-lg shadow-blue-950/20"
                          : "border-blue-300 bg-blue-50 shadow-md shadow-blue-100"
                        : isDark
                          ? "border-white/5 bg-white/[0.025] hover:border-blue-400/20 hover:bg-blue-500/[0.06]"
                          : "border-slate-200 bg-white/70 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={member.name} />

                      <div className="min-w-0">
                        <p
                          className={`truncate text-sm font-bold ${
                            isDark ? "text-white" : "text-slate-800"
                          }`}
                        >
                          {member.name}
                        </p>

                        <p
                          className={`mt-1 truncate text-xs ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-left">
                      <span
                        className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${
                          isDark
                            ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                            : "border-blue-200 bg-blue-50 text-blue-700"
                        }`}
                      >
                        کاربر
                      </span>

                      <p
                        className={`mt-2 text-[11px] ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {(member.playlist?.length || 0).toLocaleString("fa-IR")} آهنگ
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {!loading && filteredMembers.length > pageSize && (
              <div
                className={`mt-5 flex items-center justify-between border-t pt-4 ${
                  isDark ? "border-white/5" : "border-slate-200"
                }`}
              >
                <span
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  صفحه {userPage.toLocaleString("fa-IR")} از{" "}
                  {totalPages.toLocaleString("fa-IR")}
                </span>

                <div className="flex gap-2">
                  <button
                    disabled={userPage === 1}
                    onClick={() => setUserPage((p) => p - 1)}
                    className={`${secondaryButton} p-2 disabled:opacity-30`}
                  >
                    <FiChevronRight />
                  </button>

                  <button
                    disabled={userPage === totalPages}
                    onClick={() => setUserPage((p) => p + 1)}
                    className={`${secondaryButton} p-2 disabled:opacity-30`}
                  >
                    <FiChevronLeft />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Selected User */}

          <section className={`${panelClass} xl:col-span-2`}>
            <div className="mb-5">
              <h2 className="text-lg font-black">جزئیات کاربر</h2>

              <p
                className={`mt-1 text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                اطلاعات و پلی‌لیست کاربر انتخاب‌شده
              </p>
            </div>

            {selectedMember ? (
              <>
                <div
                  className={`rounded-2xl border p-4 ${
                    isDark
                      ? "border-blue-400/15 bg-blue-500/[0.06]"
                      : "border-blue-100 bg-blue-50/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={selectedMember.name} />

                    <div className="min-w-0">
                      <h3
                        className={`truncate font-black ${
                          isDark ? "text-white" : "text-slate-800"
                        }`}
                      >
                        {selectedMember.name}
                      </h3>

                      <span className="text-xs font-semibold text-blue-500">
                        عضو TopMusic
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mt-4 space-y-3 border-t pt-4 ${
                      isDark ? "border-white/5" : "border-blue-100"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      <FiUser className="text-blue-500" />
                      {selectedMember.name}
                    </div>

                    <div
                      className={`flex items-center gap-2 break-all text-xs ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      <FiMail className="shrink-0 text-blue-500" />
                      {selectedMember.email}
                    </div>
                  </div>
                </div>

                <div className="mb-4 mt-5 flex items-center justify-between">
                  <h3 className="text-sm font-black">پلی‌لیست کاربر</h3>

                  <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-500">
                    {selectedTracks.length.toLocaleString("fa-IR")} آهنگ
                  </span>
                </div>

                <div className="max-h-[350px] space-y-3 overflow-y-auto pr-1">
                  {selectedTracks.length === 0 ? (
                    <div
                      className={`rounded-xl border p-6 text-center text-xs ${
                        isDark
                          ? "border-white/5 bg-white/[0.03] text-slate-400"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      این کاربر هنوز آهنگی ذخیره نکرده است.
                    </div>
                  ) : (
                    selectedTracks.map((track) => (
                      <div
                        key={track.id}
                        className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                          isDark
                            ? "border-white/5 bg-white/[0.03]"
                            : "border-slate-200 bg-white/80"
                        }`}
                      >
                        {track.thumbnailUrl || track.thumbnail ? (
                          <img
                            src={track.thumbnailUrl || track.thumbnail}
                            alt={track.title}
                            className="h-11 w-11 rounded-lg object-cover shadow-md"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                            <FiMusic />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p
                            className={`truncate text-xs font-bold ${
                              isDark ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {track.title}
                          </p>

                          <p
                            className={`mt-1 truncate text-[11px] ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {track.artist || "هنرمند نامشخص"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div
                className={`rounded-xl p-8 text-center text-sm ${
                  isDark
                    ? "bg-white/[0.03] text-slate-400"
                    : "bg-slate-50 text-slate-500"
                }`}
              >
                برای مشاهده جزئیات، یک کاربر را انتخاب کن.
              </div>
            )}
          </section>
        </div>

        {/* Album Management */}

        <section className={panelClass}>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-black">مدیریت آلبوم‌ها</h2>

              <p
                className={`mt-1 text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                ساخت، ویرایش و حذف آلبوم‌های موسیقی
              </p>
            </div>

            <button onClick={openAddAlbum} className={primaryButton}>
              <FiPlus />
              افزودن آلبوم
            </button>
          </div>

          <div className="relative mb-5">
            <FiSearch
              className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            />

            <input
              value={albumSearch}
              onChange={(e) => setAlbumSearch(e.target.value)}
              placeholder="جست‌وجوی آلبوم..."
              className="tm-input w-full rounded-xl border border-blue-400/15 bg-slate-950/40 py-3 pl-4 pr-11 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className={`h-52 animate-pulse rounded-xl ${
                    isDark ? "bg-white/[0.04]" : "bg-blue-100/70"
                  }`}
                />
              ))}
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div
              className={`rounded-xl border p-8 text-center text-sm ${
                isDark
                  ? "border-white/5 bg-white/[0.03] text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              آلبومی برای نمایش وجود ندارد.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {filteredAlbums.map((album) => (
                <div
                  key={album.id}
                  className={`tm-content-card group min-w-0 overflow-hidden rounded-2xl border p-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                    isDark
                      ? "border-white/5 bg-[#07152d]/70 hover:border-blue-400/30 hover:shadow-blue-950/30"
                      : "border-slate-200 bg-white/90 hover:border-blue-200 hover:shadow-blue-100"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    {album.thumbnailUrl || album.thumbnail ? (
                      <img
                        src={album.thumbnailUrl || album.thumbnail}
                        alt={album.title || album.name || "Album"}
                        className="aspect-square w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-blue-500/10 text-4xl text-blue-500">
                        <FiDisc />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                  </div>

                  <h3
                    className={`mt-3 truncate text-sm font-black ${
                      isDark ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {album.title || album.name || "آلبوم بدون نام"}
                  </h3>

                  <p
                    className={`mt-1 truncate text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {album.description || "بدون توضیحات"}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => openEditAlbum(album)}
                      title="ویرایش آلبوم"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-400/20 bg-blue-500/10 py-2 text-xs font-bold text-blue-500 transition hover:bg-blue-500/20"
                    >
                      <FiEdit2 />
                      ویرایش
                    </button>

                    <button
                      onClick={() => deleteAlbum(album)}
                      title="حذف آلبوم"
                      className="flex items-center justify-center rounded-lg border border-red-400/20 bg-red-500/10 px-3 text-red-500 transition hover:bg-red-500/20"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Song Management */}

        <section className={panelClass}>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-black">مدیریت آهنگ‌ها</h2>

              <p
                className={`mt-1 text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                افزودن، ویرایش و حذف آهنگ‌های سیستم
              </p>
            </div>

            <button
              onClick={openAddSong}
              disabled={albums.length === 0}
              className={primaryButton}
            >
              <FiPlus />
              افزودن آهنگ
            </button>
          </div>

          {albums.length === 0 && (
            <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-xs text-amber-500">
              برای افزودن آهنگ، ابتدا حداقل یک آلبوم ایجاد کن.
            </div>
          )}

          <div className="relative mb-5">
            <FiSearch
              className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            />

            <input
              value={songSearch}
              onChange={(e) => setSongSearch(e.target.value)}
              placeholder="جست‌وجوی نام آهنگ..."
              className="tm-input w-full rounded-xl border border-blue-400/15 bg-slate-950/40 py-3 pl-4 pr-11 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`h-16 animate-pulse rounded-xl ${
                    isDark ? "bg-white/[0.04]" : "bg-blue-100/70"
                  }`}
                />
              ))}
            </div>
          ) : filteredSongs.length === 0 ? (
            <div
              className={`rounded-xl border p-8 text-center text-sm ${
                isDark
                  ? "border-white/5 bg-white/[0.03] text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              آهنگی برای نمایش وجود ندارد.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSongs.map((song) => {
                const songAlbum = albums.find(
                  (album) => String(album.id) === String(song.album_id)
                );

                return (
                  <div
                    key={song.id}
                    className={`tm-content-card flex flex-col gap-3 rounded-xl border p-3 transition-all duration-300 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between ${
                      isDark
                        ? "border-white/5 bg-white/[0.025] hover:border-blue-400/20 hover:bg-blue-500/[0.05]"
                        : "border-slate-200 bg-white/80 hover:border-blue-200 hover:bg-blue-50/60"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {song.thumbnailUrl || song.thumbnail ? (
                        <img
                          src={song.thumbnailUrl || song.thumbnail}
                          alt={song.title}
                          className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-md"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-500">
                          <FiHeadphones />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p
                          className={`truncate text-sm font-black ${
                            isDark ? "text-white" : "text-slate-800"
                          }`}
                        >
                          {song.title}
                        </p>

                        <p
                          className={`mt-1 truncate text-xs ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {songAlbum?.title ||
                            songAlbum?.name ||
                            "آلبوم نامشخص"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:shrink-0">
                      <button
                        onClick={() => openEditSong(song)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-500 transition hover:bg-blue-500/20 sm:flex-none"
                      >
                        <FiEdit2 />
                        ویرایش
                      </button>

                      <button
                        onClick={() => deleteSong(song)}
                        className="flex items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-500/20"
                      >
                        <FiTrash2 />
                        حذف
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Add / Edit Modal */}

        {modal && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-md sm:p-6"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !saving) {
                closeModal();
              }
            }}
          >
            <div
              className={`tm-modal my-auto w-full max-w-xl overflow-hidden rounded-3xl border shadow-2xl ${
                isDark
                  ? "border-blue-400/20 bg-gradient-to-br from-[#0b2048] to-[#040c1e] shadow-black/50"
                  : "border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-blue-950/20"
              }`}
            >
              {/* Modal Header */}

              <div
                className={`flex items-center justify-between border-b p-5 sm:p-6 ${
                  isDark ? "border-white/10" : "border-blue-100"
                }`}
              >
                <div>
                  <span className="text-[10px] font-black tracking-[2px] text-blue-500">
                    TOPMUSIC MANAGEMENT
                  </span>

                  <h2
                    className={`mt-1 text-lg font-black ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {modal === "album"
                      ? editingAlbum
                        ? "ویرایش آلبوم"
                        : "افزودن آلبوم جدید"
                      : editingSong
                        ? "ویرایش آهنگ"
                        : "افزودن آهنگ جدید"}
                  </h2>
                </div>

                <button
                  onClick={closeModal}
                  disabled={saving}
                  className={`rounded-xl border p-2.5 transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40 ${
                    isDark
                      ? "border-white/10 bg-white/5 text-slate-300"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  <FiX />
                </button>
              </div>

              {/* Album Form */}

              {modal === "album" && (
                <form
                  onSubmit={saveAlbum}
                  className="space-y-5 p-5 sm:p-6"
                >
                  <Field
                    label="عنوان آلبوم"
                    value={albumTitle}
                    onChange={setAlbumTitle}
                    placeholder="مثلاً: خاطرات..."
                  />

                  <TextAreaField
                    label="توضیحات آلبوم"
                    value={albumDescription}
                    onChange={setAlbumDescription}
                    placeholder="توضیح کوتاهی درباره آلبوم بنویس..."
                  />

                  <label className="tm-field block space-y-2">
                    <span className="text-sm font-semibold">
                      تصویر کاور آلبوم
                    </span>

                    <div
                      className={`relative flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-5 text-center transition hover:border-blue-400 hover:bg-blue-500/10 ${
                        isDark
                          ? "border-blue-400/30 bg-blue-500/[0.05]"
                          : "border-blue-200 bg-blue-50/70"
                      }`}
                    >
                      <FiUploadCloud className="mb-2 text-3xl text-blue-500" />

                      <span className="break-all text-sm">
                        {albumFile
                          ? albumFile.name
                          : "برای انتخاب تصویر کلیک کن"}
                      </span>

                      <span
                        className={`mt-1 text-xs ${
                          isDark ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        {editingAlbum
                          ? "در صورت عدم انتخاب، کاور قبلی حفظ می‌شود."
                          : "انتخاب فایل تصویر"}
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setAlbumFile(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </div>
                  </label>

                  {editingAlbum &&
                    (editingAlbum.thumbnail ||
                      editingAlbum.thumbnailUrl) && (
                      <div
                        className={`flex items-center gap-3 rounded-xl border p-3 ${
                          isDark
                            ? "border-white/5 bg-white/[0.03]"
                            : "border-slate-200 bg-white/80"
                        }`}
                      >
                        <img
                          src={
                            editingAlbum.thumbnailUrl ||
                            editingAlbum.thumbnail
                          }
                          alt="Current album cover"
                          className="h-14 w-14 rounded-lg object-cover"
                        />

                        <span
                          className={`text-xs ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          کاور فعلی آلبوم
                        </span>
                      </div>
                    )}

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={saving}
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:bg-blue-500/10 ${
                        isDark
                          ? "border-white/10 bg-white/5 text-slate-300"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      انصراف
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className={`${primaryButton} flex-1`}
                    >
                      <FiSave />
                      {saving
                        ? "در حال ذخیره..."
                        : editingAlbum
                          ? "ذخیره تغییرات"
                          : "ایجاد آلبوم"}
                    </button>
                  </div>
                </form>
              )}

              {/* Song Form */}

              {modal === "song" && (
                <form
                  onSubmit={saveSong}
                  className="space-y-5 p-5 sm:p-6"
                >
                  <Field
                    label="عنوان آهنگ"
                    value={songTitle}
                    onChange={setSongTitle}
                    placeholder="نام آهنگ..."
                  />

                  <TextAreaField
                    label="توضیحات آهنگ"
                    value={songDescription}
                    onChange={setSongDescription}
                    placeholder="توضیحات آهنگ..."
                  />

                  <label className="tm-field block space-y-2">
                    <span className="text-sm font-semibold">
                      انتخاب آلبوم
                    </span>

                    <select
                      value={songAlbum}
                      onChange={(e) => setSongAlbum(e.target.value)}
                      className="tm-input w-full rounded-xl border border-blue-400/20 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-blue-400"
                    >
                      <option value="">انتخاب آلبوم</option>

                      {albums.map((album) => (
                        <option key={album.id} value={album.id}>
                          {album.title ||
                            album.name ||
                            `آلبوم ${album.id}`}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="tm-field block space-y-2">
                    <span className="text-sm font-semibold">
                      فایل صوتی {editingSong && "(اختیاری)"}
                    </span>

                    <div
                      className={`relative flex items-center gap-3 rounded-xl border border-dashed p-4 transition hover:border-blue-400 ${
                        isDark
                          ? "border-blue-400/30 bg-blue-500/[0.05]"
                          : "border-blue-200 bg-blue-50/70"
                      }`}
                    >
                      <FiMusic className="text-xl text-blue-500" />

                      <span className="min-w-0 truncate text-xs">
                        {songAudio?.name || "انتخاب فایل صوتی"}
                      </span>

                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) =>
                          setSongAudio(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </div>
                  </label>

                  <label className="tm-field block space-y-2">
                    <span className="text-sm font-semibold">
                      کاور آهنگ {editingSong && "(اختیاری)"}
                    </span>

                    <div
                      className={`relative flex items-center gap-3 rounded-xl border border-dashed p-4 transition hover:border-blue-400 ${
                        isDark
                          ? "border-blue-400/30 bg-blue-500/[0.05]"
                          : "border-blue-200 bg-blue-50/70"
                      }`}
                    >
                      <FiImage className="text-xl text-blue-500" />

                      <span className="min-w-0 truncate text-xs">
                        {songThumbnail?.name || "انتخاب تصویر کاور"}
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setSongThumbnail(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </div>
                  </label>

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={saving}
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:bg-blue-500/10 ${
                        isDark
                          ? "border-white/10 bg-white/5 text-slate-300"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      انصراف
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className={`${primaryButton} flex-1`}
                    >
                      <FiSave />
                      {saving
                        ? "در حال ذخیره..."
                        : editingSong
                          ? "ذخیره تغییرات"
                          : "افزودن آهنگ"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Animation and responsive styles */}

      <style>{`
        @keyframes tm-float {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-8deg);
          }
          50% {
            transform: translate3d(12px, -24px, 0) rotate(10deg);
          }
        }

        @keyframes tm-page-enter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes tm-glow {
          0%, 100% {
            box-shadow: 0 0 12px rgba(59,130,246,.12);
          }
          50% {
            box-shadow: 0 0 28px rgba(59,130,246,.28);
          }
        }

        .tm-page-enter {
          animation: tm-page-enter .7s ease both;
        }

        .tm-floating-music {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .tm-music-orb {
          position: absolute;
          display: grid;
          place-items: center;
          width: 62px;
          height: 62px;
          border: 1px solid rgba(96,165,250,.35);
          border-radius: 22px;
          color: #bfdbfe;
          font-size: 27px;
          background: linear-gradient(
            145deg,
            rgba(59,130,246,.35),
            rgba(8,47,73,.18)
          );
          box-shadow:
            inset 4px 4px 9px rgba(255,255,255,.16),
            inset -5px -5px 10px rgba(0,0,0,.2),
            0 18px 35px rgba(37,99,235,.2);
          opacity: .32;
          animation: tm-float 8s ease-in-out infinite;
        }

        .tm-orb-one {
          top: 8%;
          left: 4%;
        }

        .tm-orb-two {
          top: 29%;
          right: 3%;
          animation-delay: 1.5s;
        }

        .tm-orb-three {
          top: 52%;
          left: 2%;
          animation-delay: 2.5s;
        }

        .tm-orb-four {
          top: 72%;
          right: 5%;
          animation-delay: 3.5s;
        }

        .tm-orb-five {
          top: 88%;
          left: 24%;
          animation-delay: 1s;
        }

        .tm-orb-six {
          top: 13%;
          right: 25%;
          animation-delay: 4s;
        }

        .tm-stat-card {
          animation: tm-page-enter .65s ease both;
        }

        .tm-stat-icon {
          transform-style: preserve-3d;
        }

        .tm-content-card {
          transform-style: preserve-3d;
        }

        .admin-dashboard-dark .tm-panel {
          color: #f8fafc;
        }

        .admin-dashboard-light .tm-panel {
          color: #172554;
        }

        .admin-dashboard-light .tm-music-orb {
          color: #2563eb;
          border-color: rgba(59,130,246,.25);
          background: linear-gradient(
            145deg,
            rgba(255,255,255,.98),
            rgba(219,234,254,.9)
          );
          box-shadow:
            inset 4px 4px 9px rgba(255,255,255,.95),
            inset -4px -4px 10px rgba(148,163,184,.2),
            0 16px 30px rgba(37,99,235,.12);
          opacity: .48;
        }

        .admin-dashboard-light .tm-input {
          color: #172554 !important;
          background: rgba(255,255,255,.9) !important;
          border-color: #dbeafe !important;
        }

        .admin-dashboard-light .tm-input::placeholder {
          color: #94a3b8 !important;
        }

        .admin-dashboard-light .tm-field {
          color: #334155;
        }

        .admin-dashboard-light .tm-modal .tm-input,
        .admin-dashboard-light .tm-modal input,
        .admin-dashboard-light .tm-modal textarea,
        .admin-dashboard-light .tm-modal select {
          color: #172554;
        }

        .admin-dashboard-light .tm-modal input::placeholder,
        .admin-dashboard-light .tm-modal textarea::placeholder {
          color: #94a3b8;
        }

        .admin-dashboard-light .tm-modal option {
          color: #172554;
          background: #fff;
        }

        .admin-dashboard-light .tm-header {
          color: #172554;
        }

        @media (max-width: 640px) {
          .tm-music-orb {
            width: 43px;
            height: 43px;
            border-radius: 15px;
            font-size: 19px;
            opacity: .22;
          }

          .tm-orb-six,
          .tm-orb-five {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tm-music-orb,
          .tm-page-enter,
          .tm-stat-card {
            animation: none !important;
          }

          .tm-content-card,
          .tm-stat-icon {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

