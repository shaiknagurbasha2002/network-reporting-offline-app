// src/hooks/useAuthUser.ts
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { listenAuth } from "./authService";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { user, loading };
}
