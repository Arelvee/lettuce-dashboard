import { useEffect, useState } from "react";
import AppShell from "./components/layout/AppShell";
import MainNav from "./components/layout/MainNav";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import MobileAppPage from "./pages/MobileAppPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./hooks/useAuth";

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const savedTheme = window.localStorage.getItem("lettuce-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const { session, profile, loading, signOut, updateProfile, setAuthSession } = useAuth();
  const [page, setPage] = useState("landing");
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("lettuce-theme", theme);
  }, [theme]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />
      </main>
    );
  }

  if (!session) {
    return page === "auth" ? (
      <AuthPage
        onBack={() => setPage("landing")}
        onAuthenticated={(nextSession) => {
          setAuthSession(nextSession);
          setPage("dashboard");
        }}
      />
    ) : (
      <LandingPage onGetStarted={() => setPage("auth")} />
    );
  }

  return (
    <AppShell>
      <MainNav
        activePage={page === "profile" ? "profile" : page === "mobile" ? "mobile" : "dashboard"}
        profile={profile}
        theme={theme}
        onNavigate={setPage}
        onSignOut={signOut}
        onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      />
      {page === "profile" ? (
        <ProfilePage profile={profile} session={session} onSave={updateProfile} />
      ) : page === "mobile" ? (
        <MobileAppPage />
      ) : (
        <DashboardPage profile={profile} />
      )}
    </AppShell>
  );
}
