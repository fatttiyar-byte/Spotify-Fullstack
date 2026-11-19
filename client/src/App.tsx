
import { useState, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/layout/Navbar";
import SideBar from "./components/layout/SideBar";
import Footer from "./components/layout/Footer";
import GlobalMusicPlayer from "./components/GlobalMusicPlayer";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Home from "./pages/Home";

import NewAlbums from "./pages/NewAlbums";
import Playlists from "./pages/Playlists";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import AlbumDetails from "./pages/AlbumDetails";
import Search from "./pages/Search";

import { useTheme } from "./context/ThemeContext";
import { useAuthStore } from "./store/authStore";
import { MusicPlayerProvider } from "./context/MusicPlayerContext";

// محافظت از مسیرها
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: "user" | "admin";
}

function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin" : "/profile"}
        replace
      />
    );
  }

  return <>{children}</>;
}

// پروفایل کاربر
function ProfileRoute() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <UserProfile user={user} />;
}

// لایه اصلی سایت
function MainLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      dir="rtl"
      className={`
        flex min-h-screen w-full flex-col overflow-x-clip
        transition-colors duration-300
        ${
          isDark
            ? "bg-[#080E1D] text-white"
            : "bg-[#F4F7FC] text-[#14213D]"
        }
      `}
    >
      {/* سایدبار */}
      <SideBar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed((prev) => !prev)
        }
      />

      {/* محتوای اصلی */}
      <div
        className={`
          flex min-h-screen min-w-0 w-full flex-col
          transition-[margin] duration-300 ease-in-out
          ${
            sidebarCollapsed
              ? "lg:mr-[82px] lg:w-[calc(100%-82px)]"
              : "lg:mr-[255px] lg:w-[calc(100%-255px)]"
          }
        `}
      >
        {/* Navbar */}
        <Navbar
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Main */}
        <main
          className="
            min-w-0 w-full flex-1
            px-3 py-4
            min-[480px]:px-4
            sm:px-5 sm:py-6
            lg:px-6 lg:py-7
            xl:px-8
          "
        >
          {children}
        </main>

        {/* Footer */}
        <div className="mt-auto min-w-0 w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
}

// محتوای اصلی برنامه
function AppContent() {
  return (
    <>
      <Routes>
        {/* صفحه اصلی */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        {/* جستجو */}
        <Route
          path="/search"
          element={
            <MainLayout>
              <Search />
            </MainLayout>
          }
        />

        {/* جزئیات آلبوم */}
        <Route
          path="/album/:id"
          element={
            <MainLayout>
              <AlbumDetails />
            </MainLayout>
          }
        />

        {/* آلبوم‌های جدید */}
        <Route
          path="/newalbum"
          element={
            <MainLayout>
              <NewAlbums />
            </MainLayout>
          }
        />

        {/* ورود و ثبت‌نام */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* پلی‌لیست */}
        <Route
          path="/playlists"
          element={
            <ProtectedRoute allowedRole="user">
              <MainLayout>
                <Playlists />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* علاقه‌مندی‌ها */}
        <Route
          path="/favorites"
          element={
            <MainLayout>
              <Favorites />
            </MainLayout>
          }
        />

        {/* تاریخچه */}
        <Route
          path="/history"
          element={
            <MainLayout>
              <History />
            </MainLayout>
          }
        />

        {/* پروفایل کاربر */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRole="user">
              <MainLayout>
                <ProfileRoute />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* داشبورد ادمین */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* پروفایل ادمین */}
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRole="admin">
              <MainLayout>
                <AdminProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* تنظیمات */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* اعلان‌ها */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Notifications />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* مسیر نامعتبر */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

      {/* پلیر سراسری */}
      <GlobalMusicPlayer />

      {/* اعلان‌های سراسری */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "16px",
            padding: "14px 18px",
            fontSize: "13px",
            fontWeight: 700,
            direction: "rtl",
            zIndex: 99999,
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <MusicPlayerProvider>
      <AppContent />
    </MusicPlayerProvider>
  );
}
