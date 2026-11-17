import UserProfile from "../pages/UserProfile";
import AdminProfile from "../components/profile/AdminProfile";
import { useAuthStore } from "../store/authStore";

const Profile = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return user.role === "admin" ? (
    <AdminProfile user={user} />
  ) : (
    <UserProfile user={user} />
  );
};

export default Profile;