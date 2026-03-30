import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../../lib/supabase";
import { fetchMe } from "../../lib/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "mentee" | "mentor" | "admin";
  avatarUrl?: string | null;
  bio?: string | null;
  gender?: string | null;
  skills?: string[];
  goals?: string[];
  verificationStatus?: string | null;
  isActive?: boolean;
};

export type AuthRole = "mentee" | "mentor" | "admin";

const DEMO_AUTH_ENABLED = import.meta.env.VITE_DEMO_AUTH === "true";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  loginWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    options: { name: string; role: "mentee" | "mentor" }
  ) => Promise<{ sessionCreated: boolean }>;
  logout: () => Promise<void>;
  setUserFromToken: (accessToken: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("mentorme-user");
    if (!raw) return null;
    const data = JSON.parse(raw) as AuthUser;
    if (!data?.id || !data?.email || !data?.role) return null;
    return data;
  } catch {
    return null;
  }
}

function storeUser(user: AuthUser | null) {
  try {
    if (user) {
      sessionStorage.setItem("mentorme-user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("mentorme-user");
    }
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  const setUserFromToken = useCallback(async (accessToken: string) => {
    const me = await fetchMe(accessToken);
    setUser(me);
    storeUser(me);
  }, []);

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      if (DEMO_AUTH_ENABLED && !supabase) {
        const demoUser: AuthUser = {
          id: `demo-${email || "user"}`,
          name: "Demo User",
          email: email || "demo@example.com",
          role: "mentee",
          avatarUrl: null,
          bio: "Demo account (no real data is saved).",
          gender: null,
          skills: [],
          goals: [],
        };
        setUser(demoUser);
        storeUser(demoUser);
        return;
      }
      if (!supabase) throw new Error("Supabase not configured");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session?.access_token) throw new Error("No session returned");
      await setUserFromToken(data.session.access_token);
    },
    [setUserFromToken]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      options: { name: string; role: "mentee" | "mentor" }
    ): Promise<{ sessionCreated: boolean }> => {
      if (DEMO_AUTH_ENABLED && !supabase) {
        const demoUser: AuthUser = {
          id: `demo-${options.role}`,
          name: options.name || "Demo User",
          email,
          role: options.role,
          avatarUrl: null,
          bio: "Demo account (no real data is saved).",
          gender: null,
          skills: [],
          goals: [],
        };
        setUser(demoUser);
        storeUser(demoUser);
        return { sessionCreated: true };
      }
      if (!supabase) throw new Error("Supabase not configured");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: options.name,
            role: options.role,
          },
        },
      });
      if (error) throw error;
      if (data.session?.access_token) {
        await setUserFromToken(data.session.access_token);
        return { sessionCreated: true };
      }
      return { sessionCreated: false };
    },
    [setUserFromToken]
  );

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    storeUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      await setUserFromToken(data.session.access_token);
    }
  }, [setUserFromToken]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          await setUserFromToken(data.session.access_token);
        } else {
          setUser(null);
          storeUser(null);
        }
      } catch {
        setUser(null);
        storeUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        try {
          await setUserFromToken(session.access_token);
        } catch {
          setUser(null);
          storeUser(null);
        }
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
        storeUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [setUserFromToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      loginWithPassword,
      signUp,
      logout,
      setUserFromToken,
      refreshUser,
    }),
    [user, isLoading, loginWithPassword, signUp, logout, setUserFromToken, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Safe hook — never throws, just returns unauthenticated state if used outside provider
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}