import { ArrowLeft, LockKeyhole, Mail, RotateCcw, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  resendVerification,
  sendPasswordReset,
  signInWithEmail,
  signUpWithEmail,
} from "../services/authRest";

const modes = {
  login: { title: "Sign in", icon: LockKeyhole },
  register: { title: "Register", icon: UserPlus },
  recover: { title: "Forgot password", icon: RotateCcw },
  verify: { title: "Email verification", icon: ShieldCheck },
};

export default function AuthPage({ onBack, onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "Researcher",
    institution: "Batangas State University",
  });

  const ActiveIcon = modes[mode].icon;

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "login") {
        const session = await signInWithEmail(form.email, form.password);
        onAuthenticated(session);
        return;
      }
      if (mode === "register") {
        if (form.password !== form.confirmPassword) {
          throw new Error("Password confirmation does not match.");
        }
        const response = await signUpWithEmail(form);
        if (response.access_token) {
          onAuthenticated(response);
          return;
        }
        setMode("verify");
        setMessage("Registration received. Check your email and verify your account before signing in.");
        return;
      }
      if (mode === "recover") {
        await sendPasswordReset(form.email);
        setMessage("Password reset email sent. Please check your inbox.");
        return;
      }
      if (mode === "verify") {
        await resendVerification(form.email);
        setMessage("Verification email resent. Please check your inbox.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <section className="flex flex-col justify-between rounded-lg bg-cover bg-center p-6 sm:p-8"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(2,6,23,0.26), rgba(2,6,23,0.92)), url('https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=85')",
          }}
        >
          <button
            type="button"
            onClick={onBack}
            className="focus-ring inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-white/10 px-3 text-sm font-semibold backdrop-blur hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to thesis
          </button>
          <div className="mt-20 max-w-xl">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-300">Secure Access</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              Crop monitoring, prediction, and decision support in one workspace.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-200">
              Accounts use email-based authentication. New users verify their email before dashboard access.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-white p-5 text-slate-950 shadow-2xl sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ActiveIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="section-title">System Access</p>
                <h2 className="text-2xl font-bold">{modes[mode].title}</h2>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`focus-ring rounded-lg px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`focus-ring rounded-lg px-3 py-2 text-sm font-semibold ${mode === "register" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                Register
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={submit}>
              {mode === "register" ? (
                <>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Full name</span>
                    <input
                      value={form.fullName}
                      onChange={(event) => updateField("fullName", event.target.value)}
                      className="focus-ring mt-1 h-11 w-full rounded-lg border border-slate-200 px-3"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Institution</span>
                    <input
                      value={form.institution}
                      onChange={(event) => updateField("institution", event.target.value)}
                      className="focus-ring mt-1 h-11 w-full rounded-lg border border-slate-200 px-3"
                    />
                  </label>
                </>
              ) : null}

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email address</span>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className="focus-ring h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3"
                    required
                  />
                </div>
              </label>

              {mode === "login" || mode === "register" ? (
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Password</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    className="focus-ring mt-1 h-11 w-full rounded-lg border border-slate-200 px-3"
                    minLength={6}
                    required
                  />
                </label>
              ) : null}

              {mode === "register" ? (
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Confirm password</span>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => updateField("confirmPassword", event.target.value)}
                    className="focus-ring mt-1 h-11 w-full rounded-lg border border-slate-200 px-3"
                    minLength={6}
                    required
                  />
                </label>
              ) : null}

              {message ? (
                <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="focus-ring inline-flex h-11 w-full items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-70"
              >
                {busy ? "Processing..." : modes[mode].title}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm">
              <button type="button" onClick={() => setMode("recover")} className="font-semibold text-slate-600 hover:text-slate-950">
                Forgot password?
              </button>
              <button type="button" onClick={() => setMode("verify")} className="font-semibold text-slate-600 hover:text-slate-950">
                Resend verification
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

