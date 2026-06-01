import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  LineChart,
  RadioTower,
  ShieldCheck,
  Sprout,
  Waves,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ThesisLogo from "../components/common/ThesisLogo";

const researchQuestions = [
  "What environmental parameters are significant for monitoring lettuce growth conditions in an indoor vertical farming system?",
  "How can the Daubechies wavelet transform (db4) be applied to preprocess time-series environmental sensor data for lettuce growth monitoring?",
  "How effective is the hybrid BiLSTM with Attention and XGBoost model in predicting lettuce growth stage and 6-slot yield count using preprocessed sensor data?",
  "How accurate and reliable is the developed predictive model based on MAE, MSE, RMSE, and R2?",
  "How does the developed predictive approach compare with existing manual monitoring practices in terms of crop monitoring and decision-support capability?",
];

const objectives = [
  "Implement environmental sensing and monitoring of temperature, humidity, pH, EC, TDS, light intensity, and spectral reflectance.",
  "Preprocess, normalize, and denoise time-series environmental sensor data using the Daubechies Wavelet Transform (db4).",
  "Develop a hybrid BiLSTM with Attention and XGBoost predictive framework for lettuce growth stage classification and 6-slot yield count regression.",
  "Evaluate prediction accuracy and reliability using MAE, MSE, RMSE, R2, and K-Fold Cross-Validation.",
  "Compare the predictive framework with manual crop monitoring practices for decision-support capability.",
];

const pipeline = [
  { icon: RadioTower, label: "ESP32 Sensors", detail: "Hydroponic environment and spectral data" },
  { icon: Waves, label: "Db4 Denoising", detail: "Wavelet preprocessing for noisy time-series signals" },
  { icon: BrainCircuit, label: "BiLSTM + Attention", detail: "Temporal feature extraction from sensor windows" },
  { icon: BarChart3, label: "XGBoost Outputs", detail: "Stage classification and 6-slot yield count regression" },
];

// ── Carousel hook ─────────────────────────────────────────────────────────────
function useCarousel(total, autoPlayMs = 3500) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(
      () => setActive((a) => (a + 1) % total),
      autoPlayMs
    );
  }, [total, autoPlayMs]);

  useEffect(() => {
    startTimer();
    return () => window.clearInterval(timerRef.current);
  }, [startTimer]);

  const goTo = useCallback(
    (index) => {
      setActive((index + total) % total);
      startTimer();
    },
    [total, startTimer]
  );

  const prev = useCallback(() => goTo(active - 1), [active, goTo]);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);

  return { active, prev, next, goTo };
}

