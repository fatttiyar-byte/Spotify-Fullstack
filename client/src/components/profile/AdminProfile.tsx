
import { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiShield,
  FiMusic,
  FiDisc,
  FiTrendingUp,
  FiRefreshCw,
} from "react-icons/fi";

import {
  getAllSongs,
  getAllAlbums,
  type Song,
  type Album,
} from "../../services/playlistService";

interface Props {
  user: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
}

const AdminProfile = ({ user }: Props) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [songsData, albumsData] = await Promise.all([
        getAllSongs(),
        getAllAlbums(),
      ]);

      setSongs(songsData);
      setAlbums(albumsData);
    } catch {
      setError("دریافت اطلاعات داشبورد با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = [
    {
      title: "کل آهنگ‌ها",
      value: songs.length,
      icon: FiMusic,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "کل آلبوم‌ها",
      value: albums.length,
      icon: FiDisc,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },
    {
      title: "آهنگ‌های بدون آلبوم",
      value: songs.filter((song) => !song.album_id).length,
      icon: FiTrendingUp,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-8 pb-10">

      {/* Admin Header */}
      <section className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-l from-purple-950/70 via-[#11182b] to-[#101426] p-7 sm:p-10">
        <div className="absolute -left-10 -top-16 h-52 w-52 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-purple-400/30 bg-purple-500/15 text-purple-300">
            <FiShield size={42} />
          </div>

          <div>
            <span className="text-xs font-bold tracking-widest text-purple-300">
              TOPMUSIC ADMIN PANEL
            </span>

            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              خوش آمدی، {user.name}
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              مدیریت و بررسی اطلاعات سیستم TopMusic
            </p>
          </div>

          <div className="sm:mr-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Administrator
            </span>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              آمار مدیریتی
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              وضعیت فعلی محتوای سیستم
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="rounded-xl border border-white/10 p-3 text-gray-400 transition hover:border-purple-500/40 hover:text-purple-400 disabled:opacity-50"
            title="بروزرسانی آمار"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-purple-500/30"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                    <Icon size={23} />
                  </div>

                  <span className="text-xs text-gray-500">
                    TOPMUSIC
                  </span>
                </div>

                <p className="mt-6 text-sm text-gray-400">
                  {stat.title}
                </p>

                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : stat.value}
                </h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* Admin Information */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
            <FiUser size={22} />
          </div>

          <div>
            <h2 className="font-bold">اطلاعات حساب مدیریت</h2>
            <p className="mt-1 text-xs text-gray-400">
              اطلاعات حساب کاربری شما
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl bg-black/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
              <FiUser />
              نام مدیر
            </div>

            <p className="font-semibold">{user.name}</p>
          </div>

          <div className="rounded-xl bg-black/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
              <FiMail />
              ایمیل
            </div>

            <p className="break-all font-semibold">{user.email}</p>
          </div>

          <div className="rounded-xl bg-black/10 p-4 md:col-span-2">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
              <FiShield />
              سطح دسترسی
            </div>

            <p className="font-semibold text-purple-400">
              Administrator
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AdminProfile;
