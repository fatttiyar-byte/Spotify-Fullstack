
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
  FiActivity,
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSearch,
  FiSettings,
  FiSun,
  FiUser,
  FiCheck,
  FiCheckCircle,
  FiGrid,
  FiX,
  FiArrowUpLeft,
} from "react-icons/fi";

import { useTheme } from "../../context/ThemeContext";
import { useAuthStore } from "../../store/authStore";

interface NavbarProps {
  onMenuClick: () => void;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const defaultNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "به TopMusic خوش آمدی!",
    message: "از شنیدن موسیقی‌های مورد علاقه‌ات لذت ببر.",
    date: "امروز",
    read: false,
  },
  {
    id: 2,
    title: "پروفایل شما آماده است",
    message: "می‌توانی اطلاعات حساب کاربری خودت را تکمیل کنی.",
    date: "امروز",
    read: false,
  },
];

const getNotifications = (): NotificationItem[] => {
  try {
    const saved = localStorage.getItem("topmusic-notifications");

    if (saved) return JSON.parse(saved);

    localStorage.setItem(
      "topmusic-notifications",
      JSON.stringify(defaultNotifications)
    );

    return defaultNotifications;
  } catch {
    return defaultNotifications;
  }
};

const popularSearches = [
  "آهنگ‌های جدید",
  "موسیقی بی‌کلام",
  "آلبوم‌های محبوب",
  "موسیقی ایرانی",
];

