import { useState } from "react";
import AppShell from "./components/layout/AppShell";
import MainNav from "./components/layout/MainNav";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { session, profile, loading, signOut, updateProfile, setAuthSession } = useAuth();
  const [page, setPage] = useState("landing");

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
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
        activePage={page === "profile" ? "profile" : "dashboard"}
        profile={profile}
        onNavigate={setPage}
        onSignOut={signOut}
      />
      {page === "profile" ? (
        <ProfilePage profile={profile} session={session} onSave={updateProfile} />
      ) : (
        <DashboardPage profile={profile} />
      )}
    </AppShell>
  );
}

