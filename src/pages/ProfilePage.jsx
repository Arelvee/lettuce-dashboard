import { MapPin, Save, UserRound } from "lucide-react";
import { useState } from "react";

const fields = [
  ["full_name", "Full name"],
  ["role", "Role"],
  ["institution", "Institution"],
  ["farm_name", "Farm name"],
  ["phone", "Phone"],
  ["esp32_ip", "ESP32 IP address"],
  ["latitude", "Farm latitude"],
  ["longitude", "Farm longitude"],
];

export default function ProfilePage({ profile, session, onSave }) {
  const [draft, setDraft] = useState(profile || {});
  const [saved, setSaved] = useState(false);

  function updateField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function submit(event) {
    event.preventDefault();
    await onSave(draft);
    setSaved(true);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="surface p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white">
            <UserRound className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="section-title">Profile</p>
            <h1 className="text-2xl font-bold text-slate-950">{draft.full_name || "Research User"}</h1>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <div>
            <p className="font-semibold text-slate-500">Email</p>
            <p className="mt-1 break-all text-slate-950">{session?.user?.email || draft.email}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-500">Account status</p>
            <p className="mt-1 text-slate-950">
              {session?.user?.email_confirmed_at ? "Email verified" : "Email verification pending"}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <MapPin className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <p className="mt-2 font-semibold text-emerald-900">Location source</p>
            <p className="mt-1 text-emerald-800">
              Saved coordinates are used as the farm fallback when the ESP32 IP is private or
              browser geolocation is unavailable.
            </p>
          </div>
        </div>
      </section>

      <section className="surface p-5">
        <div>
          <p className="section-title">Edit Profile</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Researcher and farm details</h2>
        </div>

        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          {fields.map(([key, label]) => (
            <label key={key} className={key === "farm_name" ? "sm:col-span-2" : ""}>
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <input
                value={draft[key] || ""}
                onChange={(event) => updateField(key, event.target.value)}
                className="focus-ring mt-1 h-11 w-full rounded-lg border border-slate-200 px-3"
              />
            </label>
          ))}

          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            {saved ? (
              <p className="text-sm font-semibold text-emerald-700">Profile saved.</p>
            ) : (
              <p className="text-sm text-slate-500">Changes are saved locally and synced to Supabase Auth metadata when available.</p>
            )}
            <button
              type="submit"
              className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save profile
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

