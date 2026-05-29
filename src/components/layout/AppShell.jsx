export default function AppShell({ children }) {
  return (
    <main className="min-h-screen text-slate-950 transition-colors dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-5 px-4 py-3 sm:px-6 lg:px-8 lg:py-5">
        {children}
      </div>
    </main>
  );
}
