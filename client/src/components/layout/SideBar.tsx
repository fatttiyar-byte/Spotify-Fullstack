
import { NavLink } from "react-router-dom";
import {
  FiActivity,
  FiDisc,
  FiHeart,
  FiHome,
  FiMusic,
  FiSettings,
  FiClock,
  FiUser,
  FiX,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";

import { useTheme } from "../../context/ThemeContext";

interface SideBarProps {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

const mainLinks = [
  { title: "خانه", path: "/", icon: FiHome },
  { title: "آلبوم‌های تازه", path: "/newalbum", icon: FiDisc },
];

const libraryLinks = [
  { title: "پلی‌لیست‌های من", path: "/playlists", icon: FiMusic },
  { title: "علاقه‌مندی‌ها", path: "/favorites", icon: FiHeart },
  { title: "تاریخچه پخش", path: "/history", icon: FiClock },
];

export default function SideBar({
  mobileOpen,
  onClose,
  collapsed,
  onToggle,
}: SideBarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group relative flex h-11 items-center rounded-xl border transition-all duration-200 active:translate-y-[2px] ${
      collapsed ? "justify-center px-0" : "gap-3 px-3"
    } ${
      isActive
        ? isDark
          ? "border-blue-400/20 bg-gradient-to-b from-blue-500/20 to-blue-900/20 text-blue-400 shadow-[0_3px_0_rgba(37,99,235,0.25)]"
          : "border-blue-200 bg-gradient-to-b from-blue-50 to-blue-100 text-blue-700 shadow-[0_3px_0_rgba(37,99,235,0.16)]"
        : isDark
          ? "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
          : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-blue-700"
    }`;

  const renderLinks = (links: typeof mainLinks | typeof libraryLinks) =>
    links.map(({ title, path, icon: Icon }) => (
      <NavLink
        key={path}
        to={path}
        end={path === "/"}
        onClick={onClose}
        title={collapsed ? title : undefined}
        className={linkClass}
      >
        <Icon
          size={19}
          className="shrink-0 transition-transform duration-200 group-hover:scale-110"
        />
        {!collapsed && (
          <span className="whitespace-nowrap text-[13px] font-medium">
            {title}
          </span>
        )}
      </NavLink>
    ));

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="بستن منو"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-dvh flex-col overflow-visible border-l transition-[width,transform] duration-300 ease-in-out ${
          collapsed ? "lg:w-[82px]" : "lg:w-[255px]"
        } w-[255px] ${
          isDark
            ? "border-white/[0.06] bg-[#0C1426] text-white"
            : "border-slate-200 bg-white text-[#14213D]"
        } ${
          mobileOpen
            ? "translate-x-0"
            : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className={`relative z-10 flex h-[76px] shrink-0 items-center border-b border-slate-500/10 ${
            collapsed ? "justify-center" : "justify-between px-5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 text-white shadow-[0_5px_12px_rgba(37,99,235,0.25)]">
              <FiActivity size={22} />
            </div>

            {!collapsed && (
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">
                  Top<span className="text-blue-500">Music</span>
                </h1>
                <p className="mt-0.5 text-[9px] tracking-[3px] text-slate-400">
                  FEEL THE MUSIC
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="بستن منو"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-500/10 hover:text-blue-500 lg:hidden"
          >
            <FiX size={20} />
          </button>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
          title={collapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
          className={`absolute -left-4 top-[88px] z-[60] hidden h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110 active:translate-y-[2px] lg:flex ${
            isDark
              ? "border-blue-400/50 bg-gradient-to-b from-[#263d60] to-[#101c31] text-blue-300 shadow-[0_4px_0_#080e1a,0_7px_14px_rgba(0,0,0,0.4)] hover:from-blue-500 hover:to-blue-700 hover:text-white"
              : "border-blue-200 bg-gradient-to-b from-white to-blue-100 text-blue-600 shadow-[0_4px_0_#b6c9e8,0_7px_14px_rgba(15,23,42,0.15)] hover:from-blue-500 hover:to-blue-700 hover:text-white"
          }`}
        >
          {collapsed ? (
            <FiChevronLeft size={16} />
          ) : (
            <FiChevronRight size={16} />
          )}
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-7 pb-4">
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-bold tracking-[2px] text-slate-400/60">
              منوی اصلی
            </p>
          )}

          <nav className="space-y-2">{renderLinks(mainLinks)}</nav>

          <div className="my-5 h-px bg-slate-500/10" />

          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-bold tracking-[2px] text-slate-400/60">
              کتابخانه من
            </p>
          )}

          <nav className="space-y-2">{renderLinks(libraryLinks)}</nav>
        </div>

        <div className="shrink-0 border-t border-slate-500/10 p-3">
          <nav className="space-y-1">
            <NavLink
              to="/profile"
              onClick={onClose}
              title={collapsed ? "پروفایل کاربری" : undefined}
              className={linkClass}
            >
              <FiUser size={19} />
              {!collapsed && (
                <span className="text-[13px] font-medium">
                  پروفایل کاربری
                </span>
              )}
            </NavLink>

            <NavLink
              to="/settings"
              onClick={onClose}
              title={collapsed ? "تنظیمات" : undefined}
              className={linkClass}
            >
              <FiSettings size={19} />
              {!collapsed && (
                <span className="text-[13px] font-medium">تنظیمات</span>
              )}
            </NavLink>
          </nav>

          {!collapsed && (
            <p className="mt-3 text-center text-[9px] tracking-wide text-slate-400/40">
              TopMusic · Your music world
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
