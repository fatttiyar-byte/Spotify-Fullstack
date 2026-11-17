
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  playlist?: string[];
  profileImage?: string;
}

type UserInput = Omit<User, "_id"> & {
  id?: string;
  _id?: string;
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: UserInput, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        const normalizedUser: User = {
          _id: user._id ?? user.id ?? "",
          name: user.name,
          email: user.email,
          role: user.role,
          playlist: user.playlist ?? [],
        };

        set({
          user: normalizedUser,
          token,
          isAuthenticated: true,
        });
      },

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "topmusic-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
