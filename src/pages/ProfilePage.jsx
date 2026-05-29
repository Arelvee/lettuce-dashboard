import { CheckCircle2, Mail, MapPin, Save, ShieldCheck, UserRound, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

const sections = [
  {
    title: "Researcher",
    detail: "Identity used for dashboard access and local profile records.",
    icon: UserRound,
    fields: [
      ["full_name", "Full name", "text"],
      ["role", "Role", "text"],
      ["institution", "Institution", "text"],
      ["phone", "Phone", "tel"],
    ],
  },
  {
    title: "Farm Location",
    detail: "Fallback address and coordinates for maps and device-location checks.",
    icon: MapPin,
    fields: [
      ["farm_name", "Farm name", "text", "sm:col-span-2"],
      ["location_address", "Farm address", "text", "sm:col-span-2"],
      ["latitude", "Farm latitude", "number"],
      ["longitude", "Farm longitude", "number"],
    ],
  },
  {
    title: "Device",
    detail: "ESP32 endpoint used when browser geolocation or public lookup is unavailable.",
    icon: Wifi,
    fields: [["esp32_ip", "ESP32 IP address", "text"]],
  },
];

export default function ProfilePage({ profile, session, onSave }) {
  const [draft, setDraft] = useState(profile || {});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const email = session?.user?.email || draft.email || "No email saved";
  const verified = Boolean(session?.user?.email_confirmed_at);

  useEffect(() => {
    setDraft(profile || {});
  }, [profile]);

  function updateField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave(draft);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="surface overflow-hidden">
      <div className="border-b border-slate-200/80 p-5 dark:border-white/10 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-950 to-emerald-900 text-white shadow-lg shadow-emerald-950/15 dark:from-white dark:to-emerald-100 dark:text-slate-950">
              <UserRound className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="section-title">Profile</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Account and farm settings</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Keep the researcher profile, farm fallback location, and ESP32 endpoint aligned with the dashboard.
              </p>
            </div>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
              verified
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200"
            }`}
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {verified ? "Email verified" : "Verification pending"}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="panel-muted p-4">
            <Mail className="h-5 w-5 text-sky-600 dark:text-sky-300" aria-hidden="true" />
            <p className="mt-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Email</p>
            <p className="mt-1 break-all text-sm font-bold text-slate-950 dark:text-white">{email}</p>
          </div>
          <div className="panel-muted p-4">
            <MapPin className="h-5 w-5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
            <p className="mt-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Farm</p>
            <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{draft.farm_name || "Farm name pending"}</p>
          </div>
          <div className="panel-muted p-4">
            <Wifi className="h-5 w-5 text-amber-600 dark:text-amber-300" aria-hidden="true" />
            <p className="mt-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">ESP32</p>
            <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{draft.esp32_ip || "IP address pending"}</p>
          </div>
        </div>
      </div>

      <form className="grid gap-6 p-5 sm:p-6" onSubmit={submit}>
        {sections.map((section) => (
          <section
            key={section.title}
            className="grid gap-4 border-b border-slate-200/80 pb-6 last:border-b-0 last:pb-0 dark:border-white/10 lg:grid-cols-[14rem_1fr]"
          >
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <section.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">{section.title}</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{section.detail}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {section.fields.map(([key, label, type, span]) => (
                <label key={key} className={span || ""}>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                  <input
                    type={type}
                    step={type === "number" ? "any" : undefined}
                    value={draft[key] || ""}
                    onChange={(event) => updateField(key, event.target.value)}
                    className="field-control"
                  />
                </label>
              ))}
            </div>
          </section>
        ))}

        <div className="panel-muted flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
            {error ? (
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
            ) : saved ? (
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Profile saved.</p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Changes save locally and sync to Supabase Auth metadata when available.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-950 to-emerald-900 px-4 text-sm font-bold text-white shadow-sm shadow-emerald-950/15 transition hover:from-emerald-900 hover:to-teal-800 disabled:cursor-wait disabled:opacity-70 dark:from-white dark:to-emerald-100 dark:text-slate-950 dark:hover:from-emerald-50 dark:hover:to-cyan-100"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {busy ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </section>
  );
}
