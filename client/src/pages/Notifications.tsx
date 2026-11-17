
import { useEffect, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiMusic,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
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

const getSavedNotifications = (): NotificationItem[] => {
  try {
    const saved = localStorage.getItem("topmusic-notifications");

    if (saved) return JSON.parse(saved);

    localStorage.setItem(
      "topmusic-notifications",
      JSON.stringify(initialNotifications)
    );

    return initialNotifications;
  } catch {
    return initialNotifications;
  }
};

export default function Notifications() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    getSavedNotifications
  );

  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    const syncNotifications = () => {
      setNotifications(getSavedNotifications());
    };

    window.addEventListener("storage", syncNotifications);
    window.addEventListener("topmusic-notifications-change", syncNotifications);

    return () => {
      window.removeEventListener("storage", syncNotifications);
      window.removeEventListener(
        "topmusic-notifications-change",
        syncNotifications
      );
    };
  }, []);

  const saveNotifications = (updated: NotificationItem[]) => {
    setNotifications(updated);
    localStorage.setItem("topmusic-notifications", JSON.stringify(updated));
    window.dispatchEvent(new Event("topmusic-notifications-change"));
  };

  const markAsRead = (id: number) => {
    saveNotifications(
      notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const markAllAsRead = () => {
    saveNotifications(
      notifications.map((item) => ({ ...item, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    saveNotifications(notifications.filter((item) => item.id !== id));
  };

  const cardClass = isDark
    ? "border-white/10 bg-[#111C32] text-white"
    : "border-slate-200 bg-white text-slate-800";

  return (
    <div
      dir="rtl"
      className={`min-h-screen p-4 transition-colors duration-300 sm:p-6 lg:p-8 ${
        isDark ? "bg-[#080E1D]" : "bg-slate-50"
      }`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-xl shadow-blue-900/20">
              <FiBell size={26} />
            </div>

            <div>
              <h1
                className={`text-2xl font-extrabold sm:text-3xl ${
                  isDark ? "text-white" : "text-[#101D38]"
                }`}
              >
                اعلان‌ها
              </h1>
              <p
                className={`mt-1 text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {unreadCount} اعلان خوانده‌نشده از {notifications.length} اعلان
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-500 transition hover:bg-blue-500/20"
            >
              <FiCheckCircle size={17} />
              خواندن همه
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className={`rounded-2xl border p-10 text-center ${cardClass}`}>
              <FiBell className="mx-auto mb-4 text-slate-400" size={36} />
              <h2 className="font-bold">اعلانی وجود ندارد</h2>
              <p className="mt-2 text-sm opacity-60">
                در حال حاضر هیچ اعلانی برای نمایش وجود ندارد.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:p-5 ${cardClass} ${
                  !item.read
                    ? isDark
                      ? "border-blue-500/30 bg-blue-500/[0.04]"
                      : "border-blue-200 bg-blue-50/50"
                    : ""
                }`}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <FiMusic size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{item.title}</h3>

                      {!item.read && (
                        <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-bold text-blue-500">
                          جدید
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {item.message}
                    </p>

                    <p className="mt-2 text-xs opacity-50">{item.date}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!item.read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      title="علامت‌گذاری به‌عنوان خوانده‌شده"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition hover:bg-blue-500/20"
                    >
                      <FiCheck size={17} />
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(item.id)}
                    title="حذف اعلان"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
