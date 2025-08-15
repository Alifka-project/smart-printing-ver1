// lib/auth.ts
export type Role = "admin" | "estimator";

export interface LoggedInUser {
  id: string;          // contoh: EMP001
  name: string;        // contoh: Admin User
  role: Role;          // "admin" | "estimator"
  email: string;       // untuk login dummy
  password: string;    // untuk login dummy
}

const STORAGE_KEY = "demo_user";

export function getUser(): LoggedInUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LoggedInUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: LoggedInUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function updatePassword(newPassword: string) {
  const u = getUser();
  if (!u) return;
  setUser({ ...u, password: newPassword });
}
