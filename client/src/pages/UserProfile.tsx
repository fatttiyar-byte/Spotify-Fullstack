
import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FiUser,
  FiMail,
  FiLock,
  FiEdit3,
  FiLogOut,
  FiX,
  FiCheck,
  FiMusic,
  FiShield,
  FiCamera,
  FiTrash2,
  FiSettings,
  FiKey,
  FiHeadphones,
  FiChevronLeft,
} from "react-icons/fi";

import type { User } from "../store/authStore";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../context/ThemeContext";

import {
  updateProfile,
  changePassword,
  logoutUser,
  uploadProfileImage,
  deleteProfileImage,
} from "../services/profileService";

import Playlists from "./Playlists";

interface Props {
  user: User;
}

type ProfileTab = "profile" | "playlist" | "settings";

function UserProfile({ user }: Props) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [isScrolled, setIsScrolled] = useState(false);

  // Profile
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [editMode, setEditMode] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Profile image
  const [profileImage, setProfileImage] = useState(
    user.profileImage || ""
  );
  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Loading
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const firstName = user.name?.trim().split(" ")[0] || "کاربر";

  // Scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 180);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync user
  useEffect(() => {
    setName(user.name || "");
    setEmail(user.email || "");
    setProfileImage(user.profileImage || "");
  }, [user.name, user.email, user.profileImage]);

  // Release preview URL
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Theme
  const pageBg = isDark
    ? "bg-[#080f1d] text-white"
    : "bg-[#f3f7fd] text-slate-900";

  const surface = isDark
    ? "border-white/[0.08] bg-[#111d30]"
    : "border-slate-200 bg-white";

  const mutedText = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const primaryText = isDark
    ? "text-white"
    : "text-slate-900";

  const inputStyle = `
    w-full rounded-xl border px-4 py-3.5 text-sm outline-none
    transition-all duration-200 disabled:cursor-not-allowed
    ${
      isDark
        ? "border-white/10 bg-[#0a1527] text-white placeholder:text-slate-600 focus:border-blue-400"
        : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
    }
  `;

  const primaryButton = `
    inline-flex items-center justify-center gap-2 rounded-xl
    bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500
    px-5 py-3 text-sm font-bold text-white
    shadow-lg shadow-blue-600/20 transition-all duration-200
    hover:-translate-y-0.5 hover:shadow-blue-600/30
    active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50
  `;

  const secondaryButton = `
    inline-flex items-center justify-center gap-2 rounded-xl
    border px-4 py-3 text-sm font-semibold transition-all duration-200
    ${
      isDark
        ? "border-white/10 bg-white/[0.04] text-slate-300 hover:border-blue-400/40 hover:bg-blue-500/10"
        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
    }
  `;

  const tabs: {
    id: ProfileTab;
    label: string;
    icon: typeof FiUser;
  }[] = [
    { id: "profile", label: "اطلاعات شخصی", icon: FiUser },
    { id: "playlist", label: "پلی‌لیست من", icon: FiMusic },
    { id: "settings", label: "امنیت حساب", icon: FiSettings },
  ];

  // Select image
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("لطفاً یک تصویر معتبر انتخاب کنید.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
      e.target.value = "";
      return;
    }

    if (previewImage) URL.revokeObjectURL(previewImage);

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // Upload image
  const handleUploadImage = async () => {
    if (!selectedFile || imageLoading) return;

    try {
      setImageLoading(true);

      const response = await uploadProfileImage(selectedFile);

      if (!response.success || !response.profileImage) {
        throw new Error(response.message || "آپلود تصویر ناموفق بود.");
      }

      const imageUrl = response.profileImage;

      setProfileImage(imageUrl);
      setPreviewImage("");
      setSelectedFile(null);

      setUser({
        ...user,
        profileImage: imageUrl,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("تصویر پروفایل با موفقیت تغییر کرد.");
    } catch (err: any) {
      console.error("Upload profile image error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "آپلود تصویر انجام نشد."
      );
    } finally {
      setImageLoading(false);
    }
  };

  // Cancel image
  const handleCancelImage = () => {
    if (previewImage) URL.revokeObjectURL(previewImage);

    setPreviewImage("");
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Delete image
  const handleDeleteImage = async () => {
    if (!profileImage || imageLoading) return;

    if (!window.confirm("آیا از حذف تصویر پروفایل مطمئن هستید؟")) {
      return;
    }

    try {
      setImageLoading(true);

      const response = await deleteProfileImage();

      if (!response.success) {
        throw new Error(response.message || "حذف تصویر ناموفق بود.");
      }

      setProfileImage("");

      setUser({
        ...user,
        profileImage: "",
      });

      toast.success("تصویر پروفایل حذف شد.");
    } catch (err: any) {
      console.error("Delete profile image error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "حذف تصویر انجام نشد."
      );
    } finally {
      setImageLoading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async () => {
    if (loading) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      toast.error("نام و ایمیل را وارد کنید.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("فرمت ایمیل معتبر نیست.");
      return;
    }

    try {
      setLoading(true);

      const response = await updateProfile({
        name: trimmedName,
        email: trimmedEmail,
      });

      if (!response.success || !response.user) {
        throw new Error(response.message || "ویرایش پروفایل ناموفق بود.");
      }

      const updatedUser: User = {
        ...user,
        name: response.user.name,
        email: response.user.email,
        profileImage,
      };

      setUser(updatedUser);
      setName(updatedUser.name);
      setEmail(updatedUser.email);
      setEditMode(false);

      toast.success("اطلاعات پروفایل ذخیره شد.");
    } catch (err: any) {
      console.error("Update profile error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "ویرایش اطلاعات انجام نشد."
      );
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("تمام فیلدها را پر کنید.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("رمز جدید باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("تکرار رمز عبور مطابقت ندارد.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("رمز جدید باید با رمز فعلی متفاوت باشد.");
      return;
    }

    try {
      setLoading(true);

      await changePassword({
        currentPassword,
        newPassword,
      });

      toast.success("رمز عبور با موفقیت تغییر کرد.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);

      logout();

      navigate("/login", {
        replace: true,
        state: {
          message: "رمز عبور تغییر کرد. دوباره وارد شوید.",
        },
      });
    } catch (err: any) {
      console.error("Change password error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "تغییر رمز عبور انجام نشد."
      );
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await logoutUser();
      toast.success("با موفقیت از حساب خارج شدید.");
    } catch (err) {
      console.error("Logout request failed:", err);
      toast.error("ارتباط با سرور برقرار نشد؛ خروج انجام شد.");
    } finally {
      logout();
      navigate("/login", { replace: true });
      setLoading(false);
    }
  };

  // Tab style
  const getTabClass = (tab: ProfileTab) => {
    const active = activeTab === tab;

    if (active) {
      return "bg-gradient-to-l from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-600/20";
    }

    return isDark
      ? "text-slate-400 hover:bg-white/[0.05] hover:text-blue-400"
      : "text-slate-500 hover:bg-blue-50 hover:text-blue-600";
  };

  return (
    <main
      dir="rtl"
      className={`relative min-h-screen w-full overflow-x-hidden pb-10 transition-colors duration-300 ${pageBg}`}
    >
      {/* Sticky header */}
      <div
        className={`fixed inset-x-0 top-0 z-[60] border-b backdrop-blur-xl transition-all duration-300 ${
          isScrolled
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        } ${
          isDark
            ? "border-white/10 bg-[#0b1424]/95"
            : "border-slate-200 bg-white/95"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-7">
          <div className="rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-[2px] shadow-md shadow-blue-500/20">
            <div className={`h-10 w-10 overflow-hidden rounded-full ${isDark ? "bg-[#111d31]" : "bg-white"}`}>
              {profileImage ? (
                <img src={profileImage} alt="تصویر پروفایل" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                  <FiUser size={20} />
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <p className={`truncate text-sm font-bold ${primaryText}`}>
              {user.name || "کاربر TopMusic"}
            </p>
            <p className={`text-[10px] ${mutedText}`}>پروفایل کاربری</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-7 lg:px-10">
        {/* Breadcrumb */}
        <div className={`mb-8 flex items-center gap-2 text-xs ${mutedText}`}>
          <FiHeadphones className="text-blue-500" size={17} />
          <span className="font-bold">TopMusic</span>
          <FiChevronLeft size={13} />
          <span className={primaryText}>پروفایل کاربری</span>
        </div>

        {/* Profile hero */}
        <section className={`relative overflow-hidden rounded-[28px] border p-5 shadow-xl transition-colors duration-300 sm:p-8 lg:p-10 ${
          isDark
            ? "border-blue-400/10 bg-gradient-to-br from-[#142744] via-[#101d32] to-[#0c1729] shadow-black/20"
            : "border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 shadow-blue-900/[0.06]"
        }`}>
          <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative grid grid-cols-1 items-center gap-8 sm:grid-cols-[190px_1fr] sm:gap-10 lg:grid-cols-[230px_1fr] lg:gap-14">
            {/* Avatar */}
            <div className="flex justify-center sm:justify-start">
              <div className="relative">
                <div className="rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-700 p-[5px] shadow-2xl shadow-blue-600/25">
                  <div className={`rounded-full p-1 ${isDark ? "bg-[#101d32]" : "bg-white"}`}>
                    <div className="h-36 w-36 overflow-hidden rounded-full sm:h-40 sm:w-40 lg:h-48 lg:w-48">
                      {previewImage || profileImage ? (
                        <img src={previewImage || profileImage} alt="تصویر پروفایل" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white">
                          <FiUser size={76} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageLoading}
                  title="تغییر تصویر پروفایل"
                  className="absolute bottom-2 left-2 flex h-12 w-12 items-center justify-center rounded-full border-[4px] border-white bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl transition hover:scale-105 disabled:opacity-50"
                >
                  <FiCamera size={19} />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* User information */}
            <div className="min-w-0 text-center sm:text-right">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <h1 className={`max-w-full break-words text-2xl font-black sm:text-3xl lg:text-4xl ${primaryText}`}>
                  {user.name || "کاربر TopMusic"}
                </h1>

                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-extrabold tracking-wide text-blue-500">
                  MEMBER
                </span>
              </div>

              <p className={`mt-3 break-all text-sm ${mutedText}`} dir="ltr">
                {user.email}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-[11px] font-bold text-blue-500">
                  <FiUser size={13} />
                  حساب کاربری
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-bold text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  فعال
                </span>
              </div>

              <div className="mx-auto mt-6 max-w-xl sm:mx-0">
                <p className={`text-sm leading-8 ${mutedText}`}>
                  سلام {firstName}، به فضای شخصی خودت در TopMusic خوش آمدی.
                  اینجا می‌توانی اطلاعات حساب و آهنگ‌های مورد علاقه‌ات را مدیریت کنی.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-3 sm:justify-start">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("profile");
                    setEditMode(true);
                  }}
                  className={primaryButton}
                >
                  <FiEdit3 size={16} />
                  ویرایش پروفایل
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("settings");
                    setShowPasswordForm(false);
                  }}
                  className={secondaryButton}
                >
                  <FiShield size={16} />
                  امنیت حساب
                </button>
              </div>

              {selectedFile && (
                <div className={`mt-5 flex flex-wrap items-center justify-center gap-3 rounded-2xl border p-3 sm:justify-start ${surface}`}>
                  <span className={`max-w-full truncate text-xs ${mutedText}`}>
                    {selectedFile.name}
                  </span>

                  <button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={imageLoading}
                    className={primaryButton}
                  >
                    <FiCheck size={15} />
                    {imageLoading ? "در حال آپلود..." : "ثبت تصویر"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelImage}
                    disabled={imageLoading}
                    className={secondaryButton}
                  >
                    <FiX size={15} />
                    لغو
                  </button>
                </div>
              )}

              {profileImage && !selectedFile && (
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  disabled={imageLoading}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-red-500 transition hover:text-red-400 disabled:opacity-50"
                >
                  <FiTrash2 size={14} />
                  حذف تصویر پروفایل
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav className={`mt-8 flex items-center gap-2 overflow-x-auto rounded-2xl border p-2 shadow-sm ${
          isDark
            ? "border-white/[0.08] bg-[#111d30]"
            : "border-slate-200 bg-white"
        }`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-3.5 text-xs font-bold transition-all duration-300 sm:px-5 sm:text-sm ${getTabClass(tab.id)}`}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Profile tab */}
        {activeTab === "profile" && (
          <section className="mt-7 space-y-5">
            <div className={`rounded-2xl border p-5 shadow-sm sm:p-8 ${surface}`}>
              <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className={`text-lg font-extrabold ${primaryText}`}>
                    اطلاعات شخصی
                  </h2>
                  <p className={`mt-2 text-xs ${mutedText}`}>
                    مشخصات حساب کاربری خود را مشاهده و ویرایش کن.
                  </p>
                </div>

                {!editMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setName(user.name || "");
                      setEmail(user.email || "");
                      setEditMode(true);
                    }}
                    className={secondaryButton}
                  >
                    <FiEdit3 size={15} />
                    ویرایش اطلاعات
                  </button>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-xs font-bold ${mutedText}`}>
                    نام و نام خانوادگی
                  </label>
                  <div className="relative">
                    <FiUser className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!editMode || loading}
                      className={`${inputStyle} pr-11`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`mb-2 block text-xs font-bold ${mutedText}`}>
                    آدرس ایمیل
                  </label>
                  <div className="relative">
                    <FiMail className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!editMode || loading}
                      className={`${inputStyle} pr-11`}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {editMode && (
                <div className="mt-7 flex flex-wrap gap-3 border-t border-slate-500/10 pt-6">
                  <button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className={primaryButton}
                  >
                    <FiCheck size={16} />
                    {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setName(user.name || "");
                      setEmail(user.email || "");
                      setEditMode(false);
                    }}
                    disabled={loading}
                    className={secondaryButton}
                  >
                    <FiX size={16} />
                    انصراف
                  </button>
                </div>
              )}
            </div>

            <div className={`flex flex-col gap-4 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 ${surface}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <FiShield size={22} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${primaryText}`}>
                    وضعیت حساب کاربری
                  </p>
                  <p className={`mt-1 text-xs ${mutedText}`}>
                    حساب کاربری شما فعال است.
                  </p>
                </div>
              </div>
              <span className="w-fit rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-500">
                فعال
              </span>
            </div>
          </section>
        )}

        {/* Playlist tab */}
        {activeTab === "playlist" && (
          <section className={`mt-7 overflow-hidden rounded-2xl border p-4 shadow-sm transition-colors duration-300 sm:p-7 ${surface}`}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <FiMusic size={22} />
                </div>

                <div>
                  <h2 className={`font-extrabold ${primaryText}`}>
                    پلی‌لیست شخصی من
                  </h2>
                  <p className={`mt-1 text-xs ${mutedText}`}>
                    آهنگ‌هایی که به مجموعه شخصی خودت اضافه کرده‌ای
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-500">
                TopMusic Playlist
              </span>
            </div>

            {/* کامپوننت اصلی پلی‌لیست کاربر */}
            <div className="min-w-0">
              <Playlists />
            </div>
          </section>
        )}

        {/* Settings tab */}
        {activeTab === "settings" && (
          <section className="mt-7 space-y-5">
            <div className={`rounded-2xl border p-5 shadow-sm sm:p-8 ${surface}`}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <FiLock size={22} />
                </div>
                <div>
                  <h2 className={`font-extrabold ${primaryText}`}>
                    امنیت و رمز عبور
                  </h2>
                  <p className={`mt-1 text-xs ${mutedText}`}>
                    برای حفظ امنیت حساب، رمز عبور خود را مدیریت کن.
                  </p>
                </div>
              </div>

              {!showPasswordForm ? (
                <div className={`flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between ${
                  isDark ? "bg-white/[0.04]" : "bg-blue-50"
                }`}>
                  <div>
                    <p className={`text-sm font-bold ${primaryText}`}>
                      تغییر رمز عبور
                    </p>
                    <p className={`mt-2 text-xs ${mutedText}`}>
                      می‌توانی رمز عبور فعلی خود را با رمز جدید جایگزین کنی.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(true)}
                    className={primaryButton}
                  >
                    <FiKey size={16} />
                    تغییر رمز
                  </button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className={`mb-2 block text-xs font-bold ${mutedText}`}>
                      رمز عبور فعلی
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={loading}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={`mb-2 block text-xs font-bold ${mutedText}`}>
                      رمز عبور جدید
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={loading}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={`mb-2 block text-xs font-bold ${mutedText}`}>
                      تکرار رمز عبور جدید
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={loading}
                      className={inputStyle}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className={primaryButton}
                    >
                      <FiCheck size={16} />
                      {loading ? "در حال تغییر..." : "ثبت رمز جدید"}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className={secondaryButton}
                    >
                      <FiX size={16} />
                      انصراف
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Logout */}
            <div className={`flex flex-col gap-4 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 ${surface}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                  <FiLogOut size={21} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${primaryText}`}>
                    خروج از حساب کاربری
                  </h3>
                  <p className={`mt-1 text-xs ${mutedText}`}>
                    خروج از حساب کاربری در این دستگاه
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                <FiLogOut size={16} />
                {loading ? "در حال خروج..." : "خروج از حساب"}
              </button>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className={`mt-10 flex flex-wrap items-center justify-center gap-2 text-[11px] ${mutedText}`}>
          <FiHeadphones size={14} />
          <span className="font-bold tracking-wider">TOPMUSIC</span>
          <span>·</span>
          <span>موسیقی، دنیای تو</span>
        </footer>
      </div>
    </main>
  );
}

export default UserProfile;
