import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiActivity,
  FiAlertCircle,
  FiCompass,
  FiEye,
  FiEyeOff,
  FiHeadphones,
  FiHeart,
  FiLock,
  FiLogIn,
  FiMail,
  FiMusic,
  FiShield,
  FiUser,
} from "react-icons/fi";

import { loginUser } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../context/ThemeContext";

type Mode = "user" | "admin";

const modes: { key: Mode; title: string; icon: typeof FiUser }[] = [
  { key: "user", title: "ورود کاربر", icon: FiUser },
  { key: "admin", title: "ورود مدیر", icon: FiShield },
];

const features = [
  { icon: FiCompass, text: "کشف هزاران آهنگ و آلبوم جدید" },
  { icon: FiHeart, text: "علاقه‌مندی‌ها و پلی‌لیست‌های شخصی" },
  { icon: FiHeadphones, text: "پخش باکیفیت، هر جا و هر زمان" },
];

function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [mode, setMode] = useState<Mode>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdminMode = mode === "admin";

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setError("");
    setPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await loginUser({ email, password });

      // در تب مدیر، فقط حساب ادمین پذیرفته می‌شود (قبل از ذخیره‌ی نشست)
      if (isAdminMode && response.user.role !== "admin") {
        setError("این حساب دسترسی مدیریتی ندارد.");
        return;
      }

      setAuth(response.user, response.token);

      navigate(response.user.role === "admin" ? "/admin" : "/profile", {
        replace: true,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "ورود انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- کلاس‌های وابسته به تم ---------- */
  const pageBg = isDark ? "bg-[#080E1D]" : "bg-slate-100";

  const cardClass = isDark
    ? "border-white/[0.06] bg-[#0C1426] text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
    : "border-slate-200 bg-white text-[#14213D] shadow-[0_20px_60px_rgba(15,23,42,0.12)]";

  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  const labelClass = `mb-2 block text-[13px] font-medium ${
    isDark ? "text-slate-300" : "text-slate-700"
  }`;

  const inputClass = `w-full rounded-xl border py-3 pr-11 pl-4 text-sm outline-none transition ${
    isDark
      ? "border-white/10 bg-[#0D1629] text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
      : "border-slate-200 bg-slate-50 text-[#14213D] placeholder:text-slate-400 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
  }`;

  const tabsWrapClass = isDark
    ? "border-white/10 bg-[#0D1629]"
    : "border-slate-200 bg-slate-100";

  const tabClass = (active: boolean) =>
    `flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border text-[13px] font-semibold transition-all duration-200 active:translate-y-[2px] ${
      active
        ? isDark
          ? "border-blue-400/20 bg-gradient-to-b from-blue-500/20 to-blue-900/20 text-blue-400 shadow-[0_3px_0_rgba(37,99,235,0.25)]"
          : "border-blue-200 bg-gradient-to-b from-blue-50 to-blue-100 text-blue-700 shadow-[0_3px_0_rgba(37,99,235,0.16)]"
        : isDark
          ? "border-transparent text-slate-400 hover:text-white"
          : "border-transparent text-slate-500 hover:text-blue-700"
    }`;

  return (
    <div
      dir="rtl"
      className={`relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10 ${pageBg}`}
    >
      {/* نورهای تزئینی پس‌زمینه */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-blue-800/20 blur-3xl" />

      <div
        className={`relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border lg:grid-cols-[1.05fr_1fr] ${cardClass}`}
      >
        {/* ---------- پنل برند (فقط دسکتاپ) ---------- */}
        <aside
          className={`relative hidden flex-col justify-between overflow-hidden p-10 lg:flex ${
            isDark
              ? "bg-gradient-to-br from-blue-500/15 via-blue-900/10 to-transparent"
              : "bg-gradient-to-br from-blue-50 to-white"
          } border-l ${isDark ? "border-white/[0.06]" : "border-slate-200"}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 text-white shadow-[0_5px_12px_rgba(37,99,235,0.35)]">
              <FiActivity size={23} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Top<span className="text-blue-500">Music</span>
              </h2>
              <p className="mt-0.5 text-[9px] tracking-[3px] text-slate-400">
                FEEL THE MUSIC
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-extrabold leading-snug">
              دنیای موسیقی
              <br />
              <span className="text-blue-500">همین‌جاست.</span>
            </h3>
            <p className={`mt-3 max-w-xs text-sm leading-7 ${mutedText}`}>
              وارد حساب خود شوید و تجربه‌ای تازه از شنیدن موسیقی داشته باشید.
            </p>

            <ul className="mt-8 space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-[13px] ${
                    isDark
                      ? "border-white/[0.06] bg-white/[0.03]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-gradient-to-br from-blue-400/20 to-blue-700/10 text-blue-400 shadow-[0_3px_0_rgba(37,99,235,0.2)]">
                    <Icon size={17} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-center text-[10px] tracking-wide text-slate-400/60">
            TopMusic · Your music world
          </p>

          <FiMusic
            size={220}
            className="pointer-events-none absolute -bottom-10 -left-10 text-blue-500/[0.05]"
          />
        </aside>

        {/* ---------- فرم ---------- */}
        <section className="p-7 sm:p-10">
          {/* برند در موبایل */}
          <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 text-white shadow-[0_5px_12px_rgba(37,99,235,0.35)]">
              <FiActivity size={22} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Top<span className="text-blue-500">Music</span>
            </h2>
          </div>

          {/* انتخاب نوع ورود */}
          <div
            role="tablist"
            aria-label="نوع ورود"
            className={`mb-8 flex gap-2 rounded-2xl border p-1.5 ${tabsWrapClass}`}
          >
            {modes.map(({ key, title, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => switchMode(key)}
                className={tabClass(mode === key)}
              >
                <Icon size={16} />
                {title}
              </button>
            ))}
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold">
              {isAdminMode ? "ورود به پنل مدیریت" : "خوش آمدی "}
            </h1>
            <p className={`mt-2 text-sm ${mutedText}`}>
              {isAdminMode
                ? "فقط مدیران سیستم به این بخش دسترسی دارند."
                : "برای ادامه وارد حساب کاربری خود شوید."}
            </p>
          </div>

          <form onSubmit={handleLogin} noValidate={false}>
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-[13px] text-red-400"
              >
                <FiAlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="email" className={labelClass}>
                ایمیل
              </label>
              <div className="relative">
                <FiMail
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${mutedText}`}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    isAdminMode ? "admin@example.com" : "example@gmail.com"
                  }
                  required
                  dir="ltr"
                  className={`${inputClass} text-left`}
                />
              </div>
            </div>

            <div className="mb-7">
              <label htmlFor="password" className={labelClass}>
                رمز عبور
              </label>
              <div className="relative">
                <FiLock
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${mutedText}`}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور خود را وارد کنید"
                  required
                  className={`${inputClass} pl-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"
                  }
                  className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition hover:text-blue-500 ${mutedText}`}
                >
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-gradient-to-b from-blue-500 to-blue-700 text-sm font-bold text-white shadow-[0_4px_0_#1e40af] transition-all hover:from-blue-400 hover:to-blue-600 active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAdminMode ? <FiShield size={17} /> : <FiLogIn size={17} />}
              {loading
                ? "در حال ورود..."
                : isAdminMode
                  ? "ورود به پنل مدیریت"
                  : "ورود به حساب"}
            </button>
          </form>

          {!isAdminMode && (
            <p className={`mt-7 text-center text-[13px] ${mutedText}`}>
              حساب کاربری نداری؟{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-500 transition hover:text-blue-400"
              >
                ثبت‌نام کن
              </Link>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Login;