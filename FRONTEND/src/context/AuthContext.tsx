import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_BASE } from "@/lib/apiBase";

type User = { name: string; email: string; role: string };

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("lawsuite_token");
    const storedUser = localStorage.getItem("lawsuite_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function persist(newToken: string, newUser: User) {
    localStorage.setItem("lawsuite_token", newToken);
    localStorage.setItem("lawsuite_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  async function signIn(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Sign in failed");
    persist(data.token, data.user);
  }

  async function signUp(name: string, email: string, password: string) {
    const signupRes = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const signupData = await signupRes.json();
    if (!signupRes.ok) throw new Error(signupData.message || "Sign up failed");
    await signIn(email, password);
  }

  function signOut() {
    localStorage.removeItem("lawsuite_token");
    localStorage.removeItem("lawsuite_user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
