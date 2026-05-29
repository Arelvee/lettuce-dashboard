import { LayoutDashboard, LogOut, Menu, Moon, Smartphone, Sun, UserRound, X } from "lucide-react";
import { useState } from "react";
import ThesisLogo from "../common/ThesisLogo";

export default function MainNav({ activePage, profile, theme, onNavigate, onSignOut, onToggleTheme }) {
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);

  function navigate(page) {
    onNavigate(page);
    setOpen(false);
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "mobile", label: "Mobile App", icon: Smartphone },
    { key: "profile", label: "Profile", icon: UserRound },
  ];

  return (
    <nav className="sticky top-3 z-20 rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("dashboard")}
          className="focus-ring flex min-w-0 items-center gap-3 rounded-lg px-1 py-1 text-left"
          title={profile?.farm_name || "Vertical farm system"}
          aria-label="Go to dashboard"
        >
          <ThesisLogo />
          <span className="hidden min-w-0 sm:block">
            <span className="block text-sm font-bold leading-5 text-slate-950 dark:text-white">Lettuce Predict</span>
            <span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {profile?.farm_name || "Vertical farm system"}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 md:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => navigate(key)}
              className={`focus-ring inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                activePage === key
                  ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={onToggleTheme}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            title={isDark ? "Switch to light view" : "Switch to dark view"}
            aria-label={isDark ? "Switch to light view" : "Switch to dark view"}
          >
            {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>

      <div className={`${open ? "grid" : "hidden"} mt-3 gap-2 md:hidden`}>
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
          onClick={() => navigate(key)}
          className={`focus-ring inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
            activePage === key
                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
          >
            {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            {isDark ? "Light" : "Dark"}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
