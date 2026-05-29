import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Leaf,
  LineChart,
  RadioTower,
  ShieldCheck,
  Sprout,
  Waves,
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

export default function LandingPage({ onGetStarted }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section
        className="relative flex min-h-[88vh] items-end overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(2, 6, 23, 0.92), rgba(2, 6, 23, 0.66), rgba(2, 6, 23, 0.26)), url('https://commons.wikimedia.org/wiki/Special:Redirect/file/Lettuce_in_Vertical_Farm.jpg')",
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-10 pt-24 text-white sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex rounded-lg border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
              <ThesisLogo inverse />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold backdrop-blur">
              <Leaf className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              Master of Science in Electronics Engineering
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Crop Yield Prediction Model for Indoor Lettuce Vertical Farm
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
        </div>
        <a
          href="https://commons.wikimedia.org/wiki/File:Lettuce_in_Vertical_Farm.jpg"
          className="absolute bottom-3 right-3 rounded bg-slate-950/55 px-2 py-1 text-[10px] font-medium text-white/75 backdrop-blur transition hover:text-white"
        >
          Photo: Bright Agrotech / CC BY-SA 4.0
        </a>
      </section>

      <section id="study" className="border-b border-slate-200 bg-white py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="section-title">Thesis Presentation</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Research Context</h2>
            <div className="mt-5 space-y-2 text-sm text-slate-600">
              <p>A Thesis Presented to the Faculty of College of Engineering and Fine Arts</p>
              <p>Graduate Program of Master of Science in Electronics Engineering</p>
              <p>Batangas State University - The National Engineering University</p>
              <p>Alangilan Campus, Batangas City, Philippines</p>
              <p className="pt-4 font-semibold text-slate-900">Ralph Laurence G. Visaya / May 2026</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <Cpu className="h-6 w-6 text-sky-600" aria-hidden="true" />
              <p className="mt-4 text-2xl font-bold text-slate-950">10</p>
              <p className="mt-1 text-sm text-slate-500">sensor features per BiLSTM window</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <LineChart className="h-6 w-6 text-emerald-600" aria-hidden="true" />
              <p className="mt-4 text-2xl font-bold text-slate-950">5 min</p>
              <p className="mt-1 text-sm text-slate-500">realtime monitoring cadence</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <ShieldCheck className="h-6 w-6 text-amber-600" aria-hidden="true" />
              <p className="mt-4 text-2xl font-bold text-slate-950">2</p>
              <p className="mt-1 text-sm text-slate-500">outputs: stage label and 6-slot yield count</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="section-title">Statement of the Problem</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Why Prediction Matters</h2>
            </div>
            <div className="space-y-4 text-base leading-7 text-slate-600">
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

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {researchQuestions.map((question, index) => (
              <article key={question} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-normal text-emerald-700">RQ {index + 1}</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{question}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="section-title">Objectives of the Study</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Hybrid Prediction Framework</h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {objectives.map((objective, index) => (
              <div key={objective} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                <p className="mt-4 text-sm font-bold text-slate-950">Objective {index + 1}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{objective}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
