
import { useState, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/layout/Navbar";
import SideBar from "./components/layout/SideBar";
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

  return (
    <div
      dir="rtl"
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#080E1D] text-white"
          : "bg-[#F4F7FC] text-[#14213D]"
      }`}
    >
      <SideBar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed((prev) => !prev)
        }
      />

      <div
        className={`min-h-screen transition-[margin] duration-300 ease-in-out ${
          sidebarCollapsed
            ? "lg:mr-[80px]"
            : "lg:mr-[270px]"
        }`}
      >
        <Navbar
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 pb-36 sm:p-6 sm:pb-36">
          {children}
        </main>
      </div>
    </div>
  );
}

// محتوای اصلی برنامه
function AppContent() {
  return (
    <>
      <Routes>
        {/* صفحات اصلی با Navbar و Sidebar */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        {/* جستجوی موسیقی */}
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

        {/* کاوش موسیقی */}
        <Route
          path="/newalbum"
          element={
            <MainLayout>
              <NewAlbums />
            </MainLayout>
          }
        />

        {/* ورود و ثبت نام */}
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

        {/* تاریخچه پخش */}
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
