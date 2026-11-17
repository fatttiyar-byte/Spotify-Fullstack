
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";

import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      navigate("/login", {
        state: {
          message: response.message || "ثبت‌نام با موفقیت انجام شد.",
          email,
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message || "ثبت‌نام انجام نشد."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080E1D] px-4 py-8"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <form
        onSubmit={handleRegister}
        className="relative z-10 w-full max-w-md rounded-3xl border border-blue-400/10 bg-[#0D1629]/90 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-cyan-400/10 text-blue-400">
            <FiUserPlus size={30} />
          </div>

          <h1 className="text-2xl font-bold text-white">
            عضویت در <span className="text-blue-400">TopMusic</span>
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            حساب کاربری خودت رو بساز و از موسیقی لذت ببر
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <label className="mb-2 block text-sm text-gray-300">
            نام
          </label>

          <div className="relative">
            <FiUser className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام خود را وارد کنید"
              required
              className="w-full rounded-xl border border-white/10 bg-[#080E1D] py-3 pr-11 pl-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="mb-2 block text-sm text-gray-300">
            ایمیل
          </label>

          <div className="relative">
            <FiMail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
              className="w-full rounded-xl border border-white/10 bg-[#080E1D] py-3 pr-11 pl-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="mb-2 block text-sm text-gray-300">
            رمز عبور
          </label>

          <div className="relative">
            <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="حداقل ۸ کاراکتر"
              required
              className="w-full rounded-xl border border-white/10 bg-[#080E1D] py-3 pr-11 pl-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="mb-2 block text-sm text-gray-300">
            تکرار رمز عبور
          </label>

          <div className="relative">
            <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="رمز عبور را دوباره وارد کنید"
              required
              className="w-full rounded-xl border border-white/10 bg-[#080E1D] py-3 pr-11 pl-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 py-3 font-semibold text-white shadow-lg shadow-blue-900/20 transition duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-400 hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <FiUserPlus size={18} />
          {loading ? "در حال ثبت‌نام..." : "ایجاد حساب"}
        </button>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          قبلاً حساب ساخته‌ای؟
          {" "}
          <Link
            to="/login"
            className="font-semibold text-blue-400 transition hover:text-cyan-300"
          >
            ورود به حساب
          </Link>
        </p>

        {/* Brand */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-medium tracking-widest text-gray-600">
            FEEL THE MUSIC
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
      </form>
    </div>
  );
}

export default Register;