// ── Coverflow Carousel ────────────────────────────────────────────────────────
function CardCarousel({ items, renderCard, accentClass = "bg-emerald-600", autoPlayMs = 3500 }) {
  const total = items.length;
  const { active, prev, next, goTo } = useCarousel(total, autoPlayMs);

  const leftIdx  = (active - 1 + total) % total;
  const rightIdx = (active + 1) % total;

  return (
    <div className="cf-root" aria-label="Card carousel">

      {/* perspective stage */}
      <div className="cf-stage">

        {/* LEFT */}
        <button
          type="button"
          onClick={prev}
          className="cf-slot cf-slot--left"
          aria-label="Previous card"
        >
          <div className="cf-card cf-card--side">
            {renderCard(items[leftIdx], leftIdx, false)}
          </div>
        </button>

        {/* CENTER */}
        <div className="cf-slot cf-slot--center">
          <div className="cf-card cf-card--active">
            {renderCard(items[active], active, true)}
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={next}
          className="cf-slot cf-slot--right"
          aria-label="Next card"
        >
          <div className="cf-card cf-card--side">
            {renderCard(items[rightIdx], rightIdx, false)}
          </div>
        </button>

      </div>

      {/* nav */}
      <div className="cf-nav">
        <button type="button" onClick={prev} className="cf-arrow" aria-label="Previous">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="cf-dots">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to card ${i + 1}`}
              className={`cf-dot ${i === active ? `cf-dot--active ${accentClass}` : "cf-dot--inactive"}`}
            />
          ))}
        </div>
        <button type="button" onClick={next} className="cf-arrow" aria-label="Next">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage({ onGetStarted }) {
  return (
    <main className="min-h-screen text-slate-950 dark:text-slate-100">

      {/* ── HERO — original layout preserved exactly ── */}
      <section
        className="relative flex min-h-[88vh] items-end overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(2, 6, 23, 0.92), rgba(2, 6, 23, 0.66), rgba(2, 6, 23, 0.26)), url('https://commons.wikimedia.org/wiki/Special:Redirect/file/Lettuce_in_Vertical_Farm.jpg')",
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-10 pt-24 text-white sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-center">
              <ThesisLogo inverse size="hero" bare className="h-28 w-28 sm:h-32 sm:w-32" />
              <div className="rounded-lg border border-white/15 bg-slate-950/45 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-md sm:p-5">
                <p className="text-xs font-bold uppercase text-emerald-200">Thesis Predictive System</p>
                <p className="mt-2 max-w-3xl bg-gradient-to-r from-emerald-200 via-white to-sky-200 bg-clip-text text-2xl font-black leading-tight text-transparent sm:text-3xl lg:text-4xl">
                  Crop Yield Prediction Model for Indoor Lettuce Vertical Farm
                </p>
              </div>
            </div>
            <h1 className="mt-8 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Smarter harvest decisions from real-time lettuce intelligence.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              A thesis system integrating environmental sensing, Daubechies wavelet preprocessing,
              BiLSTM with Attention feature extraction, and XGBoost classifier/regressor outputs
              for real-time hydroponic lettuce decision support.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onGetStarted}
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
              >
                Access System
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <a
                href="#study"
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Sprout className="h-4 w-4" aria-hidden="true" />
                View Study Scope
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((item) => (
              <div key={item.label} className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                <item.icon className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                <p className="mt-3 text-sm font-bold">{item.label}</p>
                <p className="mt-1 text-sm text-slate-200">{item.detail}</p>
              </div>
            ))}
          </div>

          <p className="text-xs font-semibold uppercase text-white/65">
            Master of Science in Electronics Engineering / Batangas State University
          </p>
        </div>
        <a
          href="https://commons.wikimedia.org/wiki/File:Lettuce_in_Vertical_Farm.jpg"
          className="absolute bottom-3 right-3 rounded bg-slate-950/55 px-2 py-1 text-[10px] font-medium text-white/75 backdrop-blur transition hover:text-white"
        >
          Photo: Bright Agrotech / CC BY-SA 4.0
        </a>
      </section>

      {/* ── RESEARCH CONTEXT ── */}
      <section id="study" className="border-b border-emerald-900/10 bg-white/78 py-14 backdrop-blur dark:border-white/10 dark:bg-white/[0.03] sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="section-title">Thesis Presentation</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">Research Context</h2>
            <div className="mt-6 space-y-2 text-base leading-7 text-slate-600 dark:text-slate-300">
              <p>A Thesis Presented to the Faculty of College of Engineering and Fine Arts</p>
              <p>Graduate Program of Master of Science in Electronics Engineering</p>
              <p>Batangas State University - The National Engineering University</p>
              <p>Alangilan Campus, Batangas City, Philippines</p>
              <p className="pt-4 text-lg font-semibold text-slate-900 dark:text-white">Ralph Laurence G. Visaya / May 2026</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="panel-muted p-6">
              <Cpu className="h-7 w-7 text-sky-600" aria-hidden="true" />
              <p className="mt-5 text-3xl font-bold text-slate-950 dark:text-white">10</p>
              <p className="mt-2 text-base leading-6 text-slate-500 dark:text-slate-400">sensor features per BiLSTM window</p>
            </div>
            <div className="panel-muted p-6">
              <LineChart className="h-7 w-7 text-emerald-600" aria-hidden="true" />
              <p className="mt-5 text-3xl font-bold text-slate-950 dark:text-white">5 min</p>
              <p className="mt-2 text-base leading-6 text-slate-500 dark:text-slate-400">realtime monitoring cadence</p>
            </div>
            <div className="panel-muted p-6">
              <ShieldCheck className="h-7 w-7 text-amber-600" aria-hidden="true" />
              <p className="mt-5 text-3xl font-bold text-slate-950 dark:text-white">2</p>
              <p className="mt-2 text-base leading-6 text-slate-500 dark:text-slate-400">outputs: stage label and 6-slot yield count</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATEMENT OF THE PROBLEM ── */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="section-title">Statement of the Problem</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">Why Prediction Matters</h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              <p>
                Indoor hydroponic and vertical farming systems improve production efficiency, but
                many small-scale farms still rely on manual monitoring. Delayed interventions can
                lead to inefficient resource use and inconsistent crop yield.
              </p>
              <p>
                Existing sensor-based systems often emphasize monitoring and automation rather than
                predictive analysis for growth stage and yield estimation. Limited studies combine
                wavelet preprocessing with hybrid machine learning for noisy time-series sensor data.
              </p>
              <p>
                This system addresses the need for a predictive approach that uses environmental
                sensor data to support real-time crop monitoring and yield estimation in indoor
                vertical farming systems.
              </p>
            </div>
          </div>

          {/* Research Questions Carousel */}
          <div className="mt-14">
            <p className="mb-6 section-title">Research Questions</p>
            <CardCarousel
              items={researchQuestions}
              autoPlayMs={4000}
              accentClass="bg-emerald-600"
              renderCard={(question, index, isActive) => (
                <>
                  <p className="cf-label">Research Question {index + 1}</p>
                  <p className={`cf-body mt-3 ${isActive ? "text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}`}>
                    {question}
                  </p>
                </>
              )}
            />
          </div>
        </div>
      </section>

      {/* ── OBJECTIVES ── */}
      <section className="border-y border-emerald-900/10 bg-white/78 py-14 backdrop-blur dark:border-white/10 dark:bg-white/[0.03] sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="section-title">Objectives of the Study</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">Hybrid Prediction Framework</h2>
          </div>
          <div className="mt-10">
            <CardCarousel
              items={objectives}
              autoPlayMs={4500}
              accentClass="bg-emerald-600"
              renderCard={(objective, index, isActive) => (
                <>
                  <CheckCircle2
                    className={`mb-4 transition-all duration-300 ${isActive ? "h-7 w-7 text-emerald-500" : "h-5 w-5 text-emerald-400/60"}`}
                    aria-hidden="true"
                  />
                  <p className="cf-label">Objective {index + 1}</p>
                  <p className={`cf-body mt-2 ${isActive ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}`}>
                    {objective}
                  </p>
                </>
              )}
            />
          </div>
        </div>
      </section>

      {/* ── COVERFLOW STYLES ── */}
      <style>{`

        /* root */
        .cf-root { width: 100%; user-select: none; }

        /* ── stage: perspective wrapper ── */
        .cf-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1200px;
          perspective-origin: 50% 50%;
          padding: 20px 0 28px;
          overflow: visible;
          gap: 0;
        }

        /* ── slots: positional containers ── */
        .cf-slot {
          position: relative;
          flex-shrink: 0;
          transition: transform 0.55s cubic-bezier(0.35, 0.05, 0.15, 1.0);
        }

        /* left side slot */
        .cf-slot--left {
          width: 26%;
          transform: translateX(40px) rotateY(42deg) scale(0.82);
          transform-origin: right center;
          transform-style: preserve-3d;
          z-index: 1;
          background: none;
          border: none;
          padding: 0;
          text-align: left;
          cursor: pointer;
        }

        /* center slot */
        .cf-slot--center {
          width: 44%;
          transform: translateX(0) rotateY(0deg) scale(1);
          transform-origin: center center;
          transform-style: preserve-3d;
          z-index: 10;
        }

        /* right side slot */
        .cf-slot--right {
          width: 26%;
          transform: translateX(-40px) rotateY(-42deg) scale(0.82);
          transform-origin: left center;
          transform-style: preserve-3d;
          z-index: 1;
          background: none;
          border: none;
          padding: 0;
          text-align: left;
          cursor: pointer;
        }

        /* hover lift on side cards */
        .cf-slot--left:hover  { transform: translateX(40px) rotateY(28deg) scale(0.86); }
        .cf-slot--right:hover { transform: translateX(-40px) rotateY(-28deg) scale(0.86); }

        /* ── card surfaces ── */
        .cf-card {
          width: 100%;
          border-radius: 20px;
          padding: 28px;
          box-sizing: border-box;
          min-height: 260px;
          transition: box-shadow 0.4s ease, background 0.4s ease;
        }

        /* active / center card */
        .cf-card--active {
          background: var(--surface-bg);
          border: 1px solid var(--surface-border);
          box-shadow: var(--surface-shadow), 0 0 0 1px rgba(16,185,129,0.10);
          backdrop-filter: blur(20px);
        }

        /* side cards */
        .cf-card--side {
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          backdrop-filter: blur(8px);
          opacity: 0.72;
          transition: opacity 0.3s ease;
        }
        .cf-slot--left:hover  .cf-card--side,
        .cf-slot--right:hover .cf-card--side { opacity: 0.92; }

        /* ── card content typography ── */
        .cf-label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #059669;
        }
        .dark .cf-label { color: #34d399; }

        .cf-body {
          font-size: 1rem;
          line-height: 1.75;
        }

        /* ── nav row ── */
        .cf-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 4px;
        }

        .cf-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          width: 36px;
          border-radius: 50%;
          border: 1px solid rgba(125,169,151,0.34);
          background: transparent;
          color: #047857;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, transform 0.15s;
        }
        .cf-arrow:hover {
          background: rgba(16,185,129,0.1);
          color: #10b981;
          transform: scale(1.1);
        }
        .cf-arrow:active { transform: scale(0.95); }
        .dark .cf-arrow { color: #6ee7b7; border-color: rgba(125,211,194,0.2); }
        .dark .cf-arrow:hover { background: rgba(16,185,129,0.15); }

        .cf-dots { display: flex; gap: 6px; align-items: center; }

        .cf-dot {
          border: none;
          cursor: pointer;
          border-radius: 9999px;
          padding: 0;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cf-dot--inactive {
          width: 8px;
          height: 8px;
          background: rgba(125,169,151,0.3);
        }
        .cf-dot--active {
          width: 26px;
          height: 8px;
        }

        /* ── mobile: flatten to single card ── */
        @media (max-width: 640px) {
          .cf-slot--left, .cf-slot--right { display: none; }
          .cf-slot--center { width: 100%; }
          .cf-card { min-height: auto; padding: 20px; }
        }
      `}</style>

    </main>
  );
}