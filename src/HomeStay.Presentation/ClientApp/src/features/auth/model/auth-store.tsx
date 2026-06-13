import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type UserRole = "accountant" | "manager" | "sale" | "admin";

type AuthState = {
  role: UserRole | null;
  isHydrated: boolean;
  setRole: (role: UserRole | null) => void;
};

const ROLE_KEY = "homestay-current-role-v1";
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem(ROLE_KEY) as UserRole | null;
    if (savedRole) setRoleState(savedRole);
    setIsHydrated(true);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      role,
      isHydrated,
      setRole(nextRole) {
        setRoleState(nextRole);
        if (nextRole) localStorage.setItem(ROLE_KEY, nextRole);
        else localStorage.removeItem(ROLE_KEY);
      },
    }),
    [role, isHydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
