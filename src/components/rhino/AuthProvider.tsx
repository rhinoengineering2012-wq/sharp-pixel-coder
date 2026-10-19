import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });
export const useRhinoAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setReady(true); } }).catch(() => { if (active) setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!["INITIAL_SESSION", "SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      setUser(session?.user ?? null); setReady(true);
      if (event !== "INITIAL_SESSION") void router.invalidate();
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [router]);
  return <AuthContext.Provider value={{ user, ready }}>{children}</AuthContext.Provider>;
}