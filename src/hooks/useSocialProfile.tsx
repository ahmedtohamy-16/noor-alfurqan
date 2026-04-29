import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getSocialProfileByUid,
  createSocialProfile,
  SocialProfile,
} from "@/services/socialService";

/**
 * Returns the current user's social profile, auto-creating one if missing.
 */
export const useSocialProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const p = await getSocialProfileByUid(user.uid);
      setProfile(p);
      setNeedsSetup(!p);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, needsSetup, refresh };
};

export const ensureSocialProfile = async (
  uid: string,
  fallback: { username: string; display_name: string; avatar_url?: string | null }
): Promise<SocialProfile> => {
  const existing = await getSocialProfileByUid(uid);
  if (existing) return existing;
  await createSocialProfile(uid, fallback);
  return (await getSocialProfileByUid(uid))!;
};
