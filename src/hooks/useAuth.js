import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, logout, updateCurrentUser } from "../services/authRest";

const SESSION_KEY = "lettuce-auth-session";
const PROFILE_KEY = "lettuce-user-profile";

function readStoredJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeProfile(session, localProfile = {}) {
  const metadata = session?.user?.user_metadata || {};
  return {
    full_name: metadata.full_name || localProfile.full_name || "Research User",
    email: session?.user?.email || localProfile.email || "",
    role: metadata.role || localProfile.role || "Researcher",
    institution: metadata.institution || localProfile.institution || "Batangas State University",
    farm_name: metadata.farm_name || localProfile.farm_name || "Indoor Lettuce Vertical Farm",
    esp32_ip: metadata.esp32_ip || localProfile.esp32_ip || import.meta.env.VITE_ESP32_IP || "192.168.1.9",
    location_address: metadata.location_address || localProfile.location_address || "",
    latitude: metadata.latitude || localProfile.latitude || "",
    longitude: metadata.longitude || localProfile.longitude || "",
    phone: metadata.phone || localProfile.phone || "",
  };
}

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const storedSession = readStoredJson(SESSION_KEY);
    const storedProfile = readStoredJson(PROFILE_KEY);

    if (!storedSession?.access_token) {
      setProfile(normalizeProfile(null, storedProfile || {}));
      setLoading(false);
      return;
    }

    setSession(storedSession);
    setProfile(normalizeProfile(storedSession, storedProfile || {}));
    setLoading(false);

    getCurrentUser(storedSession.access_token)
      .then((user) => {
        const refreshed = { ...storedSession, user };
        localStorage.setItem(SESSION_KEY, JSON.stringify(refreshed));
        setSession(refreshed);
        setProfile(normalizeProfile(refreshed, storedProfile || {}));
      })
      .catch(() => {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
        setProfile(normalizeProfile(null, storedProfile || {}));
      });
  }, []);

  const value = useMemo(
    () => ({
      loading,
      session,
      profile,
      setAuthSession(nextSession) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
        const nextProfile = normalizeProfile(nextSession, readStoredJson(PROFILE_KEY) || {});
        localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
        setSession(nextSession);
        setProfile(nextProfile);
      },
      async updateProfile(nextProfile) {
        const merged = { ...profile, ...nextProfile };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
        setProfile(merged);
        if (session?.access_token) {
          try {
            const user = await updateCurrentUser(session.access_token, merged);
            const nextSession = { ...session, user };
            localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
            setSession(nextSession);
          } catch {
            // Local profile changes still persist when Supabase Auth metadata is unavailable.
          }
        }
      },
      async signOut() {
        if (session?.access_token) {
          try {
            await logout(session.access_token);
          } catch {
            // The local session is cleared either way.
          }
        }
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
      },
    }),
    [loading, profile, session],
  );

  return value;
}
