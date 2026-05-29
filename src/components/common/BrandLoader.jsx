import ThesisLogo from "./ThesisLogo";

const nodes = [
  "left-[10%] top-[24%]",
  "right-[12%] top-[25%]",
  "left-[18%] bottom-[18%]",
  "right-[18%] bottom-[17%]",
  "left-[48%] top-[8%]",
  "left-[48%] bottom-[7%]",
];

const branches = [
  "left-[20%] top-[30%] w-[28%] rotate-[22deg]",
  "right-[20%] top-[30%] w-[28%] -rotate-[22deg]",
  "left-[21%] bottom-[25%] w-[30%] -rotate-[26deg]",
  "right-[21%] bottom-[25%] w-[30%] rotate-[26deg]",
  "left-[33%] top-1/2 w-[34%]",
];

export default function BrandLoader({
  message = "Loading dashboard",
  detail = "Syncing lettuce sensor data",
  fullScreen = false,
}) {
  const loader = (
    <div className="flex flex-col items-center text-center">
      <div className="brand-loader-field">
        {branches.map((branch) => (
          <span key={branch} className={`brand-loader-branch ${branch}`} aria-hidden="true" />
        ))}
        {nodes.map((node, index) => (
          <span
            key={node}
            className={`brand-loader-node ${node}`}
            style={{ animationDelay: `${index * 0.18}s` }}
            aria-hidden="true"
          />
        ))}
        <ThesisLogo size="xl" inverse loading />
      </div>
      <p className="mt-5 text-base font-bold text-slate-950 dark:text-white">{message}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  );

  if (!fullScreen) return loader;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-slate-950 dark:text-white">
      {loader}
    </main>
  );
}
