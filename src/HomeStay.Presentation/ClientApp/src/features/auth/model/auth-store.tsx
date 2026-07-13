import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type UserRole = "accountant" | "manager" | "sale" | "admin";

export type CurrentUser = {
  maTK: string;
  tenDangNhap: string;
  hoTen?: string;
  maNV: string;
  vaiTro: string;
  role: UserRole;
};

type AuthState = {
  user: CurrentUser | null;
  role: UserRole | null;
  isHydrated: boolean;
  setUser: (user: CurrentUser | null) => void;
  setRole: (role: UserRole | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function mapRole(vaiTro: string): UserRole | null {
  return ({ Sale: "sale", KeToan: "accountant", QuanLy: "manager", QuanTri: "admin" } as const)[vaiTro as "Sale" | "KeToan" | "QuanLy" | "QuanTri"] ?? null;
}

function mapUser(value: Omit<CurrentUser, "role"> & { vaiTro: string }): CurrentUser | null {
  const role = mapRole(value.vaiTro);
  return role ? { ...value, role } : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<CurrentUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((value) => setUserState(value ? mapUser(value) : null))
      .catch(() => setUserState(null))
      .finally(() => setIsHydrated(true));
  }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    role: user?.role ?? null,
    isHydrated,
    setUser: setUserState,
    setRole(nextRole) {
      if (!nextRole) {
        void fetch("/api/auth/logout", { method: "POST" }).finally(() => setUserState(null));
      }
    },
    async logout() {
      await fetch("/api/auth/logout", { method: "POST" });
      setUserState(null);
    },
  }), [user, isHydrated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
