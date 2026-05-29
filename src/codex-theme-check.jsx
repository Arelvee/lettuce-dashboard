import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import AppShell from "./components/layout/AppShell";
import MainNav from "./components/layout/MainNav";
import DashboardPage from "./pages/DashboardPage";
import "./index.css";

const profile = {
  farm_name: "Indoor Lettuce Vertical Farm",
  esp32_ip: "192.168.1.9",
  latitude: "14.5869",
  longitude: "121.0614",
  location_address: "Manila, Metro Manila, Philippines",
};

function ThemeCheck() {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get("theme") === "dark" ? "dark" : "light";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return (
    <AppShell>
      <MainNav
        activePage="dashboard"
        profile={profile}
        theme={theme}
        onNavigate={() => {}}
        onSignOut={() => {}}
        onToggleTheme={() => {}}
      />
      <DashboardPage profile={profile} />
    </AppShell>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeCheck />
  </React.StrictMode>,
);
