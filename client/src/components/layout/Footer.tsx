
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowUp,
  FiDisc,
  FiHeart,
  FiHome,
  FiMusic,
  FiClock,
  FiUser,
  FiSettings,
  FiHeadphones,
  FiInstagram,
  FiMail,
  FiChevronLeft,
} from "react-icons/fi";

import { useTheme } from "../../context/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const footerBg = isDark
    ? "bg-[#0C1426]"
    : "bg-[#F8FAFF]";

  const heading = isDark
    ? "text-white"
    : "text-[#14213D]";

  const muted = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const border = isDark
    ? "border-white/[0.07]"
    : "border-slate-200";

  const iconBox = `
    flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center
    rounded-xl border border-blue-400/30
    bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-800
    text-white
    shadow-[0_4px_0_#142c62,0_7px_12px_rgba(37,99,235,0.25),inset_0_1px_2px_rgba(255,255,255,0.5)]
    transition-all duration-300
    hover:-translate-y-1
    hover:shadow-[0_6px_0_#142c62,0_12px_18px_rgba(37,99,235,0.3)]
    active:translate-y-[2px]
    active:shadow-[0_1px_0_#142c62]
  `;

  const socialBox = `
    flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center
    rounded-xl border transition-all duration-300
    hover:-translate-y-1 hover:border-blue-500/40
    hover:bg-blue-500 hover:text-white
    ${
      isDark
        ? "border-white/10 bg-white/[0.04] text-slate-400"
        : "border-slate-200 bg-white text-slate-500 shadow-sm"
    }
  `;

  const linkClass = `
    group flex min-w-0 items-center gap-2
    text-xs sm:text-[13px]
    transition-all duration-200
    hover:translate-x-[-3px] hover:text-blue-500
    ${muted}
  `;

  const sectionTitle = `mb-4 sm:mb-6 text-sm font-extrabold ${heading}`;

  return (
    <footer
      dir="rtl"
      className={`relative mt-10 sm:mt-14 lg:mt-16 w-full overflow-hidden border-t ${border} ${footerBg}`}
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -right-24 -top-10 h-48 w-48 rounded-full bg-blue-600/10 blur-[85px] sm:h-72 sm:w-72" />

      <div className="pointer-events-none absolute -bottom-16 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-[85px] sm:h-72 sm:w-72" />

      <div className="relative mx-auto w-full max-w-[1500px] px-4 py-0 sm:px-6 lg:px-10 xl:px-12">

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 py-9 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 sm:py-11 lg:grid-cols-4 lg:gap-10 lg:py-14">

          {/* Brand */}
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex max-w-full items-center gap-3">
             
               

              <div className="min-w-0">
                <h2 className={`text-xl font-black sm:text-2xl ${heading}`}>
                  Top<span className="text-blue-500">Music</span>
                </h2>

                <p className="mt-0.5 text-[8px] tracking-[2.5px] text-slate-400 sm:text-[9px] sm:tracking-[3px]">
                  FEEL THE MUSIC
                </p>
              </div>
            </Link>

            <p className={`mt-4 max-w-sm text-xs leading-7 sm:mt-5 sm:text-[13px] sm:leading-8 ${muted}`}>
              دنیایی از موسیقی، جایی برای کشف آهنگ‌های
              جدید، خوانندگان محبوب و ساخت لحظه‌هایی
              فراموش‌نشدنی با موسیقی.
            </p>

            {/* Social Links */}
            <div className="mt-5 flex items-center gap-2.5 sm:mt-6 sm:gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className={socialBox}
              >
                <FiInstagram size={17} />
              </a>

              <a
                href="#"
                aria-label="Music"
                className={socialBox}
              >
                <FiMusic size={17} />
              </a>

              <a
                href="mailto:support@topmusic.com"
                aria-label="Email"
                className={socialBox}
              >
                <FiMail size={17} />
              </a>
            </div>
          </div>

          {/* Quick Access */}
          <div className="min-w-0">
            <h3 className={sectionTitle}>
              دسترسی سریع
            </h3>

            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link to="/" className={linkClass}>
                  <FiHome className="shrink-0" size={15} />
                  صفحه اصلی
                </Link>
              </li>

              <li>
                <Link to="/newalbum" className={linkClass}>
                  <FiDisc className="shrink-0" size={15} />
                  آلبوم‌های تازه
                </Link>
              </li>

              <li>
                <Link to="/playlists" className={linkClass}>
                  <FiMusic className="shrink-0" size={15} />
                  پلی‌لیست‌های من
                </Link>
              </li>

              <li>
                <Link to="/favorites" className={linkClass}>
                  <FiHeart className="shrink-0" size={15} />
                  علاقه‌مندی‌ها
                </Link>
              </li>
            </ul>
          </div>

          {/* Library */}
          <div className="min-w-0">
            <h3 className={sectionTitle}>
              کتابخانه موسیقی
            </h3>

            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link to="/history" className={linkClass}>
                  <FiClock className="shrink-0" size={15} />
                  تاریخچه پخش
                </Link>
              </li>

              <li>
                <Link to="/playlists" className={linkClass}>
                  <FiHeadphones className="shrink-0" size={15} />
                  مجموعه پلی‌لیست‌ها
                </Link>
              </li>

              <li>
                <Link to="/favorites" className={linkClass}>
                  <FiHeart className="shrink-0" size={15} />
                  آهنگ‌های محبوب
                </Link>
              </li>

              <li>
                <Link to="/profile" className={linkClass}>
                  <FiUser className="shrink-0" size={15} />
                  حساب کاربری
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <h3 className={sectionTitle}>
              حساب کاربری و پشتیبانی
            </h3>

            <p className={`max-w-sm text-xs leading-7 sm:text-[13px] sm:leading-8 ${muted}`}>
              تنظیمات حساب و اطلاعات کاربری خودت را
              مدیریت کن و از تجربه موسیقی لذت ببر.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:max-w-lg lg:grid-cols-1">
              <Link
                to="/profile"
                className="group flex min-w-0 items-center justify-between gap-2 rounded-xl border border-blue-500/15 bg-blue-500/[0.06] px-3 py-3 transition hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-blue-500">
                  <FiUser className="shrink-0" size={15} />
                  پروفایل من
                </span>

                <FiChevronLeft
                  size={15}
                  className="shrink-0 text-blue-500 transition-transform group-hover:-translate-x-1"
                />
              </Link>

              <Link
                to="/settings"
                className={`group flex min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-3 transition hover:border-blue-500/40 ${
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className={`flex min-w-0 items-center gap-2 text-xs font-semibold ${heading}`}>
                  <FiSettings className="shrink-0" size={15} />
                  تنظیمات حساب
                </span>

                <FiChevronLeft
                  size={15}
                  className={`shrink-0 ${muted} transition-transform group-hover:-translate-x-1`}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`flex flex-col items-center gap-4 border-t py-5 sm:py-6 lg:flex-row lg:justify-between ${border}`}
        >
          <p className={`text-center text-[10px] leading-6 sm:text-[11px] ${muted}`}>
            © {new Date().getFullYear()} TopMusic
            {" "} | تمامی حقوق محفوظ است.
          </p>

          <div className={`flex items-center justify-center gap-2 text-[11px] sm:text-[12px] ${muted}`}>
            ساخته شده توسط: Fatiyar
            <FiHeart
              size={15}
              className="fill-blue-500 text-blue-500"
            />
          </div>

          {/* Back To Top */}
          <button
            type="button"
            onClick={scrollToTop}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-2.5 text-xs font-bold text-blue-500 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0 sm:w-auto"
          >
            بازگشت به بالا

            <span className="transition-transform group-hover:-translate-y-1">
              <FiArrowUp size={15} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