export default function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const isAdmin = user?.role === "admin";
  const isDark = theme === "dark";

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>(getNotifications);

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  // مدیریت کلیدهای میانبر و بستن مودال
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
        setProfileOpen(false);
        setNotificationsOpen(false);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, []);

  // قفل اسکرول هنگام باز بودن مودال
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  // همگام‌سازی اعلان‌ها
  useEffect(() => {
    const syncNotifications = () => {
      setNotifications(getNotifications());
    };

    window.addEventListener("storage", syncNotifications);
    window.addEventListener(
      "topmusic-notifications-change",
      syncNotifications
    );

    return () => {
      window.removeEventListener("storage", syncNotifications);
      window.removeEventListener(
        "topmusic-notifications-change",
        syncNotifications
      );
    };
  }, []);

  const openSearch = () => {
    setSearchOpen(true);
    setProfileOpen(false);
    setNotificationsOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) return;

    navigate(`/search?q=${encodeURIComponent(value)}`);

    setSearch("");
    setSearchOpen(false);
  };

  const searchPopular = (value: string) => {
    setSearch(value);
    navigate(`/search?q=${encodeURIComponent(value)}`);
    setSearch("");
    setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login", { replace: true });
  };

  const goToProfile = () => {
    setProfileOpen(false);
    navigate(isAdmin ? "/admin/profile" : "/profile");
  };

  const goToAdminDashboard = () => {
    setProfileOpen(false);
    navigate("/admin");
  };

  const markAsRead = (id: number) => {
    const updated = notifications.map((item) =>
      item.id === id ? { ...item, read: true } : item
    );

    setNotifications(updated);

    localStorage.setItem(
      "topmusic-notifications",
      JSON.stringify(updated)
    );

    window.dispatchEvent(
      new Event("topmusic-notifications-change")
    );
  };

  const markAllAsRead = () => {
    const updated = notifications.map((item) => ({
      ...item,
      read: true,
    }));

    setNotifications(updated);

    localStorage.setItem(
      "topmusic-notifications",
      JSON.stringify(updated)
    );

    window.dispatchEvent(
      new Event("topmusic-notifications-change")
    );
  };

  const buttonClass = `relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition duration-200 ${
    isDark
      ? "border-white/10 bg-white/[0.04] text-slate-300 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300"
      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
  }`;

  const panelClass = isDark
    ? "border-white/10 bg-[#111C32] text-white"
    : "border-slate-200 bg-white text-slate-800";

  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-2xl transition-colors duration-300 ${
          isDark
            ? "border-white/[0.07] bg-[#080E1D]/90"
            : "border-slate-200 bg-white/90"
        }`}
      >
        <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6">

          {/* Right Section */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={onMenuClick}
              aria-label="باز کردن منو"
              className={`${buttonClass} lg:hidden`}
            >
              <FiMenu size={21} />
            </button>

            {/* Brand */}
            <button
              onClick={() => navigate("/")}
              className="flex shrink-0 items-center gap-2 lg:hidden"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-lg shadow-blue-900/30">
                <FiActivity size={21} />
              </span>

              <span
                className={`text-lg font-extrabold ${
                  isDark ? "text-white" : "text-[#101D38]"
                }`}
              >
                Top<span className="text-blue-500">Music</span>
              </span>
            </button>

            {/* Search Trigger */}
            <button
              type="button"
              onClick={openSearch}
              className={`group hidden h-11 w-[min(440px,40vw)] items-center gap-3 rounded-xl border px-4 text-right transition-all duration-300 md:flex ${
                isDark
                  ? "border-white/[0.08] bg-[#111C32] text-slate-400 hover:border-blue-400/40 hover:bg-blue-500/[0.06]"
                  : "border-slate-200 bg-slate-50 text-slate-400 hover:border-blue-300 hover:bg-white"
              }`}
            >
              <FiSearch
                size={19}
                className="shrink-0 transition group-hover:scale-110 group-hover:text-blue-500"
              />

              <span className="flex-1 text-sm">
                جست‌وجوی آهنگ، خواننده یا آلبوم...
              </span>

              <span
                className={`rounded-md border px-2 py-1 text-[10px] font-medium ${
                  isDark
                    ? "border-white/10 bg-white/5 text-slate-500"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                Ctrl K
              </span>
            </button>
          </div>

          {/* Left Section */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">

            {/* Mobile Search */}
            <button
              type="button"
              onClick={openSearch}
              aria-label="جست‌وجو"
              className={`${buttonClass} md:hidden`}
            >
              <FiSearch size={19} />
            </button>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              aria-label="تغییر حالت شب و روز"
              title={isDark ? "حالت روز" : "حالت شب"}
              className={`${buttonClass} ${
                isDark ? "text-amber-300" : "text-indigo-700"
              }`}
            >
              {isDark ? (
                <FiSun size={19} />
              ) : (
                <FiMoon size={19} />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                aria-label="اعلان‌ها"
                className={buttonClass}
              >
                <FiBell size={19} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#101D35] bg-blue-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className={`absolute left-0 top-14 z-50 w-[min(330px,calc(100vw-32px))] overflow-hidden rounded-2xl border shadow-2xl ${panelClass}`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-500/15 p-4">
                      <div>
                        <h3 className="font-bold">اعلان‌ها</h3>
                        <p className="mt-1 text-xs opacity-60">
                          {unreadCount} اعلان خوانده‌نشده
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-semibold text-blue-500 hover:text-blue-400"
                        >
                          خواندن همه
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto p-2">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm opacity-60">
                          اعلانی وجود ندارد.
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => markAsRead(item.id)}
                            className={`mb-1 flex w-full gap-3 rounded-xl p-3 text-right transition ${
                              item.read
                                ? "opacity-60"
                                : isDark
                                  ? "bg-blue-500/10 hover:bg-blue-500/15"
                                  : "bg-blue-50 hover:bg-blue-100"
                            }`}
                          >
                            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
                              {item.read ? (
                                <FiCheck size={16} />
                              ) : (
                                <FiBell size={16} />
                              )}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-bold">
                                {item.title}
                              </span>

                              <span className="mt-1 block text-xs leading-5 opacity-70">
                                {item.message}
                              </span>

                              <span className="mt-2 block text-[10px] opacity-50">
                                {item.date}
                              </span>
                            </span>
                          </button>
                        ))
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate("/notifications");
                      }}
                      className="flex w-full items-center justify-center gap-2 border-t border-slate-500/15 p-3 text-sm font-semibold text-blue-500 transition hover:bg-blue-500/5"
                    >
                      مشاهده همه اعلان‌ها
                      <FiCheckCircle size={15} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
                className={`flex h-10 items-center gap-2 rounded-xl border px-2 transition sm:px-3 ${
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 text-white">
                  <FiUser size={16} />
                </span>

                <span className="hidden max-w-28 truncate text-xs font-semibold sm:block">
                  {user?.name || "حساب کاربری"}
                </span>

                <FiChevronDown className="hidden sm:block" size={14} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className={`absolute left-0 top-14 z-50 w-52 rounded-2xl border p-2 shadow-2xl ${panelClass}`}
                  >
                    <button
                      onClick={goToProfile}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-blue-500/10"
                    >
                      <FiUser className="text-blue-500" />
                      پروفایل من
                    </button>

                    {isAdmin && (
                      <button
                        onClick={goToAdminDashboard}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-blue-500/10"
                      >
                        <FiGrid className="text-blue-500" />
                        داشبورد مدیریت
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/settings");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-blue-500/10"
                    >
                      <FiSettings className="text-blue-500" />
                      تنظیمات
                    </button>

                    <div className="my-1 border-t border-slate-500/15" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      <FiLogOut />
                      خروج از حساب
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeSearch();
              }
            }}
            className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-slate-950/60 px-4 pb-10 pt-[12vh] backdrop-blur-md sm:pt-[15vh]"
          >
            <motion.div
              initial={{ opacity: 0, y: -35, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              role="dialog"
              aria-modal="true"
              aria-label="جست‌وجوی موسیقی"
              dir="rtl"
              className={`relative w-full max-w-2xl overflow-hidden rounded-[28px] border shadow-2xl ${
                isDark
                  ? "border-white/10 bg-[#0d1729] text-white shadow-black/50"
                  : "border-white bg-white text-slate-900 shadow-slate-900/20"
              }`}
            >
              {/* Modal Glow */}
              <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-blue-500/15 blur-[90px]" />
              <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />

              <div className="relative p-5 sm:p-7">

                {/* Modal Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-blue-500">
                      <FiActivity size={15} />
                      TOPMUSIC SEARCH
                    </div>

                    <h2 className="mt-2 text-xl font-black sm:text-2xl">
                      دنبال چی می‌گردی؟
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={closeSearch}
                    aria-label="بستن جست‌وجو"
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                      isDark
                        ? "border-white/10 bg-white/5 text-slate-400 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    }`}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch}>
                  <div
                    className={`group flex items-center gap-3 rounded-2xl border px-4 py-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 ${
                      isDark
                        ? "border-white/10 bg-[#111e33]"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <FiSearch
                      size={23}
                      className="shrink-0 text-blue-500 transition group-focus-within:scale-110"
                    />

                    <input
                      autoFocus
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="نام آهنگ، خواننده، آلبوم..."
                      className={`w-full bg-transparent text-sm outline-none sm:text-base ${
                        isDark
                          ? "text-white placeholder:text-slate-500"
                          : "text-slate-900 placeholder:text-slate-400"
                      }`}
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label="پاک کردن جست‌وجو"
                        className="text-slate-400 transition hover:text-red-500"
                      >
                        <FiX size={18} />
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-slate-400">
                      برای جست‌وجو Enter را بزن
                    </p>

                    <button
                      type="submit"
                      disabled={!search.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <FiSearch size={15} />
                      جست‌وجو
                    </button>
                  </div>
                </form>

                {/* Popular Searches */}
                <div className="mt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold">
                      جست‌وجوهای پیشنهادی
                    </h3>

                    <span className="text-[10px] text-slate-400">
                      پیشنهاد TopMusic
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => searchPopular(item)}
                        className={`rounded-full border px-4 py-2 text-xs transition duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-500 ${
                          isDark
                            ? "border-white/10 bg-white/[0.03] text-slate-400"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div
                  className={`mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5 ${
                    isDark
                      ? "border-white/[0.07]"
                      : "border-slate-100"
                  }`}
                >
                  <p className="text-[11px] text-slate-400">
                    موسیقی مورد علاقه‌ات را پیدا کن
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <kbd className="rounded-md border border-slate-500/20 px-2 py-1">
                      ESC
                    </kbd>
                    بستن پنجره
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
