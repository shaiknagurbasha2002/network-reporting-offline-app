// src/hooks/useUserProfile.ts
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  listenUserProfile,
  upsertUserProfileOnLogin,
  UserProfile,
} from "../services/userProfile";

export function useUserProfile(authUser: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!authUser?.uid) {
      setProfile(null);
      return;
    }

    // Ensure profile exists immediately on login (fixes missing doc / refetch bugs)
    upsertUserProfileOnLogin({
      uid: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName,
      photoURL: authUser.photoURL,
    }).catch(console.error);

    const unsub = listenUserProfile(authUser.uid, setProfile);
    return () => unsub();
  }, [authUser?.uid]);

  return profile;
}
