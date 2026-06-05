import { ArrowLeft, LockKeyhole, Mail, RotateCcw, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  resendVerification,
  sendPasswordReset,
  signInWithEmail,
  signUpWithEmail,
} from "../services/authRest";
import ThesisLogo from "../components/common/ThesisLogo";

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
  const [messageTone, setMessageTone] = useState("info");
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "Researcher",
    institution: "Batangas State University",
  });

  const ActiveIcon = modes[mode].icon;
  const isAuthMode = mode === "login" || mode === "register";

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setMessageTone("info");
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setMessageTone("info");
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
        setMessageTone("success");
        setMessage("Registration received. We sent the verification email. Check your inbox, then sign in after confirming.");
        return;
      }
      if (mode === "recover") {
        await sendPasswordReset(form.email);
        setMessageTone("success");
        setMessage("Password reset email sent. Please check your inbox.");
        return;
      }
      if (mode === "verify") {
        await resendVerification(form.email);
        setMessageTone("success");
        setMessage("Verification email resent. Please check your inbox.");
      }
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_14%_12%,rgba(52,211,153,0.2),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(14,165,233,0.18),transparent_34%),linear-gradient(135deg,#f8fffb_0%,#eefaf4_48%,#edf6ff_100%)] text-slate-950">
      <div className="mx-auto grid min-h-dvh max-w-7xl items-center gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.82fr)] lg:gap-8 lg:px-8">
        <section className="relative order-2 flex min-h-[360px] flex-col justify-between overflow-hidden rounded-lg bg-cover bg-center p-5 text-white shadow-2xl shadow-emerald-950/15 sm:p-8 lg:order-1 lg:min-h-[calc(100dvh-3rem)]"
          style={{
            backgroundImage:
              "linear-gradient(130deg, rgba(3, 31, 28, 0.92), rgba(9, 59, 68, 0.7) 52%, rgba(6, 78, 59, 0.32)), url('https://commons.wikimedia.org/wiki/Special:Redirect/file/Lettuce_in_Vertical_Farm.jpg')",
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_32%_20%,rgba(190,242,100,0.26),transparent_28%),linear-gradient(180deg,transparent,rgba(2,6,23,0.46))]" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <ThesisLogo inverse />
            <button
              type="button"
              onClick={onBack}
              className="focus-ring inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-white/15 px-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/24"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          </div>
          <div className="relative z-10 mt-16 max-w-xl lg:mt-20">
            <p className="text-sm font-bold uppercase tracking-normal text-lime-200">Secure Access</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">
              Crop monitoring, prediction, and decision support in one workspace.
            </h1>
            <p className="mt-4 max-w-lg text-base font-medium leading-7 text-emerald-50/90">
              Accounts use email-based authentication with a verification email before dashboard access.
            </p>
          </div>
          <a
            href="https://commons.wikimedia.org/wiki/File:Lettuce_in_Vertical_Farm.jpg"
            className="absolute bottom-3 right-3 rounded bg-slate-950/55 px-2 py-1 text-[10px] font-medium text-white/75 backdrop-blur transition hover:text-white"
          >
            Photo: Bright Agrotech / CC BY-SA 4.0
          </a>
        </section>

        <section className="order-1 flex items-center justify-center lg:order-2">
          <div className="w-full max-w-lg rounded-lg border border-white bg-white/90 p-5 text-slate-950 shadow-2xl shadow-emerald-950/12 ring-1 ring-emerald-900/5 backdrop-blur-xl sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 text-white shadow-lg shadow-emerald-900/20">
                <ActiveIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="section-title">System Access</p>
                <h2 className="text-2xl font-black">{modes[mode].title}</h2>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${mode === "login" ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-sm shadow-emerald-900/15" : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-800"}`}
              >
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Login
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${mode === "register" ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-sm shadow-emerald-900/15" : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-800"}`}
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Register
              </button>
            </div>

            <form className="mt-5 grid gap-4" onSubmit={submit}>
              {mode === "register" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Full name</span>
                    <input
                      value={form.fullName}
                      onChange={(event) => updateField("fullName", event.target.value)}
                      className="field-control"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Institution</span>
                    <input
                      value={form.institution}
                      onChange={(event) => updateField("institution", event.target.value)}
                      className="field-control"
                    />
                  </label>
                </div>
              ) : null}

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email address</span>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className="field-control mt-0 pl-10 pr-3"
                    required
                  />
                </div>
              </label>

              {isAuthMode ? (
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Password</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    className="field-control"
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
                    className="field-control"
                    minLength={6}
                    required
                  />
                </label>
              ) : null}

              {mode === "verify" ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-900">
                  Enter the same email used during registration, then resend the verification email if the first one did not arrive.
                </div>
              ) : null}

              {message ? (
                <div
                  className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                    messageTone === "error"
                      ? "border-rose-200 bg-rose-50 text-rose-800"
                      : messageTone === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-sky-200 bg-sky-50 text-sky-800"
                  }`}
                >
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 px-4 text-sm font-black text-white shadow-sm shadow-emerald-950/20 transition hover:from-emerald-700 hover:to-sky-700 disabled:cursor-wait disabled:opacity-70"
              >
                <ActiveIcon className="h-4 w-4" aria-hidden="true" />
                {busy ? "Processing..." : modes[mode].title}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm">
              <button type="button" onClick={() => switchMode("recover")} className="font-bold text-slate-600 transition hover:text-emerald-700">
                Forgot password?
              </button>
              <button type="button" onClick={() => switchMode("verify")} className="font-bold text-slate-600 transition hover:text-sky-700">
                Resend verification
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
