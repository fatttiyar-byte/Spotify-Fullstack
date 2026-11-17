
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiEdit2,
  FiSave,
  FiX,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogOut,
  FiShield,
  FiCheckCircle,
  FiSettings,
  FiKey,
} from "react-icons/fi";

import { useAuthStore } from "../store/authStore";
import {
  updateProfile,
  changePassword,
  logoutUser,
} from "../services/profileService";
import { useTheme } from "../context/ThemeContext";

const AdminProfile = () => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPasswords, setShowPasswords] = useState(false);

  const adminInitials = useMemo(() => {
    const parts = (user?.name || "Admin")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return (
      parts
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase() || "AD"
    );
  }, [user?.name]);

  const inputClass = `
    w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all
    focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
    ${
      isDark
        ? "border-slate-700 bg-slate-950/70 text-white placeholder:text-slate-500"
        : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400"
    }
  `;

  const cardClass = `
    rounded-2xl border p-5 sm:p-6 backdrop-blur-xl transition-colors
    ${
      isDark
        ? "border-slate-700/70 bg-slate-900/80"
        : "border-slate-200 bg-white/90 shadow-sm"
    }
  `;

  const headingClass = isDark ? "text-white" : "text-slate-800";
  const mutedClass = isDark ? "text-slate-400" : "text-slate-500";

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("نام و ایمیل را وارد کنید");
      return;
    }

    try {
      setIsSaving(true);

      const response = await updateProfile({
        name: name.trim(),
        email: email.trim(),
      });

    if (!user) {
  toast.error("اطلاعات کاربر پیدا نشد");
  return;
}

setUser({
  ...user,
  name: name.trim(),
  email: email.trim(),
});

      setIsEditing(false);
      toast.success("اطلاعات پروفایل با موفقیت ذخیره شد");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "خطا در ذخیره اطلاعات پروفایل"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("تمام فیلدهای رمز عبور را تکمیل کنید");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("رمز عبور جدید باید حداقل ۸ کاراکتر باشد");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("تکرار رمز عبور با رمز جدید مطابقت ندارد");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("رمز عبور جدید باید با رمز فعلی متفاوت باشد");
      return;
    }

    try {
      setIsChangingPassword(true);

      await changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("رمز عبور با موفقیت تغییر کرد");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "تغییر رمز عبور انجام نشد"
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm(
      "آیا از خروج از حساب مدیریت مطمئن هستید؟"
    );

    if (!confirmed) return;

    try {
      await logoutUser();
    } catch {
      // خروج محلی حتی در صورت خطای درخواست انجام می‌شود.
    } finally {
      logout();
      navigate("/login", { replace: true });
      toast.success("با موفقیت از حساب خارج شدید");
    }
  };

  return (
    <main
      dir="rtl"
      className={`relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8 ${
        isDark ? "bg-[#080f1d] text-white" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Animated background */}
      <style>
        {`
          @keyframes admin-float-one {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(60px, 40px) scale(1.12);
            }
          }

          @keyframes admin-float-two {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(-50px, -35px) scale(1.15);
            }
          }

          @keyframes admin-float-three {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-30px);
            }
          }

          .admin-glow-one {
            animation: admin-float-one 18s ease-in-out infinite;
          }

          .admin-glow-two {
            animation: admin-float-two 21s ease-in-out infinite;
          }

          .admin-glow-three {
            animation: admin-float-three 15s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .admin-glow-one,
            .admin-glow-two,
            .admin-glow-three {
              animation: none;
            }
          }
        `}
      </style>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className={`admin-glow-one absolute -right-32 -top-32 h-96 w-96 rounded-full blur-[110px] ${
            isDark ? "bg-blue-600/15" : "bg-blue-500/10"
          }`}
        />

        <div
          className={`admin-glow-two absolute -bottom-40 -left-32 h-[450px] w-[450px] rounded-full blur-[120px] ${
            isDark ? "bg-cyan-500/10" : "bg-cyan-400/15"
          }`}
        />

        <div
          className={`admin-glow-three absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full blur-[110px] ${
            isDark ? "bg-sky-500/10" : "bg-sky-400/10"
          }`}
        />
      </div>

      <div className="relative mx-auto max-w-5xl space-y-0">

      {/* Admin Header */}
<div className="flex items-center justify-start gap-4 pb-5">
  {/* Circular 3D Avatar */}
  <div
    className={`relative flex h-15 w-15 shrink-0 items-center justify-center rounded-full  ${
      isDark
        ? "border-slate-600 bg-slate-800"
        : "border-white bg-slate-100"
    }`}
  >
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-cyan-400 via-blue-600 to-slate-950 text-2xl font-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/30" />

      <span className="relative z-10">
        {adminInitials}
      </span>

      <div className="absolute left-3 top-3 h-4 w-4 rounded-full bg-white/25 blur-sm" />
    </div>
  </div>

  {/* Admin Name */}
  <div className="min-w-0 text-right">
    <h1 className={`truncate text-xl font-black sm:text-2xl ${headingClass}`}>
      {user?.name || "مدیر سیستم"}
    </h1>

    <p className={`mt-1 text-sm ${mutedClass}`}>
      مدیر پنل TopMusic
    </p>

    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
      <FiCheckCircle size={14} />
      حساب مدیریت
    </div>
         
  </div>
</div>

      

        {/* Personal information */}
        <section className={cardClass}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={`text-lg font-bold ${headingClass}`}>
                اطلاعات شخصی
              </h2>
              <p className={`mt-1 text-xs ${mutedClass}`}>
                مشخصات حساب مدیریت خود را مشاهده و ویرایش کنید
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-500 transition hover:bg-blue-500/20"
              >
                <FiEdit2 size={15} />
                ویرایش اطلاعات
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEdit}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FiX size={15} />
                انصراف
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={`mb-2 block text-sm font-semibold ${headingClass}`}>
                نام و نام خانوادگی
              </label>

              <div className="relative">
                <FiUser
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${mutedClass}`}
                />
                <input
                  type="text"
                  value={name}
                  disabled={!isEditing}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="نام مدیر"
                  className={`${inputClass} pr-11 disabled:cursor-not-allowed disabled:opacity-70`}
                />
              </div>
            </div>

            <div>
              <label className={`mb-2 block text-sm font-semibold ${headingClass}`}>
                آدرس ایمیل
              </label>

              <div className="relative">
                <FiMail
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${mutedClass}`}
                />
                <input
                  type="email"
                  value={email}
                  disabled={!isEditing}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className={`${inputClass} pr-11 disabled:cursor-not-allowed disabled:opacity-70`}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-700 to-blue-500 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave size={16} />
                {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          )}
        </section>

        {/* Account information */}
        <section className={cardClass}>
          <div className="mb-5">
            <h2 className={`text-lg font-bold ${headingClass}`}>
              اطلاعات حساب
            </h2>
            <p className={`mt-1 text-xs ${mutedClass}`}>
              جزئیات سطح دسترسی حساب کاربری
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              className={`rounded-xl border p-4 ${
                isDark
                  ? "border-slate-700/60 bg-slate-950/40"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <p className={`mb-2 text-xs ${mutedClass}`}>نقش کاربری</p>
              <div className="flex items-center gap-2">
                <FiShield className="text-blue-500" />
                <span className={`text-sm font-bold ${headingClass}`}>
                  مدیر سیستم
                </span>
              </div>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                isDark
                  ? "border-slate-700/60 bg-slate-950/40"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <p className={`mb-2 text-xs ${mutedClass}`}>وضعیت حساب</p>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-emerald-500" />
                <span className="text-sm font-bold text-emerald-500">
                  فعال
                </span>
              </div>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                isDark
                  ? "border-slate-700/60 bg-slate-950/40"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <p className={`mb-2 text-xs ${mutedClass}`}>شناسه کاربر</p>
              <span
                dir="ltr"
                title={user?._id}
                className={`block truncate text-sm font-semibold ${headingClass}`}
              >
                {user?._id || "ثبت نشده"}
              </span>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className={cardClass}>
          <div className="mb-6">
            <h2 className={`text-lg font-bold ${headingClass}`}>
              امنیت حساب
            </h2>
            <p className={`mt-1 text-xs ${mutedClass}`}>
              برای امنیت بیشتر، رمز عبور خود را به‌روزرسانی کنید
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={`mb-2 block text-sm font-semibold ${headingClass}`}>
                رمز عبور فعلی
              </label>

              <div className="relative">
                <FiLock
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${mutedClass}`}
                />

                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="رمز عبور فعلی"
                  className={`${inputClass} px-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${mutedClass} hover:text-blue-500`}
                  aria-label="نمایش یا مخفی کردن رمز عبور"
                >
                  {showPasswords ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className={`mb-2 block text-sm font-semibold ${headingClass}`}>
                رمز عبور جدید
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="حداقل ۸ کاراکتر"
                className={inputClass}
              />
            </div>

            <div>
              <label className={`mb-2 block text-sm font-semibold ${headingClass}`}>
                تکرار رمز عبور جدید
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تکرار رمز عبور جدید"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={`text-xs ${mutedClass}`}>
              رمز عبور جدید باید حداقل ۸ کاراکتر باشد.
            </p>

            <button
              type="button"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiKey size={15} />
              {isChangingPassword
                ? "در حال تغییر..."
                : "تغییر رمز عبور"}
            </button>
          </div>
        </section>

        {/* Logout */}
        <section
          className={`flex flex-col items-start justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center ${
            isDark
              ? "border-red-500/15 bg-red-500/[0.04]"
              : "border-red-100 bg-red-50/70"
          }`}
        >
          <div>
            <h2 className={`font-bold ${headingClass}`}>
              خروج از حساب
            </h2>
            <p className={`mt-1 text-xs ${mutedClass}`}>
              برای پایان دادن به نشست مدیریت از حساب خود خارج شوید.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white sm:w-auto"
          >
            <FiLogOut size={16} />
            خروج از حساب
          </button>
        </section>

        {/* Footer */}
        <div className={`flex items-center justify-center gap-2 pb-2 text-xs ${mutedClass}`}>
          <FiSettings size={13} />
          <span>TopMusic Admin Panel</span>
        </div>
      </div>
    </main>
  );
};

export default AdminProfile;
