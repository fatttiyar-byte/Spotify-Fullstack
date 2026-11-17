
import { useEffect, useState } from "react";
import {
  FiSettings,
  FiMoon,
  FiSun,
  FiBell,
  FiCheckCircle,
  FiSave,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

interface Preferences {
  newMusic: boolean;
  playlistUpdates: boolean;
  accountAlerts: boolean;
}

const defaultPreferences: Preferences = {
  newMusic: true,
  playlistUpdates: true,
  accountAlerts: true,
};

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("topmusic-preferences");

      if (stored) {
        setPreferences({
          ...defaultPreferences,
          ...JSON.parse(stored),
        });
      }
    } catch {
      setPreferences(defaultPreferences);
    }
  }, []);

  const updatePreference = (key: keyof Preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      "topmusic-preferences",
      JSON.stringify(preferences)
    );

    setSaved(true);
  };

  const cardClass = isDark
    ? "border-white/10 bg-[#111C32] text-white"
    : "border-slate-200 bg-white text-slate-800";

  const descriptionClass = isDark
    ? "text-slate-400"
    : "text-slate-500";

  return (
    <div
      dir="rtl"
      className={`min-h-screen p-4 transition-colors duration-300 sm:p-6 lg:p-8 ${
        isDark ? "bg-[#080E1D]" : "bg-slate-50"
      }`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-xl shadow-blue-900/20">
            <FiSettings size={27} />
          </div>

          <div>
            <h1
              className={`text-2xl font-extrabold sm:text-3xl ${
                isDark ? "text-white" : "text-[#101D38]"
              }`}
            >
              تنظیمات
            </h1>
            <p className={`mt-1 text-sm ${descriptionClass}`}>
              مدیریت ظاهر و اعلان‌های حساب کاربری
            </p>
          </div>
        </div>

        {/* Appearance */}
        <section className={`mb-6 rounded-2xl border p-5 sm:p-6 ${cardClass}`}>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              {isDark ? <FiMoon size={21} /> : <FiSun size={21} />}
            </span>

            <div>
              <h2 className="font-bold">ظاهر برنامه</h2>
              <p className={`mt-1 text-xs ${descriptionClass}`}>
                حالت نمایش TopMusic را انتخاب کن.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => {
                if (isDark) toggleTheme();
              }}
              className={`flex items-center gap-3 rounded-xl border p-4 text-right transition ${
                !isDark
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-500/20 hover:border-blue-400/50"
              }`}
            >
              <FiSun className="text-amber-500" size={22} />
              <span className="flex-1">
                <span className="block text-sm font-bold">حالت روشن</span>
                <span className={`mt-1 block text-xs ${descriptionClass}`}>
                  Light Mode
                </span>
              </span>
              {!isDark && <FiCheckCircle className="text-blue-500" />}
            </button>

            <button
              onClick={() => {
                if (!isDark) toggleTheme();
              }}
              className={`flex items-center gap-3 rounded-xl border p-4 text-right transition ${
                isDark
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-500/20 hover:border-blue-400/50"
              }`}
            >
              <FiMoon className="text-indigo-400" size={22} />
              <span className="flex-1">
                <span className="block text-sm font-bold">حالت تاریک</span>
                <span className={`mt-1 block text-xs ${descriptionClass}`}>
                  Dark Mode
                </span>
              </span>
              {isDark && <FiCheckCircle className="text-blue-500" />}
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className={`rounded-2xl border p-5 sm:p-6 ${cardClass}`}>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <FiBell size={21} />
            </span>

            <div>
              <h2 className="font-bold">تنظیمات اعلان‌ها</h2>
              <p className={`mt-1 text-xs ${descriptionClass}`}>
                مشخص کن چه اعلان‌هایی را دریافت کنی.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {(
              [
                {
                  key: "newMusic",
                  title: "موسیقی‌های جدید",
                  description: "اطلاع از اضافه‌شدن آهنگ‌های جدید",
                },
                {
                  key: "playlistUpdates",
                  title: "تغییرات پلی‌لیست",
                  description: "اطلاع از تغییرات پلی‌لیست‌ها",
                },
                {
                  key: "accountAlerts",
                  title: "اعلان‌های حساب کاربری",
                  description: "اطلاع از تغییرات و رویدادهای حساب",
                },
              ] as const
            ).map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 border-b border-slate-500/10 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className={`mt-1 text-xs ${descriptionClass}`}>
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences[item.key]}
                  onClick={() => updatePreference(item.key)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    preferences[item.key] ? "bg-blue-500" : "bg-slate-500/30"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                      preferences[item.key] ? "right-6" : "right-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className={`text-xs ${descriptionClass}`}>
              تنظیمات اعلان‌ها در همین مرورگر ذخیره می‌شوند.
            </p>

            <button
              onClick={saveSettings}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-blue-900/30"
            >
              <FiSave size={17} />
              ذخیره تنظیمات
            </button>
          </div>

          {saved && (
            <p className="mt-4 flex items-center gap-2 text-sm text-emerald-500">
              <FiCheckCircle />
              تنظیمات با موفقیت ذخیره شد.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
